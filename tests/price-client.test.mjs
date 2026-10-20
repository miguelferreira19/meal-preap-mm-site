import test from 'node:test';import assert from 'node:assert/strict';
import {fetchPriceCatalogue} from '../dist/price-client.mjs';
test('GitHub Pages loads the relative catalogue for exactly the selected retailer',async()=>{
 const products=[{ingredientId:'eggs',store:'pingo-doce',priceCents:299}];
 const data=await fetchPriceCatalogue('pingo-doce',{snapshotOnly:true,fetchImpl:async(url,options)=>{assert.equal(url,'prices-snapshot.json');assert.equal(options.cache,'no-store');return Response.json({schemaVersion:1,stores:{'pingo-doce':{products,checkedAt:'2026-10-20T11:00:00Z'},continente:{products:[{priceCents:999}]}}});}});
 assert.equal(data.store,'pingo-doce');assert.equal(data.mode,'scheduled');assert.deepEqual(data.products,products);assert.equal(data.checkedAt,'2026-10-20T11:00:00Z');
});
test('unsupported stores and corrupt data never inherit another retailer prices',async()=>{
 const fetchImpl=async()=>Response.json({schemaVersion:1,stores:{continente:{products:[{priceCents:100}]}}});
 const data=await fetchPriceCatalogue('aldi',{snapshotOnly:true,fetchImpl});assert.equal(data.status,'unavailable');assert.deepEqual(data.products,[]);
 await assert.rejects(fetchPriceCatalogue('continente',{snapshotOnly:true,fetchImpl:async()=>Response.json({wrong:true})}),/catálogo/);
});
test('server mode preserves the API response and encoded store query',async()=>{
 const data=await fetchPriceCatalogue('continente',{fetchImpl:async(url)=>{assert.equal(url,'api/prices?store=continente');return Response.json({store:'continente',mode:'live',products:[]});}});assert.equal(data.mode,'live');
});
