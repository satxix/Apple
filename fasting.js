/* Sustansya intermittent fasting: presets, timer, dashboard card, dedicated screen, history. */

const FASTING_PRESETS = {
  '16:8': { fastH: 16, eatH: 8, label: '16:8', sub: 'Classic \u2014 fast 16h, eat within 8h' },
  '18:6': { fastH: 18, eatH: 6, label: '18:6', sub: 'Fast 18h, eat within 6h' },
  '20:4': { fastH: 20, eatH: 4, label: '20:4', sub: 'Warrior \u2014 fast 20h, eat within 4h' },
  'omad': { fastH: 23, eatH: 1, label: 'OMAD', sub: 'One Meal A Day \u2014 fast 23h' }
};

function formatDurationShort(seconds) {
  seconds = Math.max(0, Math.round(seconds));
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  if (h <= 0) return m + 'm';
  return h + 'h ' + m + 'm';
}

function openFastPresetSheet() {
  let el = document.getElementById('fastPresetList');
  el.innerHTML = Object.keys(FASTING_PRESETS).map(k => {
    let p = FASTING_PRESETS[k];
    return `<button class="fastPresetOption" onclick="startFast('${k}')">
      <b>${p.label}</b><span class="sub">${p.sub}</span>
    </button>`;
  }).join('');
  openSheet('fastPresetSheet');
}

function startFast(key) {
  let preset = FASTING_PRESETS[key];
  if (!preset) return;
  data.fasting.active = { id: uid(), protocol: key, startTime: new Date().toISOString(), fastHours: preset.fastH };
  persist();
  closeSheets();
  toast('Fast started \u2014 ' + preset.label);
  renderFastingCard();
  refreshFastingScreenIfActive();
}

function endFast(auto) {
  let active = data.fasting.active;
  if (!active) return null;
  let start = new Date(active.startTime).getTime();
  let now = Date.now();
  let actualSeconds = Math.max(0, Math.round((now - start) / 1000));
  let plannedSeconds = active.fastHours * 3600;
  let completedGoal = actualSeconds >= plannedSeconds;
  data.fasting.history.push({
    id: active.id,
    protocol: active.protocol,
    startTime: active.startTime,
    endTime: new Date(now).toISOString(),
    actualSeconds,
    plannedSeconds,
    completedGoal,
    auto: !!auto
  });
  data.fasting.active = null;
  persist();
  renderFastingCard();
  refreshFastingScreenIfActive();
  return { actualSeconds, completedGoal };
}

function endFastManually() {
  if (!data.fasting.active) return;
  if (!confirm('End your fast now?')) return;
  let r = endFast(false);
  if (r) toast(r.completedGoal ? 'Fast completed \u2714\ufe0f' : 'Fast ended early');
}

function autoEndFastSuffix() {
  if (!data.fasting.active) return '';
  let r = endFast(true);
  if (!r) return '';
  return ' \u2022 Fast ' + (r.completedGoal ? 'completed' : 'ended') + ' (' + formatDurationShort(r.actualSeconds) + ')';
}

function refreshFastingScreenIfActive() {
  let scr = document.getElementById('fasting');
  if (scr && scr.classList.contains('active')) renderFastingScreen();
}

function fastRingSVG(pct, color, big) {
  let r = big ? 62 : 24;
  let c = 2 * Math.PI * r;
  pct = Math.max(0, Math.min(1, pct));
  let offset = c * (1 - pct);
  let size = big ? 148 : 60;
  let strokeW = big ? 12 : 6;
  let cx = size / 2, cy = size / 2;
  return `<svg viewBox="0 0 ${size} ${size}" class="${big ? 'fastRingBig' : 'fastRingSmall'}">
    <circle cx="${cx}" cy="${cy}" r="${r}" class="plateTrack" stroke-width="${strokeW}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dashoffset .4s ease"/>
  </svg>`;
}

function fastHeroInnerHTML(active) {
  let preset = FASTING_PRESETS[active.protocol] || { label: active.protocol };
  let start = new Date(active.startTime).getTime();
  let elapsed = Math.max(0, (Date.now() - start) / 1000);
  let planned = active.fastHours * 3600;
  let pct = Math.min(1, elapsed / planned);
  let remaining = planned - elapsed;
  let over = remaining < 0;
  let windowEnd = new Date(start + planned * 1000);
  return `
    <div class="fastLiveBadge"><span class="fastPulseDot"></span>${preset.label} Fast in progress</div>
    <div class="fastRingBigWrap">
      ${fastRingSVG(pct, over ? 'var(--gold)' : 'var(--calamansi)', true)}
      <div class="fastRingBigLabel">
        <div class="fastRingBigNum">${over ? '+' + formatDurationShort(-remaining) : formatDurationShort(Math.max(0, remaining))}</div>
        <div class="sub">${over ? 'over goal' : 'remaining'}</div>
      </div>
    </div>
    <div class="fastMetaRow"><span>Started ${new Date(start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span><span>Eat by ${windowEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>`;
}

function renderFastingCard() {
  let el = document.getElementById('fastingCard');
  if (!el) return;
  let active = data.fasting.active;

  if (!active) {
    el.classList.remove('fastingCardHero');
    let lastCompleted = [...data.fasting.history].reverse().find(h => h.completedGoal);
    el.innerHTML = `
      <div class="fastCardLeft" onclick="go('fasting',null)">
        <div class="fastRingWrap">${fastRingSVG(0, 'var(--calamansi)', false)}</div>
        <div>
          <div class="fastCardTitle">Not fasting</div>
          <div class="sub">${lastCompleted ? 'Last: ' + (FASTING_PRESETS[lastCompleted.protocol] || {}).label + ' completed' : 'Tap Start to begin a fast'}</div>
        </div>
      </div>
      <button class="fastBtn start" onclick="openFastPresetSheet()">Start Fast</button>`;
    return;
  }

  el.classList.add('fastingCardHero');
  el.innerHTML = `
    <div onclick="go('fasting',null)">${fastHeroInnerHTML(active)}</div>
    <button class="fastBtn end fastBtnFull" onclick="endFastManually()">End Fast</button>`;
}

function renderFastingScreen() {
  let active = data.fasting.active;
  let wrap = document.getElementById('fastScreenHero');
  if (active) {
    wrap.innerHTML = fastHeroInnerHTML(active) + `<button class="dangerBtn" onclick="endFastManually()">End Fast Now</button>`;
  } else {
    wrap.innerHTML = `
      <div class="fastEmptyHero">
        <div class="sub">No active fast</div>
        <button class="save" onclick="openFastPresetSheet()">Start a Fast</button>
      </div>`;
  }
  renderFastHistory();
}

function fastingStreak() {
  let days = new Set(data.fasting.history.filter(h => h.completedGoal).map(h => h.startTime.slice(0, 10)));
  let streak = 0;
  let d = new Date();
  if (!days.has(todayStr())) d.setDate(d.getDate() - 1);
  while (true) {
    let ds = new Date(d); ds.setMinutes(ds.getMinutes() - ds.getTimezoneOffset());
    let str = ds.toISOString().slice(0, 10);
    if (days.has(str)) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

function renderFastHistory() {
  let el = document.getElementById('fastHistoryList');
  let streak = fastingStreak();
  let streakEl = document.getElementById('fastStreakLabel');
  streakEl.textContent = streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} streak` : '';
  streakEl.classList.toggle('hide', streak <= 0);
  let items = [...data.fasting.history].reverse().slice(0, 40);
  if (!items.length) { el.innerHTML = `<div class="empty">No fasts logged yet.</div>`; return; }
  el.innerHTML = items.map(h => {
    let preset = FASTING_PRESETS[h.protocol] || { label: h.protocol };
    let d = new Date(h.startTime);
    return `<div class="logRow fastHistoryRow">
      <div class="logRowMain">
        <div class="logRowName">${preset.label} ${h.completedGoal ? '\u2714\ufe0f' : ''}</div>
        <div class="logRowSub">${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} \u00b7 ${formatDurationShort(h.actualSeconds)}${h.completedGoal ? '' : ' (goal ' + formatDurationShort(h.plannedSeconds) + ')'}</div>
      </div>
      <button class="fastHistoryDelete" onclick="deleteFastHistoryEntry('${h.id}')" aria-label="Delete">&times;</button>
    </div>`;
  }).join('');
}

function deleteFastHistoryEntry(id) {
  if (!confirm('Delete this fast from your history?')) return;
  data.fasting.history = data.fasting.history.filter(h => h.id !== id);
  persist();
  renderFastHistory();
}

/* Live-ish tick: fasting is minute-granularity in the UI, so a light interval is enough. */
setInterval(() => {
  if (!data.fasting || !data.fasting.active) return;
  let dash = document.getElementById('dashboard');
  let scr = document.getElementById('fasting');
  if (dash && dash.classList.contains('active')) renderFastingCard();
  if (scr && scr.classList.contains('active')) renderFastingScreen();
}, 30000);
