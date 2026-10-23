import type { PracticeContent } from './types';

/**
 * French scripts, addressing the listener as "vous" and avoiding words that change with their gender.
 * Machine-drafted: have a native speaker review before release.
 */
export const fr: PracticeContent = {
  lessons: [
    {
      title: 'Qu’est-ce que la visualisation ?',
      body: [
        'Visualiser, c’est créer une expérience dans votre esprit avec vos sens : ce que vous verriez, entendriez, sentiriez au toucher, à l’odorat et au goût.',
        'Les sportifs l’utilisent pour se préparer, et elle fait partie de nombreuses pratiques de méditation et de relaxation. Imaginer un lieu calme peut détendre le corps, un peu comme si vous y étiez vraiment.',
      ],
    },
    {
      title: 'Et si je ne vois pas d’images ?',
      body: [
        'C’est très courant. Certaines personnes voient des images nettes, d’autres de brefs éclats, et d’autres aucune image.',
        'Vous pouvez quand même visualiser en imaginant des sons et des textures, ou simplement en sachant ce qui est là. Il n’y a pas de mauvaise façon de faire.',
      ],
    },
    {
      title: 'Comment commencer',
      body: [
        'Trouvez un endroit calme où personne ne vous dérangera pendant quelques minutes. Asseyez-vous ou allongez-vous confortablement. Un casque aide.',
        'Fermer les yeux aide beaucoup de gens, mais vous pouvez aussi les garder ouverts, le regard posé doucement sur un point. Commencez par 3 minutes.',
      ],
    },
    {
      title: 'Quand l’esprit vagabonde',
      body: [
        'Cela arrivera, et cela fait partie de la pratique. Quand vous remarquez que vous pensez à autre chose, revenez doucement à la voix ou à votre respiration.',
        'Chaque retour renforce cette capacité.',
      ],
    },
    {
      title: 'Est-ce grave de s’endormir ?',
      body: [
        'Non. Avec la fatigue, une séance calme peut mener au sommeil, et c’est très bien, surtout le soir.',
        'Pour éviter de vous endormir, asseyez-vous bien droit et essayez une séance plus courte plus tôt dans la journée.',
      ],
    },
    {
      title: 'À quelle fréquence pratiquer ?',
      body: [
        'Quelques minutes la plupart des jours aident plus qu’une longue séance de temps en temps.',
        'Beaucoup aiment une courte séance le matin ou avant de dormir. Trouvez un moment qui s’intègre à votre journée.',
      ],
    },
    {
      title: 'Et si des émotions fortes surgissent ?',
      body: [
        'Cela peut arriver, et c’est normal. Vous pouvez faire une pause, ouvrir les yeux ou passer à un lieu plus calme.',
        'Si les émotions restent lourdes, en parler à une personne de confiance ou à un professionnel peut aider.',
      ],
    },
    {
      title: 'Pratiquer en sécurité',
      body: [
        'Ne pratiquez pas en conduisant, ni pendant une activité qui demande votre attention.',
        'Si une image ou un souvenir vous bouleverse, ouvrez les yeux, regardez autour de vous et nommez quelques objets que vous voyez. Vous pouvez arrêter à tout moment.',
        'Ces pratiques soutiennent votre bien-être, mais ce ne sont pas des soins. Si vous allez mal, n’hésitez pas à demander de l’aide.',
      ],
    },
  ],

  practices: {
    'first-visualization': {
      title: 'Votre première visualisation',
      summary: 'Un premier essai court et simple, pour découvrir comment l’imagination crée de vraies sensations.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. Voici une courte première pratique, et il n’y a rien à réussir. Visualiser, c’est simplement imaginer avec vos sens, comme quand vous vous souvenez de quelque chose.' },
        { id: 's02', tier: 3, pause: 2, breath: true, text: 'Installez-vous confortablement. Si cela vous convient, fermez les yeux, ou posez doucement le regard sur le sol devant vous.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Inspirez lentement par le nez… et laissez l’air sortir par la bouche.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imaginez maintenant un citron dans votre main. Remarquez son jaune éclatant, et les petits creux de sa peau.' },
        { id: 's05', tier: 3, pause: 3, text: 'Sentez son poids. Est-il frais ? Lisse ? Pressez-le doucement.' },
        { id: 's06', tier: 3, pause: 3, text: 'Imaginez maintenant que vous le coupez en deux. Le jus coule sur vos doigts, et une odeur vive et fraîche s’élève.' },
        { id: 's07', tier: 3, pause: 3, text: 'Approchez une moitié de votre bouche, et imaginez que vous en croquez un petit morceau.' },
        { id: 's08', tier: 3, pause: 2, text: 'Peut-être avez-vous un peu salivé, ou presque senti son odeur. C’est cela, la visualisation. Votre esprit peut créer de vraies sensations par l’imagination.' },
        { id: 's09', tier: 3, pause: 2, text: 'Et si vous n’avez pas vu d’image nette, c’est tout à fait normal. Beaucoup de gens imaginent par la sensation, le son, ou simplement en sachant. Tout cela compte.' },
        { id: 's10', tier: 3, pause: 1, text: 'Laissez le citron s’effacer. Prenez encore une respiration lente. Quand vous voulez, ouvrez les yeux. Bravo.' },
      ],
    },

    'safe-place': {
      title: 'Lieu sûr',
      summary: 'Construisez dans votre esprit un lieu calme et sûr, où revenir chaque fois que l’anxiété monte.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. Cette pratique vous aide à construire un lieu calme et sûr dans votre esprit, un endroit où revenir chaque fois que l’anxiété monte.' },
        { id: 's02', tier: 3, pause: 1, text: 'Installez-vous confortablement, et fermez les yeux si cela vous convient. Vous pouvez les ouvrir à tout moment.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspirez lentement… et expirez, un peu plus longtemps que l’inspiration.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Encore une fois. Inspirez… et une longue expiration, lente. Laissez vos épaules descendre un peu.' },
        { id: 's05', tier: 3, pause: 3, text: 'Imaginez maintenant un lieu où vous vous sentez en sécurité et à l’aise. Il peut être réel, comme une plage ou une pièce que vous aimez, ou entièrement inventé.' },
        { id: 's06', tier: 3, pause: 3, text: 'Regardez autour de vous. Quelles couleurs voyez-vous ? Remarquez la lumière. Est-ce le matin, ou la fin d’après-midi ?' },
        { id: 's07', tier: 5, pause: 3, text: 'Écoutez. Peut-être des vagues, des chants d’oiseaux, la pluie sur une vitre, ou simplement le silence.' },
        { id: 's08', tier: 10, pause: 3, text: 'Remarquez ce qui vous porte. Du sable, de l’herbe, un fauteuil moelleux. Sentez comme il vous soutient.' },
        { id: 's09', tier: 3, pause: 3, text: 'Inspirez, et remarquez l’air ici. Est-il chaud, ou frais ? Porte-t-il un parfum ?' },
        { id: 's10', tier: 10, pause: 4, text: 'Rien ici ne peut vous faire de mal. Ce lieu est à vous, et seul ce que vous invitez peut y entrer.' },
        { id: 's11', tier: 10, pause: 4, text: 'Si une inquiétude arrive, remarquez-la, et laissez-la repartir, comme un nuage qui passe au-delà de ce lieu.' },
        { id: 's12', tier: 5, pause: 4, breath: true, text: 'Laissez votre corps ressentir cette sécurité. Votre respiration ralentit. Votre mâchoire se détend.' },
        { id: 's13', tier: 10, pause: 4, text: 'Choisissez un petit détail à retenir : une couleur, un son, une texture. Ce sera votre chemin pour revenir ici.' },
        { id: 's14', tier: 3, pause: 2, text: 'Vous pouvez revenir dans ce lieu quand vous en avez besoin, même les yeux ouverts, simplement en vous en souvenant.' },
        { id: 's15', tier: 3, pause: 1, text: 'Prenez encore une respiration lente. Bougez doucement les doigts et les orteils, et quand vous voulez, ouvrez les yeux.' },
      ],
    },

    'warm-light': {
      title: 'Lumière chaude',
      summary: 'Une façon douce de vous tenir compagnie quand le moral est bas, sans repousser la tristesse.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. Cette pratique est une façon douce de vous tenir compagnie quand le moral est bas. Inutile de repousser la tristesse.' },
        { id: 's02', tier: 3, pause: 1, text: 'Installez-vous dans une position confortable. Laissez vos yeux se fermer, ou adoucissez votre regard.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspirez lentement… et expirez. Que chaque respiration soit un peu plus bienveillante que la précédente.' },
        { id: 's04', tier: 5, pause: 4, text: 'Remarquez où se loge la lourdeur dans votre corps. La poitrine, la gorge, les épaules. Remarquez-la simplement, sans chercher à la réparer.' },
        { id: 's05', tier: 3, pause: 3, text: 'Imaginez maintenant une lumière douce et chaude juste au-dessus de vous. Choisissez une couleur réconfortante : dorée, rosée, pêche.' },
        { id: 's06', tier: 3, pause: 3, breath: true, text: 'À la prochaine inspiration, laissez la lumière couler lentement sur votre tête et votre visage, chaude comme le soleil à travers une fenêtre.' },
        { id: 's07', tier: 3, pause: 3, text: 'Laissez-la atteindre votre cou et vos épaules. Partout où elle touche, tout s’adoucit, un tout petit peu.' },
        { id: 's08', tier: 5, pause: 4, text: 'Laissez la lumière se rassembler autour de votre cœur. Imaginez qu’elle tient la tristesse avec douceur, comme on tient la main d’un ami.' },
        { id: 's09', tier: 10, pause: 5, text: 'Si vous le souhaitez, offrez-vous en silence quelques mots bienveillants. Que je prenne soin de moi. Que je sois en paix.' },
        { id: 's10', tier: 10, pause: 4, text: 'Laissez la lumière descendre dans vos bras jusqu’à vos mains, puis dans tout votre corps et vos jambes, jusqu’aux pieds.' },
        { id: 's11', tier: 10, pause: 5, text: 'Vous pouvez imaginer une personne qui tient à vous, assise tout près. Pas besoin de parler. Sentez simplement que quelqu’un est là, avec vous.' },
        { id: 's12', tier: 5, pause: 4, text: 'La tristesse est peut-être encore là, et c’est normal. Les émotions changent comme la météo. Vous lui faites un peu de place.' },
        { id: 's13', tier: 3, pause: 4, breath: true, text: 'Reposez-vous dans cette chaleur encore quelques respirations.' },
        { id: 's14', tier: 3, pause: 1, text: 'Laissez la lumière s’estomper doucement, en gardant un peu de sa chaleur. Quand vous voulez, ouvrez les yeux.' },
      ],
    },

    'cooling-stream': {
      title: 'Ruisseau rafraîchissant',
      summary: 'Apaisez la colère ou la frustration en laissant vos pensées partir au fil d’un ruisseau.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. La colère apporte beaucoup de chaleur et d’énergie. Cette pratique vous aide à la rafraîchir, pour choisir ensuite ce que vous voulez faire.' },
        { id: 's02', tier: 3, pause: 1, text: 'Asseyez-vous, les pieds à plat sur le sol. Fermez les yeux, ou regardez un point devant vous.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspirez par le nez… et expirez lentement par la bouche, comme pour refroidir une boisson chaude.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Encore une fois. Inspirez… et une longue expiration fraîche. Sentez vos pieds appuyer sur le sol.' },
        { id: 's05', tier: 5, pause: 3, text: 'Remarquez où se trouve la chaleur dans votre corps. Le visage, la mâchoire, les mains, la poitrine. Relâchez ce que vous pouvez.' },
        { id: 's06', tier: 3, pause: 3, text: 'Imaginez maintenant que vous êtes au bord d’un ruisseau clair et frais. L’eau passe devant vous, régulière.' },
        { id: 's07', tier: 3, pause: 3, text: 'Écoutez-la couler. Sentez l’air frais qui monte de l’eau.' },
        { id: 's08', tier: 3, pause: 5, text: 'Voyez maintenant des feuilles qui flottent sur le ruisseau. Chaque fois qu’une pensée de colère vient, posez-la sur une feuille, et regardez-la s’éloigner.' },
        { id: 's09', tier: 10, pause: 5, text: 'Inutile de pousser les pensées. Posez-les simplement sur l’eau, et laissez le courant les emporter.' },
        { id: 's10', tier: 10, pause: 5, text: 'Si la même pensée revient, ce n’est pas grave. Posez-la sur une autre feuille. Le ruisseau ne manque jamais de feuilles.' },
        { id: 's11', tier: 10, pause: 4, text: 'Imaginez que vous plongez les mains dans l’eau. Elle est froide et pure. Sentez la fraîcheur remonter le long de vos bras et traverser votre poitrine.' },
        { id: 's12', tier: 3, pause: 4, breath: true, text: 'Remarquez la chaleur de votre corps qui s’adoucit, comme un feu qui se calme en braises tièdes.' },
        { id: 's13', tier: 5, pause: 3, text: 'Ce que vous ressentez a du sens. Maintenant, l’esprit plus frais, vous pouvez décider ce que vous voulez en faire, ou non.' },
        { id: 's14', tier: 3, pause: 1, text: 'Prenez encore une respiration lente et fraîche. Sentez vos pieds sur le sol, et quand vous voulez, ouvrez les yeux.' },
      ],
    },

    savoring: {
      title: 'Savourer',
      summary: 'Les bons moments passent vite. Savourez celui-ci pour qu’il reste avec vous un peu plus longtemps.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. Les bons moments passent vite. Cette pratique vous aide à savourer celui-ci, pour qu’il reste avec vous un peu plus longtemps.' },
        { id: 's02', tier: 3, pause: 1, text: 'Installez-vous confortablement et fermez les yeux, ou laissez votre regard se poser sur quelque chose d’agréable.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Inspirez lentement… et expirez. Laissez venir un petit sourire, s’il en a envie.' },
        { id: 's04', tier: 3, pause: 3, text: 'Pensez à ce qui vous fait du bien en ce moment. Une personne, un moment, quelque chose que vous avez fait.' },
        { id: 's05', tier: 3, pause: 3, text: 'Représentez-vous la scène aussi nettement que possible. Où étiez-vous ? Que voyiez-vous autour de vous ?' },
        { id: 's06', tier: 5, pause: 3, text: 'Qu’entendiez-vous ? Des voix, des rires, de la musique, ou un silence agréable ?' },
        { id: 's07', tier: 10, pause: 3, text: 'Remarquez les odeurs, les goûts ou les textures de ce moment.' },
        { id: 's08', tier: 3, pause: 4, text: 'Remarquez maintenant où ce bien-être se loge dans votre corps. Peut-être une chaleur dans la poitrine, ou une légèreté dans les épaules.' },
        { id: 's09', tier: 3, pause: 4, breath: true, text: 'À chaque inspiration, imaginez cette sensation qui grandit un peu, qui s’étend, qui vous remplit davantage.' },
        { id: 's10', tier: 10, pause: 4, text: 'Imaginez-la comme une couleur, qui brille un peu plus à chaque respiration.' },
        { id: 's11', tier: 5, pause: 3, text: 'Prenez une photo mentale de ce moment, pour y revenir un jour plus difficile.' },
        { id: 's12', tier: 10, pause: 4, text: 'Si vous voulez, pensez à quelqu’un avec qui partager cela, et imaginez son visage pendant que vous le lui racontez.' },
        { id: 's13', tier: 10, pause: 4, text: 'Dites merci en silence, à quelqu’un, à la vie ou à vous-même, pour ce moment.' },
        { id: 's14', tier: 3, pause: 1, text: 'Prenez encore une respiration, en gardant ce bien-être. Quand vous voulez, ouvrez les yeux, et emportez-le avec vous.' },
      ],
    },

    'grounding-tree': {
      title: 'Arbre enraciné',
      summary: 'Approfondissez un sentiment de calme et de stabilité, et apprenez un moyen simple de le retrouver.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. Le calme est déjà là. Cette pratique vous aide à approfondir cette stabilité, et à vous en souvenir.' },
        { id: 's02', tier: 3, pause: 1, text: 'Asseyez-vous ou tenez-vous debout confortablement, les pieds au sol. Fermez les yeux si vous voulez.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspirez lentement… et expirez. Remarquez comme la respiration vient facilement quand tout va bien.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imaginez que vous êtes un arbre grand et fort. Vos pieds sont des racines qui plongent dans une terre fraîche et sombre.' },
        { id: 's05', tier: 5, pause: 4, breath: true, text: 'À chaque expiration, laissez vos racines s’enfoncer un peu plus, s’étendre largement, et vous tenir stable.' },
        { id: 's06', tier: 3, pause: 3, text: 'Sentez votre tronc, droit et solide. C’est votre centre. Rien n’a besoin de le déplacer.' },
        { id: 's07', tier: 5, pause: 3, text: 'Au-dessus de vous, vos branches montent vers le ciel. Les feuilles bougent doucement dans une brise légère.' },
        { id: 's08', tier: 10, pause: 4, text: 'Remarquez la lumière du soleil qui filtre à travers vos feuilles et les réchauffe.' },
        { id: 's09', tier: 10, pause: 5, text: 'Même par grand vent, les branches d’un arbre se balancent, mais ses racines restent en place. Votre calme est ainsi.' },
        { id: 's10', tier: 10, pause: 4, breath: true, text: 'À chaque inspiration, faites monter l’énergie depuis vos racines, jusqu’au bout de vos branches.' },
        { id: 's11', tier: 3, pause: 5, breath: true, text: 'Restez ici, les racines dans le calme, quelques respirations.' },
        { id: 's12', tier: 5, pause: 3, text: 'Quand la vie s’agite, vous pouvez retrouver cette sensation en remarquant vos pieds au sol et en prenant une respiration lente.' },
        { id: 's13', tier: 3, pause: 1, text: 'Prenez encore une respiration. Sentez vos pieds, et quand vous voulez, ouvrez les yeux.' },
      ],
    },

    'clear-sky': {
      title: 'Ciel dégagé',
      summary: 'Quand l’esprit est encombré ou pris au dépourvu, regardez vos pensées passer comme des nuages.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Bienvenue. Quand il se passe beaucoup de choses, l’esprit s’encombre. Cette pratique vous aide à faire un peu de place.' },
        { id: 's02', tier: 3, pause: 1, text: 'Installez-vous confortablement. Fermez les yeux, ou posez doucement votre regard.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Inspirez lentement… et expirez. Laissez la respiration trouver son propre rythme.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imaginez un ciel vaste et ouvert. Il peut avoir la couleur que vous voulez : bleu clair, une aube douce, ou une nuit pleine d’étoiles.' },
        { id: 's05', tier: 3, pause: 4, text: 'Voyez maintenant vos pensées comme des nuages qui traversent ce ciel. Certaines grandes, d’autres petites, certaines rapides, d’autres lentes.' },
        { id: 's06', tier: 3, pause: 4, text: 'Inutile de les poursuivre ou de les chasser. Regardez-les simplement passer.' },
        { id: 's07', tier: 5, pause: 4, text: 'Si vous remarquez que vous avez suivi un nuage, c’est normal. Revenez doucement à l’observation du ciel.' },
        { id: 's08', tier: 10, pause: 5, text: 'Essayez de nommer chaque nuage d’un seul mot quand il passe. Projet. Inquiétude. Souvenir. Puis laissez-le partir.' },
        { id: 's09', tier: 10, pause: 5, text: 'Remarquez les espaces entre les nuages. Du ciel clair et ouvert. Cet espace est toujours là, même un jour nuageux.' },
        { id: 's10', tier: 5, pause: 4, text: 'Vous êtes le ciel, pas les nuages. Les pensées vont et viennent, et le ciel reste vaste et ouvert.' },
        { id: 's11', tier: 10, pause: 4, breath: true, text: 'Sentez aussi cette ouverture dans votre corps. La poitrine qui s’ouvre, les épaules détendues.' },
        { id: 's12', tier: 3, pause: 5, breath: true, text: 'Reposez-vous comme le ciel ouvert, quelques respirations.' },
        { id: 's13', tier: 3, pause: 1, text: 'Quand vous voulez, prenez une respiration plus profonde, et ouvrez lentement les yeux.' },
      ],
    },
  },
};
