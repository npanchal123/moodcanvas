import type { BreakerText } from './en';

/**
 * Portuguese (Brazilian), with "você". First-person lines avoid adjectives that change with gender ("estou com
 * pouca energia" rather than "estou cansado/a"). Machine-drafted: have a native speaker review it.
 */
export const pt: BreakerText = {
  title: 'Quebre a procrastinação',
  principle: 'Não espere a motivação. Torne o começo mais fácil.',
  tabs: { start: 'Começar', progress: 'Meu progresso' },
  back: 'Voltar',
  mins: (n) => `${n} min`,
  seconds: (n) => `${n} s`,

  entry: {
    title: 'O que você está adiando hoje?',
    body: 'Vamos entender o que está te segurando e transformar isso em uma pequena ação que dá para fazer agora.',
    label: 'A tarefa que você está adiando',
    placeholder: 'Estou evitando aprender Python, procurar emprego, fazer exercício ou começar um projeto importante…',
    start: 'Me ajude a começar',
    needTask: 'Primeiro, escreva algumas palavras sobre a tarefa.',
    resumeHeading: 'Continue de onde parou',
    plannedFor: (date) => `Planejado: ${date}`,
    running: 'Você tem uma sessão de foco aberta.',
    openRunning: 'Voltar à minha sessão',
  },

  obstacle: {
    title: 'O que está dificultando começar?',
    hint: 'Escolha tudo o que se aplica. Não existe resposta errada.',
  },

  obstacles: {
    start: {
      label: 'Não sei por onde começar.',
      help: 'Vamos dividir em alguns passos simples e começar pelo mais fácil que seja útil.',
    },
    big: {
      label: 'A tarefa parece grande demais.',
      help: 'Você não precisa fazer tudo. Comece com algo que leve uns dois minutos.',
    },
    fear: {
      label: 'Tenho medo de falhar.',
      help: 'Encare essa primeira tentativa como treino. O objetivo é aprender algo, não acertar tudo.',
    },
    badly: {
      label: 'Tenho medo de fazer mal feito.',
      help: 'Defina como seria uma primeira versão simples: boa o bastante para melhorar depois.',
    },
    motivation: {
      label: 'Estou sem motivação.',
      help: 'A motivação costuma vir depois de começar, não antes. Comprometa-se só com um pequeno primeiro passo.',
    },
    distracted: {
      label: 'O celular ou outras coisas me distraem.',
      help: 'Mude uma coisa ao seu redor: deixe o celular fora de alcance e feche as abas que não precisa.',
    },
    overwhelmed: {
      label: 'Tudo está pesando demais.',
      help: 'Escolha só esta tarefa por agora. O resto pode esperar numa lista, fora da sua cabeça.',
    },
    perfect: {
      label: 'Quero que tudo fique perfeito.',
      help: 'Mire numa primeira versão pequena e imperfeita, e decida antes onde vai parar.',
    },
    easier: {
      label: 'Sempre acabo escolhendo tarefas mais fáceis.',
      help: 'Faça primeiro uma pequena ação nesta tarefa. As fáceis podem vir depois, como recompensa.',
    },
    time: {
      label: 'Não tenho tempo suficiente.',
      help: 'Até alguns minutos fazem a tarefa andar. Escolha quanto tempo você tem, e o passo vai caber nele.',
    },
    tired: {
      label: 'Estou com pouca energia.',
      help: 'Deixe mais leve: faça a versão mais fácil, descanse um pouco antes, ou marque para quando tiver mais energia.',
    },
    other: {
      label: 'Outra coisa.',
      help: 'Que bom que você contou. Vamos começar com um passo pequeno o bastante para contornar isso.',
    },
  },

  action: {
    title: 'Vamos deixar o primeiro passo mais fácil.',
    mayHelp: 'O que pode ajudar',
    label: 'Seu pequeno próximo passo',
    another: 'Ver outro',
    smaller: 'Diminuir',
    need: 'Primeiro, escreva um passo pequeno.',
    rest: 'Descansar agora e marcar para depois',
  },

  ready: {
    howLong: 'Por quanto tempo?',
    lengths: { 2: 'Arrancada de 2 minutos', 10: '10 minutos de foco', 25: '25 minutos de foco' },
    start: 'Começar agora',
  },

  timer: {
    left: 'restantes',
    progressLabel: 'Tempo de foco',
    pause: 'Pausar',
    resume: 'Retomar',
    paused: 'Pausado',
    stop: 'Parar',
    done: 'Consegui',
    timeUp: 'O tempo acabou. Respire fundo.',
    record: 'Registrar o que aconteceu',
    more: 'Mais 5 minutos',
    note: 'Você pode parar quando quiser e ainda registrar seu progresso.',
  },

  reflect: {
    title: 'Você começou. Vamos registrar seu progresso.',
    question: 'O que aconteceu?',
    outcomes: {
      done: 'Concluí a ação.',
      progress: 'Avancei um pouco.',
      hard: 'A ação ainda estava difícil demais.',
      interrupted: 'Algo me interrompeu.',
      rescheduled: 'Decidi remarcar.',
    },
    when: 'Quando você vai voltar a ela?',
    needDate: 'Escolha uma data e um horário.',
    save: 'Salvar',
    saving: 'Salvando…',
    focused: (time) => `Foco: ${time}`,
  },

  after: {
    doneTitle: 'Muito bem.',
    doneBody: 'Um passo real à frente. A tarefa inteira continua aberta até você dizer que terminou.',
    nextLabel: 'Um bom próximo passo',
    next: 'Fazer o próximo passo',
    finish: 'Parar por agora',
    progressTitle: 'Todo avanço conta.',
    progressBody: 'Você fez a tarefa andar. Continue enquanto está no ritmo, ou pause aqui.',
    keepGoing: 'Continuar por 10 minutos',
    pause: 'Pausar por agora',
    hardTitle: 'Vamos deixar menor.',
    hardBody: 'Esse passo era maior do que parecia. É útil saber disso.',
    tryInstead: 'Tente isto em vez disso',
    trySmaller: 'Tentar o passo menor',
    restart: 'Recomeçar',
    interruptedTitle: 'Interrupções acontecem.',
    interruptedBody: 'Sua sessão está salva. Um plano para a próxima vez:',
    interruptedPlan: 'Se houver uma interrupção, então anoto onde parei e volto assim que puder.',
    again: 'Começar outra sessão',
    rescheduledTitle: 'Está no seu plano.',
    rescheduledBody: (date) => `Volte a ela: ${date}. Ela vai esperar em “Continue de onde parou”.`,
    saved: 'Salvo em Meu progresso.',
  },

  progress: {
    title: 'Meu progresso',
    note: 'Salvo apenas neste dispositivo.',
    stats: {
      sessions: 'Sessões',
      done: 'Ações concluídas',
      focus: 'Tempo de foco',
      resumed: 'Retomadas após adiar',
    },
    filters: { all: 'Todas', done: 'Ações concluídas', progress: 'Avanço parcial', rescheduled: 'Remarcadas' },
    filterLabel: 'Mostrar',
    empty: 'Ainda não há sessões. A primeira pode levar só dois minutos.',
    emptyFilter: 'Ainda não há sessões assim.',
    tryFirst: 'Começar minha primeira sessão',
    inProgress: 'Em andamento',
    planned: (planned, actual) => `Planejado ${planned} · foco ${actual}`,
    details: 'Detalhes',
    obstacles: 'Obstáculos',
    action: 'Pequeno passo',
    why: 'Por que importa',
    plan: 'Plano se–então',
    reflection: 'Reflexão',
    setAside: 'Deixado de lado',
    resume: 'Retomar',
    simplify: 'Diminuir',
    delete: 'Excluir',
    deleteConfirm: 'Excluir esta sessão? Não dá para desfazer.',
  },

  categories: {
    code: {
      keywords: ['programar', 'programação', 'código', 'aplicativo', 'site', 'desenvolvimento'],
      steps: [
        'Abra seu editor de código e rode um comando print simples.',
        'Siga uma aula curta ou uma parte de um tutorial.',
        'Mude um pouco o exemplo e rode de novo.',
        'Anote uma coisa que aprendeu e o que tentar em seguida.',
      ],
      tiny: 'Abra seu editor de código e rode um comando print simples.',
      prep: 'Abra seu editor de código ou a página do curso.',
      draft: 'Escreva um pequeno script que funcione, mesmo com o código bagunçado.',
    },
    job: {
      keywords: ['emprego', 'trabalho', 'vaga', 'vagas', 'currículo', 'entrevista', 'candidatura', 'estágio'],
      steps: [
        'Encontre uma vaga que combine com você e salve o link.',
        'Leia a descrição e anote três coisas que eles procuram.',
        'Atualize uma parte do seu currículo para combinar com ela.',
        'Envie a candidatura, ou escolha um horário para enviar.',
      ],
      tiny: 'Encontre uma vaga que combine com você e salve o link.',
      prep: 'Abra um site de vagas e digite o cargo que você quer.',
      draft: 'Escreva uma carta de apresentação rápida: três frases sobre por que você combina.',
    },
    exercise: {
      keywords: ['exercício', 'exercícios', 'treino', 'treinar', 'academia', 'correr', 'corrida', 'caminhada', 'ioga'],
      steps: [
        'Coloque a roupa de treino e prepare seu espaço.',
        'Aqueça devagar por dois minutos.',
        'Faça a primeira parte do treino num ritmo tranquilo.',
        'Alongue por um minuto e repare em como se sente.',
      ],
      tiny: 'Coloque a roupa de treino e prepare o espaço para se exercitar.',
      prep: 'Deixe a roupa ou o tênis de treino onde você possa ver.',
      draft: 'Faça uma versão curta e fácil: dez minutos em vez de um treino completo.',
    },
    business: {
      keywords: ['negócio', 'empresa', 'projeto', 'produto', 'lançamento', 'marca', 'clientes', 'empreender'],
      steps: [
        'Escreva em uma frase o problema que seu projeto resolve.',
        'Anote três pessoas que poderiam precisar dele.',
        'Escolha a menor coisa que daria para criar ou testar primeiro.',
        'Marque uma data para mostrar a uma pessoa.',
      ],
      tiny: 'Escreva em uma frase o problema que seu projeto resolve.',
      prep: 'Abra uma nota e dê a ela o nome do seu projeto.',
      draft: 'Rascunhe um plano de uma página: o problema, para quem é, o primeiro passo.',
    },
    write: {
      keywords: ['escrever', 'redação', 'artigo', 'post', 'conteúdo', 'vídeo', 'relatório', 'tcc', 'livro', 'apresentação'],
      steps: [
        'Escreva três ideias soltas.',
        'Escolha uma ideia e escreva um primeiro parágrafo bagunçado.',
        'Acrescente alguns tópicos para o resto.',
        'Leia uma vez e corrija só o maior problema.',
      ],
      tiny: 'Escreva três ideias soltas para o seu próximo conteúdo.',
      prep: 'Abra uma página em branco e dê a ela um título provisório.',
      draft: 'Escreva um primeiro rascunho bagunçado de uma parte, sem revisar.',
    },
    study: {
      keywords: ['prova', 'provas', 'estudar', 'revisar', 'capítulo', 'lição de casa', 'dever de casa', 'vestibular', 'enem', 'anotações', 'matéria', 'aprender', 'curso'],
      steps: [
        'Abra o capítulo certo e leia a primeira página.',
        'Escreva três perguntas que este assunto deve responder.',
        'Resolva um exercício, ou resuma uma página.',
        'Veja o que falta e escolha o próximo assunto.',
      ],
      tiny: 'Abra o capítulo certo e leia a primeira página.',
      prep: 'Coloque o livro ou o caderno na mesa, aberto na página certa.',
      draft: 'Faça anotações rápidas sobre um assunto, com suas palavras, sem passar a limpo.',
    },
    clean: {
      keywords: ['limpar', 'limpeza', 'arrumar', 'quarto', 'lavar roupa', 'louça', 'cozinha', 'faxina'],
      steps: [
        'Libere uma superfície pequena, como uma mesa ou uma prateleira.',
        'Guarde dez coisas.',
        'Resolva uma pilha: roupas, louça ou papéis.',
        'Leve o lixo para fora.',
      ],
      tiny: 'Guarde cinco coisas que estão fora do lugar.',
      prep: 'Coloque uma música e pegue uma coisa.',
      draft: 'Deixe um cômodo bom o bastante, não impecável.',
    },
    admin: {
      keywords: ['e-mail', 'email', 'ligar', 'ligação', 'boleto', 'formulário', 'imposto', 'papelada', 'banco', 'consulta', 'responder', 'mensagem'],
      steps: [
        'Abra o e-mail, o formulário ou o documento que você está evitando.',
        'Escreva a primeira linha, ou preencha o primeiro campo.',
        'Termine a parte mais fácil.',
        'Envie, ou anote exatamente o que falta.',
      ],
      tiny: 'Abra o e-mail ou o formulário que você está evitando e leia uma vez.',
      prep: 'Encontre o e-mail ou o documento e deixe aberto na tela.',
      draft: 'Escreva uma resposta curta e simples. Não precisa ser perfeita.',
    },
    general: {
      keywords: [],
      steps: [
        'Escreva uma frase sobre como seria ter isso “pronto”.',
        'Anote as três primeiras coisinhas de que ela precisa.',
        'Faça a mais fácil das três.',
        'Decida o que vem depois, e quando.',
      ],
      tiny: 'Pegue o que precisa e faça a primeira pequena ação.',
      prep: 'Pegue o que precisa e coloque na sua frente.',
      draft: 'Faça uma versão rápida da primeira parte, sem polir.',
    },
  },
};
