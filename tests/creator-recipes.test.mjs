import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {CREATORS,CREATOR_RECIPES} from '../dist/creator-recipes.mjs';
import {INGREDIENTS,DEFAULT_SETTINGS,RECIPES,EQUIPMENT,recipeProtein} from '../dist/data.mjs';
import {eligibleRecipes,generatePlan,buildBasket,replaceMeal,recipeCostCents} from '../dist/engine.mjs';
import recipeImages from '../dist/recipe-images.mjs';

const priced={...DEFAULT_SETTINGS,equipment:EQUIPMENT.map(e=>e.id),budget:500,priceStatus:'verified',prices:Object.fromEntries(Object.keys(INGREDIENTS).map(id=>[id,100]))};
test('creator adaptations retain attribution, complete quantities and distinguish indexed captions',()=>{
 const counts=Object.fromEntries(CREATORS.map(c=>[c.id,CREATOR_RECIPES.filter(r=>r.source.creator===c.id).length]));
 assert.deepEqual(counts,{terapia:22,jamon:14,gil:12,jucy:7,foodies:11,hyzer:4,kelvio:2,receituando:29,pitada:6,clara:2});
 assert.equal(CREATOR_RECIPES.length,109);
 assert.equal(new Set(CREATOR_RECIPES.map(r=>r.source.creator)).size,10);
 const hosts=new Set(['www.youtube.com','giltreatsgil.substack.com','www.instagram.com','receitas.band.com.br','pikory.com','pictame.com','www.tiktok.com','www.apitadadopai.com','claradesousa.pt']);
 for(const c of CREATORS){
  assert(c.personName);assert(existsSync(new URL('../dist/'+c.portrait,import.meta.url)));
  assert.equal(new URL(c.portraitSource).protocol,'https:');
  assert.equal(new URL(c.portraitPage).protocol,'https:');
 }
 for(const r of CREATOR_RECIPES){
  assert(RECIPES.includes(r));assert(CREATORS.some(c=>c.id===r.source.creator));
  const url=new URL(r.source.url);
  assert.equal(url.protocol,'https:');assert(hosts.has(url.hostname),url.href);
  assert(r.source.adaptation.length>70);assert(r.source.credit);assert.equal(r.source.checkedAt,'2026-10-20');
  assert(!r.trending,'No invented live trend or engagement badge');
  assert(r.ingredients.every(i=>INGREDIENTS[i.id]&&i.quantity>0));
  assert.equal(new Set(r.ingredients.map(i=>i.id)).size,r.ingredients.length,'One purchase item per ingredient');
 }
 const indexed=CREATOR_RECIPES.filter(r=>r.source.kind==='public-caption-index');
 assert.equal(indexed.length,8);
 for(const r of indexed){
  assert.equal(r.source.creator,'foodies');
  assert(['pikory.com','pictame.com'].includes(new URL(r.source.url).hostname));
  assert.match(r.source.adaptation,/legenda pública consultada num índice/i);
  assert.match(r.source.adaptation,/ligação original.*ainda não foi confirmada/i);
 }
 const channel=CREATORS.find(c=>c.id==='receituando');
 assert.equal(channel.portraitKind,'brand');
 assert.match(channel.portraitAlt,/log[oó]tipo/i);
 assert.doesNotMatch(channel.portraitAlt,/fotografia de/i);
});
test('creator preference remains below budget and respects allergens, equipment and locked legacy meals',()=>{
 const plan=generatePlan(priced,{seed:'creators'});
 assert(plan.ok,plan.reason);
 assert(new Set(plan.slots.filter(s=>s.recipeId.startsWith('criador-')).map(s=>s.recipeId)).size>=6);
 assert(plan.totalCents<=priced.budget*100);
 const filtered=eligibleRecipes({...priced,exclude:['mustard','soy'],equipment:['hob','pot','pan','knife']});
 assert(!filtered.some(r=>r.id==='criador-hamburguer-atum'||r.id==='criador-mac-cheese'||r.id==='criador-frango-aveia'));
 const slot={day:0,meal:'lunch',recipeId:'massa-bolonhesa'};
 const locked=generatePlan(priced,{seed:'new-creators',lockedSlots:[slot]});assert(locked.ok);assert.deepEqual(locked.slots[0],slot);
 assert.deepEqual(buildBasket(locked.slots,priced).items,locked.shopping);
});
test('a missing new ingredient price prevents that recipe from entering a paid plan',()=>{
 const prices={...priced.prices};delete prices.filo;
 const config={...priced,prices};
 const plan=generatePlan(config,{seed:'missing-filo'});assert(plan.ok);
 assert(!plan.slots.some(s=>s.recipeId==='criador-empadao-filo'));
 assert.equal(generatePlan(config,{lockedSlots:[{day:0,meal:'lunch',recipeId:'criador-empadao-filo'}]}).ok,false);
});

test('desserts and snacks remain discoverable but cannot become lunches, dinners or replacements',()=>{
 const extras=CREATOR_RECIPES.filter(r=>r.mealType==='extra');
 assert.equal(extras.length,3);
 const config={...priced,days:1,maxMinutes:240};
 const allowed=new Set(eligibleRecipes(config).map(r=>r.id));
 for(const extra of extras){
  assert(!allowed.has(extra.id));
  const locked=generatePlan(config,{lockedSlots:[{day:0,meal:'lunch',recipeId:extra.id}]});
  assert.equal(locked.ok,false,extra.id);
 }
 const plan=generatePlan(config,{seed:'main-meals-only'});
 assert(plan.ok,plan.reason);
 const swapped=replaceMeal(plan,0,config,{seed:'exclude-extras'});
 assert(swapped.ok,swapped.reason);
 assert(swapped.slots.every(slot=>!extras.some(r=>r.id===slot.recipeId)));
});

test('new allergen exclusions filter every affected main dish without rejecting unaffected dishes',()=>{
 const config={...priced,maxMinutes:240};
 const mains=eligibleRecipes(config);
 for(const allergen of ['molluscs','celery','sulphites','sesame']){
  const affected=mains.filter(r=>r.ingredients.some(i=>INGREDIENTS[i.id].allergens.includes(allergen)));
  assert(affected.length>0,allergen+' must exercise an actual meal');
  const allowed=eligibleRecipes({...config,exclude:[allergen]});
  assert(allowed.length>0);
  assert(allowed.length<mains.length);
  assert(allowed.every(r=>r.ingredients.every(i=>!INGREDIENTS[i.id].allergens.includes(allergen))));
  for(const r of affected)assert(!allowed.some(item=>item.id===r.id));
 }
});

test('shared ingredient names consume one pantry balance and purchase one package across creators',()=>{
 const config={...priced,people:2,pantryQuantities:{cider_vinegar:20},packQuantities:{cider_vinegar:500},prices:{...priced.prices,cider_vinegar:123}};
 const slots=[{day:0,meal:'lunch',recipeId:'criador-gil-nicoise'},{day:0,meal:'dinner',recipeId:'criador-hyzer-folhados-alheira'}];
 const basket=buildBasket(slots,config);
 const vinegar=basket.items.filter(item=>item.id==='cider_vinegar');
 assert.equal(vinegar.length,1);
 assert.equal(vinegar[0].quantity,28);
 assert.equal(vinegar[0].pantryQuantityUsed,20);
 assert.equal(vinegar[0].quantity-vinegar[0].pantryQuantityUsed,8);
 assert.equal(vinegar[0].purchaseQuantity,500);
 assert.equal(vinegar[0].packs,1);
 assert.equal(vinegar[0].totalCents,123);
 assert(!basket.items.some(item=>['vinegar','cornstarch','curry_powder'].includes(item.id)));
 assert(!Object.hasOwn(INGREDIENTS,'vinegar'));
 assert(!Object.hasOwn(INGREDIENTS,'cornstarch'));
 assert(!Object.hasOwn(INGREDIENTS,'curry_powder'));
});

test('fillets, drained fish, whole fruit and fresh herbs cannot borrow another product price',()=>{
 const distinctions=[['cod','cod_loin'],['mackerel_fillet','mackerel'],['turbot_fillet','turbot'],['fresh_thyme','thyme'],['fresh_rosemary','rosemary'],['avocado_pulp','avocado'],['corn_flour','cornflour']];
 for(const [needed,other] of distinctions){
  assert(INGREDIENTS[needed]&&INGREDIENTS[other]);
  assert.notEqual(INGREDIENTS[needed].name,INGREDIENTS[other].name);
  const r=CREATOR_RECIPES.find(item=>item.ingredients.some(i=>i.id===needed));
  assert(r,needed+' must be used');
  const prices={...priced.prices};delete prices[needed];
  assert(Number.isSafeInteger(prices[other]));
  assert.throws(()=>recipeCostCents(r,{...priced,prices}),/Falta um preço verificado/);
 }
});

test('every visible recipe has a local responsive food image with honest generated-image attribution',()=>{
 for(const r of RECIPES.filter(item=>item.mealType==='extra'||recipeProtein(item))){
  const photo=recipeImages[r.id];
  assert(photo,r.id+' needs a food photograph');
  assert(existsSync(new URL('../dist/'+photo.src,import.meta.url)),photo.src);
  assert.equal(photo.generated,true);
  assert.match(photo.alt,/ilustrativa.*gerada por IA/i);
  const variants=photo.srcSet.split(',').map(part=>part.trim().split(/\s+/)[0]);
  assert(variants.length>=3);
  for(const path of variants)assert(existsSync(new URL('../dist/'+path,import.meta.url)),path);
 }
});
