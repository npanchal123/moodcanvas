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
import type { EmotionEntry, PracticeBefore, PracticeLog } from './lib/types';
import type { PracticeId } from './practices';

// History and Settings (and the Recharts bars) load on first use, keeping the first paint small.
const History = lazy(() => import('./components/History'));
const Settings = lazy(() => import('./components/Settings'));
const Privacy = lazy(() => import('./components/Privacy'));
const PracticeLibrary = lazy(() => import('./components/PracticeLibrary'));
const PracticeSession = lazy(() => import('./components/PracticeSession'));

type View = 'today' | 'practice' | 'history' | 'settings' | 'privacy';
const VIEW_IDS: View[] = ['today', 'practice', 'history', 'settings'];
// The privacy page has its own URL (…/#privacy) so it can be linked to from anywhere.
const PRIVACY_HASH = '#privacy';

const NO_ENTRIES: EmotionEntry[] = [];
const NO_LOGS: PracticeLog[] = [];

export default function App() {
  const { t, locale } = useI18n();
  const [view, setView] = useState<View>(() => (location.hash === PRIVACY_HASH ? 'privacy' : 'today'));
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [crisis, setCrisis] = useState<'detected' | 'asked' | null>(null);
  const [practice, setPractice] = useState<{ id: PracticeId; before?: PracticeBefore } | null>(null);
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
  const logs = useLiveQuery(() => db.practices.orderBy('startedAt').reverse().toArray(), []) ?? NO_LOGS;
  const weekRows = useMemo(() => frequency(entries, 7), [entries]);
  const reminderState = useReminder(reminder, entries, t);

  useEffect(() => {
    document.documentElement.classList.toggle('calm', calm);
  }, [calm]);

  useEffect(() => {
    function onHashChange() {
      if (location.hash === PRIVACY_HASH) {
        setView('privacy');
        window.scrollTo(0, 0);
      } else {
        setView((v) => (v === 'privacy' ? 'today' : v));
      }
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function goTo(id: View) {
    setView(id);
    setPractice(null);
    if (location.hash === PRIVACY_HASH) history.replaceState(null, '', location.pathname + location.search);
  }

  function openPractice(id: PracticeId, before?: PracticeBefore) {
    goTo('practice');
    setPractice({ id, before });
    window.scrollTo(0, 0);
  }

  function showSupport() {
    setCrisis('asked');
    window.scrollTo(0, 0);
    // Move focus to the support lines so keyboard and screen reader users land on them.
    requestAnimationFrame(() => document.getElementById('crisis-heading')?.focus());
  }

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
    setCrisis(result.crisis ? 'detected' : null);
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

  function freshCheckIn() {
    goTo('today');
    setCurrentId(null);
    // Wait for the Check in view to render before moving focus into it.
    requestAnimationFrame(() => document.getElementById(FEELING_INPUT_ID)?.focus());
  }

  function checkInFromReminder() {
    reminderState.dismiss();
    freshCheckIn();
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
            <ul className="flex gap-1.5 sm:gap-2">
              {VIEW_IDS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={view === id ? 'page' : undefined}
                    onClick={() => goTo(id)}
                    className={`${toggle(view === id)} whitespace-nowrap px-2.5 text-sm sm:px-3`}
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
        {crisis && <CrisisBanner reason={crisis} onDismiss={() => setCrisis(null)} />}
        {reminderState.due && !(view === 'today' && current) && (
          <ReminderBanner onCheckIn={checkInFromReminder} onDismiss={reminderState.dismiss} />
        )}

        {view === 'today' && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <EntryForm onSubmit={handleSubmit} aiEnabled={aiEnabled} />
              {current ? (
                <ResultPanel
                  key={current.id}
                  entry={current}
                  animate={animate}
                  onNew={startNew}
                  onPractice={crisis === 'detected' ? undefined : openPractice}
                />
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
          {view === 'practice' &&
            (practice ? (
              <PracticeSession
                key={practice.id}
                practiceId={practice.id}
                before={practice.before}
                animate={animate}
                onBack={() => setPractice(null)}
                onCheckIn={freshCheckIn}
              />
            ) : (
              <PracticeLibrary entries={entries} logs={logs} onOpen={openPractice} />
            ))}
          {view === 'history' && <History entries={entries} logs={logs} animate={animate} />}
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
          {view === 'privacy' && <Privacy />}
        </Suspense>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-2 px-4 pb-8 text-sm text-(--muted)">
        <p>{t.app.footer}</p>
        <nav aria-label={t.app.footerLinks}>
          <ul className="flex flex-wrap gap-x-6">
            <li>
              <a href={PRIVACY_HASH} className="inline-flex min-h-11 items-center font-medium text-(--text) underline">
                {t.app.privacyLink}
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={showSupport}
                className="inline-flex min-h-11 items-center font-medium text-(--text) underline"
              >
                {t.app.supportLink}
              </button>
            </li>
          </ul>
        </nav>
      </footer>

      <Onboarding open={!onboarded && view !== 'privacy'} onDone={() => setOnboarded(true)} />
    </>
  );
}
