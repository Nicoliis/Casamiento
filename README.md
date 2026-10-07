# Sitio de invitación de boda (con confirmación de asistencia)

Un sitio de invitación en verde/naturaleza, en español, con confirmación de
asistencia (RSVP) por invitado y un panel privado que agrega todas las
respuestas. Todo se guarda en un archivo JSON dentro de tu carpeta de Google
Drive, vía DriveStore (un Google Apps Script que corre con tu cuenta) — los
invitados no necesitan iniciar sesión en Google.

## Archivos

| Archivo | Qué es |
|---|---|
| `drivestore.js` | Cliente de DriveStore: guarda/lee los archivos de la app en Drive. |
| `config.js` | Configuración de DriveStore (url, appid, apppass) y contraseña del panel. |
| `content.js` | **Todo el texto en español del sitio** — nombres, fechas, lugares, textos de los botones, etc. Editá solo este archivo para cambiar palabras. |
| `guests.js` | Lista opcional de familias/grupos invitados, para precargar nombres y ver quién no respondió. |
| `theme.css` | Paleta de colores y estilos compartidos (verde/naturaleza) — incluye el menú de navegación, compartido por todas las páginas. |
| `index.html` | La invitación pública: portada, ceremonia/recepción y código de vestimenta. |
| `confirmar.html` | Formulario de confirmación de asistencia (RSVP), en su propia página. |
| `confirmados.html` | Panel privado (con contraseña) que agrega todas las confirmaciones recibidas, más los grupos que todavía no respondieron. |
| `regalos.html` | Lista de regalos (página estática, con instrucciones). |
| `fotos.html` | Página con el código QR para subir fotos durante la fiesta. |

Todas las páginas públicas (`index.html`, `confirmar.html`, `regalos.html`,
`fotos.html`) comparten el mismo menú de navegación arriba de todo — se
adapta solo en pantallas chicas (pasa a 2 líneas en vez de desbordar).

## Cómo funciona el link de cada invitado

- La confirmación de asistencia vive en `confirmar.html` (antes era una
  sección dentro de `index.html`). No tiene una lista de invitados
  precargada: cada persona/familia escribe su nombre la primera vez que
  entra (paso "¿Quién sos?").
- Ese nombre se convierte en un identificador (`slug`) y queda en la URL
  como `?g=familia-perez`. El sitio **no usa `localStorage` ni cookies
  para recordar quién sos** — el `?g=` de la URL es la única forma de
  volver a tu respuesta y poder editarla; sin ese link, entrás como
  invitado nuevo. Por eso el link es lo que hay que guardar/compartir,
  no "el mismo navegador".
- Si vos preferís armar los links a mano y mandarlos por WhatsApp con el
  nombre ya puesto (por ejemplo `confirmar.html?g=familia-perez`), funciona
  igual: el sitio detecta el `?g=` de la URL y salta directo al formulario.
- Un mismo link puede confirmar **varias personas** (pareja, familia con
  hijos), cada una con su propia asistencia y restricciones alimentarias.
- Si el grupo ya está cargado en `GUEST_LIST` (guests.js), los nombres quedan
  **bloqueados**: nadie puede editarlos, agregar ni quitar personas — solo
  marcar asistencia y restricciones (única excepción: un nombre
  "Acompañante" genérico se puede completar). Es una regla de la página (los
  nombres salen de `guests.js`), no del backend.
- **El `?g=` viaja solo por todo el menú**, en las cuatro páginas
  públicas: si entrás con `?g=familia-perez` a cualquiera de ellas, todos
  los links del menú de arriba (Inicio, Ceremonia, Recepción, Confirmar,
  Regalos, Fotos) se reescriben para llevarlo puesto. Así, un invitado
  identificado puede pasearse por todo el sitio — incluso por `fotos.html`,
  que no usa la identidad para nada — sin perderla ni tener que volver a
  escribir su nombre. Esto lo hace `applyGuestParamToNav()` en
  `guests.js`, que corre en las cuatro páginas.

## Setup

### 1. Backend (DriveStore)

El sitio guarda todo con **DriveStore** (`drivestore.js`), un cliente que
usa un backend de Google Apps Script compartido entre varias apps. Cada
grupo de invitados se guarda como un archivo `rsvp-<slug>` dentro de la
carpeta de esta app en Drive.

1. El backend de DriveStore tiene que estar desplegado como Web App.
2. En el `apps.json` de su carpeta de Drive tiene que existir la entrada
   `INVITACIONES-CASAMIENTO` con su `pass`.
3. En `config.js` completá `DRIVESTORE_CONFIG`: `url` (la URL `/exec`),
   `appid` y `apppass` (los mismos de `apps.json`), y poné tu
   `ADMIN_PASSWORD` para el panel.

> ⚠️ `apppass` queda visible en el código público del sitio, así que
> cualquiera que lo lea puede leer o pisar los archivos de esta app.
> Del mismo modo, `ADMIN_PASSWORD` se chequea en el navegador: sólo
> oculta el panel, no lo protege de verdad.

**Nombres bloqueados:** la lista de invitados vive en `guests.js`
(`GUEST_LIST`). Los nombres de cada grupo salen siempre de ahí; lo que se
guarda en DriveStore es sólo asistencia, restricciones y comentarios. Por
eso nadie puede editar, agregar ni quitar nombres (salvo completar un
"Acompañante" genérico).

### 2. Contenido del sitio

Abrí `content.js` y completá:

- `couple.partner1` / `couple.partner2` — los nombres.
- `eventDateISO` — fecha y hora del evento (usada por la cuenta regresiva).
- `hero.dateDisplay` — la fecha en texto, como se muestra en la portada.
- `ceremony` / `reception` — horario, lugar, dirección y link de Google Maps de cada uno.
- `dressCode.text` — código de vestimenta.
- `rsvp.deadlineText` — fecha límite para confirmar.
- Cualquier otro texto (textos de botones, mensajes de confirmación, etc.) también vive acá.

No hace falta tocar ningún `.html` para estos cambios.

### 3. Abrir el sitio

Abrí `index.html` en el navegador (doble clic, o subilo a GitHub Pages /
Netlify / cualquier hosting estático), andá a "Confirmar" y probá el flujo
completo: escribí un nombre, confirmá una persona, y verificá que aparezca
en Drive como `rsvp-<slug>`.

Para ver las respuestas agregadas, abrí `confirmados.html` e ingresá la
`ADMIN_PASSWORD` de `config.js`.

## Precargar grupos de invitados (`guests.js`)

Es opcional, pero te sirve para dos cosas:

1. **Links personalizados**: si sumás un grupo a `GUEST_LIST` en `guests.js`
   (por ejemplo `{ label: 'Familia Pérez', people: ['Juan Pérez', 'María
   Gómez'] }`), el link `confirmar.html?g=familia-perez` arranca con esos
   nombres ya cargados — la familia sólo tiene que marcar asistencia y
   restricciones, no escribir todo de cero. El invitado igual puede editar,
   agregar o quitar personas de ahí en más.
2. **Saber quién falta responder**: en `confirmados.html` aparece una
   sección "Todavía no respondieron" con los grupos de `GUEST_LIST` que
   todavía no tienen ninguna confirmación guardada (ni sí ni no).

El paso de "¿Quién sos?" sigue funcionando para cualquiera igual que antes
(no es una lista cerrada): si alguien escribe un nombre que no precargaste,
el sitio arranca una confirmación nueva para esa persona/familia como
siempre. `guests.js` sólo agrega la precarga y el seguimiento — para
agregar o quitar un grupo, sumás o borrás un objeto de la lista.

## Lista de regalos (`regalos.html`)

Es una página **estática**: no usa backend ni identidad, no se reserva
nada. Para cambiar los regalos, las instrucciones o el alias para
efectivo, editá directamente el HTML de `regalos.html` (cada regalo es un
bloque `<div class="card gift-card">`; el link "Ver →" es opcional y se
borra con su `<a>`).

## Código QR para subir fotos (`fotos.html`)

1. Guardá la imagen de tu código QR como **`qr-fotos.png`** en esta misma
   carpeta (junto a `index.html`). Si tu archivo tiene otro nombre o
   formato, cambiá el `src="qr-fotos.png"` en `fotos.html`.
2. La página muestra esa imagen y, apenas carga, intenta **leer el QR en
   el navegador** (con la librería [jsQR](https://github.com/cozmo/jsQR),
   sin mandar la imagen a ningún servidor) para armar automáticamente un
   botón "Ir al álbum →" con el link que encuentre adentro.
3. Si ya sabés el link de destino (por ejemplo el álbum compartido de
   Google Photos), es más simple y confiable pegarlo directamente en
   `content.js` → `CONTENT.photos.fallbackUrl`: el botón lo usa tal cual y
   ni intenta leer la imagen.
4. La lectura automática necesita que el sitio esté servido por http/https
   (GitHub Pages, Netlify, etc.) — algunos navegadores bloquean leer el
   contenido de una imagen local cuando abrís el archivo con doble clic.
   El QR se puede escanear igual con la cámara del celular en cualquier
   caso; el botón es sólo una comodidad extra.

## Datos que se guardan por invitado

```json
{
  "guest": "familia-perez",
  "label": "Familia Pérez",
  "people": [
    {
      "name": "Juan Pérez",
      "attending": true,
      "diet": ["vegetarian"],
      "dietOther": ""
    }
  ],
  "comments": "Necesitamos silla para bebé",
  "updatedAt": "2026-08-26T12:00:00.000Z"
}
```

Restricciones alimentarias soportadas: `vegan`, `vegetarian`, `celiac`,
`lactose`, `hypertensive`, `other` (con texto libre). Se editan/traducen desde
`content.js` → `rsvp.dietOptions`.

## Notas

- El panel `confirmados.html` pide una contraseña, pero es una protección
  simple (viaja en el cuerpo de un POST, no queda en la URL, pero no es
  seguridad de nivel bancario). No compartas ese link ni la contraseña
  fuera del círculo de confianza.
- Como el `slug` de cada invitado sale de lo que la persona escribe, dos
  personas que pongan el mismo nombre (p. ej. dos "Familia Gómez")
  compartirían el mismo registro. Si es un problema, lo más simple es
  armar y repartir vos mismo los links (`?g=gomez-juan` vs
  `?g=gomez-maria`) en vez de depender del paso de autoidentificación.
- La funcionalidad anterior de "firmar el libro de visitas" con fotos fue
  reemplazada por este flujo de RSVP. Si la querés de vuelta como sección
  adicional, se puede agregar.
