import type { Messages } from './en';

const vezes = (n: number) => (n === 1 ? '1 vez' : `${n} vezes`);
const registros = (n: number) => (n === 1 ? '1 registro' : `${n} registros`);

/**
 * Portuguese (Brazilian), addressing the reader as "você". Feelings are shown as nouns ("ansiedade") rather
 * than adjectives, which would change with the reader's gender. Machine-drafted: have a native speaker review
 * before release.
 */
export const pt: Messages = {
  htmlLang: 'pt',
  dir: 'ltr',
  languageName: 'Português',

  emotions: {
    joy: { name: 'Alegria', adjective: 'alegria', noun: 'alegria' },
    calm: { name: 'Calma', adjective: 'calma', noun: 'calma' },
    sadness: { name: 'Tristeza', adjective: 'tristeza', noun: 'tristeza' },
    anger: { name: 'Raiva', adjective: 'raiva', noun: 'raiva' },
    fear: { name: 'Medo / Ansiedade', adjective: 'ansiedade', noun: 'ansiedade' },
    surprise: { name: 'Surpresa', adjective: 'surpresa', noun: 'surpresa' },
    disgust: { name: 'Nojo', adjective: 'nojo', noun: 'nojo' },
  },

  bands: { mild: 'Leve', moderate: 'Moderada', strong: 'Forte' },

  app: {
    tagline: 'Visualize · Imagine · Crie',
    skipLink: 'Pular para o conteúdo principal',
    navLabel: 'Principal',
    views: { today: 'Visualizar', breaker: 'Começar', practice: 'Biblioteca', history: 'Diário', settings: 'Ajustes', privacy: 'Privacidade' },
    pageHeading: (view: string) => `Viz it: ${view}`,
    aiFallback: 'A análise inteligente não está disponível agora, então foi usada a lista de palavras integrada.',
    loading: 'Carregando…',
    footer: 'Viz it é uma ferramenta de reflexão. Não é um diagnóstico nem substitui apoio profissional.',
    footerLinks: 'Mais',
    privacyLink: 'Privacidade',
    supportLink: 'Buscar apoio agora',
  },

  reminder: {
    bannerTitle: 'Hora do seu registro',
    bannerBody: 'Como você está se sentindo agora? Algumas palavras bastam.',
    bannerAction: 'Registrar agora',
    dismiss: 'Agora não',
    notificationTitle: 'Hora de registrar',
    notificationBody: 'Como você está se sentindo? Toque para abrir o Viz it.',
    icsSummary: 'Registro no Viz it',
    icsDescription: (url: string) => `Como você está se sentindo? Abra o Viz it: ${url}`,
  },
  result: {
    mostly: (adjective: string) => `Principalmente: ${adjective}`,
    feeling: (adjective: string) => `Sentindo: ${adjective}`,
    outOf100: (n: number) => `${n} de 100`,
    withSome: (noun: string) => `, com um pouco de ${noun}`,
    noEmotion: 'Nenhuma emoção detectada',
    byAi: 'lido pela análise inteligente',
    alsoPresent: 'Também presente: ',
    adjustTitle: 'Não parece certo? Dê sua própria nota',
    adjustHint: '1 é quase nada, 10 é avassalador. Sua nota substitui a nossa.',
    adjusted: (n: number) => `Atualizado para ${n} de 100.`,
    share: 'Compartilhar ou salvar imagem…',
    newCheckIn: 'Novo registro',
  },

  create: {
    heroTitle: 'Visualize como você quer se sentir',
    heroBody:
      'Conte o que está na sua cabeça e como gostaria de imaginar. O Viz it escreve uma visualização guiada só para você, na hora, e uma voz calma conduz você do começo ao fim.',
    label: 'O que está na sua cabeça, e o que você gostaria de imaginar?',
    hintLocal: 'Escreva à vontade, no seu idioma. O que você escreve fica neste aparelho.',
    hintAi: 'Escreva à vontade. A análise inteligente está ativada, então este texto também é enviado ao Claude para ler suas emoções.',
    placeholder: 'ex.: A prova de amanhã está me deixando com ansiedade. Me leve para uma praia tranquila.',
    examplesLabel: 'Precisa de uma ideia? Experimente:',
    examples: [
      'A prova de amanhã está me deixando com ansiedade. Me leve para uma praia tranquila.',
      'Estou para baixo depois de uma briga com um amigo. Quero me sentir em segurança e acolhimento.',
      'Não consigo dormir, minha cabeça não para de pensar no trabalho.',
      'Tenho uma entrevista hoje. Quero sentir confiança, em algum lugar como as montanhas.',
    ],
    sceneLegend: 'Para onde você gostaria de ir? (opcional)',
    goalLegend: 'O que mais ajudaria? (opcional)',
    create: 'Criar minha visualização',
    creating: 'Criando…',
    needMore: 'Conte um pouco como você se sente, ou escolha um lugar ou o que ajudaria.',
    madeFrom: 'Feita a partir das suas palavras',
    understood: 'O que eu entendi',
    feeling: (name: string, n: number) => `Sentimento: ${name} (${n}/100)`,
    place: (place: string) => `Lugar: ${place}`,
    goal: (goal: string) => `Foco: ${goal}`,
    about: (topic: string) => `Sobre: ${topic}`,
    readScript: 'Ler o roteiro',
    newHereTitle: 'Primeira vez com visualização?',
    newHereBody:
      'É simplesmente imaginar com os sentidos enquanto uma voz calma guia você. Não precisa de experiência, e nem precisa “ver” imagens.',
    firstTry: 'Experimentar uma primeira visualização de 3 minutos',
    learn: 'Aprender o básico',
  },

  practice: {
    startHereTitle: 'Primeira vez com visualização?',
    startHereBody:
      'Visualização é um tipo de meditação que usa a imaginação: imaginar lugares calmos, uma luz quente ou um céu aberto para mudar como você se sente. Leia o básico e depois experimente uma primeira prática curta.',
    basicsHeading: 'O básico',
    firstButton: 'Experimentar sua primeira visualização (3 min)',
    suggestedHeading: 'Sugerido para você',
    suggestedBody: (adjective: string) => `Seu último registro de hoje: ${adjective}. Esta prática combina bem.`,
    libraryHeading: 'Todas as práticas',
    helpsWith: (names: string) => `Bom para: ${names}`,
    forBeginners: 'Bom para: começar',
    open: 'Começar',
    openLabel: (title: string) => `Começar ${title}`,
    lengthLabel: 'Quanto tempo?',
    minutes: (n: number) => `${n} min`,
    voiceLabel: 'Guia por voz',
    soundLabel: 'Som de fundo',
    noVoice: 'Este navegador não consegue falar em voz alta, então acompanhe as palavras na tela.',
    tip: 'Fones de ouvido ajudam. Procure um lugar onde ninguém vá interromper. Você pode parar a qualquer momento.',
    begin: 'Começar',
    back: 'Voltar',
    preparing: 'Preparando…',
    remaining: (clock: string) => `Faltam ${clock}`,
    progressLabel: 'Progresso',
    breatheIn: 'Inspire',
    breatheOut: 'Expire',
    pause: 'Pausar',
    resume: 'Continuar',
    end: 'Encerrar',
    restart: 'Recomeçar',
    paused: 'Em pausa',
    voiceDevice: 'Voz: a voz integrada do seu aparelho',
    voiceRecorded: 'Voz: gravação natural',
    voiceSilent: 'Voz desligada: acompanhe as palavras na tela',
    voiceMissing:
      'Este aparelho ainda não tem uma voz para este idioma, então acompanhe as palavras na tela. Você pode adicionar uma nas configurações de conversão de texto em voz do aparelho.',
    canStop: 'Você pode abrir os olhos ou parar a qualquer momento.',
    doneTitle: 'Muito bem',
    endedTitle: 'Prática encerrada',
    beforeWas: (noun: string, n: number) => `Antes, a intensidade de ${noun} estava em ${n} de 100.`,
    howStrongNow: (noun: string) => `Qual a intensidade de ${noun} agora? (0 = nenhuma, 10 = no máximo)`,
    howNow: 'Como você se sente agora, comparado a antes?',
    felt: { better: 'Melhor', same: 'Igual', worse: 'Pior' },
    save: 'Salvar',
    change: (name: string, before: number, after: number) => `${name}: ${before} → ${after}`,
    lighter: (n: number) => `São ${n} pontos a menos. Bom trabalho.`,
    same: 'Mais ou menos igual. Tudo bem: a prática dá resultado com o tempo.',
    stronger:
      'Está mais forte agora. Agradeço a sinceridade. Outra prática, uma caminhada curta ou conversar com alguém pode ajudar mais hoje.',
    feltBetter: 'Que bom que ajudou.',
    feltSame: 'Tudo bem. Como qualquer habilidade, a visualização fica mais fácil com a prática.',
    feltWorse: 'Agradeço a sinceridade. Nem toda prática combina com todo momento. Você pode tentar outra, ou fazer uma pausa.',
    again: 'Voltar às práticas',
    checkIn: 'Novo registro',
  },

  bloom: {
    title: (name: string) => `Flor: ${name}`,
    one: (name: string, n: number) => `${name} em ${n} de 100.`,
    two: (name: string, n: number, name2: string, n2: number) => `${name} em ${n} de 100, com ${name2} em ${n2}.`,
  },
  tags: {
    suggested: {
      work: 'trabalho',
      school: 'estudos',
      sleep: 'sono',
      family: 'família',
      friends: 'amigos',
      health: 'saúde',
      exercise: 'exercício',
      money: 'dinheiro',
      weather: 'clima',
      relationship: 'relacionamento',
    } as Record<string, string>,
  },
  chart: {
    summary: (days: number, parts: string[]) =>
      parts.length ? `Nos últimos ${days} dias: ${parts.join(', ')}.` : `Nenhum registro nos últimos ${days} dias ainda.`,
    part: (name: string, count: number, avg: number) => `${name} ${vezes(count)} (média ${avg})`,
    showTable: 'Mostrar como tabela',
    colEmotion: 'Emoção',
    colTimes: 'Vezes',
    colAverage: 'Intensidade média',
  },

  history: {
    weekHeading: 'Sua semana',
    filterLabel: 'Mostrar registros com a etiqueta',
    filterAny: 'Qualquer etiqueta ou nenhuma',
    calendarHeading: 'Calendário de humor',
    insightsHeading: 'Padrões que você pode notar',
    insightsNote: 'São padrões no que você registrou, não causas. Ficam mais claros quanto mais você registra.',
    insightsEmpty: 'Coloque etiquetas em mais alguns registros e os padrões vão aparecer aqui.',
    patternsHeading: 'Seus padrões',
    rangeLabel: 'Período',
    days: (n: number) => `${n} dias`,
    checkInsStat: 'Registros',
    streakStat: 'Dias seguidos',
    practicesStat: 'Práticas',
    practiceLogHeading: 'Registro de práticas',
    practiceLogEmpty: 'Suas visualizações vão aparecer aqui.',
    practiceItem: (title: string, minutes: number) => `${title} · ${minutes} min`,
    endedEarly: 'encerrada antes',
    listHeading: 'Registros',
    empty: 'Nada aqui ainda. Seus registros vão aparecer aqui.',
    yourRating: ' (sua nota)',
    tagsLabel: 'Etiquetas:',
    delete: 'Excluir',
    deleteLabel: (when: string) => `Excluir o registro de ${when}`,
    deleteConfirm: (when: string) => `Excluir o registro de ${when}?`,
  },

  calendar: {
    caption: (weeks: number) =>
      `Calendário de humor das últimas ${weeks} semanas. Cada dia mostra a emoção que você mais registrou.`,
    noCheckIns: (date: string) => `${date}: nenhum registro`,
    day: (date: string, name: string, band: string, avg: number, count: number) =>
      `${date}: principalmente ${name}, ${band.toLowerCase()} (${avg}), ${registros(count)}`,
    legendNote: 'Mais claro = mais leve, mais escuro = mais forte',
  },

  reflection: {
    empty: 'Nenhum registro nos últimos 7 dias ainda. Um rapidinho hoje é um bom começo.',
    count: (n: number) => `Você registrou ${vezes(n)} esta semana.`,
    top: (name: string, n: number) => `A emoção mais frequente: ${name} (${vezes(n)}).`,
    lighter: 'No geral, esta semana pareceu um pouco mais leve que a anterior.',
    heavier: 'No geral, esta semana pareceu um pouco mais pesada que a anterior. Tenha paciência consigo.',
    same: 'No geral, esta semana pareceu parecida com a anterior.',
    strongest: (noun: string, weekday: string, n: number) => `Sua emoção mais forte: ${noun}, ${weekday} (${n}/100).`,
    tag: (tag: string, n: number, adjective: string) =>
      `“${tag}” apareceu ${vezes(n)}, e a emoção mais presente nesses registros foi: ${adjective}.`,
  },

  insights: {
    lighter: (tag: string) => `Seus registros com a etiqueta “${tag}” costumam ser mais leves que os outros.`,
    heavier: (tag: string) => `Registros com a etiqueta “${tag}” costumam ser mais pesados que os outros.`,
    emotion: (tag: string, name: string, pct: number) =>
      `Quando você usa a etiqueta “${tag}”, a emoção mais frequente é ${name} (${pct}% das vezes).`,
    basedOn: (n: number) => `Com base em ${registros(n)} dos últimos 30 dias.`,
  },

  onboarding: {
    step: (n: number, total: number) => `Passo ${n} de ${total}`,
    steps: [
      {
        title: 'Diga como você se sente, e para onde gostaria de ir',
        body: 'Use suas próprias palavras. Cite um lugar se quiser, ou o que ajudaria. Não existe resposta errada.',
        example: '“A prova de amanhã está me deixando com ansiedade. Me leve para uma praia tranquila.”',
      },
      {
        title: 'Receba uma visualização feita para você',
        body: 'O Viz it escreve na hora uma visualização guiada com as suas palavras: o seu sentimento, o seu lugar, o que você precisa. Escolha 3, 5 ou 10 minutos.',
        example: '',
      },
      {
        title: 'Feche os olhos e siga a voz',
        body: 'Uma voz calma guia você enquanto um círculo de respiração marca o ritmo. Depois, veja quanto o sentimento mudou. Primeira vez? Comece pelo básico na Biblioteca.',
        example: '',
      },
      {
        title: 'Seus dados ficam com você',
        body: 'Tudo é salvo neste aparelho. Nada é enviado, a não ser que você ative a análise inteligente ou entre na sua conta para sincronizar. Você pode exportar ou excluir tudo a qualquer momento.',
        example: '',
      },
    ],
    skip: 'Pular',
    back: 'Voltar',
    next: 'Próximo',
    done: 'Vamos começar',
  },

  crisis: {
    title: 'Parece que você está passando por algo muito difícil.',
    askedTitle: 'Fale com alguém agora',
    body: 'Você não precisa enfrentar isso sem ajuda. Estas linhas são gratuitas, sigilosas e funcionam 24 horas.',
    call: (phone: string) => `Ligar para ${phone}`,
    text: (phone: string) => `Enviar mensagem para ${phone}`,
    emergency: 'Se você pode estar em perigo agora, ligue para',
    emergencyUnknown: 'Se você pode estar em perigo agora, ligue para o número de emergência local.',
    emergencyShort: (phone: string) => `emergência ${phone}`,
    elsewhere: 'Em outro lugar? Encontre linhas de apoio gratuitas em qualquer país em',
    findLine: 'Encontre linhas de apoio gratuitas e sigilosas no seu país em',
    otherCountries: 'Linhas de apoio em outros países',
    dismiss: 'Fechar',
  },

  privacy: {
    title: 'Privacidade',
    updated: (date: string) => `Última atualização: ${date}`,
    summary:
      'Resumindo: o que você escreve fica no seu aparelho. O Viz it não tem anúncios, análises nem rastreamento, e nunca vende nem compartilha nada sobre você.',
    sections: [
      {
        heading: 'O que fica salvo no seu aparelho',
        body: [
          'Seus registros (o que você escreveu, as emoções e notas, suas próprias notas e etiquetas), seu registro de práticas e seus ajustes ficam salvos neste navegador, só neste aparelho.',
          'Eles ficam até você excluí-los. Limpar os dados deste site no navegador também os exclui.',
        ],
      },
      {
        heading: 'O que o Viz it não faz',
        body: [
          'Sem anúncios, sem análises, sem cookies de rastreamento e sem scripts de outras empresas. O app não carrega nada de outros sites.',
          'O Viz it nunca vende, aluga ou compartilha seus dados.',
        ],
      },
      {
        heading: 'Ao carregar o site',
        body: [
          'Este site fica hospedado no GitHub Pages. Como qualquer serviço de hospedagem, o GitHub recebe seu endereço IP e dados básicos do navegador quando o app é carregado, e os guarda por segurança. O próprio Viz it nunca os vê.',
        ],
        link: {
          label: 'Declaração de privacidade do GitHub',
          href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
        },
      },
      {
        heading: 'Análise inteligente (opcional, desligada por padrão)',
        body: [
          'Só se você ativar. Cada vez que você toca em Visualizar, só as palavras da caixa de texto são enviadas ao servidor do Viz it, que as repassa ao Claude, um modelo de IA da Anthropic, para avaliar suas emoções. O servidor não as guarda nem registra.',
          'A Anthropic trata essas palavras segundo a própria política de privacidade.',
        ],
        link: { label: 'Política de privacidade da Anthropic', href: 'https://www.anthropic.com/legal/privacy' },
      },
      {
        heading: 'Conta e sincronização (opcional)',
        body: [
          'Só se você entrar na conta. Seu e-mail e as emoções, notas, datas, etiquetas e avaliações dos seus registros ficam guardados no Supabase para sincronizar entre seus aparelhos. O que você escreveu só é incluído se você ativar “Sincronizar o que escrevi”.',
          'Cada conta só consegue ler os próprios dados. Excluir sua conta exclui tudo o que está nela.',
        ],
        link: { label: 'Política de privacidade do Supabase', href: 'https://supabase.com/privacy' },
      },
      {
        heading: 'Compartilhamento, lembretes, exportações e práticas',
        body: [
          'Imagens para compartilhar e arquivos exportados são criados no seu aparelho e só vão para onde você mandar. Os lembretes vêm do seu próprio aparelho, e o lembrete de calendário é um arquivo que você adiciona por conta própria.',
          'As práticas guiadas tocam gravações deste site, ou a voz do seu aparelho. Nada do que você diz ou faz durante uma prática é gravado ou enviado.',
        ],
      },
      {
        heading: 'Suas escolhas',
        body: [
          'Em Ajustes você pode exportar seus dados em CSV ou JSON, excluir tudo e excluir sua conta. Você pode excluir registros um a um no Diário.',
        ],
      },
      {
        heading: 'Não é um serviço médico',
        body: [
          'O Viz it é uma ferramenta de reflexão, não um diagnóstico nem um tratamento. As notas vêm de uma lista de palavras ou de um modelo de IA e podem estar erradas. Se você estiver passando por um momento difícil, procure alguém. “Buscar apoio agora”, no fim de cada página, mostra linhas de apoio gratuitas.',
        ],
      },
      {
        heading: 'Perguntas e mudanças',
        body: [
          'Pergunte na página do Viz it no GitHub. Não coloque nada pessoal lá, porque ela é pública. Se esta política mudar, a data no topo também muda.',
        ],
        link: { label: 'Viz it no GitHub', href: 'https://github.com/npanchal123/vizit/issues' },
      },
    ],
  },

  consent: {
    title: 'Ativar a análise inteligente?',
    description: 'A análise inteligente entende emoções misturadas e sutis melhor que a lista de palavras integrada.',
    whatChanges: 'O que muda:',
    points: [
      'Quando você toca em Visualizar, as palavras digitadas na caixa são enviadas ao servidor do Viz it e depois ao Claude, um modelo de IA da Anthropic, que as lê para avaliar suas emoções.',
      'Nada mais é enviado: nem seu histórico, etiquetas, notas ou conta.',
      'Se ela não estiver disponível, o Viz it usa a lista de palavras integrada sem avisar.',
      'Você pode desativá-la a qualquer momento em Ajustes.',
    ],
    privacyBefore: 'Leia a',
    privacyLink: 'política de privacidade da Anthropic',
    privacyAfter: 'para ver como eles tratam isso.',
    decline: 'Agora não',
    accept: 'Ativar',
  },

  settings: {
    displayHeading: 'Tela e idioma',
    themeLabel: 'Tema',
    themes: { system: 'Igual ao aparelho', light: 'Claro', dark: 'Escuro', contrast: 'Alto contraste' },
    languageLabel: 'Idioma',
    languageHint:
      'A lista de palavras integrada entende todos estes idiomas, inclusive o hinglish. A análise inteligente entende também a maioria dos outros.',
    calmTitle: 'Modo calmo',
    calmHint: 'Desliga as animações. Também liga sozinho se o seu aparelho pedir menos movimento.',
    aiHeading: 'Análise inteligente',
    aiTitle: 'Usar IA para ler meus registros',
    aiHint:
      'Melhor para emoções misturadas e sutis. Envia só as palavras que você digita ao Claude (da Anthropic). Desligada por padrão.',
    remindersHeading: 'Lembretes',
    reminderTitle: 'Me lembrar de registrar todo dia',
    reminderTime: 'Horário do lembrete',
    reminderHint:
      'O Viz it só consegue lembrar você enquanto está aberto, ou instalado e em execução. Para um lembrete que sempre chega, adicione-o ao seu calendário.',
    reminderBlocked: 'As notificações estão bloqueadas para este site, então o lembrete só vai aparecer dentro do Viz it.',
    reminderCalendar: 'Adicionar um lembrete diário ao meu calendário',
    installHeading: 'Instalar o app',
    installHint: 'Instale o Viz it para abrir pela tela inicial ou pela área de trabalho. Funciona sem internet.',
    installButton: 'Instalar o Viz it',
    installDone: 'O Viz it está instalado neste aparelho.',
    installIos: 'No iPhone ou iPad: toque no botão Compartilhar no Safari e depois em “Adicionar à Tela de Início”.',
    installUnavailable:
      'Seu navegador não está oferecendo a instalação agora. Procure “Instalar” ou “Adicionar à tela inicial” no menu dele.',
    accountHeading: 'Conta e sincronização',
    dataHeading: 'Seus dados',
    includeText: 'Incluir o que escrevi nas exportações',
    exportCsv: 'Exportar CSV',
    exportJson: 'Exportar JSON',
    deleteAll: 'Excluir todos os dados',
    deleteAllConfirm: (synced: boolean) =>
      `Excluir todos os seus registros?${synced ? ' Isso também os exclui da sua conta e dos seus outros aparelhos sincronizados.' : ''} Não dá para desfazer.`,
    rescoreTitle: 'Atualizar registros antigos',
    rescoreHint: (n: number) =>
      `${n === 1 ? '1 registro foi lido' : `${n} registros foram lidos`} por uma versão antiga da lista de palavras integrada. Atualizar relê o que você escreveu com a versão atual. Suas próprias notas e etiquetas continuam iguais.`,
    rescoreButton: 'Atualizar',
    rescoreDone: (n: number) => (n === 1 ? '1 registro atualizado.' : `${n} registros atualizados.`),
    rescoreNone: 'Nada precisava mudar.',
    privacyLink: 'Como o Viz it trata seus dados',
  },

  account: {
    notConfigured:
      'A sincronização não está configurada nesta cópia do Viz it, então tudo fica neste aparelho. (Para desenvolvedores: adicione os dados do Supabase no .env. Veja o README.)',
    intro: 'Entre na conta para fazer backup dos seus registros e vê-los nos seus outros aparelhos. Sem senha.',
    emailLabel: 'E-mail',
    sendLink: 'Me envie um link de acesso',
    sending: 'Enviando…',
    linkSent: 'Confira sua caixa de entrada: o link de acesso está lá.',
    linkFailed: (message: string) => `Não foi possível enviar o link: ${message}`,
    signedInAs: 'Conta:',
    status: {
      idle: 'Em dia',
      syncing: 'Sincronizando…',
      offline: 'Sem internet. As mudanças vão sincronizar quando a conexão voltar.',
      error: 'Não foi possível sincronizar',
    },
    lastSynced: (when: string) => ` · última sincronização ${when}`,
    syncNow: 'Sincronizar agora',
    syncTextTitle: 'Sincronizar o que escrevi',
    syncTextHint:
      'Desligado: só emoções, notas, datas e etiquetas vão para o backup, e suas palavras ficam neste aparelho. Ligado: suas palavras também ficam guardadas na sua conta.',
    signOut: 'Sair',
    signOutRemove: 'Sair e remover deste aparelho',
    signOutRemoveConfirm:
      'Remover seus registros deste aparelho? Eles continuam seguros na sua conta e nos outros aparelhos sincronizados.',
    mergeConfirm:
      'Este aparelho tem registros de outra conta. Adicioná-los à conta em que você acabou de entrar? Escolha Cancelar para removê-los deste aparelho.',
    deleteAccount: 'Excluir minha conta…',
  },

  deleteAccount: {
    title: 'Excluir sua conta?',
    body: 'Isso exclui para sempre sua conta e todos os registros guardados nela, em todos os aparelhos sincronizados. Não dá para desfazer.',
    alsoLocal: 'Excluir também meus registros deste aparelho',
    keepNote: 'Se deixar desmarcado, seus registros ficam só neste aparelho.',
    confirm: 'Excluir minha conta',
    deleting: 'Excluindo…',
    cancel: 'Cancelar',
    failed: (message: string) => `Não foi possível excluir sua conta: ${message}`,
  },
};
