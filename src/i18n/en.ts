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
    skipLink: 'Skip to main content',
    navLabel: 'Main',
    views: { today: 'Check in', history: 'History', settings: 'Settings' },
    pageHeading: (view: string) => `Viz it: ${view}`,
    emptyResult: 'Your emotion bloom will appear here.',
    thisWeek: 'This week',
    aiFallback: 'Smarter analysis isn’t available right now, so the built-in word list was used.',
    loading: 'Loading…',
    footer: 'Viz it is a reflection tool. It isn’t a diagnosis or a replacement for professional support.',
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
  },

  entry: {
    label: 'How are you feeling?',
    hintLocal: 'Write it in your own words. What you write stays on this device.',
    hintAi: 'Write it in your own words. Smarter analysis is on, so this text is sent to Claude when you press Visualize.',
    placeholder: 'Today I feel… because…',
    count: (n: number, max: number) => `${n}/${max} characters`,
    chipsLegend: 'Or pick what fits (optional)',
    needsChip: 'I couldn’t tell from those words. Pick one or more feelings that fit, then try again.',
    submit: 'Visualize',
    submitting: 'Visualizing…',
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

  bloom: {
    title: (name: string) => `${name} bloom`,
    one: (name: string, n: number) => `${name} at ${n} out of 100.`,
    two: (name: string, n: number, name2: string, n2: number) =>
      `${name} at ${n} out of 100, with ${name2} at ${n2}.`,
  },

  gauge: {
    label: 'Intensity',
    valueText: (n: number, band: string) => `${n} out of 100, ${band.toLowerCase()}`,
  },

  tags: {
    legend: 'What’s this about? (optional)',
    hint: (max: number) => `Tags help you spot patterns later. Up to ${max}.`,
    addLabel: 'Add your own tag',
    addPlaceholder: 'Add your own',
    add: 'Add',
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
    } as Record<string, string>,
  },

  share: {
    title: 'Share or save',
    description: 'Choose what goes on the image. Nothing leaves the app until you press Save or Share.',
    legend: 'Include on the image',
    name: 'Feeling name',
    intensity: 'Intensity score',
    date: 'Date and time',
    text: 'What I wrote',
    textWarning: 'Anyone who sees this image will be able to read your words.',
    share: 'Share',
    save: 'Save image',
    close: 'Close',
    saved: 'Image saved.',
    shared: 'Shared.',
    savedInstead: 'Sharing isn’t available here, so the image was saved instead.',
    renderFailed: 'Sorry, the image could not be made.',
    shareFailed: 'Sorry, sharing didn’t work.',
    shareTitle: 'My emotion bloom',
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
        title: 'Write how you feel',
        body: 'Use your own words. There are no wrong answers, and you can pick a feeling from a list if words are hard today.',
        example: '“I’m really anxious about tomorrow’s exam but kind of excited too.”',
      },
      {
        title: 'See it as a picture and a score',
        body: 'Color shows the feeling, size shows how strong it is, and a score from 0 to 100 sits underneath. If the score feels off, you can change it.',
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
    body: 'You don’t have to handle it alone. If you might be in danger, please call your local emergency number. You can find free, confidential support lines in your country at',
    dismiss: 'Dismiss',
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
      'The built-in word list understands English and Spanish. Smarter analysis understands most languages.',
    calmTitle: 'Calm mode',
    calmHint: 'Turns off animation. It’s also on automatically if your device asks for reduced motion.',
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
