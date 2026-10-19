import { useId } from 'react';
import { useI18n } from '../i18n';
import { EMOTION_META, emotionColor, type PatternKind } from '../lib/emotions';
import { useTheme } from '../lib/theme';
import type { EmotionScore } from '../lib/types';

interface Props {
  emotions: EmotionScore[];
  valence: number;
  size?: number;
  /** Hide from assistive tech when the same information is in nearby text. */
  decorative?: boolean;
  animate?: boolean;
}

/** Rounded petals for pleasant feelings, pointed ones for unpleasant feelings. */
function petalPath(r: number, sharp: boolean): string {
  const w = r * 0.32;
  return sharp
    ? `M0,0 L${w},${-r * 0.45} L0,${-r} L${-w},${-r * 0.45} Z`
    : `M0,0 C${w},${-r * 0.35} ${w},${-r * 0.85} 0,${-r} C${-w},${-r * 0.85} ${-w},${-r * 0.35} 0,0 Z`;
}

function PatternShape({ kind, ink }: { kind: PatternKind; ink: string }) {
  const stroke = { stroke: ink, strokeWidth: 1.2, fill: 'none' };
  switch (kind) {
    case 'dots':
      return <circle cx={4} cy={4} r={1.5} fill={ink} />;
    case 'waves':
      return <path d="M0 4 Q2 2 4 4 T8 4" {...stroke} />;
    case 'vlines':
      return <path d="M4 0 V8" {...stroke} />;
    case 'zigzag':
      return <path d="M0 6 L2 2 L4 6 L6 2 L8 6" {...stroke} />;
    case 'rings':
      return <circle cx={4} cy={4} r={2.5} {...stroke} />;
    case 'stars':
      return <path d="M4 1 L4.9 3.1 7 4 4.9 4.9 4 7 3.1 4.9 1 4 3.1 3.1Z" fill={ink} />;
    case 'crosshatch':
      return <path d="M0 0 L8 8 M8 0 L0 8" {...stroke} />;
  }
}

/**
 * Color = emotion, size and fill strength = intensity, petal shape = valence,
 * center texture = emotion again (so it reads without color).
 */
export function EmotionBloom({ emotions, valence, size = 220, decorative = false, animate = false }: Props) {
  const { t } = useI18n();
  const { scheme, highContrast } = useTheme();
  const uid = useId().replace(/:/g, '');
  const [primary, secondary] = emotions;
  if (!primary) return null;

  const meta = EMOTION_META[primary.label];
  const color = emotionColor(primary.label, scheme);
  const outerR = 40 + primary.intensity * 0.5;
  const count = 6 + Math.round(primary.intensity / 25);
  const step = 360 / count;
  const ink = scheme === 'dark' ? '#15171c' : '#ffffff';
  // High contrast: solid fills and black outlines so every petal edge is crisp.
  const fillOpacity = (intensity: number) => (highContrast ? 1 : 0.3 + (0.7 * intensity) / 100);
  const outline = (fallback: string) => (highContrast ? '#000000' : fallback);

  const name = t.emotions[primary.label].name;
  const desc = secondary
    ? t.bloom.two(name, primary.intensity, t.emotions[secondary.label].name, secondary.intensity)
    : t.bloom.one(name, primary.intensity);

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      className={`h-auto max-w-full ${animate ? 'bloom-enter' : ''}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : `${uid}-title ${uid}-desc`}
    >
      {!decorative && (
        <>
          <title id={`${uid}-title`}>{t.bloom.title(name)}</title>
          <desc id={`${uid}-desc`}>{desc}</desc>
        </>
      )}
      <defs>
        <pattern id={`${uid}-pattern`} width={8} height={8} patternUnits="userSpaceOnUse">
          <PatternShape kind={meta.pattern} ink={ink} />
        </pattern>
      </defs>

      {Array.from({ length: count }, (_, i) => (
        <path
          key={`p${i}`}
          d={petalPath(outerR, valence < 0)}
          transform={`rotate(${i * step})`}
          fill={color}
          fillOpacity={fillOpacity(primary.intensity)}
          stroke={outline(color)}
          strokeWidth={highContrast ? 2 : 1.5}
        />
      ))}

      {secondary &&
        Array.from({ length: count }, (_, i) => {
          const secondaryColor = emotionColor(secondary.label, scheme);
          return (
            <path
              key={`s${i}`}
              d={petalPath(outerR * (0.35 + secondary.intensity / 400), EMOTION_META[secondary.label].polarity < 0)}
              transform={`rotate(${i * step + step / 2})`}
              fill={secondaryColor}
              fillOpacity={fillOpacity(secondary.intensity)}
              stroke={outline(secondaryColor)}
              strokeWidth={highContrast ? 1.5 : 1}
            />
          );
        })}

      <circle r={outerR * 0.3} fill={color} stroke={highContrast ? '#000000' : undefined} strokeWidth={2} />
      <circle r={outerR * 0.3} fill={`url(#${uid}-pattern)`} />
    </svg>
  );
}
