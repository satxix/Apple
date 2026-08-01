/* Sustansya restaurant/fast-food database. Popular Philippine chains, sourced from published
   nutrition data (official brand sites, FatSecret, MyNetDiary, CarbManager) where available.
   Chains change recipes/portions by branch and promo, so treat these as good estimates, not
   lab-exact values -- same spirit as the rest of the built-in database. Loaded after foods.js. */

const RESTAURANT_FOODS = [
  // Jollibee
  { name: 'Chickenjoy 1pc (drumstick, w/ gravy)', brand: 'Jollibee', per100: { cal: 380, protein: 15, carbs: 15, fat: 21 }, serving: 100, servingLabel: '1pc drumstick' },
  { name: 'Chickenjoy 1pc (breast)', brand: 'Jollibee', per100: { cal: 320, protein: 36, carbs: 6, fat: 17 }, serving: 100, servingLabel: '1pc breast' },
  { name: 'Chickenjoy 2pc w/ rice', brand: 'Jollibee', per100: { cal: 520, protein: 35, carbs: 40, fat: 24 }, serving: 100, servingLabel: '2pc + rice' },
  { name: 'Jolly Spaghetti (solo)', brand: 'Jollibee', per100: { cal: 430, protein: 12, carbs: 65, fat: 13 }, serving: 100, servingLabel: '1 solo order' },
  { name: 'Yumburger (solo)', brand: 'Jollibee', per100: { cal: 260, protein: 10, carbs: 30, fat: 10 }, serving: 100, servingLabel: '1 burger' },
  { name: 'Peach Mango Pie', brand: 'Jollibee', per100: { cal: 230, protein: 2, carbs: 30, fat: 11 }, serving: 100, servingLabel: '1 pie' },
  { name: 'Chicken Nuggets (6pc)', brand: 'Jollibee', per100: { cal: 300, protein: 15, carbs: 20, fat: 18 }, serving: 100, servingLabel: '6 pieces' },

  // McDonald's Philippines
  { name: 'McSpaghetti (solo)', brand: "McDonald's", per100: { cal: 430, protein: 12, carbs: 65, fat: 14 }, serving: 100, servingLabel: '1 solo order' },
  { name: 'Chicken McDo 1pc w/ Rice', brand: "McDonald's", per100: { cal: 400, protein: 22, carbs: 45, fat: 15 }, serving: 100, servingLabel: '1pc + rice' },
  { name: 'Big Mac', brand: "McDonald's", per100: { cal: 550, protein: 25, carbs: 46, fat: 30 }, serving: 100, servingLabel: '1 burger' },
  { name: 'Cheeseburger', brand: "McDonald's", per100: { cal: 300, protein: 15, carbs: 33, fat: 12 }, serving: 100, servingLabel: '1 burger' },
  { name: 'French Fries (medium)', brand: "McDonald's", per100: { cal: 330, protein: 4, carbs: 42, fat: 16 }, serving: 100, servingLabel: '1 medium' },
  { name: 'McFlurry (regular)', brand: "McDonald's", per100: { cal: 340, protein: 8, carbs: 53, fat: 11 }, serving: 100, servingLabel: '1 regular cup' },

  // KFC Philippines
  { name: 'Original Recipe Chicken (1pc)', brand: 'KFC', per100: { cal: 280, protein: 20, carbs: 10, fat: 18 }, serving: 100, servingLabel: '1 piece' },
  { name: 'Zinger Burger', brand: 'KFC', per100: { cal: 480, protein: 23, carbs: 40, fat: 24 }, serving: 100, servingLabel: '1 burger' },
  { name: 'Chicken Popcorn (regular)', brand: 'KFC', per100: { cal: 300, protein: 15, carbs: 20, fat: 18 }, serving: 100, servingLabel: '1 regular' },

  // Chowking
  { name: 'Pork Chao Fan (bowl)', brand: 'Chowking', per100: { cal: 607, protein: 18, carbs: 96, fat: 15 }, serving: 100, servingLabel: '1 bowl' },
  { name: 'Pork Siomai (4pc)', brand: 'Chowking', per100: { cal: 240, protein: 10, carbs: 20, fat: 14 }, serving: 100, servingLabel: '4 pieces' },

  // Mang Inasal
  { name: 'Chicken Inasal Paa (leg quarter)', brand: 'Mang Inasal', per100: { cal: 500, protein: 35, carbs: 5, fat: 35 }, serving: 100, servingLabel: '1 quarter (leg)' },
  { name: 'Chicken Inasal Pecho (breast quarter)', brand: 'Mang Inasal', per100: { cal: 350, protein: 40, carbs: 3, fat: 18 }, serving: 100, servingLabel: '1 quarter (breast)' },
  { name: 'Garlic Rice', brand: 'Mang Inasal', per100: { cal: 200, protein: 4, carbs: 38, fat: 4 }, serving: 100, servingLabel: '1 cup' },

  // Greenwich
  { name: 'Pizza, Overload (1 slice)', brand: 'Greenwich', per100: { cal: 230, protein: 10, carbs: 25, fat: 10 }, serving: 100, servingLabel: '1 slice' },
  { name: 'Ham & Cheese Pasta', brand: 'Greenwich', per100: { cal: 450, protein: 15, carbs: 55, fat: 18 }, serving: 100, servingLabel: '1 solo order' },

  // Shakey's
  { name: 'Golden Fried Chicken (1pc, leg)', brand: "Shakey's", per100: { cal: 180, protein: 15, carbs: 6, fat: 10 }, serving: 100, servingLabel: '1 piece' },
  { name: 'Mojos (regular)', brand: "Shakey's", per100: { cal: 320, protein: 5, carbs: 40, fat: 15 }, serving: 100, servingLabel: '1 regular' },
  { name: "Pizza, Manager's Choice (1 slice)", brand: "Shakey's", per100: { cal: 250, protein: 11, carbs: 27, fat: 11 }, serving: 100, servingLabel: '1 slice' },

  // Bonchon
  { name: 'Soy Garlic Fried Chicken (2pc wings)', brand: 'Bonchon', per100: { cal: 230, protein: 14, carbs: 14, fat: 13 }, serving: 100, servingLabel: '2 wings' },
];

function seedRestaurantFoodsIfMissing() {
  if (data.foods.some(f => f.source === 'restaurant')) return;
  let added = RESTAURANT_FOODS.map((f, i) => ({
    id: 'rest_' + i,
    name: f.name,
    brand: f.brand,
    per100: f.per100,
    serving: f.serving,
    servingLabel: f.servingLabel,
    barcode: '',
    source: 'restaurant'
  }));
  data.foods = data.foods.concat(added);
}
