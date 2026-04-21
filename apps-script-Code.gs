/**
 * CREATE App — Google Apps Script backend
 * Handles save + retrieve for the Tile Depot Friday Check-In.
 *
 * Paste this entire file into a Google Apps Script project that is
 * bound to a Google Sheet, then deploy as Web App ("Anyone" access).
 * The deployed URL goes into APPS_SCRIPT_URL in the CREATE App HTML.
 */

// Must match the password in the HTML file
var ADMIN_PASSWORD = 'tiledepot2026';

// Name of the tab that stores entries (auto-created on first save)
var SHEET_NAME = 'checkins';

// Header row written to a new sheet
var HEADERS = [
  'submittedAt', 'store', 'weekOf',
  'C', 'R', 'E1', 'A', 'T', 'E2',
  'ratingsJSON', 'observationsJSON'
];

// ──────────────────────────────────────────────────────
// HTTP HANDLERS
// ──────────────────────────────────────────────────────

function doGet(e) {
  try {
    var action = (e.parameter.action || '').toLowerCase();
    if (action === 'list') {
      var store = e.parameter.store || '';
      if (!store) return json({ ok: false, error: 'missing store' });
      return json({ ok: true, entries: readEntries(store) });
    }
    if (action === 'all') {
      if ((e.parameter.password || '') !== ADMIN_PASSWORD) {
        return json({ ok: false, error: 'unauthorised' });
      }
      return json({ ok: true, entries: readEntries(null) });
    }
    return json({ ok: true, hello: 'CREATE App backend is live' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    if (!payload.store)  return json({ ok: false, error: 'missing store' });
    if (!payload.weekOf) return json({ ok: false, error: 'missing weekOf' });

    var sheet = getOrCreateSheet();
    var ratings = payload.ratings || {};
    var row = [
      payload.submittedAt || new Date().toISOString(),
      payload.store,
      payload.weekOf,
      ratings.C  || '',
      ratings.R  || '',
      ratings.E1 || '',
      ratings.A  || '',
      ratings.T  || '',
      ratings.E2 || '',
      JSON.stringify(ratings),
      JSON.stringify(payload.observations || {})
    ];

    // Upsert: one row per (store, weekOf) — overwrite an existing one
    var data = sheet.getDataRange().getValues();
    var existingRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === payload.store && data[i][2] === payload.weekOf) {
        existingRow = i + 1;
        break;
      }
    }
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// ──────────────────────────────────────────────────────
// SHEET HELPERS
// ──────────────────────────────────────────────────────

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readEntries(storeFilter) {
  var sh = getOrCreateSheet();
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var header = data[0];
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var store = r[1];
    if (storeFilter && store !== storeFilter) continue;
    var ratings = {};
    try { ratings = JSON.parse(r[9] || '{}'); } catch (_) {}
    var observations = {};
    try { observations = JSON.parse(r[10] || '{}'); } catch (_) {}
    out.push({
      submittedAt: formatIso(r[0]),
      store: store,
      weekOf: String(r[2] || ''),
      ratings: ratings,
      observations: observations
    });
  }
  return out;
}

function formatIso(v) {
  if (v instanceof Date) return v.toISOString();
  return String(v || '');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
