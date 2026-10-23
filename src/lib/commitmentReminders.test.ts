import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { buildCommitmentIcs, dueCommitments, isTime, later } from './commitmentReminders';
import type { Commitment } from './types';

const now = new Date(2026, 9, 23, 18, 30);

function item(extra: Partial<Commitment>): Commitment {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2026-10-23',
    title: 'Reply to the bank email',
    minutes: 10,
    status: 'todo',
    createdAt: '2026-10-23T09:00:00.000Z',
    updatedAt: '2026-10-23T09:00:00.000Z',
    ...extra,
  };
}

describe('dueCommitments', () => {
  it('reminds once the time has come, earliest first, and only once', () => {
    const due = dueCommitments(
      [
        item({ title: 'later', remindAt: '18:31' }),
        item({ title: 'second', remindAt: '18:30' }),
        item({ title: 'first', remindAt: '07:00' }),
        item({ title: 'already shown', remindAt: '08:00', remindedAt: '2026-10-23T08:00:00.000Z' }),
        item({ title: 'no reminder' }),
      ],
      now,
    );
    expect(due.map((c) => c.title)).toEqual(['first', 'second']);
  });

  it('stays quiet for finished, skipped or other days’ commitments', () => {
    const due = dueCommitments(
      [
        item({ remindAt: '08:00', status: 'done' }),
        item({ remindAt: '08:00', status: 'skipped' }),
        item({ remindAt: '08:00', date: '2026-10-22' }),
        item({ remindAt: '8:00' }),
      ],
      now,
    );
    expect(due).toEqual([]);
    // Partly done or in progress is still worth a nudge.
    expect(dueCommitments([item({ remindAt: '08:00', status: 'partial' })], now)).toHaveLength(1);
  });
});

describe('times', () => {
  it('checks the "HH:MM" format', () => {
    expect(isTime('09:05')).toBe(true);
    expect(isTime('23:59')).toBe(true);
    expect(isTime('24:00')).toBe(false);
    expect(isTime('9:05')).toBe(false);
  });

  it('snoozes within today', () => {
    expect(later(10, now)).toBe('18:40');
    expect(later(10, new Date(2026, 9, 23, 23, 55))).toBe('23:59');
  });
});

describe('buildCommitmentIcs', () => {
  it('makes a one-off event with an alert at the reminder time, safe from special characters', () => {
    const ics = buildCommitmentIcs(item({ id: 'abc', title: 'Call mom; pay rent, 2 bills', remindAt: '18:45' }), 'https://x.test/', en, now);
    expect(ics).toContain('DTSTART:20261023T184500');
    expect(ics).toContain('UID:commitment-abc@moodcanvas');
    expect(ics).toContain('SUMMARY:Call mom\\; pay rent\\, 2 bills');
    expect(ics).toContain('TRIGGER:PT0M');
    expect(ics).not.toContain('RRULE');
    expect(ics.split('\r\n').every((line) => line.length <= 75)).toBe(true);
  });
});
