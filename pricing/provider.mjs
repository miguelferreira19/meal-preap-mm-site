import catalogue from './catalogue.mjs';

// All URLs and pack sizes come from the individual retailer pages retained in fixtures/.
const origins = { continente: 'https://www.continente.pt', auchan: 'https://www.auchan.pt' };
let activeRequests = 0;
const waitingRequests = [];

function decode(text = '') {
  const entities = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", euro: '€', nbsp: ' ', iacute: 'í', aacute: 'á', atilde: 'ã', ccedil: 'ç', oacute: 'ó', acirc: 'â', ecirc: 'ê', uacute: 'ú' };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, entity) => {
    if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
    return entities[entity.toLowerCase()] ?? all;
  });
}
function plain(text) { return decode(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function normal(text) { return plain(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); }
function objects(value) {
  if (Array.isArray(value)) return value.flatMap(objects);
  if (!value || typeof value !== 'object') return [];
  return [value, ...objects(value['@graph'])];
}
function cents(value) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(String(value))) throw Error('Formato de preço inválido.');
  const amount = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000) throw Error('Preço fora do intervalo aceite.');
  return amount;
}

// Exported for tests; never accepts an arbitrary network URL.
export function parseRetailerProduct(html, item, checkedAt = new Date().toISOString()) {
  const entries = [];
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { entries.push(...objects(JSON.parse(match[1]))); } catch { /* Invalid scripts cannot establish a price. */ }
  }
  const products = entries.filter(entry => [entry['@type']].flat().includes('Product') && String(entry.sku) === item.sku);
  if (products.length !== 1 || normal(products[0].name) !== normal(item.productName)) throw Error('Produto ausente, ambíguo ou diferente do catálogo.');
  const product = products[0];
  const offers = [product.offers].flat().filter(Boolean);
  if (!offers.length || offers.some(offer => offer.priceCurrency !== 'EUR' || offer.validForMemberTier || offer.priceSpecification?.validForMemberTier)) throw Error('Oferta sem preço público inequívoco em EUR.');
  const amounts = [...new Set(offers.map(offer => cents(offer.price)))];
  if (amounts.length !== 1) throw Error('Há vários preços e não é possível identificar uma oferta pública única.');
  const priceCents = amounts[0];
  const visible = item.store === 'continente'
    ? decode(html.match(/<span[^>]*class="pwc-tile--price-primary"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '').replace(/<[^>]+>/g, '').trim()
    : html.match(/<span[^>]*class="value"[^>]*content="([\d.]+)"/)?.[1];
  const visibleAmount = item.store === 'continente' ? visible.match(/([\d]+),([\d]{2})\s*€/) : null;
  const visibleCents = item.store === 'continente' ? visibleAmount && cents(`${visibleAmount[1]}.${visibleAmount[2]}`) : visible && cents(visible);
  if (visibleCents !== priceCents) throw Error('O preço estruturado não coincide com o preço visível da página.');

  if (item.expectedUnitLabel) {
    const actualLabel = html.match(/<span class="ct-pdp--unit[^>]*>([\s\S]*?)<\/span>/)?.[1];
    if (normal(actualLabel ?? '') !== normal(item.expectedUnitLabel)) throw Error('A dimensão da embalagem mudou; requer nova verificação.');
  }
  if (item.expectedDrainedLabel) {
    const actualLabel = html.match(/Peso l&iacute;quido escorrido[\s\S]{0,350}?<li[^>]*>([\s\S]*?)<\/li>/)?.[1];
    if (normal(actualLabel ?? '') !== normal(item.expectedDrainedLabel)) throw Error('Peso escorrido ausente ou alterado.');
  }
  let minPurchaseQuantity = item.packQuantity;
  let purchaseStepQuantity = item.packQuantity;
  if (item.soldByWeight) {
    if (item.store === 'continente') {
      const attribute = html.match(/data-measure-options="([^"]+)"/)?.[1];
      const measure = attribute && JSON.parse(decode(attribute));
      if (measure?.primaryunit !== 'kg' || !/€\s*\/\s*kg/i.test(visible)) throw Error('Unidade de venda ao peso não confirmada.');
      minPurchaseQuantity = Number(measure.minOrderQuantity) * 1000;
      purchaseStepQuantity = Number(measure.stepQuantity) * 1000;
    } else {
      const unit = html.match(/data-unit-measure="([^"]+)"/)?.[1];
      if (unit !== 'KG') throw Error('Unidade de venda ao peso não confirmada.');
      minPurchaseQuantity = Number(html.match(/data-min-quantity="([\d.]+)"/)?.[1]) * 1000;
      purchaseStepQuantity = Number(html.match(/data-step-quantity="([\d.]+)"/)?.[1]) * 1000;
    }
    if (![minPurchaseQuantity, purchaseStepQuantity].every(value => Number.isFinite(value) && value > 0 && value <= 100000)) throw Error('Incrementos de compra inválidos.');
  }
  const { ingredientId, store, url, packQuantity, unit, packLabel, quantityBasis, soldByWeight } = item;
  return { ingredientId, store, productName: product.name, url, priceCents, packQuantity, unit, checkedAt, method: 'retailer-page', imageURL: [product.image].flat().find(value => typeof value === 'string' && value.startsWith('https://')), packLabel, quantityBasis, soldByWeight, minPurchaseQuantity: Math.round(minPurchaseQuantity), purchaseStepQuantity: Math.round(purchaseStepQuantity), note: soldByWeight ? 'Preço por kg; compra por peso, sujeita ao peso efetivamente preparado pelo retalhista.' : quantityBasis === 'drained' ? 'Quantidade útil = peso escorrido declarado pelo retalhista.' : 'Preço da embalagem completa, sem portes.' };
}

async function acquire() {
  if (activeRequests < 4) { activeRequests++; return; }
  await new Promise(resolve => waitingRequests.push(resolve));
}
function release() {
  const next = waitingRequests.shift();
  if (next) next(); else activeRequests--;
}

export async function fetchStorePrices(store, { fetchImpl = fetch } = {}) {
  if (!Object.hasOwn(origins, store)) throw new TypeError('Supermercado não suportado.');
  const products = [];
  const failures = [];
  await Promise.all(catalogue.filter(item => item.store === store).map(async item => {
    await acquire();
    try {
      const url = new URL(item.url);
      if (url.origin !== origins[store] || url.search || url.hash || url.username || url.password || !/\.html$/.test(url.pathname)) throw Error('URL fora do catálogo permitido.');
      const response = await fetchImpl(item.url, { signal: AbortSignal.timeout(12000), redirect: 'manual', headers: { Accept: 'text/html' } });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (html.length > 4000000) throw Error('Resposta acima do limite.');
      products.push(parseRetailerProduct(html, item));
    } catch (error) {
      failures.push({ ingredientId: item.ingredientId, reason: error.message });
    } finally { release(); }
  }));
  products.sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
  return { checkedAt: new Date().toISOString(), products, status: products.length ? 'verified' : 'unavailable', message: products.length ? `${products.length}/${catalogue.filter(item => item.store === store).length} produtos com preço público lido na página do retalhista. Sem portes ou benefícios em cartão; preços e disponibilidade sujeitos à loja, morada e peso final.` : 'Não foi possível confirmar preços públicos deste supermercado. Nenhum preço foi inventado.', ...(failures.length ? { failures } : {}) };
}
