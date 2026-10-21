import type { Locale } from '../../i18n';
import type { Messages } from '../../i18n/en';
import type { PracticeScript, Segment } from '../../practices';
import type { EmotionLabel } from '../emotions';
import { en } from './en';
import { es } from './es';
import { hi } from './hi';
import { GOAL_IDS, SCENE_IDS, TOPIC_IDS, type ComposeContent, type GoalId, type Line, type SceneId, type TopicId } from './types';

export { GOAL_IDS, SCENE_IDS } from './types';
export type { GoalId, SceneId, TopicId } from './types';

export const COMPOSE_CONTENT: Record<Locale, ComposeContent> = { en, hi, es };

export const SCENE_LOOK: Record<SceneId | 'anywhere', { icon: string; hues: [string, string] }> = {
  beach: { icon: '🏖️', hues: ['#a5f3fc', '#0e7490'] },
  forest: { icon: '🌲', hues: ['#bbf7d0', '#15803d'] },
  mountain: { icon: '🏔️', hues: ['#e0e7ff', '#4338ca'] },
  garden: { icon: '🌷', hues: ['#fbcfe8', '#be185d'] },
  river: { icon: '🏞️', hues: ['#bae6fd', '#0369a1'] },
  rain: { icon: '🌧️', hues: ['#cbd5e1', '#475569'] },
  stars: { icon: '🌙', hues: ['#c7d2fe', '#312e81'] },
  home: { icon: '🏡', hues: ['#fed7aa', '#c2410c'] },
  sky: { icon: '☁️', hues: ['#e0f2fe', '#0284c7'] },
  anywhere: { icon: '✨', hues: ['#ddd6fe', '#6d28d9'] },
};

export const GOAL_ICONS: Record<GoalId, string> = {
  calm: '🌊', letgo: '🍃', kindness: '💗', sleep: '😴', confidence: '💪', energy: '⚡', joy: '🌟', focus: '🎯',
};

const GOAL_FOR_FEELING: Record<EmotionLabel, GoalId> = {
  fear: 'calm', sadness: 'kindness', anger: 'letgo', disgust: 'letgo', joy: 'joy', calm: 'calm', surprise: 'focus',
};

const SCENE_FOR_GOAL: Record<GoalId, SceneId> = {
  calm: 'beach', letgo: 'river', kindness: 'garden', sleep: 'stars', confidence: 'mountain', energy: 'forest',
  joy: 'garden', focus: 'sky',
};

/** Suggested check-in tags, so insights keep working for composed practices. */
export const TOPIC_TAGS: Partial<Record<TopicId, string>> = {
  exam: 'school', work: 'work', family: 'family', friends: 'friends', health: 'health', money: 'money',
  exercise: 'exercise', relationship: 'relationship',
};

/** Lowercase, Latin accents off, Hindi nukta and chandrabindu unified: how both text and keywords are compared. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .normalize('NFC')
    .replace(/़/g, '')
    .replace(/ँ/g, 'ं')
    .replace(/[‌‍]/g, '');
}

/** Where a keyword first appears, or -1. Latin keywords must be whole words; Devanagari ones may be a word's start. */
function position(text: string, keyword: string): number {
  const k = normalize(keyword);
  const latin = /\p{Script=Latin}/u.test(k);
  const pattern = new RegExp(`(?:^|[^\\p{L}\\p{M}])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${latin ? '(?![\\p{L}\\p{M}])' : ''}`, 'u');
  const match = pattern.exec(text);
  return match ? match.index : -1;
}

/** The id whose keywords (in any language) appear earliest in the text. */
function earliest<T extends string>(text: string, ids: readonly T[], keywords: (id: T) => string[]): T | null {
  let best: T | null = null;
  let bestAt = Infinity;
  for (const id of ids) {
    for (const keyword of keywords(id)) {
      const at = position(text, keyword);
      if (at >= 0 && at < bestAt) {
        best = id;
        bestAt = at;
      }
    }
  }
  return best;
}

const ALL = Object.values(COMPOSE_CONTENT);
const sceneKeywords = (id: SceneId) => ALL.flatMap((c) => c.scenes[id].keywords);
const goalKeywords = (id: GoalId) => ALL.flatMap((c) => c.goals[id].keywords);
const topicKeywords = (id: TopicId) => ALL.flatMap((c) => c.topics[id].keywords);

const isLatin = (s: string) => /\p{Script=Latin}/u.test(s) && !/\p{Script=Devanagari}/u.test(s);

export interface ComposeRequest {
  text: string;
  locale: Locale;
  /** The strongest feeling found in the text, if any. */
  feeling: EmotionLabel | null;
  /** Chosen by the person; otherwise worked out from the text. */
  scene?: SceneId | null;
  goal?: GoalId | null;
}

export interface Composed {
  script: PracticeScript;
  icon: string;
  hues: [string, string];
  /** null when the practice is set in a place the person named that matches no scene. */
  scene: SceneId | null;
  goal: GoalId;
  topic: TopicId | null;
  /** The person's own words for the place, when they gave one. */
  place: string | null;
}

function fill(line: Line, tokens: Record<string, string>, id: string): Segment {
  return {
    id,
    tier: line.tier,
    pause: line.pause,
    breath: line.breath,
    text: line.text.replace(/\{(place|topic|carrier)\}/g, (_, key: string) => tokens[key]),
  };
}

/**
 * Writes a guided visualization from what someone typed: their feeling, the place they'd like to be, what
 * would help, and what it's about. Runs instantly on the device. The script is tiered like the library
 * practices, so it plays at 3, 5 or 10 minutes.
 */
export function compose(request: ComposeRequest, t: Messages): Composed {
  const content = COMPOSE_CONTENT[request.locale];
  const text = normalize(request.text);

  // The place in their own words: try the interface language first, then the others.
  const finders = [content, ...ALL.filter((c) => c !== content)];
  const found = request.scene ? null : (finders.map((c) => c.findPlace(request.text)).find((p) => p) ?? null);
  let place = found?.place ?? null;
  // Words describing the place ("a calm beach") say where, not what they need, so they don't choose the goal.
  const goalText = found ? text.replace(normalize(found.raw), ' ') : text;

  const sceneInPlace = place ? earliest(normalize(place), SCENE_IDS, sceneKeywords) : null;
  const scene: SceneId | null =
    request.scene ?? sceneInPlace ?? (place ? null : earliest(text, SCENE_IDS, sceneKeywords));
  // A Hinglish place ("pahado") read by a Hindi voice sounds odd; the scene's own Devanagari words are better.
  if (place && scene && request.locale === 'hi' && isLatin(place)) place = null;

  const goal: GoalId =
    request.goal ??
    earliest(goalText, GOAL_IDS, goalKeywords) ??
    (request.feeling ? GOAL_FOR_FEELING[request.feeling] : 'calm');
  const topic = earliest(text, TOPIC_IDS, topicKeywords);
  const sceneId: SceneId | null = scene ?? (place ? null : SCENE_FOR_GOAL[goal]);

  const sceneContent = sceneId ? content.scenes[sceneId] : null;
  const tokens = {
    place: place ?? sceneContent?.place ?? '',
    topic: topic ? content.topics[topic].phrase : content.defaultTopic,
    carrier: sceneContent?.carrier ?? content.scenes[SCENE_FOR_GOAL[goal]].carrier,
  };
  const feeling = request.feeling ? t.emotions[request.feeling] : null;
  const mirror: Line = { tier: 3, pause: 1, text: content.mirror(feeling, topic ? tokens.topic : null) };

  const lines = [
    mirror,
    ...content.arrival,
    ...(sceneContent ? sceneContent.lines : content.anyPlace),
    ...content.goals[goal].lines,
    ...content.closing,
  ];
  const look = SCENE_LOOK[sceneId ?? 'anywhere'];

  // A personal place ("your grandma's garden in Shimla") makes the best title; a bare word ("पहाड़ों",
  // "the mountains") reads better as the scene's own title.
  const personal = place != null && (!sceneContent || place.split(/\s+/).length > 2);
  return {
    script: {
      title: personal && place ? content.title(place) : sceneContent!.title,
      summary: content.subtitle(content.goals[goal].name, topic ? tokens.topic : null),
      segments: lines.map((line, i) => fill(line, tokens, `c${String(i + 1).padStart(2, '0')}`)),
    },
    icon: look.icon,
    hues: look.hues,
    scene: sceneId,
    goal,
    topic,
    place,
  };
}
