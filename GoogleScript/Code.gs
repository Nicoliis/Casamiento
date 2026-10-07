/**
 * Wedding Invitation — Google Apps Script backend (RSVP)
 * ---------------------------------------------------------------
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * Stores JSON files in your Drive folder:
 *   - rsvps.json   keyed by a "guest" slug (from ?g=... / the RSVP
 *                  identity), one record per guest group.
 * Guests never sign in to Google — everything runs under your
 * account via this Web App.
 *
 * SETUP
 * 1. Set FOLDER_ID below to your real Google Drive folder ID (the
 *    long string in the folder's URL: drive.google.com/drive/folders/<ID>).
 * 2. Set ADMIN_PASSWORD below to a passphrase only you know — it
 *    protects the aggregated view in confirmados.html.
 * 3. Paste this file into your existing Apps Script project
 *    (replacing the old code), then:
 *    Deploy > Manage deployments > pencil icon > New version > Deploy.
 *    This keeps the same /exec URL that's already in config.js.
 *
 * ⚠️ IMPORTANT: every time you paste a new version of this file in,
 * it OVERWRITES FOLDER_ID and ADMIN_PASSWORD below with whatever
 * placeholder text is checked into this repo — pasting the file is
 * not enough, you must re-enter your real values every single time,
 * or the entire backend breaks (RSVP, admin panel, all
 * of it) with a cryptic Drive error instead of a clear one. This
 * version at least makes that failure obvious instead of cryptic —
 * see checkConfig_() below.
 * ---------------------------------------------------------------
 */

const FOLDER_ID = 'PASTE_YOUR_REAL_DRIVE_FOLDER_ID_HERE';
const RSVP_FILENAME = 'rsvps.json';

// Change this before deploying — protects the aggregated admin view.
const ADMIN_PASSWORD = 'PASTE_YOUR_REAL_ADMIN_PASSWORD_HERE';

function checkConfig_() {
  if (!FOLDER_ID || FOLDER_ID.indexOf('PASTE_YOUR') !== -1) {
    throw new Error(
      'Code.gs sin configurar: falta pegar tu FOLDER_ID real (reemplazá el ' +
      'placeholder en la constante FOLDER_ID, arriba del todo del archivo) y ' +
      'volver a Deploy > Manage deployments > New version.'
    );
  }
}

function getFolder_() {
  checkConfig_();
  return DriveApp.getFolderById(FOLDER_ID);
}

function getJsonFile_(folder, filename) {
  const files = folder.getFilesByName(filename);
  if (files.hasNext()) return files.next();
  return folder.createFile(filename, '{}', MimeType.PLAIN_TEXT);
}

function readJson_(folder, filename) {
  const file = getJsonFile_(folder, filename);
  const content = file.getBlob().getDataAsString();
  try {
    const parsed = JSON.parse(content || '{}');
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeJson_(folder, filename, data) {
  const file = getJsonFile_(folder, filename);
  file.setContent(JSON.stringify(data, null, 2));
}

function readRsvps_(folder) { return readJson_(folder, RSVP_FILENAME); }
function writeRsvps_(folder, data) { writeJson_(folder, RSVP_FILENAME, data); }

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeGuestId_(id) {
  return String(id || '').trim().toLowerCase().slice(0, 120);
}

/**
 * GET ?action=get&guest=<slug>
 *   -> { ok, exists, data }  — a single guest's own RSVP record.
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'get';
    const folder = getFolder_();

    if (action === 'get') {
      const guest = normalizeGuestId_(e.parameter.guest);
      if (!guest) return jsonResponse_({ ok: false, error: 'Missing guest id' });
      const rsvps = readRsvps_(folder);
      const data = rsvps[guest] || null;
      return jsonResponse_({ ok: true, exists: !!data, data: data });
    }

    return jsonResponse_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/**
 * POST body (text/plain, JSON-encoded) — several shapes:
 *
 * 1) Upsert a guest's RSVP (no "action" field):
 *    { guest, label, people: [{name, attending, diet:[...], dietOther}], comments }
 *    -> { ok, data }
 *
 * 2) Admin: fetch every RSVP (password-gated, kept out of the URL):
 *    { action: 'summary', key: '<ADMIN_PASSWORD>' }
 *    -> { ok, rsvps }
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) throw new Error('Missing request body');
    const body = JSON.parse(e.postData.contents);
    const folder = getFolder_();

    if (body.action === 'summary') {
      if (String(body.key || '') !== ADMIN_PASSWORD) {
        return jsonResponse_({ ok: false, error: 'unauthorized' });
      }
      return jsonResponse_({ ok: true, rsvps: readRsvps_(folder) });
    }

    const guest = normalizeGuestId_(body.guest);
    if (!guest) throw new Error('Missing guest id');

    const rsvps = readRsvps_(folder);
    const existing = rsvps[guest] || null;

    let people = (Array.isArray(body.people) ? body.people : [])
      .map(function (p) {
        return {
          name: String(p.name || '').trim().slice(0, 120),
          attending: p.attending === true,
          diet: Array.isArray(p.diet) ? p.diet.map(String).slice(0, 10) : [],
          dietOther: String(p.dietOther || '').trim().slice(0, 300)
        };
      });

    let label = String(body.label || '').trim().slice(0, 150) || guest;

    if (existing && Array.isArray(existing.people) && existing.people.length) {
      // Grupo precargado: la lista de personas y sus nombres quedan
      // fijos (nadie puede quitar, agregar ni renombrar a alguien).
      // Solo se acepta asistencia/restricciones, por posición. La
      // única excepción: un nombre "Acompañante" se puede completar.
      label = existing.label || label;
      people = existing.people.map(function (orig, i) {
        const sent = people[i] || {};
        const isPlaceholder = /^acompa(ñ|n)ante$/i.test(String(orig.name || '').trim());
        return {
          name: (isPlaceholder && sent.name) ? sent.name : orig.name,
          attending: sent.attending === true,
          diet: sent.diet || [],
          dietOther: sent.dietOther || ''
        };
      });
    } else {
      people = people.filter(function (p) { return p.name; });
    }

    if (people.length === 0) throw new Error('At least one named person is required');

    const record = {
      guest: guest,
      label: label,
      people: people,
      comments: String(body.comments || '').trim().slice(0, 2000),
      updatedAt: new Date().toISOString()
    };

    rsvps[guest] = record;
    writeRsvps_(folder, rsvps);

    return jsonResponse_({ ok: true, data: record });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
