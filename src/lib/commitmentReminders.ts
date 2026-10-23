import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import type { Messages } from '../i18n/en';
import { db } from './db';
import { foldLine, icsEscape, icsStamp } from './reminders';
import type { Commitment } from './types';

const pad = (n: number) => String(n).padStart(2, '0');
const dateOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const minutesOf = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

/**
 * Today's commitments whose reminder time has come and that haven't been reminded yet. Finished or skipped ones
 * stay quiet: there's nothing left to remind about. Earliest first.
 */
export function dueCommitments(commitments: Commitment[], now = new Date()): Commitment[] {
  const today = dateOf(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  return commitments
    .filter(
      (c) =>
        c.date === today &&
        c.remindAt != null &&
        isTime(c.remindAt) &&
        !c.remindedAt &&
        c.status !== 'done' &&
        c.status !== 'skipped' &&
        minutesOf(c.remindAt) <= minute,
    )
    .sort((a, b) => a.remindAt!.localeCompare(b.remindAt!));
}

/** A time a few minutes from now, as "HH:MM", kept within today. */
export function later(minutes: number, now = new Date()): string {
  const total = Math.min(23 * 60 + 59, now.getHours() * 60 + now.getMinutes() + minutes);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** Sets (or, with null, removes) a commitment's reminder. Changing the time lets it remind again. */
export async function setCommitmentReminder(id: string, time: string | null): Promise<void> {
  await db.commitments.update(id, {
    remindAt: time && isTime(time) ? time : undefined,
    remindedAt: undefined,
    updatedAt: new Date().toISOString(),
  });
}

async function markReminded(id: string): Promise<void> {
  await db.commitments.update(id, { remindedAt: new Date().toISOString() });
}

/**
 * A one-off calendar event with an alert at the reminder time. Calendars deliver it even when Viz it is closed,
 * which a web page can't do on its own without a push server. Floating local time, like the check-in reminder.
 */
export function buildCommitmentIcs(c: Commitment, appUrl: string, t: Messages, now = new Date()): string {
  const [h, m] = (c.remindAt ?? '09:00').split(':');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viz it//Commitment reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:commitment-${c.id}@moodcanvas`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART:${c.date.replace(/-/g, '')}T${h}${m}00`,
    `DURATION:PT${Math.max(5, c.minutes)}M`,
    `SUMMARY:${icsEscape(c.title)}`,
    `DESCRIPTION:${icsEscape(t.reminder.commitmentIcs(appUrl))}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(c.title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(foldLine)
    .join('\r\n')
    .concat('\r\n');
}

async function notify(c: Commitment, t: Messages): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const options = {
    body: t.reminder.commitmentBody(c.title),
    tag: `vizit-commitment-${c.id}`,
    icon: `${import.meta.env.BASE_URL}icon-192.png`,
  };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) await registration.showNotification(t.reminder.commitmentTitle, options);
    else new Notification(t.reminder.commitmentTitle, options);
    return true;
  } catch {
    return false;
  }
}

const NONE: Commitment[] = [];

/**
 * Watches today's commitments while Viz it is open, in any tab of the app. When one is due: a pop-up inside the
 * app if it's on screen, or a system notification (if allowed) when it's in the background. Each reminds once.
 */
export function useCommitmentReminders(t: Messages) {
  const commitments = useLiveQuery(() => db.commitments.where('date').equals(dateOf(new Date())).toArray(), []) ?? NONE;
  const [now, setNow] = useState(() => new Date());
  const [shown, setShown] = useState<Commitment | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 20_000);
    const onVisible = () => setNow(new Date());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const next = dueCommitments(commitments, now)[0];

  useEffect(() => {
    if (!next || shown) return;
    if (document.visibilityState === 'visible') {
      setShown(next);
      void markReminded(next.id);
    } else {
      void notify(next, t).then(async (sent) => {
        if (sent) await markReminded(next.id);
      });
    }
  }, [next, shown, t]);

  // The pop-up follows the saved commitment, e.g. if it's ticked off or removed in another tab.
  const current = shown && commitments.find((c) => c.id === shown.id);
  const stale = shown != null && (!current || current.status === 'done' || current.status === 'skipped');
  useEffect(() => {
    if (stale) setShown(null);
  }, [stale]);

  return {
    due: stale ? null : (current ?? null),
    dismiss: () => setShown(null),
    done: async () => {
      if (shown) await db.commitments.update(shown.id, { status: 'done', updatedAt: new Date().toISOString() });
      setShown(null);
    },
    snooze: async () => {
      if (shown) await setCommitmentReminder(shown.id, later(10));
      setShown(null);
    },
  };
}
