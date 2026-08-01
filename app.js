/* Sustansya core: init, navigation, date/number helpers, target calculation. Loaded after storage.js/foods.js. */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayStr() {
  let d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function fmtDateHuman(str) {
  let d = new Date(str + 'T00:00:00');
  let today = todayStr();
  let yest = new Date(); yest.setDate(yest.getDate() - 1);
  let yestStr = yest.toISOString().slice(0, 10);
  if (str === today) return 'Today';
  if (str === yestStr) return 'Yesterday';
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function round1(n) { return Math.round(n * 10) / 10; }
function roundInt(n) { return Math.round(n); }

function guessMeal() {
  let h = new Date().getHours();
  if (h < 10) return 'Breakfast';
  if (h < 15) return 'Lunch';
  if (h < 18) return 'Snacks';
  return 'Dinner';
}

const ACTIVITY_MULT = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9
};

function calcTargets(profile) {
  let { sex, age, heightCm, weightKg, activity, goal, goalRateKg } = profile;
  let bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  let tdee = bmr * (ACTIVITY_MULT[activity] || 1.375);
  let delta = 0;
  if (goal === 'lose') delta = -(goalRateKg * 7700 / 7);
  if (goal === 'gain') delta = (goalRateKg * 7700 / 7);
  let calories = Math.max(1200, roundInt(tdee + delta));
  let protein = roundInt(weightKg * 1.8);
  let fat = roundInt((calories * 0.25) / 9);
  let carbs = Math.max(0, roundInt((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

function refreshAutoTargets() {
  if (data.profile.autoTargets) {
    data.profile.targets = calcTargets(data.profile);
  }
}

function go(screenId, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  let target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
  if (screenId === 'dashboard') renderDashboard();
  if (screenId === 'diary') renderDiary();
  if (screenId === 'weight') renderWeightScreen();
  if (screenId === 'recipes') renderRecipes();
  if (screenId === 'settings') renderSettingsScreen();
}

function toast(msg) {
  let t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function applyDarkMode() {
  document.body.classList.toggle('light', !data.settings.dark);
}

function initApp() {
  seedBaseFoodsIfEmpty();
  refreshAutoTargets();
  persist();
  applyDarkMode();
  document.getElementById('appVersionPill').textContent = 'v' + data.version;
  renderDashboard();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', initApp);
