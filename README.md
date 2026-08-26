# Sitio de invitación de boda (con confirmación de asistencia)

Un sitio de invitación en verde/naturaleza, en español, con confirmación de
asistencia (RSVP) por invitado y un panel privado que agrega todas las
respuestas. Todo se guarda en un archivo JSON dentro de tu carpeta de Google
Drive, escrito por un Google Apps Script que corre con tu cuenta — los
invitados no necesitan iniciar sesión en Google.

## Archivos

| Archivo | Qué es |
|---|---|
| `Code.gs` | Backend (Google Apps Script). Lee/escribe `rsvps.json` en tu carpeta de Drive. |
| `config.js` | Un solo lugar con la URL de tu Web App de Apps Script. |
| `content.js` | **Todo el texto en español del sitio** — nombres, fechas, lugares, textos de los botones, etc. Editá solo este archivo para cambiar palabras. |
| `theme.css` | Paleta de colores y estilos compartidos (verde/naturaleza). |
| `index.html` | La invitación pública: portada, ceremonia/recepción, código de vestimenta y formulario de confirmación. |
| `confirmados.html` | Panel privado (con contraseña) que agrega todas las confirmaciones recibidas. |

## Cómo funciona el link de cada invitado

- La invitación no tiene una lista de invitados precargada: cada persona/
  familia escribe su nombre la primera vez que entra (paso "¿Quién sos?").
- Ese nombre se convierte en un identificador (`slug`) y queda en la URL
  como `?g=familia-perez`. Volver a abrir ese mismo link — o el mismo
  navegador, gracias a `localStorage` — carga y permite **editar** esa misma
  respuesta en vez de crear una nueva.
- Si vos preferís armar los links a mano y mandarlos por WhatsApp con el
  nombre ya puesto (por ejemplo `index.html?g=familia-perez`), funciona
  igual: el sitio detecta el `?g=` de la URL y salta directo al formulario.
- Un mismo link puede confirmar **varias personas** (pareja, familia con
  hijos), cada una con su propia asistencia y restricciones alimentarias.

## Setup

### 1. Backend (Apps Script)

Ya tenés esto configurado de la versión anterior — solo hay que actualizar
el código:

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

No hace falta tocar `index.html` ni `confirmados.html` para estos cambios.

### 3. Abrir el sitio

Abrí `index.html` en el navegador (doble clic, o subilo a GitHub Pages /
Netlify / cualquier hosting estático) y probá el flujo completo: escribí un
nombre, confirmá una persona, y verificá que aparezca en Drive dentro de
`rsvps.json`.

Para ver las respuestas agregadas, abrí `confirmados.html` e ingresá la
contraseña que pusiste en `ADMIN_PASSWORD`.

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
