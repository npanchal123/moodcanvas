import type { ComposeContent } from './types';

/** "a casa da minha avó" → "a casa da sua avó". */
function toYou(phrase: string): string {
  const swaps: Record<string, string> = { meu: 'seu', minha: 'sua', meus: 'seus', minhas: 'suas', mim: 'você' };
  return phrase.replace(/(?<![\p{L}])(meu|minha|meus|minhas|mim)(?![\p{L}])/giu, (w) => swaps[w.toLowerCase()]);
}

// "me leve para uma praia", "quero estar na floresta", "gostaria de ir à casa da minha avó"
const PLACE_CUE =
  /(?:me leve|leve-me|me leva|me levem|me imagine|quero (?:estar|ir|voltar)|queria (?:estar|ir|voltar)|gostaria de (?:estar|ir|voltar))\s+(para|pra|pro|a|ao|aos|à|às|até|em|no|na|nos|nas)\s+([^.,!?;\n]{3,60})/i;
// The preposition merged with the article ("na praia") gives the article back ("a praia").
const ARTICLE: Record<string, string> = { ao: 'o ', aos: 'os ', à: 'a ', às: 'as ', no: 'o ', na: 'a ', nos: 'os ', nas: 'as ', pro: 'o ' };
// A place said without an article ("ir para casa") doesn't read well inside a sentence.
const DETERMINER = /^(?:o|a|os|as|um|uma|uns|umas|seu|sua|seus|suas|esse|essa|este|esta|aquele|aquela)\s/i;

/**
 * Portuguese (Brazilian) building blocks, addressing the listener as "você" and avoiding words that change with
 * their gender. {place} is always a whole noun phrase with its article, and {topic} only follows words that don't
 * merge with "o"/"a" ("sobre", "para"), so every combination stays grammatical.
 * Machine-drafted: have a native speaker review it.
 */
export const pt: ComposeContent = {
  mirror: (feeling, topic) =>
    feeling
      ? `Você me contou que está sentindo ${feeling.noun}${topic ? ` quando pensa sobre ${topic}` : ''}. Faz sentido. Nos próximos minutos, vamos cuidar disso juntos.`
      : 'Que bom que você tirou este tempo para si. Nos próximos minutos, não há mais nada que você precise fazer.',
  arrival: [
    { tier: 3, pause: 1, text: 'Fique numa posição confortável, e feche os olhos se estiver tudo bem. Você pode abri-los a qualquer momento.' },
    { tier: 3, pause: 3, breath: true, text: 'Inspire devagar… e expire, um pouco mais longo que a inspiração.' },
    { tier: 5, pause: 3, breath: true, text: 'De novo. Inspire… e uma expiração longa e tranquila. Deixe os ombros se soltarem.' },
  ],
  closing: [
    { tier: 5, pause: 3, text: 'Olhe ao redor mais uma vez. Você pode voltar aqui sempre que precisar, só de se lembrar.' },
    { tier: 3, pause: 1, text: 'Respire mais fundo. Sinta o corpo onde você está, mexa os dedos, e quando quiser, abra os olhos.' },
  ],
  anyPlace: [
    { tier: 3, pause: 3, text: 'Agora deixe surgir ao seu redor {place}, devagar, do jeito que vier. Uma imagem, uma sensação, ou simplesmente saber que você está lá.' },
    { tier: 3, pause: 3, text: 'Olhe ao redor. Repare nas cores, e na luz. O que você vê primeiro?' },
    { tier: 5, pause: 3, text: 'Escute. Que sons fazem parte deste lugar? Perto, e longe.' },
    { tier: 3, pause: 3, text: 'Repare no que está embaixo de você, e no ar tocando a pele.' },
    { tier: 10, pause: 3, text: 'Tem algum cheiro aqui? Respire devagar.' },
    { tier: 5, pause: 4, breath: true, text: 'Deixe-se acomodar aqui. Aqui há segurança, e não há outro lugar onde estar.' },
  ],
  findPlace: (text) => {
    const match = PLACE_CUE.exec(text);
    if (!match) return null;
    const article = ARTICLE[match[1].toLowerCase()] ?? '';
    // Stop at the start of another thought: "uma praia e esquecer a prova" → "uma praia".
    const raw = match[2].split(/\s+(?:e|mas|porque|pois|para|onde)\s+/i)[0].trim();
    const place = toYou(article + raw);
    return raw.length >= 3 && DETERMINER.test(place) ? { raw, place } : null;
  },
  title: (place) => place.charAt(0).toUpperCase() + place.slice(1),
  subtitle: (goal, topic) => (topic ? `${goal} · ${topic}` : goal),
  defaultTopic: 'o que está na sua cabeça',

  scenes: {
    beach: {
      name: 'Praia',
      title: 'Praia tranquila',
      place: 'uma praia tranquila',
      carrier: 'uma onda',
      keywords: ['praia', 'praias', 'mar', 'oceano', 'onda', 'ondas', 'litoral', 'beira-mar', 'costa'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. A areia está morna, e o mar se estende à sua frente.' },
        { tier: 3, pause: 3, text: 'Olhe para a água. Repare nas cores, e na luz brilhando na superfície.' },
        { tier: 5, pause: 3, text: 'Escute as ondas. Cada uma chega… e volta devagar.' },
        { tier: 3, pause: 3, text: 'Sinta a areia morna embaixo de você, e uma brisa suave vindo da água.' },
        { tier: 10, pause: 3, text: 'Respire o ar fresco e salgado.' },
        { tier: 5, pause: 4, breath: true, text: 'Deixe a respiração acompanhar as ondas. Inspire quando elas chegam… expire quando elas voltam.' },
      ],
    },
    forest: {
      name: 'Floresta',
      title: 'Floresta tranquila',
      place: 'uma floresta tranquila',
      carrier: 'a brisa',
      keywords: ['floresta', 'florestas', 'mata', 'bosque', 'arvores', 'selva'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. Árvores altas se erguem, e o caminho é macio sob os pés.' },
        { tier: 3, pause: 3, text: 'Olhe para cima. A luz do sol passa entre as folhas em pequenas manchas que se movem.' },
        { tier: 5, pause: 3, text: 'Escute. Pássaros chamando, folhas farfalhando, talvez água em algum lugar.' },
        { tier: 3, pause: 3, text: 'Apoie a mão num tronco. Sinta como ele é firme, e antigo.' },
        { tier: 10, pause: 3, text: 'Respire o cheiro de terra, de folhas verdes e de ar fresco.' },
        { tier: 5, pause: 4, breath: true, text: 'Deixe a quietude das árvores entrar em você, uma respiração de cada vez.' },
      ],
    },
    mountain: {
      name: 'Montanhas',
      title: 'Vista das montanhas',
      place: 'o alto de uma montanha',
      carrier: 'o vento',
      keywords: ['montanha', 'montanhas', 'serra', 'morro', 'colina', 'pico', 'vale', 'himalaia'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. O ar é fresco e limpo, e dá para ver muito longe.' },
        { tier: 3, pause: 3, text: 'Olhe para os vales e os picos distantes. Repare como tudo é grande e aberto.' },
        { tier: 5, pause: 3, text: 'Escute o silêncio aqui em cima. Talvez um pouco de vento, talvez um pássaro lá embaixo.' },
        { tier: 3, pause: 3, text: 'Sinta a rocha firme embaixo de você. Ela está aqui há milhares de anos.' },
        { tier: 10, pause: 3, text: 'Respire o ar frio e limpo da montanha. Sinta-o encher o peito.' },
        { tier: 5, pause: 4, breath: true, text: 'Daqui de cima, as preocupações parecem menores. Sinta todo esse espaço.' },
      ],
    },
    garden: {
      name: 'Jardim',
      title: 'Jardim ensolarado',
      place: 'um jardim ensolarado',
      carrier: 'uma borboleta',
      keywords: ['jardim', 'jardins', 'flores', 'parque', 'campo', 'prado'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. Há flores por toda parte, e o sol está suave e quente.' },
        { tier: 3, pause: 3, text: 'Olhe as cores ao redor. Pétalas vivas, folhas verdes, um céu limpo lá em cima.' },
        { tier: 5, pause: 3, text: 'Escute. Abelhas zumbindo, pássaros cantando, folhas se mexendo de leve.' },
        { tier: 3, pause: 3, text: 'Sinta a grama macia embaixo de você, e o sol no rosto.' },
        { tier: 10, pause: 3, text: 'Respire o perfume doce das flores.' },
        { tier: 5, pause: 4, breath: true, text: 'Deixe o calor deste lugar chegar bem fundo em você.' },
      ],
    },
    river: {
      name: 'Rio',
      title: 'Rio sereno',
      place: 'um rio sereno',
      carrier: 'uma folha na água',
      keywords: ['rio', 'riacho', 'lago', 'cachoeira', 'correnteza', 'ganges'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, bem perto de você, {place}. Água limpa passa por você sem parar.' },
        { tier: 3, pause: 3, text: 'Olhe a água. Veja como a luz dança nela enquanto ela corre.' },
        { tier: 5, pause: 3, text: 'Escute a água correndo, um som suave e constante que nunca para.' },
        { tier: 3, pause: 3, text: 'Sinta o ar fresco que vem da água, e as pedras lisas ao seu lado.' },
        { tier: 10, pause: 3, text: 'Respire o cheiro fresco e limpo da água.' },
        { tier: 5, pause: 4, breath: true, text: 'Deixe a respiração correr como o rio. Fácil, sem pressa.' },
      ],
    },
    rain: {
      name: 'Chuva',
      title: 'Chuva aconchegante',
      place: 'um quarto aconchegante enquanto chove lá fora',
      carrier: 'a chuva',
      keywords: ['chuva', 'chovendo', 'chuvoso', 'tempestade', 'garoa', 'moncao'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. Aqui está quentinho e seco, e há algo macio envolvendo você.' },
        { tier: 3, pause: 3, text: 'Olhe pela janela. As gotas escorrem pelo vidro, e lá fora tudo está fresco e verde.' },
        { tier: 5, pause: 3, text: 'Escute a chuva. Batendo no telhado, suave e constante.' },
        { tier: 3, pause: 3, text: 'Sinta o calor ao seu redor. Talvez um cobertor, ou uma xícara quente nas mãos.' },
        { tier: 10, pause: 3, text: 'Respire o cheiro de chuva na terra.' },
        { tier: 5, pause: 4, breath: true, text: 'Não há para onde ir. Deixe a chuva desacelerar tudo.' },
      ],
    },
    stars: {
      name: 'Céu estrelado',
      title: 'Noite estrelada',
      place: 'um lugar tranquilo sob as estrelas',
      carrier: 'uma estrela cadente',
      keywords: ['estrelas', 'estrela', 'estrelado', 'noite', 'lua', 'luar', 'galaxia'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. A noite está calma, e o ar está fresco.' },
        { tier: 3, pause: 3, text: 'Olhe para cima. Milhares de estrelas, e uma lua suave brilhando sobre você.' },
        { tier: 5, pause: 3, text: 'Escute o silêncio da noite. Talvez grilos, talvez uma brisa leve.' },
        { tier: 3, pause: 3, text: 'Sinta o chão sustentando você. Você não precisa se segurar.' },
        { tier: 10, pause: 3, text: 'Respire o ar fresco da noite.' },
        { tier: 5, pause: 4, breath: true, text: 'Sob este céu enorme e silencioso, deixe vir a segurança e a calma.' },
      ],
    },
    home: {
      name: 'Cantinho seguro',
      title: 'Cantinho seguro',
      place: 'um quarto acolhedor e seguro',
      carrier: 'uma brisa da janela aberta',
      keywords: ['casa', 'lar', 'quarto', 'cama'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. Tudo aqui é familiar e gentil.' },
        { tier: 3, pause: 3, text: 'Olhe ao redor. Uma luz suave, suas coisas favoritas, cores que você ama.' },
        { tier: 5, pause: 3, text: 'Escute. Sons familiares e reconfortantes, ou um silêncio tranquilo.' },
        { tier: 3, pause: 3, text: 'Sinta algo macio embaixo de você, sustentando você por inteiro.' },
        { tier: 10, pause: 3, text: 'Respire um cheiro que conforta. Talvez comida no fogo, lençóis limpos, ou chá.' },
        { tier: 5, pause: 4, breath: true, text: 'Aqui há segurança. Você pode descansar.' },
      ],
    },
    sky: {
      name: 'Céu aberto',
      title: 'Céu aberto',
      place: 'um céu amplo e aberto',
      carrier: 'uma nuvem',
      keywords: ['ceu', 'nuvens', 'nuvem', 'voar', 'voando', 'flutuar', 'flutuando', 'passaro'],
      lines: [
        { tier: 3, pause: 3, text: 'Imagine agora, ao seu redor, {place}. Você flutua suavemente, e o ar sustenta você por completo.' },
        { tier: 3, pause: 3, text: 'Olhe ao redor. Nuvens brancas e macias, e azul em todas as direções.' },
        { tier: 5, pause: 3, text: 'Escute o silêncio. Só o som suave do ar passando.' },
        { tier: 3, pause: 3, text: 'Sinta como o corpo está leve, como se o próprio ar segurasse você.' },
        { tier: 10, pause: 3, text: 'Respire o ar limpo e fresco, bem acima de tudo.' },
        { tier: 5, pause: 4, breath: true, text: 'Deixe-se flutuar. Há tanto espaço aqui.' },
      ],
    },
  },

  goals: {
    calm: {
      name: 'Acalmar',
      keywords: ['calma', 'calmo', 'acalmar', 'relaxar', 'relaxamento', 'paz', 'tranquilidade', 'estresse'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'A cada expiração, deixe o corpo ficar um pouco mais pesado, e um pouco mais solto.' },
        { tier: 3, pause: 4, text: 'Se surgir um pensamento sobre {topic}, repare nele, e deixe {carrier} levá-lo embora.' },
        { tier: 5, pause: 4, text: 'Repare na testa, no maxilar, nos ombros. Deixe cada um se soltar, só um pouco.' },
        { tier: 10, pause: 5, text: 'Sinta a calma deste lugar entrando em você, como calor em mãos frias.' },
        { tier: 10, pause: 5, breath: true, text: 'Inspire calma… expire tensão. Inspire calma… expire tensão.' },
        { tier: 3, pause: 4, text: 'Agora há segurança. Neste momento, você não precisa resolver nada.' },
      ],
    },
    letgo: {
      name: 'Deixar ir',
      keywords: ['deixar ir', 'desapegar', 'esquecer', 'superar', 'seguir em frente', 'pensando demais', 'parar de pensar'],
      lines: [
        { tier: 3, pause: 4, text: 'Agora traga {topic} à mente, só por um momento. Repare onde você sente isso no corpo.' },
        { tier: 3, pause: 5, text: 'Imagine colocar essa sensação em {carrier}, e veja-a se afastar devagar de você.' },
        { tier: 5, pause: 5, text: 'Se ela voltar, tudo bem. Coloque-a lá de novo. Não é preciso forçar.' },
        { tier: 10, pause: 5, text: 'A cada expiração, imagine soltar um pouco mais. Você não precisa carregar tudo.' },
        { tier: 10, pause: 5, text: 'Repare no espaço que fica. Mais leve. Mais quieto.' },
        { tier: 3, pause: 4, breath: true, text: 'Respire nesse espaço, e deixe que ele se encha de calma.' },
      ],
    },
    kindness: {
      name: 'Conforto',
      keywords: ['conforto', 'consolo', 'carinho', 'acolhimento', 'sozinho', 'sozinha', 'solidao', 'magoado', 'magoada', 'curar', 'abraco'],
      lines: [
        { tier: 3, pause: 4, text: 'Coloque a mão no coração, se quiser. Sinta o calor dela.' },
        { tier: 3, pause: 4, text: 'Imagine uma luz suave e quente se reunindo ao seu redor, gentil como o sol da manhã.' },
        { tier: 5, pause: 5, text: 'Deixe a luz acolher tudo o que você sente sobre {topic}, como quem segura a mão de um amigo.' },
        { tier: 10, pause: 5, text: 'Diga a si em silêncio: estou fazendo o melhor que posso. Eu também mereço carinho.' },
        { tier: 10, pause: 5, text: 'Imagine alguém que se importa com você, ali do lado. Não é preciso dizer nada. Tem alguém com você.' },
        { tier: 3, pause: 4, breath: true, text: 'Inspire calor… e expire, um pouco mais suave a cada vez.' },
      ],
    },
    sleep: {
      name: 'Dormir',
      keywords: ['dormir', 'sono', 'insonia', 'adormecer'],
      lines: [
        { tier: 3, pause: 5, breath: true, text: 'Deixe a respiração ficar mais lenta, sozinha. Mais lenta… e mais suave.' },
        { tier: 3, pause: 5, text: 'Sinta os pés ficando pesados e quentes. Depois as pernas. Depois o quadril.' },
        { tier: 5, pause: 5, text: 'Agora as costas, os braços, as mãos. Pesados, quentes e quietos.' },
        { tier: 10, pause: 6, text: 'O rosto relaxa. Os olhos descansam. Até os pensamentos começam a desacelerar.' },
        { tier: 10, pause: 6, text: 'Se vier um pensamento sobre {topic}, deixe {carrier} levá-lo embora. Ele pode esperar até amanhã.' },
        { tier: 3, pause: 6, breath: true, text: 'Agora não há nada a fazer além de descansar. Afunde o quanto quiser.' },
      ],
    },
    confidence: {
      name: 'Confiança',
      keywords: ['confianca', 'coragem', 'entrevista', 'apresentacao', 'acreditar em mim', 'seguranca'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Endireite um pouco a postura. Inspire, e sinta o peito se abrir.' },
        { tier: 3, pause: 5, text: 'Agora imagine {topic} dando certo. Veja-se agindo com calma, com preparo e com firmeza.' },
        { tier: 5, pause: 5, text: 'Repare na sua postura, na sua voz, na sua respiração. Firmes e claras.' },
        { tier: 10, pause: 5, text: 'Lembre de uma vez em que você fez algo difícil e conseguiu. Essa força ainda está em você.' },
        { tier: 10, pause: 5, text: 'Diga a si em silêncio: eu consigo. Posso lidar com isso, um passo de cada vez.' },
        { tier: 3, pause: 4, text: 'Guarde essa sensação. Você pode levá-la com você.' },
      ],
    },
    energy: {
      name: 'Energia',
      keywords: ['energia', 'motivacao', 'animo', 'preguica', 'disposicao'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Faça uma inspiração maior, enchendo todo o peito… e solte.' },
        { tier: 3, pause: 4, text: 'Imagine a luz deste lugar ficando mais clara, mais quente, cheia de energia.' },
        { tier: 5, pause: 4, text: 'A cada inspiração, traga essa energia brilhante para dentro do corpo.' },
        { tier: 10, pause: 4, text: 'Sinta-a se espalhando: pelo peito, descendo pelos braços, até as mãos e a ponta dos dedos.' },
        { tier: 10, pause: 4, text: 'Veja-se levantando depois disto, se movendo com facilidade, com disposição para o que vem.' },
        { tier: 3, pause: 4, breath: true, text: 'Mais uma inspiração cheia de energia… e expire. A energia está aqui, e você pode seguir.' },
      ],
    },
    joy: {
      name: 'Saborear a alegria',
      keywords: ['celebrar', 'comemorar', 'aproveitar', 'saborear', 'gratidao', 'grato', 'grata'],
      lines: [
        { tier: 3, pause: 4, text: 'Traga à mente o que está fazendo você se sentir bem hoje. Deixe isso estar aqui com você.' },
        { tier: 3, pause: 4, text: 'Repare onde essa sensação boa mora no corpo. Talvez um calor, ou uma leveza.' },
        { tier: 5, pause: 4, breath: true, text: 'A cada inspiração, deixe essa sensação crescer um pouco.' },
        { tier: 10, pause: 4, text: 'Imagine que ela é uma cor, brilhando mais a cada respiração.' },
        { tier: 10, pause: 4, text: 'Agradeça em silêncio, a alguém, à vida ou a si, por este momento.' },
        { tier: 3, pause: 4, text: 'Tire uma foto mental desta sensação, para voltar a ela num dia mais difícil.' },
      ],
    },
    focus: {
      name: 'Foco',
      keywords: ['foco', 'focar', 'concentrar', 'concentracao', 'estudar', 'estudando', 'clareza', 'distraido', 'distraida'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Leve a atenção para a respiração. Só esta respiração… e esta.' },
        { tier: 3, pause: 4, text: 'Pensamentos podem vir. Deixe {carrier} levar cada um, e volte para a respiração.' },
        { tier: 5, pause: 5, text: 'Imagine a mente como água limpa. Deixe-a assentar até dar para ver o fundo.' },
        { tier: 10, pause: 5, text: 'Agora pense num pequeno passo claro para {topic}. Só um.' },
        { tier: 10, pause: 5, text: 'Veja-se dando esse passo, com calma e por inteiro.' },
        { tier: 3, pause: 4, text: 'Sua mente está clara e firme. Você pode levar esse foco com você.' },
      ],
    },
  },

  topics: {
    exam: { phrase: 'a prova', keywords: ['prova', 'provas', 'exame', 'exames', 'vestibular', 'enem', 'resultado'] },
    work: { phrase: 'o trabalho', keywords: ['trabalho', 'emprego', 'chefe', 'escritorio', 'prazo', 'carreira', 'entrevista'] },
    relationship: { phrase: 'o seu relacionamento', keywords: ['namorado', 'namorada', 'parceiro', 'parceira', 'termino', 'marido', 'esposa', 'relacionamento', 'casamento'] },
    family: { phrase: 'a sua família', keywords: ['familia', 'pais', 'mae', 'pai', 'irmao', 'irma'] },
    friends: { phrase: 'os seus amigos', keywords: ['amigo', 'amiga', 'amigos', 'amigas', 'amizade'] },
    health: { phrase: 'a sua saúde', keywords: ['saude', 'doente', 'dor', 'hospital', 'doenca', 'medico'] },
    money: { phrase: 'o dinheiro', keywords: ['dinheiro', 'aluguel', 'divida', 'dividas', 'contas', 'salario', 'emprestimo'] },
    future: { phrase: 'o futuro', keywords: ['futuro', 'incerto', 'incerteza'] },
    exercise: { phrase: 'o seu treino', keywords: ['exercicio', 'treino', 'academia', 'corrida', 'ioga', 'yoga'] },
  },
};
