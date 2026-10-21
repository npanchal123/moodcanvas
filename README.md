# Viz it

**Try it:** https://npanchal123.github.io/vizit/

Viz it teaches guided visualization: a kind of meditation where you use your imagination to change how
you feel. Write how you feel in your own words, and Viz it shows it as an "emotion bloom" picture with an
intensity score from 0 to 100. It then suggests a short guided practice for that feeling, and afterwards shows
how much the feeling changed.

## Guided visualization

- **Practice tab:**
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
- **Before and after:** a practice started from a check-in asks how strong that feeling is afterwards. History
  shows the practice log with each change, such as "Fear / Anxiety: 75 → 40".
- **Safety:** no practice is suggested when the crisis banner is showing. Every practice says you can stop at
  any time.
- **Writing new scripts:** keep step ids, tiers and pauses the same in `en.ts` and `es.ts`. A unit test checks
  this, and that each version leaves at least a third of its time quiet.

### Natural-voice audio (ElevenLabs)

Until recordings exist, practices use the device's built-in voice. To make natural-voice MP3s:

1. Create an ElevenLabs account. The **Starter** plan covers the whole library in one month: about 18,000
   characters for both languages. The free plan has too few characters and no commercial use.
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

- **Unit tests** (`npm test`, Vitest) cover the analyzer in English and Spanish, stats, the calendar, the
  weekly summary, insights, reminders and the sync merge rules.
- **Browser tests** (`npm run test:e2e`, Playwright) run against the production build:
  - an axe accessibility audit (WCAG 2.2 A and AA) of every screen and dialog, in the light, dark and
    high-contrast themes and in Spanish
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

The app speaks English and Spanish. It picks the language from the browser; you can change it in
**Settings → Display and language**.
- **Interface text** lives in `src/i18n/en.ts`. Every other language must match its shape exactly, so a
  missing string is a type error.
- **The word-list analyzer** has one language pack per language in `src/lib/lexicons/`. Each check-in is read
  with every pack, and the pack that understands the most words wins. So English text is still understood
  with the Spanish interface, and the reverse.
- **Crisis phrases** are checked in every language, whatever the interface language is.
- **Adding a language:** copy `es.ts` in both `src/i18n/` and `src/lib/lexicons/`, translate it, and
  register it in `LOCALES` and `LANGUAGE_PACKS`.
- **Review needed:** the Spanish was drafted by AI. Have a native speaker review it before release.

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
- More languages

## Structure

```
server/            Node server: /api/analyze (Claude) and production static hosting
supabase/          database migration and the delete-account Edge Function
e2e/               Playwright browser and axe accessibility tests
src/i18n/          en/es messages, I18nProvider, date formatting
src/lib/           analyzer and lexicons/ (en, es, emoji), aiResult, aiAnalyzer, entries (all writes),
                   db (Dexie v2), sync, syncMerge, account, calendar, reflection, insights, reminders,
                   install, theme, stats, export, tags, helplines
src/components/    EntryForm, ResultPanel, TagEditor, ShareDialog, History, Insights, MoodCalendar,
                   FrequencyChart (+ lazy FrequencyBars), Settings, AccountPanel, DeleteAccountDialog,
                   AiConsentDialog, ReminderBanner, Onboarding, CrisisBanner, Privacy, EmotionBloom,
                   IntensityGauge
public/            icons, favicon, service-worker notification handler
```
