import type { ComposeContent } from './types';

/** Flips the speaker's words to the listener's: "my grandma's garden" → "your grandma's garden". */
function toYou(phrase: string): string {
  const swaps: Record<string, string> = { my: 'your', me: 'you', i: 'you', myself: 'yourself', mine: 'yours', am: 'are' };
  return phrase.replace(/\b(my|me|i|myself|mine|am)\b/gi, (w) => swaps[w.toLowerCase()]);
}

const PLACE_CUE =
  /\b(?:take me (?:to|back to)|imagine (?:being |myself )?(?:at|in|on|by)|visuali[sz]e (?:being |myself )?(?:at|in|on|by)|picture (?:myself )?(?:at|in|on|by)|i (?:want|would like|'d like|wish) to (?:be|go|sit|walk)(?: back)? (?:to|at|in|on|by)|i wish i (?:was|were) (?:at|in|on|by)|somewhere like)\s+([^.,!?;\n]{3,60})/i;

/**
 * English building blocks for composed visualizations. Lines are short and spoken slowly; every scene and
 * goal works with every other, so they never refer to each other's details.
 */
export const en: ComposeContent = {
  mirror: (feeling, topic) =>
    feeling
      ? `You told me you’re feeling ${feeling.adjective}${topic ? ` about ${topic}` : ''}. That makes sense. For the next few minutes, let’s take care of that together.`
      : 'Thank you for taking this time for yourself. For the next few minutes, there’s nothing else you need to do.',
  arrival: [
    { tier: 3, pause: 1, text: 'Get comfortable, and close your eyes if that feels okay. You can open them at any time.' },
    { tier: 3, pause: 3, breath: true, text: 'Breathe in slowly… and out, a little longer than the breath in.' },
    { tier: 5, pause: 3, breath: true, text: 'Again. In… and a long, easy breath out. Let your shoulders soften.' },
  ],
  closing: [
    { tier: 5, pause: 3, text: 'Take one more look around {place}. You can come back here whenever you need, just by remembering it.' },
    { tier: 3, pause: 1, text: 'Take a deeper breath. Feel your body where you are, wiggle your fingers, and when you’re ready, open your eyes.' },
  ],
  anyPlace: [
    { tier: 3, pause: 3, text: 'Now let {place} appear around you, slowly, in whatever way it comes. A picture, a feeling, or simply knowing you’re there.' },
    { tier: 3, pause: 3, text: 'Look around. Notice the colors, and the light. What do you see first?' },
    { tier: 5, pause: 3, text: 'Listen. What sounds belong to this place? Near, and far away.' },
    { tier: 3, pause: 3, text: 'Notice what’s beneath you, and the feel of the air on your skin.' },
    { tier: 10, pause: 3, text: 'Is there a scent here? Breathe it in, slowly.' },
    { tier: 5, pause: 4, breath: true, text: 'Let yourself settle into {place}. You’re safe here, and there’s nowhere else to be.' },
  ],
  findPlace: (text) => {
    const match = PLACE_CUE.exec(text);
    if (!match) return null;
    // Stop at the start of another thought: "a beach and forget my exam" → "a beach".
    const raw = match[1].split(/\s+(?:and|but|so|because|where|to forget|to relax|to feel|for)\s+/i)[0].trim();
    return raw.length >= 3 ? { raw, place: toYou(raw) } : null;
  },
  title: (place) => place.charAt(0).toUpperCase() + place.slice(1),
  subtitle: (goal, topic) => (topic ? `${goal} · about ${topic}` : goal),
  defaultTopic: 'what’s on your mind',

  scenes: {
    beach: {
      name: 'Beach',
      title: 'Quiet Beach',
      place: 'a quiet beach',
      carrier: 'a wave',
      keywords: ['beach', 'sea', 'ocean', 'waves', 'shore', 'coast', 'seaside', 'goa'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself arriving at {place}. The sand is warm, and the sea stretches out in front of you.' },
        { tier: 3, pause: 3, text: 'Look at the water. Notice its colors, and the light shining on the surface.' },
        { tier: 5, pause: 3, text: 'Listen to the waves. Each one rolls in… and slowly draws back out.' },
        { tier: 3, pause: 3, text: 'Feel the warm sand under you, and a soft breeze coming off the water.' },
        { tier: 10, pause: 3, text: 'Breathe in the fresh, salty air.' },
        { tier: 5, pause: 4, breath: true, text: 'Let your breathing move with the waves. In as they come in… out as they go out.' },
      ],
    },
    forest: {
      name: 'Forest',
      title: 'Peaceful Forest',
      place: 'a peaceful forest',
      carrier: 'the breeze',
      keywords: ['forest', 'woods', 'trees', 'jungle'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself walking into {place}. Tall trees rise around you, and the path is soft underfoot.' },
        { tier: 3, pause: 3, text: 'Look up. Sunlight filters through the leaves in small, moving patches.' },
        { tier: 5, pause: 3, text: 'Listen. Birds calling, leaves rustling, maybe water somewhere nearby.' },
        { tier: 3, pause: 3, text: 'Rest your hand on a tree trunk. Feel how steady it is, how old.' },
        { tier: 10, pause: 3, text: 'Breathe in the smell of earth, and green leaves, and fresh air.' },
        { tier: 5, pause: 4, breath: true, text: 'Let the stillness of the trees settle into you, one breath at a time.' },
      ],
    },
    mountain: {
      name: 'Mountains',
      title: 'Mountain View',
      place: 'a mountain top',
      carrier: 'the wind',
      keywords: ['mountain', 'mountains', 'hill', 'hills', 'peak', 'himalaya', 'himalayas', 'valley', 'summit'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself at {place}. The air is cool and clear, and you can see for miles.' },
        { tier: 3, pause: 3, text: 'Look out over the valleys and the far-off peaks. Notice how big and open everything is.' },
        { tier: 5, pause: 3, text: 'Listen to the quiet up here. Maybe a little wind, maybe a bird far below.' },
        { tier: 3, pause: 3, text: 'Feel the solid rock beneath you. It has stood here for thousands of years.' },
        { tier: 10, pause: 3, text: 'Breathe in the cold, clean mountain air. Feel it fill your chest.' },
        { tier: 5, pause: 4, breath: true, text: 'Up here, your worries look smaller. Let yourself feel that space.' },
      ],
    },
    garden: {
      name: 'Garden',
      title: 'Sunny Garden',
      place: 'a sunny garden',
      carrier: 'a butterfly',
      keywords: ['garden', 'flowers', 'park', 'meadow', 'field'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself in {place}. Flowers are everywhere, and the sun is gentle and warm.' },
        { tier: 3, pause: 3, text: 'Look at the colors around you. Bright petals, green leaves, a clear sky above.' },
        { tier: 5, pause: 3, text: 'Listen. Bees humming, birds singing, leaves moving softly.' },
        { tier: 3, pause: 3, text: 'Feel the soft grass beneath you, and the sunlight on your face.' },
        { tier: 10, pause: 3, text: 'Breathe in the sweet smell of the flowers.' },
        { tier: 5, pause: 4, breath: true, text: 'Let the warmth of this place reach all the way into you.' },
      ],
    },
    river: {
      name: 'River',
      title: 'Gentle River',
      place: 'a gentle river',
      carrier: 'a leaf on the water',
      keywords: ['river', 'stream', 'lake', 'waterfall', 'ganga', 'creek'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself sitting beside {place}. Clear water flows steadily past you.' },
        { tier: 3, pause: 3, text: 'Watch the water. See how the light dances on it as it moves.' },
        { tier: 5, pause: 3, text: 'Listen to it flowing, a soft, steady sound that never stops.' },
        { tier: 3, pause: 3, text: 'Feel the cool air coming off the water, and the smooth stones beside you.' },
        { tier: 10, pause: 3, text: 'Breathe in the fresh, clean smell of the water.' },
        { tier: 5, pause: 4, breath: true, text: 'Let your breath flow like the river. Easy, and unhurried.' },
      ],
    },
    rain: {
      name: 'Rain',
      title: 'Cozy Rain',
      place: 'a cozy room while it rains outside',
      carrier: 'the rain',
      keywords: ['rain', 'raining', 'rainy', 'monsoon', 'storm', 'drizzle'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself in {place}. You’re warm and dry, wrapped in something soft.' },
        { tier: 3, pause: 3, text: 'Look out of the window. Drops run down the glass, and everything outside is fresh and green.' },
        { tier: 5, pause: 3, text: 'Listen to the rain. Pattering on the roof, gentle and steady.' },
        { tier: 3, pause: 3, text: 'Feel the warmth around you. Maybe a blanket, or a warm cup in your hands.' },
        { tier: 10, pause: 3, text: 'Breathe in the smell of rain on earth.' },
        { tier: 5, pause: 4, breath: true, text: 'There’s nowhere you need to go. Let the rain slow everything down.' },
      ],
    },
    stars: {
      name: 'Night sky',
      title: 'Starry Night',
      place: 'a quiet place under the stars',
      carrier: 'a shooting star',
      keywords: ['stars', 'starry', 'night', 'moon', 'moonlight', 'galaxy'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself lying in {place}. The night is calm, and the air is cool.' },
        { tier: 3, pause: 3, text: 'Look up. Thousands of stars, and a soft moon glowing above you.' },
        { tier: 5, pause: 3, text: 'Listen to the quiet of the night. Maybe crickets, maybe a gentle breeze.' },
        { tier: 3, pause: 3, text: 'Feel the ground holding you. You don’t have to hold yourself up.' },
        { tier: 10, pause: 3, text: 'Breathe in the cool night air.' },
        { tier: 5, pause: 4, breath: true, text: 'Under this huge, quiet sky, let yourself feel small, and safe, and calm.' },
      ],
    },
    home: {
      name: 'Safe room',
      title: 'Safe Room',
      place: 'a warm, safe room',
      carrier: 'a breeze from the open window',
      keywords: ['home', 'house', 'room', 'bed', 'bedroom'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture yourself in {place}. Everything here feels familiar and kind.' },
        { tier: 3, pause: 3, text: 'Look around. Soft light, your favorite things, colors you love.' },
        { tier: 5, pause: 3, text: 'Listen. Familiar, comforting sounds, or a peaceful quiet.' },
        { tier: 3, pause: 3, text: 'Feel something soft beneath you, holding you completely.' },
        { tier: 10, pause: 3, text: 'Breathe in a comforting smell. Maybe food cooking, or fresh sheets, or tea.' },
        { tier: 5, pause: 4, breath: true, text: 'You’re safe here. You can rest.' },
      ],
    },
    sky: {
      name: 'Open sky',
      title: 'Open Sky',
      place: 'a wide, open sky',
      carrier: 'a cloud',
      keywords: ['sky', 'clouds', 'cloud', 'flying', 'fly', 'float', 'floating', 'bird'],
      lines: [
        { tier: 3, pause: 3, text: 'Picture {place} all around you. You’re floating gently, completely supported.' },
        { tier: 3, pause: 3, text: 'Look around. Soft white clouds, and blue in every direction.' },
        { tier: 5, pause: 3, text: 'Listen to the quiet. Just the soft sound of air moving past.' },
        { tier: 3, pause: 3, text: 'Feel how light your body is, as if the air itself is holding you.' },
        { tier: 10, pause: 3, text: 'Breathe in the clean, fresh air, high above everything.' },
        { tier: 5, pause: 4, breath: true, text: 'Let yourself float. There’s so much space here.' },
      ],
    },
  },

  goals: {
    calm: {
      name: 'Calm down',
      keywords: ['calm', 'relax', 'relaxed', 'peace', 'peaceful', 'chill', 'quiet', 'unwind', 'stress'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'With each breath out, let your body get a little heavier, and a little softer.' },
        { tier: 3, pause: 4, text: 'If a thought about {topic} drifts in, notice it, and let {carrier} carry it away.' },
        { tier: 5, pause: 4, text: 'Notice your forehead, your jaw, your shoulders. Let each one let go, just a little.' },
        { tier: 10, pause: 5, text: 'Feel the calm of this place soaking into you, like warmth into cold hands.' },
        { tier: 10, pause: 5, breath: true, text: 'Breathe in calm… breathe out tension. In calm… out tension.' },
        { tier: 3, pause: 4, text: 'You are safe right now. In this moment, you don’t have to solve anything.' },
      ],
    },
    letgo: {
      name: 'Let go',
      keywords: ['let go', 'release', 'forget', 'move on', 'overthinking', 'stop thinking', 'get over'],
      lines: [
        { tier: 3, pause: 4, text: 'Now bring {topic} to mind, just for a moment. Notice where you feel it in your body.' },
        { tier: 3, pause: 5, text: 'Imagine placing that feeling on {carrier}, and watch it slowly move away from you.' },
        { tier: 5, pause: 5, text: 'If it comes back, that’s okay. Place it there again. There’s no need to push.' },
        { tier: 10, pause: 5, text: 'With each breath out, imagine letting go of a little more. You don’t have to carry all of it.' },
        { tier: 10, pause: 5, text: 'Notice the space it leaves behind. Lighter. Quieter.' },
        { tier: 3, pause: 4, breath: true, text: 'Breathe into that space, and let it fill with calm.' },
      ],
    },
    kindness: {
      name: 'Comfort',
      keywords: ['comfort', 'self love', 'love myself', 'kind to myself', 'hug', 'heal', 'healing', 'lonely', 'alone', 'hurt'],
      lines: [
        { tier: 3, pause: 4, text: 'Place a hand on your heart, if you like. Feel its warmth.' },
        { tier: 3, pause: 4, text: 'Imagine a soft, warm light gathering around you here, gentle like morning sun.' },
        { tier: 5, pause: 5, text: 'Let the light hold whatever you’re feeling about {topic}, the way you’d hold a friend’s hand.' },
        { tier: 10, pause: 5, text: 'Silently say to yourself: I’m doing the best I can. I deserve kindness too.' },
        { tier: 10, pause: 5, text: 'Imagine someone who cares about you, sitting beside you. You don’t need to say anything. You’re not alone.' },
        { tier: 3, pause: 4, breath: true, text: 'Breathe in warmth… and breathe out, a little softer each time.' },
      ],
    },
    sleep: {
      name: 'Sleep',
      keywords: ['sleep', 'asleep', 'insomnia', 'bedtime'],
      lines: [
        { tier: 3, pause: 5, breath: true, text: 'Let your breathing slow down, all by itself. Slower… and softer.' },
        { tier: 3, pause: 5, text: 'Feel your feet getting heavy and warm. Then your legs. Then your hips.' },
        { tier: 5, pause: 5, text: 'Now your back, your arms, your hands. Heavy, warm, and still.' },
        { tier: 10, pause: 6, text: 'Your face softens. Your eyes rest. Even your thoughts begin to slow down.' },
        { tier: 10, pause: 6, text: 'If a thought about {topic} comes, let {carrier} carry it away. It can wait until morning.' },
        { tier: 3, pause: 6, breath: true, text: 'There’s nothing to do now but rest. Drift as deep as you like.' },
      ],
    },
    confidence: {
      name: 'Confidence',
      keywords: ['confidence', 'confident', 'brave', 'courage', 'interview', 'presentation', 'strong', 'believe in myself'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Sit a little taller. Breathe in, and feel your chest open.' },
        { tier: 3, pause: 5, text: 'Now imagine {topic} going well. See yourself calm, prepared and steady.' },
        { tier: 5, pause: 5, text: 'Notice how you stand, how you speak, how you breathe. Steady and clear.' },
        { tier: 10, pause: 5, text: 'Remember a time you did something hard and got through it. That strength is still in you.' },
        { tier: 10, pause: 5, text: 'Say to yourself, silently: I am ready. I can handle this, one step at a time.' },
        { tier: 3, pause: 4, text: 'Hold on to that feeling. You can bring it with you.' },
      ],
    },
    energy: {
      name: 'Energy',
      keywords: ['energy', 'energized', 'motivation', 'motivated', 'lazy', 'boost', 'refresh'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Take a bigger breath in, filling your whole chest… and let it go.' },
        { tier: 3, pause: 4, text: 'Imagine the light here getting brighter, warmer, full of energy.' },
        { tier: 5, pause: 4, text: 'With each breath in, draw that bright energy into your body.' },
        { tier: 10, pause: 4, text: 'Feel it spreading: through your chest, down your arms, into your hands and fingertips.' },
        { tier: 10, pause: 4, text: 'Picture yourself getting up after this, moving easily, ready for what’s next.' },
        { tier: 3, pause: 4, breath: true, text: 'One more energizing breath in… and out. You’re awake, and ready.' },
      ],
    },
    joy: {
      name: 'Savor joy',
      keywords: ['celebrate', 'enjoy', 'savor', 'savour', 'grateful', 'gratitude'],
      lines: [
        { tier: 3, pause: 4, text: 'Bring to mind what’s making you feel good today. Let it be here with you.' },
        { tier: 3, pause: 4, text: 'Notice where the good feeling lives in your body. Maybe a warmth, or a lightness.' },
        { tier: 5, pause: 4, breath: true, text: 'With each breath in, let that feeling grow a little bigger.' },
        { tier: 10, pause: 4, text: 'Imagine it as a color, glowing brighter with every breath.' },
        { tier: 10, pause: 4, text: 'Silently say thank you, to someone, to life, or to yourself, for this moment.' },
        { tier: 3, pause: 4, text: 'Take a mental photograph of this feeling, to come back to on a harder day.' },
      ],
    },
    focus: {
      name: 'Focus',
      keywords: ['focus', 'concentrate', 'concentration', 'study', 'studying', 'clear mind', 'clarity', 'distracted'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: 'Bring your attention to your breath. Just this breath… and this one.' },
        { tier: 3, pause: 4, text: 'Thoughts may come. Let {carrier} carry each one away, and come back to your breath.' },
        { tier: 5, pause: 5, text: 'Picture your mind as clear water. Let it settle until you can see all the way down.' },
        { tier: 10, pause: 5, text: 'Now think of one small, clear next step for {topic}. Just one.' },
        { tier: 10, pause: 5, text: 'See yourself doing that one step, calmly and fully.' },
        { tier: 3, pause: 4, text: 'Your mind is clear and steady. You can take this focus with you.' },
      ],
    },
  },

  topics: {
    exam: { phrase: 'the exam', keywords: ['exam', 'exams', 'test', 'tests', 'results', 'board', 'boards'] },
    work: { phrase: 'work', keywords: ['work', 'job', 'boss', 'office', 'deadline', 'deadlines', 'career', 'interview'] },
    relationship: {
      phrase: 'your relationship',
      keywords: ['boyfriend', 'girlfriend', 'partner', 'breakup', 'break up', 'husband', 'wife', 'relationship', 'crush', 'marriage'],
    },
    family: { phrase: 'your family', keywords: ['family', 'parents', 'mom', 'dad', 'mother', 'father', 'brother', 'sister'] },
    friends: { phrase: 'your friend', keywords: ['friend', 'friends', 'friendship'] },
    health: { phrase: 'your health', keywords: ['health', 'sick', 'ill', 'pain', 'hospital', 'illness', 'doctor'] },
    money: { phrase: 'money', keywords: ['money', 'rent', 'loan', 'debt', 'bills', 'salary', 'fees'] },
    future: { phrase: 'the future', keywords: ['future', 'uncertain', 'what will happen'] },
    exercise: { phrase: 'your workout', keywords: ['exercise', 'workout', 'gym', 'running', 'yoga'] },
  },
};
