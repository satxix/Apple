# Sustansya

An offline-first calorie & nutrition diary: search-based food logging, barcode
scanning (Open Food Facts), AI photo food recognition (your own Anthropic API
key), weight tracking, and saved recipes for one-tap logging.

## Upload to GitHub

Upload everything in this folder to the root of your GitHub Pages repo, keeping
the folder structure as-is:

- index.html
- styles.css
- manifest.json
- sw.js
- storage.js, foods.js, app.js, dashboard.js, food.js, scanner.js, weight.js,
  recipes.js, settings.js, ui.js
- icons/ (all icon-*.png files)

Then rebuild/re-sync the APK in PWABuilder so it points at the updated site.

## Camera permissions (barcode + AI photo scan)

Barcode scanning and AI photo scanning both use the device camera
(`getUserMedia`). When packaged via PWABuilder as a Trusted Web Activity, make
sure the generated Android project requests the `CAMERA` permission — PWABuilder
usually adds this automatically when it detects camera usage, but it's worth
checking `AndroidManifest.xml` before publishing if the camera prompt doesn't
appear on-device.

If a device doesn't support live barcode scanning (`BarcodeDetector` API isn't
available on all browsers/WebViews), the app falls back to manual barcode entry
automatically — no separate setup needed.

## AI Photo Scan needs a user-supplied API key

There's no backend here, so AI photo scanning calls the Anthropic API directly
from the device using a key the user pastes into Settings. That key is stored
only in the browser's local storage on that device — it is never sent anywhere
except `api.anthropic.com`, and Sustansya itself ships with no key baked in.
Users who don't want this feature can simply ignore it; everything else
(search, barcode, quick add, weight, recipes) works fully offline without a key.

## Data storage

All data (logs, foods, weights, recipes, settings) lives in `localStorage` on
the device, the same as PesoTrack. Use Settings → Export Backup / Restore
Backup to move data between devices or protect against clearing app storage.
