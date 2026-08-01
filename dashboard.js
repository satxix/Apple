/* Sustansya dashboard rendering: Today's Plate ring + meal sections. */

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

function todaysLogs(dateStr) {
  let d = dateStr || todayStr();
  return data.logs.filter(l => l.date === d).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

function sumMacros(logs) {
  return logs.reduce((acc, l) => {
    acc.cal += l.cal || 0;
    acc.protein += l.protein || 0;
    acc.carbs += l.carbs || 0;
    acc.fat += l.fat || 0;
    return acc;
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

function computeStreak() {
  let days = new Set(data.logs.map(l => l.date));
  let streak = 0;
  let d = new Date();
  // allow today to be empty and still count yesterday-back streak
  if (!days.has(todayStr())) d.setDate(d.getDate() - 1);
  while (true) {
    let ds = new Date(d); ds.setMinutes(ds.getMinutes() - ds.getTimezoneOffset());
    let str = ds.toISOString().slice(0, 10);
    if (days.has(str)) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

function macroBar(label, value, target, colorVar) {
  let pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return `<div class="macroRow">
    <div class="macroLabel"><span>${label}</span><span class="macroNums">${roundInt(value)}<em>/${roundInt(target)}g</em></span></div>
    <div class="macroTrack"><div class="macroFill" style="width:${pct}%;background:${colorVar}"></div></div>
  </div>`;
}

function plateRingSVG(consumed, target) {
  let r = 78, c = 2 * Math.PI * r;
  let pct = target > 0 ? Math.min(1, consumed / target) : 0;
  let over = target > 0 && consumed > target;
  let offset = c * (1 - pct);
  let ringColor = over ? 'var(--chili)' : 'var(--mango)';
  let remaining = target - consumed;
  let centerLabel = over ? `${roundInt(Math.abs(remaining))}` : `${roundInt(Math.max(0, remaining))}`;
  let centerSub = over ? 'kcal over' : 'kcal left';
  return `<svg viewBox="0 0 200 200" class="plateRing">
    <circle cx="100" cy="100" r="${r}" class="plateTrack"/>
    <circle cx="100" cy="100" r="${r}" class="plateFill" stroke="${ringColor}"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
    <text x="100" y="94" text-anchor="middle" class="plateNum">${centerLabel}</text>
    <text x="100" y="118" text-anchor="middle" class="plateSub">${centerSub}</text>
  </svg>`;
}

function mealIcon(meal) {
  const icons = {
    Breakfast: '&#9788;',
    Lunch: '&#127869;',
    Dinner: '&#127860;',
    Snacks: '&#127821;'
  };
  return icons[meal] || '&#127860;';
}

function renderMealSections(logs, containerId, dateStr) {
  let el = document.getElementById(containerId);
  let html = '';
  MEAL_ORDER.forEach(meal => {
    let items = logs.filter(l => l.meal === meal);
    let mealTotal = sumMacros(items).cal;
    html += `<div class="mealBlock">
      <div class="mealHead">
        <div class="mealName"><span class="mealIcon">${mealIcon(meal)}</span>${meal}</div>
        <div class="mealHeadRight">
          ${items.length ? `<span class="mealKcal">${roundInt(mealTotal)} kcal</span>` : ''}
          <button class="mealAddBtn" onclick="openLogSearch('${meal}','${dateStr}')">+</button>
        </div>
      </div>
      ${items.length ? items.map(it => `
        <div class="logRow" onclick="editLogEntry('${it.id}')">
          <div class="logRowMain">
            <div class="logRowName">${escapeHtml(it.foodName)}</div>
            <div class="logRowSub">${escapeHtml(it.qtyLabel || '')}</div>
          </div>
          <div class="logRowCal">${roundInt(it.cal)} kcal</div>
        </div>`).join('') : `<div class="mealEmpty">Nothing logged yet</div>`}
    </div>`;
  });
  el.innerHTML = html;
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderDashboard() {
  let logs = todaysLogs();
  let totals = sumMacros(logs);
  let t = data.profile.targets;

  document.getElementById('dashDateLabel').textContent = fmtDateHuman(todayStr());
  document.getElementById('plateRingWrap').innerHTML = plateRingSVG(totals.cal, t.calories);
  document.getElementById('macroBars').innerHTML =
    macroBar('Protein', totals.protein, t.protein, 'var(--chili)') +
    macroBar('Carbs', totals.carbs, t.carbs, 'var(--gold)') +
    macroBar('Fat', totals.fat, t.fat, 'var(--sky)');

  let streak = computeStreak();
  let streakEl = document.getElementById('streakPill');
  if (streak > 0) {
    streakEl.classList.remove('hide');
    streakEl.textContent = `${streak} day${streak > 1 ? 's' : ''} streak`;
  } else {
    streakEl.classList.add('hide');
  }

  let w = [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
  let weightCard = document.getElementById('weightMiniCard');
  if (w.length) {
    let latest = w[w.length - 1];
    let prev = w.length > 1 ? w[w.length - 2] : null;
    let delta = prev ? latest.kg - prev.kg : 0;
    let deltaTxt = prev ? (delta === 0 ? 'No change' : `${delta > 0 ? '+' : ''}${round1(delta)} kg since last`) : 'First entry logged';
    weightCard.innerHTML = `<div class="wmLeft"><div class="wmLabel">Current weight</div><div class="wmValue">${round1(latest.kg)} kg</div></div><div class="wmDelta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}">${deltaTxt}</div>`;
  } else {
    weightCard.innerHTML = `<div class="wmLeft"><div class="wmLabel">Weight</div><div class="wmValue">Not logged</div></div><div class="wmDelta">Tap to add</div>`;
  }

  renderMealSections(logs, 'dashMeals', todayStr());
}
