import type { ComposeContent } from './types';

/** "mi casa de la playa" → "tu casa de la playa". */
function toYou(phrase: string): string {
  const swaps: Record<string, string> = { mi: 'tu', mis: 'tus', me: 'te', yo: 'tú', conmigo: 'contigo' };
  return phrase.replace(/\b(mi|mis|me|yo|conmigo)\b/gi, (w) => swaps[w.toLowerCase()]);
}

const PLACE_CUE =
  /(?:ll[eé]vame (?:a|al|hasta)|imagin(?:a|ar)(?:me)? (?:en|que estoy en)|quiero (?:estar|ir|volver) (?:a|al|en)|me gustar[ií]a (?:estar|ir) (?:a|al|en)|ojal[aá] estuviera en|visualizar(?:me)? en)\s+([^.,!?;\n]{3,60})/i;

/** Spanish building blocks. Machine-drafted: have a native speaker review it. */
export const es: ComposeContent = {
  mirror: (feeling, topic) =>
    feeling
      ? `Me contaste que sientes ${feeling.noun}${topic ? ` por ${topic}` : ''}. Tiene sentido. Durante los próximos minutos, vamos a cuidarlo juntos.`
      : 'Gracias por tomarte este tiempo para ti. Durante los próximos minutos, no tienes que hacer nada más.',
  arrival: [
    { tier: 3, pause: 1, text: 'Ponte cómodo o cómoda, y cierra los ojos si te parece bien. Puedes abrirlos en cualquier momento.' },
    { tier: 3, pause: 3, breath: true, text: 'Inhala despacio… y exhala, un poco más largo que la inhalación.' },
    { tier: 5, pause: 3, breath: true, text: 'Otra vez. Inhala… y una exhalación larga y tranquila. Deja que tus hombros se suelten.' },
  ],
  closing: [
    { tier: 5, pause: 3, text: 'Mira a tu alrededor una vez más. Puedes volver aquí cuando lo necesites, solo con recordarlo.' },
    { tier: 3, pause: 1, text: 'Respira un poco más hondo. Siente tu cuerpo donde estás, mueve los dedos y, cuando quieras, abre los ojos.' },
  ],
  anyPlace: [
    { tier: 3, pause: 3, text: 'Ahora deja que {place} aparezca a tu alrededor, despacio, como venga. Una imagen, una sensación, o simplemente saber que estás allí.' },
    { tier: 3, pause: 3, text: 'Mira a tu alrededor. Observa los colores y la luz. ¿Qué ves primero?' },
    { tier: 5, pause: 3, text: 'Escucha. ¿Qué sonidos tiene este lugar? Cerca, y a lo lejos.' },
    { tier: 3, pause: 3, text: 'Nota lo que hay debajo de ti, y cómo se siente el aire en tu piel.' },
    { tier: 10, pause: 3, text: '¿Hay algún aroma aquí? Respíralo despacio.' },
    { tier: 5, pause: 4, breath: true, text: 'Deja que te acomodes aquí. Estás a salvo, y no tienes que estar en ningún otro sitio.' },
  ],
  findPlace: (text) => {
    const match = PLACE_CUE.exec(text);
    if (!match) return null;
    const raw = match[1].split(/\s+(?:y|pero|porque|para|donde)\s+/i)[0].trim();
    return raw.length >= 3 ? { raw, place: toYou(raw) } : null;
  },
  title: (place) => place.charAt(0).toUpperCase() + place.slice(1),
  subtitle: (goal, topic) => (topic ? `${goal} · ${topic}` : goal),
  defaultTopic: 'lo que tienes en mente',

  scenes: {
    beach: {
      name: 'Playa',
      title: 'Playa tranquila',
      place: 'una playa tranquila',
      carrier: 'una ola',
      keywords: ['playa', 'mar', 'oceano', 'olas', 'costa', 'orilla'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}. La arena está tibia, y el mar se extiende frente a ti.' },
        { tier: 3, pause: 3, text: 'Mira el agua. Observa sus colores, y la luz que brilla en la superficie.' },
        { tier: 5, pause: 3, text: 'Escucha las olas. Cada una llega… y se retira despacio.' },
        { tier: 3, pause: 3, text: 'Siente la arena tibia debajo de ti, y una brisa suave que viene del agua.' },
        { tier: 10, pause: 3, text: 'Respira el aire fresco y salado.' },
        { tier: 5, pause: 4, breath: true, text: 'Deja que tu respiración siga a las olas. Inhala cuando llegan… exhala cuando se van.' },
      ],
    },
    forest: {
      name: 'Bosque',
      title: 'Bosque tranquilo',
      place: 'un bosque tranquilo',
      carrier: 'la brisa',
      keywords: ['bosque', 'selva', 'arboles'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}. Árboles altos te rodean, y el camino es suave bajo tus pies.' },
        { tier: 3, pause: 3, text: 'Mira hacia arriba. La luz del sol se filtra entre las hojas en pequeños destellos.' },
        { tier: 5, pause: 3, text: 'Escucha. Pájaros, hojas que se mueven, quizá agua en algún lugar cercano.' },
        { tier: 3, pause: 3, text: 'Apoya la mano en el tronco de un árbol. Siente lo firme que es, lo antiguo.' },
        { tier: 10, pause: 3, text: 'Respira el olor de la tierra, de las hojas verdes y del aire fresco.' },
        { tier: 5, pause: 4, breath: true, text: 'Deja que la quietud de los árboles entre en ti, respiración a respiración.' },
      ],
    },
    mountain: {
      name: 'Montaña',
      title: 'Cima de la montaña',
      place: 'la cima de una montaña',
      carrier: 'el viento',
      keywords: ['montana', 'montanas', 'cerro', 'cumbre', 'cima', 'valle', 'sierra'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}. El aire es fresco y claro, y puedes ver muy lejos.' },
        { tier: 3, pause: 3, text: 'Mira los valles y los picos lejanos. Nota lo grande y abierto que es todo.' },
        { tier: 5, pause: 3, text: 'Escucha el silencio aquí arriba. Quizá un poco de viento, quizá un pájaro muy abajo.' },
        { tier: 3, pause: 3, text: 'Siente la roca firme debajo de ti. Lleva miles de años aquí.' },
        { tier: 10, pause: 3, text: 'Respira el aire frío y limpio de la montaña. Siente cómo llena tu pecho.' },
        { tier: 5, pause: 4, breath: true, text: 'Desde aquí arriba, las preocupaciones se ven más pequeñas. Siente ese espacio.' },
      ],
    },
    garden: {
      name: 'Jardín',
      title: 'Jardín soleado',
      place: 'un jardín soleado',
      carrier: 'una mariposa',
      keywords: ['jardin', 'flores', 'parque', 'pradera', 'campo'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}. Hay flores por todas partes, y el sol es suave y cálido.' },
        { tier: 3, pause: 3, text: 'Mira los colores a tu alrededor. Pétalos brillantes, hojas verdes, un cielo despejado.' },
        { tier: 5, pause: 3, text: 'Escucha. Abejas zumbando, pájaros cantando, hojas que se mueven con suavidad.' },
        { tier: 3, pause: 3, text: 'Siente la hierba suave debajo de ti, y el sol en tu cara.' },
        { tier: 10, pause: 3, text: 'Respira el aroma dulce de las flores.' },
        { tier: 5, pause: 4, breath: true, text: 'Deja que el calor de este lugar llegue hasta dentro de ti.' },
      ],
    },
    river: {
      name: 'Río',
      title: 'Río tranquilo',
      place: 'la orilla de un río tranquilo',
      carrier: 'una hoja en el agua',
      keywords: ['rio', 'arroyo', 'lago', 'cascada'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás sentado en {place}. El agua clara pasa frente a ti sin parar.' },
        { tier: 3, pause: 3, text: 'Mira el agua. Observa cómo la luz baila sobre ella mientras fluye.' },
        { tier: 5, pause: 3, text: 'Escucha cómo corre, un sonido suave y constante que nunca se detiene.' },
        { tier: 3, pause: 3, text: 'Siente el aire fresco que sube del agua, y las piedras lisas a tu lado.' },
        { tier: 10, pause: 3, text: 'Respira el olor fresco y limpio del agua.' },
        { tier: 5, pause: 4, breath: true, text: 'Deja que tu respiración fluya como el río. Tranquila, sin prisa.' },
      ],
    },
    rain: {
      name: 'Lluvia',
      title: 'Lluvia acogedora',
      place: 'una habitación acogedora mientras llueve afuera',
      carrier: 'la lluvia',
      keywords: ['lluvia', 'llueve', 'llover', 'lluvioso', 'tormenta'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}. Estás calentito y seco, envuelto en algo suave.' },
        { tier: 3, pause: 3, text: 'Mira por la ventana. Las gotas resbalan por el cristal, y afuera todo está fresco y verde.' },
        { tier: 5, pause: 3, text: 'Escucha la lluvia. Golpecitos en el techo, suaves y constantes.' },
        { tier: 3, pause: 3, text: 'Siente el calor a tu alrededor. Quizá una manta, o una taza caliente en tus manos.' },
        { tier: 10, pause: 3, text: 'Respira el olor de la lluvia sobre la tierra.' },
        { tier: 5, pause: 4, breath: true, text: 'No tienes que ir a ningún sitio. Deja que la lluvia lo vuelva todo más lento.' },
      ],
    },
    stars: {
      name: 'Noche estrellada',
      title: 'Noche estrellada',
      place: 'un lugar tranquilo bajo las estrellas',
      carrier: 'una estrella fugaz',
      keywords: ['estrellas', 'estrellado', 'noche', 'luna'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}, recostado. La noche está en calma, y el aire es fresco.' },
        { tier: 3, pause: 3, text: 'Mira hacia arriba. Miles de estrellas, y una luna suave brillando sobre ti.' },
        { tier: 5, pause: 3, text: 'Escucha la calma de la noche. Quizá grillos, quizá una brisa suave.' },
        { tier: 3, pause: 3, text: 'Siente cómo el suelo te sostiene. No tienes que sostenerte tú.' },
        { tier: 10, pause: 3, text: 'Respira el aire fresco de la noche.' },
        { tier: 5, pause: 4, breath: true, text: 'Bajo este cielo enorme y tranquilo, siéntete pequeño, a salvo y en calma.' },
      ],
    },
    home: {
      name: 'Habitación segura',
      title: 'Habitación segura',
      place: 'una habitación cálida y segura',
      carrier: 'la brisa de la ventana abierta',
      keywords: ['casa', 'hogar', 'habitacion', 'cuarto', 'cama'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina que estás en {place}. Todo aquí se siente familiar y amable.' },
        { tier: 3, pause: 3, text: 'Mira a tu alrededor. Luz suave, tus cosas favoritas, colores que te gustan.' },
        { tier: 5, pause: 3, text: 'Escucha. Sonidos familiares y reconfortantes, o un silencio tranquilo.' },
        { tier: 3, pause: 3, text: 'Siente algo suave debajo de ti, que te sostiene por completo.' },
        { tier: 10, pause: 3, text: 'Respira un aroma reconfortante. Quizá comida en el fuego, o sábanas limpias, o té.' },
        { tier: 5, pause: 4, breath: true, text: 'Aquí estás a salvo. Puedes descansar.' },
      ],
    },
    sky: {
      name: 'Cielo abierto',
      title: 'Cielo abierto',
      place: 'un cielo amplio y abierto',
      carrier: 'una nube',
      keywords: ['cielo', 'nubes', 'nube', 'volar', 'flotar', 'flotando'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagina {place} a tu alrededor. Flotas suavemente, completamente sostenido.' },
        { tier: 3, pause: 3, text: 'Mira a tu alrededor. Nubes blancas y suaves, y azul en todas direcciones.' },
        { tier: 5, pause: 3, text: 'Escucha la calma. Solo el sonido suave del aire que pasa.' },
        { tier: 3, pause: 3, text: 'Siente lo ligero que está tu cuerpo, como si el aire mismo te sostuviera.' },
        { tier: 10, pause: 3, text: 'Respira el aire limpio y fresco, muy por encima de todo.' },
        { tier: 5, pause: 4, breath: true, text: 'Déjate flotar. Aquí hay mucho espacio.' },
      ],
    },
  },

  goals: {
    calm: {
      name: 'Calmarme',
      keywords: ['calma', 'calmarme', 'tranquilo', 'tranquila', 'relajar', 'relajarme', 'paz'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Con cada exhalación, deja que tu cuerpo se vuelva un poco más pesado, y un poco más suave.' },
        { tier: 3, pause: 4, text: 'Si aparece un pensamiento sobre {topic}, obsérvalo, y deja que {carrier} se lo lleve.' },
        { tier: 5, pause: 4, text: 'Nota tu frente, tu mandíbula, tus hombros. Deja que cada uno se suelte un poco.' },
        { tier: 10, pause: 5, text: 'Siente la calma de este lugar entrando en ti, como el calor en unas manos frías.' },
        { tier: 10, pause: 5, breath: true, text: 'Inhala calma… exhala tensión. Calma adentro… tensión afuera.' },
        { tier: 3, pause: 4, text: 'Ahora mismo estás a salvo. En este momento, no tienes que resolver nada.' },
      ],
    },
    letgo: {
      name: 'Soltar',
      keywords: ['soltar', 'olvidar', 'dejar ir', 'superar', 'dejar de pensar'],
      lines: [
        { tier: 3, pause: 4, text: 'Ahora trae {topic} a tu mente, solo por un momento. Nota dónde lo sientes en tu cuerpo.' },
        { tier: 3, pause: 5, text: 'Imagina que esa sensación se aleja de ti poco a poco, como si {carrier} se la llevara.' },
        { tier: 5, pause: 5, text: 'Si vuelve, está bien. Déjala ir otra vez. No hace falta empujar.' },
        { tier: 10, pause: 5, text: 'Con cada exhalación, imagina que sueltas un poco más. No tienes que cargar con todo.' },
        { tier: 10, pause: 5, text: 'Nota el espacio que queda. Más ligero. Más tranquilo.' },
        { tier: 3, pause: 4, breath: true, text: 'Respira en ese espacio, y deja que se llene de calma.' },
      ],
    },
    kindness: {
      name: 'Consuelo',
      keywords: ['consuelo', 'amor propio', 'abrazo', 'sanar', 'soledad', 'herido', 'herida'],
      lines: [
        { tier: 3, pause: 4, text: 'Si quieres, pon una mano sobre tu corazón. Siente su calor.' },
        { tier: 3, pause: 4, text: 'Imagina una luz suave y cálida reuniéndose a tu alrededor, como el sol de la mañana.' },
        { tier: 5, pause: 5, text: 'Deja que esa luz sostenga lo que sientes por {topic}, como sostendrías la mano de una amistad.' },
        { tier: 10, pause: 5, text: 'Dite en silencio: estoy haciendo lo que puedo. Yo también merezco cariño.' },
        { tier: 10, pause: 5, text: 'Imagina a alguien que te quiere, sentado a tu lado. No hace falta decir nada. No estás solo ni sola.' },
        { tier: 3, pause: 4, breath: true, text: 'Inhala calidez… y exhala, cada vez un poco más suave.' },
      ],
    },
    sleep: {
      name: 'Dormir',
      keywords: ['dormir', 'sueno', 'insomnio', 'no puedo dormir'],
      lines: [
        { tier: 3, pause: 5, breath: true, text: 'Deja que tu respiración se haga más lenta, sola. Más lenta… y más suave.' },
        { tier: 3, pause: 5, text: 'Siente tus pies pesados y tibios. Luego tus piernas. Luego tus caderas.' },
        { tier: 5, pause: 5, text: 'Ahora tu espalda, tus brazos, tus manos. Pesados, tibios y quietos.' },
        { tier: 10, pause: 6, text: 'Tu cara se suaviza. Tus ojos descansan. Hasta tus pensamientos se van frenando.' },
        { tier: 10, pause: 6, text: 'Si llega un pensamiento sobre {topic}, deja que {carrier} se lo lleve. Puede esperar hasta mañana.' },
        { tier: 3, pause: 6, breath: true, text: 'Ahora no hay nada que hacer más que descansar. Hunde todo lo que quieras.' },
      ],
    },
    confidence: {
      name: 'Confianza',
      keywords: ['confianza', 'valor', 'valentia', 'seguridad', 'entrevista', 'presentacion'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Siéntate un poco más erguido. Inhala, y siente cómo se abre tu pecho.' },
        { tier: 3, pause: 5, text: 'Ahora imagina que {topic} sale bien. Mírate tranquilo, preparado y firme.' },
        { tier: 5, pause: 5, text: 'Observa cómo te paras, cómo hablas, cómo respiras. Firme y claro.' },
        { tier: 10, pause: 5, text: 'Recuerda una vez que hiciste algo difícil y lo superaste. Esa fuerza sigue en ti.' },
        { tier: 10, pause: 5, text: 'Dite en silencio: estoy listo. Puedo con esto, paso a paso.' },
        { tier: 3, pause: 4, text: 'Quédate con esa sensación. Puedes llevarla contigo.' },
      ],
    },
    energy: {
      name: 'Energía',
      keywords: ['energia', 'motivacion', 'animo', 'flojera', 'pereza'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Toma una inhalación más grande, llenando todo el pecho… y suéltala.' },
        { tier: 3, pause: 4, text: 'Imagina que la luz de este lugar se vuelve más brillante, más cálida, llena de energía.' },
        { tier: 5, pause: 4, text: 'Con cada inhalación, lleva esa energía brillante a tu cuerpo.' },
        { tier: 10, pause: 4, text: 'Siente cómo se extiende: por tu pecho, por tus brazos, hasta tus manos y la punta de los dedos.' },
        { tier: 10, pause: 4, text: 'Imagínate levantándote después de esto, moviéndote con facilidad, listo para lo que sigue.' },
        { tier: 3, pause: 4, breath: true, text: 'Una inhalación más llena de energía… y exhala. Estás despierto y listo.' },
      ],
    },
    joy: {
      name: 'Saborear',
      keywords: ['celebrar', 'disfrutar', 'saborear', 'agradecido', 'agradecida', 'gratitud'],
      lines: [
        { tier: 3, pause: 4, text: 'Trae a tu mente lo que te hace sentir bien hoy. Deja que esté aquí contigo.' },
        { tier: 3, pause: 4, text: 'Nota dónde vive esa buena sensación en tu cuerpo. Quizá calor, o ligereza.' },
        { tier: 5, pause: 4, breath: true, text: 'Con cada inhalación, deja que esa sensación crezca un poco.' },
        { tier: 10, pause: 4, text: 'Imagínala como un color que brilla más con cada respiración.' },
        { tier: 10, pause: 4, text: 'Da las gracias en silencio, a alguien, a la vida o a ti, por este momento.' },
        { tier: 3, pause: 4, text: 'Haz una fotografía mental de esta sensación, para volver a ella en un día difícil.' },
      ],
    },
    focus: {
      name: 'Concentrarme',
      keywords: ['concentrarme', 'concentracion', 'enfocar', 'enfocarme', 'claridad', 'estudiar'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Lleva tu atención a tu respiración. Solo esta respiración… y esta.' },
        { tier: 3, pause: 4, text: 'Pueden llegar pensamientos. Deja que {carrier} se lleve cada uno, y vuelve a tu respiración.' },
        { tier: 5, pause: 5, text: 'Imagina tu mente como agua clara. Deja que se asiente hasta que puedas ver el fondo.' },
        { tier: 10, pause: 5, text: 'Ahora piensa en un paso pequeño y claro para {topic}. Solo uno.' },
        { tier: 10, pause: 5, text: 'Mírate haciendo ese paso, con calma y por completo.' },
        { tier: 3, pause: 4, text: 'Tu mente está clara y firme. Puedes llevar esta concentración contigo.' },
      ],
    },
  },

  topics: {
    exam: { phrase: 'el examen', keywords: ['examen', 'examenes', 'prueba', 'resultados'] },
    work: { phrase: 'el trabajo', keywords: ['trabajo', 'jefe', 'oficina', 'empleo', 'entrevista'] },
    relationship: { phrase: 'tu relación', keywords: ['novio', 'novia', 'pareja', 'ruptura', 'esposo', 'esposa', 'relacion'] },
    family: { phrase: 'tu familia', keywords: ['familia', 'padres', 'mama', 'papa', 'madre', 'padre', 'hermano', 'hermana'] },
    friends: { phrase: 'tu amistad', keywords: ['amigo', 'amiga', 'amigos', 'amigas', 'amistad'] },
    health: { phrase: 'tu salud', keywords: ['salud', 'enfermo', 'enferma', 'dolor', 'hospital', 'medico'] },
    money: { phrase: 'el dinero', keywords: ['dinero', 'deuda', 'deudas', 'alquiler', 'sueldo'] },
    future: { phrase: 'el futuro', keywords: ['futuro'] },
    exercise: { phrase: 'tu ejercicio', keywords: ['ejercicio', 'gimnasio', 'entrenamiento', 'yoga'] },
  },
};
