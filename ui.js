/* Sustansya UI helpers: sheets, modal backdrop, FAB menu. Loaded last. */

function openSheet(id) {
  document.getElementById('modalBackdrop').classList.add('show');
  document.getElementById(id).classList.add('show');
}

function closeSheets() {
  document.querySelectorAll('.sheet.show').forEach(s => s.classList.remove('show'));
  document.getElementById('modalBackdrop').classList.remove('show');
  stopCamera();
}

function closeTopModal() {
  closeSheets();
}

function openFabMenu() {
  openSheet('fabSheet');
}

function fabAction(action) {
  closeSheets();
  if (action === 'search') { openLogSearch(); }
  if (action === 'barcode') { openScanner('barcode'); }
  if (action === 'photo') { openScanner('photo'); }
  if (action === 'quick') { openQuickAdd(); }
}
