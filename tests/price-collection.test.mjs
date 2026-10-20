import test from 'node:test';import assert from 'node:assert/strict';
import {collectPrices} from '../pricing/collect.mjs';
const now=Date.parse('2026-10-20T12:00:00Z');
const product=(id,overrides={})=>({ingredientId:id,store:'continente',unit:'g',packQuantity:1000,priceCents:200,url:'https://www.continente.pt/produto/test.html',checkedAt:'2026-10-20T06:00:00Z',...overrides});
test('collection replaces verified products and rejects stale or foreign-store prices',async()=>{
 const previous={stores:{continente:{products:[product('rice'),product('pasta',{checkedAt:'2026-10-18T12:00:00Z'}),product('chicken',{store:'auchan'}),product('potato',{validUntil:'2026-10-20T10:00:00Z'})]}}};
 const current=product('rice',{priceCents:150,checkedAt:'2026-10-20T11:59:00Z'});
 const snapshot=await collectPrices(previous,{now,fetchCurrent:async store=>({products:store==='continente'?[current]:[]})});
 assert.deepEqual(snapshot.stores.continente.products,[current]);assert.equal(snapshot.stores.continente.retainedCount,0);assert.equal(snapshot.stores.continente.checkedAt,current.checkedAt);assert.equal(snapshot.stores.auchan.status,'unavailable');
});
test('failed lookup retains only a recent real price and its unchanged timestamp',async()=>{
 const old=product('rice');const snapshot=await collectPrices({stores:{continente:{products:[old]}}},{now,fetchCurrent:async()=>{throw Error('Offline');}});
 assert.equal(snapshot.stores.continente.collectionStatus,'retained');assert.deepEqual(snapshot.stores.continente.products,[old]);assert.equal(snapshot.stores.continente.checkedAt,old.checkedAt);assert.equal(snapshot.stores.continente.retainedCount,1);
});
