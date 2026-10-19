import { useI18n } from '../i18n';
import { card } from './ui';

/** Bump this whenever the policy text changes. */
const LAST_UPDATED = new Date(2026, 9, 19);

/** Default export so App can load it lazily. Reachable at #privacy so it can be linked to. */
export default function Privacy() {
  const { t, locale } = useI18n();
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(LAST_UPDATED);

  return (
    <article aria-labelledby="privacy-heading" className={`${card} mx-auto flex max-w-3xl flex-col gap-5`}>
      <header>
        <h2 id="privacy-heading" className="text-2xl font-semibold">
          {t.privacy.title}
        </h2>
        <p className="mt-1 text-sm text-(--muted)">{t.privacy.updated(updated)}</p>
      </header>
      <p className="rounded-xl bg-(--surface-alt) p-4 font-medium">{t.privacy.summary}</p>
      {t.privacy.sections.map((section) => (
        <section key={section.heading}>
          <h3 className="text-lg font-semibold">{section.heading}</h3>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mt-2">
              {paragraph}
            </p>
          ))}
          {section.link && (
            <p className="mt-2">
              <a href={section.link.href} target="_blank" rel="noreferrer" className="font-medium underline">
                {section.link.label}
              </a>
            </p>
          )}
        </section>
      ))}
    </article>
  );
}
