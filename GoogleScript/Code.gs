/**
 * Wedding Invitation — Google Apps Script backend (RSVP)
 * ---------------------------------------------------------------
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * Stores one JSON file (rsvps.json) in your Drive folder, keyed by
 * a "guest" slug that comes from the invitation URL (?g=...). Each
 * guest link reads/writes only its own record.
 *
 * SETUP
 * 1. Reuse the same Drive folder + FOLDER_ID you already had.
 * 2. Set ADMIN_PASSWORD below to a passphrase only you know — it
 *    protects the aggregated view in confirmados.html.
 * 3. Paste this file into your existing Apps Script project
 *    (replacing the old code), then:
 *    Deploy > Manage deployments > pencil icon > New version > Deploy.
 *    This keeps the same /exec URL that's already in config.js.
 * ---------------------------------------------------------------
 */

const FOLDER_ID = '********';
const RSVP_FILENAME = 'rsvps.json';

// Change this before deploying — protects the aggregated admin view.
const ADMIN_PASSWORD = '********';

function getFolder_() {
  return DriveApp.getFolderById(FOLDER_ID);
}

function getRsvpFile_(folder) {
  const files = folder.getFilesByName(RSVP_FILENAME);
  if (files.hasNext()) return files.next();
  return folder.createFile(RSVP_FILENAME, '{}', MimeType.PLAIN_TEXT);
}

function readRsvps_(folder) {
  const file = getRsvpFile_(folder);
  const content = file.getBlob().getDataAsString();
  try {
    const parsed = JSON.parse(content || '{}');
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeRsvps_(folder, data) {
  const file = getRsvpFile_(folder);
  file.setContent(JSON.stringify(data, null, 2));
}

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
 * POST body (text/plain, JSON-encoded) — two shapes:
 *
 * 1) Upsert a guest's RSVP:
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

    const people = (Array.isArray(body.people) ? body.people : [])
      .map(function (p) {
        return {
          name: String(p.name || '').trim().slice(0, 120),
          attending: p.attending === true,
          diet: Array.isArray(p.diet) ? p.diet.map(String).slice(0, 10) : [],
          dietOther: String(p.dietOther || '').trim().slice(0, 300)
        };
      })
      .filter(function (p) { return p.name; });

    if (people.length === 0) throw new Error('At least one named person is required');

    const record = {
      guest: guest,
      label: String(body.label || '').trim().slice(0, 150) || guest,
      people: people,
      comments: String(body.comments || '').trim().slice(0, 2000),
      updatedAt: new Date().toISOString()
    };

    const rsvps = readRsvps_(folder);
    rsvps[guest] = record;
    writeRsvps_(folder, rsvps);

    return jsonResponse_({ ok: true, data: record });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
