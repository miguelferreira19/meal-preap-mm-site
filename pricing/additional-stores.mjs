import catalogue from './additional-catalogue.mjs';

const origins={'pingo-doce':'https://www.pingodoce.pt',lidl:'https://www.lidl.pt'};
const entities={amp:'&',quot:'"',apos:"'",nbsp:' ',euro:'€',aacute:'á',eacute:'é',iacute:'í',oacute:'ó',uacute:'ú',atilde:'ã',otilde:'õ',ccedil:'ç',acirc:'â',ecirc:'ê',ocirc:'ô'};
const decode=s=>String(s??'').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(m,k)=>k[0]==='#'?String.fromCodePoint(k[1].toLowerCase()==='x'?parseInt(k.slice(2),16):Number(k.slice(1))):entities[k.toLowerCase()]??m);
const plain=s=>decode(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const normal=s=>plain(s).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const cents=v=>{if(!/^\d+(?:\.\d{1,2})?$/.test(String(v)))throw Error('Preço público inválido.');const c=Math.round(Number(v)*100);if(!Number.isSafeInteger(c)||c<=0||c>100000)throw Error('Preço fora do intervalo.');return c;};
function productJSON(html,item){
  const products=[];
  for(const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{const data=JSON.parse(match[1]);for(const p of [data,...(data['@graph']||[])].flat())if(p['@type']==='Product'&&String(p.sku)===item.sku)products.push(p);}catch{}
  }
  if(products.length!==1)throw Error('Identidade do produto não confirmada.');return products[0];
}
export function parseAdditionalProduct(html,item,checkedAt=new Date().toISOString()){
  const product=productJSON(html,item);let priceCents,validUntil,minPurchaseQuantity=item.packQuantity,purchaseStepQuantity=item.packQuantity;
  if(item.store==='pingo-doce'){
    const name=plain(html.match(/<h1 class="product-name">([\s\S]*?)<\/h1>/)?.[1]);
    if(normal(name)!==normal(item.productName))throw Error('Produto diferente do catálogo.');
    const label=plain(html.match(/<h1 class="product-unit-measure">([\s\S]*?)<\/h1>/)?.[1]).split('|')[0].trim();
    if(normal(label)!==normal(item.expectedUnitLabel))throw Error('Embalagem alterada.');
    if(item.expectedDrainedLabel){const drained=plain(html.match(/id="drained-net-weight">([\s\S]*?)<\/div>/)?.[1]).replace(/Peso Líquido Escorrido/i,'').trim();if(normal(drained)!==normal(item.expectedDrainedLabel))throw Error('Peso escorrido alterado.');}
    const sales=html.match(/<span class="sales">([\s\S]*?)<\/span>\s*<\/span>/)?.[1]||'';
    const value=sales.match(/class="value" content="([\d.]+)"/)?.[1];priceCents=cents(value);
    const visible=plain(sales).match(/(\d+),(\d{2})\s*€/);if(!visible||cents(visible[1]+'.'+visible[2])!==priceCents)throw Error('Preço visível ambíguo.');
    if(item.soldByWeight){
      if(!/€\s*\/\s*kg/i.test(plain(sales)))throw Error('Preço por kg não confirmado.');
      const conversion=html.match(/class="tile-conversion[^>]*data-display-quantity="([\d.]+)"\s*data-display-unit="Kg"/);
      const minimum=Number(html.match(/class="prices-add-to-cart-actions" data-min-qty="([\d.]+)"/)?.[1]);
      purchaseStepQuantity=Number(conversion?.[1])*1000;minPurchaseQuantity=purchaseStepQuantity*minimum;
      if(![purchaseStepQuantity,minPurchaseQuantity].every(v=>Number.isFinite(v)&&v>0&&v<=100000))throw Error('Quantidade de venda ao peso não confirmada.');
    }else if(/€\s*\/\s*kg\s*$/i.test(plain(sales)))throw Error('A unidade de venda mudou.');
  }else if(item.store==='lidl'){
    if(normal(product.name)!==normal(item.productName))throw Error('Produto diferente do catálogo.');
    const offers=[product.offers].flat().filter(Boolean);
    if(!offers.length||offers.some(o=>o.priceCurrency!=='EUR'||o.validForMemberTier||o.priceSpecification?.validForMemberTier||/OutOfStock|Discontinued/i.test(o.availability||'')))throw Error('Sem oferta pública disponível.');
    const values=[...new Set(offers.map(o=>cents(o.price)))];if(values.length!==1)throw Error('Preço público ambíguo.');priceCents=values[0];
    const body=plain(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,''));
    if(!body.includes(item.expectedUnitLabel))throw Error('Embalagem não confirmada.');
    const raw=html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];if(!raw)throw Error('Condições da oferta indisponíveis.');
    const data=JSON.parse(raw),value=ref=>typeof ref==='number'&&ref>=0?data[ref]:undefined;
    const priced=data.filter(v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.hasOwn(v,'price')&&Object.hasOwn(v,'packaging')&&Number(value(v.price))===priceCents/100);
    if(!priced.length)throw Error('Preço estruturado sem confirmação.');
    const timed=priced.filter(v=>Object.hasOwn(v,'startDate')||Object.hasOwn(v,'endDate'));
    for(const row of priced){const discount=value(row.discount);if(/plus/i.test(String(value(row.priceTheme)))||discount&&value(discount.fromNormalPriceForLidlPlus)===true)throw Error('Preço condicionado a Lidl Plus.');}
    for(const row of timed){const start=value(row.startDate),end=value(row.endDate);if(start&&Date.parse(start)>Date.parse(checkedAt)||end&&Date.parse(end)<=Date.parse(checkedAt))throw Error('Oferta fora da validade.');if(end)validUntil=end;}
    const displayed=body.match(/\b(\d+)\.(\d{2})\b/g)||[];if(!displayed.some(v=>cents(v)===priceCents))throw Error('Preço visível não coincide.');
  }else throw Error('Loja desconhecida.');
  return {ingredientId:item.ingredientId,store:item.store,productName:item.productName,url:item.url,priceCents,packQuantity:item.packQuantity,unit:item.unit,packLabel:item.packLabel,quantityBasis:item.quantityBasis,soldByWeight:item.soldByWeight,minPurchaseQuantity,purchaseStepQuantity,checkedAt,method:'retailer-page',...(validUntil?{validUntil}:{}),imageURL:[product.image].flat().find(v=>typeof v==='string'&&v.startsWith('https://')),note:item.soldByWeight?'Venda por unidade de peso aproximado; valor final sujeito à pesagem.':'Preço público, sem descontos condicionados a cartão.'};
}
export async function fetchAdditionalStorePrices(store,{fetchImpl=fetch}={}){
  if(!origins[store])throw Error('Loja não suportada.');const items=catalogue.filter(i=>i.store===store),products=[],failures=[];let next=0;
  await Promise.all(Array.from({length:4},async()=>{while(next<items.length){const item=items[next++];try{
    const url=new URL(item.url);if(url.origin!==origins[store]||url.search||url.hash||url.username||url.password)throw Error('URL fora do catálogo.');
    const response=await fetchImpl(url.href,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{Accept:'text/html'}});if(!response.ok)throw Error(`HTTP ${response.status}`);
    const html=await response.text();if(html.length>4000000)throw Error('Resposta acima do limite.');products.push(parseAdditionalProduct(html,item));
  }catch(error){failures.push({ingredientId:item.ingredientId,reason:error.message});}}}));
  products.sort((a,b)=>a.ingredientId.localeCompare(b.ingredientId));return {store,checkedAt:new Date().toISOString(),status:products.length?'verified':'unavailable',products,failures,message:`${products.length}/${items.length} produtos com preço público confirmado.${store==='lidl'?' Catálogo parcial de ofertas; pode não cobrir uma receita completa.':''} Preços sujeitos à loja e disponibilidade.`};
}
