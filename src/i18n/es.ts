import type { Messages } from './en';

const veces = (n: number) => (n === 1 ? '1 vez' : `${n} veces`);
const registros = (n: number) => (n === 1 ? '1 registro' : `${n} registros`);

/** Spanish (neutral Latin American). Machine-drafted: have a native speaker review before release. */
export const es: Messages = {
  htmlLang: 'es',
  dir: 'ltr',
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
    tagline: 'Visualiza · Imagina · Crea',
    skipLink: 'Saltar al contenido principal',
    navLabel: 'Principal',
    views: { today: 'Visualizar', breaker: 'Arrancar', habits: 'Hábitos', practice: 'Biblioteca', history: 'Diario', settings: 'Ajustes', privacy: 'Privacidad' },
    pageHeading: (view: string) => `Viz it: ${view}`,
    aiFallback: 'El análisis inteligente no está disponible ahora, así que se usó la lista de palabras integrada.',
    loading: 'Cargando…',
    footer: 'Viz it es una herramienta de reflexión. No es un diagnóstico ni reemplaza la ayuda profesional.',
    footerLinks: 'Más',
    privacyLink: 'Privacidad',
    supportLink: 'Pedir ayuda ahora',
  },

  reminder: {
    bannerTitle: 'Es tu hora de registrar',
    bannerBody: '¿Cómo te sientes ahora? Con unas pocas palabras basta.',
    bannerAction: 'Registrar ahora',
    dismiss: 'Ahora no',
    notificationTitle: 'Hora de registrar',
    notificationBody: '¿Cómo te sientes? Toca para abrir Viz it.',
    icsSummary: 'Registro en Viz it',
    icsDescription: (url: string) => `¿Cómo te sientes? Abre Viz it: ${url}`,
    commitmentTitle: 'Recordatorio: tu compromiso',
    commitmentBody: (title) => `Es la hora de: ${title}`,
    commitmentIcs: (url) => `Tu compromiso del día en Viz it: ${url}`,
    markDone: 'Marcar como hecho',
    snooze: 'Posponer 10 min',
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

  create: {
    heroTitle: 'Visualiza cómo quieres sentirte',
    heroBody:
      'Cuéntame qué tienes en mente y cómo te gustaría imaginarlo. Viz it escribe al instante una visualización guiada solo para ti, y una voz tranquila te acompaña.',
    label: '¿Qué tienes en mente, y qué te gustaría imaginar?',
    hintLocal: 'Escribe libremente. Lo que escribes se queda en este dispositivo.',
    hintAi: 'Escribe libremente. El análisis inteligente está activado, así que este texto también se envía a Claude para leer tus sentimientos.',
    placeholder:
      'Describe lo que sientes, lo que quieres imaginar o un momento que te gustaría vivir. Por ejemplo: ayúdame a prepararme mentalmente para un partido importante, imaginar una tarde tranquila o verme empezando con confianza una nueva etapa.',
    examplesLabel: '¿Necesitas una idea? Prueba una:',
    ideas: [
      { label: 'Encontrar un momento de calma', text: 'Quiero un momento tranquilo y en paz para bajar el ritmo. Llévame a un lugar sereno.' },
      { label: 'Imaginar mi yo del futuro', text: 'Ayúdame a imaginar mi yo del futuro, dentro de unos años, viviendo de una forma que tenga sentido.' },
      { label: 'Prepararme para un reto importante', text: 'Ayúdame a prepararme mentalmente, paso a paso, para un reto importante que se acerca.' },
      { label: 'Confianza antes de actuar', text: 'Tengo una actuación pronto y siento nervios. Ayúdame a sentir más estabilidad y confianza.' },
      { label: 'Volver a un recuerdo bonito', text: 'Llévame de vuelta a un recuerdo feliz para disfrutarlo de nuevo.' },
      { label: 'Prepararme para dormir bien', text: 'Ayúdame a relajarme y prepararme para un sueño reparador.' },
      { label: 'Un momento de gratitud', text: 'Ayúdame a notar y disfrutar las cosas por las que siento gratitud hoy.' },
      { label: 'Practicar la concentración', text: 'Ayúdame a practicar centrarme en una sola cosa cada vez.' },
      { label: 'Imaginar una nueva etapa', text: 'Ayúdame a imaginar que empiezo con confianza una nueva etapa en mi vida.' },
      { label: 'Ensayar una situación difícil', text: 'Ayúdame a ensayar cómo manejar con calma una conversación difícil.' },
    ],
    replaceConfirm: '¿Sustituir lo que has escrito por esta idea?',
    modeLegend: '¿Qué te gustaría visualizar? (opcional)',
    modeHint: 'Si no eliges, Viz it escoge lo que encaje con tus palabras, o mantiene la sesión simplemente relajante.',
    suggested: 'Sugerido',
    suggestedWhy: (name, why) => `Sugerencia: ${name}. ${why}`,
    mode: (name) => `Modo: ${name}`,
    createError: 'Algo salió mal al crear tu visualización. Tus palabras siguen aquí, así que puedes intentarlo de nuevo.',
    sceneLegend: '¿Adónde te gustaría ir? (opcional)',
    goalLegend: '¿Qué te ayudaría más? (opcional)',
    create: 'Crear mi visualización',
    creating: 'Creando…',
    needMore: 'Cuéntame un poco cómo te sientes, o elige un lugar o lo que te ayudaría.',
    madeFrom: 'Hecha con tus palabras',
    understood: 'Lo que entendí',
    feeling: (name: string, n: number) => `Sentimiento: ${name} (${n}/100)`,
    place: (place: string) => `Lugar: ${place}`,
    goal: (goal: string) => `Enfoque: ${goal}`,
    about: (topic: string) => `Sobre: ${topic}`,
    readScript: 'Leer el guion',
    readyTitle: 'O empieza con una visualización lista',
    readyBody: 'Sesiones guiadas para sentimientos frecuentes, listas para reproducir.',
    seeAll: 'Ver todo en la biblioteca',
    savedTitle: 'Tus visualizaciones guardadas',
    newHereTitle: '¿Es tu primera vez con la visualización?',
    newHereBody:
      'Es simplemente imaginar con tus sentidos mientras una voz tranquila te guía. No necesitas experiencia, y ni siquiera hace falta “ver” imágenes.',
    firstTry: 'Prueba una primera visualización de 3 minutos',
    learn: 'Aprende lo básico',
  },

  practice: {
    startHereTitle: '¿Es tu primera vez con la visualización?',
    startHereBody:
      'La visualización es un tipo de meditación en la que usas tu imaginación: imaginar lugares tranquilos, una luz cálida o un cielo abierto para cambiar cómo te sientes. Lee lo básico y prueba una primera práctica corta.',
    basicsHeading: 'Lo básico',
    firstButton: 'Prueba tu primera visualización (3 min)',
    suggestedHeading: 'Sugerida para ti',
    suggestedBody: (adjective: string) => `Tu último registro de hoy fue: ${adjective}. Esta práctica encaja bien.`,
    libraryHeading: 'Todas las prácticas',
    helpsWith: (names: string) => `Útil para: ${names}`,
    forBeginners: 'Útil para: empezar',
    open: 'Empezar',
    openLabel: (title: string) => `Empezar ${title}`,
    lengthLabel: '¿Cuánto tiempo?',
    minutes: (n: number) => `${n} min`,
    voiceLabel: 'Guía de voz',
    speedLabel: 'Velocidad de la voz',
    speeds: { slow: 'Más lenta', normal: 'Normal', fast: 'Más rápida' },
    breathLabel: 'Indicaciones de respiración',
    estimate: (n) => `Unos ${n} min. La duración es aproximada.`,
    soundLabel: 'Sonido de fondo',
    noVoice: 'Este navegador no puede hablar en voz alta, así que sigue las palabras en pantalla.',
    tip: 'Los auriculares ayudan. Busca un lugar donde nadie te interrumpa. Puedes parar en cualquier momento.',
    begin: 'Comenzar',
    back: 'Volver',
    preparing: 'Preparando…',
    remaining: (clock: string) => `Quedan ${clock}`,
    progressLabel: 'Progreso',
    breatheIn: 'Inhala',
    breatheOut: 'Exhala',
    pause: 'Pausa',
    resume: 'Continuar',
    end: 'Terminar',
    restart: 'Reiniciar',
    paused: 'En pausa',
    voiceDevice: 'Voz: la voz integrada de tu dispositivo',
    voiceRecorded: 'Voz: grabación de voz natural',
    voiceSilent: 'Voz desactivada: sigue las palabras en pantalla',
    voiceMissing:
      'Este dispositivo aún no tiene una voz para este idioma, así que sigue las palabras en pantalla. Puedes agregar una en los ajustes de texto a voz de tu dispositivo.',
    canStop: 'Puedes abrir los ojos o parar en cualquier momento.',
    doneTitle: 'Muy bien',
    endedTitle: 'Práctica terminada',
    beforeWas: (noun: string, n: number) => `Antes, tu ${noun} estaba en ${n} de 100.`,
    howStrongNow: (noun: string) => `¿Qué tan fuerte es ahora tu ${noun}? (0 = nada, 10 = abrumadora)`,
    feelWords: { calmer: 'Con más calma', clearer: 'Con más claridad', focused: 'Con más enfoque', confident: 'Con más confianza', hopeful: 'Con más esperanza', same: 'Más o menos igual', other: 'Otra cosa' },
    feelHint: 'Opcional. Elige lo que encaje; que no cambie nada también está bien.',
    saveFeel: 'Guardar',
    skipFeel: 'Omitir',
    feelSaved: 'Guardado. Lo encontrarás en tu diario.',
    howNow: '¿Cómo te sientes ahora?',
    felt: { better: 'Mejor', same: 'Más o menos igual', worse: 'Peor' },
    save: 'Guardar',
    change: (name: string, before: number, after: number) => `${name}: ${before} → ${after}`,
    lighter: (n: number) => `Son ${n} puntos menos. Buen trabajo.`,
    same: 'Más o menos igual. Está bien: la práctica da frutos con el tiempo.',
    stronger:
      'Ahora se siente más fuerte. Gracias por tu sinceridad. Quizá hoy te ayude más otra práctica, un paseo corto o hablar con alguien.',
    feltBetter: 'Qué bien que te ayudó.',
    feltSame: 'Está bien. Como cualquier habilidad, visualizar se vuelve más fácil con la práctica.',
    feltWorse:
      'Gracias por tu sinceridad. No todas las prácticas encajan en cada momento. Puedes probar otra, o tomarte un descanso.',
    again: 'Volver a las prácticas',
    saveFailed: 'No se guardó. Inténtalo de nuevo.',
    checkIn: 'Nuevo registro',
  },

  bloom: {
    title: (name: string) => `Flor de ${name}`,
    one: (name: string, n: number) => `${name} en ${n} de 100.`,
    two: (name: string, n: number, name2: string, n2: number) => `${name} en ${n} de 100, con ${name2} en ${n2}.`,
  },
  tags: {
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
      relationship: 'pareja',
    },
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
    practicesStat: 'Prácticas',
    practiceLogHeading: 'Registro de prácticas',
    practiceLogEmpty: 'Aquí aparecerán tus visualizaciones.',
    practiceItem: (title: string, minutes: number) => `${title} · ${minutes} min`,
    endedEarly: 'terminada antes',
    again: 'Crear de nuevo',
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
        title: 'Di cómo te sientes, y adónde te gustaría ir',
        body: 'Usa tus propias palabras. Si quieres, menciona un lugar o lo que te ayudaría. No hay respuestas incorrectas.',
        example: '“Estoy nervioso por el examen de mañana. Llévame a una playa tranquila.”',
      },
      {
        title: 'Recibe una visualización hecha para ti',
        body: 'Viz it escribe al momento una visualización guiada con tus palabras: tu sentimiento, tu lugar, lo que necesitas. Elige 3, 5 o 10 minutos.',
        example: '',
      },
      {
        title: 'Cierra los ojos y sigue la voz',
        body: 'Una voz tranquila te guía mientras un círculo de respiración marca el ritmo. Al terminar, mira cuánto cambió el sentimiento. ¿Es tu primera vez? Empieza por lo básico en la Biblioteca.',
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
    askedTitle: 'Habla con alguien ahora',
    body: 'No tienes que enfrentarlo a solas. Estas líneas son gratuitas, confidenciales y atienden las 24 horas.',
    call: (phone: string) => `Llamar al ${phone}`,
    text: (phone: string) => `Escribir al ${phone}`,
    emergency: 'Si podrías estar en peligro ahora mismo, llama al',
    emergencyUnknown: 'Si podrías estar en peligro ahora mismo, llama al número de emergencias de tu país.',
    emergencyShort: (phone: string) => `emergencias ${phone}`,
    elsewhere: '¿Estás en otro lugar? Encuentra líneas gratuitas de cualquier país en',
    findLine: 'Encuentra líneas de apoyo gratuitas y confidenciales en tu país en',
    otherCountries: 'Líneas de apoyo en otros países',
    dismiss: 'Cerrar',
  },

  privacy: {
    title: 'Privacidad',
    updated: (date: string) => `Última actualización: ${date}`,
    summary:
      'En pocas palabras: lo que escribes se queda en tu dispositivo. Viz it no tiene anuncios, ni analíticas, ni rastreo, y nunca vende ni comparte nada sobre ti.',
    sections: [
      {
        heading: 'Qué se guarda en tu dispositivo',
        body: [
          'Tus registros (lo que escribiste, los sentimientos y puntuaciones, tus propias calificaciones y etiquetas), tu registro de prácticas y tus ajustes se guardan en este navegador, solo en este dispositivo.',
          'Se quedan ahí hasta que los borres. Si borras los datos de este sitio en tu navegador, también se borran.',
        ],
      },
      {
        heading: 'Lo que Viz it no hace',
        body: [
          'Sin anuncios, sin analíticas, sin cookies de rastreo y sin scripts de otras empresas. La app no carga nada de otros sitios web.',
          'Viz it nunca vende, alquila ni comparte tus datos.',
        ],
      },
      {
        heading: 'Al cargar el sitio',
        body: [
          'Este sitio está alojado en GitHub Pages. Como cualquier servicio de alojamiento, GitHub recibe tu dirección IP y datos básicos del navegador cuando cargas la app, y los guarda por seguridad. Viz it nunca los ve.',
        ],
        link: {
          label: 'Declaración de privacidad de GitHub',
          href: 'https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement',
        },
      },
      {
        heading: 'Análisis inteligente (opcional, desactivado por defecto)',
        body: [
          'Solo si lo activas. Cada vez que pulses Visualizar, solo las palabras del cuadro se envían al servidor de Viz it, que las pasa a Claude, un modelo de IA de Anthropic, para puntuar tus sentimientos. El servidor no las guarda ni las registra.',
          'Anthropic las trata según su propia política de privacidad.',
        ],
        link: { label: 'Política de privacidad de Anthropic', href: 'https://www.anthropic.com/legal/privacy' },
      },
      {
        heading: 'Cuenta y sincronización (opcional)',
        body: [
          'Solo si inicias sesión. Tu correo electrónico y los sentimientos, puntuaciones, fechas, etiquetas y calificaciones de tus registros se guardan en Supabase para sincronizarlos entre tus dispositivos. Lo que escribiste solo se incluye si activas “Sincronizar lo que escribo”.',
          'Cada cuenta solo puede leer sus propios datos. Al eliminar tu cuenta se borra todo lo que contiene.',
        ],
        link: { label: 'Política de privacidad de Supabase', href: 'https://supabase.com/privacy' },
      },
      {
        heading: 'Compartir, recordatorios, exportaciones y prácticas',
        body: [
          'Las imágenes para compartir y los archivos exportados se crean en tu dispositivo y solo van adonde tú los envíes. Los recordatorios los muestra tu propio dispositivo, y el recordatorio de calendario es un archivo que agregas tú.',
          'Las prácticas guiadas reproducen grabaciones de este sitio, o la voz de tu propio dispositivo. Nada de lo que dices o haces durante una práctica se graba ni se envía.',
        ],
      },
      {
        heading: 'Tus opciones',
        body: [
          'En Ajustes puedes exportar tus datos en CSV o JSON, borrarlos todos y eliminar tu cuenta. En Historial puedes borrar registros uno por uno.',
        ],
      },
      {
        heading: 'No es un servicio médico',
        body: [
          'Viz it es una herramienta de reflexión, no un diagnóstico ni un tratamiento. Sus puntuaciones vienen de una lista de palabras o de un modelo de IA y pueden equivocarse. Si lo estás pasando mal, busca a alguien con quien hablar. “Pedir ayuda ahora”, al pie de cada página, muestra líneas de ayuda gratuitas.',
        ],
      },
      {
        heading: 'Preguntas y cambios',
        body: [
          'Pregunta en la página de Viz it en GitHub. No incluyas nada personal, porque es pública. Si esta política cambia, la fecha de arriba también cambia.',
        ],
        link: { label: 'Viz it en GitHub', href: 'https://github.com/npanchal123/vizit/issues' },
      },
    ],
  },

  consent: {
    title: '¿Activar el análisis inteligente?',
    description: 'El análisis inteligente entiende sentimientos mezclados y sutiles mejor que la lista de palabras integrada.',
    whatChanges: 'Qué cambia:',
    points: [
      'Cuando pulses Visualizar, las palabras que escribiste en ese cuadro se envían al servidor de Viz it y de ahí a Claude, un modelo de IA de Anthropic, que las lee para puntuar tus sentimientos.',
      'No se envía nada más: ni tu historial, ni etiquetas, ni calificaciones, ni tu cuenta.',
      'Si no está disponible, Viz it usa la lista de palabras integrada.',
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
      'La lista de palabras integrada entiende todos estos idiomas, incluido el hinglish. El análisis inteligente entiende también la mayoría de los demás.',
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
      'Viz it solo puede recordarte mientras está abierta, o instalada y en uso. Para un recordatorio que siempre llegue, agrégalo a tu calendario.',
    reminderBlocked:
      'Las notificaciones están bloqueadas para este sitio, así que el recordatorio aparecerá solo dentro de Viz it.',
    reminderCalendar: 'Agregar un recordatorio diario a mi calendario',
    installHeading: 'Instalar la app',
    installHint: 'Instala Viz it para abrirla desde tu pantalla de inicio o escritorio. Funciona sin conexión.',
    installButton: 'Instalar Viz it',
    installDone: 'Viz it está instalada en este dispositivo.',
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
    privacyLink: 'Cómo trata Viz it tus datos',
  },

  account: {
    notConfigured:
      'La sincronización no está configurada en esta copia de Viz it, así que todo se queda en este dispositivo. (Para desarrolladores: agrega los datos de Supabase a .env. Consulta el README.)',
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
