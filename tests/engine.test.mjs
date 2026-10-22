import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULT_SETTINGS, EQUIPMENT, INGREDIENTS, RECIPES, STORES, recipeProtein } from '../dist/data.mjs';
import { buildBasket, eligibleRecipes, generatePlan, recipeCostCents, replaceMeal } from '../dist/engine.mjs';

// Synthetic prices exist only in tests; production has no default price fallback.
const fixturePrices = Object.fromEntries(Object.keys(INGREDIENTS).map((id, index) => [id, 80 + index * 7]));
const settings = overrides => ({ ...DEFAULT_SETTINGS, prices: { ...fixturePrices }, priceStatus: 'verified', ...overrides });
const recipe = id => RECIPES.find(item => item.id === id);
const slot = recipeId => ({ day: 0, meal: 'lunch', recipeId });

function assertValidPlan(plan, config) {
  assert.equal(plan.ok, true, plan.reason);
  assert.equal(plan.slots.length, config.days * config.meals.length);
  assert.equal(new Set(plan.slots.map(item => `${item.day}:${item.meal}`)).size, plan.slots.length);
  const allowed = new Set(eligibleRecipes(config).map(item => item.id));
  for (const item of plan.slots) {
    assert(allowed.has(item.recipeId));
    assert(item.day >= 0 && item.day < config.days);
    assert(config.meals.includes(item.meal));
  }
  const basket = buildBasket(plan.slots, config);
  assert.deepEqual(plan.shopping, basket.items);
  assert.equal(plan.totalCents, basket.totalCents);
  assert(Number.isSafeInteger(plan.totalCents));
  assert(plan.totalCents <= Math.round(config.budget * 100));
  for (const item of plan.shopping) {
    if (!item.soldByWeight) assert(Number.isInteger(item.packs));
    assert(item.packs >= 0);
    if (!item.pantry) assert(item.packs * item.packQuantity + item.pantryQuantityUsed >= item.quantity);
  }
}

test('catalogue has complete practical recipes, known quantities and no fabricated prices', () => {
  assert(RECIPES.length >= 36);
  assert.equal(new Set(RECIPES.map(item => item.id)).size, RECIPES.length);
  const equipment = new Set(EQUIPMENT.map(item => item.id));
  const images = new Set(['salad', 'pasta', 'chicken', 'fish', 'rice', 'soup', 'eggs', 'legumes']);
  for (const item of RECIPES) {
    assert(item.name && item.description && item.minutes > 0);
    assert(item.steps.length >= 3);
    assert(item.steps.every(step => typeof step === 'string' && step.length > 25));
    assert(item.equipment.every(id => equipment.has(id)));
    assert(images.has(item.image));
    assert(['all', 'vegetarian', 'vegan'].includes(item.diet));
    for (const { id, quantity } of item.ingredients) {
      assert(INGREDIENTS[id]);
      assert(quantity > 0 && Number.isFinite(quantity));
    }
  }
  for (const [id, item] of Object.entries(INGREDIENTS)) {
    assert.equal(item.id, id);
    assert.equal(item.priceCents, null);
    assert(['g', 'ml', 'un'].includes(item.unit));
    assert(item.packQuantity > 0);
    assert(Array.isArray(item.allergens));
  }
  assert.equal(STORES.length, 6);
  assert(STORES.every(store => !Object.hasOwn(store, 'factor')));
});

test('every filter is mandatory; allergen exclusions derive from ingredients', () => {
  const config = settings({ proteins: ['chicken','fish'], maxMinutes: 30, exclude: ['gluten', 'soy', 'tomato'], equipment: ['knife', 'hob', 'pot', 'pan'] });
  const found = eligibleRecipes(config);
  assert(found.length > 0);
  for (const item of found) {
    assert(['chicken','fish'].includes(recipeProtein(item)));
    assert(item.minutes <= 30);
    assert(item.equipment.every(id => config.equipment.includes(id)));
    assert(item.ingredients.every(({ id }) => id !== 'tomato' && !INGREDIENTS[id].allergens.some(value => ['gluten', 'soy'].includes(value))));
  }
  const exclusions = ['gluten', 'milk', 'egg', 'fish', 'nuts', 'soy', 'shellfish'];
  const allEquipment = EQUIPMENT.map(item => item.id);
  for (const allergen of exclusions) {
    assert(RECIPES.some(item => item.ingredients.some(({ id }) => INGREDIENTS[id].allergens.includes(allergen))));
    assert(eligibleRecipes(settings({ exclude: [allergen], equipment: allEquipment })).every(item => item.ingredients.every(({ id }) => !INGREDIENTS[id].allergens.includes(allergen))));
  }
  assert(eligibleRecipes(settings({ diet: 'vegetarian' })).every(item => recipeProtein(item)));
  assert.equal(eligibleRecipes(settings({ equipment: [] })).length, 0);
});

test('basket aggregates before rounding full packs and uses integer cents', () => {
  const config = settings({ people: 2 });
  const basket = buildBasket([slot('omeleta-cogumelos'), slot('omeleta-cogumelos')], config);
  const eggs = basket.items.find(item => item.id === 'eggs');
  assert.equal(eggs.quantity, 8);
  assert.equal(eggs.packs, 2);
  const mushrooms = basket.items.find(item => item.id === 'mushrooms');
  assert.equal(mushrooms.quantity, 400);
  assert.equal(mushrooms.packs, 2);
  const bread = basket.items.find(item => item.id === 'bread');
  assert.equal(bread.quantity, 280);
  assert.equal(bread.packs, 1);
  assert.equal(basket.totalCents, basket.items.reduce((sum, item) => sum + item.packs * config.prices[item.id], 0));
  assert.equal(buildBasket([slot('salada-grao-atum'), slot('salada-grao-atum')], config).items.find(item => item.id === 'lemon').quantity, 120);
});

test('cooked lentil portions and weighed lemon match the actual retailer catalogue semantics', () => {
  assert.match(INGREDIENTS.lentils.name, /cozidas, escorridas/);
  assert.equal(INGREDIENTS.lentils.unit, 'g');
  assert.equal(INGREDIENTS.lemon.unit, 'g');
  assert.match(INGREDIENTS.lemon.name, /peso do fruto/);
  for (const item of RECIPES) {
    const lentils = item.ingredients.find(ingredient => ingredient.id === 'lentils');
    if (lentils) {
      assert(lentils.quantity >= 150 && lentils.quantity <= 180);
      assert.match(item.steps[0], /Escorra.*lentilhas cozidas/);
      assert.match(item.steps.join(' '), /aque[cç]/i);
      assert.doesNotMatch(item.steps.join(' '), /lentilhas secas|20 a 25 minutos/);
    }
    const lemon = item.ingredients.find(ingredient => ingredient.id === 'lemon');
    if (lemon) {
      // Small zest-only portions may use less whole-fruit equivalent than a juice dressing.
      assert(lemon.quantity >= 10 && lemon.quantity <= 100, 'whole-fruit grams per serving, not a fruit count');
      assert.match(item.steps.join(' '), /sumo|raspa|limão/);
    }
  }
  const catalogue = JSON.parse(readFileSync(new URL('../dist/prices-snapshot.json', import.meta.url), 'utf8'));
  for (const [store, entry] of Object.entries(catalogue.stores)) {
    for (const id of ['lentils', 'lemon']) {
      const product = entry.products.find(product => product.ingredientId === id);
      if (!product) continue;
      assert.equal(product.unit, INGREDIENTS[id].unit, `${store}: ${id}`);
      if (id === 'lentils') assert.equal(product.quantityBasis, 'drained');
      else assert(['per-kg','net'].includes(product.quantityBasis));
    }
  }
});

test('selected product pack sizes and explicit prices have no store multipliers', () => {
  for (const store of STORES) {
    const config = settings({ store: store.id, prices: { ...fixturePrices, eggs: 123 }, packQuantities: { eggs: 10, mushrooms: 400 } });
    const basket = buildBasket([slot('omeleta-cogumelos'), slot('omeleta-cogumelos')], config);
    const eggs = basket.items.find(item => item.id === 'eggs');
    assert.equal(eggs.packQuantity, 10);
    assert.equal(eggs.packs, 1);
    assert.equal(eggs.priceCents, 123);
    assert.equal(eggs.totalCents, 123);
    assert.equal(basket.items.find(item => item.id === 'mushrooms').packs, 1);
  }
});

test('recipe cost is consumed quantities for every person, not rounded packs', () => {
  const config = settings({ people: 3, packQuantities: { eggs: 10 } });
  const omelette = recipe('omeleta-cogumelos');
  const expected = Math.round(omelette.ingredients.reduce((sum, { id, quantity }) => sum + quantity * 3 / (config.packQuantities[id] ?? INGREDIENTS[id].packQuantity) * config.prices[id], 0));
  assert.equal(recipeCostCents(omelette, config), expected);
  assert(recipeCostCents(omelette, config) < buildBasket([slot(omelette.id)], config).totalCents);
});

test('products sold by weight obey real minimums and purchase steps after aggregation', () => {
  const config = settings({
    people: 1, prices: { ...fixturePrices, chicken: 699, zucchini: 129 },
    packQuantities: { chicken: 1000, zucchini: 1000 },
    purchaseRules: {
      chicken: { soldByWeight: true, minPurchaseQuantity: 1200, purchaseStepQuantity: 100 },
      zucchini: { soldByWeight: true, minPurchaseQuantity: 500, purchaseStepQuantity: 250 },
    },
  });
  const basket = buildBasket([slot('frango-curgete-arroz')], config);
  const chicken = basket.items.find(item => item.id === 'chicken');
  assert.equal(chicken.quantity, 150);
  assert.equal(chicken.purchaseQuantity, 1200);
  assert.equal(chicken.soldByWeight, true);
  assert.equal(chicken.packs, 1.2);
  assert.equal(chicken.totalCents, 839);
  const zucchini = basket.items.find(item => item.id === 'zucchini');
  assert.equal(zucchini.purchaseQuantity, 500);
  assert.equal(zucchini.totalCents, 65);
  const combined = buildBasket(Array.from({ length: 9 }, () => slot('frango-curgete-arroz')), config);
  assert.equal(combined.items.find(item => item.id === 'chicken').purchaseQuantity, 1400);
  assert.equal(combined.items.find(item => item.id === 'zucchini').purchaseQuantity, 1500);
  const pantry = buildBasket([slot('frango-curgete-arroz')], { ...config, pantry: ['chicken'] });
  assert.equal(pantry.items.find(item => item.id === 'chicken').purchaseQuantity, 0);
  assert.equal(pantry.items.find(item => item.id === 'chicken').totalCents, 0);
  assertValidPlan(generatePlan(config, { seed: 58 }), config);
});

test('pantry assumes sufficient quantity, removes purchase cost and needs no price', () => {
  const pantry = recipe('omeleta-cogumelos').ingredients.map(item => item.id);
  const config = settings({ pantry, prices: {} });
  const basket = buildBasket([slot('omeleta-cogumelos')], config);
  assert.equal(basket.totalCents, 0);
  assert(basket.items.every(item => item.pantry && item.packs === 0 && item.totalCents === 0));
  assert.equal(recipeCostCents(recipe('omeleta-cogumelos'), config), 0);
  const plan = generatePlan({ ...config, budget: 0.01 }, { seed: 21 });
  assertValidPlan(plan, { ...config, budget: 0.01 });
});

test('missing or unverified prices can never produce a successful paid plan', () => {
  for (const config of [settings({ prices: {} }), settings({ prices: { salt: 50 } }), settings({ priceStatus: 'unavailable' }), settings({ priceStatus: 'estimated' }), { ...DEFAULT_SETTINGS }]) {
    const plan = generatePlan(config, { seed: 1 });
    assert.equal(plan.ok, false);
    assert.match(plan.reason, /preços/i);
    assert.equal(plan.slots.length, 0);
  }
  assert.throws(() => buildBasket([slot('omeleta-cogumelos')], settings({ prices: {} })), /preço/i);
  assert.throws(() => recipeCostCents(recipe('omeleta-cogumelos'), settings({ priceStatus: 'unavailable' })), /catálogo/i);
});

test('partial verified price catalogue only enables fully priced recipes', () => {
  const ids = recipe('salada-grao-atum').ingredients.map(item => item.id);
  const config = settings({ budget: 250, equipment: ['knife'], prices: Object.fromEntries(ids.map(id => [id, fixturePrices[id]])) });
  const plan = generatePlan(config, { seed: 'partial' });
  assertValidPlan(plan, config);
  assert.equal(plan.eligibleCount, 1);
  assert(plan.slots.every(item => item.recipeId === 'salada-grao-atum'));
  assert.match(plan.note, /repete/);
});

test('default weekly plan is varied, feasible, deterministic and does not mutate settings', () => {
  const config = settings();
  const before = structuredClone(config);
  const plan = generatePlan(config, { seed: 42 });
  assertValidPlan(plan, config);
  assert.equal(new Set(plan.slots.map(item => item.recipeId)).size, 14);
  assert.deepEqual(generatePlan(config, { seed: 42 }), plan);
  assert.deepEqual(config, before);
  assert.notDeepEqual(generatePlan(config, { seed: 43 }).slots, plan.slots);
});

test('no search result succeeds above budget, including tight budgets and changing seeds', () => {
  let successes = 0;
  let failures = 0;
  for (const budget of [0.01, 10, 20, 35, 55, 85]) {
    for (const seed of [1, 12, 300]) {
      const config = settings({ budget });
      const plan = generatePlan(config, { seed });
      if (plan.ok) { successes++; assertValidPlan(plan, config); }
      else { failures++; assert(plan.reason); assert.equal(plan.slots.length, 0); }
    }
  }
  assert(successes > 0 && failures > 0);
});

test('impossible filters and very low budgets fail explicitly without minimum-cost claims', () => {
  const none = generatePlan(settings({ maxMinutes: 1 }), { seed: 2 });
  assert.equal(none.ok, false);
  assert.match(none.reason, /filtros/);
  const cheap = generatePlan(settings({ budget: 0.01 }), { seed: 2 });
  assert.equal(cheap.ok, false);
  assert.match(cheap.reason, /heurística/);
  assert.doesNotMatch(cheap.reason, /mínimo|mínima/);
});

test('settings bounds and malformed inputs return explicit failures', () => {
  const invalid = [
    { people: 0 }, { people: 13 }, { people: 1.5 }, { days: 0 }, { days: 15 },
    { budget: -1 }, { budget: 0 }, { budget: NaN }, { budget: Infinity }, { budget: 1.111 }, { budget: '85' },
    { meals: [] }, { meals: ['breakfast'] }, { meals: ['lunch', 'lunch'] }, { equipment: ['magic'] },
    { proteins: ['unknown'] }, { proteins: [] }, { pantryQuantities: { rice: -1 } }, { pantryQuantities: { rice: 1.0001 } }, { store: 'unknown' }, { maxMinutes: 0 }, { maxMinutes: 241 },
    { exclude: ['unknown'] }, { pantry: ['unknown'] }, { prices: { eggs: -1 } }, { prices: { eggs: 1.5 } },
    { prices: { unknown: 100 } }, { packQuantities: { eggs: 0 } }, { packQuantities: { eggs: 1.0001 } },
  ];
  for (const value of invalid) {
    const plan = generatePlan(settings(value));
    assert.equal(plan.ok, false, JSON.stringify(value));
    assert(plan.reason);
    assert.equal(eligibleRecipes(settings(value)).length, 0);
  }
  assert.equal(generatePlan(null).ok, false);
  assert.equal(generatePlan([]).ok, false);
  assert.throws(() => buildBasket([slot('missing')], settings()), /desconhecida/);
  assert.throws(() => buildBasket(null, settings()), /lista/);
});

test('lower and upper supported people/day bounds and selected meals work', () => {
  for (const config of [settings({ people: 1, days: 1, meals: ['dinner'] }), settings({ people: 12, days: 14, budget: 5000 })]) {
    assertValidPlan(generatePlan(config, { seed: 9 }), config);
  }
});

test('replacement changes exactly one recipe and preserves all constraints and budget', () => {
  const config = settings({ proteins: ['chicken','fish','eggs'], exclude: ['nuts'], maxMinutes: 35 });
  const plan = generatePlan(config, { seed: 6 });
  const before = structuredClone(plan);
  const swapped = replaceMeal(plan, 4, config, { seed: 51 });
  assertValidPlan(swapped, config);
  const differences = swapped.slots.map((item, index) => item.recipeId !== plan.slots[index].recipeId ? index : -1).filter(index => index >= 0);
  assert.deepEqual(differences, [4]);
  assert.deepEqual(plan, before);
  assert.deepEqual(replaceMeal(plan, 4, config, { seed: 51 }), swapped);
  for (let index = 0; index < plan.slots.length; index++) {
    assert.equal(swapped.slots[index].day, plan.slots[index].day);
    assert.equal(swapped.slots[index].meal, plan.slots[index].meal);
  }
});

test('replacement handles missing alternatives, invalid index and an impossible new budget', () => {
  const config = settings({ budget: 250, equipment: ['knife'], proteins: ['fish'] });
  const plan = generatePlan(config, { seed: 4 });
  assertValidPlan(plan, config);
  assert.equal(replaceMeal(plan, 0, config).ok, false);
  assert.equal(replaceMeal(plan, -1, config).ok, false);
  assert.equal(replaceMeal(plan, 100, config).ok, false);
  assert.equal(replaceMeal({ ...plan, ok: false }, 0, config).ok, false);
  assert.equal(replaceMeal(plan, 0, { ...config, budget: 0.01 }).ok, false);
  assert.equal(replaceMeal(plan, 0, { ...config, priceStatus: 'unavailable' }).ok, false);
});

test('replacement rejects stale constraints and malformed day/meal coverage', () => {
  const config = settings();
  const plan = generatePlan(config, { seed: 10 });
  assert.equal(replaceMeal(plan, 0, { ...config, equipment: [] }).ok, false);
  const duplicate = structuredClone(plan);
  duplicate.slots[1] = { ...duplicate.slots[0] };
  assert.equal(replaceMeal(duplicate, 0, config).ok, false);
});

test('regeneration preserves locked positions across seeds and diversifies the remaining slots', () => {
  // Isolate locked-position/diversity behaviour from the synthetic catalogue's rising prices.
  // The separate budget tests still exercise the default €85 weekly limit.
  const config = settings({ meals: ['dinner', 'lunch'], budget: 500 });
  const original = generatePlan(config, { seed: 31 });
  assertValidPlan(original, config);
  const lockedSlots = [original.slots[0], original.slots[5], original.slots[13]];
  const before = structuredClone(lockedSlots);
  for (const seed of [12, 75, 300]) {
    const plan = generatePlan(config, { seed, lockedSlots });
    assertValidPlan(plan, config);
    for (const locked of lockedSlots) assert.deepEqual(plan.slots.find(item => item.day === locked.day && item.meal === locked.meal), locked);
    assert(new Set(plan.slots.map(item => item.recipeId)).size >= 12);
    assert.deepEqual(generatePlan(config, { seed, lockedSlots }), plan);
  }
  assert.deepEqual(lockedSlots, before);
});

test('regeneration rejects malformed, duplicated, incompatible or unpriced locks explicitly', () => {
  const locked = { day: 0, meal: 'lunch', recipeId: 'frango-limao-forno' };
  const missingChicken = { ...fixturePrices };
  delete missingChicken.chicken;
  const invalid = [
    [settings(), null], [settings(), [null]], [settings(), [{ ...locked, day: -1 }]],
    [settings(), [{ ...locked, day: 7 }]], [settings(), [{ ...locked, meal: 'breakfast' }]],
    [settings(), [{ ...locked, recipeId: 'missing' }]], [settings(), [locked, { ...locked }]],
    [settings({ meals: ['dinner'] }), [locked]], [settings({ proteins: ['eggs'] }), [locked]],
    [settings({ maxMinutes: 20 }), [locked]], [settings({ equipment: ['knife'] }), [locked]],
    [settings({ prices: missingChicken }), [locked]],
  ];
  for (const [config, lockedSlots] of invalid) {
    const plan = generatePlan(config, { seed: 1, lockedSlots });
    assert.equal(plan.ok, false);
    assert.match(plan.reason, /bloquead/);
    assert.equal(plan.slots.length, 0);
  }
});

test('locked recipes cannot exceed budget and a completely locked plan is reproduced exactly', () => {
  const config = settings();
  const locked = { day: 0, meal: 'lunch', recipeId: 'frango-limao-forno' };
  const lockCost = buildBasket([locked], config).totalCents;
  const impossible = generatePlan({ ...config, budget: (lockCost - 1) / 100 }, { seed: 1, lockedSlots: [locked] });
  assert.equal(impossible.ok, false);
  assert.match(impossible.reason, /bloqueadas.*ultrapassam/);
  const original = generatePlan(config, { seed: 4 });
  const plan = generatePlan(config, { seed: 999, lockedSlots: original.slots });
  assertValidPlan(plan, config);
  assert.deepEqual(plan.slots, original.slots);
  assert.equal(plan.totalCents, original.totalCents);
});

test('selected animal proteins are mandatory and default plan balances available groups', () => {
  for (const proteins of [['chicken'], ['beef'], ['pork'], ['fish'], ['eggs'], ['shellfish']]) {
    const config=settings({proteins,budget:500,equipment:EQUIPMENT.map(e=>e.id)});
    const plan=generatePlan(config,{seed:55});assertValidPlan(plan,config);
    assert(plan.slots.every(s=>proteins.includes(recipeProtein(recipe(s.recipeId)))));
  }
  for(const seed of [8,91,301]){
    const config=settings({budget:500});const plan=generatePlan(config,{seed});assertValidPlan(plan,config);
    const groups=plan.slots.map(s=>recipeProtein(recipe(s.recipeId)));
    assert(groups.every(Boolean));assert(new Set(groups).size>=5);
    assert(Math.max(...[...new Set(groups)].map(g=>groups.filter(p=>p===g).length))<=5);
  }
});
test('finite pantry stock is subtracted once across the entire basket',()=>{
  const config=settings({people:1,pantryQuantities:{eggs:3,mushrooms:150},packQuantities:{eggs:6,mushrooms:200}});
  const basket=buildBasket([slot('omeleta-cogumelos'),slot('omeleta-cogumelos')],config);
  const eggs=basket.items.find(i=>i.id==='eggs'),mushrooms=basket.items.find(i=>i.id==='mushrooms');
  assert.equal(eggs.quantity,4);assert.equal(eggs.pantryQuantityUsed,3);assert.equal(eggs.packs,1);
  assert.equal(mushrooms.quantity,200);assert.equal(mushrooms.pantryQuantityUsed,150);assert.equal(mushrooms.packs,1);
  const covered=buildBasket([slot('omeleta-cogumelos')],config).items.find(i=>i.id==='eggs');assert.equal(covered.pantry,true);assert.equal(covered.totalCents,0);
});
