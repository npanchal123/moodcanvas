import type { LanguagePack, Weights } from './types';

/**
 * Portuguese starter lexicon (Brazilian and European spellings). Keys are masculine singular without accents;
 * `variants` maps "ansiosas" → "ansiosa" → "ansioso". Machine-drafted: have a native speaker review it.
 */
const LEXICON: Record<string, Weights> = {
  // alegria
  feliz: { joy: 1 },
  felizes: { joy: 1 },
  felicidade: { joy: 1 },
  alegre: { joy: 0.9 },
  alegria: { joy: 1 },
  contente: { joy: 0.8, calm: 0.2 },
  animado: { joy: 0.8 },
  empolgado: { joy: 0.9 },
  entusiasmado: { joy: 0.9 },
  grato: { joy: 0.8, calm: 0.2 },
  orgulhoso: { joy: 0.9 },
  encantado: { joy: 1 },
  otimo: { joy: 0.8 },
  incrivel: { joy: 0.8 },
  maravilhoso: { joy: 1 },
  bem: { joy: 0.4, calm: 0.2 },
  amor: { joy: 0.8 },
  divertido: { joy: 0.7 },
  otimista: { joy: 0.7 },
  esperancoso: { joy: 0.7, calm: 0.2 },
  motivado: { joy: 0.7 },
  inspirado: { joy: 0.8 },

  // calma
  calmo: { calm: 1 },
  calma: { calm: 1 },
  tranquilo: { calm: 1 },
  tranquilidade: { calm: 1 },
  relaxado: { calm: 1 },
  sereno: { calm: 1 },
  paz: { calm: 0.9 },
  descansado: { calm: 0.8 },
  seguro: { calm: 0.6 },
  confortavel: { calm: 0.7 },
  aliviado: { calm: 0.8, joy: 0.3 },
  equilibrado: { calm: 0.8 },

  // tristeza
  triste: { sadness: 1 },
  tristes: { sadness: 1 },
  tristeza: { sadness: 1 },
  deprimido: { sadness: 1 },
  sozinho: { sadness: 0.7 },
  solidao: { sadness: 0.9 },
  desanimado: { sadness: 0.8 },
  decepcionado: { sadness: 0.8 },
  magoado: { sadness: 0.8 },
  chorar: { sadness: 0.9 },
  chorando: { sadness: 0.9 },
  chorei: { sadness: 0.9 },
  lagrimas: { sadness: 0.8 },
  vazio: { sadness: 0.8 },
  perdido: { sadness: 0.5 },
  cansado: { sadness: 0.4 },
  exausto: { sadness: 0.5 },
  desesperado: { sadness: 0.9, fear: 0.3 },
  abatido: { sadness: 0.9 },
  melancolico: { sadness: 0.8 },
  saudade: { sadness: 0.6 },
  mal: { sadness: 0.5 },
  prabaixo: { sadness: 0.8 }, // "pra baixo", feeling down

  // raiva
  raiva: { anger: 1 },
  bravo: { anger: 0.9 },
  irritado: { anger: 0.6 },
  furioso: { anger: 1 },
  chateado: { anger: 0.5, sadness: 0.4 },
  frustrado: { anger: 0.7 },
  frustracao: { anger: 0.7 },
  odio: { anger: 0.9, disgust: 0.2 },
  odeio: { anger: 0.8, disgust: 0.2 },
  revoltado: { anger: 0.9 },
  puto: { anger: 0.9 },
  nervoso: { fear: 0.6, anger: 0.3 },

  // medo / ansiedade
  ansioso: { fear: 1 },
  ansiedade: { fear: 1 },
  assustado: { fear: 1 },
  medo: { fear: 1 },
  preocupado: { fear: 0.8 },
  preocupacao: { fear: 0.7 },
  panico: { fear: 1 },
  apavorado: { fear: 1 },
  estressado: { fear: 0.7 },
  estresse: { fear: 0.6 },
  sobrecarregado: { fear: 0.7, sadness: 0.3 },
  tenso: { fear: 0.6 },
  inseguro: { fear: 0.6 },
  angustiado: { fear: 0.9 },
  angustia: { fear: 0.9 },
  aflito: { fear: 0.8 },

  // surpresa
  surpreso: { surprise: 1 },
  surpresa: { surprise: 0.9 },
  chocado: { surprise: 0.8 },
  espantado: { surprise: 0.7 },
  inesperado: { surprise: 0.7 },
  uau: { surprise: 0.8 },
  nossa: { surprise: 0.6 },

  // nojo
  nojo: { disgust: 1 },
  enojado: { disgust: 1 },
  nojento: { disgust: 0.9 },
  repugnante: { disgust: 0.9 },
  envergonhado: { disgust: 0.6, sadness: 0.3 },
  vergonha: { disgust: 0.6, sadness: 0.3 },
  horrivel: { disgust: 0.5, sadness: 0.3 },
};

export const portuguese: LanguagePack = {
  lexicon: LEXICON,
  negators: new Set(['nao', 'nunca', 'jamais', 'nada', 'nem', 'sem', 'tampouco', 'ninguem']),
  boosters: new Set([
    'muito', 'muita', 'super', 'demais', 'tao', 'totalmente', 'extremamente', 'realmente', 'bastante', 'mega',
    'completamente',
  ]),
  dampeners: new Set(['umpouco', 'levemente', 'meio', 'pouco']),
  clauseBreaks: new Set(['mas', 'porem', 'embora', 'contudo', 'e']),
  stopwords: new Set([
    'eu', 'me', 'mim', 'meu', 'minha', 'meus', 'minhas', 'voce', 'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de',
    'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'que', 'ou', 'por', 'para', 'com', 'e', 'esta', 'estou',
    'estava', 'este', 'isto', 'isso', 'esse', 'essa', 'sou', 'foi', 'hoje', 'agora', 'porque', 'sinto', 'sentindo',
    'senti', 'sentir', 'se', 'seu', 'sua', 'como', 'mais', 'ja', 'tem', 'tenho', 'tinha', 'estar', 'ser', 'tudo',
    'quando', 'onde', 'amanha', 'ontem', 'dia', 'mas', 'tambem', 'ao', 'aos', 'pelo', 'pela',
  ]),
  phrases: [
    [/\bum pouco\b/gi, 'umpouco'],
    [/\bpra baixo\b/gi, 'prabaixo'],
  ],
  crisis: [
    /\bquero morrer/,
    /\bvontade de morrer/,
    /\bme matar\b/,
    /\bsuicid/,
    /\btirar (a )?minha (propria )?vida/,
    /\bacabar com (a )?minha vida/,
    /\bnao quero (mais )?viver/,
    /\bme machucar\b/,
    /\bautomutila/,
  ],
  variants: (word) => {
    const bases = [word];
    if (word.endsWith('es')) bases.push(word.slice(0, -2));
    if (word.endsWith('s')) bases.push(word.slice(0, -1));
    return bases.flatMap((b) => (b.endsWith('a') ? [b, `${b.slice(0, -1)}o`] : [b]));
  },
};
