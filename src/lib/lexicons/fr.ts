import type { LanguagePack, Weights } from './types';

/**
 * French starter lexicon. Keys are masculine singular without accents; `variants` maps "heureuses" →
 * "heureuse" → "heureux" and "inquiète" → "inquiet". Machine-drafted: have a native speaker review it.
 */
const LEXICON: Record<string, Weights> = {
  // joie
  heureux: { joy: 1 },
  joie: { joy: 1 },
  joyeux: { joy: 0.9 },
  content: { joy: 0.8, calm: 0.2 },
  ravi: { joy: 1 },
  enthousiaste: { joy: 0.9 },
  excite: { joy: 0.9 },
  fier: { joy: 0.9 },
  genial: { joy: 0.8 },
  merveilleux: { joy: 1 },
  bien: { joy: 0.4, calm: 0.2 },
  amour: { joy: 0.8 },
  adore: { joy: 0.7 },
  gai: { joy: 0.8 },
  optimiste: { joy: 0.7 },
  motive: { joy: 0.7 },
  inspire: { joy: 0.8 },
  reconnaissant: { joy: 0.8, calm: 0.2 },
  epanoui: { joy: 0.8, calm: 0.2 },
  chanceux: { joy: 0.7 },

  // calme
  calme: { calm: 1 },
  apaise: { calm: 1 },
  serein: { calm: 1 },
  serenite: { calm: 1 },
  detendu: { calm: 1 },
  tranquille: { calm: 0.9 },
  paisible: { calm: 1 },
  paix: { calm: 0.9 },
  repose: { calm: 0.8 },
  zen: { calm: 0.9 },
  soulage: { calm: 0.8, joy: 0.3 },
  confiant: { calm: 0.5, joy: 0.3 },

  // tristesse
  triste: { sadness: 1 },
  tristesse: { sadness: 1 },
  deprime: { sadness: 1 },
  malheureux: { sadness: 1 },
  seul: { sadness: 0.7 },
  solitude: { sadness: 0.8 },
  decu: { sadness: 0.8 },
  blesse: { sadness: 0.7 },
  pleurer: { sadness: 0.9 },
  pleure: { sadness: 0.9 },
  larmes: { sadness: 0.8 },
  vide: { sadness: 0.8 },
  perdu: { sadness: 0.5 },
  fatigue: { sadness: 0.4 },
  epuise: { sadness: 0.5 },
  desespere: { sadness: 1 },
  abattu: { sadness: 0.9 },
  melancolie: { sadness: 0.8 },
  nostalgie: { sadness: 0.6 },
  mal: { sadness: 0.5 },
  cafard: { sadness: 0.8 },
  chagrin: { sadness: 1 },

  // colère
  colere: { anger: 1 },
  enerve: { anger: 0.8 },
  furieux: { anger: 1 },
  fache: { anger: 0.9 },
  irrite: { anger: 0.6 },
  agace: { anger: 0.6 },
  frustre: { anger: 0.7 },
  frustration: { anger: 0.7 },
  rage: { anger: 1 },
  haine: { anger: 0.9, disgust: 0.2 },
  deteste: { anger: 0.8, disgust: 0.2 },
  marre: { anger: 0.8 },
  enrage: { anger: 1 },

  // peur / anxiété
  anxieux: { fear: 1 },
  anxiete: { fear: 1 },
  angoisse: { fear: 1 },
  nerveux: { fear: 0.8 },
  peur: { fear: 1 },
  effraye: { fear: 1 },
  inquiet: { fear: 0.8 },
  inquietude: { fear: 0.7 },
  panique: { fear: 1 },
  terrifie: { fear: 1 },
  stresse: { fear: 0.7 },
  stress: { fear: 0.6 },
  deborde: { fear: 0.7, sadness: 0.3 },
  submerge: { fear: 0.7, sadness: 0.3 },
  tendu: { fear: 0.6 },
  crainte: { fear: 0.8 },
  trac: { fear: 0.8 },

  // surprise
  surpris: { surprise: 1 },
  surprise: { surprise: 0.9 },
  choque: { surprise: 0.8 },
  etonne: { surprise: 0.7 },
  stupefait: { surprise: 0.9 },
  inattendu: { surprise: 0.7 },
  waouh: { surprise: 0.8 },

  // dégoût
  degoute: { disgust: 1 },
  degout: { disgust: 1 },
  degoutant: { disgust: 0.9 },
  ecoeure: { disgust: 1 },
  repugnant: { disgust: 0.9 },
  honte: { disgust: 0.6, sadness: 0.3 },
  honteux: { disgust: 0.6, sadness: 0.3 },
  horrible: { disgust: 0.5, sadness: 0.3 },
  beurk: { disgust: 0.9 },
};

export const french: LanguagePack = {
  lexicon: LEXICON,
  negators: new Set(['ne', 'pas', 'jamais', 'rien', 'sans', 'ni', 'aucun', 'aucune']),
  boosters: new Set([
    'tres', 'trop', 'vraiment', 'super', 'tellement', 'si', 'hyper', 'completement', 'extremement', 'totalement',
    'grave', 'vachement', 'profondement',
  ]),
  dampeners: new Set(['unpeu', 'legerement', 'peu', 'moyennement']),
  clauseBreaks: new Set(['mais', 'cependant', 'pourtant', 'et']),
  stopwords: new Set([
    'je', 'j', 'me', 'm', 'moi', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'le', 'la', 'les', 'l', 'un', 'une', 'des',
    'de', 'du', 'd', 'a', 'au', 'aux', 'en', 'ou', 'que', 'qu', 'qui', 'pour', 'par', 'avec', 'sur', 'dans', 'est',
    'suis', 'etais', 'etait', 'ai', 'as', 'avoir', 'etre', 'ce', 'c', 'cet', 'cette', 'ces', 'mon', 'ma', 'mes', 'se',
    's', 'sa', 'son', 'ses', 'aujourd', 'hui', 'maintenant', 'parce', 'car', 'sens', 'sentais', 'comme', 'plus', 'deja',
    'tout', 'toute', 'tous', 'quand', 'demain', 'hier', 'jour', 'mais', 'et',
  ]),
  phrases: [
    [/\bun peu\b/gi, 'unpeu'],
    // "n'est", "j'adore", "l'examen": split the elided word off so "ne" and "adore" are read.
    [/\bn'/gi, 'ne '],
    [/\b(j|l|d|m|t|s|c|qu)'/gi, '$1 '],
  ],
  crisis: [
    /\bveux mourir/,
    /\benvie de mourir/,
    /\bme tuer\b/,
    /\bme suicider\b/,
    /\bsuicid/,
    /\ben finir avec (la|ma) vie/,
    /\bmettre fin a mes jours/,
    /\bme faire du mal\b/,
    /\bne veux plus vivre/,
    /\bplus envie de vivre/,
  ],
  variants: (word) => {
    const bases = [word];
    if (word.length > 3 && /[sx]$/.test(word)) bases.push(word.slice(0, -1));
    return bases.flatMap((b) => {
      const forms = [b];
      if (b.endsWith('euse')) forms.push(`${b.slice(0, -4)}eux`);
      if (b.endsWith('ive')) forms.push(`${b.slice(0, -3)}if`);
      if (b.endsWith('ere')) forms.push(`${b.slice(0, -3)}er`);
      if (b.endsWith('ete')) forms.push(`${b.slice(0, -3)}et`);
      if (b.endsWith('e')) forms.push(b.slice(0, -1));
      return forms;
    });
  },
};
