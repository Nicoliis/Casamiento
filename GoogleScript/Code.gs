/**
 * Wedding Invitation — Google Apps Script backend (RSVP + regalos)
 * ---------------------------------------------------------------
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * Stores JSON files in your Drive folder:
 *   - rsvps.json   keyed by a "guest" slug (from ?g=... / the RSVP
 *                  identity), one record per guest group.
 *   - regalos.json keyed by wishlist item key, each holding the
 *                  list of guest groups that claimed that gift.
 * Guests never sign in to Google — everything runs under your
 * account via this Web App.
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
const CLAIMS_FILENAME = 'regalos.json';

// Change this before deploying — protects the aggregated admin view.
const ADMIN_PASSWORD = '********';

function getFolder_() {
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
function readClaims_(folder) { return readJson_(folder, CLAIMS_FILENAME); }
function writeClaims_(folder, data) { writeJson_(folder, CLAIMS_FILENAME, data); }

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeGuestId_(id) {
  return String(id || '').trim().toLowerCase().slice(0, 120);
}

function normalizeItemKey_(id) {
  return String(id || '').trim().toLowerCase().slice(0, 120);
}

/**
 * Runs a read-modify-write against regalos.json under a script-wide
 * lock, so two guests claiming at the same instant can't silently
 * overwrite each other's write. fn receives the current claims object
 * and must return the new claims object to save.
 */
function withClaimsLock_(folder, fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const claims = readClaims_(folder);
    const updated = fn(claims);
    writeClaims_(folder, updated);
    return updated;
  } finally {
    lock.releaseLock();
  }
}

/**
 * GET ?action=get&guest=<slug>
 *   -> { ok, exists, data }  — a single guest's own RSVP record.
 *
 * GET ?action=claims
 *   -> { ok, claims }  — every wishlist claim, for every item. Public
 *      (no password) on purpose: guests need to see it to avoid
 *      claiming the same gift twice. Shape:
 *      { "<itemKey>": [ { guest, label, claimedAt }, ... ] }
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

    if (action === 'claims') {
      return jsonResponse_({ ok: true, claims: readClaims_(folder) });
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
 *
 * 3) Claim a wishlist item for a guest group (idempotent — claiming
 *    twice with the same guest+item is a no-op):
 *    { action: 'claim', guest, label, item }
 *    -> { ok, claims }
 *
 * 4) Undo a guest's own claim:
 *    { action: 'unclaim', guest, item }
 *    -> { ok, claims }
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
      return jsonResponse_({ ok: true, rsvps: readRsvps_(folder), claims: readClaims_(folder) });
    }

    if (body.action === 'claim') {
      const guest = normalizeGuestId_(body.guest);
      const item = normalizeItemKey_(body.item);
      if (!guest) throw new Error('Missing guest id');
      if (!item) throw new Error('Missing item key');
      const label = String(body.label || '').trim().slice(0, 150) || guest;

      const claims = withClaimsLock_(folder, function (current) {
        const list = Array.isArray(current[item]) ? current[item].slice() : [];
        if (!list.some(function (c) { return c.guest === guest; })) {
          list.push({ guest: guest, label: label, claimedAt: new Date().toISOString() });
        }
        current[item] = list;
        return current;
      });

      return jsonResponse_({ ok: true, claims: claims });
    }

    if (body.action === 'unclaim') {
      const guest = normalizeGuestId_(body.guest);
      const item = normalizeItemKey_(body.item);
      if (!guest) throw new Error('Missing guest id');
      if (!item) throw new Error('Missing item key');

      const claims = withClaimsLock_(folder, function (current) {
        const list = (Array.isArray(current[item]) ? current[item] : [])
          .filter(function (c) { return c.guest !== guest; });
        if (list.length) {
          current[item] = list;
        } else {
          delete current[item];
        }
        return current;
      });

      return jsonResponse_({ ok: true, claims: claims });
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
