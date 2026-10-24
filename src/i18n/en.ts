import type { EmotionLabel } from '../lib/emotions';

interface EmotionWords {
  name: string;
  adjective: string;
  noun: string;
}

const times = (n: number) => (n === 1 ? '1 time' : `${n} times`);
const checkIns = (n: number) => (n === 1 ? '1 check-in' : `${n} check-ins`);

/**
 * English messages. Every other language must provide the same shape
 * (enforced by the `Messages` type), so a missing string is a type error.
 */
export const en = {
  htmlLang: 'en',
  /** Text direction: 'rtl' for Arabic. */
  dir: 'ltr' as 'ltr' | 'rtl',
  languageName: 'English',

  emotions: {
    joy: { name: 'Joy', adjective: 'joyful', noun: 'joy' },
    calm: { name: 'Calm', adjective: 'calm', noun: 'calm' },
    sadness: { name: 'Sadness', adjective: 'sad', noun: 'sadness' },
    anger: { name: 'Anger', adjective: 'angry', noun: 'anger' },
    fear: { name: 'Fear / Anxiety', adjective: 'anxious', noun: 'anxiety' },
    surprise: { name: 'Surprise', adjective: 'surprised', noun: 'surprise' },
    disgust: { name: 'Disgust', adjective: 'disgusted', noun: 'disgust' },
  } as Record<EmotionLabel, EmotionWords>,

  bands: { mild: 'Mild', moderate: 'Moderate', strong: 'Strong' },

  app: {
    tagline: 'Visualize · Imagine · Create',
    skipLink: 'Skip to main content',
    navLabel: 'Main',
    views: { today: 'Visualize', breaker: 'Unstuck', habits: 'Habits', practice: 'Library', history: 'Journal', settings: 'Settings', privacy: 'Privacy' },
    pageHeading: (view: string) => `Viz it: ${view}`,
    aiFallback: 'Smarter analysis isn’t available right now, so the built-in word list was used.',
    loading: 'Loading…',
    footer: 'Viz it is a reflection tool. It isn’t a diagnosis or a replacement for professional support.',
    footerLinks: 'More',
    privacyLink: 'Privacy',
    supportLink: 'Get support now',
  },

  reminder: {
    bannerTitle: 'It’s your check-in time',
    bannerBody: 'How are you feeling right now? A few words is enough.',
    bannerAction: 'Check in now',
    dismiss: 'Not now',
    notificationTitle: 'Time to check in',
    notificationBody: 'How are you feeling? Tap to open Viz it.',
    icsSummary: 'Check in with Viz it',
    icsDescription: (url: string) => `How are you feeling? Open Viz it: ${url}`,
    commitmentTitle: 'Reminder: your commitment',
    commitmentBody: (title: string) => `Time for: ${title}`,
    commitmentIcs: (url: string) => `Your daily commitment in Viz it: ${url}`,
    markDone: 'Mark done',
    snooze: 'Snooze 10 min',
  },
  result: {
    mostly: (adjective: string) => `Mostly ${adjective}`,
    feeling: (adjective: string) => `Feeling ${adjective}`,
    outOf100: (n: number) => `${n} out of 100`,
    withSome: (noun: string) => `, with some ${noun}`,
    noEmotion: 'No emotion detected',
    byAi: 'read by smarter analysis',
    alsoPresent: 'Also present: ',
    adjustTitle: 'Feels off? Rate it yourself',
    adjustHint: '1 is barely there, 10 is overwhelming. Your rating replaces ours.',
    adjusted: (n: number) => `Updated to ${n} out of 100.`,
    share: 'Share or save image…',
    newCheckIn: 'New check-in',
  },

  create: {
    heroTitle: 'Visualize how you want to feel',
    heroBody:
      'Tell me what’s on your mind and how you’d like to imagine it. Viz it writes a guided visualization just for you, instantly, and a calm voice walks you through it.',
    label: 'What’s on your mind, and what would you like to imagine?',
    hintLocal: 'Write freely, in your own language. What you write stays on this device.',
    hintAi: 'Write freely. Smarter analysis is on, so this text is also sent to Claude to read your feelings.',
    placeholder:
      'Describe what you’re feeling, what you want to imagine, or a moment you’d like to experience. For example: help me prepare mentally for an important match, imagine a peaceful evening, or see myself confidently starting a new chapter.',
    examplesLabel: 'Need an idea? Try one:',
    /** Starting points. Their order matches IDEA_SETTINGS in Visualize.tsx (mode and feeling for each). */
    ideas: [
      { label: 'Find a quiet moment', text: 'I’d like a quiet, peaceful moment to slow down. Take me somewhere calm.' },
      { label: 'Imagine my future self', text: 'Help me imagine my future self, a few years from now, living in a way that feels meaningful.' },
      { label: 'Prepare for an important challenge', text: 'Help me prepare mentally for an important challenge coming up, step by step.' },
      { label: 'Build confidence before a performance', text: 'I have a performance coming up and I feel nervous. Help me feel steadier and more confident.' },
      { label: 'Reconnect with a positive memory', text: 'Take me back to a happy memory so I can enjoy it again.' },
      { label: 'Prepare for restful sleep', text: 'Help me unwind and get ready for restful sleep.' },
      { label: 'Experience a moment of gratitude', text: 'Help me notice and enjoy the things I’m grateful for today.' },
      { label: 'Practise staying focused', text: 'Help me practise staying focused on one thing at a time.' },
      { label: 'Imagine starting a new chapter', text: 'Help me imagine confidently starting a new chapter in my life.' },
      { label: 'Rehearse handling a difficult situation', text: 'Help me rehearse handling a difficult conversation calmly.' },
    ],
    replaceConfirm: 'Replace what you’ve written with this idea?',
    modeLegend: 'What would you like to visualize? (optional)',
    modeHint: 'If you don’t choose, Viz it picks what fits your words, or keeps the session simply restful.',
    suggested: 'Suggested',
    suggestedWhy: (name: string, why: string) => `Suggested: ${name}. ${why}`,
    mode: (name: string) => `Mode: ${name}`,
    createError: 'Something went wrong creating your visualization. Your words are still here, so you can try again.',
    sceneLegend: 'Where would you like to go? (optional)',
    goalLegend: 'What would help most? (optional)',
    create: 'Create my visualization',
    creating: 'Creating…',
    needMore: 'Tell me a little about how you feel, or pick a place or what would help.',
    madeFrom: 'Made from your words',
    understood: 'What I picked up',
    feeling: (name: string, n: number) => `Feeling: ${name} (${n}/100)`,
    place: (place: string) => `Place: ${place}`,
    goal: (goal: string) => `Focus: ${goal}`,
    about: (topic: string) => `About: ${topic}`,
    readScript: 'Read the script',
    readyTitle: 'Or start with a ready-made visualization',
    readyBody: 'Guided sessions for common feelings, ready to play.',
    seeAll: 'See all in Library',
    savedTitle: 'Your saved visualizations',
    newHereTitle: 'New to visualization?',
    newHereBody:
      'It’s simply imagining with your senses while a calm voice guides you. You don’t need any experience, and you don’t even need to “see” pictures.',
    firstTry: 'Try a 3-minute first visualization',
    learn: 'Learn the basics',
  },

  learn: {
    heroChip: 'New here? Start the beginner’s path',
    eyebrow: 'Start here',
    title: 'Learn to visualize in 5 small steps',
    body: 'A short path for beginners, about 15 minutes in all. Take it at your own pace and stop whenever you like.',
    progress: (done: number, total: number) => `${done} of ${total} done`,
    steps: {
      read: { title: 'Understand what visualization is', body: 'A one-minute read: what it is, and why it works even if you don’t “see” pictures.', action: 'Read it' },
      first: { title: 'Your first try', body: 'A 3-minute exercise with a lemon. Nothing to get right; just notice what happens.', action: 'Start (3 min)' },
      senses: { title: 'Wake up your senses', body: 'Five quick prompts, one for each sense. Notice which ones come easily to you.', action: 'Start the warm-up' },
      guided: { title: 'A full guided session', body: 'Safe Place: a calm spot you build in your mind, with a voice guiding you.', action: 'Start Safe Place' },
      own: { title: 'Make your own', body: 'Write a few words about how you feel or where you’d like to be. Viz it writes a session just for you.', action: 'Write mine' },
    },
    done: 'Done',
    markDone: 'Mark as done',
    completeTitle: 'Beginner’s path complete',
    completeBody: 'You know the basics. Short sessions most days build the skill.',
    revisit: 'Revisit the path',
    hide: 'Hide',
    senses: {
      intro: 'Take a few seconds with each one. There’s no right answer.',
      prompts: [
        'See: picture a colour you love. Notice its shade, and whether it feels warm or cool.',
        'Hear: imagine rain tapping on a window. Is it light, or heavy?',
        'Touch: imagine warm sand under your feet, or a soft blanket in your hands.',
        'Smell: imagine fresh coffee, or bread just out of the oven.',
        'Taste: imagine biting into a slice of orange. Notice the juice and the sharpness.',
      ],
      next: 'Next',
      finish: 'Finish',
      step: (n: number, total: number) => `${n} of ${total}`,
    },
    tipsTitle: 'Tips for a good session',
    tips: [
      'Find a quiet spot where you won’t be interrupted for a few minutes.',
      'Headphones help you hear the voice and shut out noise.',
      'Close your eyes if it feels comfortable, or keep them open and soften your gaze.',
      'Start short: 2 to 3 minutes is plenty while you learn.',
      'A wandering mind is normal. Each time you come back, you’re practising.',
      'Some senses come easier than others. Lean on the ones that work for you.',
    ],
    faqTitle: 'Common questions',
  },

  voice: {
    ownTitle: 'Record your own visualization',
    ownBody: 'Guide yourself in your own words and your own voice. Play it back whenever you like.',
    start: 'Start recording',
    stop: 'Stop',
    nameLabel: 'Name it',
    namePlaceholder: 'e.g. My morning calm',
    save: 'Save',
    discard: 'Discard',
    saved: 'Saved to My recordings.',
    saveFailed: 'That didn’t save. Please try again.',
    myRecordings: 'My recordings',
    delete: 'Delete',
    deleteConfirm: 'Delete this recording? This can’t be undone.',
    denied: 'Viz it can’t use the microphone. Allow it in your browser’s site settings, then try again.',
    unsupported: 'This browser can’t record audio. Try Chrome, Edge, Firefox or Safari.',
    recordLines: 'Record in my voice',
    linesTitle: 'Record this visualization in your voice',
    linesBody: 'Read each line aloud, slowly and calmly. Lines you skip are read by the device voice.',
    record: 'Record',
    again: 'Record again',
    play: 'Play',
    remove: 'Remove',
    finish: 'Done',
    useMine: 'Use my recorded voice',
    mineNote: 'Your own voice',
    privacy: 'Recordings stay on this device. Nothing is uploaded.',
    recording: (time: string) => `Recording… ${time}`,
    progress: (n: number, total: number) => `${n} of ${total} lines recorded`,
    line: (n: number) => `Line ${n}`,
    mineCount: (n: number, total: number) => `${n} of ${total} lines in your voice`,
    untitled: (date: string) => `My recording, ${date}`,
    readAlong: 'Read it all in one go',
    readAlongBody: 'Lines appear one at a time, like a teleprompter. Read each one aloud, calmly, then tap Next line. Your voice is saved line by line.',
    startReading: 'Start reading',
    nextLine: 'Next line',
    finishReading: 'Finish',
    stopReading: 'Stop',
    orLineByLine: 'Or record line by line',
    readyCta: 'Hear this in your own voice',
    readyButton: 'Read it in my voice',
    reRecord: 'Record again in my voice',
    allMine: 'This visualization is in your voice.',
    lineOf: (n: number, total: number) => `Line ${n} of ${total}`,
    readyCtaBody: (minutes: number) => `Read it aloud once, about ${minutes} min. Then it plays in your voice.`,
  },

  practice: {
    // Library tab
    startHereTitle: 'New to visualization?',
    startHereBody:
      'Visualization is a kind of meditation where you use your imagination: picturing calm places, warm light or open sky to change how you feel. Read the basics, then try a short first practice.',
    basicsHeading: 'The basics',
    firstButton: 'Try your first visualization (3 min)',
    suggestedHeading: 'Suggested for you',
    suggestedBody: (adjective: string) => `Your last check-in today was ${adjective}. This practice is a good match.`,
    libraryHeading: 'All practices',
    helpsWith: (names: string) => `Good for: ${names}`,
    forBeginners: 'Good for: getting started',
    open: 'Start',
    openLabel: (title: string) => `Start ${title}`,
    // Before starting
    lengthLabel: 'How long?',
    minutes: (n: number) => `${n} min`,
    voiceLabel: 'Voice guide',
    speedLabel: 'Voice speed',
    speeds: { slow: 'Slower', normal: 'Normal', fast: 'Faster' },
    breathLabel: 'Breathing cues',
    estimate: (n: number) => `About ${n} min. Timing is an estimate.`,
    soundLabel: 'Background sound',
    noVoice: 'This browser can’t speak aloud, so follow the words on screen.',
    tip: 'Headphones help. Find a spot where you won’t be interrupted, and you can stop at any time.',
    begin: 'Begin',
    back: 'Back',
    // During
    preparing: 'Getting ready…',
    remaining: (clock: string) => `${clock} left`,
    progressLabel: 'Progress',
    breatheIn: 'Breathe in',
    breatheOut: 'Breathe out',
    pause: 'Pause',
    resume: 'Resume',
    end: 'End',
    restart: 'Restart',
    paused: 'Paused',
    voiceDevice: 'Voice: your device’s built-in voice',
    voiceRecorded: 'Voice: natural voice recording',
    voiceSilent: 'Voice off: follow the words on screen',
    voiceMissing:
      'This device has no voice for this language yet, so follow the words on screen. You can add one in your device’s text-to-speech settings.',
    canStop: 'You can open your eyes or stop at any time.',
    // After
    doneTitle: 'Well done',
    endedTitle: 'Practice ended',
    beforeWas: (noun: string, n: number) => `Before, your ${noun} was ${n} out of 100.`,
    howStrongNow: (noun: string) => `How strong is your ${noun} now? (0 = gone, 10 = overwhelming)`,
    feelWords: {
      calmer: 'Calmer',
      clearer: 'Clearer',
      focused: 'More focused',
      confident: 'More confident',
      hopeful: 'More hopeful',
      same: 'About the same',
      other: 'Something else',
    } as Record<string, string>,
    feelHint: 'Optional. Choose any that fit; no change is fine too.',
    saveFeel: 'Save',
    skipFeel: 'Skip',
    feelSaved: 'Saved. You’ll find it in your Journal.',
    howNow: 'How are you feeling now?',
    felt: { better: 'Better', same: 'About the same', worse: 'Worse' },
    save: 'Save',
    change: (name: string, before: number, after: number) => `${name}: ${before} → ${after}`,
    lighter: (n: number) => `That’s ${n} points lighter. Nice work.`,
    same: 'About the same. That’s okay: practice builds over time.',
    stronger: 'It feels stronger right now. Thanks for being honest. A different practice, a short walk or talking to someone might help more today.',
    feltBetter: 'Glad it helped.',
    feltSame: 'That’s okay. Like any skill, visualization gets easier with practice.',
    feltWorse: 'Thanks for being honest. Not every practice suits every moment. You could try a different one, or take a break.',
    again: 'Back to practices',
    saveFailed: 'That didn’t save. Please try again.',
    checkIn: 'New check-in',
  },

  bloom: {
    title: (name: string) => `${name} bloom`,
    one: (name: string, n: number) => `${name} at ${n} out of 100.`,
    two: (name: string, n: number, name2: string, n2: number) =>
      `${name} at ${n} out of 100, with ${name2} at ${n2}.`,
  },
  tags: {
    suggested: {
      work: 'work',
      school: 'school',
      sleep: 'sleep',
      family: 'family',
      friends: 'friends',
      health: 'health',
      exercise: 'exercise',
      money: 'money',
      weather: 'weather',
      relationship: 'relationship',
    } as Record<string, string>,
  },
  chart: {
    summary: (days: number, parts: string[]) =>
      parts.length ? `In the last ${days} days: ${parts.join(', ')}.` : `No check-ins in the last ${days} days yet.`,
    part: (name: string, count: number, avg: number) => `${name} ${times(count)} (average ${avg})`,
    showTable: 'Show as table',
    colEmotion: 'Emotion',
    colTimes: 'Times',
    colAverage: 'Average intensity',
  },

  history: {
    weekHeading: 'Your week',
    filterLabel: 'Show check-ins tagged',
    filterAny: 'Any tag or none',
    calendarHeading: 'Mood calendar',
    insightsHeading: 'Patterns you might notice',
    insightsNote: 'These are patterns in what you’ve logged, not causes. They get clearer the more you check in.',
    insightsEmpty: 'Tag a few more check-ins and patterns will show up here.',
    patternsHeading: 'Your patterns',
    rangeLabel: 'Time range',
    days: (n: number) => `${n} days`,
    checkInsStat: 'Check-ins',
    streakStat: 'Day streak',
    practicesStat: 'Practices',
    practiceLogHeading: 'Practice log',
    practiceLogEmpty: 'Your visualizations will show up here.',
    practiceItem: (title: string, minutes: number) => `${title} · ${minutes} min`,
    endedEarly: 'ended early',
    again: 'Create again',
    listHeading: 'Check-ins',
    empty: 'Nothing here yet. Your check-ins will show up here.',
    yourRating: ' (your rating)',
    tagsLabel: 'Tags:',
    delete: 'Delete',
    deleteLabel: (when: string) => `Delete check-in from ${when}`,
    deleteConfirm: (when: string) => `Delete the check-in from ${when}?`,
  },

  calendar: {
    caption: (weeks: number) =>
      `Mood calendar for the last ${weeks} weeks. Each day shows the feeling you logged most.`,
    noCheckIns: (date: string) => `${date}: no check-ins`,
    day: (date: string, name: string, band: string, avg: number, count: number) =>
      `${date}: mostly ${name}, ${band.toLowerCase()} (${avg}), ${checkIns(count)}`,
    legendNote: 'Paler = milder, deeper = stronger',
  },

  reflection: {
    empty: 'No check-ins in the last 7 days yet. A quick one today is a good place to start.',
    count: (n: number) => `You checked in ${times(n)} this week.`,
    top: (name: string, n: number) => `${name} came up most (${times(n)}).`,
    lighter: 'Overall, this week felt a bit lighter than last week.',
    heavier: 'Overall, this week felt a bit heavier than last week. Be gentle with yourself.',
    same: 'Overall, this week felt about the same as last week.',
    strongest: (noun: string, weekday: string, n: number) =>
      `Your strongest feeling was ${noun} on ${weekday} (${n}/100).`,
    tag: (tag: string, n: number, adjective: string) =>
      `“${tag}” came up ${n} times, and those check-ins were mostly ${adjective}.`,
  },

  insights: {
    lighter: (tag: string) => `You tend to feel lighter on check-ins tagged “${tag}”.`,
    heavier: (tag: string) => `Check-ins tagged “${tag}” tend to feel heavier than your others.`,
    emotion: (tag: string, name: string, pct: number) =>
      `When you tag “${tag}”, the feeling that comes up most is ${name} (${pct}% of the time).`,
    basedOn: (n: number) => `Based on ${checkIns(n)} from the last 30 days.`,
  },

  onboarding: {
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    steps: [
      {
        title: 'Say how you feel, and where you’d like to go',
        body: 'Use your own words. Mention a place if you like, or what would help. There are no wrong answers.',
        example: '“I’m anxious about my exam tomorrow. Take me to a quiet beach.”',
      },
      {
        title: 'Get a visualization made just for you',
        body: 'Viz it writes a guided visualization from your words in a moment: your feeling, your place, what you need. Choose 3, 5 or 10 minutes.',
        example: '',
      },
      {
        title: 'Close your eyes and follow the voice',
        body: 'A calm voice guides you while a breathing circle keeps your pace. Afterwards, see how much the feeling changed. New to it? Start with the basics in the Library.',
        example: '',
      },
      {
        title: 'Your data stays with you',
        body: 'Everything is saved on this device. Nothing is sent anywhere unless you turn on smarter analysis or sign in to sync, and you can export or delete it at any time.',
        example: '',
      },
    ],
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    done: 'Let’s start',
  },

  crisis: {
    title: 'It sounds like you’re going through something really hard.',
    askedTitle: 'Talk to someone now',
    body: 'You don’t have to handle it alone. These lines are free, confidential and open 24 hours.',
    call: (phone: string) => `Call ${phone}`,
    text: (phone: string) => `Text ${phone}`,
    emergency: 'If you might be in danger right now, call',
    emergencyUnknown: 'If you might be in danger right now, call your local emergency number.',
    emergencyShort: (phone: string) => `emergency ${phone}`,
    elsewhere: 'Somewhere else? Find free helplines in any country at',
    findLine: 'Find free, confidential helplines in your country at',
    otherCountries: 'Support lines in other countries',
    dismiss: 'Close',
  },

  privacy: {
    title: 'Privacy',
    updated: (date: string) => `Last updated ${date}`,
    summary:
      'The short version: what you write stays on your device. Viz it has no ads, no analytics and no tracking, and never sells or shares anything about you.',
    sections: [
      {
        heading: 'What’s saved on your device',
        body: [
          'Your check-ins (what you wrote, the feelings and scores, your own ratings and tags), your practice log and your settings are saved in this browser, on this device only.',
          'They stay until you delete them. Clearing this site’s data in your browser deletes them too.',
        ],
      },
      {
        heading: 'What Viz it doesn’t do',
        body: [
          'No ads, no analytics, no tracking cookies, and no scripts from other companies. The app doesn’t load anything from other websites.',
          'Viz it never sells, rents or shares your data.',
        ],
      },
      {
        heading: 'Loading the site',
        body: [
          'This site is hosted on GitHub Pages. Like any web host, GitHub receives your IP address and basic browser details when your browser loads the app, and keeps them for security. Viz it itself never sees them.',
        ],
        link: {
          label: 'GitHub’s privacy statement',
          href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
        },
      },
      {
        heading: 'Smarter analysis (optional, off by default)',
        body: [
          'Only if you turn it on. Each time you press Visualize, only the words in the box are sent to the Viz it server, which passes them to Claude, an AI model made by Anthropic, to score your feelings. The server doesn’t store or log them.',
          'Anthropic handles them under its own privacy policy.',
        ],
        link: { label: 'Anthropic’s privacy policy', href: 'https://www.anthropic.com/legal/privacy' },
      },
      {
        heading: 'Account and sync (optional)',
        body: [
          'Only if you sign in. Your email address and your check-ins’ feelings, scores, dates, tags and ratings are stored with Supabase so they can sync between your devices. What you wrote is included only if you turn on “Sync what I wrote”.',
          'Each account can only read its own data. Deleting your account deletes everything stored in it.',
        ],
        link: { label: 'Supabase’s privacy policy', href: 'https://supabase.com/privacy' },
      },
      {
        heading: 'Sharing, reminders, exports and practices',
        body: [
          'Share images and export files are made on your device and go only where you send them. Reminders come from your own device, and the calendar reminder is a file you add yourself.',
          'Guided practices play recordings from this site, or your device’s own voice. Nothing you say or do during a practice is recorded or sent anywhere.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'In Settings you can export your data as CSV or JSON, delete all of it, and delete your account. You can delete single check-ins in History.',
        ],
      },
      {
        heading: 'Not a medical service',
        body: [
          'Viz it is a reflection tool, not a diagnosis or treatment. Its scores come from a word list or an AI model and can be wrong. If you’re struggling, please reach out to someone. “Get support now” at the bottom of every page lists free helplines.',
        ],
      },
      {
        heading: 'Questions and changes',
        body: [
          'Ask on the Viz it GitHub page. Please don’t include anything personal there, because it’s public. If this policy changes, the date at the top changes too.',
        ],
        link: { label: 'Viz it on GitHub', href: 'https://github.com/npanchal123/vizit/issues' },
      },
    ] as { heading: string; body: string[]; link?: { label: string; href: string } }[],
  },

  consent: {
    title: 'Turn on smarter analysis?',
    description: 'Smarter analysis understands mixed and subtle feelings better than the built-in word list.',
    whatChanges: 'What changes:',
    points: [
      'When you press Visualize, the words you typed in that box are sent to the Viz it server and on to Claude, an AI model made by Anthropic, which reads them to score your feelings.',
      'Nothing else is sent: not your history, tags, ratings or account.',
      'If it isn’t available, Viz it quietly uses the built-in word list instead.',
      'You can turn it off at any time in Settings.',
    ],
    privacyBefore: 'Read',
    privacyLink: 'Anthropic’s privacy policy',
    privacyAfter: 'to see how they handle it.',
    decline: 'Not now',
    accept: 'Turn on',
  },

  settings: {
    displayHeading: 'Display and language',
    themeLabel: 'Theme',
    themes: { system: 'Match my device', light: 'Light', dark: 'Dark', contrast: 'High contrast' },
    languageLabel: 'Language',
    languageHint:
      'The built-in word list understands all of these languages, including Hinglish. Smarter analysis understands most others too.',
    calmTitle: 'Calm mode',
    calmHint: 'Turns off animation. It’s also on automatically if your device asks for reduced motion.',
    skyTitle: 'Move the sun and moon',
    skyHint: 'Drag them around the empty background.',
    skyReset: 'Reset the sky',
    skyResetDone: 'The sky is back to how it started.',
    aiHeading: 'Smarter analysis',
    aiTitle: 'Use AI to read my check-ins',
    aiHint:
      'Better at mixed and subtle feelings. Sends only the words you type to Claude (by Anthropic). Off by default.',
    remindersHeading: 'Reminders',
    reminderTitle: 'Remind me to check in every day',
    reminderTime: 'Reminder time',
    reminderHint:
      'Viz it can only remind you while it’s open, or installed and running. For a reminder that always arrives, add it to your calendar.',
    reminderBlocked: 'Notifications are blocked for this site, so the reminder will appear inside Viz it only.',
    reminderCalendar: 'Add a daily reminder to my calendar',
    installHeading: 'Install the app',
    installHint: 'Install Viz it to open it from your home screen or desktop. It works offline.',
    installButton: 'Install Viz it',
    installDone: 'Viz it is installed on this device.',
    installIos: 'On iPhone or iPad: tap the Share button in Safari, then “Add to Home Screen”.',
    installUnavailable:
      'Your browser isn’t offering to install right now. Look for “Install” or “Add to Home Screen” in its menu.',
    accountHeading: 'Account and sync',
    dataHeading: 'Your data',
    includeText: 'Include what I wrote in exports',
    exportCsv: 'Export CSV',
    exportJson: 'Export JSON',
    deleteAll: 'Delete all data',
    deleteAllConfirm: (synced: boolean) =>
      `Delete all your check-ins?${synced ? ' This also deletes them from your account and your other synced devices.' : ''} This can’t be undone.`,
    rescoreTitle: 'Update older check-ins',
    rescoreHint: (n: number) =>
      `${n === 1 ? '1 check-in was' : `${n} check-ins were`} read by an older version of the built-in word list. Updating re-reads what you wrote with the current one. Your own ratings and tags stay as they are.`,
    rescoreButton: 'Update them',
    rescoreDone: (n: number) => (n === 1 ? 'Updated 1 check-in.' : `Updated ${n} check-ins.`),
    rescoreNone: 'Nothing needed changing.',
    privacyLink: 'How Viz it handles your data',
  },

  account: {
    notConfigured:
      'Sync isn’t set up for this copy of Viz it, so everything stays on this device. (For developers: add your Supabase details to .env. See the README.)',
    intro: 'Sign in to back up your check-ins and see them on your other devices. No password needed.',
    emailLabel: 'Email',
    sendLink: 'Email me a sign-in link',
    sending: 'Sending…',
    linkSent: 'Check your inbox for a sign-in link.',
    linkFailed: (message: string) => `Couldn’t send the link: ${message}`,
    signedInAs: 'Signed in as',
    status: {
      idle: 'Up to date',
      syncing: 'Syncing…',
      offline: 'Offline. Changes will sync when you’re back online.',
      error: 'Couldn’t sync',
    },
    lastSynced: (when: string) => ` · last synced ${when}`,
    syncNow: 'Sync now',
    syncTextTitle: 'Sync what I wrote',
    syncTextHint:
      'Off: only feelings, scores, dates and tags are backed up, and your words stay on this device. On: your words are stored in your account too.',
    signOut: 'Sign out',
    signOutRemove: 'Sign out and remove from this device',
    signOutRemoveConfirm:
      'Remove your check-ins from this device? They stay safe in your account and other synced devices.',
    mergeConfirm:
      'This device has check-ins from a different account. Add them to the account you just signed in to? Choose Cancel to remove them from this device instead.',
    deleteAccount: 'Delete my account…',
  },

  deleteAccount: {
    title: 'Delete your account?',
    body: 'This permanently deletes your account and every check-in stored in it, on every device that syncs with it. It can’t be undone.',
    alsoLocal: 'Also delete my check-ins from this device',
    keepNote: 'If you leave this off, your check-ins stay on this device only.',
    confirm: 'Delete my account',
    deleting: 'Deleting…',
    cancel: 'Cancel',
    failed: (message: string) => `Couldn’t delete your account: ${message}`,
  },
};

export type Messages = typeof en;
