import type { ComposeContent } from './types';

/** "我奶奶的花园" → "你奶奶的花园". */
function toYou(phrase: string): string {
  return phrase.replace(/我们/g, '你们').replace(/我/g, '你');
}

// "带我去海边", "我想去奶奶家的花园", "想象自己在山顶上"
const PLACE_CUE = /(?:带我去|带我到|带我回到|让我去|我想去|我想回到|我想待在|想象自己在|想象我在)([^，。！？、；,.!?;\n]{2,30})/;
// Stop where the place ends and what they want to do there begins: "海边放松一下" → "海边".
const PLACE_END = /(?:放松|休息|忘记|忘掉|待着|待一会|躲一躲|看看|感受|散步|然后|因为|好让|让我|吧|一下)/;

/**
 * Simplified Chinese building blocks. {place}, {topic} and {carrier} are nouns that fit anywhere without changing
 * form, so every combination reads naturally. Machine-drafted: have a native speaker review it.
 */
export const zh: ComposeContent = {
  mirror: (feeling, topic) =>
    feeling
      ? `你说你${topic ? `因为${topic}` : ''}感到${feeling.adjective}。这很正常。接下来的几分钟，我们一起好好照顾这份感受。`
      : '谢谢你为自己留出这段时间。接下来的几分钟，你什么都不用做。',
  arrival: [
    { tier: 3, pause: 1, text: '找一个舒服的姿势。如果觉得合适，可以闭上眼睛；也可以睁着眼，让目光轻轻停在某一点上。' },
    { tier: 3, pause: 3, breath: true, text: '慢慢吸气……再呼气，呼气比吸气稍微长一点。' },
    { tier: 5, pause: 3, breath: true, text: '再来一次。吸气……然后长长地、轻松地呼气。让肩膀放松下来。' },
  ],
  imagery: { tier: 3, pause: 1, text: '如果画面自然浮现，就想象身边的这个地方。如果没有，只需跟着这些话语，留意它们带来的感觉，或思考其中的想法。' },
  modes: {
    future: {
      name: '未来愿景',
      description: '想象一个你想努力走向的、有意义的未来。',
      why: '你提到了对以后的期待。',
      focus: '你想要的未来',
      keywords: ['未来', '将来', '有一天', '几年后', '梦想', '成为', '新的篇章', '新阶段', '目标', '我的人生'],
      variants: [
        [
          { tier: 3, pause: 2, text: '现在让时间往前走一点，来到你已经朝着{focus}努力了一段时间的那一天。' },
          { tier: 5, pause: 3, text: '留意那一天你在哪里。周围有什么？光线是什么样的？' },
          { tier: 10, pause: 3, text: '留意你在这里的状态。不必完美，只是更稳一点，更像自己一点。' },
          { tier: 15, pause: 4, text: '看看那天一个平常的时刻：你的手在做什么，身边有什么，周围有哪些声音。' },
          { tier: 3, pause: 3, text: '这个未来不是注定的，它从小小的选择中长出来。留意一个你很快就能做出、并指向它的选择。' },
        ],
        [
          { tier: 3, pause: 2, text: '想象一段时间后的某一天，{focus}比今天更近了一点。' },
          { tier: 5, pause: 3, text: '让细节慢慢浮现：地点、时间、空气的温度。' },
          { tier: 10, pause: 3, text: '留意这个版本的你如何度过一天的开始。是哪些小习惯帮你走到这里？' },
          { tier: 15, pause: 4, text: '在那个场景里一个安静的时刻停留一会儿。留意它有意义的地方，而不是它有多耀眼。' },
          { tier: 3, pause: 3, text: '这里没有什么是保证的，这没关系。留意一个你能掌控、朝向这个方向的小步骤。' },
        ],
      ],
    },
    process: {
      name: '过程演练',
      description: '演练通往你想要结果的每一步。',
      why: '你提到了为某件事做准备或练习。',
      focus: '眼前的任务',
      keywords: ['准备', '练习', '训练', '比赛', '演讲', '汇报', '面试', '日常', '学习', '一步一步'],
      variants: [
        [
          { tier: 3, pause: 2, text: '现在想象你在为{focus}做准备。先不看结果，只看开始。' },
          { tier: 5, pause: 3, text: '看见自己把东西准备好：你检查什么，拿起什么，站在或坐在哪里。' },
          { tier: 10, pause: 3, text: '开始第一部分。留意注意力只放在这一步上，它的感觉，它的节奏。' },
          { tier: 15, pause: 4, text: '过程中，思绪飘走了。留意到它，再温和地回到下一个小动作。' },
          { tier: 3, pause: 3, text: '进入下一步，再下一步，保持稳定的节奏。每一步用心做好，此刻就足够了。' },
        ],
        [
          { tier: 3, pause: 2, text: '想象{focus}之前的那几分钟。留意你在哪里，接下来要做什么。' },
          { tier: 5, pause: 3, text: '想象第一个有用的动作。感受自己慢慢地、仔细地、专注地去做。' },
          { tier: 10, pause: 3, text: '出现了一些不确定。你还是继续，专注于此刻能做的事。' },
          { tier: 15, pause: 4, text: '看见自己稍作停顿，调整一个小地方，然后继续。准备就是一连串的小调整。' },
          { tier: 3, pause: 3, text: '留意每一步如何建立在前一步之上。不必看清整条路，也能迈出下一步。' },
        ],
      ],
    },
    obstacle: {
      name: '困难演练',
      description: '练习平静地应对一个可以预见的挑战。',
      why: '你提到了担心，或可能遇到的挑战。',
      focus: '眼前的挑战',
      keywords: ['紧张', '犯错', '错误', '批评', '压力', '艰难的谈话', '慌', '万一', '害怕'],
      variants: [
        [
          { tier: 3, pause: 2, text: '现在想象{focus}，以及某个事情没按计划进行的时刻。' },
          { tier: 5, pause: 3, text: '留意身体里发生了什么。也许心跳加快，也许思绪变快。这是正常的反应。' },
          { tier: 10, pause: 3, text: '看见自己停一停。一次缓慢的呼吸，或者只是感受双脚踩在地上。要好好应对，并不需要感到平静。' },
          { tier: 15, pause: 4, text: '选一个有帮助的下一步：一句可以说的话，一个可以迈的步子，一个可以问的问题。' },
          { tier: 3, pause: 3, text: '然后回到重要的事情上。困难是真实的，而你继续向前了。' },
        ],
        [
          { tier: 3, pause: 2, text: '想象{focus}可能真实展开的样子，包括一个艰难的时刻。' },
          { tier: 5, pause: 3, text: '不带评判地留意困难的最初信号：紧绷、怀疑，或一阵涌来的念头。' },
          { tier: 10, pause: 3, text: '想象你在心里轻轻说：这就是难的部分。然后给自己一点时间。' },
          { tier: 15, pause: 4, text: '想象一个有建设性的回应：放慢一点，请对方稍等，或专注于下一步。' },
          { tier: 3, pause: 3, text: '看见自己慢慢稳住，不必完美，但足以继续。留意是什么帮到了你。' },
        ],
      ],
    },
  },
  integrate: {
    future: { tier: 3, pause: 2, text: '回来之前，留意那个未来中有一种品质，是你今天就可以带上的。' },
    process: { tier: 3, pause: 2, text: '回来之前，从这次演练中选一个你想带进今天的行动。' },
    obstacle: { tier: 3, pause: 2, text: '回来之前，留意一个你希望在那一刻到来时记得的回应。' },
    rest: { tier: 3, pause: 2, text: '回来之前，留意这段时间里让你印象深刻的东西。不需要拿它做什么。' },
  },
  closing: [
    { tier: 5, pause: 3, text: '最后再看一看四周。只要回想起这里，你随时都能回来。' },
    { tier: 3, pause: 1, text: '深深地吸一口气。感受你此刻所在的地方，动一动手指，准备好了，就睁开眼睛。' },
  ],
  anyPlace: [
    { tier: 3, pause: 3, text: '现在，让{place}慢慢出现在你周围，以任何方式出现都可以。一个画面、一种感觉，或者只是知道你在那里。' },
    { tier: 3, pause: 3, text: '看看四周。注意那里的颜色和光线。你最先看到的是什么？' },
    { tier: 5, pause: 3, text: '听一听。这个地方有哪些声音？近处的，远处的。' },
    { tier: 3, pause: 3, text: '注意你身下是什么，还有空气拂过皮肤的感觉。' },
    { tier: 10, pause: 3, text: '这里有什么气味吗？慢慢地吸进来。' },
    { tier: 5, pause: 4, breath: true, text: '让自己在这里安顿下来。你在这里很安全，不需要去任何别的地方。' },
  ],
  findPlace: (text) => {
    const match = PLACE_CUE.exec(text);
    if (!match) return null;
    const cut = match[1].search(PLACE_END);
    const raw = (cut > 0 ? match[1].slice(0, cut) : match[1]).replace(/[上里]$/, '').trim();
    return raw.length >= 2 ? { raw, place: toYou(raw) } : null;
  },
  title: (place) => place,
  subtitle: (goal, topic) => (topic ? `${goal} · ${topic}` : goal),
  defaultTopic: '心里的事',

  scenes: {
    beach: {
      name: '海滩',
      title: '安静的海滩',
      place: '一片安静的海滩',
      carrier: '一阵海浪',
      keywords: ['海滩', '沙滩', '海边', '大海', '海浪', '海洋', '海岸'],
      lines: [
        { tier: 3, pause: 3, text: '想象你来到了{place}。沙子是温暖的，大海在你面前一直延伸到远方。' },
        { tier: 3, pause: 3, text: '看看海水。注意它的颜色，还有水面上闪烁的光。' },
        { tier: 5, pause: 3, text: '听一听海浪。每一道浪涌上来……再慢慢退回去。' },
        { tier: 3, pause: 3, text: '感受身下温暖的沙子，还有从海上吹来的柔和微风。' },
        { tier: 10, pause: 3, text: '吸一口清新的、带着咸味的空气。' },
        { tier: 5, pause: 4, breath: true, text: '让呼吸跟着海浪。浪涌来时吸气……浪退去时呼气。' },
      ],
    },
    forest: {
      name: '森林',
      title: '宁静的森林',
      place: '一片宁静的森林',
      carrier: '微风',
      keywords: ['森林', '树林', '林间', '丛林', '林子'],
      lines: [
        { tier: 3, pause: 3, text: '想象你走进了{place}。高大的树木环绕着你，脚下的小路很柔软。' },
        { tier: 3, pause: 3, text: '抬头看。阳光透过树叶，洒下一片片晃动的光斑。' },
        { tier: 5, pause: 3, text: '听一听。鸟儿在呼唤，树叶沙沙作响，也许附近还有流水声。' },
        { tier: 3, pause: 3, text: '把手放在一棵树干上。感受它有多稳，多古老。' },
        { tier: 10, pause: 3, text: '吸入泥土、绿叶和新鲜空气的气息。' },
        { tier: 5, pause: 4, breath: true, text: '让树木的宁静一次一呼吸地融进你的身体。' },
      ],
    },
    mountain: {
      name: '山间',
      title: '山顶风光',
      place: '一座山的山顶',
      carrier: '山风',
      keywords: ['山顶', '山上', '山里', '山间', '高山', '群山', '山谷', '爬山', '大山', '雪山', '喜马拉雅'],
      lines: [
        { tier: 3, pause: 3, text: '想象你来到了{place}。空气清凉透彻，你能看到很远很远。' },
        { tier: 3, pause: 3, text: '眺望山谷和远处的山峰。注意一切是多么广阔、多么开阔。' },
        { tier: 5, pause: 3, text: '听一听山上的安静。也许有一点风声，也许有一只鸟在下面远处鸣叫。' },
        { tier: 3, pause: 3, text: '感受你身下坚实的岩石。它已经在这里屹立了几千年。' },
        { tier: 10, pause: 3, text: '吸一口清冷纯净的山间空气。感受它充满你的胸口。' },
        { tier: 5, pause: 4, breath: true, text: '从这里看，烦恼显得小了很多。感受这片广阔的空间。' },
      ],
    },
    garden: {
      name: '花园',
      title: '阳光花园',
      place: '一座阳光明媚的花园',
      carrier: '一只蝴蝶',
      keywords: ['花园', '公园', '花丛', '草地', '草原', '田野', '花海'],
      lines: [
        { tier: 3, pause: 3, text: '想象你来到了{place}。到处都是花，阳光温柔又温暖。' },
        { tier: 3, pause: 3, text: '看看周围的颜色。鲜艳的花瓣、绿色的叶子，头顶是晴朗的天空。' },
        { tier: 5, pause: 3, text: '听一听。蜜蜂嗡嗡，鸟儿歌唱，树叶轻轻摇动。' },
        { tier: 3, pause: 3, text: '感受身下柔软的草地，还有照在脸上的阳光。' },
        { tier: 10, pause: 3, text: '吸入花朵甜甜的香气。' },
        { tier: 5, pause: 4, breath: true, text: '让这里的温暖一直流进你的心里。' },
      ],
    },
    river: {
      name: '河边',
      title: '轻柔的河流',
      place: '一条轻柔的河边',
      carrier: '水面上的一片叶子',
      keywords: ['河边', '河流', '小河', '溪', '湖', '瀑布', '江边', '恒河'],
      lines: [
        { tier: 3, pause: 3, text: '想象你坐在{place}。清澈的河水平稳地从你身边流过。' },
        { tier: 3, pause: 3, text: '看着河水。看光在流动的水面上跳舞。' },
        { tier: 5, pause: 3, text: '听它流淌的声音，柔和、平稳，从不停歇。' },
        { tier: 3, pause: 3, text: '感受水面吹来的凉风，还有身边光滑的石头。' },
        { tier: 10, pause: 3, text: '吸入河水清新干净的气息。' },
        { tier: 5, pause: 4, breath: true, text: '让呼吸像河水一样流动。轻松，不慌不忙。' },
      ],
    },
    rain: {
      name: '雨天',
      title: '温馨雨天',
      place: '一个外面正在下雨的温馨房间',
      carrier: '雨',
      keywords: ['雨', '雷雨', '季风'],
      lines: [
        { tier: 3, pause: 3, text: '想象你待在{place}。你温暖又干爽，身上裹着柔软的东西。' },
        { tier: 3, pause: 3, text: '看向窗外。雨滴顺着玻璃滑下，外面的一切都清新翠绿。' },
        { tier: 5, pause: 3, text: '听一听雨声。轻轻地、均匀地敲打着屋顶。' },
        { tier: 3, pause: 3, text: '感受周围的温暖。也许是一条毯子，或者手里一杯热饮。' },
        { tier: 10, pause: 3, text: '吸入雨水落在泥土上的气味。' },
        { tier: 5, pause: 4, breath: true, text: '你哪里都不用去。让雨声让一切都慢下来。' },
      ],
    },
    stars: {
      name: '星空',
      title: '繁星之夜',
      place: '星空下一个安静的地方',
      carrier: '一颗流星',
      keywords: ['星星', '星空', '夜空', '月亮', '月光', '银河', '夜晚'],
      lines: [
        { tier: 3, pause: 3, text: '想象你躺在{place}。夜晚很平静，空气凉凉的。' },
        { tier: 3, pause: 3, text: '抬头看。成千上万颗星星，一轮柔和的月亮在你头顶发着光。' },
        { tier: 5, pause: 3, text: '听一听夜晚的安静。也许有蟋蟀声，也许有一阵微风。' },
        { tier: 3, pause: 3, text: '感受大地托住你。你不需要用力撑着自己。' },
        { tier: 10, pause: 3, text: '吸一口凉爽的夜晚空气。' },
        { tier: 5, pause: 4, breath: true, text: '在这片广阔安静的天空下，让自己感到安全、平静。' },
      ],
    },
    home: {
      name: '安全的房间',
      title: '安全的房间',
      place: '一个温暖安全的房间',
      carrier: '窗外吹来的微风',
      keywords: ['家里', '回家', '房间', '卧室', '床上', '被窝'],
      lines: [
        { tier: 3, pause: 3, text: '想象你待在{place}。这里的一切都熟悉又亲切。' },
        { tier: 3, pause: 3, text: '看看四周。柔和的灯光，你喜欢的东西，你喜爱的颜色。' },
        { tier: 5, pause: 3, text: '听一听。熟悉、让人安心的声音，或者一片宁静。' },
        { tier: 3, pause: 3, text: '感受身下柔软的东西，完全地托住你。' },
        { tier: 10, pause: 3, text: '吸入一种让人安心的气味。也许是饭菜香、干净的床单，或者茶香。' },
        { tier: 5, pause: 4, breath: true, text: '你在这里很安全。你可以休息了。' },
      ],
    },
    sky: {
      name: '天空',
      title: '开阔的天空',
      place: '一片广阔开放的天空',
      carrier: '一朵云',
      keywords: ['天空', '云', '飞翔', '飞', '飘', '小鸟'],
      lines: [
        { tier: 3, pause: 3, text: '想象{place}就在你四周。你轻轻地飘浮着，被完全地托住。' },
        { tier: 3, pause: 3, text: '看看四周。柔软的白云，四面八方都是蓝色。' },
        { tier: 5, pause: 3, text: '听一听这份安静。只有空气轻轻流过的声音。' },
        { tier: 3, pause: 3, text: '感受身体有多轻，好像空气本身在托着你。' },
        { tier: 10, pause: 3, text: '在高高的天上，吸一口干净清新的空气。' },
        { tier: 5, pause: 4, breath: true, text: '让自己飘浮。这里有那么多的空间。' },
      ],
    },
  },

  goals: {
    calm: {
      name: '平静下来',
      keywords: ['平静', '放松', '冷静', '安静', '宁静', '压力'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: '每次呼气，让身体变得更沉一点，更软一点。' },
        { tier: 3, pause: 4, text: '如果有关于{topic}的念头飘进来，注意到它，让{carrier}把它带走。' },
        { tier: 5, pause: 4, text: '注意你的额头、下巴、肩膀。让它们一个个放松一点。' },
        { tier: 10, pause: 5, text: '感受这个地方的平静渗进你的身体，就像温暖渗进冰冷的双手。' },
        { tier: 10, pause: 5, breath: true, text: '吸进平静……呼出紧张。吸进平静……呼出紧张。' },
        { tier: 3, pause: 4, text: '此刻你是安全的。现在，你什么问题都不用解决。' },
      ],
    },
    letgo: {
      name: '放下',
      keywords: ['放下', '放手', '忘记', '忘掉', '释怀', '想太多', '内耗', '走出来'],
      lines: [
        { tier: 3, pause: 4, text: '现在想一想{topic}，只要一会儿。注意你在身体的哪个地方感受到它。' },
        { tier: 3, pause: 5, text: '想象你把这份感受交给{carrier}，看着它慢慢离你远去。' },
        { tier: 5, pause: 5, text: '如果它又回来了，没关系。再把它放上去。不用用力。' },
        { tier: 10, pause: 5, text: '每次呼气，想象自己又放下了一点。你不必背负所有。' },
        { tier: 10, pause: 5, text: '注意它留下的空间。更轻了。更静了。' },
        { tier: 3, pause: 4, breath: true, text: '向这片空间呼吸，让它充满平静。' },
      ],
    },
    kindness: {
      name: '安慰',
      keywords: ['安慰', '温暖', '孤独', '孤单', '受伤', '治愈', '抱抱', '爱自己'],
      lines: [
        { tier: 3, pause: 4, text: '如果你愿意，把一只手放在心口。感受它的温度。' },
        { tier: 3, pause: 4, text: '想象一道柔和温暖的光聚集在你周围，像清晨的阳光一样温柔。' },
        { tier: 5, pause: 5, text: '让这道光托住你对{topic}的所有感受，就像握住一位朋友的手。' },
        { tier: 10, pause: 5, text: '在心里对自己说：我已经尽力了。我也值得被温柔对待。' },
        { tier: 10, pause: 5, text: '想象一个关心你的人坐在你身边。什么都不用说。你并不孤单。' },
        { tier: 3, pause: 4, breath: true, text: '吸进温暖……呼出去，每一次都更柔软一点。' },
      ],
    },
    sleep: {
      name: '入睡',
      keywords: ['睡', '失眠', '入睡'],
      lines: [
        { tier: 3, pause: 5, breath: true, text: '让呼吸自然地慢下来。更慢……更轻。' },
        { tier: 3, pause: 5, text: '感受双脚变得又沉又暖。然后是双腿。然后是臀部。' },
        { tier: 5, pause: 5, text: '现在是后背、手臂、双手。沉沉的、暖暖的、静静的。' },
        { tier: 10, pause: 6, text: '你的脸放松了。眼睛在休息。连念头也开始慢下来。' },
        { tier: 10, pause: 6, text: '如果有关于{topic}的念头出现，让{carrier}把它带走。它可以等到明天早上。' },
        { tier: 3, pause: 6, breath: true, text: '现在除了休息，什么都不用做。想沉多深就沉多深。' },
      ],
    },
    confidence: {
      name: '自信',
      keywords: ['自信', '勇气', '面试', '演讲', '汇报', '相信自己'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: '坐得稍微挺拔一点。吸气，感受胸口打开。' },
        { tier: 3, pause: 5, text: '现在想象{topic}一切顺利。看见自己平静、有准备、很沉稳。' },
        { tier: 5, pause: 5, text: '注意你站着的样子、说话的样子、呼吸的样子。稳定而清晰。' },
        { tier: 10, pause: 5, text: '回想一次你做成了一件难事、挺了过来。那份力量仍然在你身上。' },
        { tier: 10, pause: 5, text: '在心里对自己说：我准备好了。我能应对，一步一步来。' },
        { tier: 3, pause: 4, text: '记住这份感觉。你可以把它带在身边。' },
      ],
    },
    energy: {
      name: '充满活力',
      keywords: ['能量', '动力', '精神', '提神', '没劲', '活力'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: '深深地吸一大口气，让整个胸口充满……然后放开。' },
        { tier: 3, pause: 4, text: '想象这里的光变得更亮、更暖，充满能量。' },
        { tier: 5, pause: 4, text: '每次吸气，把这份明亮的能量吸进身体。' },
        { tier: 10, pause: 4, text: '感受它扩散开来：穿过胸口，沿着手臂，一直到双手和指尖。' },
        { tier: 10, pause: 4, text: '想象练习结束后你站起来，动作轻松，准备好迎接接下来的事。' },
        { tier: 3, pause: 4, breath: true, text: '再吸一口充满活力的气……然后呼出。你清醒了，准备好了。' },
      ],
    },
    joy: {
      name: '品味快乐',
      keywords: ['庆祝', '享受', '感恩', '感激', '品味'],
      lines: [
        { tier: 3, pause: 4, text: '想一想今天让你感觉好的事情。让它和你待在一起。' },
        { tier: 3, pause: 4, text: '注意这份美好的感觉在身体的哪里。也许是一份温暖，或者一种轻松。' },
        { tier: 5, pause: 4, breath: true, text: '每次吸气，让这份感觉变大一点。' },
        { tier: 10, pause: 4, text: '把它想象成一种颜色，每次呼吸都更亮一点。' },
        { tier: 10, pause: 4, text: '在心里说声谢谢，谢谢某个人、谢谢生活，或者谢谢自己，给了你这一刻。' },
        { tier: 3, pause: 4, text: '在心里给这份感觉拍张照片，在难熬的日子里再回来看看。' },
      ],
    },
    focus: {
      name: '专注',
      keywords: ['专注', '集中', '注意力', '学习', '复习', '分心', '清醒'],
      lines: [
        { tier: 3, pause: 4, breath: true, text: '把注意力放到呼吸上。只是这一次呼吸……还有这一次。' },
        { tier: 3, pause: 4, text: '念头可能会出现。让{carrier}把每一个都带走，然后回到呼吸上。' },
        { tier: 5, pause: 5, text: '把你的心想象成一池清水。让它慢慢沉静，直到能看见水底。' },
        { tier: 10, pause: 5, text: '现在想一个关于{topic}的、小而清楚的下一步。只要一个。' },
        { tier: 10, pause: 5, text: '看见自己平静而专心地完成这一步。' },
        { tier: 3, pause: 4, text: '你的心清澈而稳定。你可以把这份专注带在身边。' },
      ],
    },
  },

  topics: {
    exam: { phrase: '考试', keywords: ['考试', '高考', '考研', '测验', '成绩', '期末'] },
    work: { phrase: '工作', keywords: ['工作', '上班', '老板', '领导', '加班', '职场', '截止', '面试'] },
    relationship: { phrase: '感情', keywords: ['男朋友', '女朋友', '对象', '分手', '老公', '老婆', '感情', '恋爱', '婚姻'] },
    family: { phrase: '家人', keywords: ['家人', '父母', '爸爸', '妈妈', '兄弟', '姐妹', '家庭'] },
    friends: { phrase: '朋友', keywords: ['朋友', '友谊', '闺蜜'] },
    health: { phrase: '健康', keywords: ['健康', '生病', '疼', '医院', '医生', '病了'] },
    money: { phrase: '钱的事', keywords: ['钱', '房租', '贷款', '欠债', '工资', '账单'] },
    future: { phrase: '未来', keywords: ['未来', '前途', '以后'] },
    exercise: { phrase: '运动', keywords: ['运动', '健身', '跑步', '瑜伽'] },
    sport: { phrase: '这场比赛', keywords: ['比赛', '球赛', '板球', '足球', '网球', '锦标赛', '赛跑', '竞赛'] },
    performance: { phrase: '你的重要时刻', keywords: ['演讲', '汇报', '演出', '试镜', '舞台', '表演', '音乐会'] },
  },
};
