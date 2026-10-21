import { useLiveQuery } from 'dexie-react-hooks';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { CrisisBanner } from './components/CrisisBanner';
import { Onboarding } from './components/Onboarding';
import { ReminderBanner } from './components/ReminderBanner';
import { toggle } from './components/ui';
import { CreatedIntro, EMPTY_DRAFT, FEELING_INPUT_ID, Visualize, type Draft } from './components/Visualize';
import { useI18n } from './i18n';
import { useAuth, useSync } from './lib/account';
import { analyzeWithAI } from './lib/aiAnalyzer';
import { analyze, type AnalysisResult } from './lib/analyzer';
import { compose, TOPIC_TAGS } from './lib/compose';
import { db } from './lib/db';
import { addEntry } from './lib/entries';
import { usePersistentFlag, usePersistentState, usePrefersReducedMotion } from './lib/hooks';
import { DEFAULT_REMINDER, isReminderSettings, useReminder } from './lib/reminders';
import type { EmotionEntry, PracticeBefore, PracticeLog } from './lib/types';
import { LENGTHS, libraryPlayable, type PracticeId, type Playable } from './practices';

// The library, journal, settings and the player load on first use, keeping the first paint small.
const History = lazy(() => import('./components/History'));
const Settings = lazy(() => import('./components/Settings'));
const Privacy = lazy(() => import('./components/Privacy'));
const PracticeLibrary = lazy(() => import('./components/PracticeLibrary'));
const PracticeSession = lazy(() => import('./components/PracticeSession'));

type View = 'today' | 'practice' | 'history' | 'settings' | 'privacy';
const VIEW_IDS: View[] = ['today', 'practice', 'history', 'settings'];
// The privacy page has its own URL (…/#privacy) so it can be linked to from anywhere.
const PRIVACY_HASH = '#privacy';
const HOME_URL = import.meta.env.BASE_URL;

const NO_ENTRIES: EmotionEntry[] = [];
const NO_LOGS: PracticeLog[] = [];

interface ActivePractice {
  playable: Playable;
  before?: PracticeBefore;
  intro?: ReactNode;
}

export default function App() {
  const { t, locale } = useI18n();
  const [view, setView] = useState<View>(() => (location.hash === PRIVACY_HASH ? 'privacy' : 'today'));
  const [crisis, setCrisis] = useState<'detected' | 'asked' | null>(null);
  const [practice, setPractice] = useState<ActivePractice | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [calm, setCalm] = usePersistentFlag('moodcanvas.calmMode', false);
  const [onboarded, setOnboarded] = usePersistentFlag('moodcanvas.onboarded', false);
  const [aiEnabled, setAiEnabled] = usePersistentFlag('moodcanvas.aiAnalysis', false);
  const [reminder, setReminder] = usePersistentState('moodcanvas.reminder', DEFAULT_REMINDER, isReminderSettings);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = !calm && !prefersReducedMotion;

  const { user } = useAuth();
  const sync = useSync(user?.id ?? null, t.account.mergeConfirm);

  const entries = useLiveQuery(() => db.entries.orderBy('createdAt').reverse().toArray(), []) ?? NO_ENTRIES;
  const logs = useLiveQuery(() => db.practices.orderBy('startedAt').reverse().toArray(), []) ?? NO_LOGS;
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

  function openLibraryPractice(id: PracticeId, before?: PracticeBefore) {
    goTo('practice');
    setPractice({ playable: libraryPlayable(id, locale), before });
    window.scrollTo(0, 0);
  }

  function showSupport() {
    setCrisis('asked');
    window.scrollTo(0, 0);
    // Move focus to the support lines so keyboard and screen reader users land on them.
    requestAnimationFrame(() => document.getElementById('crisis-heading')?.focus());
  }

  /** Reads the feeling, writes a visualization from the person's words, and opens it ready to begin. */
  async function handleCreate() {
    const text = draft.text.trim();
    let result: AnalysisResult | null = null;
    let notice: string | undefined;
    if (text) {
      if (aiEnabled) {
        try {
          result = await analyzeWithAI(text, []);
        } catch {
          result = analyze(text, { language: locale });
          notice = t.app.aiFallback;
        }
      } else {
        result = analyze(text, { language: locale });
      }
    }
    // Someone who may be in danger gets support first, not a meditation.
    if (result?.crisis) {
      setCrisis('detected');
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.getElementById('crisis-heading')?.focus());
      return;
    }
    setCrisis(null);

    // Any feeling word counts here: describing a place adds many words that aren't feelings, which would
    // otherwise make a clear "anxious" look like a low-confidence reading.
    const feeling = result?.emotions[0];
    const composed = compose(
      { text, locale, feeling: feeling?.label ?? null, scene: draft.scene, goal: draft.goal },
      t,
    );

    let before: PracticeBefore | undefined;
    if (result && feeling) {
      const id = crypto.randomUUID();
      const tag = composed.topic ? TOPIC_TAGS[composed.topic] : undefined;
      await addEntry({
        id,
        createdAt: new Date().toISOString(),
        text,
        emotions: result.emotions,
        valence: result.valence,
        confidence: result.confidence,
        userAdjusted: false,
        tags: tag ? [tag] : [],
        analyzerVersion: result.analyzerVersion,
      });
      before = { entryId: id, emotion: feeling.label, intensity: feeling.intensity };
    }

    setPractice({
      playable: { id: 'custom', icon: composed.icon, hues: composed.hues, lengths: LENGTHS, script: composed.script },
      before,
      intro: (
        <>
          <CreatedIntro text={text} result={result} composed={composed} />
          {notice && <p className="text-sm text-(--muted)">{notice}</p>}
        </>
      ),
    });
    window.scrollTo(0, 0);
  }

  function newVisualization() {
    goTo('today');
    setDraft(EMPTY_DRAFT);
    // Wait for the form to render before moving focus into it.
    requestAnimationFrame(() => document.getElementById(FEELING_INPUT_ID)?.focus());
  }

  function checkInFromReminder() {
    reminderState.dismiss();
    newVisualization();
  }

  const session = practice && (
    <PracticeSession
      key={practice.playable.script.title}
      practice={practice.playable}
      before={practice.before}
      intro={practice.intro}
      animate={animate}
      onBack={() => setPractice(null)}
      onCheckIn={newVisualization}
    />
  );

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
            {/* A real link, so it also works opened in a new tab; a normal click stays in the app. */}
            <a
              href={HOME_URL}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                goTo('today');
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center gap-2 rounded font-bold tracking-tight no-underline"
            >
              <img src={`${HOME_URL}logo-mark.png`} alt="" width={49} height={44} className="h-11 w-auto" />
              <span>
                Viz<span className="text-(--brand)">It</span>
              </span>
            </a>
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
        {reminderState.due && !practice && (
          <ReminderBanner onCheckIn={checkInFromReminder} onDismiss={reminderState.dismiss} />
        )}

        <Suspense fallback={<p className="text-(--muted)">{t.app.loading}</p>}>
          {view === 'today' &&
            (session ?? (
              <Visualize
                draft={draft}
                onDraftChange={setDraft}
                onCreate={handleCreate}
                aiEnabled={aiEnabled}
                onFirstPractice={() => openLibraryPractice('first-visualization')}
                onLearn={() => goTo('practice')}
              />
            ))}
          {view === 'practice' &&
            (session ?? <PracticeLibrary entries={entries} logs={logs} onOpen={openLibraryPractice} />)}
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
