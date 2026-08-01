/* Sustansya scanner: barcode (camera + Open Food Facts) and AI photo food recognition. */

let scannerMode = 'barcode';
let cameraStream = null;
let barcodeLoopId = null;
let capturedPhotoDataUrl = null;

function openScanner(mode) {
  scannerMode = mode;
  searchMeal = searchMeal || guessMeal();
  searchDate = searchDate || todayStr();
  document.getElementById('scannerTitle').textContent = mode === 'barcode' ? 'Scan Barcode' : 'AI Photo Scan';
  document.getElementById('barcodeUi').classList.toggle('hide', mode !== 'barcode');
  document.getElementById('photoUi').classList.toggle('hide', mode !== 'photo');
  document.getElementById('scanStatus').textContent = '';
  capturedPhotoDataUrl = null;
  document.getElementById('photoPreviewWrap').classList.add('hide');
  document.getElementById('photoCaptureRow').classList.remove('hide');
  document.getElementById('photoConfirmRow').classList.add('hide');
  openSheet('scannerSheet');
  if (mode === 'barcode') startBarcodeScan();
  else startPhotoCamera();
}

async function startCameraStream(facingMode) {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode || 'environment' }, audio: false });
    let video = document.getElementById('scannerVideo');
    video.srcObject = cameraStream;
    await video.play();
    return video;
  } catch (e) {
    document.getElementById('scanStatus').textContent = 'Camera unavailable. Grant camera permission, or use manual entry / gallery upload below.';
    return null;
  }
}

function stopCamera() {
  if (barcodeLoopId) cancelAnimationFrame(barcodeLoopId);
  barcodeLoopId = null;
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
}

async function startBarcodeScan() {
  let video = await startCameraStream('environment');
  if (!video) return;
  if (!('BarcodeDetector' in window)) {
    document.getElementById('scanStatus').textContent = 'Live scanning isn\u2019t supported on this device. Type the barcode number below instead.';
    return;
  }
  let detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
  document.getElementById('scanStatus').textContent = 'Point your camera at the barcode';
  const loop = async () => {
    if (!cameraStream) return;
    try {
      let codes = await detector.detect(video);
      if (codes.length) {
        let code = codes[0].rawValue;
        document.getElementById('scanStatus').textContent = 'Found: ' + code + ' \u2014 looking it up...';
        stopCamera();
        await lookupBarcode(code);
        return;
      }
    } catch (e) { /* keep trying */ }
    barcodeLoopId = requestAnimationFrame(loop);
  };
  barcodeLoopId = requestAnimationFrame(loop);
}

async function lookupBarcodeManual() {
  let code = document.getElementById('manualBarcode').value.trim();
  if (!code) return;
  document.getElementById('scanStatus').textContent = 'Looking up ' + code + '...';
  await lookupBarcode(code);
}

async function lookupBarcode(code) {
  try {
    let res = await fetch('https://world.openfoodfacts.org/api/v0/product/' + encodeURIComponent(code) + '.json');
    let json = await res.json();
    if (json.status !== 1 || !json.product) {
      document.getElementById('scanStatus').textContent = 'No product found for that barcode. Try Quick Add instead.';
      return;
    }
    let p = json.product;
    let n = p.nutriments || {};
    if (!n['energy-kcal_100g']) {
      document.getElementById('scanStatus').textContent = 'Found the product but it has no nutrition data. Try Quick Add instead.';
      return;
    }
    activeFood = {
      name: p.product_name || 'Scanned item',
      brand: p.brands || '',
      per100: {
        cal: n['energy-kcal_100g'] || 0,
        protein: n['proteins_100g'] || 0,
        carbs: n['carbohydrates_100g'] || 0,
        fat: n['fat_100g'] || 0
      },
      serving: p.serving_quantity ? Number(p.serving_quantity) : 100,
      servingLabel: p.serving_size || '100g',
      barcode: code,
      source: 'off'
    };
    editingLogId = null;
    closeSheets();
    openLogFoodSheet();
  } catch (e) {
    document.getElementById('scanStatus').textContent = 'Couldn\u2019t reach the food database. Check your connection and try again.';
  }
}

/* ---------- AI Photo scan ---------- */

async function startPhotoCamera() {
  if (!data.settings.apiKey) {
    document.getElementById('scanStatus').innerHTML = 'Add your Anthropic API key in Settings to use AI photo scanning. <a href="#" onclick="closeSheets();go(\'settings\',null);return false;">Open Settings</a>';
  }
  await startCameraStream('environment');
}

function capturePhoto() {
  let video = document.getElementById('scannerVideo');
  if (!video || !video.videoWidth) { toast('Camera not ready yet'); return; }
  let canvas = document.createElement('canvas');
  let maxDim = 1024;
  let scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  showCapturedPhoto();
}

function handleGalleryFile(input) {
  let file = input.files && input.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = () => {
    let img = new Image();
    img.onload = () => {
      let canvas = document.createElement('canvas');
      let maxDim = 1024;
      let scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      showCapturedPhoto();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function showCapturedPhoto() {
  stopCamera();
  document.getElementById('photoPreviewImg').src = capturedPhotoDataUrl;
  document.getElementById('photoPreviewWrap').classList.remove('hide');
  document.getElementById('photoCaptureRow').classList.add('hide');
  document.getElementById('photoConfirmRow').classList.remove('hide');
}

function retakePhoto() {
  capturedPhotoDataUrl = null;
  document.getElementById('photoPreviewWrap').classList.add('hide');
  document.getElementById('photoCaptureRow').classList.remove('hide');
  document.getElementById('photoConfirmRow').classList.add('hide');
  startPhotoCamera();
}

async function analyzeCapturedPhoto() {
  if (!capturedPhotoDataUrl) return;
  if (!data.settings.apiKey) {
    toast('Add your Anthropic API key in Settings first');
    closeSheets();
    go('settings', null);
    return;
  }
  document.getElementById('scanStatus').textContent = '';
  document.getElementById('photoAnalyzing').classList.remove('hide');
  try {
    let base64 = capturedPhotoDataUrl.split(',')[1];
    let result = await callAiFoodScan(base64);
    document.getElementById('photoAnalyzing').classList.add('hide');
    closeSheets();
    openQuickAdd({
      name: result.foodName,
      cal: roundInt(result.calories),
      protein: roundInt(result.proteinG),
      carbs: roundInt(result.carbsG),
      fat: roundInt(result.fatG),
      meal: searchMeal,
      aiNote: 'AI estimate for "' + result.portionDescription + '" \u2014 adjust if needed.'
    });
  } catch (e) {
    document.getElementById('photoAnalyzing').classList.add('hide');
    document.getElementById('scanStatus').textContent = e.message || 'Couldn\u2019t analyze that photo. Try again with better lighting.';
  }
}

async function callAiFoodScan(base64Jpeg) {
  let prompt = 'You are a nutrition estimation assistant inside a food diary app. Look at this photo of food and identify what it is. ' +
    'Respond with ONLY a single JSON object, no markdown fences, no extra text, with exactly these fields: ' +
    '{"foodName": string, "portionDescription": string (short, e.g. "1 cup, ~250g"), "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "confidence": "low"|"medium"|"high"}. ' +
    'Estimate realistic values for the visible portion size. If multiple items are visible, estimate the combined plate.';

  let res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': data.settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: data.settings.aiModel || 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Jpeg } },
          { type: 'text', text: prompt }
        ]
      }]
    })
  });

  if (!res.ok) {
    let bodyText = await res.text().catch(() => '');
    if (res.status === 401) throw new Error('That API key was rejected. Check it in Settings.');
    if (res.status === 429) throw new Error('Rate limited by the API. Wait a moment and try again.');
    throw new Error('AI scan failed (' + res.status + '). ' + (bodyText || '').slice(0, 120));
  }
  let json = await res.json();
  let textBlock = (json.content || []).find(c => c.type === 'text');
  if (!textBlock) throw new Error('The AI didn\u2019t return a readable result.');
  let clean = textBlock.text.replace(/```json|```/g, '').trim();
  let parsed;
  try { parsed = JSON.parse(clean); } catch (e) { throw new Error('Couldn\u2019t parse the AI\u2019s answer. Try again.'); }
  if (typeof parsed.calories !== 'number') throw new Error('The AI result was incomplete. Try again.');
  return parsed;
}
