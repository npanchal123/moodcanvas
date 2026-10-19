import { useMemo } from 'react';
import { useI18n } from '../i18n';
import { detectRegion, HELPLINES, type Helpline } from '../lib/helplines';
import { btnGhost } from './ui';

const link = 'font-medium underline';

function LineLinks({ line }: { line: Helpline }) {
  const { t } = useI18n();
  return (
    <>
      <span className="font-medium">{line.name}</span>:{' '}
      <a href={`tel:${line.dial}`} className={link}>
        {t.crisis.call(line.phone)}
      </a>
      {line.text && (
        <>
          {' · '}
          <a href={`sms:${line.text}`} className={link}>
            {t.crisis.text(line.textDisplay ?? line.text)}
          </a>
        </>
      )}
    </>
  );
}

interface Props {
  /** 'detected': shown because of what the user wrote. 'asked': opened from the footer. */
  reason: 'detected' | 'asked';
  onDismiss: () => void;
}

export function CrisisBanner({ reason, onDismiss }: Props) {
  const { t, locale } = useI18n();
  const region = useMemo(() => detectRegion(), []);
  const regionName = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);
  const local = region ? HELPLINES[region] : null;
  const others = Object.entries(HELPLINES).filter(([code]) => code !== region);

  return (
    <section
      role={reason === 'detected' ? 'status' : undefined}
      aria-labelledby="crisis-heading"
      className="mb-6 rounded-2xl border-2 border-(--accent) bg-(--surface) p-5"
    >
      <h2 id="crisis-heading" tabIndex={-1} className="font-semibold">
        {reason === 'detected' ? t.crisis.title : t.crisis.askedTitle}
      </h2>
      <p className="mt-1">{t.crisis.body}</p>

      {local && region && (
        <div className="mt-3">
          <p className="text-sm text-(--muted)">{regionName.of(region)}</p>
          <ul className="mt-1 flex flex-col gap-1">
            {local.lines.map((line) => (
              <li key={line.name}>
                <LineLinks line={line} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3">
        {local ? (
          <>
            {t.crisis.emergency}{' '}
            <a href={`tel:${local.emergency}`} className={link}>
              {local.emergency}
            </a>
            .
          </>
        ) : (
          t.crisis.emergencyUnknown
        )}
      </p>

      <p className="mt-3">
        {local ? t.crisis.elsewhere : t.crisis.findLine}{' '}
        <a href="https://findahelpline.com/" target="_blank" rel="noreferrer" className={link}>
          findahelpline.com
        </a>
        .
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer py-3 font-medium">
          {t.crisis.otherCountries}
        </summary>
        <ul className="mt-1 flex flex-col gap-2">
          {others.map(([code, support]) => (
            <li key={code}>
              <span className="block text-sm text-(--muted)">
                {regionName.of(code)} · {t.crisis.emergencyShort(support.emergency)}
              </span>
              {support.lines.map((line) => (
                <span key={line.name} className="block">
                  <LineLinks line={line} />
                </span>
              ))}
            </li>
          ))}
        </ul>
      </details>

      <button type="button" onClick={onDismiss} className={`${btnGhost} mt-2 text-sm`}>
        {t.crisis.dismiss}
      </button>
    </section>
  );
}
