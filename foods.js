/* Sustansya base food database. Values are per 100g edible portion. Loaded before app.js. */

const BASE_FOODS = [
  // Staples
  { name: 'White rice, cooked', per100: { cal: 130, protein: 2.7, carbs: 28, fat: 0.3 }, serving: 160, servingLabel: '1 cup' },
  { name: 'Brown rice, cooked', per100: { cal: 123, protein: 2.7, carbs: 26, fat: 1.0 }, serving: 160, servingLabel: '1 cup' },
  { name: 'Bread, white', per100: { cal: 265, protein: 9, carbs: 49, fat: 3.2 }, serving: 30, servingLabel: '1 slice' },
  { name: 'Pandesal', per100: { cal: 289, protein: 8.7, carbs: 53, fat: 4.6 }, serving: 30, servingLabel: '1 piece' },
  { name: 'Instant noodles, cooked', per100: { cal: 145, protein: 3, carbs: 20, fat: 6 }, serving: 400, servingLabel: '1 pack cooked' },
  { name: 'Oatmeal, cooked', per100: { cal: 71, protein: 2.5, carbs: 12, fat: 1.5 }, serving: 234, servingLabel: '1 cup' },
  { name: 'Sweet potato (kamote), boiled', per100: { cal: 86, protein: 1.6, carbs: 20, fat: 0.1 }, serving: 130, servingLabel: '1 medium' },

  // Filipino viands
  { name: 'Chicken adobo', per100: { cal: 190, protein: 17, carbs: 3, fat: 12 }, serving: 150, servingLabel: '1 serving' },
  { name: 'Pork adobo', per100: { cal: 240, protein: 16, carbs: 3, fat: 18 }, serving: 150, servingLabel: '1 serving' },
  { name: 'Sinigang na baboy', per100: { cal: 110, protein: 9, carbs: 4, fat: 6 }, serving: 250, servingLabel: '1 bowl' },
  { name: 'Pancit canton', per100: { cal: 175, protein: 6, carbs: 22, fat: 7 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Lechon kawali', per100: { cal: 400, protein: 22, carbs: 2, fat: 34 }, serving: 120, servingLabel: '1 serving' },
  { name: 'Lumpiang shanghai', per100: { cal: 240, protein: 10, carbs: 16, fat: 15 }, serving: 90, servingLabel: '3 pieces' },
  { name: 'Tinolang manok', per100: { cal: 95, protein: 11, carbs: 4, fat: 4 }, serving: 250, servingLabel: '1 bowl' },
  { name: 'Kare-kare', per100: { cal: 180, protein: 12, carbs: 8, fat: 12 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Bicol express', per100: { cal: 220, protein: 10, carbs: 6, fat: 18 }, serving: 150, servingLabel: '1 serving' },
  { name: 'Menudo', per100: { cal: 150, protein: 11, carbs: 8, fat: 8 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Sisig', per100: { cal: 280, protein: 19, carbs: 3, fat: 21 }, serving: 180, servingLabel: '1 serving' },
  { name: 'Longganisa', per100: { cal: 300, protein: 14, carbs: 6, fat: 24 }, serving: 60, servingLabel: '2 links' },
  { name: 'Tapa (beef)', per100: { cal: 210, protein: 24, carbs: 4, fat: 11 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Tocino', per100: { cal: 260, protein: 16, carbs: 12, fat: 17 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Ginisang monggo', per100: { cal: 95, protein: 6, carbs: 13, fat: 2.5 }, serving: 250, servingLabel: '1 bowl' },
  { name: 'Pinakbet', per100: { cal: 75, protein: 3, carbs: 9, fat: 3 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Laing', per100: { cal: 150, protein: 4, carbs: 8, fat: 12 }, serving: 150, servingLabel: '1 serving' },
  { name: 'Chicken curry', per100: { cal: 165, protein: 12, carbs: 6, fat: 10 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Beef caldereta', per100: { cal: 200, protein: 15, carbs: 7, fat: 13 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Grilled bangus (milkfish)', per100: { cal: 190, protein: 20, carbs: 0, fat: 12 }, serving: 150, servingLabel: '1 piece' },
  { name: 'Daing na bangus, fried', per100: { cal: 230, protein: 21, carbs: 0, fat: 15 }, serving: 150, servingLabel: '1 piece' },
  { name: 'Tortang talong', per100: { cal: 150, protein: 6, carbs: 6, fat: 11 }, serving: 100, servingLabel: '1 piece' },

  // Proteins, generic
  { name: 'Chicken breast, grilled', per100: { cal: 165, protein: 31, carbs: 0, fat: 3.6 }, serving: 120, servingLabel: '1 piece' },
  { name: 'Chicken thigh, grilled', per100: { cal: 209, protein: 26, carbs: 0, fat: 11 }, serving: 100, servingLabel: '1 piece' },
  { name: 'Pork chop, grilled', per100: { cal: 231, protein: 27, carbs: 0, fat: 13 }, serving: 130, servingLabel: '1 piece' },
  { name: 'Beef, lean, grilled', per100: { cal: 217, protein: 26, carbs: 0, fat: 12 }, serving: 120, servingLabel: '1 serving' },
  { name: 'Ground pork, cooked', per100: { cal: 263, protein: 22, carbs: 0, fat: 19 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Egg, whole, boiled', per100: { cal: 155, protein: 13, carbs: 1.1, fat: 11 }, serving: 50, servingLabel: '1 large' },
  { name: 'Egg, fried', per100: { cal: 196, protein: 14, carbs: 0.8, fat: 15 }, serving: 55, servingLabel: '1 large' },
  { name: 'Tofu, firm', per100: { cal: 76, protein: 8, carbs: 1.9, fat: 4.8 }, serving: 100, servingLabel: '100g' },
  { name: 'Tilapia, grilled', per100: { cal: 128, protein: 26, carbs: 0, fat: 2.7 }, serving: 150, servingLabel: '1 piece' },
  { name: 'Shrimp, cooked', per100: { cal: 99, protein: 24, carbs: 0.2, fat: 0.3 }, serving: 100, servingLabel: '100g' },
  { name: 'Salmon, grilled', per100: { cal: 208, protein: 22, carbs: 0, fat: 13 }, serving: 120, servingLabel: '1 fillet' },
  { name: 'Canned tuna in water', per100: { cal: 116, protein: 26, carbs: 0, fat: 1 }, serving: 100, servingLabel: '1 can drained' },
  { name: 'Longsilog plate (rice+egg+longganisa)', per100: { cal: 220, protein: 8, carbs: 22, fat: 11 }, serving: 350, servingLabel: '1 plate' },

  // Fruits & veg
  { name: 'Banana (saba, boiled)', per100: { cal: 116, protein: 1.2, carbs: 31, fat: 0.3 }, serving: 100, servingLabel: '1 piece' },
  { name: 'Banana (lakatan)', per100: { cal: 98, protein: 1.1, carbs: 25, fat: 0.3 }, serving: 100, servingLabel: '1 piece' },
  { name: 'Mango, ripe', per100: { cal: 60, protein: 0.8, carbs: 15, fat: 0.4 }, serving: 150, servingLabel: '1 piece' },
  { name: 'Papaya', per100: { cal: 43, protein: 0.5, carbs: 11, fat: 0.3 }, serving: 150, servingLabel: '1 cup' },
  { name: 'Apple', per100: { cal: 52, protein: 0.3, carbs: 14, fat: 0.2 }, serving: 180, servingLabel: '1 medium' },
  { name: 'Watermelon', per100: { cal: 30, protein: 0.6, carbs: 8, fat: 0.2 }, serving: 280, servingLabel: '1 cup' },
  { name: 'Kangkong, sauteed', per100: { cal: 45, protein: 3, carbs: 4, fat: 2 }, serving: 150, servingLabel: '1 serving' },
  { name: 'Ampalaya, sauteed with egg', per100: { cal: 90, protein: 5, carbs: 4, fat: 6 }, serving: 150, servingLabel: '1 serving' },
  { name: 'Mixed vegetables, steamed', per100: { cal: 40, protein: 2, carbs: 8, fat: 0.3 }, serving: 150, servingLabel: '1 cup' },
  { name: 'Garden salad w/ dressing', per100: { cal: 110, protein: 2, carbs: 8, fat: 8 }, serving: 200, servingLabel: '1 bowl' },

  // Dairy & drinks
  { name: 'Milk, whole', per100: { cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 }, serving: 244, servingLabel: '1 cup' },
  { name: 'Milk, skim', per100: { cal: 34, protein: 3.4, carbs: 5, fat: 0.1 }, serving: 244, servingLabel: '1 cup' },
  { name: 'Coffee, black', per100: { cal: 2, protein: 0.1, carbs: 0, fat: 0 }, serving: 240, servingLabel: '1 cup' },
  { name: 'Coffee, 3-in-1 sachet', per100: { cal: 145, protein: 1.5, carbs: 22, fat: 5 }, serving: 30, servingLabel: '1 sachet' },
  { name: 'Softdrink, regular', per100: { cal: 41, protein: 0, carbs: 10.6, fat: 0 }, serving: 330, servingLabel: '1 can' },
  { name: 'Buko juice, fresh', per100: { cal: 19, protein: 0.7, carbs: 3.7, fat: 0.2 }, serving: 250, servingLabel: '1 glass' },
  { name: 'Beer', per100: { cal: 43, protein: 0.5, carbs: 3.6, fat: 0 }, serving: 330, servingLabel: '1 bottle' },
  { name: 'Yogurt, plain', per100: { cal: 61, protein: 3.5, carbs: 4.7, fat: 3.3 }, serving: 170, servingLabel: '1 cup' },

  // Snacks
  { name: 'Peanuts, roasted', per100: { cal: 585, protein: 24, carbs: 16, fat: 50 }, serving: 30, servingLabel: 'small handful' },
  { name: 'Banana cue', per100: { cal: 220, protein: 1, carbs: 45, fat: 5 }, serving: 90, servingLabel: '1 stick' },
  { name: 'Turon', per100: { cal: 260, protein: 2, carbs: 42, fat: 9 }, serving: 70, servingLabel: '1 piece' },
  { name: 'Puto', per100: { cal: 220, protein: 4, carbs: 46, fat: 2 }, serving: 40, servingLabel: '2 pieces' },
  { name: 'Biko', per100: { cal: 250, protein: 3, carbs: 47, fat: 6 }, serving: 80, servingLabel: '1 slice' },
  { name: 'Halo-halo', per100: { cal: 130, protein: 2, carbs: 22, fat: 4 }, serving: 300, servingLabel: '1 cup' },
  { name: 'Potato chips', per100: { cal: 536, protein: 6.6, carbs: 53, fat: 34 }, serving: 30, servingLabel: '1 small pack' },
  { name: 'Chicharon (pork rind)', per100: { cal: 544, protein: 61, carbs: 0, fat: 32 }, serving: 30, servingLabel: '1 small pack' },
  { name: 'Siopao asado', per100: { cal: 240, protein: 8, carbs: 38, fat: 6 }, serving: 120, servingLabel: '1 piece' },
  { name: 'French fries', per100: { cal: 312, protein: 3.4, carbs: 41, fat: 15 }, serving: 100, servingLabel: '1 small' },
  { name: 'Fried chicken (fast food)', per100: { cal: 250, protein: 20, carbs: 9, fat: 15 }, serving: 130, servingLabel: '1 piece' },
  { name: 'Cheeseburger (fast food)', per100: { cal: 260, protein: 13, carbs: 24, fat: 12 }, serving: 130, servingLabel: '1 burger' },
  { name: 'Spaghetti, Filipino style', per100: { cal: 175, protein: 5, carbs: 25, fat: 6 }, serving: 200, servingLabel: '1 serving' },

  // Desserts & sweets
  { name: 'Ice cream, vanilla', per100: { cal: 207, protein: 3.5, carbs: 24, fat: 11 }, serving: 65, servingLabel: '1 scoop' },
  { name: 'Ice cream, chocolate', per100: { cal: 216, protein: 3.8, carbs: 28, fat: 11 }, serving: 65, servingLabel: '1 scoop' },
  { name: 'Sorbetes (Filipino ice cream)', per100: { cal: 180, protein: 3, carbs: 25, fat: 8 }, serving: 70, servingLabel: '1 scoop' },
  { name: 'Chocolate bar', per100: { cal: 535, protein: 7.6, carbs: 59, fat: 30 }, serving: 40, servingLabel: '1 small bar' },
  { name: 'Choc-Nut', per100: { cal: 480, protein: 8, carbs: 55, fat: 25 }, serving: 20, servingLabel: '2 pieces' },
  { name: 'Cookies (generic)', per100: { cal: 480, protein: 5.9, carbs: 64, fat: 22 }, serving: 30, servingLabel: '3 pieces' },
  { name: 'Cassava cake', per100: { cal: 250, protein: 3, carbs: 40, fat: 9 }, serving: 100, servingLabel: '1 slice' },
  { name: 'Maja blanca', per100: { cal: 180, protein: 2, carbs: 30, fat: 6 }, serving: 100, servingLabel: '1 slice' },
  { name: 'Sapin-sapin', per100: { cal: 220, protein: 2, carbs: 45, fat: 4 }, serving: 80, servingLabel: '1 slice' },
  { name: 'Leche flan', per100: { cal: 260, protein: 5, carbs: 35, fat: 11 }, serving: 90, servingLabel: '1 slice' },
  { name: 'Ensaymada', per100: { cal: 350, protein: 6, carbs: 45, fat: 15 }, serving: 80, servingLabel: '1 piece' },
  { name: 'Taho', per100: { cal: 110, protein: 5, carbs: 18, fat: 2.5 }, serving: 250, servingLabel: '1 cup' },

  // Pantry staples / processed
  { name: 'Hotdog / frankfurter', per100: { cal: 290, protein: 11, carbs: 4, fat: 26 }, serving: 50, servingLabel: '1 piece' },
  { name: 'Corned beef (canned)', per100: { cal: 220, protein: 24, carbs: 0, fat: 13 }, serving: 100, servingLabel: '1/2 can' },
  { name: 'Luncheon meat / Spam', per100: { cal: 315, protein: 13, carbs: 3, fat: 28 }, serving: 60, servingLabel: '2 slices' },
  { name: 'Bihon guisado', per100: { cal: 140, protein: 4, carbs: 22, fat: 4 }, serving: 200, servingLabel: '1 serving' },
  { name: 'Sotanghon soup', per100: { cal: 70, protein: 4, carbs: 10, fat: 1.5 }, serving: 250, servingLabel: '1 bowl' },
  { name: 'Champorado', per100: { cal: 150, protein: 3, carbs: 28, fat: 3 }, serving: 250, servingLabel: '1 bowl' },

  // More vegetables & fruit
  { name: 'Eggplant (talong), sauteed', per100: { cal: 60, protein: 1.5, carbs: 8, fat: 2.5 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Okra, sauteed', per100: { cal: 45, protein: 2, carbs: 7, fat: 1 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Sitaw (string beans), sauteed', per100: { cal: 50, protein: 2.5, carbs: 8, fat: 1 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Kalabasa (squash), cooked', per100: { cal: 40, protein: 1, carbs: 9, fat: 0.2 }, serving: 100, servingLabel: '1 serving' },
  { name: 'Pineapple', per100: { cal: 50, protein: 0.5, carbs: 13, fat: 0.1 }, serving: 150, servingLabel: '1 cup' },
  { name: 'Avocado', per100: { cal: 160, protein: 2, carbs: 8.5, fat: 15 }, serving: 100, servingLabel: '1/2 medium' },

  // Drinks
  { name: 'Milo (chocolate drink, prepared)', per100: { cal: 55, protein: 1.5, carbs: 9, fat: 1.5 }, serving: 240, servingLabel: '1 cup' },
  { name: 'Iced tea (sweetened)', per100: { cal: 30, protein: 0, carbs: 8, fat: 0 }, serving: 350, servingLabel: '1 glass' },
  { name: 'Powdered juice drink (e.g. Tang)', per100: { cal: 25, protein: 0, carbs: 6, fat: 0 }, serving: 250, servingLabel: '1 glass' },
  { name: 'Dalandan / calamansi juice', per100: { cal: 25, protein: 0.3, carbs: 6, fat: 0.1 }, serving: 250, servingLabel: '1 glass' },
];

function seedBaseFoods() {
  let existingIds = new Set(data.foods.map(f => f.id));
  let missing = BASE_FOODS
    .map((f, i) => ({ f, id: 'base_' + i }))
    .filter(x => !existingIds.has(x.id));
  if (!missing.length) return;
  data.foods = data.foods.concat(missing.map(x => ({
    id: x.id,
    name: x.f.name,
    brand: '',
    per100: x.f.per100,
    serving: x.f.serving,
    servingLabel: x.f.servingLabel,
    barcode: '',
    source: 'base'
  })));
}
