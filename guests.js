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
  { slug: 'nosotros', label: 'Nosotros', people: ['Nicolas Zanardo', 'Silvina Mangone'] },
  { slug: 'mama', label: 'Virginia y Monica', people: ['Virginia I. Galli', 'Monica Martino'] },
  { slug: 'papa', label: 'Mario y Claudia', people: ['Mario G. Zanardo', 'Claudia H. Vitori'] },
  { slug: 'guille', label: 'Guillermo y Katja', people: ['M. Guillermo Zanardo', 'Katja F. Osuna'] },
  { slug: 'nahuel', label: 'Nahuel', people: ['Nahuel E. Zanardo'] },
  { slug: 'tgrac', label: 'Graciela y Carlos', people: ['Graciela Zanardo', 'Carlos Gonzalez'] },
  { slug: 'ppab', label: 'Juanpi y Familia', people: ['Juan Pablo Gonzalez', 'Mayra Gomar', 'Melba Gonzalez', 'Dante Gonzalez'] },
  { slug: 'pcaro', label: 'Carolina y Familia', people: ['Carolina Gonzalez', 'Edgardo Martinez', 'Pedro Martinez', 'Milagros Sosa Gonzalez', 'Acompañante'] },
  { slug: 'pmar', label: 'Mariana y Familia', people: ['Mariana Gonzalez', 'Sergio Alcalde', 'Brisa Alcalde', 'Leila Alcalde'] },
  { slug: 'pces', label: 'Cesilia y compañia', people: ['Cesilia Enrich', 'Bruno'] },
  { slug: 'pcami', label: 'Camila y compañia', people: ['Camila Zanardo', 'Acompañante', 'Cala'] },
  { slug: 'tnes', label: 'Nestor', people: ['Nestor Zanardo'] },
  { slug: 'tmar', label: 'Marisa', people: ['Marisa Gonzalez'] },
  { slug: 'tcc', label: 'Clara y Jorge', people: ['Clara Galli', 'Jorge Zuchi'] },
  { slug: 'pagus', label: 'Agustin y compañia', people: ['Agustin Zuchi', 'Acompañante'] },
  { slug: 'pmili', label: 'Milagros y compañia', people: ['Milagros Zuchi', 'Acompañante'] },
  { slug: 'pcan', label: 'Candela y compañia', people: ['Candela Zuchi', 'Acompañante'] },
  { slug: 'pfran', label: 'Francisco y compañia', people: ['Francisco Zuchi', 'Sol', 'Lola', 'Merlin'] },
  { slug: 'tana', label: 'Ana', people: ['Ana galli'] },
  { slug: 'pnaz', label: 'Nazareno y compañia', people: ['Nazareno Dirie', 'Acompañante'] },
  { slug: 'pcat', label: 'Catriel y compañia', people: ['Catriel Dirie', 'Acompañante'] },
  { slug: 'aromi', label: 'Romina y Christian', people: ['Romina Giolucci', 'Christian Brancamonte'] },
  { slug: 'aemmi', label: 'Emmita y Oscar', people: ['Emmanuelle Pellisa', 'Oscar *Pellisa'] },
  { slug: 'asabr', label: 'Sabrina y Gustavo', people: ['Sabrina Piuma', 'Gustavo Barrias'] },
  { slug: 'aana', label: 'Ana y Gustavo', people: ['Ana Taborda', 'Gustavo Hammer'] },
  { slug: 'amari', label: 'Mariano y Gianina', people: ['Mariano Postaruk', 'Gianina Guardia'] },
  { slug: 'aluca', label: 'Lucas', people: ['Lucas Fontana'] },
  { slug: 'asant', label: 'Santiago', people: ['Santiago Saporiti'] },
  { slug: 'aluci', label: 'Lucia', people: ['Lucia', 'Acompañante'] },
  { slug: 'asol', label: 'Sol y Familia', people: ['Sol Martinez', 'Adriano Deganis', 'Luna Deganis'] },
  { slug: 'abren', label: 'Brenda', people: ['Brenda Albigard'] },
  { slug: 'aayel', label: 'Ayelen y Lucas', people: ['Ayelen Colque', 'Lucas Colque'] },
  { slug: 'aalej', label: 'Alejo y Tamara', people: ['Alejo Vacirca', 'Tamara Juarez'] },
  { slug: 'amaur', label: 'Mauricio', people: ['Mauricio Pebtz'] },
  { slug: 'acele', label: 'Celeste y compañia', people: ['Celeste Husosky', 'Acompañante'] },
  { slug: 'agust', label: 'Gustavo', people: ['Gustavo Zoleci'] },
  { slug: 'apatr', label: 'Patricia', people: ['Patricia Alvaceti'] },
  { slug: 'aseba', label: 'Sebastian', people: ['Sebastian Gonzales'] },
  { slug: 'adai', label: 'Dai y Familia', people: ['Dai Gelabert', 'Matias Zimmermann', 'Mia Zimmermann'] },
  { slug: 'aalej2', label: 'Alejo y compañia', people: ['Alejo Sandrini', 'Acompañante'] },
  { slug: 'ajona', label: 'Jonathan', people: ['Jonathan Alanoca'] },
  { slug: 'ajuli', label: 'Julian', people: ['Julian Casiva'] },
  { slug: 'aursu', label: 'Ursula', people: ['Ursula Planera'] },
  { slug: 'aalej3', label: 'Alejandro', people: ['Alejandro Debonis'] },
  { slug: 'atoma', label: 'Tomas', people: ['Tomas Seijas'] },
  { slug: 'abele', label: 'Belen', people: ['Belen Vittori'] },
  { slug: 'damand', label: 'Damian', people: ['Damian Massolo', 'Andrea Pedrozo'] },
  { slug: 'fammutter', label: 'Familia Mutter', people: ['Alejandro Mutter', 'Alejandro H Mutter', 'Claudia Priano', 'Fiona Furlong'] },
  { slug: 'famsilvi', label: 'Maria Rosa y Andrea', people: ['Maria Rosa Fano', 'Andrea Mangone'] },
  { slug: 'norla', label: 'Orlando', people: ['Orlando Fano'] },
  { slug: 'ndaia', label: 'Daiana y Familia', people: ['Daiana Fano', 'Jano Fano', 'Nena1', 'Nena2', 'Nena3'] },
  { slug: 'njose', label: 'Jose y Silvia', people: ['Jose Fano', 'Silvia Fano'] },
  { slug: 'nmari', label: 'Mariana y Dante', people: ['Mariana Fano', 'Dante Conte'] },
  { slug: 'nyord', label: 'Yordana y Familia', people: ['Yordana Fano', 'Julieta Lencina', 'Acompañante'] },
  { slug: 'nsofi', label: 'Sofia y Familia', people: ['Sofia Fano', 'Jonathan Ojeda', 'Jazmin Ojeda', 'Emir Ojeda', 'Aron Ojeda'] },
  { slug: 'nmanu', label: 'Manuel y Familia', people: ['Manuel Fano', 'Daniela Fano', 'Tatiana Fano'] },
  { slug: 'nrica', label: 'Ricardo y Fiorela', people: ['Ricardo Fano', 'Fiorela Fano'] },
  { slug: 'nmarc', label: 'Marcelo y compañia', people: ['Marcelo Calvitti', 'Acompañante'] },
  { slug: 'nceci', label: 'Cecilia', people: ['Cecilia Calvitti'] },
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
