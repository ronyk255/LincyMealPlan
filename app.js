const TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const TYPE_ICONS = {Breakfast:"🍳",Lunch:"🥪",Dinner:"🍽️",Snack:"🍎"};
const STORE_KEY = "lincy-meal-planner-v1";
const pad = value => String(value).padStart(2, "0");
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDate = value => { const [y,m,d] = value.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (date, count) => { const next = new Date(date); next.setDate(next.getDate() + count); return next; };
const startOfWeek = date => addDays(date, -((date.getDay() + 6) % 7));
const ordinal = value => {
  const remainder=value%100;
  if(remainder>=11&&remainder<=13)return `${value}th`;
  return `${value}${value%10===1?"st":value%10===2?"nd":value%10===3?"rd":"th"}`;
};
const formatWeekHeading = weekStart => {
  const weekEnd=addDays(weekStart,6),sameMonth=weekStart.getMonth()===weekEnd.getMonth()&&weekStart.getFullYear()===weekEnd.getFullYear(),sameYear=weekStart.getFullYear()===weekEnd.getFullYear();
  const startMonth=weekStart.toLocaleDateString(undefined,{month:"long"}),endMonth=weekEnd.toLocaleDateString(undefined,{month:"long"});
  if(sameMonth)return `Week ${startMonth} ${ordinal(weekStart.getDate())} – ${ordinal(weekEnd.getDate())} ${weekEnd.getFullYear()}`;
  if(sameYear)return `Week ${startMonth} ${ordinal(weekStart.getDate())} – ${endMonth} ${ordinal(weekEnd.getDate())} ${weekEnd.getFullYear()}`;
  return `Week ${startMonth} ${ordinal(weekStart.getDate())} ${weekStart.getFullYear()} – ${endMonth} ${ordinal(weekEnd.getDate())} ${weekEnd.getFullYear()}`;
};
const escapeHtml = value => String(value || "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

const recipeLibrary = [
  {match:["curry","tikka","masala"],description:"A warming, aromatic curry with a silky tomato-coconut sauce.",time:"40 min",ingredients:["600 g chicken thigh","1 onion","3 garlic cloves","20 g fresh ginger","2 tbsp curry powder","400 ml coconut milk","400 g chopped tomatoes","300 g basmati rice","1 bunch fresh coriander","1 lime"],steps:["Dice the chicken and season lightly.","Soften the chopped onion, garlic and ginger in oil.","Stir in curry powder, then add chicken and brown for 5 minutes.","Add tomatoes and coconut milk; simmer for 20 minutes.","Cook the rice, finish the curry with lime and serve with coriander."],video:"https://www.youtube.com/watch?v=WRYOVVexMhU"},
  {match:["pasta","spaghetti","bolognese","lasagne"],description:"A comforting pasta dinner with a rich, herb-filled tomato sauce.",time:"35 min",ingredients:["400 g pasta","500 g minced beef","1 onion","2 garlic cloves","400 g chopped tomatoes","2 tbsp tomato paste","1 tsp dried oregano","50 g parmesan","1 bag green salad"],steps:["Cook the pasta in well-salted water.","Brown the mince, then add diced onion and garlic.","Stir in tomato paste, tomatoes and oregano.","Simmer for 15 minutes and season to taste.","Toss with pasta and finish with parmesan."],video:"https://www.youtube.com/watch?v=sGFxHqs3TUY"},
  {match:["salmon","fish"],description:"Oven-roasted salmon with bright lemon, herbs and seasonal vegetables.",time:"30 min",ingredients:["600 g salmon fillet","800 g baby potatoes","1 broccoli","1 lemon","2 tbsp olive oil","1 bunch dill","200 ml yoghurt","1 garlic clove"],steps:["Heat the oven to 210°C.","Halve potatoes, season and roast for 15 minutes.","Add broccoli and salmon; drizzle with oil and lemon.","Roast for 12–15 minutes until the salmon flakes.","Mix yoghurt, dill and garlic, then serve alongside."],video:"https://www.youtube.com/watch?v=2uYoqclu6so"},
  {match:["taco","burrito","quesadilla"],description:"Colourful, build-your-own tacos with punchy toppings.",time:"30 min",ingredients:["12 small tortillas","500 g minced beef","1 sachet taco seasoning","1 can black beans","2 tomatoes","1 avocado","1 lime","150 g grated cheese","150 ml sour cream","1 lettuce"],steps:["Brown the mince with taco seasoning.","Warm and season the drained black beans.","Chop tomatoes, lettuce and avocado.","Warm tortillas in a dry pan.","Set everything out and let everyone build their own tacos."],video:"https://www.youtube.com/watch?v=dwwqoU7nN-E"},
  {match:["soup","stew"],description:"A generous one-pot meal packed with vegetables and deep savoury flavour.",time:"45 min",ingredients:["1 onion","3 carrots","2 celery stalks","3 potatoes","1 litre vegetable stock","1 can white beans","2 garlic cloves","1 tsp dried thyme","1 loaf crusty bread"],steps:["Chop all vegetables into even pieces.","Soften onion, celery and carrots in a large pot.","Add garlic, potatoes, thyme and stock.","Simmer for 25 minutes, then stir in the beans.","Season well and serve with warm bread."],video:"https://www.youtube.com/watch?v=k1JUIIPlENk"},
  {match:["pancake","waffle"],description:"Fluffy golden pancakes for an easy, unhurried breakfast.",time:"20 min",ingredients:["250 g plain flour","2 tsp baking powder","2 eggs","350 ml milk","50 g butter","200 g fresh berries","150 ml yoghurt","2 tbsp maple syrup"],steps:["Whisk flour and baking powder together.","Beat in eggs and milk until just smooth.","Melt a little butter in a medium-hot pan.","Cook small ladlefuls until bubbles appear, then flip.","Serve warm with berries, yoghurt and maple syrup."],video:"https://www.youtube.com/watch?v=RaLzxZryEoA"},
  {match:["oat","porridge","granola"],description:"A nourishing breakfast bowl with fruit, gentle spice and crunch.",time:"10 min",ingredients:["200 g rolled oats","600 ml milk","2 bananas","1 tsp cinnamon","100 g mixed berries","50 g nuts","2 tbsp honey"],steps:["Combine oats and milk in a saucepan.","Simmer gently for 5 minutes, stirring often.","Mash in one banana and add cinnamon.","Divide into bowls.","Top with sliced banana, berries, nuts and honey."],video:"https://www.youtube.com/watch?v=VZOHHCosuzY"},
  {match:["salad","bowl"],description:"A crisp, satisfying bowl layered with grains, vegetables and a fresh dressing.",time:"25 min",ingredients:["250 g quinoa","1 cucumber","250 g cherry tomatoes","1 can chickpeas","1 avocado","100 g feta","1 lemon","2 tbsp olive oil","1 bag mixed leaves"],steps:["Cook quinoa according to the packet and cool slightly.","Drain chickpeas and chop the vegetables.","Whisk lemon juice and olive oil with salt and pepper.","Layer leaves, quinoa, chickpeas and vegetables.","Crumble over feta and spoon on the dressing."],video:"https://www.youtube.com/watch?v=9dbpVyiGxT8"}
];

const detailedRecipeSteps = [
  {match:["curry","tikka","masala"],steps:[
    "Prepare everything first: cut the chicken thighs into 3 cm pieces, finely dice the onion, mince the garlic, grate the ginger, chop the coriander, and cut the lime into wedges.",
    "Rinse the basmati rice under cold water until the water runs mostly clear. Add it to a saucepan with 600 ml water and a pinch of salt, bring to a boil, then cover and cook on very low heat for 12 minutes.",
    "Pat the chicken dry and season it with salt and black pepper. Heat 1 tablespoon of oil in a large deep frying pan over medium-high heat.",
    "Add the chicken in a single layer and brown it for 4-5 minutes, turning occasionally. It does not need to be cooked through yet. Transfer it to a plate.",
    "Lower the heat to medium. Add the onion to the same pan with a small pinch of salt and cook for 5-7 minutes, stirring, until soft and lightly golden.",
    "Add the garlic and ginger and cook for 1 minute. Stir in the curry powder and cook for another 30 seconds until fragrant, taking care not to burn the spices.",
    "Pour in the chopped tomatoes and coconut milk. Scrape the bottom of the pan to release the browned flavour, then bring the sauce to a gentle simmer.",
    "Return the chicken and any resting juices to the pan. Simmer uncovered for 15-20 minutes, stirring occasionally, until the chicken is cooked through and the sauce has thickened. Chicken should reach 75°C in the centre.",
    "Turn off the rice and let it rest, still covered, for 5 minutes before fluffing it with a fork. If the curry is too thick, loosen it with a splash of water.",
    "Taste the curry and adjust with salt, black pepper, and lime juice. Spoon over the rice and finish with fresh coriander and the remaining lime wedges."
  ]},
  {match:["pasta","spaghetti","bolognese","lasagne"],steps:[
    "Bring a large pot of water to a rolling boil. Finely dice the onion, mince the garlic, grate the parmesan, and wash the salad leaves.",
    "Heat a large frying pan over medium-high heat. Add the minced beef and cook for 6-8 minutes, breaking it into small pieces, until browned and no pink remains.",
    "If the pan contains excess fat, carefully spoon most of it away. Add the onion and cook for 4-5 minutes until softened.",
    "Add the garlic and cook for 30 seconds. Stir in the tomato paste and oregano and cook for 1 minute to deepen their flavour.",
    "Pour in the chopped tomatoes plus 150 ml water. Scrape up any browned bits, bring to a simmer, then lower the heat and cook uncovered for 15-20 minutes.",
    "Salt the boiling pasta water generously. Add the pasta and cook until al dente according to the packet, stirring during the first minute so it does not stick.",
    "Before draining, reserve about 200 ml of pasta water. Drain the pasta without rinsing it.",
    "Taste the sauce and season with salt and pepper. Add the pasta and a splash of reserved water, then toss over low heat for 1-2 minutes until the sauce coats every strand.",
    "Divide between warm bowls, add parmesan, and serve immediately with the green salad dressed simply with oil, vinegar, salt, and pepper."
  ]},
  {match:["salmon","fish"],steps:[
    "Heat the oven to 210°C conventional or 190°C fan. Line a large tray with baking paper.",
    "Halve the baby potatoes, place them on the tray, and toss with 1 tablespoon olive oil, salt, and black pepper. Arrange cut-side down.",
    "Roast the potatoes for 15 minutes. Meanwhile, cut the broccoli into florets, zest half the lemon, and cut the whole lemon into wedges.",
    "Pat the salmon dry and check for pin bones. Season both sides with salt and pepper and rub the top with lemon zest and a little olive oil.",
    "Remove the tray, turn the potatoes, and add the broccoli tossed with the remaining oil and a pinch of salt. Make space for the salmon fillets.",
    "Place the salmon skin-side down and return the tray to the oven for 12-15 minutes, depending on thickness.",
    "While it roasts, mix the yoghurt with minced garlic, chopped dill, a squeeze of lemon, salt, and pepper. Keep chilled until serving.",
    "Check the salmon: it should flake easily but remain moist in the centre, or register about 52-55°C for medium and 63°C for fully cooked.",
    "Rest the salmon for 2 minutes, then serve with the roasted potatoes, broccoli, dill yoghurt sauce, and lemon wedges."
  ]},
  {match:["taco","burrito","quesadilla"],steps:[
    "Prepare the toppings first: shred the lettuce, dice the tomatoes, grate the cheese, cut the lime into wedges, and slice the avocado just before serving.",
    "Drain and rinse the black beans. Warm them in a small saucepan over low heat with 2 tablespoons of water and a pinch of salt.",
    "Heat a large frying pan over medium-high heat. Add the minced beef and cook for 6-8 minutes, breaking it up, until deeply browned and cooked through.",
    "Spoon away excess fat if needed. Add the taco seasoning and the amount of water stated on the packet, usually about 100 ml.",
    "Reduce the heat and simmer the beef for 4-5 minutes until the liquid has reduced and the meat is evenly coated. Taste and adjust the salt.",
    "Warm the tortillas in a dry pan for 20-30 seconds per side, or wrap them in foil and heat in a low oven. Keep them covered so they stay soft.",
    "Season the avocado with a squeeze of lime and a small pinch of salt to prevent browning.",
    "Arrange the beef, beans, vegetables, cheese, sour cream, avocado, and lime in separate bowls so everyone can assemble their own tacos.",
    "Fill each warm tortilla lightly so it can fold: start with beef and beans, then add fresh toppings, cheese, sour cream, and lime. Serve immediately."
  ]},
  {match:["soup","stew"],steps:[
    "Prepare the vegetables: dice the onion, slice the carrots and celery, cut the potatoes into 2 cm pieces, and mince the garlic. Drain and rinse the beans.",
    "Heat 2 tablespoons of oil in a large heavy pot over medium heat. Add the onion, carrots, and celery with a pinch of salt.",
    "Cook for 8-10 minutes, stirring occasionally, until the vegetables soften and the onion becomes translucent without browning.",
    "Add the garlic and thyme and cook for 1 minute until fragrant.",
    "Add the potatoes and vegetable stock. Increase the heat and bring the soup to a boil, then reduce it to a steady gentle simmer.",
    "Partially cover and simmer for 20-25 minutes, stirring occasionally, until the potatoes and carrots are tender when pierced with a knife.",
    "Stir in the white beans and simmer uncovered for another 5 minutes so they heat through and absorb the flavour.",
    "For a thicker soup, mash a few potato and bean pieces against the side of the pot, then stir them back in.",
    "Taste carefully and adjust with salt and black pepper. Add a splash of water or stock if the soup has become too thick.",
    "Let the soup rest for 5 minutes, then ladle into bowls and serve with thick slices of warm crusty bread."
  ]},
  {match:["pancake","waffle"],steps:[
    "Heat the oven to 100°C and place a tray inside so finished pancakes can stay warm without drying out.",
    "In a large bowl, whisk together the flour, baking powder, and a small pinch of salt, breaking up any lumps.",
    "In a separate jug, whisk the eggs and milk. Melt the butter and allow it to cool for a minute before whisking it into the wet mixture.",
    "Make a well in the flour and pour in the wet ingredients. Fold gently until no dry flour remains; a few small lumps are better than overmixing.",
    "Leave the batter to rest for 5 minutes. This hydrates the flour and helps the pancakes rise evenly.",
    "Heat a non-stick frying pan over medium heat and brush it with a thin film of butter. The pan is ready when a drop of water sizzles gently.",
    "Add about 60 ml batter per pancake. Cook for 2-3 minutes until bubbles form across the surface and the edges look set.",
    "Flip once and cook for another 1-2 minutes until golden underneath and springy in the centre. Adjust the heat if they brown too quickly.",
    "Transfer each batch to the warm oven. Serve stacked with yoghurt, berries, nuts if desired, and maple syrup."
  ]},
  {match:["oat","porridge","granola"],steps:[
    "Measure the oats and milk into a medium saucepan. Add a small pinch of salt and half of the cinnamon.",
    "Peel one banana and mash it thoroughly with a fork, then stir it into the oats for natural sweetness and a creamy texture.",
    "Place the saucepan over medium heat and bring it just to a gentle simmer, stirring frequently so the milk does not catch on the bottom.",
    "Lower the heat and cook for 5-7 minutes, stirring every 30 seconds, until the oats are tender and the porridge is thick but still spoonable.",
    "If it becomes too thick, stir in a little more milk. For thicker porridge, cook for another minute.",
    "Taste and add the remaining cinnamon or a little honey if more sweetness is needed.",
    "Slice the second banana and roughly chop the nuts. If using frozen berries, warm them briefly until juicy.",
    "Divide the porridge between bowls and top with banana, berries, nuts, and a drizzle of honey. Serve immediately while hot."
  ]},
  {match:["salad","bowl"],steps:[
    "Rinse the quinoa very well in a fine sieve. Add it to a saucepan with 500 ml water and a pinch of salt.",
    "Bring to a boil, cover, reduce to very low heat, and cook for 12-15 minutes until the water is absorbed and the grains have opened.",
    "Remove the quinoa from the heat and let it stand covered for 5 minutes. Fluff with a fork, spread on a plate, and cool slightly.",
    "Drain and rinse the chickpeas, then pat them dry. Dice the cucumber, halve the cherry tomatoes, slice the avocado, and crumble the feta.",
    "Make the dressing by whisking the lemon juice and olive oil with a generous pinch of salt and black pepper until lightly emulsified.",
    "Place the mixed leaves in a large bowl and toss them with one-third of the dressing.",
    "Add the quinoa, chickpeas, cucumber, and tomatoes. Pour over most of the remaining dressing and toss gently so the avocado will not break up later.",
    "Divide into bowls, then arrange the avocado and feta over the top.",
    "Taste and finish with the remaining dressing, extra lemon, salt, or pepper as needed. Serve at room temperature."
  ]}
];

const defaultRecipe = name => ({description:`A simple, adaptable ${name.toLowerCase()} made with everyday ingredients.`,time:"35 min",ingredients:[`500 g main ingredient for ${name}`,"1 onion","2 garlic cloves","2 tbsp cooking oil","500 g seasonal vegetables","1 tsp preferred seasoning","1 fresh herb or garnish","1 pantry staple to serve"],steps:["Read the full recipe, gather all ingredients, and set out the equipment you will need before turning on the heat.","Wash the produce, finely dice the onion, mince the garlic, cut the seasonal vegetables into even bite-sized pieces, and prepare the main ingredient so everything cooks at the same rate.","Pat the main ingredient dry and season it on all sides with salt, black pepper, and half of the preferred seasoning.","Heat 1 tablespoon of oil in a wide pan over medium-high heat. Add the main ingredient in a single layer and cook until well browned, turning as needed. Transfer it to a clean plate if it needs further cooking later.","Reduce the heat to medium, add the remaining oil and onion, and cook for 5-7 minutes until soft. Add the garlic and remaining seasoning and stir for 30-60 seconds until fragrant.","Add the seasonal vegetables, starting with the firmest pieces. Cook for 5 minutes, stirring occasionally, then add a splash of water or stock and scrape up the flavour from the bottom of the pan.",`Return the main ingredient for ${name} to the pan. Cover loosely and cook at a gentle simmer until the vegetables are tender and the main ingredient is safely cooked through; poultry should reach 75°C and minced meat 71°C.`,"Remove the lid for the final few minutes if the dish needs to reduce. Taste and adjust the salt, pepper, acidity, and seasoning until the flavour is balanced.","Let the finished dish rest off the heat for 3-5 minutes. Prepare the chosen pantry staple according to its packet while the main dish rests.","Serve in warm bowls or plates, spoon over any pan juices, and finish with the fresh herb or garnish."],video:`https://www.youtube.com/results?search_query=${encodeURIComponent(name + " recipe")}`});

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
state = state || {meals:seedMeals(),settings:{region:"Sweden",units:"metric"},checked:{},shoppingOverrides:{},recipeChecks:{}};
state.meals ||= {}; state.settings ||= {region:"Sweden",units:"metric"}; state.checked ||= {}; state.shoppingOverrides ||= {}; state.recipeChecks ||= {};
let currentWeek = startOfWeek(new Date());
let currentMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1);
let currentView = "week";
let listScope = "week";
let editingKey = null;
let editingShoppingId = null;
let clearPlanContext = "week";
let viewingMealKey = null;
let account = null;
let authMode = "login";
let syncTimer = null;
let staticMode = false;
let editingUserId = null;
let previewOnly = false;
const DEFAULT_API_URL = "https://lincy-meal-plan-api.ronyk212.workers.dev";
let apiBase = localStorage.getItem("lincy-api-url")?.replace(/\/$/,"") || DEFAULT_API_URL;
let authToken = localStorage.getItem("lincy-auth-token") || "";

function apiFetch(path,options={}){
  const headers=new Headers(options.headers||{});if(authToken)headers.set("Authorization",`Bearer ${authToken}`);
  return fetch(`${apiBase}${path}`,{...options,headers,credentials:apiBase?"omit":"same-origin"});
}

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const save = () => {
  localStorage.setItem(STORE_KEY,JSON.stringify(state));
  if(!account)return;
  clearTimeout(syncTimer);
  syncTimer=setTimeout(async()=>{
    try{
      const response=await apiFetch("/api/plan",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({state})});
      if(!response.ok)throw new Error();
    }catch{showToast("Saved on this device; shared sync is offline");}
    finally{syncTimer=null;}
  },250);
};
const formatRange = (start,end) => `${start.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${end.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
const mealKey = (date,type) => `${date}|${type}`;

function mealsInRange(start,end) {
  return Object.values(state.meals).filter(meal => { const date=parseDate(meal.date); return date>=start && date<=end; });
}

function showToast(message) {
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}

function mealVisual(name="",type="") {
  const value=name.toLowerCase();
  if(/curry|tikka|masala/.test(value))return {icon:"🍛",theme:"curry"};
  if(/pasta|spaghetti|bolognese|lasagne|noodle/.test(value))return {icon:"🍝",theme:"pasta"};
  if(/salmon|fish|tuna|cod|shrimp|prawn|seafood/.test(value))return {icon:"🐟",theme:"seafood"};
  if(/taco|burrito|quesadilla|nacho/.test(value))return {icon:"🌮",theme:"taco"};
  if(/soup|stew|broth/.test(value))return {icon:"🥣",theme:"soup"};
  if(/salad|bowl|quinoa/.test(value))return {icon:"🥗",theme:"salad"};
  if(/pancake|waffle|crepe/.test(value))return {icon:"🥞",theme:"pancake"};
  if(/oat|porridge|granola|cereal/.test(value))return {icon:"🥣",theme:"breakfast"};
  if(/pizza/.test(value))return {icon:"🍕",theme:"pizza"};
  if(/burger|sandwich|wrap/.test(value))return {icon:"🥪",theme:"sandwich"};
  if(/chicken|turkey/.test(value))return {icon:"🍗",theme:"protein"};
  if(/beef|steak|meat/.test(value))return {icon:"🥩",theme:"protein"};
  if(/rice|risotto/.test(value))return {icon:"🍚",theme:"rice"};
  if(/cake|cookie|brownie|dessert|ice cream/.test(value))return {icon:"🍰",theme:"dessert"};
  if(/fruit|smoothie|berry/.test(value))return {icon:"🍓",theme:"fruit"};
  if(type==="Breakfast")return {icon:"🍳",theme:"breakfast"};
  if(type==="Lunch")return {icon:"🥙",theme:"lunch"};
  if(type==="Snack")return {icon:"🍎",theme:"snack"};
  return {icon:"🍽️",theme:"dinner"};
}

function renderWeek() {
  $("#weekRange").textContent=currentWeek.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  $("#weekNumber").textContent=formatWeekHeading(currentWeek);
  $("#weekGrid").innerHTML=Array.from({length:7},(_,i)=>{
    const date=addDays(currentWeek,i), key=dateKey(date);
    const slots=TYPES.map(type=>{
      const meal=state.meals[mealKey(key,type)];
      const visual=meal?mealVisual(meal.name,type):null;
      return `<div class="meal-slot ${meal?`filled meal-theme-${visual.theme}`:""}" data-type="${type}"><span class="slot-label">${type}</span>${meal?`<button class="meal-card" data-view-meal="${key}|${type}"><span class="meal-card-icon" aria-hidden="true">${visual.icon}</span><span class="meal-card-copy"><strong>${escapeHtml(meal.name)}</strong><small>${escapeHtml(meal.time||"")} · ${meal.servings||4} servings</small></span></button>`:`<button class="add-slot" data-add-date="${key}" data-add-type="${type}" aria-label="Add ${type}">＋</button>`}</div>`;
    }).join("");
    return `<div class="day-column"><div class="day-header"><span class="day-sticker">${["☀️","🥪","🍲","🥗","🌮","🥞","🍝"][i]}</span><span class="day-number">${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][i]}</span></div>${slots}</div>`;
  }).join("");
  renderSidebars();
}

function renderMonth() {
  $("#monthRange").textContent=currentMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  const gridStart=startOfWeek(new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1));
  $("#monthGrid").innerHTML=Array.from({length:6},(_,week)=>{
    const days=Array.from({length:7},(_,day)=>{
      const date=addDays(gridStart,week*7+day),key=dateKey(date),dayMeals=TYPES.map(type=>state.meals[mealKey(key,type)]).filter(Boolean);
      return `<div class="month-day ${date.getMonth()!==currentMonth.getMonth()?"outside":""}">${dayMeals.slice(0,4).map(meal=>{const visual=mealVisual(meal.name,meal.type);return `<button class="month-meal meal-theme-${visual.theme}" data-type="${meal.type}" data-view-meal="${meal.date}|${meal.type}" title="${escapeHtml(meal.type)}: ${escapeHtml(meal.name)}"><span class="month-meal-type"><span aria-hidden="true">${TYPE_ICONS[meal.type]||"🍽️"}</span>${escapeHtml(meal.type)}</span><strong>${escapeHtml(meal.name)}</strong></button>`;}).join("")}<button class="month-add" data-add-date="${key}" data-add-type="Dinner">＋</button></div>`;
    }).join("");
    return `<div class="month-week-label"><span>Week</span><strong>${week+1}</strong></div>${days}`;
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

function ingredientShoppingId(line) {
  const item=parseIngredient(line);
  const normalized=item.name.toLowerCase().replace(/[^a-z0-9 ]/g,"").trim();
  return `${categoryFor(item.name)}|${normalized}`;
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

function youtubeVideoId(url="") {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=))([\w-]{11})/)?.[1]||null;
}

function closeRecipeDetail() {
  $("#recipeDetailDialog").close();
  viewingMealKey=null;
  $("#detailVideo").innerHTML="";
}

function renderRecipeDetail() {
  const meal=state.meals[viewingMealKey];
  if(!meal){closeRecipeDetail();return;}
  const legacyRecipe=recipeLibrary.find(item=>item.match.some(term=>meal.name.toLowerCase().includes(term)));
  if(legacyRecipe&&JSON.stringify(meal.steps||[])===JSON.stringify(legacyRecipe.steps)) {
    meal.steps=recipeFor(meal.name).steps;
    state.recipeChecks[viewingMealKey]={};
    save();
  }
  const date=parseDate(meal.date),fallbackVideo=recipeFor(meal.name).video,videoId=youtubeVideoId(meal.video)||youtubeVideoId(fallbackVideo);
  $("#detailEyebrow").textContent=`${meal.type} · ${date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}`;
  const visual=mealVisual(meal.name,meal.type);
  $("#detailMealName").textContent=meal.name;
  $("#detailMealIcon").textContent=visual.icon;
  $("#detailMealIcon").className=`detail-meal-icon meal-theme-${visual.theme}`;
  $("#detailDescription").textContent=meal.description||"A meal from your plan.";
  $("#detailMeta").innerHTML=`<span>◷ ${escapeHtml(meal.time||"Time not set")}</span><span>♙ ${meal.servings||4} servings</span><span>⌑ ${(meal.ingredients||[]).length} ingredients</span>`;
  $("#detailVideo").innerHTML=videoId
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="${escapeHtml(meal.name)} recipe video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    : `<div class="video-empty"><span>▶</span><h3>Choose a cooking video</h3><p>This recipe has a search link rather than a direct playable video.</p>${meal.video?`<a href="${escapeHtml(meal.video)}" target="_blank" rel="noopener">Find a video</a>`:""}<button type="button" data-edit-video>Add direct video link</button></div>`;
  $("#detailIngredients").innerHTML=(meal.ingredients||[]).map(line=>{
    const item=parseIngredient(line),id=ingredientShoppingId(line);
    return `<label class="detail-check-row"><input type="checkbox" data-check="${escapeHtml(id)}" ${state.checked[id]?"checked":""}><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml([item.quantity,item.unit].filter(Boolean).join(" ")||"As needed")}</small></span></label>`;
  }).join("")||`<p class="recipe-help">No ingredients added yet.</p>`;
  state.recipeChecks[viewingMealKey] ||= {};
  $("#detailSteps").innerHTML=(meal.steps||[]).map((step,index)=>`<label class="detail-step ${state.recipeChecks[viewingMealKey][index]?"done":""}"><input type="checkbox" data-step-check="${index}" ${state.recipeChecks[viewingMealKey][index]?"checked":""}><b>${index+1}</b><span>${escapeHtml(step)}</span></label>`).join("")||`<p class="recipe-help">No cooking steps added yet.</p>`;
}

function openRecipeDetail(key) {
  if(!state.meals[key])return;
  viewingMealKey=key;
  renderRecipeDetail();
  $("#recipeDetailDialog").showModal();
}

function editViewedMeal(field=null) {
  const key=viewingMealKey;
  if(!key)return;
  closeRecipeDetail();
  openMeal(null,null,key);
  if(field)setTimeout(()=>$(field).focus(),80);
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
  const base=recipeLibrary.find(item=>item.match.some(term=>name.toLowerCase().includes(term)));
  if(!base)return defaultRecipe(name);
  const detailed=detailedRecipeSteps.find(item=>item.match.some(term=>name.toLowerCase().includes(term)));
  return {...base,steps:detailed?.steps||base.steps};
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
  if(editingKey&&editingKey!==newKey){delete state.meals[editingKey];if(state.recipeChecks[editingKey]){state.recipeChecks[newKey]=state.recipeChecks[editingKey];delete state.recipeChecks[editingKey];}} state.meals[newKey]=meal; save(); $("#mealDialog").close(); renderAll(); showToast("Meal saved to your plan");
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
  keys.forEach(key=>{delete state.meals[key];delete state.recipeChecks[key];});
  save(); closeClearPlan(); renderAll();
  showToast(`${keys.length} ${keys.length===1?"meal":"meals"} deleted`);
}

function renderAll(){renderWeek();if(currentView==="month")renderMonth();if(currentView==="shopping")renderShopping();if(currentView==="insights")renderInsights();}

document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add-date]"); if(add)openMeal(add.dataset.addDate,add.dataset.addType);
  const viewMeal=event.target.closest("[data-view-meal]"); if(viewMeal)openRecipeDetail(viewMeal.dataset.viewMeal);
  const nav=event.target.closest("[data-view]"); if(nav)switchView(nav.dataset.view);
  const openView=event.target.closest("[data-open-view]"); if(openView)switchView(openView.dataset.openView);
  const scope=event.target.closest("[data-list-scope]"); if(scope){listScope=scope.dataset.listScope;$$(`[data-list-scope]`).forEach(b=>b.classList.toggle("active",b===scope));renderShopping();}
  const check=event.target.closest("[data-check]"); if(check){state.checked[check.dataset.check]=check.checked;save();renderSidebars();if(currentView==="shopping")renderShopping();}
  const editShopping=event.target.closest("[data-edit-shopping]"); if(editShopping)openShoppingItem(decodeURIComponent(editShopping.dataset.editShopping));
  const deleteShopping=event.target.closest("[data-delete-shopping]"); if(deleteShopping)deleteShoppingItem(decodeURIComponent(deleteShopping.dataset.deleteShopping));
  if(event.target.closest("[data-add-shopping]"))openShoppingItem();
  const openClear=event.target.closest("[data-open-clear-plan]"); if(openClear)openClearPlan(openClear.dataset.openClearPlan);
  const clearScope=event.target.closest("[data-clear-scope]"); if(clearScope&&!clearScope.disabled)deleteMealsByScope(clearScope.dataset.clearScope);
  if(event.target.closest("[data-edit-video]"))editViewedMeal("#mealVideo");
  const stepCheck=event.target.closest("[data-step-check]"); if(stepCheck&&viewingMealKey){state.recipeChecks[viewingMealKey][stepCheck.dataset.stepCheck]=stepCheck.checked;save();stepCheck.closest(".detail-step").classList.toggle("done",stepCheck.checked);}
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
$("#closeRecipeDetail").onclick=closeRecipeDetail; $("#closeRecipeDetailBottom").onclick=closeRecipeDetail;
$("#recipeDetailDialog").addEventListener("click",event=>{if(event.target===$("#recipeDetailDialog"))closeRecipeDetail();});
$("#recipeDetailDialog").addEventListener("close",()=>{viewingMealKey=null;$("#detailVideo").innerHTML="";});
$("#editDetailMeal").onclick=()=>editViewedMeal(); $("#editDetailIngredients").onclick=()=>editViewedMeal("#mealIngredients");
$("#deleteMeal").onclick=()=>{if(editingKey){delete state.meals[editingKey];delete state.recipeChecks[editingKey];save();$("#mealDialog").close();renderAll();showToast("Meal removed");}};
$("#menuButton").onclick=()=>$("#sidebar").classList.toggle("open");
$("#profileButton").onclick=()=>{$("#regionSelect").value=state.settings.region;$("#unitSelect").value=state.settings.units;$("#settingsDialog").showModal();if(account?.user.isAdmin)loadUsers();};
$("#saveSettings").onclick=()=>{state.settings={region:$("#regionSelect").value,units:$("#unitSelect").value};save();renderSettings();showToast("Kitchen preferences saved");};
$("#copyList").onclick=async()=>{const data=shoppingData(),text=Object.entries(data).map(([category,group])=>`${category}\n${Object.values(group).map(item=>`- ${[item.quantity,item.unit,item.name].filter(Boolean).join(" ")}`).join("\n")}`).join("\n\n");try{await navigator.clipboard.writeText(text);showToast("Shopping list copied");}catch{showToast("Copy is unavailable in this browser");}};
$("#addShoppingItem").onclick=()=>openShoppingItem(); $("#saveShoppingItem").onclick=saveShoppingItem;
$("#shoppingItemForm").addEventListener("submit",event=>{event.preventDefault();saveShoppingItem();});
$("#closeShoppingItem").onclick=closeShoppingItemDialog; $("#cancelShoppingItem").onclick=closeShoppingItemDialog;
$("#shoppingItemDialog").addEventListener("click",event=>{if(event.target===$("#shoppingItemDialog"))closeShoppingItemDialog();});
$("#closeClearPlan").onclick=closeClearPlan; $("#cancelClearPlan").onclick=closeClearPlan;
$("#clearPlanDialog").addEventListener("click",event=>{if(event.target===$("#clearPlanDialog"))closeClearPlan();});
$("#globalSearch").addEventListener("input",event=>{const q=event.target.value.trim().toLowerCase();if(!q){renderAll();return;}const matches=Object.entries(state.meals).filter(([,meal])=>meal.name.toLowerCase().includes(q)||meal.ingredients.some(i=>i.toLowerCase().includes(q)));if(currentView!=="week")switchView("week");$$('.meal-slot.filled').forEach(slot=>slot.style.opacity=".25");matches.forEach(([key])=>{const button=document.querySelector(`[data-view-meal="${key}"]`);if(button)button.closest(".meal-slot").style.opacity="1";});});
document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();$("#globalSearch").focus();}});

function renderSettings(){const units=state.settings.units==="metric"?"metric":"imperial";$("#profileRegion").textContent=`${state.settings.region} · ${units}`;}
function setAuthMode(mode){
  authMode=mode;const activating=mode==="activate";
  $("#authTitle").textContent=activating?"Choose your private password":"Log in to your kitchen";
  $("#authSubmit").textContent=activating?"Set password and log in":"Log in";
  $("#setupCodeLabel").classList.toggle("hidden",!activating);
  $("#authPassword").autocomplete=activating?"new-password":"current-password";
  $$('[data-auth-mode]').forEach(button=>button.classList.toggle("active",button.dataset.authMode===mode));
  $("#authError").textContent="";
}
function showLogin(){
  if(previewOnly){
    $("#authTitle").textContent="Connect free login";
    $("#authError").textContent="Connect the free Cloudflare Worker API to enable Rony's login and shared household data.";
  }else setAuthMode("login");
  if(!$("#authDialog").open)$("#authDialog").showModal();
}
function enterPreviewMode(){
  staticMode=true;previewOnly=true;document.body.classList.add("preview-only");
  $("#profileName").textContent="Preview mode";$("#profileRegion").textContent="Read-only · login server required";
  $("#authTitle").textContent="Connect free login";$("#authError").textContent="GitHub Pages stays free and hosts this preview. Connect the free Cloudflare Worker API once to enable Rony's login and shared household data.";
  $("#authForm").classList.add("static-preview-auth");$("#authSubmit").classList.add("hidden");$("#freeLoginSetup").classList.remove("hidden");$("#deployLogin").classList.remove("hidden");$("#previewContinue").classList.remove("hidden");
  [$("#authUsername"),$("#authPassword")].forEach(input=>input.disabled=true);
  $$('[data-auth-mode]').forEach(button=>button.disabled=true);
  if(!$("#authDialog").open)$("#authDialog").showModal();
}
function leavePreviewMode(){
  staticMode=false;previewOnly=false;document.body.classList.remove("preview-only");$("#authForm").classList.remove("static-preview-auth");
  $("#freeLoginSetup").classList.add("hidden");$("#deployLogin").classList.add("hidden");$("#previewContinue").classList.add("hidden");$("#authSubmit").classList.remove("hidden");
  [$("#authUsername"),$("#authPassword")].forEach(input=>input.disabled=false);$$('[data-auth-mode]').forEach(button=>button.disabled=false);setAuthMode("login");
}
function renderAccount(){
  if(!account)return;
  $("#profileName").textContent=account.user.name;
  $(".avatar").textContent=account.user.name.split(/\s+/).map(value=>value[0]).join("").slice(0,2).toUpperCase();
  $("#householdName").textContent=account.household.name;
  $("#accountRole").textContent=account.user.isAdmin?`@${account.user.username} · Administrator`:`@${account.user.username} · Kitchen member`;
  $("#adminPanel").classList.toggle("hidden",!account.user.isAdmin);
}
async function loadUsers(){
  if(!account?.user.isAdmin)return;
  try{
    const response=await apiFetch("/api/users",{cache:"no-store"}),data=await response.json();if(!response.ok)throw new Error(data.error);
    $("#userList").innerHTML=data.users.map(user=>`<div class="user-row"><span class="user-avatar">${escapeHtml(user.name.slice(0,1).toUpperCase())}</span><span><strong>${escapeHtml(user.name)}</strong><small>@${escapeHtml(user.username)}${user.pending?" · Password not set":""}</small></span>${user.isAdmin?"<b>Admin</b>":`<button type="button" class="user-edit" data-edit-user="${user.id}" data-user-name="${escapeHtml(user.name)}" data-username="${escapeHtml(user.username)}">Edit</button>`}</div>`).join("");
  }catch(error){showToast(error.message||"Could not load users");}
}
async function loadAccount(){
  try{
    const response=await apiFetch("/api/plan",{cache:"no-store"});
    if(response.status===404){
      enterPreviewMode();
      return;
    }
    if(!response.ok)throw new Error();
    const data=await response.json();account={user:data.user,household:data.household};state=data.state;
    state.meals||={};state.settings||={region:"Sweden",units:"metric"};state.checked||={};state.shoppingOverrides||={};state.recipeChecks||={};
    localStorage.setItem(STORE_KEY,JSON.stringify(state));renderSettings();renderAccount();renderAll();
    if($("#authDialog").open)$("#authDialog").close();
  }catch{showLogin();}
}
$$('[data-auth-mode]').forEach(button=>button.onclick=()=>setAuthMode(button.dataset.authMode));
$("#authForm").addEventListener("submit",async event=>{
  event.preventDefault();$("#authError").textContent="";$("#authSubmit").disabled=true;
  const payload={username:$("#authUsername").value.trim(),setupCode:$("#authSetupCode").value.trim(),password:$("#authPassword").value};
  try{
    const response=await apiFetch(`/api/${authMode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),data=await response.json();
    if(!response.ok)throw new Error(data.error);if(data.token){authToken=data.token;localStorage.setItem("lincy-auth-token",authToken);}await loadAccount();showToast(authMode==="activate"?"Password set. Welcome to the kitchen":"Welcome back");
  }catch(error){$("#authError").textContent=error.message||"Could not connect to the kitchen database.";}finally{$("#authSubmit").disabled=false;}
});
$("#authDialog").addEventListener("cancel",event=>event.preventDefault());
$("#previewContinue").onclick=()=>{$("#authDialog").close();};
$("#connectCloudflare").onclick=async()=>{
  const value=$("#cloudflareApiUrl").value.trim().replace(/\/$/,"");if(!/^https:\/\//.test(value)){$("#authError").textContent="Enter the HTTPS workers.dev URL from Cloudflare.";return;}
  $("#connectCloudflare").disabled=true;
  try{const response=await fetch(`${value}/api/health`,{cache:"no-store"});if(!response.ok)throw new Error();apiBase=value;localStorage.setItem("lincy-api-url",apiBase);leavePreviewMode();await loadAccount();}catch{$("#authError").textContent="That Worker URL did not respond as a Lincy login API. Check the URL and deployment.";}finally{$("#connectCloudflare").disabled=false;}
};
document.addEventListener("click",event=>{
  if(!previewOnly)return;
  const blocked=event.target.closest("[data-add-date],[data-view-meal],[data-open-clear-plan],[data-clear-scope],[data-check],[data-edit-shopping],[data-delete-shopping],[data-add-shopping],#quickAddButton,#addShoppingItem,#profileButton,#saveSettings");
  if(blocked){event.preventDefault();event.stopImmediatePropagation();showLogin();}
},true);
function closeCreateUser(){if($("#createUserDialog").open)$("#createUserDialog").close();}
function openUserForm(user=null){
  editingUserId=user?.id||null;$("#createUserForm").reset();$("#setupResult").classList.add("hidden");$("#createUserError").textContent="";$("#createUserSubmit").classList.remove("hidden");
  $("#userFormTitle").textContent=user?"Edit kitchen user":"Create kitchen user";$("#createUserSubmit").textContent=user?"Save changes":"Create user";
  $("#userFormNote").textContent=user?"Changing the name or username keeps this user's password, permissions and saved kitchen access intact.":"Lincy will generate a one-time setup code. Give the username and code to the user so they can choose their own password.";
  if(user){$("#newUserName").value=user.name;$("#newUserUsername").value=user.username;}
  $("#createUserDialog").showModal();
}
$("#openCreateUser").onclick=()=>openUserForm();
$("#userList").addEventListener("click",event=>{const button=event.target.closest("[data-edit-user]");if(button)openUserForm({id:Number(button.dataset.editUser),name:button.dataset.userName,username:button.dataset.username});});
$("#closeCreateUser").onclick=closeCreateUser;$("#cancelCreateUser").onclick=closeCreateUser;
$("#createUserForm").addEventListener("submit",async event=>{
  event.preventDefault();$("#createUserError").textContent="";$("#createUserSubmit").disabled=true;
  try{
    const payload={name:$("#newUserName").value.trim(),username:$("#newUserUsername").value.trim()},response=await apiFetch(editingUserId?`/api/users/${editingUserId}`:"/api/users",{method:editingUserId?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),data=await response.json();if(!response.ok)throw new Error(data.error);
    if(editingUserId){closeCreateUser();showToast(`User renamed to ${data.user.name}`);}else{$("#createdUsername").textContent=`Username: ${data.user.username}`;$("#createdSetupCode").textContent=`Setup code: ${data.setupCode}`;$("#setupResult").classList.remove("hidden");$("#createUserSubmit").classList.add("hidden");}loadUsers();
  }catch(error){$("#createUserError").textContent=error.message||"Could not create user.";}finally{$("#createUserSubmit").disabled=false;}
});
function closePasswordDialog(){if($("#passwordDialog").open)$("#passwordDialog").close();}
$("#changePasswordButton").onclick=()=>{if(staticMode){showToast("Accounts are available on the hosted server version");return;}$("#passwordForm").reset();$("#passwordError").textContent="";$("#passwordDialog").showModal();};
$("#closePasswordDialog").onclick=closePasswordDialog;$("#cancelPassword").onclick=closePasswordDialog;
$("#passwordForm").addEventListener("submit",async event=>{
  event.preventDefault();$("#passwordError").textContent="";
  try{const response=await apiFetch("/api/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:$("#currentPassword").value,newPassword:$("#newPassword").value})}),data=await response.json();if(!response.ok)throw new Error(data.error);closePasswordDialog();showToast("Password updated");}catch(error){$("#passwordError").textContent=error.message||"Could not change password.";}
});
$("#logoutButton").onclick=async()=>{await apiFetch("/api/logout",{method:"POST"}).catch(()=>{});authToken="";localStorage.removeItem("lincy-auth-token");account=null;$("#settingsDialog").close();setAuthMode("login");$("#authDialog").showModal();};
window.addEventListener("focus",()=>{if(account&&!syncTimer)loadAccount();});
renderSettings(); renderWeek(); loadAccount();
if("serviceWorker" in navigator){
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(sessionStorage.getItem("lincy-worker-reloaded")==="21")return;
    sessionStorage.setItem("lincy-worker-reloaded","21");
    window.location.reload();
  });
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=21",{updateViaCache:"none"}).then(registration=>registration.update()).catch(()=>{}));
}
