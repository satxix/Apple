/* Sustansya settings: profile/targets, API key, backup/restore, reset. */

function renderSettingsScreen() {
  let p = data.profile;
  document.getElementById('setSex').value = p.sex;
  document.getElementById('setAge').value = p.age;
  document.getElementById('setHeight').value = p.heightCm;
  document.getElementById('setWeight').value = p.weightKg;
  document.getElementById('setActivity').value = p.activity;
  document.getElementById('setGoal').value = p.goal;
  document.getElementById('setGoalRate').value = p.goalRateKg;
  document.getElementById('setGoalRateRow').classList.toggle('hide', p.goal === 'maintain');
  document.getElementById('setAutoTargets').checked = p.autoTargets;
  document.getElementById('manualTargetsBlock').classList.toggle('hide', p.autoTargets);
  document.getElementById('setTargetCal').value = p.targets.calories;
  document.getElementById('setTargetProtein').value = p.targets.protein;
  document.getElementById('setTargetCarbs').value = p.targets.carbs;
  document.getElementById('setTargetFat').value = p.targets.fat;
  document.getElementById('targetSummary').textContent =
    `${p.targets.calories} kcal \u00b7 ${p.targets.protein}p / ${p.targets.carbs}c / ${p.targets.fat}f per day`;
  document.getElementById('setApiKey').value = data.settings.apiKey || '';
  document.getElementById('setAiModel').value = data.settings.aiModel;
  document.getElementById('setDarkMode').checked = data.settings.dark;
}

function saveProfileField() {
  let p = data.profile;
  p.sex = document.getElementById('setSex').value;
  p.age = Number(document.getElementById('setAge').value) || p.age;
  p.heightCm = Number(document.getElementById('setHeight').value) || p.heightCm;
  p.weightKg = Number(document.getElementById('setWeight').value) || p.weightKg;
  p.activity = document.getElementById('setActivity').value;
  p.goal = document.getElementById('setGoal').value;
  p.goalRateKg = Number(document.getElementById('setGoalRate').value) || p.goalRateKg;
  document.getElementById('setGoalRateRow').classList.toggle('hide', p.goal === 'maintain');
  refreshAutoTargets();
  persist();
  renderSettingsScreen();
  toast('Saved');
}

function toggleAutoTargets() {
  data.profile.autoTargets = document.getElementById('setAutoTargets').checked;
  refreshAutoTargets();
  persist();
  renderSettingsScreen();
}

function saveManualTargets() {
  data.profile.targets = {
    calories: Number(document.getElementById('setTargetCal').value) || data.profile.targets.calories,
    protein: Number(document.getElementById('setTargetProtein').value) || data.profile.targets.protein,
    carbs: Number(document.getElementById('setTargetCarbs').value) || data.profile.targets.carbs,
    fat: Number(document.getElementById('setTargetFat').value) || data.profile.targets.fat
  };
  persist();
  renderSettingsScreen();
  toast('Targets updated');
}

function saveApiKey() {
  data.settings.apiKey = document.getElementById('setApiKey').value.trim();
  data.settings.aiModel = document.getElementById('setAiModel').value;
  persist();
  toast('API key saved on this device');
}

function clearApiKey() {
  if (!confirm('Remove the saved API key from this device?')) return;
  data.settings.apiKey = '';
  persist();
  renderSettingsScreen();
  toast('API key removed');
}

function toggleDarkMode() {
  data.settings.dark = document.getElementById('setDarkMode').checked;
  persist();
  applyDarkMode();
}

function exportBackup() {
  let payload = { app: 'Sustansya', version: data.version, exportedAt: new Date().toISOString(), data };
  let blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sustansya-backup-' + todayStr() + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup() {
  document.getElementById('restoreFile').click();
}

function handleRestore(input) {
  let file = input.files && input.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = () => {
    try {
      let payload = JSON.parse(reader.result);
      let incoming = payload.data || payload;
      if (!incoming || !Array.isArray(incoming.logs) || !Array.isArray(incoming.foods)) {
        throw new Error('This file doesn\u2019t look like a Sustansya backup.');
      }
      if (!confirm('Restore this backup? Current data on this device will be replaced.')) return;
      data = normalizeData(incoming);
      persist();
      applyDarkMode();
      renderSettingsScreen();
      go('dashboard', document.querySelectorAll('.nav button')[0]);
      toast('Backup restored');
    } catch (e) {
      alert('Could not restore backup: ' + e.message);
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (!confirm('This permanently deletes all logs, weights, recipes, and settings on this device. Continue?')) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  data = loadData();
  seedBaseFoods();
  seedRestaurantFoodsIfMissing();
  refreshAutoTargets();
  persist();
  applyDarkMode();
  renderSettingsScreen();
  go('dashboard', document.querySelectorAll('.nav button')[0]);
  toast('All data reset');
}
