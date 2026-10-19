export const EMOTIONS = ['joy', 'calm', 'sadness', 'anger', 'fear', 'surprise', 'disgust'] as const;
export type EmotionLabel = (typeof EMOTIONS)[number];

export type ColorScheme = 'light' | 'dark';
export type PatternKind = 'dots' | 'waves' | 'vlines' | 'zigzag' | 'rings' | 'stars' | 'crosshatch';

/** Visual identity of each emotion. Names live in the i18n messages (src/i18n). */
interface EmotionMeta {
  icon: string;
  /** Texture used alongside color so meaning never depends on color alone. */
  pattern: PatternKind;
  polarity: 1 | 0 | -1;
  /**
   * Each color has at least 3:1 contrast against that scheme's surface and sits in the
   * scheme's lightness band (checked with the dataviz palette validator). A few pairs are
   * close for color-blind readers, so icon, pattern and label always travel with color.
   */
  color: Record<ColorScheme, string>;
}

export const EMOTION_META: Record<EmotionLabel, EmotionMeta> = {
  joy: { icon: '☀️', pattern: 'dots', polarity: 1, color: { light: '#B7791F', dark: '#B8861A' } },
  calm: { icon: '🌿', pattern: 'waves', polarity: 1, color: { light: '#2F855A', dark: '#38A169' } },
  sadness: { icon: '💧', pattern: 'vlines', polarity: -1, color: { light: '#2B6CB0', dark: '#4299E1' } },
  anger: { icon: '🔥', pattern: 'zigzag', polarity: -1, color: { light: '#C53030', dark: '#E05252' } },
  fear: { icon: '🌀', pattern: 'rings', polarity: -1, color: { light: '#6B46C1', dark: '#9F7AEA' } },
  surprise: { icon: '✨', pattern: 'stars', polarity: 0, color: { light: '#0891B2', dark: '#0EA5C0' } },
  disgust: { icon: '🤢', pattern: 'crosshatch', polarity: -1, color: { light: '#6B7A1F', dark: '#8F9C2F' } },
};

export function emotionColor(label: EmotionLabel, scheme: ColorScheme): string {
  return EMOTION_META[label].color[scheme];
}
