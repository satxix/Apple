/* Sustansya storage layer. Loaded first; defines `data`, persist(), normalizeData(). */

const STORAGE_KEY = 'sustansya_data_v1';

const DEFAULT_PROFILE = {
  sex: 'female',
  age: 28,
  heightCm: 160,
  weightKg: 60,
  activity: 'light',
  goal: 'maintain',
  goalRateKg: 0.5,
  autoTargets: true,
  targets: { calories: 2000, protein: 100, carbs: 220, fat: 65 }
};

const DEFAULT_SETTINGS = {
  dark: true,
  unit: 'kg',
  apiKey: '',
  aiModel: 'claude-haiku-4-5-20251001',
  defaultMeal: 'auto'
};

function emptyData() {
  return {
    app: 'Sustansya',
    version: '1.0',
    profile: { ...DEFAULT_PROFILE },
    settings: { ...DEFAULT_SETTINGS },
    foods: [],
    logs: [],
    weights: [],
    recipes: [],
    fasting: { active: null, history: [] }
  };
}

function normalizeData(raw) {
  let d = raw && typeof raw === 'object' ? raw : {};
  let out = emptyData();
  out.profile = { ...DEFAULT_PROFILE, ...(d.profile || {}) };
  out.profile.targets = { ...DEFAULT_PROFILE.targets, ...((d.profile && d.profile.targets) || {}) };
  out.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
  out.foods = Array.isArray(d.foods) ? d.foods : [];
  out.logs = Array.isArray(d.logs) ? d.logs : [];
  out.weights = Array.isArray(d.weights) ? d.weights : [];
  out.recipes = Array.isArray(d.recipes) ? d.recipes : [];
  out.fasting = {
    active: (d.fasting && d.fasting.active && typeof d.fasting.active === 'object') ? d.fasting.active : null,
    history: Array.isArray(d.fasting && d.fasting.history) ? d.fasting.history : []
  };
  return out;
}

function loadData() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeData(null);
    return normalizeData(JSON.parse(raw));
  } catch (e) {
    return normalizeData(null);
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Persist failed', e);
  }
}

let data = loadData();
