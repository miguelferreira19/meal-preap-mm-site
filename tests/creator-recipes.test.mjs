import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {CREATORS,CREATOR_RECIPES} from '../dist/creator-recipes.mjs';
import {INGREDIENTS,DEFAULT_SETTINGS,RECIPES,EQUIPMENT} from '../dist/data.mjs';
import {eligibleRecipes,generatePlan,buildBasket} from '../dist/engine.mjs';

const priced={...DEFAULT_SETTINGS,equipment:EQUIPMENT.map(e=>e.id),budget:500,priceStatus:'verified',prices:Object.fromEntries(Object.keys(INGREDIENTS).map(id=>[id,100]))};
test('creator adaptations retain primary sources, attribution and honest provenance',()=>{
 assert.equal(CREATOR_RECIPES.length,8);
 assert.equal(new Set(CREATOR_RECIPES.map(r=>r.source.creator)).size,2);
 for(const c of CREATORS){
  assert(c.personName);assert(existsSync(new URL('../dist/'+c.portrait,import.meta.url)));
  assert.equal(new URL(c.portraitSource).protocol,'https:');
  assert.equal(new URL(c.portraitPage).protocol,'https:');
 }
 for(const r of CREATOR_RECIPES){
  assert(RECIPES.includes(r));assert(CREATORS.some(c=>c.id===r.source.creator));
  const url=new URL(r.source.url);
  assert.equal(url.protocol,'https:');assert(['www.apitadadopai.com','claradesousa.pt'].includes(url.hostname));
  assert(r.source.adaptation.length>70);assert(r.source.credit);assert.equal(r.source.checkedAt,'2026-10-20');
  assert(!r.trending,'No invented live trend or engagement badge');
  assert(r.ingredients.every(i=>INGREDIENTS[i.id]&&i.quantity>0));
 }
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
