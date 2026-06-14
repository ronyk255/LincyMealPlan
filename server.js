const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {DatabaseSync}=require("node:sqlite");
const root=__dirname,port=Number(process.env.PORT||8765),db=new DatabaseSync(process.env.LINCY_DB||path.join(root,"lincy.sqlite")),sessions=new Map();
const emptyPlan=()=>({meals:{},settings:{region:"Sweden",units:"metric"},checked:{},shoppingOverrides:{},recipeChecks:{}});
const hash=(value,salt)=>crypto.scryptSync(value,salt,64).toString("hex");
const tokenHash=value=>crypto.createHash("sha256").update(value).digest("hex");
const setupCode=()=>crypto.randomBytes(5).toString("hex").toUpperCase();
const columns=table=>new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(column=>column.name));

db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS households(id INTEGER PRIMARY KEY,name TEXT NOT NULL,invite_code TEXT UNIQUE NOT NULL,plan TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,household_id INTEGER NOT NULL,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,salt TEXT NOT NULL,FOREIGN KEY(household_id) REFERENCES households(id));`);
const userColumns=columns("users");
if(!userColumns.has("username"))db.exec("ALTER TABLE users ADD COLUMN username TEXT");
if(!userColumns.has("is_admin"))db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
if(!userColumns.has("setup_token_hash"))db.exec("ALTER TABLE users ADD COLUMN setup_token_hash TEXT");
db.prepare("UPDATE users SET username=lower(substr(email,1,instr(email,'@')-1)) WHERE username IS NULL").run();
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username)");

function seedAdmin(){
  const count=db.prepare("SELECT count(*) total FROM users").get().total;
  if(count){if(!db.prepare("SELECT id FROM users WHERE is_admin=1").get())db.prepare("UPDATE users SET is_admin=1 WHERE id=(SELECT min(id) FROM users)").run();return;}
  let household=db.prepare("SELECT * FROM households ORDER BY id LIMIT 1").get();
  if(!household){const invite=crypto.randomBytes(4).toString("hex").toUpperCase();db.prepare("INSERT INTO households(name,invite_code,plan,updated_at) VALUES(?,?,?,?)").run("Rony's kitchen",invite,JSON.stringify(emptyPlan()),new Date().toISOString());household=db.prepare("SELECT * FROM households ORDER BY id LIMIT 1").get();}
  const code=process.env.LINCY_ADMIN_SETUP_CODE||setupCode(),salt=crypto.randomBytes(16).toString("hex");
  db.prepare("INSERT INTO users(household_id,name,email,password_hash,salt,username,is_admin,setup_token_hash) VALUES(?,?,?,?,?,?,1,?)").run(household.id,"Rony","rony@local.lincy",hash(crypto.randomBytes(32).toString("hex"),salt),salt,"rony",tokenHash(code));
  console.log(`Rony admin created. Username: rony | One-time setup code: ${code}`);
}
seedAdmin();

function json(res,status,data,cookie){res.writeHead(status,{"Content-Type":"application/json",...(cookie?{"Set-Cookie":cookie}:{})});res.end(JSON.stringify(data));}
function body(req){return new Promise((resolve,reject)=>{let raw="";req.on("data",chunk=>{raw+=chunk;if(raw.length>2e6)reject(new Error("Request too large"));});req.on("end",()=>{try{resolve(JSON.parse(raw||"{}"));}catch{reject(new Error("Invalid JSON"));}});});}
function sessionUser(req){const token=(req.headers.cookie||"").match(/(?:^|; )lincy_session=([^;]+)/)?.[1],id=token&&sessions.get(token);return id?db.prepare("SELECT users.id,users.name,users.username,users.is_admin,users.household_id,households.name household_name FROM users JOIN households ON households.id=users.household_id WHERE users.id=?").get(id):null;}
function openSession(res,user){const token=crypto.randomBytes(32).toString("hex");sessions.set(token,user.id);json(res,200,{ok:true},`lincy_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`);}
function validUsername(value){return /^[a-z0-9._-]{3,30}$/.test(value);}

async function api(req,res,url){
  if(req.method==="POST"&&url.pathname==="/api/login"){
    const data=await body(req),username=String(data.username||"").trim().toLowerCase(),user=db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if(!user||user.setup_token_hash||hash(String(data.password||""),user.salt)!==user.password_hash)return json(res,401,{error:user?.setup_token_hash?"Set your password first using your one-time code.":"Username or password is incorrect."});
    openSession(res,user);return;
  }
  if(req.method==="POST"&&url.pathname==="/api/activate"){
    const data=await body(req),username=String(data.username||"").trim().toLowerCase(),password=String(data.password||""),user=db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if(password.length<8)return json(res,400,{error:"Choose a password with at least 8 characters."});
    if(!user||!user.setup_token_hash||tokenHash(String(data.setupCode||"").trim().toUpperCase())!==user.setup_token_hash)return json(res,401,{error:"Username or one-time setup code is incorrect."});
    const salt=crypto.randomBytes(16).toString("hex");db.prepare("UPDATE users SET password_hash=?,salt=?,setup_token_hash=NULL WHERE id=?").run(hash(password,salt),salt,user.id);openSession(res,user);return;
  }
  if(req.method==="POST"&&url.pathname==="/api/logout"){const token=(req.headers.cookie||"").match(/(?:^|; )lincy_session=([^;]+)/)?.[1];if(token)sessions.delete(token);return json(res,200,{ok:true},"lincy_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");}
  const user=sessionUser(req);if(!user)return json(res,401,{error:"Please log in."});
  if(req.method==="GET"&&url.pathname==="/api/plan"){const row=db.prepare("SELECT plan,updated_at FROM households WHERE id=?").get(user.household_id);return json(res,200,{user:{name:user.name,username:user.username,isAdmin:Boolean(user.is_admin)},household:{name:user.household_name},state:JSON.parse(row.plan),updatedAt:row.updated_at});}
  if(req.method==="PUT"&&url.pathname==="/api/plan"){const data=await body(req);if(!data.state||typeof data.state!=="object")return json(res,400,{error:"Invalid plan."});const updatedAt=new Date().toISOString();db.prepare("UPDATE households SET plan=?,updated_at=? WHERE id=?").run(JSON.stringify(data.state),updatedAt,user.household_id);return json(res,200,{ok:true,updatedAt});}
  if(req.method==="GET"&&url.pathname==="/api/users"){if(!user.is_admin)return json(res,403,{error:"Admin access is required."});const users=db.prepare("SELECT id,name,username,is_admin,setup_token_hash IS NOT NULL pending FROM users WHERE household_id=? ORDER BY is_admin DESC,name").all(user.household_id);return json(res,200,{users:users.map(item=>({...item,isAdmin:Boolean(item.is_admin),pending:Boolean(item.pending)}))});}
  if(req.method==="POST"&&url.pathname==="/api/users"){
    if(!user.is_admin)return json(res,403,{error:"Admin access is required."});const data=await body(req),name=String(data.name||"").trim(),username=String(data.username||"").trim().toLowerCase();
    if(!name||!validUsername(username))return json(res,400,{error:"Enter a name and a 3-30 character username using letters, numbers, dots, dashes or underscores."});
    if(db.prepare("SELECT id FROM users WHERE username=?").get(username))return json(res,409,{error:"That username is already in use."});
    const code=setupCode(),salt=crypto.randomBytes(16).toString("hex");db.prepare("INSERT INTO users(household_id,name,email,password_hash,salt,username,is_admin,setup_token_hash) VALUES(?,?,?,?,?,?,0,?)").run(user.household_id,name,`${username}@local.lincy`,hash(crypto.randomBytes(32).toString("hex"),salt),salt,username,tokenHash(code));return json(res,201,{user:{name,username},setupCode:code});
  }
  const userMatch=url.pathname.match(/^\/api\/users\/(\d+)$/);
  if(req.method==="PATCH"&&userMatch){
    if(!user.is_admin)return json(res,403,{error:"Admin access is required."});
    const target=db.prepare("SELECT id,is_admin FROM users WHERE id=? AND household_id=?").get(Number(userMatch[1]),user.household_id);
    if(!target)return json(res,404,{error:"User not found."});
    if(target.is_admin)return json(res,403,{error:"Administrator accounts cannot be renamed here."});
    const data=await body(req),name=String(data.name||"").trim(),username=String(data.username||"").trim().toLowerCase();
    if(!name||!validUsername(username))return json(res,400,{error:"Enter a name and a 3-30 character username using letters, numbers, dots, dashes or underscores."});
    if(db.prepare("SELECT id FROM users WHERE username=? AND id<>?").get(username,target.id))return json(res,409,{error:"That username is already in use."});
    db.prepare("UPDATE users SET name=?,username=?,email=? WHERE id=?").run(name,username,`${username}@local.lincy`,target.id);
    return json(res,200,{user:{id:target.id,name,username}});
  }
  if(req.method==="POST"&&url.pathname==="/api/change-password"){
    const data=await body(req),current=String(data.currentPassword||""),next=String(data.newPassword||""),stored=db.prepare("SELECT * FROM users WHERE id=?").get(user.id);
    if(hash(current,stored.salt)!==stored.password_hash)return json(res,401,{error:"Current password is incorrect."});if(next.length<8)return json(res,400,{error:"New password must have at least 8 characters."});
    const salt=crypto.randomBytes(16).toString("hex");db.prepare("UPDATE users SET password_hash=?,salt=? WHERE id=?").run(hash(next,salt),salt,user.id);return json(res,200,{ok:true});
  }
  json(res,404,{error:"Not found"});
}

const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".webmanifest":"application/manifest+json"};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,`http://${req.headers.host}`);if(url.pathname.startsWith("/api/"))return await api(req,res,url);const relative=url.pathname==="/"?"index.html":decodeURIComponent(url.pathname.slice(1)),file=path.resolve(root,relative);if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end("Not found");}res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-cache"});fs.createReadStream(file).pipe(res);}catch(error){console.error(error);json(res,500,{error:"Something went wrong."});}}).listen(port,()=>console.log(`Lincy is running at http://localhost:${port}`));
