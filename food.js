/* Sustansya food logging: search, log sheets, diary, CRUD. */

let searchMeal = null;
let searchDate = todayStr();
let editingLogId = null;
let activeFood = null; // {name, brand, per100, serving, servingLabel, barcode, source}
let diaryDate = todayStr();
let searchDebounce = null;

/* ---------- Search ---------- */

function openLogSearch(meal, dateStr) {
  searchMeal = meal || guessMeal();
  searchDate = dateStr || todayStr();
  document.getElementById('searchMealPill').textContent = searchMeal + ' \u00b7 ' + fmtDateHuman(searchDate);
  document.getElementById('foodSearchInput').value = '';
  document.getElementById('searchResults').innerHTML = renderQuickAddRow() + renderFavoritesSection();
  openSheet('searchSheet');
  setTimeout(() => document.getElementById('foodSearchInput').focus(), 200);
}

function renderQuickAddRow() {
  return `<button class="searchQuickAdd" onclick="openQuickAdd()">
    <span class="searchQuickAddIcon">+</span>
    <span><b>Quick add</b><br><span class="sub">Log calories &amp; macros directly</span></span>
  </button>`;
}

function renderFavoritesSection() {
  let favs = data.foods.filter(f => f.favorite);
  if (!favs.length) return '';
  return `<div class="searchSectionLabel">Favorites</div>` + favs.map(f => localFoodRow(f)).join('');
}

function onSearchInput(q) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => renderSearchResults(q.trim()), 220);
}

function renderSearchResults(q) {
  let el = document.getElementById('searchResults');
  if (!q) { el.innerHTML = renderQuickAddRow() + renderFavoritesSection(); return; }
  let qLower = q.toLowerCase();
  let local = data.foods.filter(f => f.name.toLowerCase().includes(qLower) || (f.brand && f.brand.toLowerCase().includes(qLower))).slice(0, 25);
  el.innerHTML = renderQuickAddRow() + local.map(f => localFoodRow(f)).join('');

  if (q.length >= 2 && navigator.onLine) {
    el.insertAdjacentHTML('beforeend', `<div class="searchLoading" id="offLoading">Searching online database...</div>`);
    fetchOffSearch(q).then(results => {
      let loading = document.getElementById('offLoading');
      if (loading) loading.remove();
      if (!results.length) return;
      let localIds = new Set(local.map(f => f.barcode).filter(Boolean));
      let filtered = results.filter(r => !localIds.has(r.barcode));
      if (filtered.length) {
        el.insertAdjacentHTML('beforeend', `<div class="searchSectionLabel">Online results</div>` + filtered.map(f => onlineFoodRow(f)).join(''));
      }
    }).catch(() => {
      let loading = document.getElementById('offLoading');
      if (loading) loading.remove();
    });
  }
}

function toggleFavorite(id, btnEl) {
  let f = data.foods.find(x => x.id === id);
  if (!f) return;
  f.favorite = !f.favorite;
  persist();
  let q = document.getElementById('foodSearchInput').value.trim();
  if (!q) { renderSearchResults(q); return; }
  if (btnEl) {
    btnEl.textContent = f.favorite ? '\u2605' : '\u2606';
    btnEl.classList.toggle('active', f.favorite);
  }
}

function localFoodRow(f) {
  let fav = !!f.favorite;
  return `<div class="foodRow" onclick="selectLocalFood('${f.id}')">
    <div class="foodRowMain"><b>${escapeHtml(f.name)}</b>${f.brand ? `<span class="foodBrand">${escapeHtml(f.brand)}</span>` : ''}</div>
    <div class="foodRowRight">
      <div class="foodRowCal">${roundInt(f.per100.cal)} kcal<span class="sub">/100g</span></div>
      <button class="favStar ${fav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavorite('${f.id}',this)" aria-label="Favorite">${fav ? '\u2605' : '\u2606'}</button>
    </div>
  </div>`;
}

function onlineFoodRow(f) {
  window._offCache = window._offCache || {};
  window._offCache[f.barcode] = f;
  let existing = data.foods.find(x => x.barcode === f.barcode);
  let fav = existing ? !!existing.favorite : false;
  return `<div class="foodRow" onclick="selectOnlineFood('${f.barcode}')">
    <div class="foodRowMain"><b>${escapeHtml(f.name)}</b>${f.brand ? `<span class="foodBrand">${escapeHtml(f.brand)}</span>` : ''}</div>
    <div class="foodRowRight">
      <div class="foodRowCal">${roundInt(f.per100.cal)} kcal<span class="sub">/100g</span></div>
      <button class="favStar ${fav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavoriteOnline('${f.barcode}',this)" aria-label="Favorite">${fav ? '\u2605' : '\u2606'}</button>
    </div>
  </div>`;
}

function toggleFavoriteOnline(barcode, btnEl) {
  let cached = (window._offCache || {})[barcode];
  if (!cached) return;
  let existing = data.foods.find(f => f.barcode === barcode);
  if (existing) {
    existing.favorite = !existing.favorite;
    persist();
    if (btnEl) {
      btnEl.textContent = existing.favorite ? '\u2605' : '\u2606';
      btnEl.classList.toggle('active', existing.favorite);
    }
    return;
  }
  // Not saved locally yet (never logged) -- save it now so it can actually be a favorite.
  data.foods.push({
    id: uid(),
    name: cached.name,
    brand: cached.brand || '',
    per100: cached.per100,
    serving: cached.serving || 100,
    servingLabel: cached.servingLabel || '100g',
    barcode: cached.barcode,
    source: 'off',
    favorite: true
  });
  persist();
  if (btnEl) {
    btnEl.textContent = '\u2605';
    btnEl.classList.add('active');
  }
}

function mapOffProducts(products) {
  return products
    .filter(p => p.product_name && p.nutriments && (p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal_serving']))
    .slice(0, 15)
    .map(p => ({
      name: p.product_name,
      brand: p.brands || '',
      barcode: p.code || '',
      per100: {
        cal: p.nutriments['energy-kcal_100g'] || 0,
        protein: p.nutriments['proteins_100g'] || 0,
        carbs: p.nutriments['carbohydrates_100g'] || 0,
        fat: p.nutriments['fat_100g'] || 0
      },
      serving: p.serving_quantity ? Number(p.serving_quantity) : 100,
      servingLabel: p.serving_size || '100g'
    }));
}

async function fetchOffSearchRaw(q, phOnly) {
  let url = 'https://world.openfoodfacts.org/cgi/search.pl?json=1&page_size=15&sort_by=unique_scans_n&search_terms=' + encodeURIComponent(q);
  if (phOnly) url += '&countries_tags_en=Philippines';
  let res = await fetch(url);
  if (!res.ok) return [];
  let json = await res.json();
  return mapOffProducts(json.products || []);
}

async function fetchOffSearch(q) {
  try {
    // Prefer products actually sold in the Philippines; Open Food Facts skews heavily
    // European/global otherwise, which buries relevant results under foreign packaged goods.
    let phResults = await fetchOffSearchRaw(q, true);
    if (phResults.length >= 3) return phResults;
    let globalResults = await fetchOffSearchRaw(q, false);
    let seen = new Set(phResults.map(r => r.barcode).filter(Boolean));
    return phResults.concat(globalResults.filter(r => !seen.has(r.barcode))).slice(0, 15);
  } catch (e) {
    return [];
  }
}

function selectLocalFood(id) {
  let f = data.foods.find(x => x.id === id);
  if (!f) return;
  activeFood = f;
  editingLogId = null;
  openLogFoodSheet();
}

function selectOnlineFood(barcode) {
  let f = (window._offCache || {})[barcode];
  if (!f) return;
  activeFood = f;
  editingLogId = null;
  openLogFoodSheet();
}

/* ---------- Log Food sheet (gram-based) ---------- */

function openLogFoodSheet() {
  closeSheets();
  document.getElementById('logFoodName').textContent = activeFood.name;
  document.getElementById('logFoodBrand').textContent = activeFood.brand || '';
  document.getElementById('logFoodBrand').classList.toggle('hide', !activeFood.brand);
  let baseServing = activeFood.serving || 100;
  document.getElementById('logFoodGrams').value = baseServing;
  let label = activeFood.servingLabel && activeFood.servingLabel !== '100g' ? activeFood.servingLabel : null;
  if (editingLogId) label = null;
  document.getElementById('logFoodServingHint').textContent = label
    ? `A typical serving is about ${label} (${roundInt(baseServing)}g)`
    : (editingLogId ? '' : `No preset serving for this item \u2014 defaulting to 100g`);
  renderGramChips(baseServing, label);
  renderMealPicker('logFoodMealPicker', searchMeal);
  updateLogFoodPreview();
  document.getElementById('logFoodDeleteBtn').classList.toggle('hide', !editingLogId);
  document.getElementById('portionGuideBlock').classList.add('hide');
  openSheet('logFoodSheet');
}

function renderGramChips(baseServing, label) {
  let mults = [
    { m: 0.5, txt: '0.5x' },
    { m: 1, txt: label ? label : '1x' },
    { m: 1.5, txt: '1.5x' },
    { m: 2, txt: '2x' }
  ];
  document.getElementById('gramChipsRow').innerHTML = mults.map(x =>
    `<button type="button" onclick="setLogFoodGramsFromChip(${x.m})">${escapeHtml(x.txt)}</button>`
  ).join('');
}

function togglePortionGuide() {
  document.getElementById('portionGuideBlock').classList.toggle('hide');
}

function setLogFoodGramsFromChip(mult) {
  let base = activeFood.serving || 100;
  document.getElementById('logFoodGrams').value = Math.round(base * mult);
  updateLogFoodPreview();
}

function updateLogFoodPreview() {
  let grams = Number(document.getElementById('logFoodGrams').value) || 0;
  let f = activeFood.per100;
  let ratio = grams / 100;
  document.getElementById('logFoodPreview').innerHTML = `
    <div class="previewCal">${roundInt(f.cal * ratio)} <span>kcal</span></div>
    <div class="previewMacros">
      <span><b>${roundInt(f.protein * ratio)}g</b> protein</span>
      <span><b>${roundInt(f.carbs * ratio)}g</b> carbs</span>
      <span><b>${roundInt(f.fat * ratio)}g</b> fat</span>
    </div>`;
}

function renderMealPicker(containerId, selected) {
  let el = document.getElementById(containerId);
  el.innerHTML = MEAL_ORDER.map(m =>
    `<button type="button" class="mealPickBtn ${m === selected ? 'active' : ''}" data-meal="${m}" onclick="pickMeal('${containerId}',this)">${m}</button>`
  ).join('');
}

function pickMeal(containerId, btn) {
  document.querySelectorAll('#' + containerId + ' .mealPickBtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function getPickedMeal(containerId) {
  let active = document.querySelector('#' + containerId + ' .mealPickBtn.active');
  return active ? active.dataset.meal : guessMeal();
}

function saveLogFood() {
  let grams = Number(document.getElementById('logFoodGrams').value) || 0;
  if (grams <= 0) { toast('Enter a valid amount'); return; }
  let ratio = grams / 100;
  let f = activeFood.per100;
  let meal = getPickedMeal('logFoodMealPicker');
  let entry = {
    id: editingLogId || uid(),
    date: searchDate,
    meal,
    time: new Date().toTimeString().slice(0, 5),
    foodName: activeFood.name,
    brand: activeFood.brand || '',
    mode: 'food',
    per100: activeFood.per100,
    grams,
    qtyLabel: `${grams}g`,
    cal: f.cal * ratio,
    protein: f.protein * ratio,
    carbs: f.carbs * ratio,
    fat: f.fat * ratio,
    source: activeFood.source || 'off'
  };
  if (activeFood.barcode && !data.foods.some(x => x.barcode === activeFood.barcode)) {
    data.foods.push({
      id: uid(), name: activeFood.name, brand: activeFood.brand || '',
      per100: activeFood.per100, serving: activeFood.serving || 100,
      servingLabel: activeFood.servingLabel || '100g', barcode: activeFood.barcode, source: 'off'
    });
  }
  let wasNewEntry = !editingLogId;
  if (editingLogId) {
    let idx = data.logs.findIndex(l => l.id === editingLogId);
    if (idx >= 0) data.logs[idx] = entry; else data.logs.push(entry);
  } else {
    data.logs.push(entry);
  }
  persist();
  closeSheets();
  toast('Logged to ' + meal + (wasNewEntry ? autoEndFastSuffix() : ''));
  refreshCurrentViews();
}

/* ---------- Quick add sheet (manual / AI) ---------- */

function openQuickAdd(prefill) {
  closeSheets();
  editingLogId = (prefill && prefill.editingId) || null;
  document.getElementById('quickName').value = (prefill && prefill.name) || '';
  document.getElementById('quickCal').value = (prefill && prefill.cal) || '';
  document.getElementById('quickProtein').value = (prefill && prefill.protein) || '';
  document.getElementById('quickCarbs').value = (prefill && prefill.carbs) || '';
  document.getElementById('quickFat').value = (prefill && prefill.fat) || '';
  document.getElementById('quickAiNote').classList.toggle('hide', !(prefill && prefill.aiNote));
  if (prefill && prefill.aiNote) document.getElementById('quickAiNote').textContent = prefill.aiNote;
  renderMealPicker('quickMealPicker', (prefill && prefill.meal) || searchMeal || guessMeal());
  document.getElementById('quickDeleteBtn').classList.toggle('hide', !editingLogId);
  openSheet('quickAddSheet');
  setTimeout(() => document.getElementById('quickName').focus(), 200);
}

function saveQuickAdd() {
  let name = document.getElementById('quickName').value.trim() || 'Quick add';
  let cal = Number(document.getElementById('quickCal').value) || 0;
  let protein = Number(document.getElementById('quickProtein').value) || 0;
  let carbs = Number(document.getElementById('quickCarbs').value) || 0;
  let fat = Number(document.getElementById('quickFat').value) || 0;
  if (cal <= 0 && protein <= 0 && carbs <= 0 && fat <= 0) { toast('Enter at least calories or a macro'); return; }
  let meal = getPickedMeal('quickMealPicker');
  let entry = {
    id: editingLogId || uid(),
    date: searchDate || todayStr(),
    meal,
    time: new Date().toTimeString().slice(0, 5),
    foodName: name,
    brand: '',
    mode: 'quick',
    per100: null,
    grams: null,
    qtyLabel: 'Quick add',
    cal, protein, carbs, fat,
    source: 'manual'
  };
  let wasNewEntry = !editingLogId;
  if (editingLogId) {
    let idx = data.logs.findIndex(l => l.id === editingLogId);
    if (idx >= 0) data.logs[idx] = entry; else data.logs.push(entry);
  } else {
    data.logs.push(entry);
  }
  persist();
  closeSheets();
  toast('Logged to ' + meal + (wasNewEntry ? autoEndFastSuffix() : ''));
  refreshCurrentViews();
}

/* ---------- Edit / delete existing log entries ---------- */

function editLogEntry(id) {
  let log = data.logs.find(l => l.id === id);
  if (!log) return;
  editingLogId = id;
  searchDate = log.date;
  searchMeal = log.meal;
  if (log.mode === 'food' && log.per100) {
    activeFood = { name: log.foodName, brand: log.brand, per100: log.per100, serving: log.grams, servingLabel: log.qtyLabel, barcode: '', source: log.source };
    openLogFoodSheet();
  } else {
    openQuickAdd({ editingId: id, name: log.foodName, cal: roundInt(log.cal), protein: roundInt(log.protein), carbs: roundInt(log.carbs), fat: roundInt(log.fat), meal: log.meal, aiNote: log.mode === 'ai' ? 'Originally logged from an AI photo scan.' : null });
  }
}

function deleteEditingLog() {
  if (!editingLogId) return;
  if (!confirm('Remove this entry from your diary?')) return;
  data.logs = data.logs.filter(l => l.id !== editingLogId);
  persist();
  closeSheets();
  toast('Entry removed');
  refreshCurrentViews();
}

function refreshCurrentViews() {
  if (document.getElementById('dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('diary').classList.contains('active')) renderDiary();
}

/* ---------- Diary screen ---------- */

function shiftDiaryDate(delta) {
  let d = new Date(diaryDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  diaryDate = toLocalDateStr(d);
  renderDiary();
}

function renderDiary() {
  document.getElementById('diaryDateLabel').textContent = fmtDateHuman(diaryDate);
  document.getElementById('diaryNextBtn').disabled = diaryDate >= todayStr();
  let logs = todaysLogs(diaryDate);
  let totals = sumMacros(logs);
  document.getElementById('diaryTotals').innerHTML = logs.length
    ? `${roundInt(totals.cal)} kcal &middot; ${roundInt(totals.protein)}p / ${roundInt(totals.carbs)}c / ${roundInt(totals.fat)}f`
    : 'Nothing logged this day';
  renderMealSections(logs, 'diaryMeals', diaryDate);
}
