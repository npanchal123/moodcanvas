import { useEffect, useState } from 'react';
import type { Messages } from '../i18n/en';
import { dayKey } from './stats';
import type { EmotionEntry } from './types';

export interface ReminderSettings {
  enabled: boolean;
  /** "HH:MM", 24-hour, local time. */
  time: string;
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, time: '20:00' };

export function isReminderSettings(value: unknown): value is ReminderSettings {
  const v = value as ReminderSettings;
  return typeof v?.enabled === 'boolean' && typeof v.time === 'string' && /^\d{2}:\d{2}$/.test(v.time);
}

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Due once the reminder time has passed today, if there's no check-in today and we haven't reminded yet. */
export function isReminderDue(
  settings: ReminderSettings,
  entries: EmotionEntry[],
  lastRemindedDay: string | null,
  now = new Date(),
): boolean {
  if (!settings.enabled) return false;
  const today = dayKey(now);
  if (lastRemindedDay === today) return false;
  if (now.getHours() * 60 + now.getMinutes() < minutesOf(settings.time)) return false;
  return !entries.some((e) => dayKey(new Date(e.createdAt)) === today);
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** iCalendar lines must stay under 75 octets; longer ones continue on lines starting with a space. */
function foldLine(line: string): string {
  const parts: string[] = [];
  let rest = line;
  // 60 characters leaves room for multi-byte letters such as "ñ".
  while (rest.length > 60) {
    parts.push(rest.slice(0, 60));
    rest = rest.slice(60);
  }
  parts.push(rest);
  return parts.join('\r\n ');
}

function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * A daily repeating calendar event with an alert. Calendars deliver it even when
 * Viz it is closed, which a web page can't do on its own without push servers.
 * Uses floating local time, so it stays at the same clock time when travelling.
 */
export function buildReminderIcs(time: string, appUrl: string, t: Messages, now = new Date()): string {
  const [h, m] = time.split(':');
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viz it//Daily reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:daily-check-in@moodcanvas',
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART:${date}T${h}${m}00`,
    'DURATION:PT5M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${icsEscape(t.reminder.icsSummary)}`,
    `DESCRIPTION:${icsEscape(t.reminder.icsDescription(appUrl))}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(t.reminder.icsSummary)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(foldLine)
    .join('\r\n')
    .concat('\r\n');
}

const LAST_REMINDED_KEY = 'moodcanvas.lastReminded';

function readLastReminded(): string | null {
  try {
    return localStorage.getItem(LAST_REMINDED_KEY);
  } catch {
    return null;
  }
}

function writeLastReminded(day: string) {
  try {
    localStorage.setItem(LAST_REMINDED_KEY, day);
  } catch {
    // Storage blocked: the reminder may show again after a reload, which is harmless.
  }
}

async function showSystemNotification(t: Messages): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const options = { body: t.reminder.notificationBody, tag: 'moodcanvas-reminder', icon: `${import.meta.env.BASE_URL}icon-192.png` };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) await registration.showNotification(t.reminder.notificationTitle, options);
    else new Notification(t.reminder.notificationTitle, options);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks once a minute while the app is open. When the tab is in the background,
 * shows a system notification (if allowed); otherwise the caller shows a banner.
 */
export function useReminder(settings: ReminderSettings, entries: EmotionEntry[], t: Messages) {
  const [lastReminded, setLastReminded] = useState(readLastReminded);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!settings.enabled) return;
    const timer = setInterval(() => setNow(new Date()), 60_000);
    const onVisible = () => setNow(new Date());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [settings.enabled]);

  const due = isReminderDue(settings, entries, lastReminded, now);

  const dismiss = () => {
    const today = dayKey(new Date());
    writeLastReminded(today);
    setLastReminded(today);
  };

  useEffect(() => {
    if (!due || document.visibilityState === 'visible') return;
    void showSystemNotification(t).then((shown) => {
      if (shown) {
        const today = dayKey(new Date());
        writeLastReminded(today);
        setLastReminded(today);
      }
    });
  }, [due, now, t]);

  return { due: due && document.visibilityState === 'visible', dismiss };
}
