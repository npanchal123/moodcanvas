import { describe, expect, it } from 'vitest';
import { en as messages } from '../../i18n/en';
import { COMPOSE_CONTENT } from '../compose';
import type { BreakerSession, Commitment } from '../types';
import {
  BREAKER_TEXT,
  breakerStats,
  categorize,
  CATEGORY_IDS,
  commitmentMonth,
  commitmentWeek,
  composeUnstuck,
  draftFrom,
  FEELING_IDS,
  monthGrid,
  focusedSeconds,
  followUpsFor,
  nextStep,
  OBSTACLE_IDS,
  OUTCOMES,
  planFor,
  rehearsalFor,
  REHEARSAL_IDS,
  SITUATION_IDS,
  SITUATION_PLAN_IDS,
  smaller,
  suggest,
  suggestionBasis,
  understand,
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
    expect(suggest(en, 'Learn Python', ['big']).options[0]).toBe(en.categories.code.tiny);
  });

  it('starts with the two-minute step, and no advice, when nothing was chosen', () => {
    const s = suggest(en, 'Learn Python', []);
    expect(s.options[0]).toBe(en.categories.code.tiny);
    expect(s.help).toEqual([]);
  });

  it('begins with the first real step when not knowing where to start', () => {
    expect(suggest(en, 'Apply for jobs', ['start']).options[0]).toBe(en.categories.job.steps[0]);
  });

  it('offers a rough first version for perfectionism and worry about quality', () => {
    expect(suggest(en, 'Write my essay', ['perfect']).options[0]).toBe(en.categories.write.draft);
    expect(suggest(en, 'Write my essay', ['badly']).options[0]).toBe(en.categories.write.draft);
  });

  it('gives advice for every chosen obstacle, in a fixed order', () => {
    expect(suggest(en, 'x', ['tired', 'distracted']).help).toEqual([en.obstacles.distracted.help, en.obstacles.tired.help]);
  });

  it('never offers the same step twice', () => {
    for (const id of OBSTACLE_IDS) {
      const { options } = suggest(en, 'Learn Python', [id]);
      expect(new Set(options).size).toBe(options.length);
    }
  });

  it('gives a situation its own steps when the words don’t name a kind of task', () => {
    expect(suggest(en, '', [], ['overthinking']).options[0]).toBe(en.situationPlans.overthinking.tiny);
    expect(suggest(en, 'I keep going round in circles', [], ['decision']).options[0]).toBe(en.situationPlans.decision.tiny);
    // The kind of task wins when there is one: steps for the actual task are more useful.
    expect(planFor(en, 'I need to update my resume', ['overwhelmed'])).toBe(en.categories.job);
    expect(planFor(en, 'stuff', ['procrastinating'])).toBe(en.categories.general);
  });
});

describe('every language', () => {
  it.each(Object.entries(BREAKER_TEXT))('%s has text for every situation, feeling, outcome and kind of task', (_, text) => {
    for (const id of CATEGORY_IDS) {
      const c = text.categories[id];
      expect(c.steps.length).toBeGreaterThanOrEqual(3);
      expect(c.tiny && c.prep && c.draft).toBeTruthy();
      expect(text.categoryNames[id]).toBeTruthy();
    }
    for (const id of SITUATION_PLAN_IDS) expect(text.situationPlans[id].steps.length).toBeGreaterThanOrEqual(3);
    for (const id of OBSTACLE_IDS) expect(text.obstacles[id].label).toBeTruthy();
    for (const id of SITUATION_IDS) {
      expect(text.situations[id] && text.understand.ack[id] && text.understand.question[id]).toBeTruthy();
    }
    for (const id of FEELING_IDS) expect(text.understand.feelings[id]).toBeTruthy();
    for (const id of OUTCOMES) expect(text.reflect.outcomes[id]).toBeTruthy();
    for (const id of REHEARSAL_IDS) expect(text.rehearsal[id]).toHaveLength(4);
  });
});

describe('understanding what has someone stuck', () => {
  it('asks follow-ups that fit the situation, always ending with "Something else"', () => {
    expect(followUpsFor(['failing'])).toEqual(['big', 'badly', 'judged', 'other']);
    expect(followUpsFor([])).toEqual(['start', 'big', 'badly', 'judged', 'time', 'consistent', 'other']);
  });

  it('suggests a possible obstacle from their words, without claiming it', () => {
    const u = understand(en, ['procrastinating'], 'I keep delaying my first video because I don’t know how to edit');
    expect(u.ack).toBe(en.understand.ack.procrastinating);
    expect(u.maybe).toBe(en.understand.maybe(en.obstacles.start.label));
    expect(understand(en, ['procrastinating'], '').maybe).toBeNull();
  });

  it('picks a rehearsal that fits: the situation first, confidence when that is all that was asked for', () => {
    expect(rehearsalFor(['procrastinating'], [])).toBe('begin');
    expect(rehearsalFor(['overwhelmed', 'decision'], [])).toBe('split');
    expect(rehearsalFor(['decision'], ['confident'])).toBe('decide');
    expect(rehearsalFor([], ['confident'])).toBe('confidence');
  });
});

describe('composeUnstuck', () => {
  it.each(Object.keys(BREAKER_TEXT) as (keyof typeof BREAKER_TEXT)[])('%s: imagery after the opening, rehearsal before the ending', (locale) => {
    const text = BREAKER_TEXT[locale];
    const composed = composeUnstuck(
      text,
      messages,
      locale,
      { task: 'I want to start my YouTube channel', situations: ['procrastinating'], feelings: ['ready'], scene: 'forest' },
      null,
    );
    const lines = composed.script.segments.map((s) => s.text);
    const closing = COMPOSE_CONTENT[locale].closing.length;
    expect(lines[1]).toBe(COMPOSE_CONTENT[locale].imagery.text);
    // The rehearsal, then a line about what to carry into the day, then the closing.
    expect(lines.slice(-closing - 5, -closing - 1)).toEqual(text.rehearsal.begin);
    expect(lines[lines.length - closing - 1]).toBe(COMPOSE_CONTENT[locale].integrate.process.text);
    expect(composed.goal).toBe('energy');
    expect(composed.scene).toBe('forest');
    expect(new Set(composed.script.segments.map((s) => s.id)).size).toBe(lines.length);
    // The shortest version still includes the start of the rehearsal and the step itself.
    expect(composed.script.segments.filter((s) => s.tier <= 3).map((s) => s.text)).toContain(text.rehearsal.begin[3]);
  });

  it('is the same every time for the same answers, so a session can be replayed', () => {
    const draft = { task: 'exam tomorrow', situations: ['overthinking' as const], feelings: ['calm' as const], scene: null };
    expect(composeUnstuck(en, messages, 'en', draft, 'fear')).toEqual(composeUnstuck(en, messages, 'en', draft, 'fear'));
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
    const d = en.situationPlans.decision;
    expect(nextStep(en, '', d.steps[0], ['decision'])).toBe(d.steps[1]);
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

  it('lists tasks to pick up again from their latest session only, never one without an action', () => {
    const sessions = [
      session({ task: 'Learn Python', outcome: 'done' }),
      session({ task: 'learn python ', outcome: 'stopped' }),
      session({ task: 'Gym', outcome: 'rescheduled', rescheduledFor: '2026-11-02T08:00:00.000Z' }),
      session({ task: 'Essay', outcome: 'progress' }),
      session({ task: 'Thinking', action: '' }),
      session({ task: 'Other', outcome: 'different' }),
    ];
    expect(unfinished(sessions).map((s) => s.task)).toEqual(['Gym', 'Essay']);
  });

  it('picks a session back up at its small step, keeping it', () => {
    const draft = draftFrom(
      session({ action: 'Run one line', obstacles: ['fear'], situations: ['failing'], feelings: ['confident'], scene: 'beach' }),
    );
    expect(draft.step).toBe(3);
    expect(draft.action).toBe('Run one line');
    expect(draft.situations).toEqual(['failing']);
    expect(draft.feelings).toEqual(['confident']);
    expect(draft.scene).toBe('beach');
    expect(draft.actionFor).toBe(suggestionBasis(draft));
  });
});

describe('commitmentWeek', () => {
  const day = (date: string, status: Commitment['status'], title = 'Reply to the bank email'): Commitment => ({
    id: Math.random().toString(36).slice(2),
    date,
    title,
    minutes: 5,
    status,
    createdAt: `${date}T09:00:00.000Z`,
    updatedAt: `${date}T09:00:00.000Z`,
  });

  it('counts the last seven days from what was recorded, with no streaks', () => {
    const week = commitmentWeek(
      [
        day('2026-10-23', 'done'),
        day('2026-10-23', 'partial', 'Study chapter 3'),
        day('2026-10-20', 'skipped', 'Go for a run'),
        day('2026-10-18', 'doing', 'Email the landlord'),
        day('2026-10-16', 'done'), // Seven days before: outside the week.
      ],
      new Date(2026, 9, 23, 12),
    );
    expect(week).toEqual({ created: 4, done: 1, partial: 1, days: 2, kinds: ['admin', 'study', 'exercise'] });
  });
});

describe('the month view', () => {
  it('lays a month out in weeks, starting on the chosen weekday', () => {
    // October 2026 starts on a Thursday and has 31 days.
    const monday = monthGrid(new Date(2026, 9, 1), 1);
    expect(monday[0].slice(0, 3)).toEqual([null, null, null]);
    expect(monday[0][3]?.getDate()).toBe(1);
    expect(monday.flat().filter(Boolean)).toHaveLength(31);
    expect(monday.every((week) => week.length === 7)).toBe(true);
    const sunday = monthGrid(new Date(2026, 9, 1), 7);
    expect(sunday[0][4]?.getDate()).toBe(1);
  });

  it('counts only the month in view', () => {
    const c = (date: string, status: Commitment['status']): Commitment => ({
      id: date + status,
      date,
      title: 'Study chapter 3',
      minutes: 5,
      status,
      createdAt: `${date}T09:00:00.000Z`,
      updatedAt: `${date}T09:00:00.000Z`,
    });
    const month = commitmentMonth(
      [c('2026-10-01', 'done'), c('2026-10-31', 'partial'), c('2026-09-30', 'done'), c('2026-11-01', 'done')],
      new Date(2026, 9, 15),
    );
    expect(month).toEqual({ created: 2, done: 1, partial: 1, days: 2, kinds: ['study'] });
  });
});
