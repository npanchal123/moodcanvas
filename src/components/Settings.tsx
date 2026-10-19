import type { User } from '@supabase/supabase-js';
import { useMemo, useState } from 'react';
import { LOCALES, useI18n, type Locale } from '../i18n';
import type { SyncState } from '../lib/account';
import { applyAnalyses, deleteAllEntries } from '../lib/entries';
import { needsRescore, rescore } from '../lib/rescore';
import { downloadBlob, entriesToCsv, entriesToJson } from '../lib/export';
import { useInstall } from '../lib/install';
import { buildReminderIcs, type ReminderSettings } from '../lib/reminders';
import { THEMES, useTheme } from '../lib/theme';
import type { EmotionEntry } from '../lib/types';
import { AccountPanel } from './AccountPanel';
import { AiConsentDialog } from './AiConsentDialog';
import { btnGhost, btnPrimary, btnSecondary, card, checkbox } from './ui';

interface Props {
  entries: EmotionEntry[];
  calm: boolean;
  onCalmChange: (calm: boolean) => void;
  aiEnabled: boolean;
  onAiChange: (enabled: boolean) => void;
  reminder: ReminderSettings;
  onReminderChange: (reminder: ReminderSettings) => void;
  user: User | null;
  sync: SyncState & { syncNow: () => Promise<void> };
}

const fieldClass = 'min-h-11 rounded-xl border border-(--border) bg-(--surface) px-3';

function notificationPermission(): NotificationPermission | 'unsupported' {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

/** Default export so App can load it lazily. */
export default function Settings(props: Props) {
  const { entries, calm, onCalmChange, aiEnabled, onAiChange, reminder, onReminderChange, user, sync } = props;
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const install = useInstall();
  const [askingConsent, setAskingConsent] = useState(false);
  const [includeText, setIncludeText] = useState(false);
  const [permission, setPermission] = useState(notificationPermission);
  const [rescoreStatus, setRescoreStatus] = useState('');
  const staleCount = useMemo(() => entries.filter(needsRescore).length, [entries]);

  function exportFile(kind: 'csv' | 'json') {
    const content = kind === 'csv' ? entriesToCsv(entries, includeText) : entriesToJson(entries, includeText);
    const type = kind === 'csv' ? 'text/csv' : 'application/json';
    downloadBlob(new Blob([content], { type }), `vizit-export.${kind}`);
  }

  async function handleRescore() {
    const updates = rescore(entries, locale);
    await applyAnalyses(updates);
    setRescoreStatus(updates.length ? t.settings.rescoreDone(updates.length) : t.settings.rescoreNone);
  }

  async function handleDeleteAll() {
    if (window.confirm(t.settings.deleteAllConfirm(user != null))) await deleteAllEntries();
  }

  async function toggleReminder(enabled: boolean) {
    onReminderChange({ ...reminder, enabled });
    // Ask for notification permission only in response to this click, never on page load.
    if (enabled && permission === 'default') setPermission(await Notification.requestPermission());
  }

  function downloadCalendar() {
    const ics = buildReminderIcs(reminder.time, window.location.origin + import.meta.env.BASE_URL, t);
    downloadBlob(new Blob([ics], { type: 'text/calendar' }), 'vizit-reminder.ics');
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="display-heading" className={`${card} flex flex-col gap-4`}>
        <h2 id="display-heading" className="text-xl font-semibold">
          {t.settings.displayHeading}
        </h2>

        <fieldset>
          <legend className="mb-2 font-medium">{t.settings.themeLabel}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {THEMES.map((value) => (
              <label key={value} className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => setTheme(value)}
                  className={checkbox}
                />
                {t.settings.themes[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor="language" className="font-medium">
            {t.settings.languageLabel}
          </label>
          <select
            id="language"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-describedby="language-hint"
            className={`${fieldClass} self-start`}
          >
            {(Object.keys(LOCALES) as Locale[]).map((code) => (
              <option key={code} value={code} lang={LOCALES[code].htmlLang}>
                {LOCALES[code].languageName}
              </option>
            ))}
          </select>
          <p id="language-hint" className="text-sm text-(--muted)">
            {t.settings.languageHint}
          </p>
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={calm}
            onChange={(e) => onCalmChange(e.target.checked)}
            className={`${checkbox} mt-1`}
            aria-describedby="calm-hint"
          />
          <span>
            <span className="font-medium">{t.settings.calmTitle}</span>
            <span id="calm-hint" className="block text-sm text-(--muted)">
              {t.settings.calmHint}
            </span>
          </span>
        </label>
      </section>

      <section aria-labelledby="ai-heading" className={`${card} flex flex-col gap-3`}>
        <h2 id="ai-heading" className="text-xl font-semibold">
          {t.settings.aiHeading}
        </h2>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => (e.target.checked ? setAskingConsent(true) : onAiChange(false))}
            className={`${checkbox} mt-1`}
            aria-describedby="ai-hint"
          />
          <span>
            <span className="font-medium">{t.settings.aiTitle}</span>
            <span id="ai-hint" className="block text-sm text-(--muted)">
              {t.settings.aiHint}
            </span>
          </span>
        </label>
        <AiConsentDialog
          open={askingConsent}
          onAnswer={(agreed) => {
            setAskingConsent(false);
            if (agreed) onAiChange(true);
          }}
        />
      </section>

      <section aria-labelledby="reminders-heading" className={`${card} flex flex-col gap-3`}>
        <h2 id="reminders-heading" className="text-xl font-semibold">
          {t.settings.remindersHeading}
        </h2>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={reminder.enabled}
            onChange={(e) => void toggleReminder(e.target.checked)}
            className={`${checkbox} mt-1`}
            aria-describedby="reminder-hint"
          />
          <span className="font-medium">{t.settings.reminderTitle}</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="reminder-time" className="font-medium">
            {t.settings.reminderTime}
          </label>
          <input
            id="reminder-time"
            type="time"
            value={reminder.time}
            onChange={(e) => e.target.value && onReminderChange({ ...reminder, time: e.target.value })}
            className={fieldClass}
          />
        </div>
        <p id="reminder-hint" className="text-sm text-(--muted)">
          {t.settings.reminderHint}
        </p>
        {reminder.enabled && permission === 'denied' && (
          <p className="rounded-lg bg-(--surface-alt) p-3 text-sm">{t.settings.reminderBlocked}</p>
        )}
        <button type="button" onClick={downloadCalendar} className={`${btnSecondary} self-start`}>
          {t.settings.reminderCalendar}
        </button>
      </section>

      <section aria-labelledby="install-heading" className={`${card} flex flex-col gap-3`}>
        <h2 id="install-heading" className="text-xl font-semibold">
          {t.settings.installHeading}
        </h2>
        {install.state === 'installed' ? (
          <p>{t.settings.installDone}</p>
        ) : (
          <>
            <p className="text-sm text-(--muted)">{t.settings.installHint}</p>
            {install.state === 'available' && (
              <button type="button" onClick={() => void install.install()} className={`${btnPrimary} self-start`}>
                {t.settings.installButton}
              </button>
            )}
            {install.state === 'ios' && <p>{t.settings.installIos}</p>}
            {install.state === 'unavailable' && <p className="text-sm">{t.settings.installUnavailable}</p>}
          </>
        )}
      </section>

      <section aria-labelledby="account-heading" className={`${card} flex flex-col gap-3`}>
        <h2 id="account-heading" className="text-xl font-semibold">
          {t.settings.accountHeading}
        </h2>
        <AccountPanel user={user} sync={sync} />
      </section>

      <section aria-labelledby="data-heading" className={`${card} flex flex-col gap-4`}>
        <h2 id="data-heading" className="text-xl font-semibold">
          {t.settings.dataHeading}
        </h2>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={includeText}
            onChange={(e) => setIncludeText(e.target.checked)}
            className={checkbox}
          />
          {t.settings.includeText}
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportFile('csv')} disabled={!entries.length} className={btnSecondary}>
            {t.settings.exportCsv}
          </button>
          <button type="button" onClick={() => exportFile('json')} disabled={!entries.length} className={btnSecondary}>
            {t.settings.exportJson}
          </button>
          <button
            type="button"
            onClick={() => void handleDeleteAll()}
            disabled={!entries.length}
            className={`${btnGhost} text-(--danger)`}
          >
            {t.settings.deleteAll}
          </button>
        </div>
        <a href="#privacy" className="inline-flex min-h-11 items-center self-start font-medium underline">
          {t.settings.privacyLink}
        </a>

        {(staleCount > 0 || rescoreStatus) && (
          <div className="flex flex-col gap-2 rounded-xl bg-(--surface-alt) p-4">
            <p className="font-medium">{t.settings.rescoreTitle}</p>
            {staleCount > 0 && (
              <>
                <p className="text-sm">{t.settings.rescoreHint(staleCount)}</p>
                <button type="button" onClick={() => void handleRescore()} className={`${btnSecondary} self-start`}>
                  {t.settings.rescoreButton}
                </button>
              </>
            )}
            <p role="status" className="text-sm text-(--muted)">
              {rescoreStatus}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
