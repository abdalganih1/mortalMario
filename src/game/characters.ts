import { FighterConfig, FighterId } from '../types';

export const FIGHTERS: Record<FighterId, FighterConfig> = {
  subzero: {
    id: 'subzero',
    name: 'Sub-Zero',
    nameAr: 'سوب زيرو',
    title: 'سيد الجليد والموت البارد',
    primaryColor: '#00d2ff',
    accentColor: '#0055ff',
    description: 'مقاتل اللين كوي المتقن لفنون الجليد. قادر على تجميد أعدائه ورؤساء الوحوش في مكانهم وتحطيمهم.',
    avatar: '❄️',
    special1Name: 'الكرة الجليدية (Ice Blast)',
    special1Desc: 'تطلق قذيفة جليدية تجمد الوحوش والزعيم باوزر فوراً وتجعلهم عرضة للتحطيم!',
    special2Name: 'الانزلاق الجليدي (Cold Slide)',
    special2Desc: 'اندفاع أرضي سريع تحت الأعداء يطيح بهم بحدة جليدية فائقة.',
    quote: 'Feel the chill of death!',
  },
  scorpion: {
    id: 'scorpion',
    name: 'Scorpion',
    nameAr: 'سكوربيان',
    title: 'روح الانتقام من الجحيم',
    primaryColor: '#ffb300',
    accentColor: '#ff3d00',
    description: 'مقاتل الشيراي ريو العائد من أعماق الجحيم مستخدماً رمح السلسلة ونيران الانتقام الحارقة.',
    avatar: '🦂',
    special1Name: 'رمح السلسلة (Spear Hook)',
    special1Desc: 'يطلق رمحه الشهير "GET OVER HERE!" ليسحب العدو أو يشل حركة باوزر تماماً!',
    special2Name: 'انتقال الجحيم (Hellfire Teleport)',
    special2Desc: 'انتقال فوري خلف الهدف مع لكمة نارية مفاجئة تسقط الخصم.',
    quote: 'GET OVER HERE!',
  },
  noob: {
    id: 'noob',
    name: 'Noob Saibot',
    nameAr: 'نوب سايبوت',
    title: 'سيد الظلال وأعماق العالم السفلي',
    primaryColor: '#7c3aed',
    accentColor: '#18181b',
    description: 'شبح الظل القاتل. يرسل شبحه الخاطف للأمام ليقبض على أول وحش ويسحقه ويدمر باوزر ودوامة الظل الدوارة!',
    avatar: '👤',
    special1Name: 'شبح نوب الخاطف (Shadow Clone Rush)',
    special1Desc: 'يرسل نوب شبحاً إضافياً يركض بسرعة خارقة للأمام؛ يمسك بأول وحش ويقضي عليه فوراً، ويلحق ضرراً هائلاً بالزعيم باوزر!',
    special2Name: 'دوامة الظلام (Dark Vortex Orb)',
    special2Desc: 'قذيفة سحرية سوداء دوارة تعمي الأعداء وتلحق بهم ضرراً مستمراً.',
    quote: 'Fear the shadow of death!',
  },
  raiden: {
    id: 'raiden',
    name: 'Raiden',
    nameAr: 'رايدن',
    title: 'إله الرعد وحامي الأرض',
    primaryColor: '#38bdf8',
    accentColor: '#0284c7',
    description: 'إله البرق الأسطوري بقبعته المخروطية الكلاسيكية. يطلق صواعق كهربائية خارقة ويطير أفقياً كالتوربيدو ليمزق خطوط الأعداء!',
    avatar: '⚡',
    special1Name: 'صاعقة البرق (Lightning Bolt)',
    special1Desc: 'يطلق شحنة رعدية زرقاء عالية الفولتية تصعق الأعداء من مسافة بعيدة وتكهرب كل ما يعترضها!',
    special2Name: 'طيران التوربيدو (Torpedo Dive)',
    special2Desc: 'يندفع طائراً في الهواء أفقياً بسرعة هائلة كالسهم الخارق ويصدم كل الوحوش في طريقه!',
    quote: 'Thunder take you!',
  },
  reptile: {
    id: 'reptile',
    name: 'Reptile',
    nameAr: 'ربتايل',
    title: 'النينجا السحلية وسيد السموم',
    primaryColor: '#22c55e',
    accentColor: '#15803d',
    description: 'المقاتل الزاحف الأخضر من عوالم الزواحف المفقودة. يقذف حامضاً يذيب الأعداء ويطلق كرة قوة دائرية ترفع الخصوم عالياً!',
    avatar: '🦎',
    special1Name: 'بصقة الحمض (Acid Spit)',
    special1Desc: 'يقذف سائلاً حامضياً أخضر حارقاً يذيب دروع الوحوش وسلاحف كوبا ويشل حركتهم!',
    special2Name: 'كرة القوة الخضراء (Forceball Roll)',
    special2Desc: 'كرة طاقة دوارة خضراء تتدحرج وتقذف الوحوش عالياً في الهواء مع ضرر متكرر!',
    quote: 'You cannot hide from my venom!',
  },
  baraka: {
    id: 'baraka',
    name: 'Baraka',
    nameAr: 'باراكا',
    title: 'وحش التاركاتان وشفرات الموت',
    primaryColor: '#f43f5e',
    accentColor: '#881337',
    description: 'محارب التاركاتان المتوحش بشفراته المزروعة في ذراعيه. يطلق شرارة الشفرات من بعيد ويمزق كل من يقترب بهجوم التمزيق الدوار!',
    avatar: '🔪',
    special1Name: 'شرارة الشفرة (Blade Spark)',
    special1Desc: 'يطلق شرارة حادة من شفراته تخترق صفوف الأعداء من مسافة بعيدة!',
    special2Name: 'التمزيق الدوار (Shredder Spin)',
    special2Desc: 'يدور بشفراته الممدودة ويمزق كل وحش يلمسه مع حماية كاملة أثناء الدوران!',
    quote: 'Feel the blades of doom!',
  },
  liukang: {
    id: 'liukang',
    name: 'Liu Kang',
    nameAr: 'ليو كانغ',
    title: 'بطل الشاولين وقبضة التنين',
    primaryColor: '#f97316',
    accentColor: '#7c2d12',
    description: 'بطل معبد الشاولين وخليفة التنين. يقذف كرة نار التنين من بعيد ويسحق الأعداء بركلة الدراجة الطائرة المتتالية!',
    avatar: '🐉',
    special1Name: 'نار التنين (Dragon Fireball)',
    special1Desc: 'كرة نارية على شكل تنين تحرق كل ما يعترضها وتخترق الأعداء الضعفاء!',
    special2Name: 'ركلة الدراجة (Bicycle Kick)',
    special2Desc: 'اندفاع طائر بركلات متتالية سريعة يصيب كل الأعداء في طريقه عدة مرات!',
    quote: 'Feel the fury of Shaolin!',
  },
  kitana: {
    id: 'kitana',
    name: 'Kitana',
    nameAr: 'كيتانا',
    title: 'أميرة إيدينيا ومراوح الفولاذ',
    primaryColor: '#60a5fa',
    accentColor: '#1e3a8a',
    description: 'أميرة إيدينيا بمراوحها الفولاذية القاتلة. ترمي مروحة تقطع الأعداء عن بعد وترفع الخصوم القريبين بضربة المروحة الصاعدة!',
    avatar: '🪭',
    special1Name: 'رمي المروحة (Fan Throw)',
    special1Desc: 'ترمي مروحة فولاذية دوارة تقطع الأعداء وتعود مخترقة كل من في طريقها!',
    special2Name: 'رفعة المروحة (Fan Lift)',
    special2Desc: 'ضربة مروحة صاعدة ترفع كل الأعداء القريبين عالياً في الهواء مع ضرر مضاعف!',
    quote: 'You will taste my steel!',
  },
  shangtsung: {
    id: 'shangtsung',
    name: 'Shang Tsung',
    nameAr: 'شانغ تسونغ',
    title: 'ساحر الأرواح وزعيم الجزيرة',
    primaryColor: '#a855f7',
    accentColor: '#3b0764',
    description: 'ساحر الأرواح الشرير الذي يسرق أرواح المقاتلين. يقذف جماجم نارية خضراء ويتحول لهيئة ظل مرعبة تسحق كل من يقترب!',
    avatar: '💀',
    special1Name: 'جمجمة الروح (Soul Skull)',
    special1Desc: 'يطلق جمجمة نارية ملتهبة تطارد الأعداء وتلحق بهم ضرراً نارياً مستمراً!',
    special2Name: 'تحول الظل (Shadow Morph)',
    special2Desc: 'يتحول لظل شيطاني يندفع للأمام ويسحق كل الأعداء مع مناعة كاملة أثناء التحول!',
    quote: 'Your soul is mine!',
  },
  kunglao: {
    id: 'kunglao',
    name: 'Kung Lao',
    nameAr: 'كونغ لاو',
    title: 'راهب الشاولين وقبعة الموت',
    primaryColor: '#eab308',
    accentColor: '#713f12',
    description: 'راهب الشاولين صاحب القبعة الشفرة الأسطورية. يرمي قبعته فتقطع الأعداء وتعود، ويدور كالإعصار بقبعته الدوارة!',
    avatar: '🎩',
    special1Name: 'رمي القبعة (Hat Throw)',
    special1Desc: 'يرمي قبعته المشحوذة كالشفرة الدوارة تخترق صفوف الأعداء وتعود إليه!',
    special2Name: 'إعصار القبعة (Hat Cyclone)',
    special2Desc: 'يدور بسرعة الإعصار وقبعته ممدودة فيمزق كل وحش يلمسه مع حماية كاملة!',
    quote: 'My hat will slice you!',
  },
  johnnycage: {
    id: 'johnnycage',
    name: 'Johnny Cage',
    nameAr: 'جوني كيج',
    title: 'نجم هوليوود ولكمة الظل',
    primaryColor: '#4ade80',
    accentColor: '#14532d',
    description: 'نجم أفلام الأكشن الذي يثبت أن حركاته حقيقية! يقذف كرات الطاقة الخضراء ويسحق الخصوم بلكمة الظل الصاعدة الشهيرة!',
    avatar: '🕶️',
    special1Name: 'الكرة الخضراء (Forceball Bolt)',
    special1Desc: 'يطلق كرة طاقة خضراء متفجرة من قبضته تصعق الأعداء عن بعد!',
    special2Name: 'لكمة الظل (Shadow Uppercut)',
    special2Desc: 'الضربة الأشهر! لكمة صاعدة خاطفة ترفع كل الأعداء القريبين عالياً مع صرخة النصر!',
    quote: "Here's Johnny!",
  },
  jax: {
    id: 'jax',
    name: 'Jax Briggs',
    nameAr: 'جاكس',
    title: 'الرائد جاكس والأذرع الفولاذية',
    primaryColor: '#94a3b8',
    accentColor: '#334155',
    description: 'الرائد في القوات الخاصة بذراعيه المعدنيتين المدمرتين. يطلق موجات الصدمة الأرضية ويسحق الأعداء بمسكة الغوتشا المتتالية!',
    avatar: '🦾',
    special1Name: 'موجة الصدمة (Shockwave)',
    special1Desc: 'يلكم الأرض فتنطلق موجة صدمة مدمرة تزحف وتسحق كل من في طريقها!',
    special2Name: 'مسكة الغوتشا (Gotcha Grab)',
    special2Desc: 'يندفع ويمسك العدو بسلسلة لكمات متتالية مدمرة من الأذرع الفولاذية!',
    quote: 'Gotcha!',
  },
  sonya: {
    id: 'sonya',
    name: 'Sonya Blade',
    nameAr: 'سونيا بليد',
    title: 'الملازم سونيا وحلقات الطاقة',
    primaryColor: '#f472b6',
    accentColor: '#831843',
    description: 'ملازم القوات الخاصة وأسرع مقاتلة في البطولة. ترمي حلقات الطاقة الوردية وتنقض على الأعداء بركلة المقص الطائرة!',
    avatar: '💖',
    special1Name: 'حلقة الطاقة (Energy Ring)',
    special1Desc: 'ترمي حلقة طاقة وردية دوارة تخترق الأعداء وتكهرب كل من تلمسه!',
    special2Name: 'ركلة المقص (Scissor Kick)',
    special2Desc: 'تنقض طائرة بركلة مقصية مزدوجة تصيب كل الأعداء في طريقها مرتين!',
    quote: 'Kiss of death!',
  },
};

// --- PROGRESSION: fighters unlock by clearing stages (stage index required) ---
export const FIGHTER_UNLOCK: Record<FighterId, number> = {
  subzero: 0,
  scorpion: 0,
  noob: 1,
  raiden: 2,
  reptile: 3,
  kunglao: 4,
  baraka: 6,
  liukang: 8,
  kitana: 10,
  johnnycage: 14,
  sonya: 18,
  jax: 24,
  shangtsung: 32,
};

// --- PROGRESSION: moves unlock by stage index (stage 1 = first level) ---
export const MOVE_UNLOCK = {
  dash: 1, // horizontal dash (double-tap left/right)
  special1: 2, // ranged special button
  upshift: 3, // upward super shift (double-tap jump)
  special2: 4, // close special (double-tap punch)
};

export const MOVE_NAMES: Record<keyof typeof MOVE_UNLOCK, string> = {
  dash: 'الشفت الخاطف ⚡',
  special1: 'الضربة البعيدة 🎯',
  upshift: 'الشيفت العلوي 🚀',
  special2: 'الحركة القريبة 🌀',
};

const MAX_STAGE_KEY = 'mmk_maxStage';

export function getMaxStageCleared(): number {
  try {
    const v = parseInt(localStorage.getItem(MAX_STAGE_KEY) || '-1', 10);
    return isNaN(v) ? -1 : v;
  } catch {
    return -1;
  }
}

export function saveStageCleared(idx: number): FighterId[] {
  // Returns ids of fighters newly unlocked by this clear (catches up skipped stages too)
  const old = getMaxStageCleared();
  if (idx > old) {
    try {
      localStorage.setItem(MAX_STAGE_KEY, String(idx));
    } catch {
      /* ignore */
    }
  }
  const cur = Math.max(old, idx);
  const all = Object.entries(FIGHTER_UNLOCK) as [FighterId, number][];
  return all.filter(([, req]) => req > old && req <= cur + 1).map(([id]) => id);
}

export function isFighterUnlocked(id: FighterId): boolean {
  return (FIGHTER_UNLOCK[id] ?? 0) <= getMaxStageCleared() + 1;
}

export function isMoveUnlocked(move: keyof typeof MOVE_UNLOCK, stageIdx: number): boolean {
  return stageIdx >= MOVE_UNLOCK[move];
}
