import type { Messages } from './en';

const veces = (n: number) => (n === 1 ? '1 vez' : `${n} veces`);
const registros = (n: number) => (n === 1 ? '1 registro' : `${n} registros`);

/** Spanish (neutral Latin American). Machine-drafted: have a native speaker review before release. */
export const es: Messages = {
  htmlLang: 'es',
  languageName: 'Español',

  emotions: {
    joy: { name: 'Alegría', adjective: 'alegre', noun: 'alegría' },
    calm: { name: 'Calma', adjective: 'en calma', noun: 'calma' },
    sadness: { name: 'Tristeza', adjective: 'triste', noun: 'tristeza' },
    anger: { name: 'Enojo', adjective: 'enojado/a', noun: 'enojo' },
    fear: { name: 'Miedo / Ansiedad', adjective: 'ansioso/a', noun: 'ansiedad' },
    surprise: { name: 'Sorpresa', adjective: 'sorprendido/a', noun: 'sorpresa' },
    disgust: { name: 'Asco', adjective: 'con asco', noun: 'asco' },
  },

  bands: { mild: 'Leve', moderate: 'Moderada', strong: 'Fuerte' },

  app: {
    skipLink: 'Saltar al contenido principal',
    navLabel: 'Principal',
    views: { today: 'Registrar', history: 'Historial', settings: 'Ajustes' },
    pageHeading: (view: string) => `MoodCanvas: ${view}`,
    emptyResult: 'Aquí aparecerá tu flor de emociones.',
    thisWeek: 'Esta semana',
    aiFallback: 'El análisis inteligente no está disponible ahora, así que se usó la lista de palabras integrada.',
    loading: 'Cargando…',
    footer: 'MoodCanvas es una herramienta de reflexión. No es un diagnóstico ni reemplaza la ayuda profesional.',
  },

  reminder: {
    bannerTitle: 'Es tu hora de registrar',
    bannerBody: '¿Cómo te sientes ahora? Con unas pocas palabras basta.',
    bannerAction: 'Registrar ahora',
    dismiss: 'Ahora no',
    notificationTitle: 'Hora de registrar',
    notificationBody: '¿Cómo te sientes? Toca para abrir MoodCanvas.',
    icsSummary: 'Registro en MoodCanvas',
    icsDescription: (url: string) => `¿Cómo te sientes? Abre MoodCanvas: ${url}`,
  },

  entry: {
    label: '¿Cómo te sientes?',
    hintLocal: 'Escríbelo con tus propias palabras. Lo que escribas se queda en este dispositivo.',
    hintAi:
      'Escríbelo con tus propias palabras. El análisis inteligente está activado, así que este texto se envía a Claude cuando pulses Visualizar.',
    placeholder: 'Hoy me siento… porque…',
    count: (n: number, max: number) => `${n}/${max} caracteres`,
    chipsLegend: 'O elige lo que encaje (opcional)',
    needsChip: 'No pude entenderlo con esas palabras. Elige uno o más sentimientos que encajen y vuelve a intentarlo.',
    submit: 'Visualizar',
    submitting: 'Visualizando…',
  },

  result: {
    mostly: (adjective: string) => `Sobre todo ${adjective}`,
    feeling: (adjective: string) => `Te sientes ${adjective}`,
    outOf100: (n: number) => `${n} de 100`,
    withSome: (noun: string) => `, con algo de ${noun}`,
    noEmotion: 'No se detectó ninguna emoción',
    byAi: 'leído por el análisis inteligente',
    alsoPresent: 'También presente: ',
    adjustTitle: '¿No encaja? Califícalo tú',
    adjustHint: '1 es casi nada, 10 es abrumador. Tu calificación reemplaza la nuestra.',
    adjusted: (n: number) => `Actualizado a ${n} de 100.`,
    share: 'Compartir o guardar imagen…',
    newCheckIn: 'Nuevo registro',
  },

  bloom: {
    title: (name: string) => `Flor de ${name}`,
    one: (name: string, n: number) => `${name} en ${n} de 100.`,
    two: (name: string, n: number, name2: string, n2: number) => `${name} en ${n} de 100, con ${name2} en ${n2}.`,
  },

  gauge: {
    label: 'Intensidad',
    valueText: (n: number, band: string) => `${n} de 100, ${band.toLowerCase()}`,
  },

  tags: {
    legend: '¿De qué se trata? (opcional)',
    hint: (max: number) => `Las etiquetas te ayudan a ver patrones más adelante. Hasta ${max}.`,
    addLabel: 'Agrega tu propia etiqueta',
    addPlaceholder: 'Agrega la tuya',
    add: 'Agregar',
    suggested: {
      work: 'trabajo',
      school: 'estudios',
      sleep: 'sueño',
      family: 'familia',
      friends: 'amistades',
      health: 'salud',
      exercise: 'ejercicio',
      money: 'dinero',
      weather: 'clima',
    },
  },

  share: {
    title: 'Compartir o guardar',
    description: 'Elige qué aparece en la imagen. Nada sale de la app hasta que pulses Guardar o Compartir.',
    legend: 'Incluir en la imagen',
    name: 'Nombre del sentimiento',
    intensity: 'Puntuación de intensidad',
    date: 'Fecha y hora',
    text: 'Lo que escribí',
    textWarning: 'Cualquiera que vea esta imagen podrá leer tus palabras.',
    share: 'Compartir',
    save: 'Guardar imagen',
    close: 'Cerrar',
    saved: 'Imagen guardada.',
    shared: 'Compartido.',
    savedInstead: 'Aquí no se puede compartir, así que la imagen se guardó.',
    renderFailed: 'Lo sentimos, no se pudo crear la imagen.',
    shareFailed: 'Lo sentimos, no se pudo compartir.',
    shareTitle: 'Mi flor de emociones',
  },

  chart: {
    summary: (days: number, parts: string[]) =>
      parts.length ? `En los últimos ${days} días: ${parts.join(', ')}.` : `Aún no hay registros en los últimos ${days} días.`,
    part: (name: string, count: number, avg: number) => `${name} ${veces(count)} (promedio ${avg})`,
    showTable: 'Ver como tabla',
    colEmotion: 'Emoción',
    colTimes: 'Veces',
    colAverage: 'Intensidad promedio',
  },

  history: {
    weekHeading: 'Tu semana',
    filterLabel: 'Ver registros con la etiqueta',
    filterAny: 'Cualquier etiqueta o ninguna',
    calendarHeading: 'Calendario de ánimo',
    insightsHeading: 'Patrones que quizá notes',
    insightsNote: 'Son patrones en lo que has registrado, no causas. Se vuelven más claros cuanto más registras.',
    insightsEmpty: 'Etiqueta algunos registros más y aquí aparecerán patrones.',
    patternsHeading: 'Tus patrones',
    rangeLabel: 'Periodo',
    days: (n: number) => `${n} días`,
    checkInsStat: 'Registros',
    streakStat: 'Días seguidos',
    listHeading: 'Registros',
    empty: 'Aún no hay nada. Tus registros aparecerán aquí.',
    yourRating: ' (tu calificación)',
    tagsLabel: 'Etiquetas:',
    delete: 'Eliminar',
    deleteLabel: (when: string) => `Eliminar el registro del ${when}`,
    deleteConfirm: (when: string) => `¿Eliminar el registro del ${when}?`,
  },

  calendar: {
    caption: (weeks: number) =>
      `Calendario de ánimo de las últimas ${weeks} semanas. Cada día muestra el sentimiento que más registraste.`,
    noCheckIns: (date: string) => `${date}: sin registros`,
    day: (date: string, name: string, band: string, avg: number, count: number) =>
      `${date}: sobre todo ${name}, ${band.toLowerCase()} (${avg}), ${registros(count)}`,
    legendNote: 'Más pálido = más leve, más intenso = más fuerte',
  },

  reflection: {
    empty: 'Aún no hay registros en los últimos 7 días. Uno rápido hoy es un buen comienzo.',
    count: (n: number) => `Registraste ${veces(n)} esta semana.`,
    top: (name: string, n: number) => `${name} apareció más (${veces(n)}).`,
    lighter: 'En general, esta semana se sintió un poco más ligera que la anterior.',
    heavier: 'En general, esta semana se sintió un poco más pesada que la anterior. Trátate con cariño.',
    same: 'En general, esta semana se sintió parecida a la anterior.',
    strongest: (noun: string, weekday: string, n: number) =>
      `Tu sentimiento más fuerte fue ${noun} el ${weekday} (${n}/100).`,
    tag: (tag: string, n: number, adjective: string) =>
      `“${tag}” apareció ${n} veces, y en esos registros te sentiste sobre todo ${adjective}.`,
  },

  insights: {
    lighter: (tag: string) => `Sueles sentirte más ligero/a en los registros con la etiqueta “${tag}”.`,
    heavier: (tag: string) => `Los registros con la etiqueta “${tag}” suelen sentirse más pesados que los demás.`,
    emotion: (tag: string, name: string, pct: number) =>
      `Cuando usas la etiqueta “${tag}”, el sentimiento más frecuente es ${name} (${pct}% de las veces).`,
    basedOn: (n: number) => `Basado en ${registros(n)} de los últimos 30 días.`,
  },

  onboarding: {
    step: (n: number, total: number) => `Paso ${n} de ${total}`,
    steps: [
      {
        title: 'Escribe cómo te sientes',
        body: 'Usa tus propias palabras. No hay respuestas incorrectas, y si hoy cuesta encontrar palabras puedes elegir un sentimiento de una lista.',
        example: '“Estoy muy ansioso por el examen de mañana, pero también un poco emocionado.”',
      },
      {
        title: 'Míralo como una imagen y una puntuación',
        body: 'El color muestra el sentimiento, el tamaño muestra su fuerza, y debajo hay una puntuación de 0 a 100. Si no encaja, puedes cambiarla.',
        example: '',
      },
      {
        title: 'Tus datos son tuyos',
        body: 'Todo se guarda en este dispositivo. No se envía nada a ningún lado a menos que actives el análisis inteligente o inicies sesión para sincronizar, y puedes exportarlo o borrarlo cuando quieras.',
        example: '',
      },
    ],
    skip: 'Omitir',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Empecemos',
  },

  crisis: {
    title: 'Parece que estás pasando por algo muy difícil.',
    body: 'No tienes que enfrentarlo a solas. Si podrías estar en peligro, llama al número de emergencias de tu país. Puedes encontrar líneas de apoyo gratuitas y confidenciales en tu país en',
    dismiss: 'Cerrar',
  },

  consent: {
    title: '¿Activar el análisis inteligente?',
    description: 'El análisis inteligente entiende sentimientos mezclados y sutiles mejor que la lista de palabras integrada.',
    whatChanges: 'Qué cambia:',
    points: [
      'Cuando pulses Visualizar, las palabras que escribiste en ese cuadro se envían al servidor de MoodCanvas y de ahí a Claude, un modelo de IA de Anthropic, que las lee para puntuar tus sentimientos.',
      'No se envía nada más: ni tu historial, ni etiquetas, ni calificaciones, ni tu cuenta.',
      'Si no está disponible, MoodCanvas usa la lista de palabras integrada.',
      'Puedes desactivarlo cuando quieras en Ajustes.',
    ],
    privacyBefore: 'Lee la',
    privacyLink: 'política de privacidad de Anthropic',
    privacyAfter: 'para ver cómo lo manejan.',
    decline: 'Ahora no',
    accept: 'Activar',
  },

  settings: {
    displayHeading: 'Pantalla e idioma',
    themeLabel: 'Tema',
    themes: { system: 'Igual que mi dispositivo', light: 'Claro', dark: 'Oscuro', contrast: 'Alto contraste' },
    languageLabel: 'Idioma',
    languageHint:
      'La lista de palabras integrada entiende inglés y español. El análisis inteligente entiende la mayoría de los idiomas.',
    calmTitle: 'Modo calma',
    calmHint: 'Desactiva las animaciones. También se activa solo si tu dispositivo pide reducir el movimiento.',
    aiHeading: 'Análisis inteligente',
    aiTitle: 'Usar IA para leer mis registros',
    aiHint:
      'Mejor con sentimientos mezclados y sutiles. Solo envía las palabras que escribes a Claude (de Anthropic). Desactivado por defecto.',
    remindersHeading: 'Recordatorios',
    reminderTitle: 'Recordarme registrar cada día',
    reminderTime: 'Hora del recordatorio',
    reminderHint:
      'MoodCanvas solo puede recordarte mientras está abierta, o instalada y en uso. Para un recordatorio que siempre llegue, agrégalo a tu calendario.',
    reminderBlocked:
      'Las notificaciones están bloqueadas para este sitio, así que el recordatorio aparecerá solo dentro de MoodCanvas.',
    reminderCalendar: 'Agregar un recordatorio diario a mi calendario',
    installHeading: 'Instalar la app',
    installHint: 'Instala MoodCanvas para abrirla desde tu pantalla de inicio o escritorio. Funciona sin conexión.',
    installButton: 'Instalar MoodCanvas',
    installDone: 'MoodCanvas está instalada en este dispositivo.',
    installIos: 'En iPhone o iPad: toca el botón Compartir en Safari y luego “Agregar a inicio”.',
    installUnavailable:
      'Tu navegador no ofrece instalarla ahora mismo. Busca “Instalar” o “Agregar a pantalla de inicio” en su menú.',
    accountHeading: 'Cuenta y sincronización',
    dataHeading: 'Tus datos',
    includeText: 'Incluir lo que escribí al exportar',
    exportCsv: 'Exportar CSV',
    exportJson: 'Exportar JSON',
    deleteAll: 'Borrar todos los datos',
    deleteAllConfirm: (synced: boolean) =>
      `¿Borrar todos tus registros?${synced ? ' También se borrarán de tu cuenta y de tus otros dispositivos sincronizados.' : ''} No se puede deshacer.`,
    rescoreTitle: 'Actualizar registros anteriores',
    rescoreHint: (n: number) =>
      `${n === 1 ? '1 registro fue leído' : `${n} registros fueron leídos`} con una versión anterior de la lista de palabras integrada. Al actualizar, se vuelve a leer lo que escribiste con la versión actual. Tus calificaciones y etiquetas no cambian.`,
    rescoreButton: 'Actualizarlos',
    rescoreDone: (n: number) => (n === 1 ? 'Se actualizó 1 registro.' : `Se actualizaron ${n} registros.`),
    rescoreNone: 'No hacía falta cambiar nada.',
  },

  account: {
    notConfigured:
      'La sincronización no está configurada en esta copia de MoodCanvas, así que todo se queda en este dispositivo. (Para desarrolladores: agrega los datos de Supabase a .env. Consulta el README.)',
    intro: 'Inicia sesión para respaldar tus registros y verlos en tus otros dispositivos. No necesitas contraseña.',
    emailLabel: 'Correo electrónico',
    sendLink: 'Enviarme un enlace para entrar',
    sending: 'Enviando…',
    linkSent: 'Revisa tu bandeja de entrada: te enviamos un enlace para entrar.',
    linkFailed: (message: string) => `No se pudo enviar el enlace: ${message}`,
    signedInAs: 'Sesión iniciada como',
    status: {
      idle: 'Al día',
      syncing: 'Sincronizando…',
      offline: 'Sin conexión. Los cambios se sincronizarán cuando vuelvas a conectarte.',
      error: 'No se pudo sincronizar',
    },
    lastSynced: (when: string) => ` · última sincronización: ${when}`,
    syncNow: 'Sincronizar ahora',
    syncTextTitle: 'Sincronizar lo que escribo',
    syncTextHint:
      'Desactivado: solo se respaldan sentimientos, puntuaciones, fechas y etiquetas, y tus palabras se quedan en este dispositivo. Activado: tus palabras también se guardan en tu cuenta.',
    signOut: 'Cerrar sesión',
    signOutRemove: 'Cerrar sesión y quitar de este dispositivo',
    signOutRemoveConfirm:
      '¿Quitar tus registros de este dispositivo? Siguen a salvo en tu cuenta y en tus otros dispositivos sincronizados.',
    mergeConfirm:
      'Este dispositivo tiene registros de otra cuenta. ¿Agregarlos a la cuenta con la que acabas de entrar? Elige Cancelar para quitarlos de este dispositivo.',
    deleteAccount: 'Eliminar mi cuenta…',
  },

  deleteAccount: {
    title: '¿Eliminar tu cuenta?',
    body: 'Esto elimina para siempre tu cuenta y todos los registros guardados en ella, en todos los dispositivos que se sincronizan con ella. No se puede deshacer.',
    alsoLocal: 'Borrar también mis registros de este dispositivo',
    keepNote: 'Si lo dejas desactivado, tus registros se quedan solo en este dispositivo.',
    confirm: 'Eliminar mi cuenta',
    deleting: 'Eliminando…',
    cancel: 'Cancelar',
    failed: (message: string) => `No se pudo eliminar tu cuenta: ${message}`,
  },
};
