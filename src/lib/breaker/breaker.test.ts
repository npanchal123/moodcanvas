import { describe, expect, it } from 'vitest';
import type { BreakerSession } from '../types';
import {
  BREAKER_TEXT,
  breakerStats,
  categorize,
  CATEGORY_IDS,
  draftFrom,
  focusedSeconds,
  nextStep,
  OBSTACLE_IDS,
  previousWhy,
  smaller,
  suggest,
  suggestionBasis,
  unfinished,
} from '.';

const en = BREAKER_TEXT.en;

function session(extra: Partial<BreakerSession>): BreakerSession {
  return {
    id: Math.random().toString(36).slice(2),
    task: 'Learn Python',
    obstacles: ['big'],
    intervention: '',
    action: 'x',
    plannedMinutes: 2,
    focusedSeconds: 0,
    runningSince: null,
    status: 'finished',
    startedAt: '2026-10-01T10:00:00.000Z',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...extra,
  };
}

describe('categorize', () => {
  it.each([
    ['I’m avoiding learning Python', 'code'],
    ['applying for jobs', 'job'],
    ['Start exercising again', 'exercise'],
    ['studying for my exam tomorrow', 'study'],
    ['starting my business', 'business'],
    ['write my blog post', 'write'],
    ['reply to the bank email', 'admin'],
    ['clean my room', 'clean'],
    ['call grandma', 'admin'],
    ['something vague', 'general'],
    ['नौकरी के लिए आवेदन', 'job'],
    ['Estudiar para el examen', 'study'],
    ['学习编程', 'code'], ['أريد البدء في مشروعي', 'business'], ['Готовиться к экзамену', 'study'], ['চাকরির আবেদন করা', 'job'], ['Ranger ma chambre', 'clean'], ['Procurar emprego', 'job'],
  ])('%s → %s', (task, category) => {
    expect(categorize(task)).toBe(category);
  });
});

describe('suggest', () => {
  it('starts a too-big task with something that takes about two minutes', () => {
    const s = suggest(en, 'Learn Python', ['big']);
    expect(s.options[0]).toBe(en.categories.code.tiny);
    expect(s.breakdown).toBeNull();
  });

  it('breaks the task into steps when not knowing where to start', () => {
    const s = suggest(en, 'Apply for jobs', ['start']);
    expect(s.breakdown).toEqual(en.categories.job.steps);
    expect(s.options[0]).toBe(en.categories.job.steps[0]);
  });

  it('offers a rough first version to perfectionists', () => {
    expect(suggest(en, 'Write my essay', ['perfect']).options[0]).toBe(en.categories.write.draft);
  });

  it('fits the step to the time available', () => {
    expect(suggest(en, 'Study for the exam', ['time'], 2).options[0]).toBe(en.categories.study.tiny);
    expect(suggest(en, 'Study for the exam', ['time'], 25).options[0]).toBe(en.categories.study.steps[0]);
  });

  it('gives advice and a plan for every chosen obstacle, in a fixed order', () => {
    const s = suggest(en, 'x', ['tired', 'distracted']);
    expect(s.help).toEqual([en.obstacles.distracted.help, en.obstacles.tired.help]);
    expect(s.plans).toEqual([en.obstacles.distracted.plan, en.obstacles.tired.plan]);
  });

  it('never offers the same step twice', () => {
    for (const id of OBSTACLE_IDS) {
      const { options } = suggest(en, 'Learn Python', [id]);
      expect(new Set(options).size).toBe(options.length);
    }
  });
});

describe('every language', () => {
  it.each(Object.entries(BREAKER_TEXT))('%s has steps and a starter for every kind of task', (_, text) => {
    for (const id of CATEGORY_IDS) {
      const c = text.categories[id];
      expect(c.steps.length).toBeGreaterThanOrEqual(3);
      expect(c.tiny && c.prep && c.draft).toBeTruthy();
    }
    for (const id of OBSTACLE_IDS) expect(text.obstacles[id].label).toBeTruthy();
  });
});

describe('smaller and next steps', () => {
  it('shrinks a step to the two-minute starter, then to just getting set up, then stops', () => {
    const c = en.categories.code;
    expect(smaller(en, 'Learn Python', c.steps[2])).toBe(c.tiny);
    expect(smaller(en, 'Learn Python', c.tiny)).toBe(c.prep);
    expect(smaller(en, 'Learn Python', c.prep)).toBeNull();
  });

  it('moves along the steps after one is done', () => {
    const c = en.categories.job;
    expect(nextStep(en, 'Apply for jobs', c.steps[0])).toBe(c.steps[1]);
    expect(nextStep(en, 'Apply for jobs', c.steps[3])).toBeNull();
    expect(nextStep(en, 'Apply for jobs', c.prep)).toBe(c.steps[0]);
  });
});

describe('sessions', () => {
  it('counts a running timer and leaves pauses out', () => {
    const s = session({ focusedSeconds: 30, runningSince: 1_000_000 });
    expect(focusedSeconds(s, 1_060_000)).toBe(90);
    expect(focusedSeconds({ ...s, runningSince: null }, 9_999_999)).toBe(30);
  });

  it('adds up only finished sessions', () => {
    const later = session({ id: 'later', outcome: 'rescheduled', focusedSeconds: 60 });
    const sessions = [
      session({ outcome: 'done', focusedSeconds: 120, resumedFrom: 'later' }),
      later,
      session({ outcome: 'progress', focusedSeconds: 300, resumedFrom: 'unknown' }),
      session({ status: 'active', focusedSeconds: 999 }),
    ];
    expect(breakerStats(sessions)).toEqual({ sessions: 3, done: 1, focusSeconds: 480, resumed: 1 });
  });

  it('lists tasks to pick up again from their latest session only', () => {
    const sessions = [
      session({ task: 'Learn Python', outcome: 'done' }),
      session({ task: 'learn python ', outcome: 'interrupted' }),
      session({ task: 'Gym', outcome: 'rescheduled', rescheduledFor: '2026-11-02T08:00:00.000Z' }),
      session({ task: 'Essay', outcome: 'progress' }),
    ];
    expect(unfinished(sessions).map((s) => s.task)).toEqual(['Gym', 'Essay']);
  });

  it('remembers why a task mattered', () => {
    const sessions = [session({ task: 'Gym' }), session({ task: 'gym', why: 'Feel strong' })];
    expect(previousWhy(sessions, ' GYM')).toBe('Feel strong');
    expect(previousWhy(sessions, 'Essay')).toBeUndefined();
  });

  it('keeps the chosen step when picking a session back up', () => {
    const draft = draftFrom(session({ action: 'Run one line', obstacles: ['fear'] }), 5);
    expect(draft.action).toBe('Run one line');
    expect(draft.actionFor).toBe(suggestionBasis(draft));
  });
});
