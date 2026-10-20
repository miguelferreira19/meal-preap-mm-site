export async function fetchPriceCatalogue(store,{snapshotOnly=false,fetchImpl=fetch}={}){
  const response=await fetchImpl(snapshotOnly?'prices-snapshot.json':`api/prices?store=${encodeURIComponent(store)}`,{signal:AbortSignal.timeout(snapshotOnly?20000:85000),cache:'no-store'});
  if(!response.ok&&response.status!==503)throw Error('Não foi possível consultar os preços.');
  const data=await response.json();
  if(!snapshotOnly)return data;
  if(data.schemaVersion!==1||!data.stores||typeof data.stores!=='object')throw Error('O catálogo publicado não é válido.');
  const entry=data.stores[store];
  return {...entry,store,mode:'scheduled',products:entry?.products||[],status:entry?.products?.length?'verified':'unavailable',message:entry?.products?.length?entry.message:'Esta loja ainda não tem produtos com preço confirmado. Escolhe Continente, Auchan ou Pingo Doce; o Lidl tem cobertura parcial.'};
}
