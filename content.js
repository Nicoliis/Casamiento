// ============================================================
// CONTENIDO DEL SITIO
// Editá todo el texto de la invitación acá — index.html no
// necesita tocarse para cambiar palabras, fechas o lugares.
// ============================================================

const CONTENT = {
  siteTitle: 'Nicolás & Silvina — Nuestra Boda',

  couple: {
    partner1: 'Silvina',
    partner2: 'Nicolás'
  },

  // Fecha y hora del evento, formato ISO. Se usa para la cuenta regresiva.
  eventDateISO: '2026-12-12T15:00:00',

  hero: {
    kicker: 'NOS CASAMOS',
    dateDisplay: '12 de diciembre de 2026',
    welcome: 'Con todo nuestro cariño, queremos invitarte a celebrar el comienzo de esta nueva etapa junto a nosotros.',
    ctaButton: 'Confirmar asistencia'
  },

  countdown: {
    label: 'Faltan para el gran día',
    days: 'Días',
    hours: 'Horas',
    minutes: 'Min',
    seconds: 'Seg',
    todayMessage: '¡Hoy es el día! 🎉'
  },

  nav: {
    home: 'Inicio',
    ceremony: 'Ceremonia',
    reception: 'Recepción',
    rsvp: 'Confirmar',
    wishlist: 'Regalos',
    photos: 'Fotos'
  },

  common: {
    backToInvite: '← Volver a la invitación'
  },

  ceremony: {
    title: 'Ceremonia',
    time: '19:00 hs',
    place: 'Parroquia Santa María de Guadalupe',
    address: 'Molina campos 371, Moreno',
    mapsUrl: 'https://maps.app.goo.gl/pxXjiWKZK1WZ4xS78'
  },

  reception: {
    title: 'Recepción',
    time: '20:00 hs',
    place: 'Salon Rosedal',
    address: 'Av. Gral José María Zapiola 2722, Paso del rey',
    mapsUrl: 'https://maps.app.goo.gl/B9g1z3bLf8cNNg5F7'
  },

  dressCode: {
    title: 'Código de vestimenta',
    text: 'Elegante sport. Te pedimos evitar el blanco, ¡Ese color nos lo dejamos para nosotros! 😉'
  },

  identify: {
    title: '¿Quién sos?',
    text: 'Ingresá tu nombre o el de tu familia para comenzar tu confirmación.',
    placeholder: 'Ej: Familia Pérez',
    continue: 'Continuar'
  },

  rsvp: {
    title: 'Confirmá tu asistencia',
    intro: 'Contanos quiénes vendrán y si tienen alguna necesidad especial en la comida.',
    deadlineText: 'Por favor confirmá antes del 1 de octubre de 2026.',
    confirmingFor: 'Confirmando para:',
    changeIdentity: '¿No sos vos? Cambiar',
    namePlaceholder: 'Nombre y apellido',
    attendingLabel: '¿Asistirá?',
    yes: 'Sí, asistiré',
    no: 'No podré asistir',
    dietLabel: 'Restricciones alimentarias',
    dietOptions: {
      vegan: 'Vegano/a',
      vegetarian: 'Vegetariano/a',
      celiac: 'Celíaco/a (sin TACC)',
      lactose: 'Intolerante a la lactosa',
      other: 'Otra'
    },
    dietOtherPlaceholder: 'Contanos cuál',
    addPerson: '+ Agregar otra persona',
    removePerson: 'Quitar',
    commentsLabel: 'Comentarios u otras especificaciones',
    commentsPlaceholder: 'Alergias adicionales, necesidades de accesibilidad, silla para bebé, etc.',
    submit: 'Enviar confirmación',
    update: 'Actualizar confirmación',
    saving: 'Enviando…',
    savedMessage: '¡Gracias! Tu confirmación fue guardada.',
    errorMessage: 'Algo salió mal, por favor intentá de nuevo.',
    editHint: 'Guardá o compartí este enlace: podés volver cuando quieras para modificar tu respuesta.',
    copyLink: 'Copiar enlace',
    copiedMessage: '¡Enlace copiado!',
    loading: 'Cargando tu invitación…',
    requireName: 'Ingresá al menos un nombre.',
    requireAttendance: 'Indicá si cada persona asistirá o no.'
  },

  footer: {
    thanks: 'Gracias por ser parte de este día tan especial para nosotros.',
    signature: 'Con amor, Silvina & Nicolás'
  },

  // ------------------------------------------------------------
  // Página de regalos (regalos.html). Para agregar o quitar una
  // idea de regalo, sumá o borrá un objeto de "items". Cada uno
  // puede tener "link" vacío si no hay un lugar puntual para verlo.
  // ------------------------------------------------------------
  wishlist: {
    title: 'Lista de regalos',
    kicker: 'CON CARIÑO',
    intro: 'Lo más importante para nosotros es compartir este día con vos. Si además querés hacernos un regalo, te dejamos algunas ideas.',
    linkText: 'Ver →',
    items: [
		{ name: 'Juego de sábanas', note: 'Talle queen, blancas o lino natural', link: '' },
		{ name: 'Vajilla', note: 'Set de platos color blanco o crudo', link: 'https://ejemplo.com' },
    ],
    emptyNote: 'Todavía no cargamos ideas por acá — ¡pronto vamos a sumar algunas!',
    cashTitle: 'Un gesto en efectivo',
    cashText: '',
    cashAlias: ''
  },

  // ------------------------------------------------------------
  // Página para subir fotos durante la fiesta (fotos.html).
  // "fallbackUrl": si ya tenés el link del álbum, pegalo acá y el
  // botón "Ir al álbum" lo va a usar directamente. Si lo dejás
  // vacío, la página intenta leer el código QR de la imagen sola.
  // ------------------------------------------------------------
  photos: {
    title: 'Compartí tus fotos',
    kicker: 'DURANTE LA FIESTA',
    intro: 'Escaneá este código con la cámara de tu celular para subir las fotos y videos que saques en la fiesta.',
    qrAlt: 'Código QR para subir fotos',
    qrMissingText: 'Todavía no subimos el código QR. Guardalo como qr-fotos.png en esta misma carpeta.',
    scanningText: 'Buscando el link dentro del código…',
    decodeErrorText: 'No pudimos leer el link del código automáticamente. ¡Igual podés escanearlo con la cámara!',
    buttonText: 'Ir al álbum →',
    fallbackUrl: ''
  },

  admin: {
    title: 'Panel de confirmaciones',
    passwordPlaceholder: 'Contraseña',
    enter: 'Entrar',
    wrongPassword: 'Contraseña incorrecta.',
    heading: 'Confirmaciones recibidas',
    statParties: 'Familias / grupos que respondieron',
    statPeople: 'Personas en total',
    statAttending: 'Asistirán',
    statNotAttending: 'No asistirán',
    statPending: 'Grupos sin responder',
    dietBreakdownTitle: 'Restricciones alimentarias (de quienes asistirán)',
    pendingTitle: 'Todavía no respondieron',
    pendingEmpty: 'Todos los grupos precargados ya respondieron. 🎉',
    pendingSetupHint: 'Para ver acá quién falta responder, precargá los grupos en guests.js.',
    pendingPeopleLabel: 'sugeridos',
    tableGroup: 'Grupo',
    tableName: 'Nombre',
    tableAttending: 'Asiste',
    tableDiet: 'Restricciones',
    tableUpdated: 'Última actualización',
    commentsTitle: 'Comentarios recibidos',
    noComments: 'Sin comentarios.',
    exportCsv: 'Exportar CSV',
    refresh: '↻ Actualizar',
    empty: 'Todavía no hay confirmaciones.',
    yes: 'Sí',
    no: 'No'
  }
};
