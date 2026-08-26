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
  eventDateISO: '2026-11-14T18:00:00',

  hero: {
    kicker: 'NOS CASAMOS',
    dateDisplay: '14 de noviembre de 2026',
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
    rsvp: 'Confirmar'
  },

  ceremony: {
    title: 'Ceremonia',
    time: '18:00 hs',
    place: 'Capilla Nuestra Señora del Bosque',
    address: 'Camino de las Sierras 1234, Córdoba',
    mapsUrl: 'https://maps.google.com/?q=Capilla+Nuestra+Se%C3%B1ora+del+Bosque'
  },

  reception: {
    title: 'Recepción',
    time: '20:00 hs',
    place: 'Finca El Ombú',
    address: 'Ruta Provincial 5, km 12, Córdoba',
    mapsUrl: 'https://maps.google.com/?q=Finca+El+Ombu'
  },

  dressCode: {
    title: 'Código de vestimenta',
    text: 'Elegante sport. Te pedimos evitar el blanco, ¡ese color nos lo dejamos para nosotros! 😉'
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
    signature: 'Con amor, Ana & Tomás'
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
    dietBreakdownTitle: 'Restricciones alimentarias (de quienes asistirán)',
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
