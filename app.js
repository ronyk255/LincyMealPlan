const TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const STORE_KEY = "lincy-meal-planner-v1";
const pad = value => String(value).padStart(2, "0");
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDate = value => { const [y,m,d] = value.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (date, count) => { const next = new Date(date); next.setDate(next.getDate() + count); return next; };
const startOfWeek = date => addDays(date, -((date.getDay() + 6) % 7));
const escapeHtml = value => String(value || "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

const recipeLibrary = [
  {match:["curry","tikka","masala"],description:"A warming, aromatic curry with a silky tomato-coconut sauce.",time:"40 min",ingredients:["600 g chicken thigh","1 onion","3 garlic cloves","20 g fresh ginger","2 tbsp curry powder","400 ml coconut milk","400 g chopped tomatoes","300 g basmati rice","1 bunch fresh coriander","1 lime"],steps:["Dice the chicken and season lightly.","Soften the chopped onion, garlic and ginger in oil.","Stir in curry powder, then add chicken and brown for 5 minutes.","Add tomatoes and coconut milk; simmer for 20 minutes.","Cook the rice, finish the curry with lime and serve with coriander."],video:"https://www.youtube.com/results?search_query=easy+chicken+curry+recipe"},
  {match:["pasta","spaghetti","bolognese","lasagne"],description:"A comforting pasta dinner with a rich, herb-filled tomato sauce.",time:"35 min",ingredients:["400 g pasta","500 g minced beef","1 onion","2 garlic cloves","400 g chopped tomatoes","2 tbsp tomato paste","1 tsp dried oregano","50 g parmesan","1 bag green salad"],steps:["Cook the pasta in well-salted water.","Brown the mince, then add diced onion and garlic.","Stir in tomato paste, tomatoes and oregano.","Simmer for 15 minutes and season to taste.","Toss with pasta and finish with parmesan."],video:"https://www.youtube.com/results?search_query=easy+pasta+recipe"},
  {match:["salmon","fish"],description:"Oven-roasted salmon with bright lemon, herbs and seasonal vegetables.",time:"30 min",ingredients:["600 g salmon fillet","800 g baby potatoes","1 broccoli","1 lemon","2 tbsp olive oil","1 bunch dill","200 ml yoghurt","1 garlic clove"],steps:["Heat the oven to 210°C.","Halve potatoes, season and roast for 15 minutes.","Add broccoli and salmon; drizzle with oil and lemon.","Roast for 12–15 minutes until the salmon flakes.","Mix yoghurt, dill and garlic, then serve alongside."],video:"https://www.youtube.com/results?search_query=oven+baked+salmon+recipe"},
  {match:["taco","burrito","quesadilla"],description:"Colourful, build-your-own tacos with punchy toppings.",time:"30 min",ingredients:["12 small tortillas","500 g minced beef","1 sachet taco seasoning","1 can black beans","2 tomatoes","1 avocado","1 lime","150 g grated cheese","150 ml sour cream","1 lettuce"],steps:["Brown the mince with taco seasoning.","Warm and season the drained black beans.","Chop tomatoes, lettuce and avocado.","Warm tortillas in a dry pan.","Set everything out and let everyone build their own tacos."],video:"https://www.youtube.com/results?search_query=easy+beef+tacos+recipe"},
  {match:["soup","stew"],description:"A generous one-pot meal packed with vegetables and deep savoury flavour.",time:"45 min",ingredients:["1 onion","3 carrots","2 celery stalks","3 potatoes","1 litre vegetable stock","1 can white beans","2 garlic cloves","1 tsp dried thyme","1 loaf crusty bread"],steps:["Chop all vegetables into even pieces.","Soften onion, celery and carrots in a large pot.","Add garlic, potatoes, thyme and stock.","Simmer for 25 minutes, then stir in the beans.","Season well and serve with warm bread."],video:"https://www.youtube.com/results?search_query=easy+hearty+soup+recipe"},
  {match:["pancake","waffle"],description:"Fluffy golden pancakes for an easy, unhurried breakfast.",time:"20 min",ingredients:["250 g plain flour","2 tsp baking powder","2 eggs","350 ml milk","50 g butter","200 g fresh berries","150 ml yoghurt","2 tbsp maple syrup"],steps:["Whisk flour and baking powder together.","Beat in eggs and milk until just smooth.","Melt a little butter in a medium-hot pan.","Cook small ladlefuls until bubbles appear, then flip.","Serve warm with berries, yoghurt and maple syrup."],video:"https://www.youtube.com/results?search_query=fluffy+pancakes+recipe"},
  {match:["oat","porridge","granola"],description:"A nourishing breakfast bowl with fruit, gentle spice and crunch.",time:"10 min",ingredients:["200 g rolled oats","600 ml milk","2 bananas","1 tsp cinnamon","100 g mixed berries","50 g nuts","2 tbsp honey"],steps:["Combine oats and milk in a saucepan.","Simmer gently for 5 minutes, stirring often.","Mash in one banana and add cinnamon.","Divide into bowls.","Top with sliced banana, berries, nuts and honey."],video:"https://www.youtube.com/results?search_query=healthy+oatmeal+breakfast"},
  {match:["salad","bowl"],description:"A crisp, satisfying bowl layered with grains, vegetables and a fresh dressing.",time:"25 min",ingredients:["250 g quinoa","1 cucumber","250 g cherry tomatoes","1 can chickpeas","1 avocado","100 g feta","1 lemon","2 tbsp olive oil","1 bag mixed leaves"],steps:["Cook quinoa according to the packet and cool slightly.","Drain chickpeas and chop the vegetables.","Whisk lemon juice and olive oil with salt and pepper.","Layer leaves, quinoa, chickpeas and vegetables.","Crumble over feta and spoon on the dressing."],video:"https://www.youtube.com/results?search_query=healthy+grain+bowl+recipe"}
];

const defaultRecipe = name => ({description:`A simple, adaptable ${name.toLowerCase()} made with everyday ingredients.`,time:"35 min",ingredients:[`500 g main ingredient for ${name}`,"1 onion","2 garlic cloves","2 tbsp cooking oil","500 g seasonal vegetables","1 tsp preferred seasoning","1 fresh herb or garnish","1 pantry staple to serve"],steps:["Prepare and chop all ingredients.","Warm the oil and cook the onion until soft.",`Add the main ingredients for ${name} and cook until well coloured.`,"Add seasoning and a splash of water; simmer until cooked through.","Taste, adjust seasoning and serve with your chosen garnish."],video:`https://www.youtube.com/results?search_query=${encodeURIComponent(name + " recipe")}`});

function seedMeals() {
  const monday = startOfWeek(new Date());
  const samples = [[0,"Dinner","Chicken curry"],[1,"Breakfast","Berry oat bowl"],[1,"Lunch","Mediterranean salad bowl"],[2,"Dinner","Oven baked salmon"],[3,"Lunch","Chicken curry"],[4,"Dinner","Friday tacos"],[5,"Breakfast","Fluffy pancakes"],[6,"Dinner","Vegetable soup"]];
  const meals = {};
  samples.forEach(([offset,type,name]) => {
    const base = recipeLibrary.find(item => item.match.some(term => name.toLowerCase().includes(term))) || defaultRecipe(name);
    const key = `${dateKey(addDays(monday,offset))}|${type}`;
    meals[key] = {name,type,date:dateKey(addDays(monday,offset)),servings:4,...base};
  });
  return meals;
}

let state;
try { state = JSON.parse(localStorage.getItem(STORE_KEY)); } catch {}
state = state || {meals:seedMeals(),settings:{region:"Sweden",units:"metric"},checked:{},shoppingOverrides:{}};
state.meals ||= {}; state.settings ||= {region:"Sweden",units:"metric"}; state.checked ||= {}; state.shoppingOverrides ||= {};
let currentWeek = startOfWeek(new Date());
let currentMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1);
let currentView = "week";
let listScope = "week";
let editingKey = null;
let editingShoppingId = null;
let clearPlanContext = "week";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const save = () => localStorage.setItem(STORE_KEY,JSON.stringify(state));
const formatRange = (start,end) => `${start.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${end.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
const mealKey = (date,type) => `${date}|${type}`;

function mealsInRange(start,end) {
  return Object.values(state.meals).filter(meal => { const date=parseDate(meal.date); return date>=start && date<=end; });
}

function showToast(message) {
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}

function renderWeek() {
  const end=addDays(currentWeek,6);
  $("#weekRange").textContent=formatRange(currentWeek,end);
  const today=dateKey(new Date());
  $("#weekGrid").innerHTML=Array.from({length:7},(_,i)=>{
    const date=addDays(currentWeek,i), key=dateKey(date);
    const slots=TYPES.map(type=>{
      const meal=state.meals[mealKey(key,type)];
      return `<div class="meal-slot ${meal?"filled":""}" data-type="${type}"><span class="slot-label">${type}</span>${meal?`<button class="meal-card" data-edit="${key}|${type}"><strong>${escapeHtml(meal.name)}</strong><small>${escapeHtml(meal.time||"")} · ${meal.servings||4} servings</small></button>`:`<button class="add-slot" data-add-date="${key}" data-add-type="${type}" aria-label="Add ${type}">＋</button>`}</div>`;
    }).join("");
    return `<div class="day-column"><div class="day-header ${key===today?"today":""}"><span class="day-name">${date.toLocaleDateString(undefined,{weekday:"short"}).toUpperCase()}</span><span class="day-number">${date.getDate()}</span></div>${slots}</div>`;
  }).join("");
  renderSidebars();
}

function renderMonth() {
  $("#monthRange").textContent=currentMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  const gridStart=startOfWeek(new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1));
  const today=dateKey(new Date());
  $("#monthGrid").innerHTML=Array.from({length:42},(_,i)=>{
    const date=addDays(gridStart,i), key=dateKey(date), dayMeals=TYPES.map(type=>state.meals[mealKey(key,type)]).filter(Boolean);
    return `<div class="month-day ${date.getMonth()!==currentMonth.getMonth()?"outside":""} ${key===today?"today":""}"><span class="month-num">${date.getDate()}</span>${dayMeals.slice(0,4).map(meal=>`<button class="month-meal" data-type="${meal.type}" data-edit="${meal.date}|${meal.type}" title="${escapeHtml(meal.name)}">${escapeHtml(meal.name)}</button>`).join("")}<button class="month-add" data-add-date="${key}" data-add-type="Dinner">＋</button></div>`;
  }).join("");
}

function parseIngredient(line) {
  const clean=line.trim();
  const match=clean.match(/^([\d.,/]+)\s*([a-zA-Z]+)?\s+(.+)$/);
  return match?{quantity:match[1],unit:match[2]||"",name:match[3]}:{quantity:"",unit:"",name:clean};
}

function numericQuantity(value) {
  if (!value) return null;
  return value.split("+").reduce((total, part) => {
    const clean=part.trim().replace(",",".");
    if (clean.includes("/")) { const [a,b]=clean.split("/").map(Number); return total+(b?a/b:0); }
    const number=Number(clean); return total+(Number.isFinite(number)?number:0);
  },0);
}

function categoryFor(name) {
  const value=name.toLowerCase();
  if (/chicken|beef|salmon|fish|mince|egg/.test(value)) return "Protein";
  if (/milk|butter|cheese|yoghurt|cream|feta|parmesan/.test(value)) return "Dairy & chilled";
  if (/onion|garlic|ginger|tomato|potato|carrot|celery|broccoli|lemon|lime|avocado|lettuce|cucumber|berries|banana|herb|coriander|dill|vegetable|leaves/.test(value)) return "Fresh produce";
  if (/bread|tortilla/.test(value)) return "Bakery";
  return "Pantry";
}

function shoppingPeriodKey(scope=listScope) {
  return scope==="week"?`week:${dateKey(currentWeek)}`:`month:${currentMonth.getFullYear()}-${pad(currentMonth.getMonth()+1)}`;
}

function shoppingOverrides(scope=listScope) {
  const key=shoppingPeriodKey(scope);
  state.shoppingOverrides[key] ||= {edits:{},deleted:{},manual:[]};
  return state.shoppingOverrides[key];
}

function shoppingData(scope=listScope) {
  const start=scope==="week"?currentWeek:new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
  const end=scope==="week"?addDays(currentWeek,6):new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,0);
  const grouped={};
  mealsInRange(start,end).forEach(meal=>(meal.ingredients||[]).forEach(line=>{
    const item=parseIngredient(line), normalized=item.name.toLowerCase().replace(/[^a-z0-9 ]/g,"").trim();
    if(!normalized)return;
    const category=categoryFor(item.name); grouped[category] ||= {};
    const id=`${category}|${normalized}`;
    if(!grouped[category][id]) grouped[category][id]={...item,id,meals:[]};
    else if(grouped[category][id].unit.toLowerCase()===item.unit.toLowerCase()) {
      const existing=numericQuantity(grouped[category][id].quantity), added=numericQuantity(item.quantity);
      if(existing!==null&&added!==null) grouped[category][id].quantity=Number((existing+added).toFixed(2)).toString();
    }
    if(!grouped[category][id].meals.includes(meal.name)) grouped[category][id].meals.push(meal.name);
  }));
  const overrides=shoppingOverrides(scope);
  Object.keys(grouped).forEach(category=>Object.keys(grouped[category]).forEach(id=>{
    if(overrides.deleted[id]) { delete grouped[category][id]; return; }
    const edit=overrides.edits[id];
    if(!edit)return;
    const item={...grouped[category][id],...edit,id};
    delete grouped[category][id];
    grouped[item.category] ||= {};
    grouped[item.category][id]=item;
  }));
  overrides.manual.forEach(item=>{
    if(overrides.deleted[item.id])return;
    const merged={...item,...(overrides.edits[item.id]||{}),meals:["Manually added"]};
    grouped[merged.category] ||= {};
    grouped[merged.category][merged.id]=merged;
  });
  Object.keys(grouped).forEach(category=>{if(!Object.keys(grouped[category]).length)delete grouped[category];});
  return grouped;
}

function renderSidebars() {
  const data=shoppingData("week"), items=Object.values(data).flatMap(group=>Object.values(group));
  $("#shoppingBadge").textContent=items.length;
  const preview=Object.entries(data).slice(0,2).map(([category,group])=>`<div class="shop-category"><div class="shop-category-head"><span class="shop-dot"></span>${category}</div>${Object.values(group).slice(0,3).map(item=>`<label class="shop-item"><input type="checkbox" ${state.checked[item.id]?"checked":""} data-check="${escapeHtml(item.id)}"><span>${escapeHtml(item.name)}</span><span>${escapeHtml([item.quantity,item.unit].filter(Boolean).join(" "))}</span></label>`).join("")}</div>`).join("");
  $("#shoppingPreview").innerHTML=preview || `<p class="subtitle">Add meals to build your list.</p>`;
  const meals=mealsInRange(currentWeek,addDays(currentWeek,6));
  const counts=countMeals(meals), unique=Object.keys(counts).length, repeats=Object.entries(counts).filter(([,count])=>count>1);
  $("#varietyScore").textContent=unique;
  $("#varietyRing").style.setProperty("--ring",`${Math.min(100,unique/12*100)}%`);
  $("#repeatPreview").innerHTML=repeats.length?repeats.map(([name,count])=>`<span class="repeat-pill">${escapeHtml(name)} × ${count}</span>`).join(""):`No repeats yet. Your week has plenty of variety.`;
}

function renderShopping() {
  const data=shoppingData(), groups=Object.entries(data), itemCount=groups.reduce((sum,[,group])=>sum+Object.keys(group).length,0);
  $("#shoppingSubtitle").textContent=`Combined for ${listScope==="week"?formatRange(currentWeek,addDays(currentWeek,6)):currentMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"})} · ${state.settings.region}`;
  $("#fullShoppingList").innerHTML=groups.length?groups.map(([category,group])=>`<section class="shopping-group"><h3>${category}</h3>${Object.values(group).map(item=>`<div class="shopping-row"><input type="checkbox" ${state.checked[item.id]?"checked":""} data-check="${escapeHtml(item.id)}"><span><strong>${escapeHtml(item.name)}</strong><small>For ${escapeHtml(item.meals.join(", "))}</small></span><span class="shopping-quantity">${escapeHtml([item.quantity,item.unit].filter(Boolean).join(" "))}</span><span class="shopping-actions"><button type="button" data-edit-shopping="${encodeURIComponent(item.id)}">Edit</button><button type="button" class="delete-shopping" data-delete-shopping="${encodeURIComponent(item.id)}">Delete</button></span></div>`).join("")}</section>`).join(""):`<div class="empty-shopping"><p class="subtitle">No ingredients yet. Add a meal or add a shopping item manually.</p><button class="primary-button" data-add-shopping>＋ Add first item</button></div>`;
  const checked=Object.values(data).flatMap(g=>Object.values(g)).filter(item=>state.checked[item.id]).length;
  $("#basketSummary").innerHTML=`<div class="basket-stat"><span>Unique items</span><strong>${itemCount}</strong></div><div class="basket-stat"><span>Categories</span><strong>${groups.length}</strong></div><div class="basket-stat"><span>Already checked</span><strong>${checked}</strong></div><div class="basket-stat"><span>Shopping region</span><strong>${escapeHtml(state.settings.region)}</strong></div>`;
}

function countMeals(meals) {
  return meals.reduce((counts,meal)=>{ const key=meal.name.trim(); counts[key]=(counts[key]||0)+1; return counts; },{});
}

function renderInsights() {
  const monthStart=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1), monthEnd=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,0), meals=mealsInRange(monthStart,monthEnd);
  const counts=Object.entries(countMeals(meals)).sort((a,b)=>b[1]-a[1]);
  const max=counts[0]?.[1]||1;
  $("#repeatChart").innerHTML=counts.length?counts.slice(0,8).map(([name,count])=>`<div class="bar-row"><span>${escapeHtml(name)}</span><div class="bar-track"><span style="width:${count/max*100}%"></span></div><strong>${count}×</strong></div>`).join(""):`<p class="subtitle">No meals planned for this month yet.</p>`;
  const days=monthEnd.getDate(), coverage=Math.round(meals.length/(days*4)*100);
  $("#coverageValue").textContent=`${coverage}%`; $("#coverageBar").style.width=`${coverage}%`;
  const typeCounts=TYPES.map(type=>[type,meals.filter(meal=>meal.type===type).length]).sort((a,b)=>b[1]-a[1]);
  $("#topMealType").textContent=typeCounts[0][1]?typeCounts[0][0]:"No meals yet";
  $("#topMealCopy").textContent=typeCounts[0][1]?`${typeCounts[0][1]} ${typeCounts[0][0].toLowerCase()} slots planned this month.`:"Start planning to see your pattern.";
}

function switchView(view) {
  currentView=view;
  $$(".page").forEach(page=>page.classList.add("hidden"));
  $(`#${view}View`).classList.remove("hidden");
  $$(".nav-item").forEach(item=>item.classList.toggle("active",item.dataset.view===view));
  $("#sidebar").classList.remove("open");
  if(view==="month")renderMonth(); if(view==="shopping")renderShopping(); if(view==="insights")renderInsights();
}

function openMeal(date=dateKey(new Date()),type="Dinner",key=null) {
  editingKey=key;
  const meal=key?state.meals[key]:null;
  $("#mealDate").value=meal?.date||date; $("#mealType").value=meal?.type||type; $("#mealName").value=meal?.name||"";
  $("#mealDescription").value=meal?.description||""; $("#mealServings").value=meal?.servings||4; $("#mealTime").value=meal?.time||"";
  $("#mealIngredients").value=(meal?.ingredients||[]).join("\n"); $("#mealRecipe").value=(meal?.steps||[]).join("\n"); $("#mealVideo").value=meal?.video||"";
  $("#dialogTitle").textContent=meal?"Edit your meal":"Create a meal"; $("#dialogEyebrow").textContent=meal?"RECIPE DETAILS":"ADD TO YOUR PLAN";
  $("#deleteMeal").classList.toggle("hidden",!meal); updateVideoPreview(); $("#mealDialog").showModal(); setTimeout(()=>$("#mealName").focus(),50);
}

function closeMealDialog() {
  editingKey=null;
  $("#mealDialog").close();
}

function generateRecipe() {
  const name=$("#mealName").value.trim(); if(!name){showToast("Enter a meal idea first");return;}
  const recipe=recipeFor(name);
  $("#mealDescription").value=recipe.description; $("#mealTime").value=recipe.time; $("#mealIngredients").value=recipe.ingredients.join("\n"); $("#mealRecipe").value=recipe.steps.join("\n"); $("#mealVideo").value=recipe.video;
  updateVideoPreview(); showToast(`Recipe prepared for ${state.settings.region}`);
}

function recipeFor(name) {
  return recipeLibrary.find(item=>item.match.some(term=>name.toLowerCase().includes(term)))||defaultRecipe(name);
}

function updateVideoPreview() {
  const url=$("#mealVideo").value, match=url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]{11})/), preview=$("#videoPreview");
  preview.classList.toggle("hidden",!match); preview.innerHTML=match?`<iframe src="https://www.youtube.com/embed/${match[1]}" allowfullscreen title="Recipe video"></iframe>`:"";
}

function saveMeal(event) {
  event.preventDefault();
  if(!$("#mealForm").reportValidity())return;
  const date=$("#mealDate").value,type=$("#mealType").value,newKey=mealKey(date,type),name=$("#mealName").value.trim();
  if(!$("#mealIngredients").value.trim()) {
    const generated=recipeFor(name);
    $("#mealDescription").value ||= generated.description; $("#mealTime").value ||= generated.time;
    $("#mealIngredients").value=generated.ingredients.join("\n"); $("#mealRecipe").value ||= generated.steps.join("\n"); $("#mealVideo").value ||= generated.video;
  }
  const meal={date,type,name,description:$("#mealDescription").value.trim(),servings:Number($("#mealServings").value)||4,time:$("#mealTime").value.trim(),ingredients:$("#mealIngredients").value.split("\n").map(v=>v.trim()).filter(Boolean),steps:$("#mealRecipe").value.split("\n").map(v=>v.trim()).filter(Boolean),video:$("#mealVideo").value.trim()};
  if(editingKey&&editingKey!==newKey)delete state.meals[editingKey]; state.meals[newKey]=meal; save(); $("#mealDialog").close(); renderAll(); showToast("Meal saved to your plan");
}

function findShoppingItem(id) {
  return Object.values(shoppingData()).flatMap(group=>Object.values(group)).find(item=>item.id===id);
}

function closeShoppingItemDialog() {
  editingShoppingId=null;
  $("#shoppingItemDialog").close();
}

function openShoppingItem(id=null) {
  editingShoppingId=id;
  const item=id?findShoppingItem(id):null;
  $("#shoppingItemTitle").textContent=item?"Edit shopping item":"Add an item";
  $("#shoppingItemName").value=item?.name||""; $("#shoppingItemQuantity").value=item?.quantity||"";
  $("#shoppingItemUnit").value=item?.unit||""; $("#shoppingItemCategory").value=item?.category||"Fresh produce";
  $("#shoppingItemDialog").showModal(); setTimeout(()=>$("#shoppingItemName").focus(),50);
}

function saveShoppingItem() {
  if(!$("#shoppingItemForm").reportValidity())return;
  const overrides=shoppingOverrides(),wasEditing=Boolean(editingShoppingId);
  const values={name:$("#shoppingItemName").value.trim(),quantity:$("#shoppingItemQuantity").value.trim(),unit:$("#shoppingItemUnit").value.trim(),category:$("#shoppingItemCategory").value};
  if(wasEditing) overrides.edits[editingShoppingId]=values;
  else overrides.manual.push({id:`manual:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,...values});
  save(); closeShoppingItemDialog(); renderShopping(); renderSidebars(); showToast(wasEditing?"Shopping item updated":"Shopping item added");
}

function deleteShoppingItem(id) {
  const overrides=shoppingOverrides();
  overrides.deleted[id]=true; delete overrides.edits[id]; delete state.checked[id];
  save(); renderShopping(); renderSidebars(); showToast("Shopping item deleted");
}

function clearPlanRanges() {
  const monthReference=clearPlanContext==="week"?addDays(currentWeek,3):currentMonth;
  const monthStart=new Date(monthReference.getFullYear(),monthReference.getMonth(),1);
  return {
    week:[currentWeek,addDays(currentWeek,6)],
    month:[monthStart,new Date(monthStart.getFullYear(),monthStart.getMonth()+1,0)]
  };
}

function closeClearPlan() {
  $("#clearPlanDialog").close();
}

function openClearPlan(context) {
  clearPlanContext=context;
  const ranges=clearPlanRanges();
  const weekMeals=mealsInRange(...ranges.week),monthMeals=mealsInRange(...ranges.month),allMeals=Object.values(state.meals);
  $("#clearPlanNote").textContent=`Choose what to remove from the ${context} view. This cannot be undone.`;
  $("[data-clear-scope=\"week\"]").classList.toggle("hidden",context==="month");
  $("#clearWeekDates").textContent=formatRange(...ranges.week);
  $("#clearMonthDates").textContent=ranges.month[0].toLocaleDateString(undefined,{month:"long",year:"numeric"});
  [["week",weekMeals.length],["month",monthMeals.length],["all",allMeals.length]].forEach(([scope,count])=>{
    $(`#clear${scope[0].toUpperCase()+scope.slice(1)}Count`).textContent=`${count} ${count===1?"meal":"meals"}`;
    $(`[data-clear-scope="${scope}"]`).disabled=count===0;
  });
  $("#clearPlanDialog").showModal();
}

function deleteMealsByScope(scope) {
  const ranges=clearPlanRanges();
  let keys=[];
  if(scope==="all") keys=Object.keys(state.meals);
  else {
    const [start,end]=ranges[scope];
    keys=Object.entries(state.meals).filter(([,meal])=>{const date=parseDate(meal.date);return date>=start&&date<=end;}).map(([key])=>key);
  }
  keys.forEach(key=>delete state.meals[key]);
  save(); closeClearPlan(); renderAll();
  showToast(`${keys.length} ${keys.length===1?"meal":"meals"} deleted`);
}

function renderAll(){renderWeek();if(currentView==="month")renderMonth();if(currentView==="shopping")renderShopping();if(currentView==="insights")renderInsights();}

document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add-date]"); if(add)openMeal(add.dataset.addDate,add.dataset.addType);
  const edit=event.target.closest("[data-edit]"); if(edit)openMeal(null,null,edit.dataset.edit);
  const nav=event.target.closest("[data-view]"); if(nav)switchView(nav.dataset.view);
  const openView=event.target.closest("[data-open-view]"); if(openView)switchView(openView.dataset.openView);
  const scope=event.target.closest("[data-list-scope]"); if(scope){listScope=scope.dataset.listScope;$$(`[data-list-scope]`).forEach(b=>b.classList.toggle("active",b===scope));renderShopping();}
  const check=event.target.closest("[data-check]"); if(check){state.checked[check.dataset.check]=check.checked;save();if(currentView==="shopping")renderShopping();}
  const editShopping=event.target.closest("[data-edit-shopping]"); if(editShopping)openShoppingItem(decodeURIComponent(editShopping.dataset.editShopping));
  const deleteShopping=event.target.closest("[data-delete-shopping]"); if(deleteShopping)deleteShoppingItem(decodeURIComponent(deleteShopping.dataset.deleteShopping));
  if(event.target.closest("[data-add-shopping]"))openShoppingItem();
  const openClear=event.target.closest("[data-open-clear-plan]"); if(openClear)openClearPlan(openClear.dataset.openClearPlan);
  const clearScope=event.target.closest("[data-clear-scope]"); if(clearScope&&!clearScope.disabled)deleteMealsByScope(clearScope.dataset.clearScope);
});

$("#prevWeek").onclick=()=>{currentWeek=addDays(currentWeek,-7);renderWeek();}; $("#nextWeek").onclick=()=>{currentWeek=addDays(currentWeek,7);renderWeek();};
$("#prevMonth").onclick=()=>{currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1,1);renderMonth();}; $("#nextMonth").onclick=()=>{currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,1);renderMonth();};
$("#todayButton").onclick=()=>{
  const now=new Date();
  currentWeek=startOfWeek(now); currentMonth=new Date(now.getFullYear(),now.getMonth(),1);
  switchView("week"); renderWeek();
  window.scrollTo({top:0,behavior:"smooth"});
  showToast(`Showing this week · ${now.toLocaleDateString(undefined,{month:"short",day:"numeric"})}`);
};
$("#quickAddButton").onclick=()=>openMeal(); $("#generateButton").onclick=generateRecipe; $("#saveMeal").onclick=saveMeal; $("#mealVideo").addEventListener("change",updateVideoPreview);
$("#mealDialog").addEventListener("click",event=>{if(event.target===$("#mealDialog"))closeMealDialog();});
$("#deleteMeal").onclick=()=>{if(editingKey){delete state.meals[editingKey];save();$("#mealDialog").close();renderAll();showToast("Meal removed");}};
$("#menuButton").onclick=()=>$("#sidebar").classList.toggle("open");
$("#profileButton").onclick=()=>{$("#regionSelect").value=state.settings.region;$("#unitSelect").value=state.settings.units;$("#settingsDialog").showModal();};
$("#saveSettings").onclick=()=>{state.settings={region:$("#regionSelect").value,units:$("#unitSelect").value};save();renderSettings();showToast("Kitchen preferences saved");};
$("#copyList").onclick=async()=>{const data=shoppingData(),text=Object.entries(data).map(([category,group])=>`${category}\n${Object.values(group).map(item=>`- ${[item.quantity,item.unit,item.name].filter(Boolean).join(" ")}`).join("\n")}`).join("\n\n");try{await navigator.clipboard.writeText(text);showToast("Shopping list copied");}catch{showToast("Copy is unavailable in this browser");}};
$("#addShoppingItem").onclick=()=>openShoppingItem(); $("#saveShoppingItem").onclick=saveShoppingItem;
$("#shoppingItemForm").addEventListener("submit",event=>{event.preventDefault();saveShoppingItem();});
$("#closeShoppingItem").onclick=closeShoppingItemDialog; $("#cancelShoppingItem").onclick=closeShoppingItemDialog;
$("#shoppingItemDialog").addEventListener("click",event=>{if(event.target===$("#shoppingItemDialog"))closeShoppingItemDialog();});
$("#closeClearPlan").onclick=closeClearPlan; $("#cancelClearPlan").onclick=closeClearPlan;
$("#clearPlanDialog").addEventListener("click",event=>{if(event.target===$("#clearPlanDialog"))closeClearPlan();});
$("#globalSearch").addEventListener("input",event=>{const q=event.target.value.trim().toLowerCase();if(!q){renderAll();return;}const matches=Object.entries(state.meals).filter(([,meal])=>meal.name.toLowerCase().includes(q)||meal.ingredients.some(i=>i.toLowerCase().includes(q)));if(currentView!=="week")switchView("week");$$('.meal-slot.filled').forEach(slot=>slot.style.opacity=".25");matches.forEach(([key])=>{const button=document.querySelector(`[data-edit="${key}"]`);if(button)button.closest(".meal-slot").style.opacity="1";});});
document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();$("#globalSearch").focus();}});

function renderSettings(){const units=state.settings.units==="metric"?"metric":"imperial";$("#profileRegion").textContent=`${state.settings.region} · ${units}`;}
renderSettings(); renderWeek();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(registration=>registration.update()).catch(()=>{}));
