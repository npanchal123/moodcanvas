import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useI18n } from '../i18n';
import { EMOTION_META, emotionColor } from '../lib/emotions';
import type { FrequencyRow } from '../lib/stats';
import { useTheme } from '../lib/theme';

interface Props {
  rows: FrequencyRow[];
  animate: boolean;
}

/** The Recharts part of the frequency chart, split out so Recharts loads only when a chart is shown. */
export default function FrequencyBars({ rows, animate }: Props) {
  const { t } = useI18n();
  const { scheme, highContrast } = useTheme();
  const ink = highContrast ? '#000000' : scheme === 'dark' ? '#ecedf0' : '#1c1d21';
  const data = rows.map((r) => ({ ...r, name: `${EMOTION_META[r.label].icon} ${t.emotions[r.label].name}` }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tickLine={false}
          axisLine={false}
          tick={{ fill: ink, fontSize: 14 }}
        />
        <Bar dataKey="count" barSize={24} radius={[0, 6, 6, 0]} isAnimationActive={animate}>
          {data.map((d) => (
            <Cell
              key={d.label}
              fill={emotionColor(d.label, scheme)}
              stroke={highContrast ? '#000000' : undefined}
              strokeWidth={highContrast ? 2 : 0}
            />
          ))}
          <LabelList dataKey="count" position="right" fill={ink} formatter={(v: unknown) => `${v}×`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
