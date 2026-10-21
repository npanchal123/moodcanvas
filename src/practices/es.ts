import type { PracticeContent } from './types';

/** Spanish scripts. Same step ids, tiers and pauses as en.ts. Drafted by AI: have a native speaker review them. */
export const es: PracticeContent = {
  lessons: [
    {
      title: '¿Qué es la visualización?',
      body: [
        'Visualizar es crear una experiencia en tu mente con tus sentidos: lo que verías, oirías, sentirías, olerías y saborearías.',
        'Los deportistas la usan para prepararse, y forma parte de muchas prácticas de meditación y relajación. Imaginar un lugar tranquilo puede relajar tu cuerpo, un poco como si estuvieras allí.',
      ],
    },
    {
      title: '¿Y si no veo imágenes?',
      body: [
        'Es muy común. Algunas personas ven imágenes claras, otras ven destellos borrosos y otras no ven imágenes en absoluto.',
        'Aun así puedes visualizar imaginando sonidos y texturas, o simplemente sabiendo qué hay allí. No hay una forma incorrecta de hacerlo.',
      ],
    },
    {
      title: 'Cómo empezar',
      body: [
        'Busca un lugar tranquilo donde nadie te interrumpa durante unos minutos. Siéntate o acuéstate cómodamente. Los auriculares ayudan.',
        'A muchas personas les ayuda cerrar los ojos, pero también puedes dejarlos abiertos, con la mirada suave en un punto. Empieza con 3 minutos.',
      ],
    },
    {
      title: 'Cuando tu mente se distrae',
      body: [
        'Pasará, y es parte de la práctica. Cuando notes que estás pensando en otra cosa, vuelve con suavidad a la voz o a tu respiración.',
        'Cada vez que vuelves, estás desarrollando la habilidad.',
      ],
    },
    {
      title: 'Practicar con seguridad',
      body: [
        'No practiques mientras conduces ni mientras haces algo que necesite tu atención.',
        'Si una imagen o un recuerdo te altera, abre los ojos, mira a tu alrededor y nombra algunas cosas que veas. Puedes parar en cualquier momento.',
        'Estas prácticas apoyan tu bienestar, pero no son un tratamiento. Si lo estás pasando mal, busca apoyo.',
      ],
    },
  ],

  practices: {
    'first-visualization': {
      title: 'Tu primera visualización',
      summary: 'Un primer intento breve y sencillo que muestra cómo la imaginación puede crear sensaciones reales.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. Esta es una primera práctica breve, y no hay nada que hacer bien o mal. Visualizar es simplemente imaginar con tus sentidos, como cuando recuerdas algo.' },
        { id: 's02', tier: 3, pause: 2, breath: true, text: 'Siéntate cómodamente. Si te parece bien, cierra los ojos, o deja tu mirada descansar suavemente en el suelo frente a ti.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Inhala despacio por la nariz… y suelta el aire por la boca.' },
        { id: 's04', tier: 3, pause: 3, text: 'Ahora imagina un limón en tu mano. Observa su amarillo brillante y los pequeños hoyuelos de su piel.' },
        { id: 's05', tier: 3, pause: 3, text: 'Siente su peso. ¿Está frío? ¿Es liso? Apriétalo con suavidad.' },
        { id: 's06', tier: 3, pause: 3, text: 'Ahora imagina que lo cortas por la mitad. El jugo corre por tus dedos y sube un olor intenso y fresco.' },
        { id: 's07', tier: 3, pause: 3, text: 'Acerca una mitad a tu boca e imagina que le das un pequeño mordisco.' },
        { id: 's08', tier: 3, pause: 2, text: 'Quizá se te hizo un poco agua la boca, o casi pudiste olerlo. Eso es visualizar. Tu mente puede crear sensaciones reales a partir de la imaginación.' },
        { id: 's09', tier: 3, pause: 2, text: 'Y si no viste una imagen clara, es completamente normal. Muchas personas imaginan a través de sensaciones, sonidos o simplemente sabiendo. Todo cuenta.' },
        { id: 's10', tier: 3, pause: 1, text: 'Deja que el limón se desvanezca. Respira lentamente una vez más. Cuando quieras, abre los ojos. Muy bien.' },
      ],
    },

    'safe-place': {
      title: 'Lugar seguro',
      summary: 'Construye en tu mente un lugar tranquilo y seguro al que puedas volver cuando sientas ansiedad.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. Esta práctica te ayuda a construir en tu mente un lugar tranquilo y seguro, al que puedas volver cuando sientas ansiedad.' },
        { id: 's02', tier: 3, pause: 1, text: 'Ponte cómodo o cómoda, y cierra los ojos si te parece bien. Puedes abrirlos en cualquier momento.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inhala despacio… y exhala, un poco más largo que la inhalación.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Otra vez. Inhala… y una exhalación larga y lenta. Deja que tus hombros bajen un poco.' },
        { id: 's05', tier: 3, pause: 3, text: 'Ahora imagina un lugar donde te sientas a salvo y en calma. Puede ser real, como una playa o tu habitación favorita, o completamente inventado.' },
        { id: 's06', tier: 3, pause: 3, text: 'Mira a tu alrededor. ¿Qué colores ves? Observa la luz. ¿Es por la mañana, o al atardecer?' },
        { id: 's07', tier: 5, pause: 3, text: 'Escucha. Quizá hay olas, pájaros, lluvia en una ventana, o simplemente silencio.' },
        { id: 's08', tier: 10, pause: 3, text: 'Nota sobre qué estás sentado o de pie. Arena, hierba, un sillón suave. Siente cómo te sostiene.' },
        { id: 's09', tier: 3, pause: 3, text: 'Inhala y nota el aire de este lugar. ¿Es cálido o fresco? ¿Trae algún aroma?' },
        { id: 's10', tier: 10, pause: 4, text: 'Aquí nada puede hacerte daño. Este lugar es tuyo, y solo entra lo que tú invitas.' },
        { id: 's11', tier: 10, pause: 4, text: 'Si se cuela una preocupación, obsérvala y deja que vuelva a salir flotando, como una nube que pasa más allá del borde de este lugar.' },
        { id: 's12', tier: 5, pause: 4, breath: true, text: 'Deja que tu cuerpo sienta lo seguro que es esto. Tu respiración se hace más lenta. Tu mandíbula se suelta.' },
        { id: 's13', tier: 10, pause: 4, text: 'Elige un pequeño detalle para recordar: un color, un sonido, una textura. Será tu camino de vuelta.' },
        { id: 's14', tier: 3, pause: 2, text: 'Puedes volver a este lugar cuando lo necesites, incluso con los ojos abiertos, solo con recordarlo.' },
        { id: 's15', tier: 3, pause: 1, text: 'Respira lentamente una vez más. Mueve los dedos de las manos y de los pies, y cuando quieras, abre los ojos.' },
      ],
    },

    'warm-light': {
      title: 'Luz cálida',
      summary: 'Una forma suave de acompañarte cuando estás de bajón, sin apartar la tristeza.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. Esta práctica es una forma suave de acompañarte cuando estás de bajón. No hace falta apartar la tristeza.' },
        { id: 's02', tier: 3, pause: 1, text: 'Busca una posición cómoda. Deja que se cierren tus ojos, o suaviza la mirada.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inhala despacio… y exhala. Que cada respiración sea un poco más amable que la anterior.' },
        { id: 's04', tier: 5, pause: 4, text: 'Nota dónde está el peso en tu cuerpo. Tu pecho, tu garganta, tus hombros. Solo obsérvalo, sin intentar arreglarlo.' },
        { id: 's05', tier: 3, pause: 3, text: 'Ahora imagina una luz suave y cálida justo encima de ti. Elige el color que te reconforte: dorado, rosado, un melocotón suave.' },
        { id: 's06', tier: 3, pause: 3, breath: true, text: 'Con tu próxima inhalación, deja que la luz baje despacio por tu cabeza y tu cara, cálida como el sol que entra por una ventana.' },
        { id: 's07', tier: 3, pause: 3, text: 'Deja que llegue a tu cuello y tus hombros. Donde toca, todo se ablanda, solo un poco.' },
        { id: 's08', tier: 5, pause: 4, text: 'Deja que la luz se reúna alrededor de tu corazón. Imagina que sostiene la tristeza con suavidad, como sostendrías la mano de una amistad.' },
        { id: 's09', tier: 10, pause: 5, text: 'Si quieres, dite en silencio unas palabras amables. Que pueda tratarme con suavidad. Que pueda estar en paz.' },
        { id: 's10', tier: 10, pause: 4, text: 'Deja que la luz baje por tus brazos hasta tus manos, y por tu cuerpo y tus piernas, hasta los pies.' },
        { id: 's11', tier: 10, pause: 5, text: 'Quizá puedas imaginar a alguien que te quiere, sentado cerca. No hace falta hablar. Solo siente que no estás solo ni sola.' },
        { id: 's12', tier: 5, pause: 4, text: 'Puede que la tristeza siga aquí, y está bien. Los sentimientos cambian como el tiempo. Le estás haciendo un poco de espacio.' },
        { id: 's13', tier: 3, pause: 4, breath: true, text: 'Descansa en esa calidez durante unas respiraciones más.' },
        { id: 's14', tier: 3, pause: 1, text: 'Deja que la luz se desvanezca poco a poco, guardando un poco de su calidez. Cuando quieras, abre los ojos.' },
      ],
    },

    'cooling-stream': {
      title: 'Arroyo fresco',
      summary: 'Enfría el enojo o la frustración dejando que tus pensamientos se alejen flotando en un arroyo.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. El enojo trae mucho calor y energía. Esta práctica te ayuda a enfriarlo, para que puedas elegir qué hacer después.' },
        { id: 's02', tier: 3, pause: 1, text: 'Siéntate con los pies apoyados en el suelo. Cierra los ojos, o mira un punto frente a ti.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inhala por la nariz… y exhala despacio por la boca, como si enfriaras una bebida caliente.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Una vez más. Inhala… y una exhalación larga y fresca. Siente tus pies apoyados en el suelo.' },
        { id: 's05', tier: 5, pause: 3, text: 'Nota dónde está el calor en tu cuerpo. Tu cara, tu mandíbula, tus manos, tu pecho. Suelta lo que puedas.' },
        { id: 's06', tier: 3, pause: 3, text: 'Ahora imagina que estás sentado en la orilla de un arroyo claro y fresco. El agua pasa frente a ti, sin parar.' },
        { id: 's07', tier: 3, pause: 3, text: 'Escucha cómo fluye. Siente el aire fresco que sube del agua.' },
        { id: 's08', tier: 3, pause: 5, text: 'Ahora imagina hojas flotando en el arroyo. Cada vez que llegue un pensamiento de enojo, ponlo sobre una hoja y mira cómo se aleja.' },
        { id: 's09', tier: 10, pause: 5, text: 'No tienes que empujar los pensamientos. Solo déjalos sobre el agua y que la corriente se los lleve.' },
        { id: 's10', tier: 10, pause: 5, text: 'Si vuelve el mismo pensamiento, está bien. Ponlo sobre otra hoja. El arroyo nunca se queda sin hojas.' },
        { id: 's11', tier: 10, pause: 4, text: 'Imagina que metes las manos en el agua. Está fría y limpia. Siente cómo el frescor sube por tus brazos y cruza tu pecho.' },
        { id: 's12', tier: 3, pause: 4, breath: true, text: 'Nota cómo el calor de tu cuerpo se suaviza, como un fuego que se calma hasta quedar en brasas tibias.' },
        { id: 's13', tier: 5, pause: 3, text: 'Lo que sientes tiene sentido. Ahora, con la mente más fresca, puedes decidir qué quieres hacer, si es que quieres hacer algo.' },
        { id: 's14', tier: 3, pause: 1, text: 'Respira lentamente una vez más, con aire fresco. Siente tus pies en el suelo y, cuando quieras, abre los ojos.' },
      ],
    },

    savoring: {
      title: 'Saborear',
      summary: 'Los buenos momentos pasan rápido. Saborea este para que se quede contigo un poco más.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. Los buenos momentos pasan rápido. Esta práctica te ayuda a saborear este, para que se quede contigo un poco más.' },
        { id: 's02', tier: 3, pause: 1, text: 'Ponte cómodo o cómoda y cierra los ojos, o deja que tu mirada descanse en algo agradable.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Inhala despacio… y exhala. Deja que aparezca una pequeña sonrisa, si quiere venir.' },
        { id: 's04', tier: 3, pause: 3, text: 'Trae a tu mente lo que te hace sentir bien ahora. Una persona, un momento, algo que hiciste.' },
        { id: 's05', tier: 3, pause: 3, text: 'Imagínalo con toda la claridad que puedas. ¿Dónde estabas? ¿Qué veías a tu alrededor?' },
        { id: 's06', tier: 5, pause: 3, text: '¿Qué podías oír? ¿Voces, risas, música, o un silencio agradable?' },
        { id: 's07', tier: 10, pause: 3, text: 'Nota los olores, sabores o texturas que forman parte de este momento.' },
        { id: 's08', tier: 3, pause: 4, text: 'Ahora nota dónde vive esa buena sensación en tu cuerpo. Quizá un calor en el pecho, o ligereza en los hombros.' },
        { id: 's09', tier: 3, pause: 4, breath: true, text: 'Con cada inhalación, imagina que esa sensación crece un poco, se expande y te llena un poco más.' },
        { id: 's10', tier: 10, pause: 4, text: 'Imagínala como un color que brilla un poco más con cada respiración.' },
        { id: 's11', tier: 5, pause: 3, text: 'Haz una fotografía mental de este momento, para volver a ella en un día más difícil.' },
        { id: 's12', tier: 10, pause: 4, text: 'Si quieres, piensa en alguien con quien compartirlo, e imagina su cara mientras se lo cuentas.' },
        { id: 's13', tier: 10, pause: 4, text: 'Da las gracias en silencio, a alguien, a la vida o a ti, por este momento.' },
        { id: 's14', tier: 3, pause: 1, text: 'Respira una vez más, sosteniendo la buena sensación. Cuando quieras, abre los ojos y llévala contigo.' },
      ],
    },

    'grounding-tree': {
      title: 'Árbol con raíces',
      summary: 'Profundiza una sensación de calma y estabilidad, y aprende una forma sencilla de volver a ella.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. Ya te sientes en calma. Esta práctica te ayuda a profundizar esa estabilidad, y a recordarla.' },
        { id: 's02', tier: 3, pause: 1, text: 'Siéntate o quédate de pie cómodamente, con los pies en el suelo. Cierra los ojos si quieres.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inhala despacio… y exhala. Nota con qué facilidad llega la respiración cuando estás en calma.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imagina que eres un árbol alto y fuerte. Tus pies son raíces que bajan a la tierra fresca y oscura.' },
        { id: 's05', tier: 5, pause: 4, breath: true, text: 'Con cada exhalación, deja que tus raíces crezcan un poco más hondo, extendiéndose y sosteniéndote firme.' },
        { id: 's06', tier: 3, pause: 3, text: 'Siente tu tronco, recto y sólido. Es tu centro. Nada necesita moverlo.' },
        { id: 's07', tier: 5, pause: 3, text: 'Por encima, tus ramas se estiran hacia el cielo. Las hojas se mueven suavemente con una brisa ligera.' },
        { id: 's08', tier: 10, pause: 4, text: 'Nota la luz del sol que se filtra entre tus hojas y las calienta.' },
        { id: 's09', tier: 10, pause: 5, text: 'Incluso con viento fuerte, las ramas de un árbol se mecen, pero sus raíces se quedan donde están. Tu calma es así.' },
        { id: 's10', tier: 10, pause: 4, breath: true, text: 'Con cada inhalación, sube energía desde tus raíces hasta la punta de tus ramas.' },
        { id: 's11', tier: 3, pause: 5, breath: true, text: 'Descansa aquí, con raíces y en calma, durante unas respiraciones.' },
        { id: 's12', tier: 5, pause: 3, text: 'Cuando la vida se acelere, puedes volver a esta sensación notando tus pies en el suelo y respirando lentamente una vez.' },
        { id: 's13', tier: 3, pause: 1, text: 'Respira una vez más. Siente tus pies y, cuando quieras, abre los ojos.' },
      ],
    },

    'clear-sky': {
      title: 'Cielo despejado',
      summary: 'Cuando tu mente está llena o algo te toma por sorpresa, mira tus pensamientos pasar como nubes.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenida, bienvenido. Cuando pasan muchas cosas, la mente se llena. Esta práctica te ayuda a hacer un poco de espacio.' },
        { id: 's02', tier: 3, pause: 1, text: 'Siéntate cómodamente. Cierra los ojos, o deja la mirada suave.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inhala despacio… y exhala. Deja que tu respiración encuentre su propio ritmo.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imagina un cielo amplio y abierto. Del color que quieras: azul claro, un amanecer suave, o una noche llena de estrellas.' },
        { id: 's05', tier: 3, pause: 4, text: 'Ahora piensa en tus pensamientos como nubes que cruzan ese cielo. Unas grandes, otras pequeñas, unas rápidas, otras lentas.' },
        { id: 's06', tier: 3, pause: 4, text: 'No tienes que perseguirlas ni apartarlas. Solo míralas pasar.' },
        { id: 's07', tier: 5, pause: 4, text: 'Si notas que te fuiste detrás de una nube, es normal. Vuelve con suavidad a mirar el cielo.' },
        { id: 's08', tier: 10, pause: 5, text: 'Prueba a nombrar cada nube con una palabra cuando pase. Planes. Preocupación. Recuerdo. Y déjala ir.' },
        { id: 's09', tier: 10, pause: 5, text: 'Nota los espacios entre las nubes. Cielo claro y abierto. Ese espacio siempre está ahí, incluso en un día nublado.' },
        { id: 's10', tier: 5, pause: 4, text: 'Tú eres el cielo, no las nubes. Los pensamientos vienen y van, y el cielo sigue amplio y abierto.' },
        { id: 's11', tier: 10, pause: 4, breath: true, text: 'Siente esa amplitud también en tu cuerpo. Tu pecho se abre, tus hombros se sueltan.' },
        { id: 's12', tier: 3, pause: 5, breath: true, text: 'Descansa como el cielo abierto durante unas respiraciones.' },
        { id: 's13', tier: 3, pause: 1, text: 'Cuando quieras, respira un poco más hondo, y abre los ojos despacio.' },
      ],
    },
  },
};
