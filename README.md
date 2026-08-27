# Sitio de invitación de boda (con confirmación de asistencia)

Un sitio de invitación en verde/naturaleza, en español, con confirmación de
asistencia (RSVP) por invitado y un panel privado que agrega todas las
respuestas. Todo se guarda en un archivo JSON dentro de tu carpeta de Google
Drive, escrito por un Google Apps Script que corre con tu cuenta — los
invitados no necesitan iniciar sesión en Google.

## Archivos

| Archivo | Qué es |
|---|---|
| `Code.gs` | Backend (Google Apps Script). Lee/escribe `rsvps.json` y `regalos.json` en tu carpeta de Drive. |
| `config.js` | Un solo lugar con la URL de tu Web App de Apps Script. |
| `content.js` | **Todo el texto en español del sitio** — nombres, fechas, lugares, textos de los botones, la lista de regalos, etc. Editá solo este archivo para cambiar palabras. |
| `guests.js` | Lista opcional de familias/grupos invitados, para precargar nombres y ver quién no respondió. |
| `theme.css` | Paleta de colores y estilos compartidos (verde/naturaleza) — incluye el menú de navegación, compartido por todas las páginas. |
| `index.html` | La invitación pública: portada, ceremonia/recepción y código de vestimenta. |
| `confirmar.html` | Formulario de confirmación de asistencia (RSVP), en su propia página. |
| `confirmados.html` | Panel privado (con contraseña) que agrega todas las confirmaciones recibidas, más los grupos que todavía no respondieron. |
| `regalos.html` | Lista de regalos / ideas para el casamiento, con reserva por grupo. |
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
  como `?g=familia-perez`. Volver a abrir ese mismo link — o el mismo
  navegador, gracias a `localStorage` — carga y permite **editar** esa misma
  respuesta en vez de crear una nueva.
- Si vos preferís armar los links a mano y mandarlos por WhatsApp con el
  nombre ya puesto (por ejemplo `confirmar.html?g=familia-perez`), funciona
  igual: el sitio detecta el `?g=` de la URL y salta directo al formulario.
- Un mismo link puede confirmar **varias personas** (pareja, familia con
  hijos), cada una con su propia asistencia y restricciones alimentarias.
- Esa misma identidad (nombre/grupo) es la que se usa para reservar
  regalos en `regalos.html` — no hace falta identificarse dos veces.

## Setup

### 1. Backend (Apps Script)

Ya tenés esto configurado de versiones anteriores — solo hay que
actualizar el código (por ejemplo para que funcione la reserva de
regalos, que necesita esta versión):

1. Abrí tu proyecto en [script.google.com](https://script.google.com).
2. Reemplazá todo el contenido por el nuevo `Code.gs`.
3. `FOLDER_ID` ya está seteado a tu carpeta.
4. Cambiá `ADMIN_PASSWORD` por una contraseña propia — protege el panel
   `confirmados.html`.
5. **Deploy → Manage deployments → ✏️ (editar) → New version → Deploy.**
   Esto mantiene la misma URL `/exec` que ya tenías, así que no hace falta
   tocar `config.js`

> Si en algún momento creás un deployment nuevo (no una nueva versión del
> mismo), la URL cambia y hay que actualizar `config.js`.

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
en Drive dentro de `rsvps.json`.

Para ver las respuestas agregadas, abrí `confirmados.html` e ingresá la
contraseña que pusiste en `ADMIN_PASSWORD`.

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

## Lista de regalos con reserva (`regalos.html`)

El contenido vive en `content.js` → `CONTENT.wishlist`. Para agregar o
quitar una idea de regalo, sumá o borrá un objeto de `wishlist.items`:

```js
{ key: 'sabanas', name: 'Juego de sábanas', note: 'Talle queen, blancas o lino natural', link: '' }
```

`link` es opcional (por ejemplo a una tienda online); si lo dejás vacío, la
tarjeta se muestra sin botón. `key` es el identificador estable del
regalo — una vez que alguien lo reservó, no le cambies el `key` (podés
cambiar `name`, `note` y `link` libremente). También hay un bloque
opcional para un regalo en efectivo (`wishlist.cashText` /
`wishlist.cashAlias`) — si los dejás vacíos, esa tarjeta no se muestra.

**Reservas por grupo:** cada invitado se identifica con el mismo nombre/
grupo que usa para confirmar asistencia (comparte el mismo `localStorage`
que `index.html`, así que si ya confirmó, `regalos.html` ya sabe quién
es). Desde ahí puede reservar un regalo — que otros grupos van a ver como
"Reservado por Familia X" — y deshacer la reserva si se arrepiente. Las
reservas se guardan en `regalos.json` en tu carpeta de Drive (igual que
`rsvps.json`), así que se ven iguales para todos los que entren al sitio,
no sólo en el navegador de quien reservó.

Si dos grupos llegan a reservar el mismo regalo casi al mismo tiempo, el
sitio guarda ambas reservas (no descarta ninguna) y te lo marca como
conflicto — mirá la sección "Regalos reservados" en `confirmados.html`
para verlo y coordinar con ellos manualmente. Es un caso raro gracias a
un lock en el backend, pero puede pasar.

Si preferís que no se muestre el nombre de quién reservó cada regalo
(sólo "ya fue reservado" / "libre"), poné `wishlist.showClaimerName` en
`false` en `content.js`.

> Esta función necesita la versión nueva de `Code.gs` (ver "Backend" más
> abajo) — sin redeployarla, `regalos.html` va a mostrar los regalos
> pero el botón de reservar no va a hacer nada.

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
`lactose`, `other` (con texto libre). Se editan/traducen desde
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
