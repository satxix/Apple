/* Sustansya weight tracking: log entries + trend chart. */

let editingWeightId = null;

function openWeightSheet(id) {
  editingWeightId = id || null;
  let entry = id ? data.weights.find(w => w.id === id) : null;
  document.getElementById('weightDate').value = entry ? entry.date : todayStr();
  document.getElementById('weightKg').value = entry ? entry.kg : (data.weights.length ? data.weights[data.weights.length - 1].kg : data.profile.weightKg);
  document.getElementById('weightDeleteBtn').classList.toggle('hide', !id);
  openSheet('weightSheet');
}

function saveWeight() {
  let date = document.getElementById('weightDate').value || todayStr();
  let kg = Number(document.getElementById('weightKg').value);
  if (!kg || kg <= 0) { toast('Enter a valid weight'); return; }
  let existing = data.weights.find(w => w.date === date && w.id !== editingWeightId);
  if (existing) { existing.kg = kg; if (editingWeightId) data.weights = data.weights.filter(w => w.id !== editingWeightId); }
  else if (editingWeightId) {
    let e = data.weights.find(w => w.id === editingWeightId);
    if (e) { e.date = date; e.kg = kg; }
  } else {
    data.weights.push({ id: uid(), date, kg });
  }
  let sorted = [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
  data.profile.weightKg = sorted[sorted.length - 1].kg;
  refreshAutoTargets();
  persist();
  closeSheets();
  toast('Weight logged');
  renderWeightScreen();
  refreshCurrentViews();
}

function deleteWeight() {
  if (!editingWeightId) return;
  if (!confirm('Delete this weight entry?')) return;
  data.weights = data.weights.filter(w => w.id !== editingWeightId);
  persist();
  closeSheets();
  renderWeightScreen();
  refreshCurrentViews();
}

function weightChartSVG(entries) {
  if (entries.length < 2) return `<div class="chartEmpty">Log at least two entries to see your trend</div>`;
  let vals = entries.map(e => e.kg);
  let min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  let w = 320, h = 120, pad = 10;
  let pts = entries.map((e, i) => {
    let x = pad + (i / (entries.length - 1)) * (w - pad * 2);
    let y = h - pad - ((e.kg - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y];
  });
  let path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let dots = pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="var(--mango)"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" class="weightChart">
    <path d="${path}" fill="none" stroke="var(--mango)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
  </svg>`;
}

function renderWeightScreen() {
  let sorted = [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
  let recent = sorted.slice(-30);
  document.getElementById('weightChartWrap').innerHTML = weightChartSVG(recent);

  if (sorted.length) {
    let latest = sorted[sorted.length - 1];
    document.getElementById('weightCurrentVal').textContent = round1(latest.kg) + ' kg';
    let start = sorted[0];
    let totalDelta = latest.kg - start.kg;
    document.getElementById('weightTotalDelta').textContent = sorted.length > 1
      ? `${totalDelta > 0 ? '+' : ''}${round1(totalDelta)} kg since ${fmtDateHuman(start.date)}`
      : 'First entry';
  } else {
    document.getElementById('weightCurrentVal').textContent = '\u2014';
    document.getElementById('weightTotalDelta').textContent = 'No entries yet';
  }

  let listEl = document.getElementById('weightList');
  let reversed = [...sorted].reverse();
  listEl.innerHTML = reversed.length ? reversed.map(w => `
    <div class="logRow" onclick="openWeightSheet('${w.id}')">
      <div class="logRowMain"><div class="logRowName">${fmtDateHuman(w.date)}</div></div>
      <div class="logRowCal">${round1(w.kg)} kg</div>
    </div>`).join('') : `<div class="mealEmpty">No weight logged yet</div>`;
}
