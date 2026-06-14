const encoder=new TextEncoder();
const emptyPlan=()=>({meals:{},settings:{region:"Sweden",units:"metric"},checked:{},shoppingOverrides:{},recipeChecks:{}});
const bytesToHex=bytes=>[...new Uint8Array(bytes)].map(value=>value.toString(16).padStart(2,"0")).join("");
const randomHex=size=>{const bytes=new Uint8Array(size);crypto.getRandomValues(bytes);return bytesToHex(bytes);};
const sha256=async value=>bytesToHex(await crypto.subtle.digest("SHA-256",encoder.encode(value)));
async function passwordHash(password,salt){const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);return bytesToHex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:encoder.encode(salt),iterations:100000},key,256));}
const validUsername=value=>/^[a-z0-9._-]{3,30}$/.test(value);

function corsHeaders(request,env){
  const origin=request.headers.get("Origin")||"",allowed=(env.ALLOWED_ORIGINS||"https://ronyk255.github.io,http://localhost:8765").split(",").map(value=>value.trim());
  return {"Access-Control-Allow-Origin":allowed.includes(origin)?origin:allowed[0],"Access-Control-Allow-Headers":"Authorization, Content-Type","Access-Control-Allow-Methods":"GET, POST, PUT, PATCH, OPTIONS","Vary":"Origin"};
}
function json(request,env,status,data){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json",...corsHeaders(request,env)}});}
async function readBody(request){try{return await request.json();}catch{return {};}}

async function ensureAdmin(env){
  const existing=await env.DB.prepare("SELECT id FROM users LIMIT 1").first();if(existing)return;
  if(!env.ADMIN_SETUP_CODE)throw new Error("ADMIN_SETUP_CODE secret is missing");
  let household=await env.DB.prepare("SELECT id FROM households ORDER BY id LIMIT 1").first();
  if(!household){const now=new Date().toISOString();await env.DB.prepare("INSERT INTO households(name,plan,updated_at) VALUES(?,?,?)").bind("Rony's kitchen",JSON.stringify(emptyPlan()),now).run();household=await env.DB.prepare("SELECT id FROM households ORDER BY id LIMIT 1").first();}
  const salt=randomHex(16),dummy=await passwordHash(randomHex(32),salt),setup=await sha256(env.ADMIN_SETUP_CODE.trim().toUpperCase());
  await env.DB.prepare("INSERT INTO users(household_id,name,username,password_hash,salt,is_admin,setup_token_hash) VALUES(?,?,?,?,?,1,?)").bind(household.id,"Rony","rony",dummy,salt,setup).run();
}
async function currentUser(request,env){
  const token=request.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];if(!token)return null;
  const hash=await sha256(token),now=new Date().toISOString();
  return env.DB.prepare("SELECT users.id,users.name,users.username,users.is_admin,users.household_id,households.name household_name FROM sessions JOIN users ON users.id=sessions.user_id JOIN households ON households.id=users.household_id WHERE sessions.token_hash=? AND sessions.expires_at>?").bind(hash,now).first();
}
async function openSession(request,env,user){
  const token=randomHex(32),hash=await sha256(token),expires=new Date(Date.now()+30*86400000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(hash,user.id,expires).run();return json(request,env,200,{ok:true,token});
}

async function api(request,env,url){
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders(request,env)});
  if(request.method==="GET"&&url.pathname==="/api/health")return json(request,env,200,{ok:true,service:"lincy-cloudflare"});
  await ensureAdmin(env);
  if(request.method==="POST"&&url.pathname==="/api/login"){
    const data=await readBody(request),username=String(data.username||"").trim().toLowerCase(),user=await env.DB.prepare("SELECT * FROM users WHERE username=?").bind(username).first();
    if(!user||user.setup_token_hash||await passwordHash(String(data.password||""),user.salt)!==user.password_hash)return json(request,env,401,{error:user?.setup_token_hash?"Set your password first using your one-time code.":"Username or password is incorrect."});
    return openSession(request,env,user);
  }
  if(request.method==="POST"&&url.pathname==="/api/activate"){
    const data=await readBody(request),username=String(data.username||"").trim().toLowerCase(),password=String(data.password||""),user=await env.DB.prepare("SELECT * FROM users WHERE username=?").bind(username).first();
    if(password.length<8)return json(request,env,400,{error:"Choose a password with at least 8 characters."});
    if(!user||!user.setup_token_hash||await sha256(String(data.setupCode||"").trim().toUpperCase())!==user.setup_token_hash)return json(request,env,401,{error:"Username or one-time setup code is incorrect."});
    const salt=randomHex(16),hash=await passwordHash(password,salt);await env.DB.prepare("UPDATE users SET password_hash=?,salt=?,setup_token_hash=NULL WHERE id=?").bind(hash,salt,user.id).run();return openSession(request,env,user);
  }
  const user=await currentUser(request,env);if(!user)return json(request,env,401,{error:"Please log in."});
  if(request.method==="POST"&&url.pathname==="/api/logout"){const token=request.headers.get("Authorization")?.slice(7);if(token)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();return json(request,env,200,{ok:true});}
  if(request.method==="GET"&&url.pathname==="/api/plan"){const row=await env.DB.prepare("SELECT plan,updated_at FROM households WHERE id=?").bind(user.household_id).first();return json(request,env,200,{user:{name:user.name,username:user.username,isAdmin:Boolean(user.is_admin)},household:{name:user.household_name},state:JSON.parse(row.plan),updatedAt:row.updated_at});}
  if(request.method==="PUT"&&url.pathname==="/api/plan"){const data=await readBody(request);if(!data.state||typeof data.state!=="object")return json(request,env,400,{error:"Invalid plan."});const updatedAt=new Date().toISOString();await env.DB.prepare("UPDATE households SET plan=?,updated_at=? WHERE id=?").bind(JSON.stringify(data.state),updatedAt,user.household_id).run();return json(request,env,200,{ok:true,updatedAt});}
  if(request.method==="GET"&&url.pathname==="/api/users"){if(!user.is_admin)return json(request,env,403,{error:"Admin access is required."});const result=await env.DB.prepare("SELECT id,name,username,is_admin,setup_token_hash IS NOT NULL pending FROM users WHERE household_id=? ORDER BY is_admin DESC,name").bind(user.household_id).all();return json(request,env,200,{users:result.results.map(item=>({...item,isAdmin:Boolean(item.is_admin),pending:Boolean(item.pending)}))});}
  if(request.method==="POST"&&url.pathname==="/api/users"){
    if(!user.is_admin)return json(request,env,403,{error:"Admin access is required."});const data=await readBody(request),name=String(data.name||"").trim(),username=String(data.username||"").trim().toLowerCase();if(!name||!validUsername(username))return json(request,env,400,{error:"Enter a valid name and username."});
    if(await env.DB.prepare("SELECT id FROM users WHERE username=?").bind(username).first())return json(request,env,409,{error:"That username is already in use."});const code=randomHex(5).toUpperCase(),salt=randomHex(16),dummy=await passwordHash(randomHex(32),salt);await env.DB.prepare("INSERT INTO users(household_id,name,username,password_hash,salt,is_admin,setup_token_hash) VALUES(?,?,?,?,?,0,?)").bind(user.household_id,name,username,dummy,salt,await sha256(code)).run();return json(request,env,201,{user:{name,username},setupCode:code});
  }
  const match=url.pathname.match(/^\/api\/users\/(\d+)$/);
  if(request.method==="PATCH"&&match){if(!user.is_admin)return json(request,env,403,{error:"Admin access is required."});const target=await env.DB.prepare("SELECT id,is_admin FROM users WHERE id=? AND household_id=?").bind(Number(match[1]),user.household_id).first();if(!target)return json(request,env,404,{error:"User not found."});if(target.is_admin)return json(request,env,403,{error:"Administrator accounts cannot be renamed here."});const data=await readBody(request),name=String(data.name||"").trim(),username=String(data.username||"").trim().toLowerCase();if(!name||!validUsername(username))return json(request,env,400,{error:"Enter a valid name and username."});if(await env.DB.prepare("SELECT id FROM users WHERE username=? AND id<>?").bind(username,target.id).first())return json(request,env,409,{error:"That username is already in use."});await env.DB.prepare("UPDATE users SET name=?,username=? WHERE id=?").bind(name,username,target.id).run();return json(request,env,200,{user:{id:target.id,name,username}});}
  if(request.method==="POST"&&url.pathname==="/api/change-password"){const data=await readBody(request),stored=await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(user.id).first(),next=String(data.newPassword||"");if(await passwordHash(String(data.currentPassword||""),stored.salt)!==stored.password_hash)return json(request,env,401,{error:"Current password is incorrect."});if(next.length<8)return json(request,env,400,{error:"New password must have at least 8 characters."});const salt=randomHex(16);await env.DB.prepare("UPDATE users SET password_hash=?,salt=? WHERE id=?").bind(await passwordHash(next,salt),salt,user.id).run();return json(request,env,200,{ok:true});}
  return json(request,env,404,{error:"Not found"});
}

export default {async fetch(request,env){try{return await api(request,env,new URL(request.url));}catch(error){console.error(error);return json(request,env,500,{error:"The login service could not complete the request."});}}};
