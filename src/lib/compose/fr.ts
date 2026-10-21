import type { ComposeContent } from './types';

/** "le jardin de ma grand-mère" → "le jardin de votre grand-mère". */
function toYou(phrase: string): string {
  const swaps: Record<string, string> = { mon: 'votre', ma: 'votre', mes: 'vos', moi: 'vous' };
  return phrase.replace(/(?<![\p{L}])(mon|ma|mes|moi)(?![\p{L}])/giu, (w) => swaps[w.toLowerCase()]);
}

// "emmène-moi sur une plage", "je veux être dans la forêt", "j'aimerais aller au jardin de ma grand-mère"
const PLACE_CUE =
  /(?:emm[eè]ne[- ]moi|emmenez[- ]moi|am[eè]ne[- ]moi|transporte[- ]moi|imagine[- ]moi|je (?:veux|voudrais) (?:[eê]tre|aller|partir|retourner)|j['’]aimerais (?:[eê]tre|aller|partir|retourner)|visualiser)\s+(au|aux|à|a|dans|sur|en|vers|près de|au bord de)\s+([^.,!?;\n]{3,60})/i;
// A place said without "le", "une", "mon"… ("en montagne") doesn't read well inside a sentence.
const DETERMINER = /^(?:le|la|les|l['’]|un|une|des|votre|vos|ce|cet|cette|ces)(?:\s|(?<=['’]))/i;
const PARTITIVE: Record<string, string> = {
  joie: 'de la joie', calme: 'du calme', tristesse: 'de la tristesse', colère: 'de la colère',
  anxiété: 'de l’anxiété', surprise: 'de la surprise', dégoût: 'du dégoût',
};

/**
 * French building blocks, addressing the listener as "vous" and avoiding words that change with their gender.
 * {place} is always a whole noun phrase with its article ("une plage tranquille"), and {topic} only follows
 * words that don't merge with "le" ("sur", "pour", "concernant"), so every combination stays grammatical.
 * Machine-drafted: have a native speaker review it.
 */
export const fr: ComposeContent = {
  mirror: (feeling, topic) =>
    feeling
      ? `Vous m’avez dit ressentir ${PARTITIVE[feeling.noun] ?? feeling.noun}${topic ? ` concernant ${topic}` : ''}. C’est compréhensible. Pendant les prochaines minutes, prenons-en soin ensemble.`
      : 'Merci de prendre ce temps pour vous. Pendant les prochaines minutes, vous n’avez rien d’autre à faire.',
  arrival: [
    { tier: 3, pause: 1, text: 'Installez-vous confortablement, et fermez les yeux si cela vous convient. Vous pouvez les ouvrir à tout moment.' },
    { tier: 3, pause: 3, breath: true, text: 'Inspirez lentement… et expirez, un peu plus longtemps que l’inspiration.' },
    { tier: 5, pause: 3, breath: true, text: 'Encore une fois. Inspirez… et une longue expiration, tranquille. Laissez vos épaules se relâcher.' },
  ],
  closing: [
    { tier: 5, pause: 3, text: 'Regardez une dernière fois autour de vous. Vous pouvez revenir ici quand vous en avez besoin, simplement en vous en souvenant.' },
    { tier: 3, pause: 1, text: 'Prenez une respiration plus profonde. Sentez votre corps là où vous êtes, bougez les doigts, et quand vous voulez, ouvrez les yeux.' },
  ],
  anyPlace: [
    { tier: 3, pause: 3, text: 'Laissez maintenant apparaître autour de vous {place}, lentement, comme cela vient. Une image, une sensation, ou simplement savoir que vous y êtes.' },
    { tier: 3, pause: 3, text: 'Regardez autour de vous. Remarquez les couleurs, et la lumière. Que voyez-vous en premier ?' },
    { tier: 5, pause: 3, text: 'Écoutez. Quels sons appartiennent à ce lieu ? Tout près, et au loin.' },
    { tier: 3, pause: 3, text: 'Remarquez ce qui vous porte, et l’air sur votre peau.' },
    { tier: 10, pause: 3, text: 'Y a-t-il un parfum ici ? Respirez-le, lentement.' },
    { tier: 5, pause: 4, breath: true, text: 'Laissez-vous vous poser ici. Vous êtes en sécurité, et il n’y a nulle part ailleurs où aller.' },
  ],
  findPlace: (text) => {
    const match = PLACE_CUE.exec(text);
    if (!match) return null;
    const article = { au: 'le ', aux: 'les ' }[match[1].toLowerCase()] ?? '';
    // Stop at the start of another thought: "une plage et oublier mon examen" → "une plage".
    const raw = match[2].split(/\s+(?:et|mais|car|parce que|pour|où|afin de)\s+/i)[0].trim();
    const place = toYou(article + raw);
    return raw.length >= 3 && DETERMINER.test(place) ? { raw, place } : null;
  },
  title: (place) => place.charAt(0).toUpperCase() + place.slice(1),
  subtitle: (goal, topic) => (topic ? `${goal} · ${topic}` : goal),
  defaultTopic: 'ce qui vous préoccupe',

  scenes: {
    beach: {
      name: 'Plage',
      title: 'Plage tranquille',
      place: 'une plage tranquille',
      carrier: 'une vague',
      keywords: ['plage', 'plages', 'mer', 'ocean', 'vague', 'vagues', 'cote', 'rivage', 'bord de mer'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. Le sable est chaud, et la mer s’étend devant vous.' },
        { tier: 3, pause: 3, text: 'Regardez l’eau. Remarquez ses couleurs, et la lumière qui brille à la surface.' },
        { tier: 5, pause: 3, text: 'Écoutez les vagues. Chacune arrive… et se retire lentement.' },
        { tier: 3, pause: 3, text: 'Sentez le sable chaud sous vous, et une brise douce qui vient de l’eau.' },
        { tier: 10, pause: 3, text: 'Respirez l’air frais et salé.' },
        { tier: 5, pause: 4, breath: true, text: 'Laissez votre respiration suivre les vagues. Inspirez quand elles arrivent… expirez quand elles repartent.' },
      ],
    },
    forest: {
      name: 'Forêt',
      title: 'Forêt paisible',
      place: 'une forêt paisible',
      carrier: 'la brise',
      keywords: ['foret', 'forets', 'bois', 'arbres', 'jungle'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. De grands arbres s’élèvent, et le chemin est doux sous vos pas.' },
        { tier: 3, pause: 3, text: 'Levez les yeux. La lumière du soleil filtre à travers les feuilles en petites taches mouvantes.' },
        { tier: 5, pause: 3, text: 'Écoutez. Des oiseaux qui s’appellent, des feuilles qui bruissent, peut-être de l’eau quelque part.' },
        { tier: 3, pause: 3, text: 'Posez la main sur un tronc. Sentez comme il est stable, et ancien.' },
        { tier: 10, pause: 3, text: 'Respirez l’odeur de la terre, des feuilles vertes et de l’air frais.' },
        { tier: 5, pause: 4, breath: true, text: 'Laissez le calme des arbres entrer en vous, une respiration après l’autre.' },
      ],
    },
    mountain: {
      name: 'Montagne',
      title: 'Vue sur les montagnes',
      place: 'un sommet de montagne',
      carrier: 'le vent',
      keywords: ['montagne', 'montagnes', 'colline', 'collines', 'sommet', 'vallee', 'himalaya'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. L’air est frais et limpide, et vous voyez à des kilomètres.' },
        { tier: 3, pause: 3, text: 'Regardez les vallées et les sommets au loin. Remarquez comme tout est grand et ouvert.' },
        { tier: 5, pause: 3, text: 'Écoutez le silence, là-haut. Peut-être un peu de vent, peut-être un oiseau tout en bas.' },
        { tier: 3, pause: 3, text: 'Sentez la roche solide sous vous. Elle est là depuis des milliers d’années.' },
        { tier: 10, pause: 3, text: 'Respirez l’air froid et pur de la montagne. Sentez-le remplir votre poitrine.' },
        { tier: 5, pause: 4, breath: true, text: 'D’ici, vos soucis paraissent plus petits. Laissez-vous ressentir tout cet espace.' },
      ],
    },
    garden: {
      name: 'Jardin',
      title: 'Jardin ensoleillé',
      place: 'un jardin ensoleillé',
      carrier: 'un papillon',
      keywords: ['jardin', 'jardins', 'fleurs', 'parc', 'prairie', 'champ'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. Il y a des fleurs partout, et le soleil est doux et chaud.' },
        { tier: 3, pause: 3, text: 'Regardez les couleurs autour de vous. Des pétales vifs, des feuilles vertes, un ciel clair.' },
        { tier: 5, pause: 3, text: 'Écoutez. Des abeilles qui bourdonnent, des oiseaux qui chantent, des feuilles qui bougent doucement.' },
        { tier: 3, pause: 3, text: 'Sentez l’herbe douce sous vous, et le soleil sur votre visage.' },
        { tier: 10, pause: 3, text: 'Respirez le parfum sucré des fleurs.' },
        { tier: 5, pause: 4, breath: true, text: 'Laissez la chaleur de ce lieu vous pénétrer jusqu’au plus profond.' },
      ],
    },
    river: {
      name: 'Rivière',
      title: 'Rivière tranquille',
      place: 'une rivière tranquille',
      carrier: 'une feuille sur l’eau',
      keywords: ['riviere', 'fleuve', 'ruisseau', 'lac', 'cascade', 'gange'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout près de vous, {place}. Une eau claire passe devant vous, régulière.' },
        { tier: 3, pause: 3, text: 'Regardez l’eau. Voyez comme la lumière danse dessus pendant qu’elle avance.' },
        { tier: 5, pause: 3, text: 'Écoutez-la couler, un son doux et régulier qui ne s’arrête jamais.' },
        { tier: 3, pause: 3, text: 'Sentez l’air frais qui monte de l’eau, et les galets lisses à côté de vous.' },
        { tier: 10, pause: 3, text: 'Respirez l’odeur fraîche et pure de l’eau.' },
        { tier: 5, pause: 4, breath: true, text: 'Laissez votre respiration couler comme la rivière. Facile, sans hâte.' },
      ],
    },
    rain: {
      name: 'Pluie',
      title: 'Pluie douillette',
      place: 'une pièce douillette pendant qu’il pleut dehors',
      carrier: 'la pluie',
      keywords: ['pluie', 'pleut', 'pluvieux', 'orage', 'mousson', 'bruine'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. Vous êtes au chaud et au sec, sous une couverture douce.' },
        { tier: 3, pause: 3, text: 'Regardez par la fenêtre. Les gouttes glissent sur la vitre, et dehors tout est frais et vert.' },
        { tier: 5, pause: 3, text: 'Écoutez la pluie. Elle tambourine sur le toit, douce et régulière.' },
        { tier: 3, pause: 3, text: 'Sentez la chaleur autour de vous. Peut-être une couverture, ou une tasse chaude entre vos mains.' },
        { tier: 10, pause: 3, text: 'Respirez l’odeur de la pluie sur la terre.' },
        { tier: 5, pause: 4, breath: true, text: 'Vous n’avez nulle part où aller. Laissez la pluie tout ralentir.' },
      ],
    },
    stars: {
      name: 'Ciel étoilé',
      title: 'Nuit étoilée',
      place: 'un endroit paisible sous les étoiles',
      carrier: 'une étoile filante',
      keywords: ['etoiles', 'etoile', 'nuit', 'lune', 'clair de lune', 'galaxie'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. La nuit est calme, et l’air est frais.' },
        { tier: 3, pause: 3, text: 'Levez les yeux. Des milliers d’étoiles, et une lune douce qui brille au-dessus de vous.' },
        { tier: 5, pause: 3, text: 'Écoutez le silence de la nuit. Peut-être des grillons, peut-être une brise légère.' },
        { tier: 3, pause: 3, text: 'Sentez le sol qui vous porte. Vous n’avez pas besoin de vous tenir.' },
        { tier: 10, pause: 3, text: 'Respirez l’air frais de la nuit.' },
        { tier: 5, pause: 4, breath: true, text: 'Sous ce ciel immense et silencieux, laissez venir la sécurité et la paix.' },
      ],
    },
    home: {
      name: 'Pièce rassurante',
      title: 'Pièce rassurante',
      place: 'une pièce chaleureuse et sûre',
      carrier: 'une brise venue de la fenêtre ouverte',
      keywords: ['maison', 'chambre', 'lit', 'chez moi', 'foyer'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. Tout ici est familier et bienveillant.' },
        { tier: 3, pause: 3, text: 'Regardez autour de vous. Une lumière douce, vos objets préférés, des couleurs que vous aimez.' },
        { tier: 5, pause: 3, text: 'Écoutez. Des sons familiers et réconfortants, ou un silence paisible.' },
        { tier: 3, pause: 3, text: 'Sentez quelque chose de doux sous vous, qui vous porte entièrement.' },
        { tier: 10, pause: 3, text: 'Respirez une odeur réconfortante. Un plat qui mijote, des draps propres, ou du thé.' },
        { tier: 5, pause: 4, breath: true, text: 'Ici, vous êtes en sécurité. Vous pouvez vous reposer.' },
      ],
    },
    sky: {
      name: 'Ciel ouvert',
      title: 'Ciel ouvert',
      place: 'un ciel vaste et ouvert',
      carrier: 'un nuage',
      keywords: ['ciel', 'nuages', 'nuage', 'voler', 'flotter', 'oiseau'],
      lines: [
        { tier: 3, pause: 3, text: 'Imaginez maintenant, tout autour de vous, {place}. Vous flottez doucement, et l’air vous porte entièrement.' },
        { tier: 3, pause: 3, text: 'Regardez autour de vous. Des nuages blancs et doux, et du bleu dans toutes les directions.' },
        { tier: 5, pause: 3, text: 'Écoutez le silence. Seulement le léger bruit de l’air qui passe.' },
        { tier: 3, pause: 3, text: 'Sentez comme votre corps est léger, comme si l’air lui-même vous tenait.' },
        { tier: 10, pause: 3, text: 'Respirez l’air pur et frais, bien au-dessus de tout.' },
        { tier: 5, pause: 4, breath: true, text: 'Laissez-vous flotter. Il y a tant d’espace ici.' },
      ],
    },
  },

  goals: {
    calm: {
      name: 'Me calmer',
      keywords: ['calme', 'calmer', 'detendre', 'detente', 'relax', 'paix', 'serenite', 'apaiser', 'stress'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'À chaque expiration, laissez votre corps devenir un peu plus lourd, et un peu plus souple.' },
        { tier: 3, pause: 4, text: 'Si une pensée sur {topic} arrive, remarquez-la, et laissez {carrier} l’emporter.' },
        { tier: 5, pause: 4, text: 'Remarquez votre front, votre mâchoire, vos épaules. Laissez chacun se relâcher, juste un peu.' },
        { tier: 10, pause: 5, text: 'Sentez le calme de ce lieu entrer en vous, comme la chaleur dans des mains froides.' },
        { tier: 10, pause: 5, breath: true, text: 'Inspirez le calme… expirez la tension. Inspirez le calme… expirez la tension.' },
        { tier: 3, pause: 4, text: 'Vous êtes en sécurité en ce moment. Pour l’instant, vous n’avez rien à résoudre.' },
      ],
    },
    letgo: {
      name: 'Lâcher prise',
      keywords: ['lacher prise', 'laisser aller', 'oublier', 'tourner la page', 'passer a autre chose', 'ruminer', 'rumine'],
      lines: [
        { tier: 3, pause: 4, text: 'Laissez {topic} vous revenir à l’esprit, juste un instant. Remarquez où vous le sentez dans votre corps.' },
        { tier: 3, pause: 5, text: 'Imaginez que vous déposez ce ressenti sur {carrier}, et regardez-le s’éloigner lentement de vous.' },
        { tier: 5, pause: 5, text: 'S’il revient, ce n’est pas grave. Déposez-le à nouveau. Inutile de forcer.' },
        { tier: 10, pause: 5, text: 'À chaque expiration, imaginez que vous en lâchez un peu plus. Vous n’avez pas à tout porter.' },
        { tier: 10, pause: 5, text: 'Remarquez l’espace qu’il laisse derrière lui. Plus léger. Plus calme.' },
        { tier: 3, pause: 4, breath: true, text: 'Respirez dans cet espace, et laissez-le se remplir de calme.' },
      ],
    },
    kindness: {
      name: 'Réconfort',
      keywords: ['reconfort', 'reconforter', 'douceur', 'bienveillance', 'solitude', 'seul', 'seule', 'blesse', 'blessee', 'guerir', 'calin'],
      lines: [
        { tier: 3, pause: 4, text: 'Posez une main sur votre cœur, si vous voulez. Sentez sa chaleur.' },
        { tier: 3, pause: 4, text: 'Imaginez une lumière douce et chaude qui se rassemble autour de vous, tendre comme le soleil du matin.' },
        { tier: 5, pause: 5, text: 'Laissez la lumière accueillir tout ce que vous ressentez concernant {topic}, comme on tient la main d’un ami.' },
        { tier: 10, pause: 5, text: 'Dites-vous en silence : je fais de mon mieux. Moi aussi, je mérite de la douceur.' },
        { tier: 10, pause: 5, text: 'Imaginez une personne qui tient à vous, assise à vos côtés. Pas besoin de rien dire. Quelqu’un est là.' },
        { tier: 3, pause: 4, breath: true, text: 'Inspirez la chaleur… et expirez, un peu plus doucement à chaque fois.' },
      ],
    },
    sleep: {
      name: 'Dormir',
      keywords: ['dormir', 'sommeil', 'insomnie', 'endormir', 'dors'],
      lines: [
        { tier: 3, pause: 5, breath: true, text: 'Laissez votre respiration ralentir, toute seule. Plus lente… et plus douce.' },
        { tier: 3, pause: 5, text: 'Sentez vos pieds devenir lourds et chauds. Puis vos jambes. Puis vos hanches.' },
        { tier: 5, pause: 5, text: 'Maintenant votre dos, vos bras, vos mains. Lourds, chauds, immobiles.' },
        { tier: 10, pause: 6, text: 'Votre visage se détend. Vos yeux se reposent. Même vos pensées commencent à ralentir.' },
        { tier: 10, pause: 6, text: 'Si une pensée sur {topic} arrive, laissez {carrier} l’emporter. Elle peut attendre demain matin.' },
        { tier: 3, pause: 6, breath: true, text: 'Il n’y a plus rien à faire que vous reposer. Laissez-vous glisser aussi loin que vous voulez.' },
      ],
    },
    confidence: {
      name: 'Confiance',
      keywords: ['confiance', 'courage', 'entretien', 'presentation', 'oral', 'croire en moi'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Redressez-vous un peu. Inspirez, et sentez votre poitrine s’ouvrir.' },
        { tier: 3, pause: 5, text: 'Imaginez maintenant que tout se passe bien pour {topic}. Voyez-vous agir avec calme, avec assurance, avec stabilité.' },
        { tier: 5, pause: 5, text: 'Remarquez votre posture, votre voix, votre respiration. Stables et claires.' },
        { tier: 10, pause: 5, text: 'Souvenez-vous d’une fois où vous avez fait quelque chose de difficile et l’avez surmonté. Cette force est toujours en vous.' },
        { tier: 10, pause: 5, text: 'Dites-vous en silence : j’en suis capable. Je peux y arriver, une étape à la fois.' },
        { tier: 3, pause: 4, text: 'Gardez cette sensation. Vous pouvez l’emporter avec vous.' },
      ],
    },
    energy: {
      name: 'Énergie',
      keywords: ['energie', 'motivation', 'motive', 'dynamisme', 'booster', 'flemme'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Prenez une plus grande inspiration, qui remplit toute la poitrine… et relâchez.' },
        { tier: 3, pause: 4, text: 'Imaginez la lumière de ce lieu qui devient plus vive, plus chaude, pleine d’énergie.' },
        { tier: 5, pause: 4, text: 'À chaque inspiration, faites entrer cette énergie lumineuse dans votre corps.' },
        { tier: 10, pause: 4, text: 'Sentez-la se répandre : dans votre poitrine, le long de vos bras, jusqu’au bout des doigts.' },
        { tier: 10, pause: 4, text: 'Voyez-vous vous lever après cela, bouger avec aisance, avec de l’élan pour la suite.' },
        { tier: 3, pause: 4, breath: true, text: 'Encore une inspiration pleine d’énergie… et expirez. L’énergie est là, et vous pouvez y aller.' },
      ],
    },
    joy: {
      name: 'Savourer la joie',
      keywords: ['celebrer', 'feter', 'profiter', 'savourer', 'gratitude', 'reconnaissant', 'reconnaissante'],
      lines: [
        { tier: 3, pause: 4, text: 'Pensez à ce qui vous fait du bien aujourd’hui. Laissez-le être là, avec vous.' },
        { tier: 3, pause: 4, text: 'Remarquez où ce bien-être se loge dans votre corps. Peut-être une chaleur, ou une légèreté.' },
        { tier: 5, pause: 4, breath: true, text: 'À chaque inspiration, laissez cette sensation grandir un peu.' },
        { tier: 10, pause: 4, text: 'Imaginez-la comme une couleur, qui brille davantage à chaque respiration.' },
        { tier: 10, pause: 4, text: 'Dites merci en silence, à quelqu’un, à la vie ou à vous-même, pour ce moment.' },
        { tier: 3, pause: 4, text: 'Prenez une photo mentale de cette sensation, pour y revenir un jour plus difficile.' },
      ],
    },
    focus: {
      name: 'Concentration',
      keywords: ['concentration', 'concentrer', 'focus', 'etudier', 'reviser', 'revisions', 'clarte', 'distrait', 'distraite'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Portez votre attention sur votre respiration. Juste cette respiration… et celle-ci.' },
        { tier: 3, pause: 4, text: 'Des pensées peuvent venir. Laissez {carrier} emporter chacune d’elles, et revenez à votre respiration.' },
        { tier: 5, pause: 5, text: 'Imaginez votre esprit comme une eau claire. Laissez-la se déposer jusqu’à voir le fond.' },
        { tier: 10, pause: 5, text: 'Pensez maintenant à une petite étape claire pour {topic}. Une seule.' },
        { tier: 10, pause: 5, text: 'Voyez-vous accomplir cette étape, calmement et pleinement.' },
        { tier: 3, pause: 4, text: 'Votre esprit est clair et stable. Vous pouvez emporter cette concentration avec vous.' },
      ],
    },
  },

  topics: {
    exam: { phrase: 'l’examen', keywords: ['examen', 'examens', 'bac', 'partiel', 'partiels', 'concours', 'controle', 'resultats'] },
    work: { phrase: 'le travail', keywords: ['travail', 'boulot', 'patron', 'chef', 'bureau', 'deadline', 'carriere', 'entretien'] },
    relationship: { phrase: 'votre couple', keywords: ['copain', 'copine', 'partenaire', 'rupture', 'mari', 'couple', 'relation', 'mariage'] },
    family: { phrase: 'votre famille', keywords: ['famille', 'parents', 'maman', 'papa', 'mere', 'pere', 'frere', 'soeur'] },
    friends: { phrase: 'vos amis', keywords: ['ami', 'amie', 'amis', 'amies', 'amitie', 'pote', 'potes'] },
    health: { phrase: 'votre santé', keywords: ['sante', 'malade', 'douleur', 'hopital', 'maladie', 'medecin'] },
    money: { phrase: 'l’argent', keywords: ['argent', 'loyer', 'pret', 'dette', 'dettes', 'factures', 'salaire'] },
    future: { phrase: 'l’avenir', keywords: ['avenir', 'futur', 'incertain'] },
    exercise: { phrase: 'votre entraînement', keywords: ['sport', 'entrainement', 'salle de sport', 'course', 'yoga'] },
  },
};
