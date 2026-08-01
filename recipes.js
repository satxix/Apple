/* Sustansya recipes: saved meal templates, one-tap logging. */

let editingRecipeId = null;
let recipeQtyState = {};

function openRecipeSheet(id) {
  editingRecipeId = id || null;
  let r = id ? data.recipes.find(x => x.id === id) : null;
  document.getElementById('recipeName').value = r ? r.name : '';
  document.getElementById('recipeServings').value = r ? r.servings : 1;
  document.getElementById('recipeCal').value = r ? r.cal : '';
  document.getElementById('recipeProtein').value = r ? r.protein : '';
  document.getElementById('recipeCarbs').value = r ? r.carbs : '';
  document.getElementById('recipeFat').value = r ? r.fat : '';
  document.getElementById('recipeNote').value = r ? (r.note || '') : '';
  document.getElementById('recipeDeleteBtn').classList.toggle('hide', !id);
  document.getElementById('recipeSheetTitle').textContent = id ? 'Edit Recipe' : 'New Recipe';
  openSheet('recipeSheet');
}

function saveRecipe() {
  let name = document.getElementById('recipeName').value.trim();
  if (!name) { toast('Give your recipe a name'); return; }
  let entry = {
    id: editingRecipeId || uid(),
    name,
    servings: Number(document.getElementById('recipeServings').value) || 1,
    cal: Number(document.getElementById('recipeCal').value) || 0,
    protein: Number(document.getElementById('recipeProtein').value) || 0,
    carbs: Number(document.getElementById('recipeCarbs').value) || 0,
    fat: Number(document.getElementById('recipeFat').value) || 0,
    note: document.getElementById('recipeNote').value.trim()
  };
  if (editingRecipeId) {
    let idx = data.recipes.findIndex(r => r.id === editingRecipeId);
    if (idx >= 0) data.recipes[idx] = entry; else data.recipes.push(entry);
  } else {
    data.recipes.push(entry);
  }
  persist();
  closeSheets();
  toast('Recipe saved');
  renderRecipes();
}

function deleteRecipe() {
  if (!editingRecipeId) return;
  if (!confirm('Delete this recipe?')) return;
  data.recipes = data.recipes.filter(r => r.id !== editingRecipeId);
  persist();
  closeSheets();
  renderRecipes();
}

function adjustRecipeQty(id, delta) {
  let q = (recipeQtyState[id] || 1) + delta;
  recipeQtyState[id] = Math.max(0.5, Math.round(q * 2) / 2);
  renderRecipes();
}

function logRecipe(id) {
  let r = data.recipes.find(x => x.id === id);
  if (!r) return;
  let qty = recipeQtyState[id] || 1;
  let meal = guessMeal();
  data.logs.push({
    id: uid(),
    date: todayStr(),
    meal,
    time: new Date().toTimeString().slice(0, 5),
    foodName: r.name,
    brand: '',
    mode: 'quick',
    per100: null,
    grams: null,
    qtyLabel: qty === 1 ? '1 serving' : qty + ' servings',
    cal: r.cal * qty,
    protein: r.protein * qty,
    carbs: r.carbs * qty,
    fat: r.fat * qty,
    source: 'recipe'
  });
  persist();
  toast('Logged ' + r.name + ' to ' + meal + autoEndFastSuffix());
  recipeQtyState[id] = 1;
  refreshCurrentViews();
  renderRecipes();
}

function renderRecipes() {
  let el = document.getElementById('recipeList');
  if (!data.recipes.length) {
    el.innerHTML = `<div class="empty">No recipes yet. Save meals you eat often for one-tap logging.</div>`;
    return;
  }
  el.innerHTML = data.recipes.map(r => {
    let qty = recipeQtyState[r.id] || 1;
    return `<div class="recipeCard">
      <div class="recipeCardTop" onclick="openRecipeSheet('${r.id}')">
        <div class="recipeName">${escapeHtml(r.name)}</div>
        <div class="recipeMacros">${roundInt(r.cal)} kcal &middot; ${roundInt(r.protein)}p / ${roundInt(r.carbs)}c / ${roundInt(r.fat)}f <span class="sub">per serving</span></div>
        ${r.note ? `<div class="recipeNote">${escapeHtml(r.note)}</div>` : ''}
      </div>
      <div class="recipeCardActions">
        <div class="qtyStepper">
          <button onclick="adjustRecipeQty('${r.id}',-0.5)">&minus;</button>
          <span>${qty}x</span>
          <button onclick="adjustRecipeQty('${r.id}',0.5)">+</button>
        </div>
        <button class="recipeLogBtn" onclick="logRecipe('${r.id}')">Log</button>
      </div>
    </div>`;
  }).join('');
}
