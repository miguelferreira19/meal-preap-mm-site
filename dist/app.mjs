import {INGREDIENTS, RECIPES, STORES, EQUIPMENT, DEFAULT_SETTINGS, PROTEINS, recipeProtein} from './data.mjs';
import recipeImages from './recipe-images.mjs';
import {CREATORS} from './creator-recipes.mjs';
import {SNAPSHOT_ONLY} from './runtime-config.mjs';
import {fetchPriceCatalogue} from './price-client.mjs';
import {eligibleRecipes, recipeCostCents, buildBasket, generatePlan, replaceMeal} from './engine.mjs';

const $ = s => document.querySelector(s);
const money = cents => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(cents/100);
const num = value => new Intl.NumberFormat('pt-PT',{maximumFractionDigits:2}).format(value);
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = value => JSON.parse(JSON.stringify(value));
const icons = {
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-12 4h2m3 0h2m-7 3h2"/>',
  book:'<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15M5 8h3m-3 4h3m8-4h3m-3 4h3"/>',
  basket:'<path d="m5 10 4-7m10 7-4-7M2 10h20l-3 11H5L2 10Zm7 4v3m6-3v3"/>',
  users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-2-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  refresh:'<path d="M20 9a8 8 0 0 0-14-4L3 8m0-5v5h5m-4 7a8 8 0 0 0 14 4l3-3m0 5v-5h-5"/>',
  heart:'<path d="M20.5 4.5a5 5 0 0 0-7 0L12 6l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-9.5a5 5 0 0 0 0-7Z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="white"/><circle cx="16" cy="17" r="3" fill="white"/>',
  leaf:'<path d="M20 3c-8 0-15 3-15 10a6 6 0 0 0 6 6c7 0 9-8 9-16ZM4 21 15 10"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon:'<path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z"/>',
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-1v4m-2-2h4"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/>',
  left:'<path d="m15 5-7 7 7 7"/>',
  right:'<path d="m9 5 7 7-7 7"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  print:'<path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 15h12v7H6V15Zm11-3h1"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.info}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));

const logoFiles = {'continente':'continente.svg','auchan':'auchan.png','pingo-doce':'pingo-doce.svg','lidl':'lidl.png','aldi':'aldi.png','mercadona':'mercadona.png'};
const storeName = id => STORES.find(s=>s.id===id)?.name||id;
const logo = (id,cls='') => `<img class="${cls}" src="assets/${logoFiles[id]||'icon.svg'}" alt="${escape(storeName(id))}" width="64" height="32">`;
const recipeById = new Map(RECIPES.map(r=>[r.id,r]));
const allergens = {gluten:'Glúten',milk:'Leite',egg:'Ovo',fish:'Peixe',nuts:'Frutos de casca rija',soy:'Soja',shellfish:'Crustáceos',mustard:'Mostarda'};
const connectedStores=['continente','auchan','pingo-doce','lidl'];
const proteinName = r => PROTEINS.find(p=>p.id===recipeProtein(r))?.name||'';
const photo = r => recipeImages[r.id]||{src:`assets/${r.image}.jpg`,alt:`Fotografia ilustrativa de ${r.name}`};
const creatorFor = r => CREATORS.find(c=>c.id===r.source?.creator);
const creatorAvatar = c => `<span class="creator-avatar" data-person="${escape(c.id)}"><img src="${escape(c.portrait)}" alt="Fotografia de ${escape(c.personName)}" width="40" height="40" loading="lazy"></span>`;
const creatorCredit = r => {const c=creatorFor(r);return c?`<a class="creator-credit" href="${escape(safeURL(c.profile))}" target="_blank" rel="noopener noreferrer" aria-label="Perfil de ${escape(c.personName)}">${creatorAvatar(c)}<span><strong>${escape(c.personName)}</strong><small>${c.name!==c.personName?escape(c.name)+' · ':''}Receita adaptada</small></span></a>`:'';};
const equipmentName = id => EQUIPMENT.find(e=>e.id===id)?.name||id;
let saved={};
try { saved=JSON.parse(localStorage.getItem('a-mesa-v1')||'{}'); } catch {}
let settings={...clone(DEFAULT_SETTINGS),...pickPreferences(saved.settings||{})};
let creatorOnly=true, creatorFilter='';
let plan=null, view='plan', detailId=null, previousView='plan', search='', favouriteFilter=false, dirty=false;
let priceData=null, priceLoading=false, requestId=0, generating=false, toastTimer;
const favourites = new Set(Array.isArray(saved.favourites)?saved.favourites.filter(id=>recipeById.has(id)):[]);
let checked = new Set(Array.isArray(saved.checked)?saved.checked.filter(id=>INGREDIENTS[id]):[]);
let weekStart = validDate(saved.weekStart)?saved.weekStart:nextMonday();
const locked = new Set();

function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(new Date(s+'T12:00:00').valueOf());}
function nextMonday(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+((8-d.getDay())%7||7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function pickPreferences(v){
  const out={};for(const k of ['people','budget','store','days','meals','equipment','exclude','maxMinutes','proteins'])if(v[k]!==undefined&&typeof v[k]===typeof DEFAULT_SETTINGS[k]&&Array.isArray(v[k])===Array.isArray(DEFAULT_SETTINGS[k]))out[k]=v[k];
  for(const [k,valid]of [['meals',id=>['lunch','dinner'].includes(id)],['equipment',id=>EQUIPMENT.some(e=>e.id===id)],['exclude',id=>INGREDIENTS[id]||Object.hasOwn(allergens,id)],['proteins',id=>PROTEINS.some(p=>p.id===id)]])if(out[k])out[k]=[...new Set(out[k].filter(valid))];
  if(out.store&&!STORES.some(s=>s.id===out.store))delete out.store;
  out.diet='all';out.pantry=[];out.pantryQuantities={};
  if(v.pantryQuantities&&typeof v.pantryQuantities==='object'&&!Array.isArray(v.pantryQuantities))for(const [id,q]of Object.entries(v.pantryQuantities))if(INGREDIENTS[id]&&Number.isFinite(q)&&q>0)out.pantryQuantities[id]=q;
  return out;
}
function save(){try{localStorage.setItem('a-mesa-v1',JSON.stringify({recipeCatalogueVersion:2,settings:pickPreferences(settings),favourites:[...favourites],checked:[...checked],locked:[...locked],weekStart,slots:plan?.ok?plan.slots:null}));}catch{toast('O navegador não permitiu guardar o plano. Podes continuar a usar a app.');}}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function dateFor(day){const d=new Date(weekStart+'T12:00:00');d.setDate(d.getDate()+day);return d;}
function weekLabel(){return `${dateFor(0).toLocaleDateString('pt-PT',{day:'numeric',month:'short'})} — ${dateFor((plan?.ok?plan.settings.days:settings.days)-1).toLocaleDateString('pt-PT',{day:'numeric',month:'short'})}`;}
function quantity(q,unit){return unit==='g'&&q>=1000?`${num(q/1000)} kg`:unit==='ml'&&q>=1000?`${num(q/1000)} l`:`${num(q)} ${unit}`;}
function timestamp(iso){const d=new Date(iso);return Number.isNaN(d.valueOf())?'data indisponível':d.toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Lisbon'});}
function safeURL(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:'#';}catch{return '#';}}
function productsMap(){return new Map((priceData?.products||[]).map(p=>[p.ingredientId,p]));}
function isPriced(recipe){return recipe.ingredients.every(i=>settings.pantry.includes(i.id)||Number.isInteger(settings.prices[i.id])&&settings.prices[i.id]>0);}
function pricesExpired(){return !(priceData?.products?.length)||priceData.products.some(p=>Date.now()-Date.parse(p.checkedAt)>=86400000||p.validUntil&&Date.parse(p.validUntil)<=Date.now());}

function initForm(){
  for(const key of ['people','budget','days','maxMinutes']){if($('#'+key))$('#'+key).value=settings[key];}
  document.querySelectorAll('[name=meal]').forEach(el=>el.checked=Array.isArray(settings.meals)&&settings.meals.includes(el.value));
  $('#store-options').innerHTML=STORES.map(s=>`<button class="store-option ${connectedStores.includes(s.id)?'':'unconnected'}" type="button" data-store="${s.id}" aria-label="${escape(s.name)}${connectedStores.includes(s.id)?'':' — sem ligação de preços'}" title="${escape(s.name)}${connectedStores.includes(s.id)?'':' · Sem ligação de preços'}" aria-pressed="${settings.store===s.id}">${logo(s.id)}</button>`).join('');
  $('#equipment-options').innerHTML=EQUIPMENT.map(e=>`<button type="button" class="chip" data-equipment="${e.id}" aria-pressed="${settings.equipment.includes(e.id)}">${settings.equipment.includes(e.id)?icon('check'):''}${escape(e.name)}</button>`).join('');
  $('#allergen-options').innerHTML=Object.entries(allergens).map(([id,name])=>`<button type="button" class="chip" data-exclude="${id}" aria-pressed="${settings.exclude.includes(id)}">${settings.exclude.includes(id)?icon('check'):''}${name}</button>`).join('');
  $('#protein-options').innerHTML=PROTEINS.map(p=>`<button type="button" class="protein-choice" data-protein="${p.id}" aria-pressed="${settings.proteins.includes(p.id)}">${icon(settings.proteins.includes(p.id)?'check':'users')}<span>${p.name}</span></button>`).join('');
  renderIngredients('avoid');renderIngredients('pantry');
  updatePeopleLabel();
}
function renderIngredients(kind){
  const selected=kind==='avoid'?settings.exclude.filter(id=>INGREDIENTS[id]):Object.keys(settings.pantryQuantities);
  const term=$('#'+kind+'-search').value.toLocaleLowerCase('pt-PT').normalize('NFD').replace(/\p{Diacritic}/gu,'');
  const ingredients=Object.values(INGREDIENTS).sort((a,b)=>a.name.localeCompare(b.name,'pt-PT')).filter(i=>i.name.toLocaleLowerCase('pt-PT').normalize('NFD').replace(/\p{Diacritic}/gu,'').includes(term));
  $('#'+kind+'-options').innerHTML=ingredients.length?ingredients.map(i=>`<label class="ingredient-option"><input type="checkbox" data-ingredient-kind="${kind}" value="${i.id}" ${selected.includes(i.id)?'checked':''}><span>${escape(i.name)}</span>${icon('check')}</label>`).join(''):'<p class="field-note">Não encontrámos esse ingrediente.</p>';
  $('#'+kind+'-selected').innerHTML=kind==='avoid'?selected.map(id=>`<button type="button" class="chip" data-remove-avoid="${id}" aria-label="Voltar a incluir ${escape(INGREDIENTS[id].name)}">${escape(INGREDIENTS[id].name)} <span aria-hidden="true">×</span></button>`).join(''):selected.map(id=>`<div class="pantry-quantity"><label for="stock-${id}">${escape(INGREDIENTS[id].name)}</label><div><input id="stock-${id}" data-stock="${id}" type="number" min="0" max="100000" step="${INGREDIENTS[id].unit==='un'?1:0.001}" value="${settings.pantryQuantities[id]}" aria-label="Quantidade disponível de ${escape(INGREDIENTS[id].name)}"><span>${INGREDIENTS[id].unit}</span><button class="icon-button" type="button" data-remove-pantry="${id}" aria-label="Retirar ${escape(INGREDIENTS[id].name)} da despensa">×</button></div></div>`).join('');
}
function settingsTab(id){document.querySelectorAll('[data-settings-page]').forEach(p=>p.hidden=p.dataset.settingsPage!==id);document.querySelectorAll('[role=tab]').forEach(b=>{const active=b.dataset.settingsTab===id;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});}
function updatePeopleLabel(){$('#people-label').textContent=Number($('#people').value)===1?'pessoa':'pessoas';}
function readForm(){
  settings.people=Number($('#people').value);settings.budget=Number($('#budget').value);settings.days=Number($('#days').value);settings.maxMinutes=Number($('#maxMinutes').value);settings.diet='all';
  settings.meals=[...document.querySelectorAll('[name=meal]:checked')].map(e=>e.value);
  settings.pantry=[];
  updatePeopleLabel();
}
function markDirty(){dirty=true;save();render();}
function setBusy(){const b=$('#generate-plan');b.disabled=priceLoading||generating;b.innerHTML=priceLoading?'<span class="spinner" style="width:16px;height:16px;border-width:2px"></span><span>À procura dos preços…</span>':generating?'<span class="spinner" style="width:16px;height:16px;border-width:2px"></span><span>A combinar as receitas…</span>':`${icon('spark')}<span>${plan?.ok?'Atualizar o meu plano':'Criar o meu plano'}</span>${icon('arrow')}`;}

async function loadPrices({autoGenerate=false}={}){
  const rid=++requestId;const store=settings.store;priceLoading=true;priceData=null;settings.prices={};settings.packQuantities={};settings.purchaseRules={};settings.priceStatus='unavailable';setBusy();render();
  try{
    const data=await fetchPriceCatalogue(store,{snapshotOnly:SNAPSHOT_ONLY});if(rid!==requestId)return;
    if(data.store&&data.store!==store)throw new Error('A resposta de preços pertence a outro supermercado.');
    priceData=data;
    const fresh=(data.products||[]).filter(p=>p.store===store&&INGREDIENTS[p.ingredientId]&&Number.isInteger(p.priceCents)&&p.priceCents>0&&p.packQuantity>0&&p.unit===INGREDIENTS[p.ingredientId].unit&&safeURL(p.url)!=='#'&&Date.now()-Date.parse(p.checkedAt)<86400000&&Date.parse(p.checkedAt)<=Date.now()+300000&&(!p.validUntil||Date.parse(p.validUntil)>Date.now()));
    priceData.products=fresh;
    if(fresh.length){for(const p of fresh){settings.prices[p.ingredientId]=p.priceCents;settings.packQuantities[p.ingredientId]=p.packQuantity;if(p.soldByWeight)settings.purchaseRules[p.ingredientId]={soldByWeight:true,minPurchaseQuantity:p.minPurchaseQuantity||p.packQuantity,purchaseStepQuantity:p.purchaseStepQuantity||p.packQuantity};}settings.priceStatus='verified';}
    else settings.priceStatus='unavailable';
  }catch(error){if(rid!==requestId)return;priceData={store,status:'unavailable',products:[],message:error.name==='TimeoutError'?'O supermercado demorou demasiado a responder. Tenta atualizar os preços.':'Não foi possível obter os preços. Verifica a ligação e tenta novamente.'};}
  finally{if(rid===requestId){priceLoading=false;setBusy();render();if(autoGenerate&&settings.priceStatus==='verified'){const restored=restorePlan();if(!restored||saved.recipeCatalogueVersion!==2)await createPlan();}}}
}

function restorePlan(){
  if(!Array.isArray(saved.slots)||saved.slots.length!==settings.days*settings.meals.length)return false;
  try{
    const eligible=new Set(eligibleRecipes(settings).filter(isPriced).map(r=>r.id));const keys=new Set();
    for(const slot of saved.slots){if(!slot||!Number.isInteger(slot.day)||slot.day<0||slot.day>=settings.days||!settings.meals.includes(slot.meal)||!eligible.has(slot.recipeId)||keys.has(`${slot.day}/${slot.meal}`))return false;keys.add(`${slot.day}/${slot.meal}`);}
    const basket=buildBasket(saved.slots,settings);if(basket.totalCents>Math.round(settings.budget*100))return false;
    plan={ok:true,slots:clone(saved.slots),shopping:basket.items,totalCents:basket.totalCents,settings:clone(settings),eligibleCount:eligible.size};
    for(const i of saved.locked||[])if(Number.isInteger(i)&&i>=0&&i<plan.slots.length)locked.add(i);
    dirty=false;render();if(innerWidth<=760){$('#settings-form').dataset.collapsed='true';$('.settings-heading').setAttribute('aria-expanded','false');}return true;
  }catch{return false;}
}

async function createPlan(){
  const invalid=$('#settings-form :invalid');if(invalid?.closest('[data-settings-page]'))settingsTab(invalid.closest('[data-settings-page]').dataset.settingsPage);
  if(!$('#settings-form').reportValidity())return;readForm();
  if(!settings.meals.length){settingsTab('plan');toast('Seleciona pelo menos almoços ou jantares.');return;}
  if(!settings.proteins.length){settingsTab('tastes');toast('Escolhe pelo menos uma proteína principal.');return;}
  if(priceLoading)return;
  if(settings.priceStatus==='verified'&&pricesExpired())await loadPrices();
  if(settings.priceStatus!=='verified'){view='plan';render();toast('Precisamos dos preços deste supermercado para calcular o plano.');return;}
  generating=true;setBusy();await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,35)));
  try{const lockedSlots=plan?.ok?[...locked].map(i=>plan.slots[i]).filter(Boolean):[];const next=generatePlan(clone(settings),{seed:Date.now(),lockedSlots});plan=next;dirty=false;checked.clear();locked.clear();if(plan.ok)for(let i=0;i<plan.slots.length;i++)if(lockedSlots.some(s=>s.day===plan.slots[i].day&&s.meal===plan.slots[i].meal))locked.add(i);view='plan';detailId=null;save();render();if(plan.ok&&innerWidth<=760){$('#settings-form').dataset.collapsed='true';$('.settings-heading').setAttribute('aria-expanded','false');$('#workspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}}
  catch(error){plan={ok:false,reason:'Não foi possível calcular este plano. Confirma os dados e tenta novamente.'};render();console.error(error);}
  finally{generating=false;setBusy();}
}
function navigate(target){view=target;detailId=null;render();if(innerWidth<=760)$('#workspace').scrollIntoView({behavior:'instant',block:'start'});}
function badge(){return `<div class="store-badge">${logo(settings.store)}Planeado para ${escape(storeName(settings.store))}</div>`;}
function priceNotice(){const date=priceData?.checkedAt||priceData?.products?.[0]?.checkedAt;return `<div class="price-notice">${icon('info')}<span>Preços ${escape(storeName(settings.store))} consultados ${timestamp(date)}. ${priceData?.mode==='scheduled'?'Recolha automática no GitHub, prevista de 6 em 6 horas. ':priceData?.mode==='snapshot'?'Última recolha guardada; atualização em direto indisponível. ':''}${priceData?.retainedCount?'Alguns produtos mantêm a recolha anterior; consulta as datas individuais. ':''}${settings.store==='lidl'?'Catálogo parcial: apenas ofertas públicas válidas. ':''}Sem portes ou descontos de cartão. <button data-action="sources">Ver fontes e produtos</button></span></div>`;}
function pending(){return dirty?`<div class="pending-banner">${icon('info')}<span>Alteraste as preferências. Carrega em <strong>Atualizar o meu plano</strong> para recalcular as refeições e as compras.</span></div>`:'';}
function heading(title,subtitle,action=''){return `<div class="workspace-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;}
function footer(){return `<p class="page-footer">Feito para a nossa semana. Sem subscrições.<br><button data-action="sources">Como são obtidos os preços</button> · As fotografias das receitas são ilustrativas.</p>`;}
function render(){
  $('#workspace').setAttribute('aria-busy',String(priceLoading));
  document.querySelectorAll('[data-nav]').forEach(el=>{if(el.dataset.nav===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  const count=plan?.ok?plan.shopping.filter(i=>!i.pantry).length:0;$('#shopping-count').hidden=!count;$('#shopping-count').textContent=count;
  if(detailId){renderDetail();return;}
  if(view==='recipes'){renderRecipes();return;}
  if(view==='sources'){renderSources();return;}
  if(view==='shopping'){renderShopping();return;}
  renderPlan();
}
function renderPlan(){
  if(priceLoading){$('#workspace').innerHTML=heading('A tua semana à mesa.','Almoços e jantares pensados para ti.')+`<div class="loading-state"><span class="spinner"></span><h2>A consultar o ${escape(storeName(settings.store))}</h2><p>Estamos a identificar preços, produtos e embalagens. Esta consulta pode demorar alguns segundos.</p></div>`;return;}
  if(settings.priceStatus!=='verified'){$('#workspace').innerHTML=heading('A tua semana à mesa.','Um plano que respeita as tuas escolhas.')+badge()+`<div class="empty-state">${icon('basket')}<h2>Faltam os preços desta loja</h2><p>${escape(priceData?.message||'Ainda não existe uma ligação verificável a este supermercado. Escolhe outra loja ou atualiza os preços para tentar novamente.')}</p><button class="button primary" data-action="refresh-prices">${icon('refresh')}Atualizar preços</button></div>`+footer();return;}
  if(!plan){$('#workspace').innerHTML=heading('A tua semana à mesa.','Menos decisões. Mais refeições de que gostas.')+badge()+priceNotice()+`<div class="empty-state">${icon('calendar')}<h2>O que vamos cozinhar?</h2><p>Define as pessoas, o orçamento e a tua cozinha. A lista de compras fica feita com o plano.</p><button class="button primary" data-action="generate">Criar o meu plano${icon('arrow')}</button></div>`;return;}
  if(!plan.ok){$('#workspace').innerHTML=heading('Vamos ajustar o plano.','Todas as tuas restrições contam.')+badge()+pending()+`<div class="empty-state">${icon('info')}<h2>Não encontrámos uma combinação</h2><p>${escape(plan.reason||'Experimenta um orçamento maior, menos refeições ou mais utensílios.')}</p><p>O motor procura várias combinações; uma tentativa sem resultado não prova que seja impossível.</p><button class="button" data-action="generate">${icon('refresh')}Procurar outra combinação</button></div>`+priceNotice()+footer();return;}
  const active=plan.settings||settings;const purchased=plan.shopping.filter(i=>!i.pantry);const done=purchased.filter(i=>checked.has(i.id)).length;
  const summary=`<div class="overview"><div class="overview-card"><div class="overview-label">Total das compras</div><div class="cost">${money(plan.totalCents)} <small>/ ${money(Math.round(active.budget*100))}</small></div><p>${money(Math.round(active.budget*100)-plan.totalCents)} disponíveis</p><progress class="budget-progress" value="${plan.totalCents}" max="${Math.round(active.budget*100)}" aria-label="Parte do orçamento utilizada"></progress></div><button class="overview-card shopping-summary" data-action="shopping">${icon('external')}<h2>Compras</h2><p>${done}/${purchased.length} produtos comprados</p><progress class="shopping-progress" value="${done}" max="${Math.max(purchased.length,1)}" aria-label="Progresso das compras"></progress></button></div>`;
  const days=Array.from({length:active.days},(_,day)=>{
    const d=dateFor(day);const label=d.toLocaleDateString('pt-PT',{weekday:'long'});
    return `<section class="day-block" aria-label="${escape(label)}"><h2 class="day-label"><span>${escape(label)} · ${d.getDate()}</span></h2>${plan.slots.map((s,index)=>s.day===day?mealCard(s,index,active):'').join('')}</section>`;
  }).join('');
  $('#workspace').innerHTML=heading('O teu plano está pronto.',`${active.people} ${active.people===1?'pessoa':'pessoas'} · ${plan.slots.length} refeições para a semana.`,`<button class="icon-button" data-action="print" aria-label="Imprimir o plano" title="Imprimir">${icon('print')}</button>`)+badge()+pending()+summary+priceNotice()+`<div class="week-toolbar"><h2>${weekLabel()}</h2><div class="week-controls"><button class="icon-button" data-action="previous-week" aria-label="Semana anterior">${icon('left')}</button><button class="icon-button" data-action="next-week" aria-label="Semana seguinte">${icon('right')}</button></div></div>`+(plan.note?`<div class="notice-box">${icon('info')}<span>${escape(plan.note)}</span></div>`:'')+days+footer();
}
function mealCard(slot,index,active){
  const r=recipeById.get(slot.recipeId);if(!r)return '';
  let cost='';try{cost=money(recipeCostCents(r,active));}catch{}
  const tag=proteinName(r);
  return `<article class="meal-card"><button class="meal-photo-button" data-recipe="${r.id}" aria-label="Ver receita de ${escape(r.name)}"><img src="${escape(photo(r).src)}" alt="${escape(photo(r).alt)}" loading="lazy" width="111" height="111"></button><div class="meal-copy"><div class="meal-slot">${slot.meal==='lunch'?'Almoço':'Jantar'}</div><button class="recipe-title-button" data-recipe="${r.id}">${escape(r.name)}</button>${creatorCredit(r)}<span class="recipe-tag ${r.diet}">${icon('check')}${tag}</span><div class="meal-meta"><span>${icon('clock')}${r.minutes} min</span><span>${icon('users')}${active.people}</span>${cost?`<span title="Custo dos ingredientes usados; as compras incluem as embalagens completas">${cost}</span>`:''}</div></div><div class="meal-actions"><button data-favourite="${r.id}" class="${favourites.has(r.id)?'is-favourite':''}" aria-label="${favourites.has(r.id)?'Retirar dos':'Guardar nos'} favoritos: ${escape(r.name)}" aria-pressed="${favourites.has(r.id)}">${icon('heart')}</button><button data-swap="${index}" aria-label="Trocar ${escape(r.name)}" title="Trocar esta refeição" ${dirty?'disabled':''}>${icon('refresh')}</button><button data-lock="${index}" aria-label="${locked.has(index)?'Desbloquear':'Manter'} ${escape(r.name)}" aria-pressed="${locked.has(index)}" title="Manter esta receita" style="color:${locked.has(index)?'var(--blue)':'inherit'}">${icon('lock')}</button></div></article>`;
}

function renderRecipes(){
  const candidates=eligibleRecipes(settings).filter(r=>(!creatorOnly||r.source)&&(!creatorFilter||r.source?.creator===creatorFilter)&&(!favouriteFilter||favourites.has(r.id))&&(!search||`${r.name} ${creatorFor(r)?.name||''} ${creatorFor(r)?.personName||''} ${r.ingredients.map(i=>INGREDIENTS[i.id]?.name).join(' ')}`.toLocaleLowerCase('pt').includes(search.toLocaleLowerCase('pt'))));
  const filters=`<div class="recipe-filters"><button class="chip" data-action="creator-recipes" aria-pressed="${creatorOnly}">De criadores</button><button class="chip" data-action="all-recipes" aria-pressed="${!creatorOnly&&!favouriteFilter}">Todas</button><button class="chip" data-action="favourite-recipes" aria-pressed="${favouriteFilter}">${icon('heart')}Favoritas</button><span>${candidates.length} receitas</span></div>${creatorOnly?`<div class="creator-filters" role="group" aria-label="Filtrar por criador"><button class="chip" data-creator="all" aria-pressed="${!creatorFilter}">Todos os criadores</button>${CREATORS.map(c=>`<button class="chip" data-creator="${c.id}" aria-pressed="${creatorFilter===c.id}">${creatorAvatar(c)}${escape(c.name)}</button>`).join('')}</div>`:''}`;
  $('#workspace').innerHTML=heading('Criadores à tua mesa.','Receitas públicas, adaptadas às tuas doses e à tua cozinha.')+`<label class="search-input">${icon('search')}<input id="recipe-search" placeholder="Procurar receita, criador ou ingrediente" value="${escape(search)}" aria-label="Procurar receita, criador ou ingrediente"></label>`+filters+(candidates.length?`<div class="recipe-grid">${candidates.map(r=>`<article class="catalog-card"><button class="catalog-photo" data-recipe="${r.id}" aria-label="Ver ${escape(r.name)}"><img src="${escape(photo(r).src)}" alt="${escape(photo(r).alt)}" loading="lazy" width="400" height="240"></button><button class="icon-button ${favourites.has(r.id)?'is-favourite':''}" data-favourite="${r.id}" aria-label="Guardar ou retirar ${escape(r.name)} dos favoritos" aria-pressed="${favourites.has(r.id)}">${icon('heart')}</button><div class="catalog-copy"><button class="recipe-title-button" data-recipe="${r.id}">${escape(r.name)}</button>${creatorCredit(r)}<div class="meal-meta"><span>${icon('clock')}${r.minutes} min</span><span>${proteinName(r)}</span></div>${isPriced(r)?'':'<p class="catalog-unpriced">Preço completo ainda indisponível nesta loja.</p>'}</div></article>`).join('')}</div>`:`<div class="empty-state">${icon(favouriteFilter?'heart':'search')}<h2>${favouriteFilter?'Ainda não há favoritas aqui':'Nenhuma receita encontrada'}</h2><p>${favouriteFilter?'Guarda as receitas de que mais gostas no coração de cada receita.':'Experimenta outro criador, outra pesquisa ou revê os filtros da cozinha.'}</p><button class="button" data-action="all-recipes">Ver todas as receitas compatíveis</button></div>`)+footer();
}
function renderDetail(){
  const r=recipeById.get(detailId);if(!r){detailId=null;render();return;}
  const active=plan?.ok&&plan.slots.some(s=>s.recipeId===r.id)&&!dirty?plan.settings:settings;
  let cost='';try{cost=money(recipeCostCents(r,active));}catch{}
  $('#workspace').innerHTML=`<article class="recipe-detail"><div class="detail-cover"><img src="${escape(photo(r).src)}" alt="${escape(photo(r).alt)}" width="900" height="500"><button class="button" data-action="back">${icon('left')}Voltar</button></div><div class="detail-body"><div style="display:flex;justify-content:space-between;gap:16px"><h1>${escape(r.name)}</h1><button class="icon-button ${favourites.has(r.id)?'is-favourite':''}" data-favourite="${r.id}" aria-label="Guardar ou retirar dos favoritos" aria-pressed="${favourites.has(r.id)}">${icon('heart')}</button></div><p>${escape(r.description)}</p>${r.source?`<div class="creator-source"><h2>Adaptação de ${escape(creatorFor(r)?.name||r.source.credit)}</h2>${creatorCredit(r)}<p>${escape(r.source.adaptation)}</p><a href="${escape(safeURL(r.source.url))}" target="_blank" rel="noopener noreferrer">Ver receita original ${icon('external')}</a><p class="source-byline">${escape(r.source.credit)}${r.source.publishedAt?' · Publicada em '+new Date(r.source.publishedAt+'T12:00:00').toLocaleDateString('pt-PT'):''} · Fonte consultada em 20/10/2026</p></div>`:''}<div class="meal-meta"><span>${icon('clock')}${r.minutes} min</span><span>${icon('users')}${active.people} ${active.people===1?'pessoa':'pessoas'}</span>${cost?`<span>${cost} em ingredientes</span>`:''}</div><p class="detail-note">Fotografia ilustrativa. ${photo(r).credit?`<a href="${escape(safeURL(photo(r).sourceURL))}" target="_blank" rel="noopener noreferrer">${escape(photo(r).credit)}</a> · <a href="${escape(safeURL(photo(r).licenceURL))}" target="_blank" rel="noopener noreferrer">${escape(photo(r).licence)}</a>. `:''}O custo indicado desconta a despensa e difere do total das embalagens a comprar.</p><div class="equipment-line">${icon('settings')}Vais precisar de: ${r.equipment.map(id=>`<span class="chip">${escape(equipmentName(id))}</span>`).join('')}</div><div class="recipe-content"><section><h2>Ingredientes</h2><ul class="ingredient-list">${r.ingredients.map(i=>`<li><span>${escape(INGREDIENTS[i.id].name)}</span><strong>${quantity(i.quantity*active.people,INGREDIENTS[i.id].unit)}</strong></li>`).join('')}</ul></section><section><h2>Vamos cozinhar</h2><ol class="steps-list">${r.steps.map(step=>`<li>${escape(step)}</li>`).join('')}</ol></section></div></div></article>`+footer();
}

function renderShopping(){
  if(dirty){$('#workspace').innerHTML=heading('A tua lista de compras.','Tudo o que precisas, sem duplicados.')+pending()+`<div class="empty-state">${icon('basket')}<h2>Vamos recalcular as compras</h2><p>As preferências mudaram. Atualiza o plano para obter uma lista correspondente.</p><button class="button primary" data-action="generate">Atualizar o meu plano</button></div>`;return;}
  if(!plan?.ok){$('#workspace').innerHTML=heading('A tua lista de compras.','A lista nasce das refeições que vais cozinhar.')+`<div class="empty-state">${icon('basket')}<h2>Primeiro, vamos fazer o plano</h2><p>Depois juntamos os ingredientes, calculamos as embalagens e organizamos as compras.</p><button class="button primary" data-action="plan">Ir para o plano${icon('arrow')}</button></div>`;return;}
  const ps=productsMap(),items=plan.shopping.filter(i=>!i.pantry),done=items.filter(i=>checked.has(i.id)).length;
  const categories=[...new Set(items.map(i=>INGREDIENTS[i.id].category))];
  $('#workspace').innerHTML=heading('Tudo para pôr a mesa.',`${items.length} produtos · ${done} já no carrinho · ${storeName(settings.store)}`)+badge()+priceNotice()+`<div class="shopping-toolbar"><button class="button" data-action="copy-shopping">${icon('book')}Copiar lista</button><button class="button" data-action="download-shopping">${icon('download')}Descarregar</button><button class="button" data-action="print">${icon('print')}Imprimir</button><button class="button subtle" data-action="clear-checked">Desmarcar todos</button></div>`+categories.map(category=>`<section><h2 class="shopping-category">${escape(category)}</h2><ul class="shopping-list">${items.filter(i=>INGREDIENTS[i.id].category===category).map(i=>{const p=ps.get(i.id);const ing=INGREDIENTS[i.id];const purchased=i.purchaseQuantity??i.packs*i.packQuantity;return `<li class="shopping-item ${checked.has(i.id)?'is-checked':''}"><input type="checkbox" data-check="${i.id}" ${checked.has(i.id)?'checked':''} aria-label="Marcar ${escape(ing.name)} como comprado"><div class="shopping-info"><h3>${escape(ing.name)}</h3><p>${i.soldByWeight?`Comprar ${quantity(purchased,ing.unit)} ao peso`:`${num(i.packs)} × ${quantity(i.packQuantity,ing.unit)}`} · Usas ${quantity(i.quantity,ing.unit)}${i.pantryQuantityUsed?` · ${quantity(i.pantryQuantityUsed,ing.unit)} da despensa`:''}</p>${p?`<a class="product-source" href="${escape(safeURL(p.url))}" target="_blank" rel="noopener noreferrer">${escape(p.productName)} ${icon('external')}</a><p>${money(p.priceCents)} / ${quantity(p.packQuantity,p.unit)} · ${timestamp(p.checkedAt)}</p>`:'<p>Fonte indisponível</p>'}</div><strong class="shopping-price">${money(i.totalCents)}</strong></li>`;}).join('')}</ul></section>`).join('')+`<div class="shopping-total"><span>Total das compras</span><strong>${money(plan.totalCents)}</strong></div>`+(plan.shopping.some(i=>i.pantry)?`<div class="notice-box" style="margin-top:17px">${icon('check')}<span>Da tua despensa: ${plan.shopping.filter(i=>i.pantry).map(i=>escape(INGREDIENTS[i.id].name)).join(', ')}. Não entram no total.</span></div>`:'')+footer();
}
function shoppingText(){if(!plan?.ok)return '';const ps=productsMap();return `Meal Preap M&M — ${storeName(settings.store)}\n${weekLabel()} · ${plan.settings.people} pessoas\n\n`+plan.shopping.filter(i=>!i.pantry).map(i=>{const p=ps.get(i.id);return `${checked.has(i.id)?'[x]':'[ ]'} ${INGREDIENTS[i.id].name}: ${i.soldByWeight?quantity(i.purchaseQuantity,INGREDIENTS[i.id].unit):`${i.packs} × ${quantity(i.packQuantity,INGREDIENTS[i.id].unit)}`} — ${money(i.totalCents)}\n${p?.productName||''}\n${p?.url||''}\nConsultado: ${timestamp(p?.checkedAt)}`;}).join('\n\n')+`\n\nTOTAL: ${money(plan.totalCents)}\nSem entrega nem descontos de cartão. Produtos vendidos ao peso podem variar na pesagem final.`;}
function renderSources(){const products=priceData?.products||[];$('#workspace').innerHTML=heading('Preços com origem.','Podes confirmar cada produto, embalagem e preço.')+`<button class="button subtle" data-action="plan">${icon('left')}Voltar ao plano</button><div class="sources-panel"><h2>${escape(storeName(settings.store))}</h2><p>${products.length} produtos com preço identificado. ${priceData?.mode==='scheduled'?'Os preços vêm das páginas oficiais e são recolhidos automaticamente pelo GitHub Actions, com atualizações previstas de 6 em 6 horas. O botão Atualizar preços consulta a última recolha publicada.':priceData?.mode==='snapshot'?'Última recolha guardada; o supermercado não respondeu à atualização em direto.':'Os dados são lidos das páginas públicas dos produtos. A consulta pode reutilizar uma recolha recente durante até duas horas.'}</p><p>Cada preço refere-se ao produto indicado e à sua embalagem ou unidade de peso. Conservas usam o peso escorrido. Produtos ao peso respeitam os mínimos e incrementos identificados na loja; a pesagem final pode alterar o valor. Não se incluem entrega, descontos pessoais ou descontos condicionados a cartão.</p><p>A disponibilidade e o preço final são confirmados pelo supermercado. Produtos sem preço verificável são excluídos do planeamento. A aplicação recusa preços com mais de 24 horas.</p><button class="button" style="margin-top:17px" data-action="refresh-prices">${icon('refresh')}Atualizar preços</button>${products.length?`<table class="source-table"><thead><tr><th>Produto e fonte</th><th>Preço</th><th>Consulta</th></tr></thead><tbody>${products.map(p=>`<tr><td><a href="${escape(safeURL(p.url))}" target="_blank" rel="noopener noreferrer">${escape(p.productName)}</a><br>${quantity(p.packQuantity,p.unit)}${p.soldByWeight?' · venda ao peso':''}</td><td>${money(p.priceCents)}</td><td>${timestamp(p.checkedAt)}</td></tr>`).join('')}</tbody></table>`:'<p>Esta loja ainda não tem uma ligação de preços disponível.</p>'}</div><div class="sources-panel"><h2>Receitas de criadores portugueses</h2><p>Selecionámos receitas públicas d’A Pitada do Pai e de Clara de Sousa. As doses, acompanhamentos e substituições estão identificados em cada adaptação, com ligação à receita original. O plano dá preferência a estas receitas quando respeitam o orçamento e os teus filtros.</p><p>Esta é uma seleção editorial, incluindo publicações recentes, e não um ranking de tendências em tempo real.</p><ul class="creator-list">${CREATORS.map(c=>`<li><a href="${escape(safeURL(c.profile))}" target="_blank" rel="noopener noreferrer">${escape(c.name)}</a> · cerca de ${escape(c.audience)} seguidores no Instagram, consultados em 20/10/2026.</li>`).join('')}</ul></div><div class="sources-panel"><h2>A nossa própria opção gratuita</h2><p>O plano é calculado neste dispositivo, com um catálogo próprio de receitas e regras de orçamento. Não precisa de uma subscrição ou de uma API de inteligência artificial paga. Não reproduzimos o servidor privado da Albo.</p><p>Receitas e fotografias não foram extraídas da Albo. As fotografias são ilustrativas e podem diferir do prato preparado. Os créditos e as licenças das fotografias dos pratos constam na página de cada receita. Os retratos identificam os criadores e vêm dos respetivos sites oficiais; a fotografia abre o perfil do criador. Não existe parceria com os criadores. Logótipos identificam os supermercados; não existe parceria comercial.</p><p>Os dados ficam no navegador. Para instalar no iPhone: Partilhar → Adicionar ao ecrã principal. No Android: menu do navegador → Instalar aplicação.</p></div>`+footer();}

$('#settings-form').addEventListener('submit',e=>{e.preventDefault();createPlan();});
$('#settings-form').addEventListener('change',e=>{
  const t=e.target,id=t.value,kind=t.dataset.ingredientKind;
  if(kind==='avoid'){settings.exclude=t.checked?[...new Set([...settings.exclude,id])]:settings.exclude.filter(v=>v!==id);renderIngredients('avoid');}
  if(kind==='pantry'){if(t.checked)settings.pantryQuantities[id]=INGREDIENTS[id].packQuantity;else delete settings.pantryQuantities[id];renderIngredients('pantry');}
  if(t.dataset.stock)settings.pantryQuantities[t.dataset.stock]=Math.max(0,Number(t.value)||0);
  readForm();markDirty();
});
document.querySelector('.settings-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[role=tab]')],n=tabs.indexOf(document.activeElement),i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(n+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;settingsTab(tabs[i].dataset.settingsTab);tabs[i].focus();});
$('#people').addEventListener('input',updatePeopleLabel);
document.addEventListener('input',e=>{if(['avoid-search','pantry-search'].includes(e.target.id)){renderIngredients(e.target.id.split('-')[0]);return;}if(e.target.id==='recipe-search'){const position=e.target.selectionStart;search=e.target.value;renderRecipes();$('#recipe-search').focus();$('#recipe-search').setSelectionRange(position,position);}});
document.addEventListener('change',e=>{if(e.target.dataset.check){if(e.target.checked)checked.add(e.target.dataset.check);else checked.delete(e.target.dataset.check);save();renderShopping();}});
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.settingsTab){settingsTab(b.dataset.settingsTab);return;}
  if(b.dataset.protein){const id=b.dataset.protein;settings.proteins=settings.proteins.includes(id)?settings.proteins.filter(v=>v!==id):[...settings.proteins,id];b.setAttribute('aria-pressed',String(settings.proteins.includes(id)));b.innerHTML=icon(settings.proteins.includes(id)?'check':'users')+`<span>${PROTEINS.find(p=>p.id===id).name}</span>`;markDirty();return;}
  if(b.dataset.removeAvoid){settings.exclude=settings.exclude.filter(id=>id!==b.dataset.removeAvoid);renderIngredients('avoid');markDirty();return;}
  if(b.dataset.removePantry){delete settings.pantryQuantities[b.dataset.removePantry];renderIngredients('pantry');markDirty();return;}
  if(b.dataset.nav){navigate(b.dataset.nav);return;}
  if(b.dataset.step){$('#people').value=Math.max(1,Math.min(12,Number($('#people').value)+Number(b.dataset.step)));readForm();markDirty();return;}
  if(b.dataset.store){if(settings.store===b.dataset.store)return;settings.store=b.dataset.store;plan=null;dirty=false;save();initForm();await loadPrices();return;}
  if(b.dataset.equipment){const id=b.dataset.equipment;settings.equipment=settings.equipment.includes(id)?settings.equipment.filter(v=>v!==id):[...settings.equipment,id];b.setAttribute('aria-pressed',String(settings.equipment.includes(id)));b.innerHTML=(settings.equipment.includes(id)?icon('check'):'')+escape(equipmentName(id));markDirty();return;}
  if(b.dataset.exclude){const id=b.dataset.exclude;settings.exclude=settings.exclude.includes(id)?settings.exclude.filter(v=>v!==id):[...settings.exclude,id];b.setAttribute('aria-pressed',String(settings.exclude.includes(id)));b.innerHTML=(settings.exclude.includes(id)?icon('check'):'')+allergens[id];markDirty();return;}
  if(b.dataset.favourite){const id=b.dataset.favourite;if(favourites.has(id))favourites.delete(id);else favourites.add(id);save();render();return;}
  if(b.dataset.creator){creatorOnly=true;creatorFilter=b.dataset.creator==='all'?'':b.dataset.creator;renderRecipes();return;}
  if(b.dataset.recipe){previousView=view;detailId=b.dataset.recipe;render();$('#workspace').scrollIntoView({behavior:'instant',block:'start'});return;}
  if(b.dataset.lock!==undefined){const index=Number(b.dataset.lock);if(locked.has(index))locked.delete(index);else locked.add(index);save();render();toast(locked.has(index)?'Esta receita fica guardada ao procurar uma nova combinação.':'Receita desbloqueada.');return;}
  if(b.dataset.swap!==undefined){const index=Number(b.dataset.swap);if(pricesExpired()){plan=null;await loadPrices();toast('Os preços anteriores expiraram. Cria um plano com a nova consulta.');return;}if(locked.has(index)){toast('Desbloqueia esta receita antes de a trocar.');return;}b.disabled=true;await new Promise(r=>setTimeout(r,25));try{const result=replaceMeal(plan,index,clone(plan.settings||settings),{seed:Date.now()});if(result.ok&&result.slots[index].recipeId!==plan.slots[index].recipeId){plan=result;checked.clear();save();render();toast('Receita trocada. Orçamento e compras atualizados.');}else{render();toast(result.reason||'Não há outra receita que caiba neste plano e orçamento.');}}catch{render();toast('Não foi possível trocar esta receita.');}return;}
  const action=b.dataset.action;
  if(action==='generate')await createPlan();
  if(action==='plan'||action==='shopping'||action==='sources')navigate(action);
  if(action==='refresh-prices'){plan=null;dirty=false;await loadPrices();}
  if(action==='back'){detailId=null;view=previousView;render();}
  if(action==='all-recipes'){creatorOnly=false;creatorFilter='';favouriteFilter=false;renderRecipes();}
  if(action==='creator-recipes'){creatorOnly=true;creatorFilter='';favouriteFilter=false;renderRecipes();}
  if(action==='favourite-recipes'){creatorOnly=false;creatorFilter='';favouriteFilter=true;renderRecipes();}
  if(action==='previous-week'||action==='next-week'){const d=dateFor(0);d.setDate(d.getDate()+(action==='next-week'?7:-7));weekStart=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;save();render();}
  if(action==='print')window.print();
  if(action==='clear-checked'){checked.clear();save();renderShopping();}
  if(action==='copy-shopping'){try{await navigator.clipboard.writeText(shoppingText());toast('Lista copiada, com os produtos e as fontes.');}catch{toast('O navegador não permitiu copiar. Usa Descarregar.');}}
  if(action==='download-shopping'){const url=URL.createObjectURL(new Blob([shoppingText()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='meal-preap-mm-lista-de-compras.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
$('.settings-heading').setAttribute('role','button');$('.settings-heading').setAttribute('tabindex','0');$('.settings-heading').setAttribute('aria-expanded','true');$('.settings-heading').setAttribute('aria-controls','settings-form');
function toggleSettings(){if(innerWidth>760)return;const form=$('#settings-form');const collapse=form.dataset.collapsed!=='true';form.dataset.collapsed=String(collapse);$('.settings-heading').setAttribute('aria-expanded',String(!collapse));}
$('.settings-heading').addEventListener('click',toggleSettings);$('.settings-heading').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleSettings();}});
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install-app').hidden=false;});
$('#install-app').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install-app').hidden=true;}});
initForm();await loadPrices({autoGenerate:true});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
