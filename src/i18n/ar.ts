import type { Messages } from './en';

/** Arabic counted nouns: 1 مرة, 2 مرتان, 3–10 مرات, 11+ مرة. */
function count(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n % 100 >= 3 && n % 100 <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}
const times = (n: number) => count(n, 'مرة واحدة', 'مرتين', 'مرات', 'مرة');
const records = (n: number) => count(n, 'تسجيل واحد', 'تسجيلين', 'تسجيلات', 'تسجيلًا');

/**
 * Modern Standard Arabic, written right to left. Second-person verbs differ for men and women, so the text uses
 * "يمكنك" with a verbal noun, plain nouns, and the "your" ending ـك, which is written the same for everyone.
 * Machine-drafted: have a native speaker review before release.
 */
export const ar: Messages = {
  htmlLang: 'ar',
  dir: 'rtl',
  languageName: 'العربية',

  emotions: {
    joy: { name: 'الفرح', adjective: 'الفرح', noun: 'الفرح' },
    calm: { name: 'الهدوء', adjective: 'الهدوء', noun: 'الهدوء' },
    sadness: { name: 'الحزن', adjective: 'الحزن', noun: 'الحزن' },
    anger: { name: 'الغضب', adjective: 'الغضب', noun: 'الغضب' },
    fear: { name: 'الخوف / القلق', adjective: 'القلق', noun: 'القلق' },
    surprise: { name: 'الدهشة', adjective: 'الدهشة', noun: 'الدهشة' },
    disgust: { name: 'الاشمئزاز', adjective: 'الاشمئزاز', noun: 'الاشمئزاز' },
  },

  bands: { mild: 'خفيف', moderate: 'متوسط', strong: 'قوي' },

  app: {
    tagline: 'تخيُّل · تصوُّر · إبداع',
    skipLink: 'الانتقال إلى المحتوى الرئيسي',
    navLabel: 'القائمة الرئيسية',
    views: { today: 'التخيّل', breaker: 'ابدأ', habits: 'العادات', practice: 'المكتبة', history: 'اليوميات', settings: 'الإعدادات', privacy: 'الخصوصية' },
    pageHeading: (view: string) => `Viz it: ${view}`,
    aiFallback: 'التحليل الذكي غير متاح الآن، لذلك استُخدمت قائمة الكلمات المدمجة.',
    loading: 'جارٍ التحميل…',
    footer: 'Viz it أداة للتأمل الذاتي، وليس تشخيصًا ولا بديلًا عن الدعم المتخصص.',
    footerLinks: 'المزيد',
    privacyLink: 'الخصوصية',
    supportLink: 'الحصول على الدعم الآن',
  },

  reminder: {
    bannerTitle: 'حان وقت تسجيل مشاعرك',
    bannerBody: 'ما شعورك الآن؟ تكفي كلمات قليلة.',
    bannerAction: 'التسجيل الآن',
    dismiss: 'ليس الآن',
    notificationTitle: 'حان وقت التسجيل',
    notificationBody: 'ما شعورك الآن؟ المس لفتح Viz it.',
    icsSummary: 'تسجيل المشاعر في Viz it',
    icsDescription: (url: string) => `ما شعورك الآن؟ افتح Viz it: ${url}`,
    commitmentTitle: 'تذكير: التزامك',
    commitmentBody: (title) => `حان وقت: ${title}`,
    commitmentIcs: (url) => `التزامك اليومي في Viz it: ${url}`,
    markDone: 'تمّ',
    snooze: 'تأجيل 10 دقائق',
  },
  result: {
    mostly: (adjective: string) => `غالبًا: ${adjective}`,
    feeling: (adjective: string) => `الشعور: ${adjective}`,
    outOf100: (n: number) => `${n} من 100`,
    withSome: (noun: string) => `، مع شيء من ${noun}`,
    noEmotion: 'لم تُكتشف أي مشاعر',
    byAi: 'قرأه التحليل الذكي',
    alsoPresent: 'موجود أيضًا: ',
    adjustTitle: 'لا يبدو دقيقًا؟ يمكنك التقييم بنفسك',
    adjustHint: '1 يعني بالكاد موجود، و10 يعني طاغٍ. تقييمك يحل محل تقييمنا.',
    adjusted: (n: number) => `تم التحديث إلى ${n} من 100.`,
    share: 'مشاركة الصورة أو حفظها…',
    newCheckIn: 'تسجيل جديد',
  },

  create: {
    heroTitle: 'تخيّل ما تودّ الشعور به',
    heroBody:
      'شاركنا ما في بالك وكيف تودّ أن تتخيّله. يكتب Viz it فورًا تخيّلًا موجّهًا خاصًا بك، ويرافقك صوت هادئ خلاله.',
    label: 'ما الذي في بالك، وما الذي تودّ تخيّله؟',
    hintLocal: 'يمكنك الكتابة بحرية وبلغتك. ما تكتبه يبقى على هذا الجهاز.',
    hintAi: 'يمكنك الكتابة بحرية. التحليل الذكي مفعّل، لذلك يُرسل هذا النص أيضًا إلى Claude لقراءة مشاعرك.',
    placeholder:
      'يمكنك وصف المشاعر، أو ما يُرغب في تخيّله، أو لحظة مرغوب عيشها. مثلًا: المساعدة على الاستعداد ذهنيًا لمباراة مهمة، أو تخيّل أمسية هادئة، أو رؤية بداية فصل جديد بثقة.',
    examplesLabel: 'هل من حاجة إلى فكرة؟ يمكنك تجربة واحدة:',
    ideas: [
      { label: 'لحظة هادئة', text: 'أرغب في لحظة هادئة ومسالمة لأبطئ قليلًا. خذني إلى مكان هادئ.' },
      { label: 'تخيّل ذاتي في المستقبل', text: 'ساعدني على تخيّل ذاتي بعد بضع سنوات، أعيش بطريقة لها معنى.' },
      { label: 'الاستعداد لتحدٍّ مهم', text: 'ساعدني على الاستعداد ذهنيًا، خطوة بخطوة، لتحدٍّ مهم قادم.' },
      { label: 'ثقة قبل الأداء', text: 'لديّ أداء قريب وأشعر بالتوتر. ساعدني على مزيد من الثبات والثقة.' },
      { label: 'العودة إلى ذكرى جميلة', text: 'خذني إلى ذكرى سعيدة لأستمتع بها من جديد.' },
      { label: 'الاستعداد لنوم مريح', text: 'ساعدني على الاسترخاء والاستعداد لنوم مريح.' },
      { label: 'لحظة امتنان', text: 'ساعدني على ملاحظة ما أشعر بالامتنان له اليوم والاستمتاع به.' },
      { label: 'التمرّن على التركيز', text: 'ساعدني على التمرّن على التركيز في شيء واحد في كل مرة.' },
      { label: 'تخيّل فصل جديد', text: 'ساعدني على تخيّل بداية فصل جديد في حياتي بثقة.' },
      { label: 'التمرّن على موقف صعب', text: 'ساعدني على التمرّن على التعامل بهدوء مع محادثة صعبة.' },
    ],
    replaceConfirm: 'استبدال المكتوب بهذه الفكرة؟',
    modeLegend: 'ما الذي يُرغب في تخيّله؟ (اختياري)',
    modeHint: 'إن لم يتم الاختيار، يختار Viz it ما يناسب كلماتك، أو يُبقي الجلسة هادئة ببساطة.',
    suggested: 'مقترح',
    suggestedWhy: (name, why) => `اقتراح: ${name}. ${why}`,
    mode: (name) => `النمط: ${name}`,
    createError: 'حدث خطأ أثناء إنشاء التأمّل. كلماتك ما زالت هنا، ويمكنك إعادة المحاولة.',
    sceneLegend: 'إلى أين تودّ الذهاب؟ (اختياري)',
    goalLegend: 'ما الذي سيساعد أكثر؟ (اختياري)',
    create: 'إنشاء تخيّلي',
    creating: 'جارٍ الإنشاء…',
    needMore: 'شاركنا قليلًا عن شعورك، أو اختر مكانًا أو ما قد يساعد.',
    madeFrom: 'مصنوع من كلماتك',
    understood: 'ما فهمناه',
    feeling: (name: string, n: number) => `الشعور: ${name} (${n}/100)`,
    place: (place: string) => `المكان: ${place}`,
    goal: (goal: string) => `الهدف: ${goal}`,
    about: (topic: string) => `الموضوع: ${topic}`,
    readScript: 'قراءة النص',
    readyTitle: 'أو البدء بتأمّل جاهز',
    readyBody: 'جلسات موجّهة لمشاعر شائعة، جاهزة للتشغيل.',
    seeAll: 'عرض الكل في المكتبة',
    savedTitle: 'تأمّلاتك المحفوظة',
    newHereTitle: 'جديد على التخيّل؟',
    newHereBody:
      'هو ببساطة تخيّل بالحواس بينما يرشدك صوت هادئ. لا حاجة إلى أي خبرة، ولا حتى إلى «رؤية» صور.',
    firstTry: 'تجربة أول تخيّل لمدة 3 دقائق',
    learn: 'تعلّم الأساسيات',
  },

  practice: {
    startHereTitle: 'جديد على التخيّل؟',
    startHereBody:
      'التخيّل نوع من التأمل يستخدم الخيال: تصوّر أماكن هادئة أو ضوء دافئ أو سماء مفتوحة لتغيير ما تشعر به. ابدأ بقراءة الأساسيات، ثم جرّب تمرينًا أول قصيرًا.',
    basicsHeading: 'الأساسيات',
    firstButton: 'تجربة أول تخيّل (3 دقائق)',
    suggestedHeading: 'مقترح لك',
    suggestedBody: (adjective: string) => `آخر تسجيل لك اليوم: ${adjective}. هذا التمرين مناسب لك.`,
    libraryHeading: 'كل التمارين',
    helpsWith: (names: string) => `مفيد لـ: ${names}`,
    forBeginners: 'مفيد للبداية',
    open: 'بدء',
    openLabel: (title: string) => `بدء ${title}`,
    lengthLabel: 'كم من الوقت؟',
    minutes: (n: number) => `${n} د`,
    voiceLabel: 'الإرشاد الصوتي',
    speedLabel: 'سرعة الصوت',
    speeds: { slow: 'أبطأ', normal: 'عادية', fast: 'أسرع' },
    breathLabel: 'إرشادات التنفّس',
    estimate: (n) => `نحو ${n} د. المدة تقديرية.`,
    soundLabel: 'صوت الخلفية',
    noVoice: 'هذا المتصفح لا يستطيع القراءة بصوت عالٍ، لذلك يمكنك متابعة الكلمات على الشاشة.',
    tip: 'السماعات تساعد. اختر مكانًا لا يقاطعك فيه أحد. يمكنك التوقف في أي وقت.',
    begin: 'البدء',
    back: 'رجوع',
    preparing: 'جارٍ التحضير…',
    remaining: (clock: string) => `متبقٍّ ${clock}`,
    progressLabel: 'التقدّم',
    breatheIn: 'شهيق',
    breatheOut: 'زفير',
    pause: 'إيقاف مؤقت',
    resume: 'متابعة',
    end: 'إنهاء',
    restart: 'البدء من جديد',
    paused: 'متوقف مؤقتًا',
    voiceDevice: 'الصوت: الصوت المدمج في جهازك',
    voiceRecorded: 'الصوت: تسجيل بصوت طبيعي',
    voiceSilent: 'الصوت مغلق: يمكنك متابعة الكلمات على الشاشة',
    voiceMissing:
      'لا يوجد على هذا الجهاز صوت لهذه اللغة بعد، لذلك يمكنك متابعة الكلمات على الشاشة. يمكن إضافة صوت من إعدادات تحويل النص إلى كلام في جهازك.',
    canStop: 'يمكنك فتح عينيك أو التوقف في أي وقت.',
    doneTitle: 'أحسنت صنعًا',
    endedTitle: 'انتهى التمرين',
    beforeWas: (noun: string, n: number) => `قبل التمرين، كانت شدة ${noun} ${n} من 100.`,
    howStrongNow: (noun: string) => `ما شدة ${noun} الآن؟ (0 = اختفى، 10 = طاغٍ)`,
    feelWords: { calmer: 'هدوء أكثر', clearer: 'وضوح أكثر', focused: 'تركيز أكثر', confident: 'ثقة أكثر', hopeful: 'أمل أكثر', same: 'تقريبًا كما كان', other: 'شيء آخر' },
    feelHint: 'اختياري. يمكنك اختيار ما ينطبق؛ عدم التغيّر لا بأس به أيضًا.',
    saveFeel: 'حفظ',
    skipFeel: 'تخطٍّ',
    feelSaved: 'تم الحفظ. ستجده في دفتر اليوميات.',
    howNow: 'كيف الشعور الآن؟',
    felt: { better: 'أفضل', same: 'كما هو تقريبًا', worse: 'أسوأ' },
    save: 'حفظ',
    change: (name: string, before: number, after: number) => `${name}: ${before} ← ${after}`,
    lighter: (n: number) => `أخفّ بمقدار ${n} نقطة. عمل رائع.`,
    same: 'كما هو تقريبًا. لا بأس: أثر التمرين يتراكم مع الوقت.',
    stronger:
      'الشعور أقوى الآن. شكرًا على صدقك. قد يساعد اليوم أكثر تمرين آخر، أو مشي قصير، أو الحديث مع أحد.',
    feltBetter: 'يسعدنا أنه ساعد.',
    feltSame: 'لا بأس. مثل أي مهارة، يصبح التخيّل أسهل مع الممارسة.',
    feltWorse: 'شكرًا على صدقك. ليس كل تمرين مناسبًا لكل لحظة. يمكنك تجربة تمرين آخر، أو أخذ استراحة.',
    again: 'العودة إلى التمارين',
    saveFailed: 'لم يتم الحفظ. يُرجى إعادة المحاولة.',
    checkIn: 'تسجيل جديد',
  },

  bloom: {
    title: (name: string) => `زهرة ${name}`,
    one: (name: string, n: number) => `${name}: ${n} من 100.`,
    two: (name: string, n: number, name2: string, n2: number) => `${name}: ${n} من 100، و${name2}: ${n2}.`,
  },
  tags: {
    suggested: {
      work: 'العمل',
      school: 'الدراسة',
      sleep: 'النوم',
      family: 'العائلة',
      friends: 'الأصدقاء',
      health: 'الصحة',
      exercise: 'الرياضة',
      money: 'المال',
      weather: 'الطقس',
      relationship: 'العلاقة',
    } as Record<string, string>,
  },
  chart: {
    summary: (days: number, parts: string[]) =>
      parts.length ? `في آخر ${days} يومًا: ${parts.join('، ')}.` : `لا توجد تسجيلات في آخر ${days} يومًا بعد.`,
    part: (name: string, n: number, avg: number) => `${name} ${times(n)} (المتوسط ${avg})`,
    showTable: 'العرض كجدول',
    colEmotion: 'الشعور',
    colTimes: 'المرات',
    colAverage: 'متوسط الشدة',
  },

  history: {
    weekHeading: 'أسبوعك',
    filterLabel: 'عرض التسجيلات ذات الوسم',
    filterAny: 'أي وسم أو بدون وسم',
    calendarHeading: 'تقويم المزاج',
    insightsHeading: 'أنماط قد تلاحظها',
    insightsNote: 'هذه أنماط في ما سجّلته، وليست أسبابًا. تتضح أكثر كلما زادت تسجيلاتك.',
    insightsEmpty: 'أضف وسومًا إلى بضعة تسجيلات أخرى وستظهر الأنماط هنا.',
    patternsHeading: 'أنماطك',
    rangeLabel: 'الفترة',
    days: (n: number) => `${n} يومًا`,
    checkInsStat: 'التسجيلات',
    streakStat: 'أيام متتالية',
    practicesStat: 'التمارين',
    practiceLogHeading: 'سجل التمارين',
    practiceLogEmpty: 'ستظهر تخيّلاتك هنا.',
    practiceItem: (title: string, minutes: number) => `${title} · ${minutes} د`,
    endedEarly: 'انتهى مبكرًا',
    again: 'إنشاء من جديد',
    listHeading: 'التسجيلات',
    empty: 'لا شيء هنا بعد. ستظهر تسجيلاتك هنا.',
    yourRating: ' (تقييمك)',
    tagsLabel: 'الوسوم:',
    delete: 'حذف',
    deleteLabel: (when: string) => `حذف تسجيل ${when}`,
    deleteConfirm: (when: string) => `حذف تسجيل ${when}؟`,
  },

  calendar: {
    caption: (weeks: number) => `تقويم المزاج لآخر ${weeks} أسابيع. يعرض كل يوم الشعور الأكثر تسجيلًا.`,
    noCheckIns: (date: string) => `${date}: لا توجد تسجيلات`,
    day: (date: string, name: string, band: string, avg: number, n: number) =>
      `${date}: غالبًا ${name}، ${band} (${avg})، ${records(n)}`,
    legendNote: 'الأفتح = أخفّ، الأغمق = أقوى',
  },

  reflection: {
    empty: 'لا توجد تسجيلات في آخر 7 أيام بعد. تسجيل سريع اليوم بداية جيدة.',
    count: (n: number) => `سجّلت مشاعرك ${times(n)} هذا الأسبوع.`,
    top: (name: string, n: number) => `الشعور الأكثر تكرارًا: ${name} (${times(n)}).`,
    lighter: 'بشكل عام، كان هذا الأسبوع أخفّ قليلًا من الأسبوع الماضي.',
    heavier: 'بشكل عام، كان هذا الأسبوع أثقل قليلًا من الأسبوع الماضي. الرفق بنفسك مهم.',
    same: 'بشكل عام، كان هذا الأسبوع مشابهًا للأسبوع الماضي.',
    strongest: (noun: string, weekday: string, n: number) => `أقوى شعور لديك: ${noun}، يوم ${weekday} (${n}/100).`,
    tag: (tag: string, n: number, adjective: string) =>
      `ظهر «${tag}» ${times(n)}، وكان الشعور الغالب في تلك التسجيلات: ${adjective}.`,
  },

  insights: {
    lighter: (tag: string) => `تسجيلاتك ذات الوسم «${tag}» غالبًا أخفّ من غيرها.`,
    heavier: (tag: string) => `التسجيلات ذات الوسم «${tag}» غالبًا أثقل من غيرها.`,
    emotion: (tag: string, name: string, pct: number) =>
      `عند استخدام الوسم «${tag}»، الشعور الأكثر ظهورًا هو ${name} (${pct}% من المرات).`,
    basedOn: (n: number) => `بناءً على ${records(n)} من آخر 30 يومًا.`,
  },

  onboarding: {
    step: (n: number, total: number) => `الخطوة ${n} من ${total}`,
    steps: [
      {
        title: 'شاركنا شعورك، وإلى أين تودّ الذهاب',
        body: 'بكلماتك الخاصة. يمكنك ذكر مكان، أو ما قد يساعدك. لا توجد إجابات خاطئة.',
        example: '«أنا قلق من امتحان الغد. خذني إلى شاطئ هادئ.»',
      },
      {
        title: 'تخيّل مصنوع لك وحدك',
        body: 'يكتب Viz it في لحظة تخيّلًا موجّهًا من كلماتك: شعورك، ومكانك، وما تحتاجه. يمكنك اختيار 3 أو 5 أو 10 دقائق.',
        example: '',
      },
      {
        title: 'عينان مغمضتان وصوت يرشدك',
        body: 'صوت هادئ يرشدك بينما تحدد دائرة التنفس الإيقاع. بعدها، يمكنك رؤية مقدار تغيّر الشعور. جديد على ذلك؟ ابدأ بالأساسيات في المكتبة.',
        example: '',
      },
      {
        title: 'بياناتك تبقى معك',
        body: 'كل شيء محفوظ على هذا الجهاز. لا يُرسل أي شيء إلا إذا فعّلت التحليل الذكي أو سجّلت الدخول للمزامنة، ويمكنك التصدير أو الحذف في أي وقت.',
        example: '',
      },
    ],
    skip: 'تخطٍّ',
    back: 'رجوع',
    next: 'التالي',
    done: 'لنبدأ',
  },

  crisis: {
    title: 'يبدو أنك تمرّ بشيء صعب جدًا.',
    askedTitle: 'التحدث مع أحد الآن',
    body: 'لست مضطرًا لمواجهة ذلك وحدك. هذه الخطوط مجانية وسرية ومتاحة على مدار الساعة.',
    call: (phone: string) => `اتصال بـ ${phone}`,
    text: (phone: string) => `رسالة إلى ${phone}`,
    emergency: 'إذا كنت قد تكون في خطر الآن، فاتصل بـ',
    emergencyUnknown: 'إذا كنت قد تكون في خطر الآن، فاتصل برقم الطوارئ المحلي.',
    emergencyShort: (phone: string) => `الطوارئ ${phone}`,
    elsewhere: 'في مكان آخر؟ يمكن العثور على خطوط دعم مجانية في أي بلد عبر',
    findLine: 'يمكن العثور على خطوط دعم مجانية وسرية في بلدك عبر',
    otherCountries: 'خطوط الدعم في بلدان أخرى',
    dismiss: 'إغلاق',
  },

  privacy: {
    title: 'الخصوصية',
    updated: (date: string) => `آخر تحديث: ${date}`,
    summary:
      'باختصار: ما تكتبه يبقى على جهازك. لا يحتوي Viz it على إعلانات ولا تحليلات ولا تتبّع، ولا يبيع أو يشارك أي شيء عنك أبدًا.',
    sections: [
      {
        heading: 'ما يُحفظ على جهازك',
        body: [
          'تسجيلاتك (ما كتبته، والمشاعر والدرجات، وتقييماتك ووسومك)، وسجل تمارينك، وإعداداتك محفوظة في هذا المتصفح، على هذا الجهاز فقط.',
          'تبقى حتى تحذفها. ومسح بيانات هذا الموقع من متصفحك يحذفها أيضًا.',
        ],
      },
      {
        heading: 'ما لا يفعله Viz it',
        body: [
          'لا إعلانات، ولا تحليلات، ولا ملفات تعريف ارتباط للتتبّع، ولا نصوص برمجية من شركات أخرى. التطبيق لا يحمّل أي شيء من مواقع أخرى.',
          'لا يبيع Viz it بياناتك ولا يؤجرها ولا يشاركها أبدًا.',
        ],
      },
      {
        heading: 'عند تحميل الموقع',
        body: [
          'هذا الموقع مستضاف على GitHub Pages. ومثل أي خدمة استضافة، يتلقى GitHub عنوان IP الخاص بك ومعلومات أساسية عن متصفحك عند تحميل التطبيق، ويحتفظ بها لأغراض الأمان. أما Viz it نفسه فلا يراها أبدًا.',
        ],
        link: {
          label: 'بيان الخصوصية لدى GitHub',
          href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
        },
      },
      {
        heading: 'التحليل الذكي (اختياري، ومغلق افتراضيًا)',
        body: [
          'فقط إذا فعّلته. في كل مرة تضغط فيها على «التخيّل»، تُرسل الكلمات الموجودة في مربع النص فقط إلى خادم Viz it، الذي يمررها إلى Claude، وهو نموذج ذكاء اصطناعي من Anthropic، لتقدير مشاعرك. لا يخزّنها الخادم ولا يسجّلها.',
          'تتعامل Anthropic معها وفق سياسة الخصوصية الخاصة بها.',
        ],
        link: { label: 'سياسة الخصوصية لدى Anthropic', href: 'https://www.anthropic.com/legal/privacy' },
      },
      {
        heading: 'الحساب والمزامنة (اختياري)',
        body: [
          'فقط إذا سجّلت الدخول. يُخزَّن بريدك الإلكتروني ومشاعر تسجيلاتك ودرجاتها وتواريخها ووسومها وتقييماتها لدى Supabase لتتم مزامنتها بين أجهزتك. ولا يُضمَّن ما كتبته إلا إذا فعّلت «مزامنة ما كتبته».',
          'لا يستطيع كل حساب قراءة إلا بياناته. وحذف حسابك يحذف كل ما خُزّن فيه.',
        ],
        link: { label: 'سياسة الخصوصية لدى Supabase', href: 'https://supabase.com/privacy' },
      },
      {
        heading: 'المشاركة والتذكيرات والتصدير والتمارين',
        body: [
          'صور المشاركة وملفات التصدير تُنشأ على جهازك ولا تذهب إلا إلى حيث ترسلها. والتذكيرات تأتي من جهازك نفسه، وتذكير التقويم ملف تضيفه بنفسك.',
          'تشغّل التمارين الموجّهة تسجيلات من هذا الموقع، أو صوت جهازك. لا يُسجَّل ولا يُرسل أي شيء تقوله أو تفعله أثناء التمرين.',
        ],
      },
      {
        heading: 'خياراتك',
        body: [
          'من الإعدادات يمكنك تصدير بياناتك بصيغة CSV أو JSON، وحذفها كلها، وحذف حسابك. ويمكنك حذف التسجيلات واحدًا واحدًا من اليوميات.',
        ],
      },
      {
        heading: 'ليس خدمة طبية',
        body: [
          'Viz it أداة للتأمل الذاتي، وليس تشخيصًا ولا علاجًا. درجاته تأتي من قائمة كلمات أو من نموذج ذكاء اصطناعي وقد تخطئ. إذا كنت تمرّ بوقت صعب، فالتواصل مع أحد مهم. زر «الحصول على الدعم الآن» أسفل كل صفحة يعرض خطوط دعم مجانية.',
        ],
      },
      {
        heading: 'الأسئلة والتغييرات',
        body: [
          'يمكنك طرح الأسئلة على صفحة Viz it في GitHub. يُرجى عدم كتابة أي شيء شخصي هناك لأنها صفحة عامة. وإذا تغيّرت هذه السياسة، يتغيّر التاريخ في الأعلى أيضًا.',
        ],
        link: { label: 'Viz it على GitHub', href: 'https://github.com/npanchal123/vizit/issues' },
      },
    ],
  },

  consent: {
    title: 'تفعيل التحليل الذكي؟',
    description: 'يفهم التحليل الذكي المشاعر المختلطة والدقيقة أفضل من قائمة الكلمات المدمجة.',
    whatChanges: 'ما الذي يتغيّر:',
    points: [
      'عند الضغط على «التخيّل»، تُرسل الكلمات التي كتبتها في المربع إلى خادم Viz it ثم إلى Claude، وهو نموذج ذكاء اصطناعي من Anthropic، يقرؤها لتقدير مشاعرك.',
      'لا يُرسل أي شيء آخر: لا سجلك، ولا وسومك، ولا تقييماتك، ولا حسابك.',
      'إذا لم يكن متاحًا، يستخدم Viz it قائمة الكلمات المدمجة بهدوء.',
      'يمكنك إيقافه في أي وقت من الإعدادات.',
    ],
    privacyBefore: 'يمكنك قراءة',
    privacyLink: 'سياسة الخصوصية لدى Anthropic',
    privacyAfter: 'لمعرفة كيف يتعاملون معها.',
    decline: 'ليس الآن',
    accept: 'تفعيل',
  },

  settings: {
    displayHeading: 'العرض واللغة',
    themeLabel: 'المظهر',
    themes: { system: 'مثل جهازي', light: 'فاتح', dark: 'داكن', contrast: 'تباين عالٍ' },
    languageLabel: 'اللغة',
    languageHint: 'قائمة الكلمات المدمجة تفهم كل هذه اللغات، بما فيها الهنغليزية. والتحليل الذكي يفهم معظم اللغات الأخرى أيضًا.',
    calmTitle: 'الوضع الهادئ',
    calmHint: 'يوقف الحركة. ويعمل تلقائيًا أيضًا إذا طلب جهازك تقليل الحركة.',
    aiHeading: 'التحليل الذكي',
    aiTitle: 'استخدام الذكاء الاصطناعي لقراءة تسجيلاتي',
    aiHint: 'أفضل في المشاعر المختلطة والدقيقة. يرسل فقط الكلمات التي تكتبها إلى Claude (من Anthropic). مغلق افتراضيًا.',
    remindersHeading: 'التذكيرات',
    reminderTitle: 'تذكيري بتسجيل مشاعري كل يوم',
    reminderTime: 'وقت التذكير',
    reminderHint:
      'لا يستطيع Viz it تذكيرك إلا وهو مفتوح، أو مثبّت وقيد التشغيل. لتذكير يصل دائمًا، يمكنك إضافته إلى التقويم.',
    reminderBlocked: 'الإشعارات محظورة لهذا الموقع، لذلك سيظهر التذكير داخل Viz it فقط.',
    reminderCalendar: 'إضافة تذكير يومي إلى تقويمي',
    installHeading: 'تثبيت التطبيق',
    installHint: 'ثبّت Viz it لفتحه من الشاشة الرئيسية أو سطح المكتب. يعمل دون اتصال.',
    installButton: 'تثبيت Viz it',
    installDone: 'Viz it مثبّت على هذا الجهاز.',
    installIos: 'على iPhone أو iPad: المس زر المشاركة في Safari، ثم «إضافة إلى الشاشة الرئيسية».',
    installUnavailable: 'متصفحك لا يعرض التثبيت الآن. ابحث عن «تثبيت» أو «إضافة إلى الشاشة الرئيسية» في قائمته.',
    accountHeading: 'الحساب والمزامنة',
    dataHeading: 'بياناتك',
    includeText: 'تضمين ما كتبته في ملفات التصدير',
    exportCsv: 'تصدير CSV',
    exportJson: 'تصدير JSON',
    deleteAll: 'حذف كل البيانات',
    deleteAllConfirm: (synced: boolean) =>
      `حذف كل تسجيلاتك؟${synced ? ' سيحذفها هذا أيضًا من حسابك ومن أجهزتك الأخرى المتزامنة.' : ''} لا يمكن التراجع عن ذلك.`,
    rescoreTitle: 'تحديث التسجيلات القديمة',
    rescoreHint: (n: number) =>
      `قرأت نسخةٌ أقدم من قائمة الكلمات المدمجة ${records(n)}. التحديث يعيد قراءة ما كتبته بالنسخة الحالية. تقييماتك ووسومك تبقى كما هي.`,
    rescoreButton: 'تحديثها',
    rescoreDone: (n: number) => `تم تحديث ${records(n)}.`,
    rescoreNone: 'لا شيء يحتاج إلى تغيير.',
    privacyLink: 'كيف يتعامل Viz it مع بياناتك',
  },

  account: {
    notConfigured:
      'المزامنة غير مُعدّة في هذه النسخة من Viz it، لذلك يبقى كل شيء على هذا الجهاز. (للمطوّرين: أضيفوا بيانات Supabase إلى ملف .env. راجعوا README.)',
    intro: 'سجّل الدخول لحفظ نسخة احتياطية من تسجيلاتك ورؤيتها على أجهزتك الأخرى. لا حاجة إلى كلمة مرور.',
    emailLabel: 'البريد الإلكتروني',
    sendLink: 'إرسال رابط تسجيل الدخول إليّ',
    sending: 'جارٍ الإرسال…',
    linkSent: 'رابط تسجيل الدخول في بريدك الوارد.',
    linkFailed: (message: string) => `تعذّر إرسال الرابط: ${message}`,
    signedInAs: 'الحساب:',
    status: {
      idle: 'محدّث',
      syncing: 'جارٍ المزامنة…',
      offline: 'دون اتصال. ستتم مزامنة التغييرات عند عودة الاتصال.',
      error: 'تعذّرت المزامنة',
    },
    lastSynced: (when: string) => ` · آخر مزامنة ${when}`,
    syncNow: 'المزامنة الآن',
    syncTextTitle: 'مزامنة ما كتبته',
    syncTextHint:
      'عند الإيقاف: تُحفظ المشاعر والدرجات والتواريخ والوسوم فقط، وتبقى كلماتك على هذا الجهاز. عند التشغيل: تُخزَّن كلماتك في حسابك أيضًا.',
    signOut: 'تسجيل الخروج',
    signOutRemove: 'تسجيل الخروج والإزالة من هذا الجهاز',
    signOutRemoveConfirm: 'إزالة تسجيلاتك من هذا الجهاز؟ ستبقى آمنة في حسابك وعلى أجهزتك الأخرى المتزامنة.',
    mergeConfirm:
      'على هذا الجهاز تسجيلات من حساب آخر. إضافتها إلى الحساب الذي سجّلت الدخول إليه للتو؟ اختر «إلغاء» لإزالتها من هذا الجهاز بدلًا من ذلك.',
    deleteAccount: 'حذف حسابي…',
  },

  deleteAccount: {
    title: 'حذف حسابك؟',
    body: 'سيحذف هذا حسابك وكل التسجيلات المخزّنة فيه نهائيًا، على كل جهاز متزامن معه. لا يمكن التراجع عن ذلك.',
    alsoLocal: 'حذف تسجيلاتي من هذا الجهاز أيضًا',
    keepNote: 'إذا تركت هذا الخيار مغلقًا، تبقى تسجيلاتك على هذا الجهاز فقط.',
    confirm: 'حذف حسابي',
    deleting: 'جارٍ الحذف…',
    cancel: 'إلغاء',
    failed: (message: string) => `تعذّر حذف حسابك: ${message}`,
  },
};
