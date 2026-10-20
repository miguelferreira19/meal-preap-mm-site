import { DEFAULT_SETTINGS, EQUIPMENT, INGREDIENTS, RECIPES, STORES, PROTEINS, recipeProtein } from './data.mjs';

const recipeById = new Map(RECIPES.map(recipe => [recipe.id, recipe]));
const equipmentIds = new Set(EQUIPMENT.map(item => item.id));
const storeIds = new Set(STORES.map(store => store.id));
const allergens = new Set(['gluten', 'milk', 'egg', 'fish', 'nuts', 'soy', 'shellfish', 'mustard']);
const quantityScale = 1000;
const hasIngredient = id => Object.hasOwn(INGREDIENTS, id);
const hasQuantityPrecision = value => Number.isFinite(value) && Number.isSafeInteger(Math.round(value * quantityScale)) && Math.abs(value * quantityScale - Math.round(value * quantityScale)) < 0.000001;

function settingsFor(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('As definições não são válidas.');
  const settings = { ...DEFAULT_SETTINGS, ...input };
  if (!Number.isInteger(settings.people) || settings.people < 1 || settings.people > 12)
    throw new Error('Escolha entre 1 e 12 pessoas.');
  if (!Number.isInteger(settings.days) || settings.days < 1 || settings.days > 14)
    throw new Error('Escolha entre 1 e 14 dias.');
  if (!Number.isFinite(settings.budget) || settings.budget <= 0 || !Number.isSafeInteger(Math.round(settings.budget * 100)) || Math.abs(settings.budget * 100 - Math.round(settings.budget * 100)) > 0.000001)
    throw new Error('Indique um orçamento positivo em euros, com até duas casas decimais.');
  if (!storeIds.has(settings.store)) throw new Error('Escolha um supermercado disponível.');
  settings.diet = 'all';
  if (!Number.isInteger(settings.maxMinutes) || settings.maxMinutes < 1 || settings.maxMinutes > 240)
    throw new Error('O tempo máximo deve estar entre 1 e 240 minutos.');
  for (const [key, valid] of [
    ['meals', id => ['lunch', 'dinner'].includes(id)],
    ['equipment', id => equipmentIds.has(id)],
    ['exclude', id => hasIngredient(id) || allergens.has(id)],
    ['pantry', id => hasIngredient(id)],
    ['proteins', id => PROTEINS.some(protein => protein.id === id)],
  ]) {
    if (!Array.isArray(settings[key]) || settings[key].some(id => !valid(id)) || new Set(settings[key]).size !== settings[key].length)
      throw new Error(`A seleção de ${ { meals: 'refeições', equipment: 'utensílios', exclude: 'exclusões', pantry: 'despensa' }[key] } não é válida.`);
    settings[key] = [...settings[key]];
  }
  if (!settings.meals.length) throw new Error('Escolha pelo menos uma refeição por dia.');
  if (!settings.proteins.length) throw new Error('Escolha pelo menos uma proteína principal.');
  if (!settings.pantryQuantities || typeof settings.pantryQuantities !== 'object' || Array.isArray(settings.pantryQuantities)) throw new Error('As quantidades da despensa não são válidas.');
  for (const [id, value] of Object.entries(settings.pantryQuantities)) {
    if (!hasIngredient(id) || !hasQuantityPrecision(value) || value < 0) throw new Error('Indique quantidades da despensa positivas, com até três casas decimais.');
  }
  settings.pantryQuantities = { ...settings.pantryQuantities };
  for (const key of ['prices', 'packQuantities']) {
    const values = settings[key];
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('O catálogo de preços não é válido.');
    for (const [id, value] of Object.entries(values)) {
      if (!hasIngredient(id) || !Number.isFinite(value) || value <= 0 || (key === 'prices' && !Number.isSafeInteger(value)) || (key === 'packQuantities' && !hasQuantityPrecision(value)))
        throw new Error(key === 'prices' ? 'Os preços devem ser cêntimos inteiros positivos por embalagem.' : 'A quantidade de cada embalagem deve ser positiva, com até três casas decimais.');
    }
    settings[key] = { ...values };
  }
  if (!settings.purchaseRules || typeof settings.purchaseRules !== 'object' || Array.isArray(settings.purchaseRules)) throw new Error('As regras de compra não são válidas.');
  settings.purchaseRules = Object.fromEntries(Object.entries(settings.purchaseRules).map(([id, rule]) => {
    if (!hasIngredient(id) || !rule || rule.soldByWeight !== true || !hasQuantityPrecision(rule.minPurchaseQuantity) || rule.minPurchaseQuantity < 0 || !hasQuantityPrecision(rule.purchaseStepQuantity) || rule.purchaseStepQuantity <= 0)
      throw new Error('Os produtos a peso precisam de uma quantidade mínima e de um incremento de compra válidos.');
    return [id, { ...rule }];
  }));
  return settings;
}

function matches(recipe, settings) {
  if (recipe.minutes > settings.maxMinutes || recipe.equipment.some(id => !settings.equipment.includes(id))) return false;
  if (!settings.proteins.includes(recipeProtein(recipe))) return false;
  return recipe.ingredients.every(({ id }) => !settings.exclude.includes(id) && INGREDIENTS[id].allergens.every(allergen => !settings.exclude.includes(allergen)));
}

export function eligibleRecipes(settings = {}) {
  try {
    const valid = settingsFor(settings);
    return RECIPES.filter(recipe => matches(recipe, valid));
  } catch {
    return [];
  }
}

function requireVerified(settings) {
  if (settings.priceStatus !== 'verified') throw new Error('Ainda não há um catálogo de preços verificado para esta loja. Carregue os preços antes de criar o plano.');
}

function isPriced(recipe, settings) {
  return recipe.ingredients.every(({ id, quantity }) => settings.pantry.includes(id) || Number.isSafeInteger(settings.prices[id]) || (settings.pantryQuantities[id] ?? 0) >= quantity * settings.people * settings.days * settings.meals.length);
}

function packFor(id, settings) {
  return settings.packQuantities[id] ?? INGREDIENTS[id].packQuantity;
}

function priceFor(id, settings) {
  const price = settings.prices[id];
  if (!Number.isSafeInteger(price) || price <= 0) throw new Error(`Falta um preço verificado para ${INGREDIENTS[id].name.toLocaleLowerCase('pt-PT')}.`);
  return price;
}

export function recipeCostCents(recipe, input = {}) {
  const settings = settingsFor(input);
  requireVerified(settings);
  if (!recipe || !recipeById.has(recipe.id)) throw new Error('A receita não é válida.');
  let total = 0;
  for (const { id, quantity } of recipeById.get(recipe.id).ingredients) {
    const needed = settings.pantry.includes(id) ? 0 : Math.max(0, quantity * settings.people - (settings.pantryQuantities[id] ?? 0));
    if (needed) total += needed / packFor(id, settings) * priceFor(id, settings);
  }
  if (!Number.isSafeInteger(Math.round(total))) throw new Error('O custo ultrapassa o limite de cálculo.');
  return Math.round(total);
}

function basketForRecipes(recipes, settings) {
  const quantities = new Map();
  for (const recipe of recipes) {
    for (const { id, quantity } of recipe.ingredients) {
      const scaled = Math.round(quantity * quantityScale) * settings.people;
      quantities.set(id, (quantities.get(id) ?? 0) + scaled);
    }
  }
  const items = [...quantities].map(([id, scaled]) => {
    const pantryUsed = settings.pantry.includes(id) ? scaled : Math.min(scaled, Math.round((settings.pantryQuantities[id] ?? 0) * quantityScale));
    const remaining = scaled - pantryUsed;
    const pantry = remaining === 0;
    const packQuantity = packFor(id, settings);
    const packScaled = Math.round(packQuantity * quantityScale);
    const rule = settings.purchaseRules[id];
    const soldByWeight = Boolean(rule?.soldByWeight);
    const purchaseScaled = pantry ? 0 : soldByWeight
      ? Math.max(Math.round(rule.minPurchaseQuantity * quantityScale), Math.ceil(remaining / Math.round(rule.purchaseStepQuantity * quantityScale)) * Math.round(rule.purchaseStepQuantity * quantityScale))
      : Math.ceil(remaining / packScaled) * packScaled;
    const packs = purchaseScaled / packScaled;
    const priceCents = pantry ? (settings.prices[id] ?? null) : priceFor(id, settings);
    const totalCents = pantry ? 0 : soldByWeight
      ? Number((BigInt(purchaseScaled) * BigInt(priceCents) + BigInt(packScaled) / 2n) / BigInt(packScaled))
      : packs * priceCents;
    return { id, quantity: scaled / quantityScale, pantryQuantityUsed: pantryUsed / quantityScale, packs, packQuantity, priceCents, totalCents, pantry, purchaseQuantity: purchaseScaled / quantityScale, soldByWeight };
  }).sort((a, b) => INGREDIENTS[a.id].category.localeCompare(INGREDIENTS[b.id].category, 'pt-PT') || INGREDIENTS[a.id].name.localeCompare(INGREDIENTS[b.id].name, 'pt-PT'));
  const totalCents = items.reduce((total, item) => total + item.totalCents, 0);
  if (!Number.isSafeInteger(totalCents)) throw new Error('O custo ultrapassa o limite de cálculo.');
  return { items, totalCents };
}

export function buildBasket(slots, input = {}) {
  const settings = settingsFor(input);
  requireVerified(settings);
  if (!Array.isArray(slots)) throw new Error('A lista de refeições não é válida.');
  const recipes = slots.map(slot => {
    const recipe = recipeById.get(slot?.recipeId);
    if (!recipe) throw new Error('O plano contém uma receita desconhecida.');
    return recipe;
  });
  return basketForRecipes(recipes, settings);
}

function randomFrom(seed) {
  let state = 2166136261;
  for (const char of String(seed ?? Date.now())) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function failure(settings, reason, eligibleCount = 0) {
  return { ok: false, slots: [], shopping: [], totalCents: 0, reason, note: '', eligibleCount, settings };
}

function planQuality(recipes, totalCents, preferences) {
  const counts = new Map();
  const proteinCounts = new Map();
  let adjacent = 0;
  let sameProtein = 0;
  let taste = 0;
  const creatorRecipes = new Set();
  recipes.forEach((recipe, index) => {
    counts.set(recipe.id, (counts.get(recipe.id) ?? 0) + 1);
    if (recipe.source) creatorRecipes.add(recipe.id);
    const protein = recipeProtein(recipe);
    proteinCounts.set(protein, (proteinCounts.get(protein) ?? 0) + 1);
    if (index && recipes[index - 1].id === recipe.id) adjacent++;
    if (index && recipeProtein(recipes[index - 1]) === protein) sameProtein++;
    taste += preferences[index]?.get(recipe.id) ?? 0;
  });
  return counts.size * 100000 + creatorRecipes.size * 70000 + proteinCounts.size * 350000 - [...proteinCounts.values()].reduce((sum, count) => sum + count * count * 6000, 0) - [...counts.values()].reduce((sum, count) => sum + count * count * 1000, 0) - adjacent * 250 - sameProtein * 10000 - totalCents * 0.05 + taste;
}

function resultFor(recipes, settings, eligibleCount) {
  const { items, totalCents } = basketForRecipes(recipes, settings);
  const slots = recipes.map((recipe, index) => ({ day: Math.floor(index / settings.meals.length), meal: settings.meals[index % settings.meals.length], recipeId: recipe.id }));
  const repeats = new Set(recipes.map(recipe => recipe.id)).size < recipes.length;
  const pricedGroups = new Set(RECIPES.filter(recipe => matches(recipe, settings) && isPriced(recipe, settings)).map(recipeProtein));
  const unavailable = settings.proteins.filter(id => !pricedGroups.has(id)).map(id => PROTEINS.find(protein => protein.id === id).name);
  return {
    ok: true, slots, shopping: items, totalCents, reason: '', eligibleCount, settings,
    note: [repeats ? 'Este plano repete receitas para respeitar as preferências, os preços disponíveis e o orçamento.' : '', unavailable.length ? `Sem receitas compatíveis com preço completo para: ${unavailable.join(', ')}.` : ''].filter(Boolean).join(' '),
  };
}

export function generatePlan(input = {}, { seed, lockedSlots = [] } = {}) {
  let settings;
  try {
    settings = settingsFor(input);
    requireVerified(settings);
    if (!Array.isArray(lockedSlots)) throw new Error('A lista de refeições bloqueadas não é válida.');
    const locks = new Map();
    for (const slot of lockedSlots) {
      if (!slot || !Number.isInteger(slot.day) || slot.day < 0 || slot.day >= settings.days || !settings.meals.includes(slot.meal))
        throw new Error('Uma refeição bloqueada está fora dos dias ou refeições selecionados.');
      const index = slot.day * settings.meals.length + settings.meals.indexOf(slot.meal);
      if (locks.has(index)) throw new Error('Há mais de uma receita bloqueada para a mesma refeição.');
      const recipe = recipeById.get(slot.recipeId);
      if (!recipe || !matches(recipe, settings)) throw new Error('Uma receita bloqueada não respeita os filtros atuais. Desbloqueie essa refeição ou ajuste os filtros.');
      if (!isPriced(recipe, settings)) throw new Error('Faltam preços verificados para uma receita bloqueada. Atualize os preços ou desbloqueie essa refeição.');
      locks.set(index, recipe);
    }
    const matching = RECIPES.filter(recipe => matches(recipe, settings));
    if (!matching.length) return failure(settings, 'Não há receitas que respeitem todos os filtros. Ajuste os utensílios, o tempo ou as exclusões.');
    const candidates = matching.filter(recipe => isPriced(recipe, settings));
    if (!candidates.length) return failure(settings, 'Os preços verificados disponíveis ainda não cobrem uma receita completa com estes filtros. Carregue mais produtos ou ajuste os filtros.');
    const count = settings.days * settings.meals.length;
    const limit = Math.round(settings.budget * 100);
    if (basketForRecipes([...locks.values()], settings).totalCents > limit)
      return failure(settings, 'As refeições bloqueadas, por si só, ultrapassam o orçamento. Aumente o orçamento ou desbloqueie uma refeição.', candidates.length);
    if (locks.size === count) return resultFor(Array.from({ length: count }, (_, index) => locks.get(index)), settings, candidates.length);
    const freeIndices = Array.from({ length: count }, (_, index) => index).filter(index => !locks.has(index));
    const random = randomFrom(seed);
    const preferences = Array.from({ length: count }, () => new Map(candidates.map(recipe => [recipe.id, random() * 100])));
    let best = null;
    let bestQuality = -Infinity;
    const consider = recipes => {
      const basket = basketForRecipes(recipes, settings);
      const quality = planQuality(recipes, basket.totalCents, preferences);
      if (basket.totalCents <= limit && quality > bestQuality) { best = recipes.slice(); bestQuality = quality; }
    };
    // shortcut: finite seeded search, not a proof of the globally cheapest possible basket.
    for (const recipe of candidates) consider(Array.from({ length: count }, (_, index) => locks.get(index) ?? recipe));
    const economical = [...candidates].sort((a, b) => recipeCostCents(a, settings) - recipeCostCents(b, settings));
    for (const first of economical.slice(0, 6)) {
      const recipes = Array.from({ length: count }, (_, index) => locks.get(index) ?? null);
      recipes[freeIndices[0]] = first;
      for (const index of freeIndices.slice(1)) {
        let next = null;
        let cheapest = Infinity;
        for (const recipe of candidates) {
          const cost = basketForRecipes([...recipes.filter(Boolean), recipe], settings).totalCents;
          if (cost < cheapest) { cheapest = cost; next = recipe; }
        }
        recipes[index] = next;
      }
      consider(recipes);
    }
    if (!best) return failure(settings, `Não foi encontrado um plano dentro deste orçamento com os preços disponíveis${locks.size ? ', mantendo as refeições bloqueadas' : ''}. A pesquisa é heurística: pode ajustar o orçamento, a despensa ou os filtros e tentar novamente.`, candidates.length);
    for (let pass = 0; pass < 4; pass++) {
      let changed = false;
      const indices = freeIndices.map(index => ({ index, order: random() })).sort((a, b) => a.order - b.order).map(item => item.index);
      for (const index of indices) {
        const current = best[index];
        let winner = current;
        let winnerQuality = bestQuality;
        for (const recipe of candidates) {
          if (recipe.id === current.id) continue;
          best[index] = recipe;
          const basket = basketForRecipes(best, settings);
          if (basket.totalCents > limit) continue;
          const quality = planQuality(best, basket.totalCents, preferences);
          if (quality > winnerQuality) { winner = recipe; winnerQuality = quality; }
        }
        best[index] = winner;
        if (winner !== current) { changed = true; bestQuality = winnerQuality; }
      }
      if (!changed) break;
    }
    return resultFor(best, settings, candidates.length);
  } catch (error) {
    return failure(settings ?? input, error.message);
  }
}

export function replaceMeal(plan, slotIndex, input = {}, { seed } = {}) {
  let settings;
  try {
    settings = settingsFor(input);
    requireVerified(settings);
    if (!plan?.ok || !Array.isArray(plan.slots) || plan.slots.length !== settings.days * settings.meals.length || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= plan.slots.length)
      return failure(settings, 'Escolha uma refeição de um plano válido para substituir.');
    const expected = new Set();
    const recipes = plan.slots.map((slot, index) => {
      if (!Number.isInteger(slot.day) || slot.day < 0 || slot.day >= settings.days || !settings.meals.includes(slot.meal) || expected.has(`${slot.day}:${slot.meal}`)) throw new Error('O plano contém dias ou refeições inválidos.');
      expected.add(`${slot.day}:${slot.meal}`);
      const recipe = recipeById.get(slot.recipeId);
      if (!recipe || (index !== slotIndex && !matches(recipe, settings))) throw new Error('As preferências mudaram. Crie um novo plano antes de substituir uma refeição.');
      return recipe;
    });
    const candidates = RECIPES.filter(recipe => recipe.id !== recipes[slotIndex].id && matches(recipe, settings) && isPriced(recipe, settings));
    const limit = Math.round(settings.budget * 100);
    const random = randomFrom(seed);
    const preferences = recipes.map(() => new Map(RECIPES.map(recipe => [recipe.id, random() * 100])));
    let best = null;
    let bestQuality = -Infinity;
    for (const recipe of candidates) {
      const proposal = recipes.slice();
      proposal[slotIndex] = recipe;
      if (proposal.some(item => !isPriced(item, settings))) continue;
      const basket = basketForRecipes(proposal, settings);
      const quality = planQuality(proposal, basket.totalCents, preferences);
      if (basket.totalCents <= limit && quality > bestQuality) { best = proposal; bestQuality = quality; }
    }
    if (!best) return failure(settings, 'Não há outra receita que permita esta troca dentro do orçamento e dos filtros atuais.', candidates.length);
    const result = resultFor(best, settings, candidates.length);
    result.slots = plan.slots.map((slot, index) => ({ ...slot, recipeId: best[index].id }));
    return result;
  } catch (error) {
    return failure(settings ?? input, error.message);
  }
}
