import type { BreakerOutcome, CategoryContent, CategoryId, ObstacleContent, ObstacleId } from './types';

const mins = (n: number) => `${n} min`;

/**
 * English text for the Procrastination Breaker. Every other language provides the same shape (enforced by the
 * `BreakerText` type). The wording is careful never to judge: obstacles belong to the task, not the person.
 */
export const en = {
  title: 'Procrastination Breaker',
  principle: 'Don’t wait for motivation. Make starting easier.',
  tabs: { start: 'Get started', progress: 'My progress' },
  back: 'Back',
  mins,
  seconds: (n: number) => `${n} sec`,

  entry: {
    title: 'What are you putting off today?',
    body: 'Let’s understand what’s holding you back and turn it into one small action you can take right now.',
    label: 'The task you’re putting off',
    placeholder: 'I’m avoiding learning Python, applying for jobs, exercising, or starting an important project…',
    start: 'Help me get started',
    needTask: 'Write a few words about the task first.',
    resumeHeading: 'Pick up where you left off',
    plannedFor: (date: string) => `Planned for ${date}`,
    running: 'You have a focus session open.',
    openRunning: 'Back to my session',
  },

  obstacle: {
    title: 'What’s making it difficult to start?',
    hint: 'Choose any that fit. There’s no wrong answer.',
  },

  obstacles: {
    start: {
      label: 'I don’t know where to start.',
      help: 'Let’s split it into a few simple steps and begin with the easiest useful one.',
    },
    big: {
      label: 'The task feels too big.',
      help: 'You don’t have to do all of it. Start with something that takes about two minutes.',
    },
    fear: {
      label: 'I’m afraid I’ll fail.',
      help: 'Treat this first try as practice. The aim is to learn something, not to get it right.',
    },
    badly: {
      label: 'I’m worried about doing it badly.',
      help: 'Decide what a rough first version looks like. Good enough to improve later is the goal.',
    },
    motivation: {
      label: 'I don’t feel motivated.',
      help: 'Motivation often comes after starting, not before. Commit only to a small first step.',
    },
    distracted: {
      label: 'I’m distracted by my phone or other things.',
      help: 'Change one thing around you: put your phone out of reach, and close tabs you don’t need.',
    },
    overwhelmed: {
      label: 'I feel overwhelmed.',
      help: 'Choose only this one task for now. Everything else can wait on a list, outside your head.',
    },
    perfect: {
      label: 'I’m trying to make everything perfect.',
      help: 'Aim for a small, imperfect first version, and decide in advance where you’ll stop.',
    },
    easier: {
      label: 'I keep choosing easier tasks instead.',
      help: 'Do one small action on this task first. The easier tasks can come after, as a reward.',
    },
    time: {
      label: 'I don’t have enough time.',
      help: 'Even a few minutes can move it forward. Choose how much time you have, and the step will fit.',
    },
    tired: {
      label: 'I’m tired or low on energy.',
      help: 'Make it lighter: do the easiest version, take a short break first, or plan it for when you have more energy.',
    },
    other: {
      label: 'Something else.',
      help: 'Thanks for naming it. Let’s start with a step small enough to work around it.',
    },
  } as Record<ObstacleId, ObstacleContent>,

  action: {
    title: 'Let’s make the first step easier.',
    mayHelp: 'What may help',
    label: 'Your tiny next step',
    another: 'Show another',
    smaller: 'Make it smaller',
    need: 'Write a small step first.',
    rest: 'Rest now and plan it for later',
  },

  ready: {
    howLong: 'How long?',
    lengths: { 2: '2-minute start', 10: '10-minute focus', 25: '25-minute focus' } as Record<number, string>,
    start: 'Start now',
  },

  timer: {
    left: 'left',
    progressLabel: 'Focus time',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    stop: 'Stop',
    done: 'I did it',
    timeUp: 'Time’s up. Take a breath.',
    record: 'Record what happened',
    more: 'Add 5 minutes',
    note: 'You can stop at any time and still record your progress.',
  },

  reflect: {
    title: 'You showed up. Let’s record your progress.',
    question: 'What happened?',
    outcomes: {
      done: 'I completed the action.',
      progress: 'I made some progress.',
      hard: 'The action was still too difficult.',
      interrupted: 'Something interrupted me.',
      rescheduled: 'I decided to reschedule.',
    } as Record<BreakerOutcome, string>,
    when: 'When will you come back to it?',
    needDate: 'Choose a date and time.',
    save: 'Save',
    saving: 'Saving…',
    focused: (time: string) => `Focused for ${time}`,
  },

  after: {
    doneTitle: 'Nicely done.',
    doneBody: 'One real step forward. The whole task stays open until you say it’s finished.',
    nextLabel: 'A good next step',
    next: 'Do the next step',
    finish: 'Finish for now',
    progressTitle: 'Progress counts.',
    progressBody: 'You moved it forward. Keep going while you’re warmed up, or pause here.',
    keepGoing: 'Keep going for 10 minutes',
    pause: 'Pause for now',
    hardTitle: 'Let’s make it smaller.',
    hardBody: 'That step was bigger than it looked. That’s useful to know.',
    tryInstead: 'Try this instead',
    trySmaller: 'Try the smaller step',
    restart: 'Start over',
    interruptedTitle: 'Interruptions happen.',
    interruptedBody: 'Your session is saved. A plan for next time:',
    interruptedPlan: 'If I get interrupted, then I’ll note where I stopped and come back to it as soon as I can.',
    again: 'Start another session',
    rescheduledTitle: 'It’s in your plan.',
    rescheduledBody: (date: string) => `Come back to it on ${date}. It’ll be waiting under “Pick up where you left off”.`,
    saved: 'Saved to My progress.',
  },

  progress: {
    title: 'My progress',
    note: 'Saved on this device only.',
    stats: {
      sessions: 'Sessions',
      done: 'Actions completed',
      focus: 'Focus time',
      resumed: 'Picked up after postponing',
    },
    filters: { all: 'All sessions', done: 'Completed actions', progress: 'Partial progress', rescheduled: 'Rescheduled' },
    filterLabel: 'Show',
    empty: 'No sessions yet. Your first one can take just two minutes.',
    emptyFilter: 'No sessions like this yet.',
    tryFirst: 'Start my first session',
    inProgress: 'In progress',
    planned: (planned: string, actual: string) => `Planned ${planned} · focused ${actual}`,
    details: 'Details',
    obstacles: 'Obstacles',
    action: 'Tiny step',
    why: 'Why it matters',
    plan: 'If–then plan',
    reflection: 'Reflection',
    setAside: 'Set aside',
    resume: 'Pick this up again',
    simplify: 'Make it smaller',
    delete: 'Delete',
    deleteConfirm: 'Delete this session? This can’t be undone.',
  },

  categories: {
    code: {
      keywords: ['python', 'code', 'coding', 'programming', 'javascript', 'java', 'html', 'sql', 'developer', 'app', 'website', 'automation'],
      steps: [
        'Open your code editor and run one simple print statement.',
        'Follow one short lesson or tutorial section.',
        'Change the example a little and run it again.',
        'Write down one thing you learned and what to try next.',
      ],
      tiny: 'Open your code editor and run one simple print statement.',
      prep: 'Open your code editor or the course page.',
      draft: 'Write a small script that works, even if the code is messy.',
    },
    job: {
      keywords: ['job', 'jobs', 'apply', 'applying', 'application', 'resume', 'cv', 'interview', 'linkedin', 'career', 'internship'],
      steps: [
        'Find one relevant job opening and save its link.',
        'Read the description and note three things they’re looking for.',
        'Update one section of your CV to match it.',
        'Send the application, or choose a time to send it.',
      ],
      tiny: 'Find one relevant job opening and save its link.',
      prep: 'Open a job site and type in the role you want.',
      draft: 'Write a rough cover letter: three short sentences on why you fit.',
    },
    exercise: {
      keywords: ['exercise', 'exercising', 'workout', 'gym', 'run', 'running', 'jog', 'walk', 'yoga', 'fitness', 'training', 'cycling', 'swim'],
      steps: [
        'Put on your workout clothes and prepare your space.',
        'Warm up gently for two minutes.',
        'Do the first part of your workout at an easy pace.',
        'Stretch for a minute and notice how you feel.',
      ],
      tiny: 'Put on your workout clothes and prepare your exercise space.',
      prep: 'Put your workout clothes or shoes where you can see them.',
      draft: 'Do a short, easy version: ten minutes instead of a full workout.',
    },
    business: {
      keywords: ['business', 'startup', 'project', 'product', 'launch', 'brand', 'client', 'clients', 'side hustle', 'company'],
      steps: [
        'Write down the problem your project solves, in one sentence.',
        'List three people who might need it.',
        'Choose the smallest thing you could build or test first.',
        'Pick a date to show it to one person.',
      ],
      tiny: 'Write down the problem your project solves, in one sentence.',
      prep: 'Open a note and give it your project’s name.',
      draft: 'Sketch a one-page plan: the problem, who it’s for, the first step.',
    },
    write: {
      keywords: ['write', 'writing', 'essay', 'blog', 'post', 'content', 'video', 'article', 'report', 'thesis', 'book', 'youtube', 'instagram', 'presentation'],
      steps: [
        'Write three rough ideas for it.',
        'Pick one idea and write a messy first paragraph.',
        'Add a few bullet points for the rest.',
        'Read it once and fix only the biggest problem.',
      ],
      tiny: 'Write three rough ideas for your next piece.',
      prep: 'Open a blank page and give it a working title.',
      draft: 'Write a messy first draft of one section, without editing.',
    },
    study: {
      keywords: ['exam', 'exams', 'study', 'studying', 'revise', 'revision', 'chapter', 'homework', 'test', 'assignment', 'notes', 'syllabus', 'learn', 'learning', 'course'],
      steps: [
        'Open the relevant chapter and read the first page.',
        'Write down three questions this topic should answer.',
        'Solve one practice question, or summarise one page.',
        'Check what’s left and choose the next topic.',
      ],
      tiny: 'Open the relevant chapter and read the first page.',
      prep: 'Put your book or notes on the table, open at the right page.',
      draft: 'Make rough notes on one topic, in your own words, without tidying them.',
    },
    clean: {
      keywords: ['clean', 'cleaning', 'tidy', 'room', 'laundry', 'dishes', 'declutter', 'organize', 'organise', 'kitchen'],
      steps: [
        'Clear one small surface, like a table or a shelf.',
        'Put away ten things.',
        'Deal with one pile: laundry, dishes or papers.',
        'Take out the rubbish.',
      ],
      tiny: 'Put away five things that are out of place.',
      prep: 'Put on some music and pick up one thing.',
      draft: 'Make one room good enough, not spotless.',
    },
    admin: {
      keywords: ['email', 'emails', 'call', 'bill', 'bills', 'form', 'taxes', 'tax', 'paperwork', 'bank', 'appointment', 'reply', 'message', 'documents'],
      steps: [
        'Open the email, form or document you’ve been avoiding.',
        'Write the first line, or fill in the first field.',
        'Finish the easiest part.',
        'Send it, or note exactly what’s missing.',
      ],
      tiny: 'Open the email or form you’ve been avoiding and read it once.',
      prep: 'Find the email or document and leave it open on your screen.',
      draft: 'Write a short, plain reply. It doesn’t need to be perfect.',
    },
    general: {
      keywords: [],
      steps: [
        'Write one sentence about what “finished” would look like.',
        'List the first three small things it needs.',
        'Do the easiest of those three.',
        'Decide what comes next, and when.',
      ],
      tiny: 'Get out what you need for it and do the very first small action.',
      prep: 'Get out what you need for it and put it in front of you.',
      draft: 'Do a rough version of the first part, without polishing.',
    },
  } as Record<CategoryId, CategoryContent>,
};

export type BreakerText = typeof en;
