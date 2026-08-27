// ============================================================
// LISTA DE INVITADOS (precarga)
// ------------------------------------------------------------
// Esto es opcional: el sitio funciona igual sin tocar este
// archivo (cada invitado puede escribir su nombre la primera
// vez que entra, como siempre). Pero si precargás acá los
// grupos/familias que invitaste, pasan dos cosas:
//
//   1. Podés mandar links personalizados (confirmar.html?g=perez)
//      que ya vienen con los nombres de esa familia cargados.
//   2. El panel confirmados.html muestra qué grupos precargados
//      todavía NO respondieron (ni sí ni no), para que sepas a
//      quién hacerle acordar.
//
// Para agregar un grupo, sumá un objeto a la lista. Para
// quitarlo, borrá el objeto. Nada más — no hace falta tocar
// ningún archivo .html.
//
//   label  -> cómo se muestra el grupo (ej: "Familia Pérez").
//   people -> nombres sugeridos que aparecen precargados la
//             primera vez que ese grupo entra (después cada
//             invitado los puede editar, agregar o quitar).
//   slug   -> opcional. Identificador para el link (?g=...).
//             Si lo dejás vacío se genera solo a partir del
//             label (ej: "Familia Pérez" -> "familia-perez").
// ============================================================

const GUEST_LIST = [
  // { label: 'Familia Pérez', people: ['Juan Pérez', 'María Gómez'] },
  // { label: 'Rodríguez - López', people: ['Ana Rodríguez', 'Tomás López'] },
];

// ------------------------------------------------------------
// Utilidades compartidas (usadas por todas las páginas públicas y por confirmados.html)
// No hace falta tocar nada de acá abajo.
// ------------------------------------------------------------

function slugifyGuestLabel(str) {
  // Quita tildes/diacríticos (normaliza NFD y descarta los
  // caracteres combinantes U+0300–U+036F), pasa a minúsculas y
  // reemplaza todo lo que no sea a-z0-9 por guiones.
  var diacriticStart = String.fromCharCode(0x0300);
  var diacriticEnd = String.fromCharCode(0x036f);
  var diacritics = new RegExp('[' + diacriticStart + '-' + diacriticEnd + ']', 'g');
  return String(str || '')
    .normalize('NFD').replace(diacritics, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function getGuestSlug(entry) {
  return slugifyGuestLabel(entry.slug || entry.label);
}

function findGuestListEntry(slug) {
  for (var i = 0; i < GUEST_LIST.length; i++) {
    if (getGuestSlug(GUEST_LIST[i]) === slug) return GUEST_LIST[i];
  }
  return null;
}

// ------------------------------------------------------------
// Hilo del ?g= entre páginas (sin localStorage — ver README).
// Cada página lee su propio ?g= (si lo tiene) y lo reescribe en
// todos los links del menú de arriba, así la identidad no se
// pierde aunque el invitado pase por una página que no la usa
// para nada (por ejemplo fotos.html).
// ------------------------------------------------------------

function getGuestParamFromUrl() {
  return new URLSearchParams(window.location.search).get('g');
}

// Reescribe el href de todos los links del menú (y de cualquier
// otro marcado con [data-keep-guest]) para que apunten a la misma
// página pero con ?g=<guestId> — o sin él, si guestId es null.
// Un link a un ancla de esta misma página (ej. "#ceremonia", sin
// nombre de archivo) se deja intacto: el navegador ya conserva el
// ?g= actual solo al navegar dentro del mismo documento.
function applyGuestParamToNav(guestId) {
  document.querySelectorAll('.site-nav a, [data-keep-guest]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var hashIdx = href.indexOf('#');
    var path = hashIdx === -1 ? href : href.slice(0, hashIdx);
    var hash = hashIdx === -1 ? '' : href.slice(hashIdx);
    if (!path) return;
    var qIdx = path.indexOf('?');
    var base = qIdx === -1 ? path : path.slice(0, qIdx);
    a.setAttribute('href', base + (guestId ? ('?g=' + encodeURIComponent(guestId)) : '') + hash);
  });
}
