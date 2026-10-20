import {fetchStorePrices} from './provider.mjs';
import {fetchAdditionalStorePrices} from './additional-stores.mjs';
import {INGREDIENTS} from '../dist/data.mjs';

const origins={continente:'https://www.continente.pt',auchan:'https://www.auchan.pt','pingo-doce':'https://www.pingodoce.pt',lidl:'https://www.lidl.pt'};
function validProduct(product,store,now){
  try{return product.store===store&&INGREDIENTS[product.ingredientId]?.unit===product.unit&&Number.isSafeInteger(product.priceCents)&&product.priceCents>0&&Number.isFinite(product.packQuantity)&&product.packQuantity>0&&new URL(product.url).origin===origins[store]&&now-Date.parse(product.checkedAt)<86400000&&Date.parse(product.checkedAt)<=now+300000&&(!product.validUntil||Date.parse(product.validUntil)>now);}catch{return false;}
}
export async function collectPrices(previous={stores:{}},{now=Date.now(),fetchCurrent=async store=>(['pingo-doce','lidl'].includes(store)?fetchAdditionalStorePrices:fetchStorePrices)(store)}={}){
  const stores={};
  for(const store of Object.keys(origins)){
    let result;try{result=await fetchCurrent(store);}catch(error){result={products:[],failures:[{reason:error.message}]};}
    const retained=(previous.stores?.[store]?.products||[]).filter(p=>validProduct(p,store,now));
    const current=(result.products||[]).filter(p=>validProduct(p,store,now));
    const merged=new Map(retained.map(p=>[p.ingredientId,p]));for(const product of current)merged.set(product.ingredientId,product);
    const products=[...merged.values()].sort((a,b)=>a.ingredientId.localeCompare(b.ingredientId));
    const retainedCount=products.length-current.length;
    stores[store]={store,products,status:products.length?'verified':'unavailable',collectionStatus:current.length?'collected':retained.length?'retained':'unavailable',attemptedAt:new Date(now).toISOString(),checkedAt:products.length?products.reduce((oldest,p)=>Date.parse(p.checkedAt)<Date.parse(oldest.checkedAt)?p:oldest).checkedAt:null,retainedCount,message:`${products.length} produtos com origem identificada.${retainedCount?` ${retainedCount} mantêm a recolha anterior, com menos de 24 horas.`:''}${store==='lidl'?' Catálogo parcial de ofertas públicas.':''}`,failures:result.failures||[]};
  }
  return {schemaVersion:1,collectedAt:new Date(now).toISOString(),refreshIntervalHours:6,stores};
}
