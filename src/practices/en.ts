import type { PracticeContent } from './types';

/**
 * Guided visualization scripts. Written to be read aloud slowly, in plain words, always as an invitation
 * ("if you like", "you can open your eyes at any time"). Changing a step's text makes its recorded audio
 * stale; run `npm run audio` again afterwards (see the README).
 */
export const en: PracticeContent = {
  lessons: [
    {
      title: 'What is visualization?',
      body: [
        'Visualization means creating an experience in your mind with your senses: what you’d see, hear, feel, smell and taste.',
        'Athletes use it to prepare, and it’s part of many meditation and relaxation practices. Imagining a calm place can relax your body, a bit like actually being there.',
      ],
    },
    {
      title: 'What if I can’t see pictures?',
      body: [
        'That’s very common. Some people see clear images, some see faint flashes, and some don’t see pictures at all.',
        'You can still visualize by imagining sounds and textures, or simply by knowing what’s there. There’s no wrong way to do it.',
      ],
    },
    {
      title: 'How to get started',
      body: [
        'Find a quiet spot where no one will interrupt you for a few minutes. Sit or lie down comfortably. Headphones help.',
        'Closing your eyes helps many people, but you can also keep them open and softly focused on one spot. Start with 3 minutes.',
      ],
    },
    {
      title: 'When your mind wanders',
      body: [
        'It will, and that’s part of the practice. When you notice you’re thinking about something else, gently come back to the voice or your breath.',
        'Every time you come back, you’re building the skill.',
      ],
    },
    {
      title: 'Staying safe',
      body: [
        'Don’t practice while driving or doing anything that needs your attention.',
        'If an image or memory upsets you, open your eyes, look around and name a few things you can see. You can stop at any time.',
        'These practices support your wellbeing, but they aren’t a treatment. If you’re struggling, please reach out for support.',
      ],
    },
  ],

  practices: {
    'first-visualization': {
      title: 'Your first visualization',
      summary: 'A short, simple first try that shows how imagination can create real feelings.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. This is a short first practice, and there’s nothing to get right. Visualization simply means imagining with your senses, the way you do when you remember something.' },
        { id: 's02', tier: 3, pause: 2, breath: true, text: 'Sit comfortably. If it feels okay, close your eyes, or rest your gaze softly on the floor in front of you.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Take a slow breath in through your nose… and let it go through your mouth.' },
        { id: 's04', tier: 3, pause: 3, text: 'Now imagine a lemon in your hand. Notice its bright yellow color, and the little dimples in its skin.' },
        { id: 's05', tier: 3, pause: 3, text: 'Feel its weight. Is it cool? Smooth? Give it a gentle squeeze.' },
        { id: 's06', tier: 3, pause: 3, text: 'Now imagine cutting it in half. Juice runs onto your fingers, and a sharp, fresh smell rises up.' },
        { id: 's07', tier: 3, pause: 3, text: 'Bring one half close to your mouth, and imagine taking a small bite.' },
        { id: 's08', tier: 3, pause: 2, text: 'Maybe your mouth watered a little, or you could almost smell it. That’s visualization. Your mind can create real feelings from imagination.' },
        { id: 's09', tier: 3, pause: 2, text: 'And if you didn’t see a clear picture, that’s completely normal. Many people imagine through feeling, sound or simply knowing. All of it counts.' },
        { id: 's10', tier: 3, pause: 1, text: 'Let the lemon fade. Take one more slow breath. When you’re ready, open your eyes. Well done.' },
      ],
    },

    'safe-place': {
      title: 'Safe Place',
      summary: 'Build a calm, safe place in your mind that you can return to whenever you feel anxious.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. This practice helps you build a calm, safe place in your mind, somewhere you can return to whenever you feel anxious.' },
        { id: 's02', tier: 3, pause: 1, text: 'Get comfortable, and close your eyes if that feels okay. You can open them at any time.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Breathe in slowly… and out, a little longer than the breath in.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Again. In… and a long, slow breath out. Let your shoulders drop a little.' },
        { id: 's05', tier: 3, pause: 3, text: 'Now picture a place where you feel safe and at ease. It can be real, like a beach or a favorite room, or completely made up.' },
        { id: 's06', tier: 3, pause: 3, text: 'Look around. What colors do you see? Notice the light. Is it morning, or late afternoon?' },
        { id: 's07', tier: 5, pause: 3, text: 'Listen. Maybe there are waves, birdsong, rain on a window, or simply quiet.' },
        { id: 's08', tier: 10, pause: 3, text: 'Notice what you’re sitting or standing on. Sand, grass, a soft chair. Feel how it supports you.' },
        { id: 's09', tier: 3, pause: 3, text: 'Breathe in, and notice the air here. Is it warm, or cool? Does it carry a scent?' },
        { id: 's10', tier: 10, pause: 4, text: 'Nothing here can hurt you. This place is yours, and only what you invite can come in.' },
        { id: 's11', tier: 10, pause: 4, text: 'If a worry drifts in, notice it, and let it float back out, like a cloud passing beyond the edge of this place.' },
        { id: 's12', tier: 5, pause: 4, breath: true, text: 'Let your body take in how safe this feels. Your breathing slows. Your jaw softens.' },
        { id: 's13', tier: 10, pause: 4, text: 'Choose one small detail to remember: a color, a sound, a texture. This will be your way back here.' },
        { id: 's14', tier: 3, pause: 2, text: 'You can return to this place whenever you need it, even with your eyes open, just by remembering it.' },
        { id: 's15', tier: 3, pause: 1, text: 'Take one more slow breath. Wiggle your fingers and toes, and when you’re ready, open your eyes.' },
      ],
    },

    'warm-light': {
      title: 'Warm Light',
      summary: 'A gentle way to keep yourself company when you feel low, without pushing the sadness away.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. This practice is a gentle way to keep yourself company when you feel low. There’s no need to push the sadness away.' },
        { id: 's02', tier: 3, pause: 1, text: 'Settle into a comfortable position. Let your eyes close, or soften your gaze.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Breathe in slowly… and breathe out. Let each breath be a little kinder than the last.' },
        { id: 's04', tier: 5, pause: 4, text: 'Notice where the heaviness sits in your body. Your chest, your throat, your shoulders. Just notice it, without trying to fix it.' },
        { id: 's05', tier: 3, pause: 3, text: 'Now imagine a soft, warm light just above you. Pick any color that feels comforting: golden, rosy, a gentle peach.' },
        { id: 's06', tier: 3, pause: 3, breath: true, text: 'With your next breath in, let the light flow slowly down over your head and face, warm like sunlight through a window.' },
        { id: 's07', tier: 3, pause: 3, text: 'Let it reach your neck and shoulders. Wherever it touches, things soften, just a little.' },
        { id: 's08', tier: 5, pause: 4, text: 'Let the light gather around your heart. Imagine it holding the sadness gently, the way you’d hold a friend’s hand.' },
        { id: 's09', tier: 10, pause: 5, text: 'If you’d like, silently offer yourself a few kind words. May I be gentle with myself. May I be at peace.' },
        { id: 's10', tier: 10, pause: 4, text: 'Let the light flow down your arms into your hands, and down through your body and legs, all the way to your feet.' },
        { id: 's11', tier: 10, pause: 5, text: 'You might imagine someone who cares about you, sitting nearby. You don’t need to talk. Just feel that you’re not alone.' },
        { id: 's12', tier: 5, pause: 4, text: 'The sadness may still be here, and that’s okay. Feelings move like weather. You’re making a little room around it.' },
        { id: 's13', tier: 3, pause: 4, breath: true, text: 'Rest in the warmth for a few more breaths.' },
        { id: 's14', tier: 3, pause: 1, text: 'Let the light slowly fade, keeping a little of its warmth with you. When you’re ready, open your eyes.' },
      ],
    },

    'cooling-stream': {
      title: 'Cooling Stream',
      summary: 'Cool down anger or frustration by letting your thoughts float away on a stream.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. Anger brings a lot of heat and energy. This practice helps you cool it down, so you can choose what to do next.' },
        { id: 's02', tier: 3, pause: 1, text: 'Sit with your feet flat on the floor. Close your eyes, or look down at a spot in front of you.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Breathe in through your nose… and breathe out slowly through your mouth, as if you were cooling a hot drink.' },
        { id: 's04', tier: 5, pause: 3, breath: true, text: 'Once more. In… and a long, cool breath out. Feel your feet pressing into the ground.' },
        { id: 's05', tier: 5, pause: 3, text: 'Notice where the heat is in your body. Your face, your jaw, your hands, your chest. Unclench whatever you can.' },
        { id: 's06', tier: 3, pause: 3, text: 'Now imagine you’re sitting on the bank of a clear, cool stream. The water moves steadily past you.' },
        { id: 's07', tier: 3, pause: 3, text: 'Listen to it flowing. Feel the cool air coming off the water.' },
        { id: 's08', tier: 3, pause: 5, text: 'Now picture leaves floating down the stream. Each time an angry thought comes, place it on a leaf, and watch it drift away.' },
        { id: 's09', tier: 10, pause: 5, text: 'You don’t have to push the thoughts. Just set them down on the water and let the current carry them.' },
        { id: 's10', tier: 10, pause: 5, text: 'If the same thought comes back, that’s fine. Put it on another leaf. The stream never runs out of leaves.' },
        { id: 's11', tier: 10, pause: 4, text: 'Imagine dipping your hands into the water. It’s cold and clean. Feel the coolness travel up your arms and across your chest.' },
        { id: 's12', tier: 3, pause: 4, breath: true, text: 'Notice the heat in your body softening, like a fire settling down to warm coals.' },
        { id: 's13', tier: 5, pause: 3, text: 'What you’re feeling makes sense. Now, with a cooler mind, you can decide what, if anything, you want to do about it.' },
        { id: 's14', tier: 3, pause: 1, text: 'Take one more slow, cool breath. Feel your feet on the floor, and when you’re ready, open your eyes.' },
      ],
    },

    savoring: {
      title: 'Savoring',
      summary: 'Good moments pass quickly. Savor this one so it stays with you a little longer.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. Good moments pass quickly. This practice helps you savor this one, so it stays with you a little longer.' },
        { id: 's02', tier: 3, pause: 1, text: 'Get comfortable and close your eyes, or let your gaze rest somewhere pleasant.' },
        { id: 's03', tier: 3, pause: 2, breath: true, text: 'Take a slow breath in… and out. Let a small smile come, if it wants to.' },
        { id: 's04', tier: 3, pause: 3, text: 'Bring to mind what’s making you feel good right now. A person, a moment, something you did.' },
        { id: 's05', tier: 3, pause: 3, text: 'Picture it as clearly as you can. Where were you? What could you see around you?' },
        { id: 's06', tier: 5, pause: 3, text: 'What could you hear? Voices, laughter, music, or a comfortable quiet?' },
        { id: 's07', tier: 10, pause: 3, text: 'Notice any smells, tastes or textures that belong to this moment.' },
        { id: 's08', tier: 3, pause: 4, text: 'Now notice where the good feeling lives in your body. Maybe a warmth in your chest, or a lightness in your shoulders.' },
        { id: 's09', tier: 3, pause: 4, breath: true, text: 'With each breath in, imagine that feeling growing a little bigger, spreading out, filling more of you.' },
        { id: 's10', tier: 10, pause: 4, text: 'Imagine it as a color, glowing a little brighter with every breath.' },
        { id: 's11', tier: 5, pause: 3, text: 'Take a mental photograph of this moment, so you can come back to it on a harder day.' },
        { id: 's12', tier: 10, pause: 4, text: 'If you like, think of someone you could share this with, and imagine their face as you tell them.' },
        { id: 's13', tier: 10, pause: 4, text: 'Silently say thank you, to someone, to life, or to yourself, for this moment.' },
        { id: 's14', tier: 3, pause: 1, text: 'Take one more breath, holding the good feeling. When you’re ready, open your eyes, and bring it with you.' },
      ],
    },

    'grounding-tree': {
      title: 'Grounding Tree',
      summary: 'Deepen a calm, steady feeling and learn a simple way to find it again.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. You’re already feeling calm. This practice helps you deepen that steadiness, and remember it.' },
        { id: 's02', tier: 3, pause: 1, text: 'Sit or stand comfortably, with your feet on the ground. Close your eyes if you like.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Breathe in slowly… and out. Notice how easily the breath comes when you’re at ease.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imagine you’re a tall, strong tree. Your feet are roots, reaching down into cool, dark earth.' },
        { id: 's05', tier: 5, pause: 4, breath: true, text: 'With each breath out, let your roots grow a little deeper, spreading wide, holding you steady.' },
        { id: 's06', tier: 3, pause: 3, text: 'Feel your trunk, straight and solid. This is your center. Nothing needs to move it.' },
        { id: 's07', tier: 5, pause: 3, text: 'Above you, your branches reach up toward the sky. Leaves move gently in a light breeze.' },
        { id: 's08', tier: 10, pause: 4, text: 'Notice the sunlight filtering through your leaves, warming them.' },
        { id: 's09', tier: 10, pause: 5, text: 'Even in a strong wind, a tree’s branches sway, but its roots stay where they are. Your calm is like that.' },
        { id: 's10', tier: 10, pause: 4, breath: true, text: 'With each breath in, draw energy up from your roots, all the way to the tips of your branches.' },
        { id: 's11', tier: 3, pause: 5, breath: true, text: 'Rest here, rooted and calm, for a few breaths.' },
        { id: 's12', tier: 5, pause: 3, text: 'When life gets busy, you can find this feeling again by noticing your feet on the ground and taking one slow breath.' },
        { id: 's13', tier: 3, pause: 1, text: 'Take one more breath. Feel your feet, and when you’re ready, open your eyes.' },
      ],
    },

    'clear-sky': {
      title: 'Clear Sky',
      summary: 'When your mind feels crowded or caught off guard, watch your thoughts pass like clouds.',
      segments: [
        { id: 's01', tier: 3, pause: 1, text: 'Welcome. When a lot is happening, the mind gets crowded. This practice helps you make some space.' },
        { id: 's02', tier: 3, pause: 1, text: 'Sit comfortably. Close your eyes, or rest your gaze softly.' },
        { id: 's03', tier: 3, pause: 3, breath: true, text: 'Breathe in slowly… and out. Let your breath find its own pace.' },
        { id: 's04', tier: 3, pause: 3, text: 'Imagine a wide, open sky. It can be any color you like: clear blue, a soft dawn, or a night full of stars.' },
        { id: 's05', tier: 3, pause: 4, text: 'Now think of your thoughts as clouds moving across that sky. Some are big, some small, some fast, some slow.' },
        { id: 's06', tier: 3, pause: 4, text: 'You don’t have to chase them or push them away. Just watch them drift by.' },
        { id: 's07', tier: 5, pause: 4, text: 'If you notice you’ve followed a cloud, that’s normal. Gently come back to watching the sky.' },
        { id: 's08', tier: 10, pause: 5, text: 'Try naming each cloud with one word as it passes. Planning. Worry. Memory. Then let it go.' },
        { id: 's09', tier: 10, pause: 5, text: 'Notice the spaces between the clouds. Clear, open sky. That space is always there, even on a cloudy day.' },
        { id: 's10', tier: 5, pause: 4, text: 'You are the sky, not the clouds. Thoughts come and go, and the sky stays wide and open.' },
        { id: 's11', tier: 10, pause: 4, breath: true, text: 'Feel that openness in your body too. Your chest opening, your shoulders loose.' },
        { id: 's12', tier: 3, pause: 5, breath: true, text: 'Rest as the open sky for a few breaths.' },
        { id: 's13', tier: 3, pause: 1, text: 'When you’re ready, take a deeper breath, and slowly open your eyes.' },
      ],
    },
  },
};
