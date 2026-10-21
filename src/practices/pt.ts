import type { PracticeContent } from './types';

/**
 * Portuguese (Brazilian) scripts, addressing the listener as "você" and avoiding words that change with their
 * gender. Machine-drafted: have a native speaker review before release.
 */
export const pt: PracticeContent = {
  lessons: [
    {
      title: 'O que é visualização?',
      body: [
        'Visualizar é criar uma experiência na mente usando os sentidos: o que você veria, ouviria, sentiria no corpo, o cheiro e o gosto.',
        'Atletas usam a visualização para se preparar, e ela faz parte de muitas práticas de meditação e relaxamento. Imaginar um lugar calmo pode relaxar o corpo, um pouco como se você estivesse lá de verdade.',
      ],
    },
    {
      title: 'E se eu não conseguir ver imagens?',
      body: [
        'Isso é muito comum. Algumas pessoas veem imagens nítidas, outras veem lampejos, e outras não veem imagem nenhuma.',
        'Mesmo assim dá para visualizar imaginando sons e texturas, ou simplesmente sabendo o que está ali. Não existe jeito errado.',
      ],
    },
    {
      title: 'Como começar',
      body: [
        'Encontre um lugar tranquilo onde ninguém vá interromper por alguns minutos. Sente ou deite de um jeito confortável. Fones de ouvido ajudam.',
        'Fechar os olhos ajuda muita gente, mas você também pode deixá-los abertos, com o olhar suave num ponto. Comece com 3 minutos.',
      ],
    },
    {
      title: 'Quando a mente se distrai',
      body: [
        'Isso vai acontecer, e faz parte da prática. Quando perceber que está pensando em outra coisa, volte com gentileza para a voz ou para a respiração.',
        'Cada vez que você volta, a habilidade fica mais forte.',
      ],
    },
    {
      title: 'Praticar com segurança',
      body: [
        'Não pratique enquanto dirige ou faz algo que exige atenção.',
        'Se uma imagem ou lembrança incomodar, abra os olhos, olhe ao redor e diga o nome de algumas coisas que você vê. Você pode parar a qualquer momento.',
        'Estas práticas apoiam o seu bem-estar, mas não são um tratamento. Se estiver passando por um momento difícil, procure apoio.',
      ],
    },
  ],

  practices: {
    'first-visualization': {
      title: 'Sua primeira visualização',
      summary: 'Uma primeira experiência curta e simples, que mostra como a imaginação cria sensações reais.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. Esta é uma primeira prática curta, e não há nada para acertar. Visualizar é simplesmente imaginar com os sentidos, como quando você se lembra de algo.' },
        { id: 's02', tier: 3, pause: 2, breath: true, text: 'Sente de um jeito confortável. Se estiver tudo bem, feche os olhos, ou deixe o olhar descansar no chão à sua frente.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Inspire devagar pelo nariz… e solte o ar pela boca.' },
        { id: 's04', tier: 3, pause: 3, text: 'Agora imagine um limão na sua mão. Repare no amarelo vivo, e nas pequenas covinhas da casca.' },
        { id: 's05', tier: 3, pause: 3, text: 'Sinta o peso dele. Está fresco? Liso? Aperte de leve.' },
        { id: 's06', tier: 3, pause: 3, text: 'Agora imagine que você corta o limão ao meio. O suco escorre pelos dedos, e sobe um cheiro forte e fresco.' },
        { id: 's07', tier: 3, pause: 3, text: 'Leve uma metade perto da boca, e imagine dar uma mordidinha.' },
        { id: 's08', tier: 3, pause: 2, text: 'Talvez sua boca tenha salivado um pouco, ou você quase sentiu o cheiro. Isso é visualização. A mente consegue criar sensações reais com a imaginação.' },
        { id: 's09', tier: 3, pause: 2, text: 'E se você não viu uma imagem nítida, é completamente normal. Muita gente imagina pela sensação, pelo som, ou simplesmente sabendo. Tudo isso vale.' },
        { id: 's10', tier: 3, pause: 1, text: 'Deixe o limão desaparecer. Respire devagar mais uma vez. Quando quiser, abra os olhos. Muito bem.' },
      ],
    },

    'safe-place': {
      title: 'Lugar seguro',
      summary: 'Construa na mente um lugar calmo e seguro, para onde voltar sempre que a ansiedade aparecer.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. Esta prática ajuda você a construir um lugar calmo e seguro na mente, um lugar para onde voltar sempre que a ansiedade aparecer.' },
        { id: 's02', tier: 3, pause: 1, text: 'Fique numa posição confortável, e feche os olhos se estiver tudo bem. Você pode abri-los a qualquer momento.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspire devagar… e expire, um pouco mais longo que a inspiração.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'De novo. Inspire… e uma expiração longa e lenta. Deixe os ombros descerem um pouco.' },
        { id: 's05', tier: 3, pause: 3, text: 'Agora imagine um lugar onde você sente segurança e tranquilidade. Pode ser real, como uma praia ou um cômodo favorito, ou totalmente inventado.' },
        { id: 's06', tier: 3, pause: 3, text: 'Olhe ao redor. Que cores você vê? Repare na luz. É de manhã, ou fim de tarde?' },
        { id: 's07', tier: 5, pause: 3, text: 'Escute. Talvez ondas, pássaros cantando, chuva na janela, ou simplesmente silêncio.' },
        { id: 's08', tier: 10, pause: 3, text: 'Repare no que está sustentando você. Areia, grama, uma poltrona macia. Sinta como isso apoia o seu corpo.' },
        { id: 's09', tier: 3, pause: 3, text: 'Inspire, e repare no ar daqui. Está quente, ou fresco? Tem algum perfume?' },
        { id: 's10', tier: 10, pause: 4, text: 'Nada aqui pode machucar você. Este lugar é seu, e só entra o que você convidar.' },
        { id: 's11', tier: 10, pause: 4, text: 'Se uma preocupação aparecer, repare nela, e deixe que ela saia flutuando, como uma nuvem passando além da borda deste lugar.' },
        { id: 's12', tier: 5, pause: 4, breath: true, text: 'Deixe o corpo absorver essa sensação de segurança. A respiração fica mais lenta. O maxilar se solta.' },
        { id: 's13', tier: 10, pause: 4, text: 'Escolha um pequeno detalhe para lembrar: uma cor, um som, uma textura. Esse será o seu caminho de volta para cá.' },
        { id: 's14', tier: 3, pause: 2, text: 'Você pode voltar a este lugar sempre que precisar, mesmo de olhos abertos, só de se lembrar dele.' },
        { id: 's15', tier: 3, pause: 1, text: 'Respire devagar mais uma vez. Mexa os dedos das mãos e dos pés, e quando quiser, abra os olhos.' },
      ],
    },

    'warm-light': {
      title: 'Luz acolhedora',
      summary: 'Um jeito gentil de fazer companhia a si quando o ânimo está baixo, sem afastar a tristeza.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. Esta prática é um jeito gentil de fazer companhia a si quando o ânimo está baixo. Não é preciso afastar a tristeza.' },
        { id: 's02', tier: 3, pause: 1, text: 'Fique numa posição confortável. Deixe os olhos se fecharem, ou suavize o olhar.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspire devagar… e expire. Deixe cada respiração ser um pouco mais gentil que a anterior.' },
        { id: 's04', tier: 5, pause: 4, text: 'Repare onde o peso está no seu corpo. No peito, na garganta, nos ombros. Só repare, sem tentar consertar.' },
        { id: 's05', tier: 3, pause: 3, text: 'Agora imagine uma luz suave e quente logo acima de você. Escolha uma cor que acolha: dourada, rosada, um pêssego suave.' },
        { id: 's06', tier: 3, pause: 3, breath: true, text: 'Na próxima inspiração, deixe a luz descer devagar sobre a cabeça e o rosto, quente como o sol através de uma janela.' },
        { id: 's07', tier: 3, pause: 3, text: 'Deixe que ela chegue ao pescoço e aos ombros. Onde ela toca, tudo amolece, só um pouco.' },
        { id: 's08', tier: 5, pause: 4, text: 'Deixe a luz se reunir ao redor do coração. Imagine que ela segura a tristeza com delicadeza, como quem segura a mão de um amigo.' },
        { id: 's09', tier: 10, pause: 5, text: 'Se quiser, ofereça a si em silêncio algumas palavras gentis. Que eu tenha paciência comigo. Que eu tenha paz.' },
        { id: 's10', tier: 10, pause: 4, text: 'Deixe a luz descer pelos braços até as mãos, e por todo o corpo e as pernas, até os pés.' },
        { id: 's11', tier: 10, pause: 5, text: 'Você pode imaginar alguém que se importa com você, sentado por perto. Não é preciso conversar. Só sinta que tem alguém ali.' },
        { id: 's12', tier: 5, pause: 4, text: 'A tristeza talvez ainda esteja aqui, e tudo bem. Sentimentos mudam como o tempo. Você está abrindo um pouco de espaço ao redor dela.' },
        { id: 's13', tier: 3, pause: 4, breath: true, text: 'Descanse nesse calor por mais algumas respirações.' },
        { id: 's14', tier: 3, pause: 1, text: 'Deixe a luz se apagar devagar, guardando um pouco do calor com você. Quando quiser, abra os olhos.' },
      ],
    },

    'cooling-stream': {
      title: 'Riacho fresco',
      summary: 'Esfrie a raiva ou a frustração deixando os pensamentos irem embora num riacho.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. A raiva traz muito calor e energia. Esta prática ajuda a esfriar, para você escolher o que fazer em seguida.' },
        { id: 's02', tier: 3, pause: 1, text: 'Sente com os pés apoiados no chão. Feche os olhos, ou olhe para um ponto à sua frente.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspire pelo nariz… e expire devagar pela boca, como se estivesse esfriando uma bebida quente.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Mais uma vez. Inspire… e uma expiração longa e fresca. Sinta os pés pressionando o chão.' },
        { id: 's05', tier: 5, pause: 3, text: 'Repare onde está o calor no corpo. No rosto, no maxilar, nas mãos, no peito. Solte o que puder.' },
        { id: 's06', tier: 3, pause: 3, text: 'Agora imagine que você está na margem de um riacho limpo e fresco. A água passa por você sem parar.' },
        { id: 's07', tier: 3, pause: 3, text: 'Escute a água correndo. Sinta o ar fresco que vem dela.' },
        { id: 's08', tier: 3, pause: 5, text: 'Agora imagine folhas descendo pelo riacho. Cada vez que vier um pensamento de raiva, coloque-o numa folha, e veja-o ir embora.' },
        { id: 's09', tier: 10, pause: 5, text: 'Não é preciso empurrar os pensamentos. Só coloque-os na água e deixe a correnteza levar.' },
        { id: 's10', tier: 10, pause: 5, text: 'Se o mesmo pensamento voltar, tudo bem. Coloque-o em outra folha. O riacho nunca fica sem folhas.' },
        { id: 's11', tier: 10, pause: 4, text: 'Imagine mergulhar as mãos na água. Ela é fria e limpa. Sinta o frescor subir pelos braços e atravessar o peito.' },
        { id: 's12', tier: 3, pause: 4, breath: true, text: 'Repare no calor do corpo diminuindo, como uma fogueira que se acalma em brasas mornas.' },
        { id: 's13', tier: 5, pause: 3, text: 'O que você sente faz sentido. Agora, com a cabeça mais fresca, você pode decidir o que quer fazer, se quiser fazer algo.' },
        { id: 's14', tier: 3, pause: 1, text: 'Respire devagar e fresco mais uma vez. Sinta os pés no chão, e quando quiser, abra os olhos.' },
      ],
    },

    savoring: {
      title: 'Saborear',
      summary: 'Os momentos bons passam rápido. Saboreie este para que ele fique com você um pouco mais.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. Os momentos bons passam rápido. Esta prática ajuda você a saborear este, para que ele fique um pouco mais.' },
        { id: 's02', tier: 3, pause: 1, text: 'Fique numa posição confortável e feche os olhos, ou deixe o olhar descansar em algo agradável.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Inspire devagar… e expire. Deixe vir um pequeno sorriso, se ele quiser vir.' },
        { id: 's04', tier: 3, pause: 3, text: 'Traga à mente o que está fazendo você se sentir bem agora. Uma pessoa, um momento, algo que você fez.' },
        { id: 's05', tier: 3, pause: 3, text: 'Imagine a cena com o máximo de nitidez. Onde você estava? O que dava para ver ao redor?' },
        { id: 's06', tier: 5, pause: 3, text: 'O que dava para ouvir? Vozes, risadas, música, ou um silêncio gostoso?' },
        { id: 's07', tier: 10, pause: 3, text: 'Repare em cheiros, sabores ou texturas que fazem parte desse momento.' },
        { id: 's08', tier: 3, pause: 4, text: 'Agora repare onde essa sensação boa mora no seu corpo. Talvez um calor no peito, ou uma leveza nos ombros.' },
        { id: 's09', tier: 3, pause: 4, breath: true, text: 'A cada inspiração, imagine essa sensação crescendo um pouco, se espalhando, ocupando mais espaço em você.' },
        { id: 's10', tier: 10, pause: 4, text: 'Imagine que ela é uma cor, brilhando um pouco mais a cada respiração.' },
        { id: 's11', tier: 5, pause: 3, text: 'Tire uma foto mental deste momento, para voltar a ele num dia mais difícil.' },
        { id: 's12', tier: 10, pause: 4, text: 'Se quiser, pense em alguém com quem dividir isso, e imagine o rosto dessa pessoa enquanto você conta.' },
        { id: 's13', tier: 10, pause: 4, text: 'Agradeça em silêncio, a alguém, à vida ou a si, por este momento.' },
        { id: 's14', tier: 3, pause: 1, text: 'Respire mais uma vez, guardando a sensação boa. Quando quiser, abra os olhos, e leve-a com você.' },
      ],
    },

    'grounding-tree': {
      title: 'Árvore com raízes',
      summary: 'Aprofunde uma sensação de calma e firmeza, e aprenda um jeito simples de encontrá-la de novo.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. A calma já está aqui. Esta prática ajuda a aprofundar essa firmeza, e a lembrar dela.' },
        { id: 's02', tier: 3, pause: 1, text: 'Sente ou fique de pé com conforto, com os pés no chão. Feche os olhos se quiser.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspire devagar… e expire. Repare como a respiração vem fácil quando tudo está tranquilo.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imagine que você é uma árvore alta e forte. Seus pés são raízes, descendo pela terra fresca e escura.' },
        { id: 's05', tier: 5, pause: 4, breath: true, text: 'A cada expiração, deixe as raízes irem um pouco mais fundo, se espalhando, sustentando você com firmeza.' },
        { id: 's06', tier: 3, pause: 3, text: 'Sinta o tronco, reto e firme. Este é o seu centro. Nada precisa movê-lo.' },
        { id: 's07', tier: 5, pause: 3, text: 'Acima de você, os galhos sobem em direção ao céu. As folhas se mexem de leve numa brisa suave.' },
        { id: 's08', tier: 10, pause: 4, text: 'Repare na luz do sol passando entre as folhas, aquecendo-as.' },
        { id: 's09', tier: 10, pause: 5, text: 'Mesmo num vento forte, os galhos de uma árvore balançam, mas as raízes ficam onde estão. Sua calma é assim.' },
        { id: 's10', tier: 10, pause: 4, breath: true, text: 'A cada inspiração, puxe energia das raízes, subindo até a ponta dos galhos.' },
        { id: 's11', tier: 3, pause: 5, breath: true, text: 'Descanse aqui, com raízes na calma, por algumas respirações.' },
        { id: 's12', tier: 5, pause: 3, text: 'Quando a vida ficar agitada, você pode reencontrar essa sensação reparando nos pés no chão e respirando devagar uma vez.' },
        { id: 's13', tier: 3, pause: 1, text: 'Respire mais uma vez. Sinta os pés, e quando quiser, abra os olhos.' },
      ],
    },

    'clear-sky': {
      title: 'Céu limpo',
      summary: 'Quando a mente fica cheia ou é pega de surpresa, observe os pensamentos passarem como nuvens.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Boas-vindas. Quando acontece muita coisa, a mente fica cheia. Esta prática ajuda a abrir um pouco de espaço.' },
        { id: 's02', tier: 3, pause: 1, text: 'Fique numa posição confortável. Feche os olhos, ou deixe o olhar suave.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspire devagar… e expire. Deixe a respiração encontrar o próprio ritmo.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imagine um céu amplo e aberto. Pode ter a cor que você quiser: azul limpo, um amanhecer suave, ou uma noite cheia de estrelas.' },
        { id: 's05', tier: 3, pause: 4, text: 'Agora pense nos seus pensamentos como nuvens passando por esse céu. Umas grandes, outras pequenas, umas rápidas, outras lentas.' },
        { id: 's06', tier: 3, pause: 4, text: 'Não é preciso persegui-las nem afastá-las. Só observe-as passar.' },
        { id: 's07', tier: 5, pause: 4, text: 'Se perceber que seguiu uma nuvem, é normal. Volte com gentileza a observar o céu.' },
        { id: 's08', tier: 10, pause: 5, text: 'Experimente dar um nome de uma palavra a cada nuvem que passa. Planos. Preocupação. Lembrança. E deixe ir.' },
        { id: 's09', tier: 10, pause: 5, text: 'Repare nos espaços entre as nuvens. Céu limpo e aberto. Esse espaço está sempre lá, mesmo num dia nublado.' },
        { id: 's10', tier: 5, pause: 4, text: 'Você é o céu, não as nuvens. Os pensamentos vêm e vão, e o céu continua amplo e aberto.' },
        { id: 's11', tier: 10, pause: 4, breath: true, text: 'Sinta essa abertura no corpo também. O peito se abrindo, os ombros soltos.' },
        { id: 's12', tier: 3, pause: 5, breath: true, text: 'Descanse como o céu aberto por algumas respirações.' },
        { id: 's13', tier: 3, pause: 1, text: 'Quando quiser, respire mais fundo, e abra os olhos devagar.' },
      ],
    },
  },
};
