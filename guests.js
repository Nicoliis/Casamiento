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
// Utilidades compartidas (usadas por confirmar.html, regalos.html y confirmados.html)
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
