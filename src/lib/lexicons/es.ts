import type { LanguagePack, Weights } from './types';

/**
 * Spanish starter lexicon. Keys are masculine singular without accents;
 * `variants` maps "preocupadas" → "preocupada" → "preocupado". Machine-drafted:
 * have a native speaker review it.
 */
const LEXICON: Record<string, Weights> = {
  // alegría
  feliz: { joy: 1 },
  felices: { joy: 1 },
  felicidad: { joy: 1 },
  alegre: { joy: 0.9 },
  alegria: { joy: 1 },
  contento: { joy: 0.8, calm: 0.2 },
  emocionado: { joy: 0.9 },
  entusiasmado: { joy: 0.9 },
  ilusionado: { joy: 0.8 },
  agradecido: { joy: 0.8, calm: 0.2 },
  orgulloso: { joy: 0.9 },
  encantado: { joy: 1 },
  genial: { joy: 0.8 },
  increible: { joy: 0.8 },
  maravilloso: { joy: 1 },
  bien: { joy: 0.4, calm: 0.2 },
  amor: { joy: 0.8 },
  divertido: { joy: 0.7 },
  optimista: { joy: 0.7 },
  esperanzado: { joy: 0.7, calm: 0.2 },
  motivado: { joy: 0.7 },
  inspirado: { joy: 0.8 },
  animado: { joy: 0.7 },

  // calma
  tranquilo: { calm: 1 },
  tranquilidad: { calm: 1 },
  calmado: { calm: 1 },
  calma: { calm: 1 },
  relajado: { calm: 1 },
  sereno: { calm: 1 },
  paz: { calm: 0.9 },
  descansado: { calm: 0.8 },
  seguro: { calm: 0.6 },
  comodo: { calm: 0.7 },
  aliviado: { calm: 0.8, joy: 0.3 },
  equilibrado: { calm: 0.8 },

  // tristeza
  triste: { sadness: 1 },
  tristes: { sadness: 1 },
  tristeza: { sadness: 1 },
  deprimido: { sadness: 1 },
  soledad: { sadness: 0.9 },
  desanimado: { sadness: 0.8 },
  decepcionado: { sadness: 0.8 },
  dolido: { sadness: 0.8 },
  herido: { sadness: 0.7 },
  llorar: { sadness: 0.9 },
  llorando: { sadness: 0.9 },
  llore: { sadness: 0.9 },
  lagrimas: { sadness: 0.8 },
  vacio: { sadness: 0.8 },
  perdido: { sadness: 0.5 },
  cansado: { sadness: 0.4 },
  agotado: { sadness: 0.5 },
  desesperanzado: { sadness: 1 },
  abatido: { sadness: 0.9 },
  melancolico: { sadness: 0.8 },
  nostalgia: { sadness: 0.6 },
  mal: { sadness: 0.5 },

  // enojo
  enojado: { anger: 1 },
  enfadado: { anger: 1 },
  furioso: { anger: 1 },
  molesto: { anger: 0.6 },
  irritado: { anger: 0.6 },
  frustrado: { anger: 0.7 },
  rabia: { anger: 1 },
  ira: { anger: 1 },
  odio: { anger: 0.9, disgust: 0.2 },
  harto: { anger: 0.8 },
  indignado: { anger: 0.9 },
  cabreado: { anger: 0.9 },

  // miedo / ansiedad
  ansioso: { fear: 1 },
  ansiedad: { fear: 1 },
  nervioso: { fear: 0.8 },
  asustado: { fear: 1 },
  miedo: { fear: 1 },
  temor: { fear: 0.9 },
  preocupado: { fear: 0.8 },
  preocupacion: { fear: 0.7 },
  panico: { fear: 1 },
  aterrado: { fear: 1 },
  estresado: { fear: 0.7 },
  estres: { fear: 0.6 },
  agobiado: { fear: 0.7, sadness: 0.3 },
  abrumado: { fear: 0.7, sadness: 0.3 },
  inquieto: { fear: 0.6 },
  tenso: { fear: 0.6 },
  inseguro: { fear: 0.6 },
  angustiado: { fear: 0.9 },
  angustia: { fear: 0.9 },

  // sorpresa
  sorprendido: { surprise: 1 },
  sorpresa: { surprise: 0.9 },
  impactado: { surprise: 0.9 },
  asombrado: { surprise: 0.6, joy: 0.4 },
  inesperado: { surprise: 0.7 },
  guau: { surprise: 0.8 },

  // asco
  asco: { disgust: 1 },
  asqueado: { disgust: 1 },
  asqueroso: { disgust: 0.9 },
  repugnante: { disgust: 0.9 },
  avergonzado: { disgust: 0.6, sadness: 0.3 },
  verguenza: { disgust: 0.6, sadness: 0.3 },
  horrible: { disgust: 0.5, sadness: 0.3 },
};

export const spanish: LanguagePack = {
  lexicon: LEXICON,
  negators: new Set(['no', 'nunca', 'jamas', 'nada', 'ni', 'sin', 'tampoco', 'nadie']),
  boosters: new Set([
    'muy', 'super', 're', 'demasiado', 'tan', 'totalmente', 'extremadamente', 'realmente', 'sumamente',
    'bastante', 'tremendamente', 'increiblemente',
  ]),
  dampeners: new Set(['unpoco', 'ligeramente', 'medio', 'apenas', 'poco']),
  clauseBreaks: new Set(['pero', 'aunque', 'sino', 'sinembargo', 'y']),
  stopwords: new Set([
    'yo', 'me', 'mi', 'mis', 'te', 'tu', 'el', 'la', 'los', 'las', 'lo', 'le', 'un', 'una', 'unos', 'unas', 'de',
    'del', 'a', 'al', 'en', 'que', 'o', 'por', 'para', 'con', 'es', 'estoy', 'estaba', 'esta', 'este', 'esto', 'eso',
    'ese', 'soy', 'fue', 'hoy', 'ahora', 'porque', 'siento', 'sentia', 'senti', 'sentir', 'se', 'su', 'sus', 'como',
    'mas', 'ya', 'hay', 'tengo', 'tenia', 'estar', 'ser', 'todo', 'toda', 'mucho', 'mucha', 'cuando', 'donde',
    'manana', 'ayer', 'dia', 'pero', 'aunque', 'y', 'tambien',
  ]),
  phrases: [
    [/\bun poco\b/gi, 'unpoco'],
    [/\bsin embargo\b/gi, 'sinembargo'],
  ],
  crisis: [
    /\bquiero morir/,
    /\bme quiero morir/,
    /\bmatarme\b/,
    /\bquitarme la vida\b/,
    /\bhacerme dano\b/,
    /\bautolesi/,
    /\bno quiero vivir\b/,
  ],
  variants: (word) => {
    const bases = [word];
    if (word.endsWith('es')) bases.push(word.slice(0, -2));
    if (word.endsWith('s')) bases.push(word.slice(0, -1));
    return bases.flatMap((b) => (b.endsWith('a') ? [b, `${b.slice(0, -1)}o`] : [b]));
  },
};
