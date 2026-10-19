import { useLiveQuery } from 'dexie-react-hooks';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { CrisisBanner } from './components/CrisisBanner';
import { EntryForm, FEELING_INPUT_ID, type SubmitOutcome } from './components/EntryForm';
import { FrequencyChart } from './components/FrequencyChart';
import { Onboarding } from './components/Onboarding';
import { ReminderBanner } from './components/ReminderBanner';
import { ResultPanel } from './components/ResultPanel';
import { card, toggle } from './components/ui';
import { useI18n } from './i18n';
import { useAuth, useSync } from './lib/account';
import { analyzeWithAI } from './lib/aiAnalyzer';
import { analyze, type AnalysisResult } from './lib/analyzer';
import { db } from './lib/db';
import type { EmotionLabel } from './lib/emotions';
import { addEntry } from './lib/entries';
import { usePersistentFlag, usePersistentState, usePrefersReducedMotion } from './lib/hooks';
import { DEFAULT_REMINDER, isReminderSettings, useReminder } from './lib/reminders';
import { frequency } from './lib/stats';
import type { EmotionEntry } from './lib/types';

// History and Settings (and the Recharts bars) load on first use, keeping the first paint small.
const History = lazy(() => import('./components/History'));
const Settings = lazy(() => import('./components/Settings'));

type View = 'today' | 'history' | 'settings';
const VIEW_IDS: View[] = ['today', 'history', 'settings'];

const NO_ENTRIES: EmotionEntry[] = [];

export default function App() {
  const { t, locale } = useI18n();
  const [view, setView] = useState<View>('today');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [crisis, setCrisis] = useState(false);
  const [calm, setCalm] = usePersistentFlag('moodcanvas.calmMode', false);
  const [onboarded, setOnboarded] = usePersistentFlag('moodcanvas.onboarded', false);
  const [aiEnabled, setAiEnabled] = usePersistentFlag('moodcanvas.aiAnalysis', false);
  const [reminder, setReminder] = usePersistentState('moodcanvas.reminder', DEFAULT_REMINDER, isReminderSettings);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = !calm && !prefersReducedMotion;

  const { user } = useAuth();
  const sync = useSync(user?.id ?? null, t.account.mergeConfirm);

  const entries = useLiveQuery(() => db.entries.orderBy('createdAt').reverse().toArray(), []) ?? NO_ENTRIES;
  const current = useLiveQuery(() => (currentId ? db.entries.get(currentId) : undefined), [currentId]);
  const weekRows = useMemo(() => frequency(entries, 7), [entries]);
  const reminderState = useReminder(reminder, entries, t);

  useEffect(() => {
    document.documentElement.classList.toggle('calm', calm);
  }, [calm]);

  async function handleSubmit(text: string, chips: EmotionLabel[]): Promise<SubmitOutcome> {
    let result: AnalysisResult;
    let notice: string | undefined;
    if (aiEnabled && text) {
      try {
        result = await analyzeWithAI(text, chips);
      } catch {
        result = analyze(text, { chips, language: locale });
        notice = t.app.aiFallback;
      }
    } else {
      result = analyze(text, { chips, language: locale });
    }
    setCrisis(result.crisis);
    if (result.lowConfidence) return { result, notice };

    const id = crypto.randomUUID();
    await addEntry({
      id,
      createdAt: new Date().toISOString(),
      text,
      emotions: result.emotions,
      valence: result.valence,
      confidence: result.confidence,
      userAdjusted: false,
      tags: [],
      analyzerVersion: result.analyzerVersion,
    });
    setCurrentId(id);
    return { result, notice };
  }

  function startNew() {
    setCurrentId(null);
    document.getElementById(FEELING_INPUT_ID)?.focus();
  }

  function checkInFromReminder() {
    reminderState.dismiss();
    setView('today');
    setCurrentId(null);
    // Wait for the Check in view to render before moving focus into it.
    requestAnimationFrame(() => document.getElementById(FEELING_INPUT_ID)?.focus());
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-(--surface) focus:p-3"
      >
        {t.app.skipLink}
      </a>

      <header className="border-b border-(--border) bg-(--surface)">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-lg font-semibold">
            <span aria-hidden="true">🌸 </span>Viz it
          </p>
          <nav aria-label={t.app.navLabel}>
            <ul className="flex gap-2">
              {VIEW_IDS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={view === id ? 'page' : undefined}
                    onClick={() => setView(id)}
                    className={`${toggle(view === id)} px-3 text-sm`}
                  >
                    {t.app.views[id]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="sr-only">{t.app.pageHeading(t.app.views[view])}</h1>
        {crisis && <CrisisBanner onDismiss={() => setCrisis(false)} />}
        {reminderState.due && !(view === 'today' && current) && (
          <ReminderBanner onCheckIn={checkInFromReminder} onDismiss={reminderState.dismiss} />
        )}

        {view === 'today' && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <EntryForm onSubmit={handleSubmit} aiEnabled={aiEnabled} />
              {current ? (
                <ResultPanel key={current.id} entry={current} animate={animate} onNew={startNew} />
              ) : (
                <div
                  className={`${card} flex min-h-64 items-center justify-center border-dashed text-center text-(--muted)`}
                >
                  <p>{t.app.emptyResult}</p>
                </div>
              )}
            </div>
            {entries.length > 0 && (
              <section aria-labelledby="week-heading" className={card}>
                <h2 id="week-heading" className="mb-3 text-xl font-semibold">
                  {t.app.thisWeek}
                </h2>
                <FrequencyChart rows={weekRows} days={7} animate={animate} />
              </section>
            )}
          </div>
        )}

        <Suspense fallback={<p className="text-(--muted)">{t.app.loading}</p>}>
          {view === 'history' && <History entries={entries} animate={animate} />}
          {view === 'settings' && (
            <Settings
              entries={entries}
              calm={calm}
              onCalmChange={setCalm}
              aiEnabled={aiEnabled}
              onAiChange={setAiEnabled}
              reminder={reminder}
              onReminderChange={setReminder}
              user={user}
              sync={sync}
            />
          )}
        </Suspense>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-sm text-(--muted)">{t.app.footer}</footer>

      <Onboarding open={!onboarded} onDone={() => setOnboarded(true)} />
    </>
  );
}
