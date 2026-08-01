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

/* ---------- Keyboard-aware sheets ----------
   On Android WebViews the on-screen keyboard can overlay fixed-position sheets
   instead of shrinking the viewport, hiding inputs/buttons below the fold.
   `interactive-widget=resizes-content` in the viewport meta tag fixes this on
   modern Chrome; this listener is a fallback that keeps sheets sized to the
   visible area and scrolls the focused field into view. */
if (window.visualViewport) {
  const vv = window.visualViewport;
  const applyViewportHeight = () => {
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
  };
  vv.addEventListener('resize', applyViewportHeight);
  vv.addEventListener('scroll', applyViewportHeight);
  applyViewportHeight();
}

document.addEventListener('focusin', e => {
  if (!e.target.matches('input, select, textarea')) return;
  const sheet = e.target.closest('.sheet');
  if (!sheet) return;
  setTimeout(() => {
    e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 300);
});
