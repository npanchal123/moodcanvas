# Viz it

**Try it:** https://npanchal123.github.io/vizit/

Viz it makes guided visualization easy. Visualization is a kind of meditation where you use your imagination
to change how you feel.
1. Write what's on your mind and what you'd like to imagine, for example: "I'm anxious about my exam tomorrow.
   Take me to my grandma's garden in Shimla."
2. Viz it instantly writes a guided visualization made from those words.
3. A calm voice walks you through it.
4. Afterwards, Viz it shows how much the feeling changed.

## Visualizations made from your words (the front page)

The composer is in `src/lib/compose/`. It runs instantly and offline on the device, with no AI and no cost.
- **What it reads from the text:**
  - **Feeling:** from the word-list analyzer, for example anxious, sad or angry.
  - **Place:** in the person's own words, from phrases like "take me to …", "I want to be at …", "… ले चलो" or
    "llévame a …". It's spoken back with "my" turned into "your".
  - **Goal:** calm down, let go, comfort, sleep, confidence, energy, savor joy or focus.
  - **Topic:** exam, work, relationship, family, friends, health, money, future or exercise.
  - Keywords from every language are checked, so Hinglish works with the English interface. The script is
    always written in the interface language.
- **The person can also pick a place and a goal** from the buttons. Their choice wins over what was read.
- **How the script is built:**
  1. A line that reflects back what they said ("You told me you're feeling anxious about the exam…")
  2. Settling in and breathing
  3. Arriving at the place: one of 9 scenes, or any place they named
  4. The goal's technique, personalized with their topic ("If a thought about the exam drifts in, let a wave
     carry it away")
  5. A closing that returns them to the room
- **Defaults** when nothing is said:
  - The feeling picks the goal: anxious → calm down, sad → comfort, angry → let go.
  - The goal picks the scene: calm down → beach, let go → river, sleep → starry night.
- **Lengths:** lines are tiered like the library practices, so every visualization plays at 3, 5 or 10 minutes.
- **Tests:** `compose.test.ts` checks real requests in every language. It also checks that every
  combination of scene, goal, language and length is complete and leaves at least a third of its time quiet.
- **Adding a scene or goal:** add its lines to every language file in `src/lib/compose/`. Write lines
  that work alongside any other scene or goal, and use only the `{place}`, `{topic}` and `{carrier}` tokens.
- **Journal tags:** the check-in is saved with a tag for its topic, so Journal insights keep working.

## Procrastination Breaker (the "Unstuck" tab)

Helps someone go from putting a task off to taking one small, real step. The principle: don't wait for
motivation; make starting easier.

- **The flow:** six short steps, each of which can be revisited without losing answers.
  1. **Task:** the task, in the person's own words.
  2. **Obstacle:** one or more of 12 self-reported reasons, such as "the task feels too big" or "I'm distracted
     by my phone".
  3. **Why:** an optional reason and imagined outcome. The reason given last time for the same task is filled in.
  4. **First step:** a tiny step that fits both the kind of task and the obstacle. It can be edited, swapped or
     made smaller.
  5. **Plan:** an optional if–then plan, picked from suggestions or written freely.
  6. **Start:** a focus timer of 2 (the default), 10, 25 or 1–120 minutes.
- **Suggestions (`src/lib/breaker/`):** rule-based, on the device. Keywords in any of the nine languages sort
  the task into one of nine kinds: code, job, exercise, business, writing, study, cleaning, admin, or general.
  Each kind has concrete steps, a two-minute starter, a "just get set up" step and a rough-draft version. The
  obstacle decides which comes first: a too-big task gets the two-minute starter, perfectionism gets the rough
  draft, and "don't know where to start" shows the steps in order.
- **Timer:** worked out from saved timestamps, so it keeps counting when someone switches tabs, and survives a
  reload. When time runs out unattended, only the planned minutes count as focus.
- **Reflection:** the person records what happened: done, some progress, still too hard, interrupted, or
  rescheduled (with a date). Each answer leads to a fitting next step, such as the next step in the list, a
  smaller step, another session, or "pick up where you left off". Finishing the starter step never marks the
  whole task done.
- **My progress:** saved sessions with filters, details, "pick this up again" and delete. Four counts come
  straight from saved, finished sessions: sessions, actions completed, focus time, and tasks picked up after
  rescheduling. There are no streaks or badges.
- **Storage:** sessions live in the `breakerSessions` table of the device's IndexedDB, like the practice log.
  They aren't synced to accounts, and "Delete all my data" removes them. Syncing them would need a Supabase
  table with row-level security, like `0001_entries.sql`.
- **AI:** none. The optional Claude analysis needs the `/api/analyze` server, which the GitHub Pages site doesn't
  have, so this feature uses rules only. Adding AI suggestions later would need a similar server endpoint.
- **Tests:** `src/lib/breaker/breaker.test.ts` and `e2e/breaker.spec.ts`. The browser tests cover the full flow,
  pause and resume, reloading mid-session, rescheduling and picking a task up again, Hindi, and accessibility in
  light and dark themes.

## Guided visualization library

- **Library tab:**
  - Five short lessons for complete beginners: what visualization is, what to do if you can't "see" pictures,
    how to start, wandering minds, and staying safe.
  - "Your first visualization," a 3-minute exercise imagining a lemon.
  - The full library.
- **Practices matched to feelings** (`src/practices/`):

  | Feeling | Practice |
  |---|---|
  | Fear / anxiety | 🏝️ Safe Place |
  | Sadness | 🕯️ Warm Light |
  | Anger, disgust | 🍃 Cooling Stream |
  | Joy | 🌼 Savoring |
  | Calm | 🌳 Grounding Tree |
  | Surprise / overwhelm | ☁️ Clear Sky |

  Each comes in 3, 5 and 10 minute versions. Longer versions add steps, and the silences between steps stretch
  so the session lasts the chosen length (`src/lib/session.ts`).
- **The player** (`src/components/PracticeSession.tsx`):
  - a voice guide with captions
  - a breathing orb (4 s in, 6 s out)
  - a soft generated ocean sound
  - pause and end buttons
  - keeps the screen awake during a session
- **Before and after:** when the person's words showed a feeling, the practice asks how strong that feeling is
  afterwards. The Journal shows the practice log with each change, such as "Fear / Anxiety: 75 → 40".
- **Safety:** when someone writes something worrying, the app shows support lines instead of creating a
  visualization. Every practice says you can stop at any time.
- **Writing new scripts:** keep step ids, tiers and pauses the same in `en.ts`, `hi.ts` and `es.ts`. A unit
  test checks this, and that each version leaves at least a third of its time quiet.

### Voices

**Today (free):** practices are spoken by the device's own text-to-speech voice. Most phones include English
and Hindi voices: Google's voices on Android, and "Lekha" for Hindi on iPhone. Some devices have no voice for
the chosen language, such as this Windows test machine for Hindi. In that case the session says so, explains
how to add a voice, and continues with on-screen captions instead of reading Hindi in an English accent.

### Natural-voice audio (ElevenLabs, optional and paid)

This is ready for later; nothing needs it today. To make natural-voice MP3s:

1. Create an ElevenLabs account. The **Starter** plan covers the whole library in about one month: roughly
   26,000 characters for English, Hindi and Spanish together, or `--locale` one language at a time. The free
   plan has too few characters and no commercial use.
2. Put `ELEVENLABS_API_KEY` in `.env`, then run `npm run audio -- --voices` and pick a calm, warm voice.
   Put its id in `.env` as `ELEVENLABS_VOICE_ID`.
3. Run `npm run audio -- --dry-run` to see what will be generated, then `npm run audio`. Add `--locale en`
   to do one language at a time.
4. Commit `public/audio/`. The app switches to the recordings automatically, and only for steps whose words
   match a recording exactly.

How the audio files work:
- Each file name includes a hash of its step's words. After you edit a script, `npm run audio` regenerates
  only the steps that changed and deletes the old files.
- The key never leaves your computer.
- Recordings are cached the first time they play, so a practice works offline after one use.

The app is local-first: by default everything stays in the browser's IndexedDB. Two features are optional,
and each one is off until you set it up:
- **Smarter analysis:** an AI reading of each check-in by Claude.
- **Accounts and sync:** back up check-ins and see them on other devices, through Supabase.

## Run it

```bash
npm install
npm run dev        # the app, at http://localhost:5173
npm run dev:api    # optional: the smarter-analysis server, at :8787 (Vite proxies /api to it)
npm test           # unit tests
npm run lint       # ESLint, including jsx-a11y
npm run build      # type-check and production build
npm run test:e2e   # after a build: browser tests and axe accessibility checks
npm start          # production: serves dist/ and /api from one Node process (needs Node 22.18 or newer)
npm run audio      # optional: natural-voice audio for practices (see below)
```

Copy `.env.example` to `.env` to turn on the optional features.

### Tests and CI

- **Unit tests** (`npm test`, Vitest) cover:
  - the analyzer in English, Hindi/Hinglish and Spanish
  - stats, the calendar, the weekly summary and insights
  - reminders and the sync merge rules
  - practice timing and scripts
- **Browser tests** (`npm run test:e2e`, Playwright) run against the production build:
  - an axe accessibility audit (WCAG 2.2 A and AA) of every screen and dialog, in the light, dark and
    high-contrast themes and in Hindi and Spanish
  - feature tests for insights, reminders, the calendar file, theme and language switching, and working
    offline
- **CI:** `.github/workflows/ci.yml` runs lint, unit tests, build and browser tests on every push and pull
  request. It needs the project to be in a GitHub repository.

Locally, Playwright uses your installed Chrome. CI installs Chromium itself.

### Hosting (GitHub Pages)

Every push to `main` that passes CI is published to `https://<user>.github.io/<repo>/` by the `deploy` job
in `ci.yml`. It builds with `BASE_PATH=/<repo>/`, so all URLs, the manifest and the service worker live
under that folder.
- **One-time setup:** in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
- **Smarter analysis** needs the Node server, which Pages can't run, so the hosted app always uses the word
  list.
- **Sync:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Secrets and variables →
  Actions → Variables** to turn it on. Then add the Pages URL as a Supabase redirect URL.

### Languages

The app speaks nine languages: English, Hindi (हिन्दी), Spanish, Chinese (中文, Simplified), Arabic (العربية),
French, Bengali (বাংলা), Portuguese (Brazilian) and Russian. It picks the first one the browser prefers; you can
change it in **Settings → Display and language**.
- **Interface text** lives in `src/i18n/en.ts`. Every other language must match its shape exactly, so a
  missing string is a type error. Practice scripts and lessons are in `src/practices/`.
- **The word-list analyzer** has one language pack per language in `src/lib/lexicons/`. Each check-in is read
  with every pack, and the pack that understands the most words wins, so any language works with any
  interface language.
- **Hindi pack** (`hi.ts`):
  - Reads Devanagari and romanized Hinglish, and includes the English list, so mixed sentences like "aaj
    bahut tension hai" or "main bahut happy hoon" work.
  - Spellings with and without the nukta dot (ज़्यादा / ज्यादा) both match.
  - Feminine endings map to the base word (अकेली → अकेला).
  - "Not" can come after the word ("खुश नहीं", "khush nahi").
  - Accent stripping applies only to Latin letters, so Devanagari vowel signs are kept.
- **Other packs:**
  - Chinese has no spaces, so its pack splits text by taking the longest dictionary word at each point
    ("我不开心" → 我 / 不 / 开心).
  - Arabic drops vowel marks, unifies alef, ya and ta marbuta spellings, and strips "and", "the" and endings
    joined onto words ("والقلق" → قلق).
  - Russian keys are stems, tried with up to four letters dropped ("грустная" → груст).
  - Bengali, like Hindi, reads "not" after the word ("খুশি না").
- **Gender:** French, Portuguese and Russian address the reader politely (vous, você, вы) and avoid words that
  change with the reader's gender. Arabic practices are spoken as "let's…" for the same reason; some Arabic
  interface text still uses the masculine "you", as most Arabic apps do.
- **Arabic** is shown right to left (`dir="rtl"`), so layouts use start/end rather than left/right.
- **Crisis phrases** are checked in every language, whatever the interface language is, including Hindi and
  Hinglish.
- **Adding a language:** copy `es.ts` in `src/i18n/`, `src/lib/lexicons/` and `src/practices/`, translate it,
  and register it in `LOCALES`, `LANGUAGE_PACKS` and `PRACTICE_CONTENT`.
- **Review needed:** every language except English was drafted by AI. Have native speakers review them before
  release, especially the Arabic, Bengali and Chinese.

### Installing and offline use

`vite-plugin-pwa` generates the manifest and a service worker that precaches the whole app. Once loaded, the
app works offline because your data is already on the device. Smarter analysis falls back to the word list
when offline. Settings shows an **Install** button when the browser offers one, and instructions for
iPhone/iPad.

### Reminders

A web page can't wake itself up when it's closed unless you run a push server. Viz it offers two kinds of
reminder instead:
1. **While the app is open or installed:** at your chosen time, if you haven't checked in today, you get a
   gentle banner. If the tab is in the background and notifications are allowed, you get a system
   notification instead. Notification permission is only requested when you turn reminders on.
2. **Always:** "Add a daily reminder to my calendar" downloads an `.ics` file with a daily repeating event
   and an alert. Your calendar app delivers it even when Viz it is closed.

Real push notifications (Web Push with VAPID keys and a scheduled sender) would be a later addition.

### Smarter analysis (Claude)

1. Give the server credentials. Either set `ANTHROPIC_API_KEY` in `.env`, or run `ant auth login`; the SDK
   finds that login on its own.
2. Run `npm run dev:api`.
3. In the app, go to **Settings → Smarter analysis**. Turning it on shows a consent screen that explains
   exactly what is sent.

How it works:
- The server is `server/index.ts`. It sends only the text the user typed to `claude-opus-5-5` at `low`
  effort, and asks for structured JSON back.
- `fallbacks: "default"` is enabled, so if the model declines a request it is retried on Anthropic's
  recommended fallback model.
- The model's output is validated by `src/lib/aiResult.ts` on both the server and the browser.
- The server rate-limits each IP, never logs what users wrote, and returns `503` when it can't help.
- When the server can't help, the app falls back to the built-in word list and tells the user.

### Accounts and sync (Supabase)

1. Create a Supabase project. Run `supabase/migrations/0001_entries.sql` in its SQL editor.
2. Put the project URL and anon key in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. In Supabase, go to **Authentication → URL configuration** and add your site URL (for example
   `http://localhost:5173`) as a redirect URL.
4. Users sign in from **Settings → Account and sync** with an emailed link. No password is needed.

How sync works (`src/lib/sync.ts`; the merge rules are in `src/lib/syncMerge.ts` and are unit-tested):
- **Order:** each sync pulls first, then pushes. It runs when someone signs in, about 1.5 s after any local
  change, and whenever the browser comes back online or the tab is reopened.
- **Conflicts:** the newest `updated_at` wins. A deletion on any device always wins. The server sets
  `synced_at` on every write, and devices pull whatever changed since their last pull, re-reading a 10 s
  overlap so rows written at the same moment aren't missed.
- **What you wrote stays on the device** unless the user turns on "Sync what I wrote". Turning that setting
  on or off re-uploads every entry so the server copy gains or drops the text.
- **Security:** row-level security means each user can only read or change their own rows.
- **Switching accounts:** if a different account signs in on the same device, the app asks before merging
  that device's existing entries into the new account.

**Account deletion** needs one extra step. Deploy the Edge Function with
`supabase functions deploy delete-account`. It reads the user from their verified access token and deletes
that account with the service-role key, which never reaches the browser. Their synced entries are deleted
along with it (`ON DELETE CASCADE`). In the app, **Settings → Account and sync → Delete my account…** also
lets the user choose whether to keep a local-only copy on the device.

## How text becomes a visual

The built-in word-list analyzer is `src/lib/analyzer.ts`. It:
1. Looks up each word in a small emotion word list (lexicon).
2. Adjusts for negation ("not happy"), intensifiers ("really") and softeners ("kind of").
3. Adjusts for exclamation marks and ALL CAPS.
4. Converts the totals to 0–100 scores.
5. Keeps the strongest emotion, plus up to two more that score 30 or higher.

Smarter analysis returns the same shape of result, so everything after this step is the same for both.

| Picture | Meaning |
|---|---|
| Petal color | The emotion |
| Petal size and fill strength | How intense it is |
| Rounded petals | A pleasant feeling |
| Pointed petals | An unpleasant feeling |
| Center texture | The emotion again, so the bloom still reads without color |
| Inner petals | The secondary emotion |

The emotion colors were checked with a palette validator in both light and dark mode: lightness band, chroma,
colour-blind separation and 3:1 contrast. A few pairs are close for colour-blind readers, so color never
appears without an icon, label or pattern.

## Features by phase

**Phase 1:**
- Text and quick-pick emotion input
- Bloom picture, intensity gauge, and 7/30-day frequency chart (with a table view)
- "Feels off?" self-rating
- On-device storage with CSV/JSON export and delete
- Onboarding, calm mode, and a crisis-support banner

**Phase 2:**
- **Tags:** suggested and custom tags on each check-in, and a tag filter in History.
- **Mood calendar:** five weeks of days, each showing its most common feeling. Deeper color means stronger.
  It's built as an accessible table with a text description for every day.
- **Your week:** a short summary of the week, written on the device.
- **Share cards:** choose what goes on the image (name, score, date, your words) before saving or sharing.
- **Smarter analysis:** opt in with consent, with an automatic fallback to the word list.
- **Accounts and sync:** magic-link sign-in and local-first sync, with your words kept on the device by
  default.

**Phase 3:**
- **Insights:** tags that go with lighter or heavier check-ins, or with one feeling most of the time. Uses
  the last 30 days and needs at least 3 check-ins on each side of a comparison. The app always says these are
  patterns, not causes.
- **Reminders:** an in-app banner or system notification, plus a calendar file that works even when the app
  is closed.
- **High-contrast theme and Spanish:** themes are Match my device, Light, Dark and High contrast. There's
  also support for Windows forced-colors mode, and the full interface and word list are available in
  Spanish.
- **Installable offline app (PWA).**
- **Automated accessibility tests (axe) and a CI workflow.**
- **Code splitting:** History, Settings and Recharts load when first needed. The first load went from 228 kB
  to 131 kB gzipped.
- **Account deletion:** through a Supabase Edge Function.
- **Re-scoring older check-ins:** Settings → Your data offers to re-read check-ins saved by an older word list
  (`src/lib/rescore.ts`). Your own ratings and tags are kept. Re-scoring skips:
  - check-ins read by smarter analysis
  - check-ins with no text
  - feelings picked from the list

**Phase 4: visualization first (October 2026):**
- The front page is now the visualization maker. Guided visualizations come in English, Hindi and Spanish,
  and from late October 2026 also in Chinese, Arabic, French, Bengali, Portuguese and Russian.
- The Library holds the ready-made practices, and the Journal (formerly History) the patterns and the practice
  log.
- Removed with the old check-in screen:
  - the quick-pick emotion buttons
  - the "Feels off?" rating
  - the tag editor (tags now come from the topic)
  - share cards
  - the weekly chart on the front page (it's still in the Journal)

**Before sharing widely:**
- **Privacy page:** at `…/#privacy`, linked from the footer of every page and from Settings → Your data
  (`src/components/Privacy.tsx`; the text is in `src/i18n`). If you change what the app collects, change this
  page and its `LAST_UPDATED` date too.
- **Crisis support lines:** when someone writes something worrying, or presses "Get support now" in the
  footer, the banner shows the helpline and emergency number for their country, as tap-to-call links.
  - The country is guessed from the device's time zone, then its language settings.
  - Covered: India, the US, Canada, the UK, Ireland, Australia, Spain and Mexico. Every country is listed
    under "Support lines in other countries", and findahelpline.com covers the rest.
  - The numbers in `src/lib/helplines.ts` were verified in October 2026. Re-check them before each release.

**Ideas for later:**
- Real push notifications
- An educator or group mode with anonymized totals
- More languages (Indonesian, Urdu, Japanese, German, and Indian languages such as Marathi, Tamil and Telugu)
- Loading only the chosen language, to make the first visit smaller

## Structure

```
server/            Node server: /api/analyze (Claude) and production static hosting
supabase/          database migration and the delete-account Edge Function
e2e/               Playwright browser and axe accessibility tests
src/i18n/          en/hi/es messages, I18nProvider, date formatting
src/practices/     the library: scripts and beginner lessons in en/hi/es
src/lib/compose/   the visualization composer: scenes, goals and topics in en/hi/es
src/lib/           analyzer and lexicons/ (en, hi, es, emoji), aiResult, aiAnalyzer, entries (all writes),
                   db (Dexie v3), session (timing), audio (voices and sound), sync, syncMerge, account,
                   calendar, reflection, insights, reminders, install, theme, stats, export, tags, helplines
src/components/    Visualize (front page), PracticeSession (player), PracticeLibrary, History (Journal),
                   Insights, MoodCalendar, FrequencyChart (+ lazy FrequencyBars), Settings, AccountPanel,
                   DeleteAccountDialog, AiConsentDialog, ReminderBanner, Onboarding, CrisisBanner, Privacy,
                   EmotionBloom
public/            icons, favicon, service-worker notification handler
```
