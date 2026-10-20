import fs from 'node:fs/promises';
import {collectPrices} from '../pricing/collect.mjs';

let previous=JSON.parse(await fs.readFile(new URL('../dist/prices-snapshot.json',import.meta.url),'utf8'));
const publicSnapshot=process.env.PREVIOUS_SNAPSHOT_URL;
if(publicSnapshot){
  const url=new URL(publicSnapshot);
  if(url.origin!=='https://miguelferreira19.github.io'||url.pathname!=='/meal-preap-mm-site/prices-snapshot.json'||url.search||url.hash||url.username||url.password)throw Error('Origem da recolha anterior não autorizada.');
  try{const response=await fetch(url,{signal:AbortSignal.timeout(15000),redirect:'manual',cache:'no-store'});if(response.ok){const snapshot=await response.json();if(snapshot.schemaVersion===1&&snapshot.stores)previous=snapshot;}}catch{console.warn('A recolha publicada anterior não respondeu; a verificar os dados disponíveis.');}
}
const snapshot=await collectPrices(previous);
await fs.writeFile(new URL('../dist/prices-snapshot.json',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
for(const [store,result]of Object.entries(snapshot.stores))console.log(JSON.stringify({store,status:result.status,collected:result.products.length-result.retainedCount,retained:result.retainedCount,checkedAt:result.checkedAt,failures:result.failures.slice(0,3)}));
if(!Object.values(snapshot.stores).some(s=>s.products.length))throw Error('Nenhum preço atual confirmado. Não publicar preços inventados ou expirados.');
