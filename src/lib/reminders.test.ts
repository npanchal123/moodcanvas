import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { buildReminderIcs, isReminderDue } from './reminders';
import { dayKey } from './stats';
import { makeEntry } from './testing';

const EVENING = new Date('2026-10-17T20:30:00');
const on = { enabled: true, time: '20:00' };

describe('isReminderDue', () => {
  it('is due after the reminder time when there is no check-in today', () => {
    expect(isReminderDue(on, [], null, EVENING)).toBe(true);
  });

  it('is not due before the time, when off, after checking in, or once already shown today', () => {
    expect(isReminderDue(on, [], null, new Date('2026-10-17T19:59:00'))).toBe(false);
    expect(isReminderDue({ ...on, enabled: false }, [], null, EVENING)).toBe(false);
    expect(isReminderDue(on, [makeEntry(EVENING, 0, [{ label: 'joy', intensity: 50 }])], null, EVENING)).toBe(false);
    expect(isReminderDue(on, [], dayKey(EVENING), EVENING)).toBe(false);
  });

  it("isn't satisfied by yesterday's check-in", () => {
    expect(isReminderDue(on, [makeEntry(EVENING, 1, [{ label: 'joy', intensity: 50 }])], null, EVENING)).toBe(true);
  });
});

describe('buildReminderIcs', () => {
  it('builds a daily repeating event with an alert at the chosen local time', () => {
    const url = 'https://moodcanvas.example.org/some/long/path/that/pushes/the/line/past/the/limit';
    const ics = buildReminderIcs('08:15', url, en, EVENING);
    expect(ics.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);

    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('DTSTART:20261017T081500');
    expect(unfolded).toContain('RRULE:FREQ=DAILY');
    expect(unfolded).toContain('BEGIN:VALARM');
    expect(unfolded).toContain(`URL:${url}`);
    expect(unfolded).toContain(`DESCRIPTION:How are you feeling? Open MoodCanvas: ${url}`);
  });
});
