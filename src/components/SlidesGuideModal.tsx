import React, { useState, useEffect } from 'react';
import { SlideItem } from '../types';

interface SlidesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'mortal_mario_qa_records_v2';

const INITIAL_SLIDES: SlideItem[] = [
  {
    id: 1,
    category: 'نظام التحكم والموبايل',
    title: 'نظام التحكم الانسيابي المدمج: الشيفت والحركات بنقرتين مزدوجتين (Double-Tap)',
    summary: 'تبسيط شامل لواجهة الهاتف وتخفيف زحمة الأزرار؛ تفعيل قفزة الشيفت للأعلى بنقرتين قفز، والشيفت الأفقي بنقرتين اتجاه، والضربة القريبة بنقرتين قتال، مع زر مستقل للحركة البعيدة.',
    diagramType: 'controls',
    keyPoints: [
      'نقرتان قفز وراء بعض (2x Jump): تطلق قفزة الشيفت للأعلى الخارقة (🚀 شيفت لأعلى) بقوة 270 بكسل، مع اشتراط لمس الأرض للتجديد وفترة انتظار 4.5 ثوانٍ.',
      'نقرتان يمين أو يسار (2x Left / Right): انطلاق خاطف وسريع (⚡ Dash Shift) في نفس الاتجاه لتفادي القذائف وتخطي الفجوات الطويلة بحصانة مؤقتة.',
      'نفس زر الضربة مرتين (2x Attack): تفعيل فوري للحركة القريبة (Close Special) لكل مقاتل (تزحلق سوب زيرو، انتقال سكوربيان، دوامة نوب، توربيدو رايدن، وكرة قوة ريبتايل).',
      'زر مخصص منفصل للحركة البعيدة (Dedicated Ranged Move): إطلاق القذائف الخارقة (قذيفة تجميد، رمح سكوربيان، شبح نوب، صاعقة البرق، بصاق الأسيد) بضغطة زر واضحة ومباشرة.',
      'تخفيف واجهة اللمس: تقليص عدد الأزرار من 8 إلى 5 أزرار مريحة وكبيرة تمنح اللاعب رؤية واضحة للساحة وتجربة لعب أركيد احترافية.',
    ],
    questions: [
      {
        id: 'q1',
        question: 'كيف أستخدم قفزة الشيفت للأعلى بعد التحديث الجديد؟',
        answer: 'ببساطة اضغط زر [قفز 🦘] مرتين متتاليتين وراء بعض بسرعة (Double-Tap Jump)! سيقوم مقاتلك بالقفز ثم الانطلاق عمودياً 270 بكسل مع دفع نفاث. لتكرارها في الهواء، يجب أن تلمس قدماك الأرض أو سطح أي مكعب لتجديد الشحنة.',
        timestamp: '12:00',
      },
      {
        id: 'q1_2',
        question: 'كيف أنفذ الشيفت للأمام أو الخلف؟',
        answer: 'انقر نقرتين سريعتين متتاليتين على زر السهم [يسار ⬅️] للاندفاع يساراً، أو نقرتين على [يمين ➡️] للاندفاع يميناً! الاندفاع يمنحك سرعة فائقة وحصانة مؤقتة لتفادي نيران الأعداء.',
        timestamp: '12:05',
      },
      {
        id: 'q1_3',
        question: 'كيف تم تنظيم الحركات القريبة والبعيدة للأبطال؟',
        answer: 'زر الضربة العادية [🥊 قتال]: ضغطة واحدة للكمة أو الأبركت، وضغطتان سريعتان تطلق الحركة القريبة (كالتزحلق أو الانتقال). أما الحركة البعيدة (كالرمح والتجميد والصواعق) فلها زر مخصص ومستقل بيمين الشاشة.',
        timestamp: '12:08',
      },
    ],
  },
  {
    id: 2,
    category: 'المقاتلون والمهارات',
    title: 'مصفوفة مقاتلي مورتال كومبات الخمسة وقدراتهم الخارقة (Fighters Matrix)',
    summary: 'دليل مهارات المقاتلين الخمسة: سوب زيرو، سكوربيان، نوب سايبوت، رايدن، وريبتايل مع آليات الهجوم والحصانة وتأثيراتها.',
    diagramType: 'combat',
    keyPoints: [
      'سوب زيرو (Sub-Zero ❄️): قذيفة تجميد كروية تشل الخصم لـ 4 ثوانٍ، وتزحلق جليدي كاسح (Cold Slide) منخفض مع حصانة وضرر كاسح.',
      'سكوربيان (Scorpion 🦂): رمح السلسلة الناري "GET OVER HERE!" الذي يجذب الأعداء لشل حركتهم، وانتقال الجحيم المباغت (Hellfire Teleport) بلكمة نار خلفية.',
      'نوب سايبوت (Noob Saibot 👤): شبح هجومي خاطف يركض للأمام بسرعة 6.5 وحدة ويدك باوزر بـ 30 نقطة ضرر، مع دوامة الظلام (Dark Vortex).',
      'رايدن (Raiden ⚡): إطلاق صاعقة البرق السريعة (Lightning Bolt) وهجوم الطيران الصاروخي (Superman Torpedo Dive) الخارق.',
      'ريبتايل (Reptile 🦎): بصاق الأسيد الحارق (Acid Spit) الذي يذيب ويجمد الأعداء، والكرة الضاغطة الملتفة (Forceball Roll).',
    ],
    questions: [
      {
        id: 'q2_sub',
        question: 'كيف يعمل تزحلق سوب زيرو الجليدي بعد التحديث؟',
        answer: 'بمجرد ضغط زر [تزحلق جليد ❄️]، ينخفض سوب زيرو ويمد ساقه الأمامية كشفرة جليدية وينطلق بسرعة 9.8 بكسل/إطار، متفادياً قذائف باوزر ويكتسح الوحوش ويقذف السلاحف في الهواء.',
        timestamp: '12:10',
      },
      {
        id: 'q2_noob',
        question: 'ما هي ميزة رايدن وريبتايل الجدد؟',
        answer: 'رايدن يمتلك هجوم التوربيدو الذي يطير به أفقياً عبر الشاشة مقتحماً صفوف الأعداء، بينما ريبتايل يطلق كرة القوة الملتفة (Forceball) وبصاق الأسيد لإذابة دفاعات الوحوش.',
        timestamp: '12:12',
      },
    ],
  },
  {
    id: 3,
    category: 'الضربات القاضية',
    title: 'حركة الأبركت الكلاسيكية الصاعدة وصرخة TOASTY! الأيقونية',
    summary: 'محاكاة دقيقة للكمة الأبركت الشهيرة في مورتال كومبات، تقذف الأعداء في مسار باليستي مرتفع مع صوت دان فوردن الشهير.',
    diagramType: 'uppercut',
    keyPoints: [
      'تفعيل الأبركت: بالضغط على زر اللكمة [Punch / Z] أثناء القفز في الهواء أو أثناء توجيه سهم الأعلى/القفز على الأرض.',
      'مضاعفة الضرر والارتفاع: تلحق 2 ضرر (ضعف اللكمة العادية) وتقذف الأعداء عالياً (vy = -8.5) في مسار قوسي مذهل.',
      'مفاجأة توستي (TOASTY! 🔥): باحتمال 40% عند إصابة الأعداء بالأبركت يظهر وجه دان فوردن مع نداء "TOASTY!" الأيقوني واهتزاز الشاشة.',
      'فعالية ضد الزعماء: تصيب باوزر ونينجا الخصم في الرأس لتعطيل هجماتهم مؤقتاً.',
    ],
    questions: [
      {
        id: 'q3_1',
        question: 'كيف أنفذ حركة الأبركت على الهاتف؟',
        answer: 'اضغط على زر القفز ثم اضغط زر [🥊 قتال PUNCH] في نفس اللحظة بالهواء، أو اضغط زر القتال أثناء الضغط المستمر على زر القفز للأعلى.',
        timestamp: '12:15',
      },
    ],
  },
  {
    id: 4,
    category: 'الصناديق والعناصر',
    title: 'ميكانيكا صناديق الحظ ووردة النار ومحرك منع التجمد (Blocks & Items)',
    summary: 'معالجة جذرية لمشكلة توقف اللعبة عند صندوق الوردة مع محرك تصادم سلس وديناميكي بدون حلقات دوران معلقة.',
    diagramType: 'boxes',
    keyPoints: [
      'سبب المشكلة السابقة: كان كود توليد الوردة يعلق في حلقة دوران تكرارية عند فحص التصادم الرأسي مع رأس اللاعب.',
      'الحل الهندسي: فصل حركة ارتداد الصندوق (Block Bounce) عن خروج العنصر (Item Emergence) وتحويله لآلة حالة خطية آمنة.',
      'تأثير وردة النار: تمنح هالة متوهجة وتضاعف ضرر مهارات المقاتلين وسرعة القذائف.',
      'تحول الصندوق المستهلك إلى حجر معدني ثابت لمنع أي تصادم مزدوج أو خطأ برمجي.',
    ],
    questions: [
      {
        id: 'q4_1',
        question: 'هل يمكن للعبة أن تتوقف مجدداً عند ضرب الصناديق أثناء الجري السريع؟',
        answer: 'مستحيل؛ تم اختبار التصادم على 60 إطاراً في الثانية بدون أي استدعاءات معلقة، والعنصر يخرج بنعومة تامة متدرجة للأعلى.',
        timestamp: '12:18',
      },
    ],
  },
  {
    id: 5,
    category: 'الزعماء والمواجهات',
    title: 'مواجهة الزعيم باوزر وزعماء النينجا المنافسين (Rival Ninja Bosses)',
    summary: 'دليل تكتيكي لهزيمة باوزر على جسر الحمم ومواجهة النينجا الأنداد (Rival Ninjas) المجهزين بالقدرات المعاكسة.',
    diagramType: 'boss',
    keyPoints: [
      'شريط حياة الزعيم التفاعلي (Boss Health Bar): يظهر أعلى الشاشة مع نسبة الضرر المتبقية واسم الزعيم (باوزر أو النينجا المنافس).',
      'نظام النينجا المنافس (Rival Ninja): لو اخترت سوب زيرو ستواجه سكوربيان، ولو اخترت سكوربيان ستواجه سوب زيرو، ولو اخترت نوب ستواجه سوب زيرو، ولو اخترت رايدن ستواجه نوب!',
      'قذائف النينجا الخصم: النينجا الخصم يطلق قذائف التجميد أو الرمح أو صواعق البرق ويقترب للاشتباك المباشر.',
      'طرق هزيمة باوزر الـ 5: شبح نوب (30 ضرراً)، تجميد سوب زيرو، رمح سكوربيان، توربيدو رايدن، أو قطع الجسر بلمس الفأس الذهبي!',
    ],
    questions: [
      {
        id: 'q5_1',
        question: 'من هو النينجا الخصم الذي سأواجهه في العوالم المتقدمة؟',
        answer: 'يتم اختيار الخصم تلقائياً حسب القصة الأسطورية لمورتال كومبات: سوب زيرو يواجه غريمه الأزلي سكوربيان، ونوب يواجه سوب زيرو، ورايدن يواجه نوب، وريبتايل يواجه رايدن.',
        timestamp: '12:20',
      },
    ],
  },
  {
    id: 6,
    category: 'العوالم والمراحل',
    title: 'خريطة العوالم الستة الكاملة (The 6 Epic Worlds Progression)',
    summary: 'تصميم عوالم متنوعة من مروج الفطر الخضراء إلى كهوف الأنفاق، قلاع الحمم، صحراء الأهرامات، المنطاد الحربي، وعرش نيثيرالم.',
    diagramType: 'worlds',
    keyPoints: [
      'العالم 1 (World 1: Overworld): مروج خضراء وأنابيب ماريو مع وحوش غومبا وكوبا وصناديق الحظ المتناثرة.',
      'العالم 2 (World 2: Underground Caverns): كهف تحت الأرض مع بلورات مضيئة، وهرم مكعبات متصل مدروس يمنع انحباس اللاعب نهائياً.',
      'العالم 3 (World 3: Bowser Castle): قلعة الحمم البركانية والجسور المتدلية ومواجهة باوزر الكبرى عند الفأس الذهبي.',
      'العالم 4 (World 4: Desert Ruins): صحراء الأهرامات والرمال المتحركة وحبات الموت السريعة مع حراس النينجا.',
      'العالم 5 (World 5: Doom Airship): سفينة حربية طائرة في السماء مع مدافع طائرة ورياح قوية.',
      'العالم 6 (World 6: Netherrealm Throne): عرش الجحيم الناري ومواجهة الزعيم النينجا الأسطوري الأخير.',
    ],
    questions: [
      {
        id: 'q6_1',
        question: 'هل تم إصلاح الفخ في العالم 2 حيث كان اللاعب ينحبس سابقاً؟',
        answer: 'نعم تماماً؛ تم استبدال الدرج المنفصل بهرم مدرج كلاسيكي متصل من مكعبات الطوب وصناديق الجوائز، بحيث يستطيع اللاعب الصعود والنزول بسلاسة تامة، بالإضافة إلى إمكانية القفز فوقه بزر الشيفت للأعلى.',
        timestamp: '12:25',
      },
    ],
  },
  {
    id: 7,
    category: 'الرسوميات والصوت',
    title: 'المحرك الرسومي الكلاسيكي ومؤثرات الآركيد (Retro Graphics & 60FPS)',
    summary: 'ترقية رسومية وبصرية شاملة بدقة 854x480 مع اهتزاز الكاميرا ومؤثرات بيكسل فائقة النعومة وتوليد صوتي تناظري.',
    diagramType: 'audio',
    keyPoints: [
      'أبعاد شاشة سينمائية عريضة (854x480 Widescreen 16:9): كشف الأعداء والحفر قبل الاقتراب منها، وتعمل بـ 60 إطاراً في الثانية دون هبوط.',
      'محاذاة بيكسل حادة (Pixel-Perfect Canvas): وضوح يشبه شاشات الآركيد الأصلية مع تأثير اهتزاز الشاشة (Screen Shake) عند الضربات القوية.',
      'محرك الجسيمات (Particles): بلورات جليد لسوب زيرو، شرر ناري لسكوربيان، دخان أرجواني لنوب، شرر كهربائي لرايدن، وحمض لريبتايل.',
      'محرك صوتي تركيبي نقي (Web Audio API): أصوات ضربات مورتال كومبات الأصلية وقفزة ماريو التناظرية مع صفر اعتماد على ملفات خارجية.',
    ],
    questions: [
      {
        id: 'q7_1',
        question: 'كيف يحافظ المحرك على 60 إطاراً في الثانية دون تقطيع على الأجهزة القديمة؟',
        answer: 'بفضل نظام Frustum Culling الذي يتجاهل رسم أي كائن خارج الكاميرا، وإعادة تدوير مصفوفات المقذوفات والجسيمات لمنع تراكم الذاكرة (Zero Garbage Collection Pressure).',
        timestamp: '12:30',
      },
    ],
  },
];

export const SlidesGuideModal: React.FC<SlidesGuideModalProps> = ({ isOpen, onClose }) => {
  // Load saved questions from localStorage or fallback to initial slides
  const [slides, setSlides] = useState<SlideItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge saved questions with initial slides
          return INITIAL_SLIDES.map(initSlide => {
            const found = parsed.find((p: SlideItem) => p.id === initSlide.id);
            return found ? { ...initSlide, questions: found.questions || initSlide.questions } : initSlide;
          });
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SLIDES;
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'slide' | 'diagram'>('slide');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  // Save changes to localStorage whenever slides change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    } catch {
      // Ignore quota errors
    }
  }, [slides]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleAddQuestion = (textToSubmit?: string) => {
    const text = (textToSubmit || newQuestionText).trim();
    if (!text) return;

    // Generate smart Arabic response based on keywords and context
    let autoAnswer = 'سؤال ممتاز! نظام اللعبة مطور ليوفر تجربة آركيد متوازنة وسريعة الاستجابة.';
    const qLower = text.toLowerCase();

    if (qLower.includes('شيفت') || qLower.includes('shift') || qLower.includes('أرض') || qLower.includes('قفز')) {
      autoAnswer = 'قفزة الشيفت للأعلى ترتفع 270 بكسل وتتطلب لمس الأرض أو الوقوف فوق مكعب لإعادة شحنها مع مؤقت انتظار 4.5 ثانية لمنع الطيران المستمر.';
    } else if (qLower.includes('أبركت') || qLower.includes('uppercut') || qLower.includes('توستي') || qLower.includes('toasty')) {
      autoAnswer = 'الأبركت تنفذ بالضغط على زر القتال مع القفز في الهواء؛ تلحق 2 ضرر وتقذف العدو في قوس باليستي عالٍ مع احتمال ظهور صرخة TOASTY!';
    } else if (qLower.includes('رايدن') || qLower.includes('raiden') || qLower.includes('برق') || qLower.includes('توربيدو')) {
      autoAnswer = 'رايدن يمتلك صاعقة البرق (Lightning Bolt) وهجوم التوربيدو الطائر (Superman Torpedo) الذي يخترق صفوف الأعداء مع وميض حصانة.';
    } else if (qLower.includes('ريبتايل') || qLower.includes('reptile') || qLower.includes('أسيد') || qLower.includes('حمض')) {
      autoAnswer = 'ريبتايل يطلق بصاق الأسيد الحارق لشل الأعداء، وكرة القوة الدائرية (Forceball) التي تتدحرج وتقضي على الوحوش في طريقها.';
    } else if (qLower.includes('نوب') || qLower.includes('noob') || qLower.includes('شبح')) {
      autoAnswer = 'شبح نوب يركض بسرعة 6.5 وحدة مباشرة نحو أقرب هدف، ويلحق 30 ضرراً بالزعيم باوزر مما يجعله من أقوى مهارات القضاء على الزعماء.';
    } else if (qLower.includes('سوب زيرو') || qLower.includes('تزحلق') || qLower.includes('جليد') || qLower.includes('slide')) {
      autoAnswer = 'تزحلق سوب زيرو الجليدي يمنحه وضعية منخفضة تمر تحت كرات نار باوزر ويكتسح أي عدو أمامه مسبباً ضرراً وتجميداً.';
    } else if (qLower.includes('سكوربيان') || qLower.includes('scorpion') || qLower.includes('رمح')) {
      autoAnswer = 'رمح سكوربيان يسحب الأعداء نحوه بصرخة Get Over Here! لشل حركتهم وفتح مجال لتسديد لكمات نارية متتالية.';
    } else if (qLower.includes('باوزر') || qLower.includes('زعيم') || qLower.includes('فأس') || qLower.includes('boss')) {
      autoAnswer = 'باوزر يمتلك 100 نقطة حياة، وتستطيع هزيمته إما بمهارات المقاتلين أو بالقفز فوقه وقطع الجسر بلمس الفأس الذهبي!';
    } else if (qLower.includes('مراحل') || qLower.includes('عوالم') || qLower.includes('عالم') || qLower.includes('world')) {
      autoAnswer = 'اللعبة تضم 6 عوالم كاملة: مروج الفطر، كهف الأنفاق، قلعة باوزر، صحراء الأهرامات، المنطاد الحربي، وعرش نيثيرالم النهائي.';
    } else if (qLower.includes('وردة') || qLower.includes('صندوق') || qLower.includes('توقف')) {
      autoAnswer = 'تمت معالجة صندوق الوردة بنظام آمن يفصل ارتداد الصندوق عن خروج الوردة، مانعاً أي تجمد أو تعليق في الشاشة.';
    }

    const newQ = {
      id: `q-${Date.now()}`,
      question: text,
      answer: autoAnswer,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setSlides(prev =>
      prev.map((s, idx) =>
        idx === currentSlideIndex
          ? { ...s, questions: [newQ, ...s.questions] }
          : s
      )
    );
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (qId: string) => {
    setSlides(prev =>
      prev.map((s, idx) =>
        idx === currentSlideIndex
          ? { ...s, questions: s.questions.filter(q => q.id !== qId) }
          : s
      )
    );
  };

  const handleCopyReport = () => {
    const report = `=== ${currentSlide.title} ===\n\n` +
      `التصنيف: ${currentSlide.category}\n` +
      `الملخص: ${currentSlide.summary}\n\n` +
      `أهم النقاط:\n` + currentSlide.keyPoints.map(p => `- ${p}`).join('\n') + `\n\n` +
      `الأسئلة والنقاشات:\n` + currentSlide.questions.map(q => `س: ${q.question}\nج: ${q.answer || 'بدون إجابة'}`).join('\n\n');

    navigator.clipboard.writeText(report).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2500);
    });
  };

  const suggestedQuestions: Record<number, string[]> = {
    1: ['كيف أجدد شحنة قفزة الشيفت للأعلى؟', 'ما الفرق بين الشيفت للأمام والشيفت للأعلى؟'],
    2: ['ما هي أفضل استراتيجية لاستخدام رايدن؟', 'كيف يختلف ريبتايل عن سوب زيرو وسكوربيان؟'],
    3: ['كيف أحصل على صرخة TOASTY؟', 'هل الأبركت تؤثر على باوزر أكثر من اللكمة العادية؟'],
    4: ['ماذا يحدث لمقاتل مورتال كومبات بعد أكل وردة النار؟', 'هل يوجد فطر تكبير ومشروم في الصناديق؟'],
    5: ['كيف أهزم نينجا الخصم في عرش نيثيرالم؟', 'ما أسرع طريقة لإسقاط باوزر في الحمم؟'],
    6: ['ما هو التحدي الأكبر في العالم 5 (المنطاد)؟', 'هل يوجد مناطق سرية في كهف العالم 2؟'],
    7: ['كيف تم توليد المؤثرات الصوتية بدون ملفات mp3؟', 'ما سر ثبات اللعبة عند 60 إطاراً في الثانية؟'],
  };

  const renderDiagram = (type: SlideItem['diagramType']) => {
    switch (type) {
      case 'controls':
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <rect x="15" y="15" width="570" height="210" rx="14" fill="#141414" stroke="#333333" strokeWidth="2" />
            <text x="300" y="38" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">
              مخطط نظام التحكم الانسيابي: 5 أزرار مدمجة مع تقنية النقرتين (Double-Tap)
            </text>

            {/* Left D-pad (LTR physical orientation with Double-tap Dash) */}
            <rect x="30" y="65" width="60" height="60" rx="10" fill="#1f2937" stroke="#00e5ff" strokeWidth="2" />
            <text x="60" y="92" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">⬅️ يسار</text>
            <text x="60" y="112" fill="#38bdf8" fontSize="8" textAnchor="middle">2x ⚡ شفت</text>

            <rect x="100" y="65" width="60" height="60" rx="10" fill="#1f2937" stroke="#00e5ff" strokeWidth="2" />
            <text x="130" y="92" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">➡️ يمين</text>
            <text x="130" y="112" fill="#38bdf8" fontSize="8" textAnchor="middle">2x ⚡ شفت</text>

            <rect x="30" y="135" width="130" height="35" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="95" y="157" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontWeight="bold">2x نقرة = اندفاع خاطف ⚡</text>

            {/* Center: Double Tap Mechanics Flow */}
            <rect x="175" y="55" width="225" height="155" rx="10" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
            <text x="287" y="76" fill="#a5b4fc" fontSize="11" textAnchor="middle" fontWeight="bold">منطق النقرات المزدوجة (Double-Tap)</text>
            
            {/* Jump -> Up shift */}
            <rect x="185" y="86" width="205" height="28" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <text x="287" y="104" fill="#a7f3d0" fontSize="9" textAnchor="middle" fontWeight="bold">2x 🦘 قفز ➔ 🚀 شيفت لأعلى (270px)</text>

            {/* Direction -> Dash */}
            <rect x="185" y="120" width="205" height="28" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
            <text x="287" y="138" fill="#fef3c7" fontSize="9" textAnchor="middle" fontWeight="bold">2x ⬅️/➡️ اتجاه ➔ ⚡ شفت خاطف وحصانة</text>

            {/* Punch -> Close Special */}
            <rect x="185" y="154" width="205" height="28" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
            <text x="287" y="172" fill="#fecaca" fontSize="9" textAnchor="middle" fontWeight="bold">2x 🥊 قتال ➔ حركة 1 القريبة (تزحلق/انتقال)</text>

            <text x="287" y="198" fill="#94a3b8" fontSize="8" textAnchor="middle">نافذة النقر المزدوج: 320ms | شحن الشيفت: لمس الأرض</text>

            {/* Right Action buttons (Decluttered to 3 spacious controls) */}
            {/* 1. Dedicated Ranged Special */}
            <rect x="415" y="65" width="70" height="52" rx="10" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
            <text x="450" y="86" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">🎯 حركة بعيدة</text>
            <text x="450" y="104" fill="#c7d2fe" fontSize="8" textAnchor="middle">قذيفة مستقلة</text>

            {/* 2. Attack */}
            <rect x="495" y="65" width="70" height="52" rx="10" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
            <text x="530" y="86" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">🥊 قتال</text>
            <text x="530" y="104" fill="#fca5a5" fontSize="8" textAnchor="middle">2x حركة قريبة</text>

            {/* 3. Jump */}
            <rect x="455" y="128" width="75" height="52" rx="10" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <text x="492" y="149" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">🦘 قفز</text>
            <text x="492" y="167" fill="#a7f3d0" fontSize="8" textAnchor="middle">2x 🚀 شيفت</text>

            <rect x="415" y="188" width="150" height="22" rx="4" fill="#1e293b" />
            <text x="490" y="203" fill="#fbbf24" fontSize="8" textAnchor="middle">تخفيف 38% من زحمة الأزرار</text>
          </svg>
        );

      case 'combat':
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <text x="300" y="25" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">
              مصفوفة مقاتلي مورتال كومبات الخمسة: المهارات، القذائف، والآثار القتالية
            </text>

            {/* 1. Sub-Zero */}
            <rect x="10" y="45" width="105" height="175" rx="8" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="62" y="68" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">❄️ سوب زيرو</text>
            <text x="62" y="90" fill="#bae6fd" fontSize="8" textAnchor="middle">قذيفة التجميد</text>
            <text x="62" y="104" fill="#7dd3fc" fontSize="8" textAnchor="middle">شحن 4 ثوانٍ</text>
            <line x1="20" y1="115" x2="105" y2="115" stroke="#0ea5e9" strokeWidth="1" opacity="0.4" />
            <text x="62" y="135" fill="#bae6fd" fontSize="8" textAnchor="middle">التزحلق الجليدي</text>
            <text x="62" y="150" fill="#7dd3fc" fontSize="8" textAnchor="middle">Cold Slide ⛸️</text>
            <text x="62" y="165" fill="#e0f2fe" fontSize="7" textAnchor="middle">حصانة واكتساح</text>
            <text x="62" y="195" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold">ضرر: 20-35</text>

            {/* 2. Scorpion */}
            <rect x="125" y="45" width="105" height="175" rx="8" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="177" y="68" fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">🦂 سكوربيان</text>
            <text x="177" y="90" fill="#fef08a" fontSize="8" textAnchor="middle">رمح السلسلة</text>
            <text x="177" y="104" fill="#fde047" fontSize="8" textAnchor="middle">Get Over Here!</text>
            <line x1="135" y1="115" x2="220" y2="115" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
            <text x="177" y="135" fill="#fef08a" fontSize="8" textAnchor="middle">انتقال الجحيم</text>
            <text x="177" y="150" fill="#fde047" fontSize="8" textAnchor="middle">Teleport Punch</text>
            <text x="177" y="165" fill="#fffbeb" fontSize="7" textAnchor="middle">لكمة نار مباغتة</text>
            <text x="177" y="195" fill="#fbbf24" fontSize="8" textAnchor="middle" fontWeight="bold">ضرر: 25-40</text>

            {/* 3. Noob Saibot */}
            <rect x="240" y="45" width="110" height="175" rx="8" fill="#2e1065" stroke="#a855f7" strokeWidth="1.5" />
            <text x="295" y="68" fill="#c084fc" fontSize="11" textAnchor="middle" fontWeight="bold">👤 نوب سايبوت</text>
            <text x="295" y="90" fill="#f3e8ff" fontSize="8" textAnchor="middle">شبح نوب الخاطف</text>
            <text x="295" y="104" fill="#e9d5ff" fontSize="8" textAnchor="middle">Shadow Rush 🏃</text>
            <line x1="250" y1="115" x2="340" y2="115" stroke="#a855f7" strokeWidth="1" opacity="0.4" />
            <text x="295" y="135" fill="#f3e8ff" fontSize="8" textAnchor="middle">دوامة الظل</text>
            <text x="295" y="150" fill="#e9d5ff" fontSize="8" textAnchor="middle">Dark Vortex</text>
            <text x="295" y="165" fill="#faf5ff" fontSize="7" textAnchor="middle">إعماء ودوران</text>
            <text x="295" y="195" fill="#c084fc" fontSize="8" textAnchor="middle" fontWeight="bold">ضرر: 30 لباوزر</text>

            {/* 4. Raiden */}
            <rect x="360" y="45" width="110" height="175" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="415" y="68" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">⚡ رايدن</text>
            <text x="415" y="90" fill="#e0f2fe" fontSize="8" textAnchor="middle">صاعقة البرق</text>
            <text x="415" y="104" fill="#bae6fd" fontSize="8" textAnchor="middle">Lightning Bolt ⚡</text>
            <line x1="370" y1="115" x2="460" y2="115" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
            <text x="415" y="135" fill="#e0f2fe" fontSize="8" textAnchor="middle">طيران التوربيدو</text>
            <text x="415" y="150" fill="#bae6fd" fontSize="8" textAnchor="middle">Torpedo Dive 🚀</text>
            <text x="415" y="165" fill="#f0f9ff" fontSize="7" textAnchor="middle">طيران واختراق</text>
            <text x="415" y="195" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold">ضرر: 25-35</text>

            {/* 5. Reptile */}
            <rect x="480" y="45" width="110" height="175" rx="8" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" />
            <text x="535" y="68" fill="#4ade80" fontSize="11" textAnchor="middle" fontWeight="bold">🦎 ريبتايل</text>
            <text x="535" y="90" fill="#dcfce7" fontSize="8" textAnchor="middle">بصاق الأسيد</text>
            <text x="535" y="104" fill="#bbf7d0" fontSize="8" textAnchor="middle">Acid Spit 🟢</text>
            <line x1="490" y1="115" x2="580" y2="115" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
            <text x="535" y="135" fill="#dcfce7" fontSize="8" textAnchor="middle">كرة القوة الملتفة</text>
            <text x="535" y="150" fill="#bbf7d0" fontSize="8" textAnchor="middle">Forceball Roll 🌪️</text>
            <text x="535" y="165" fill="#f0fdf4" fontSize="7" textAnchor="middle">تدحرج وتجميد</text>
            <text x="535" y="195" fill="#4ade80" fontSize="8" textAnchor="middle" fontWeight="bold">ضرر: 22-30</text>
          </svg>
        );

      case 'uppercut':
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <text x="300" y="25" fill="#f59e0b" fontSize="12" textAnchor="middle" fontWeight="bold">
              مخطط حركة الأبركت الكلاسيكية ومفاجأة صرخة TOASTY!
            </text>

            {/* Ground */}
            <line x1="30" y1="195" x2="570" y2="195" stroke="#404040" strokeWidth="4" />

            {/* Ninja performing Uppercut */}
            <rect x="120" y="145" width="28" height="50" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
            <text x="134" y="135" fill="#93c5fd" fontSize="9" textAnchor="middle" fontWeight="bold">المقاتل</text>

            {/* Uppercut fist trajectory */}
            <path d="M 148 160 Q 180 90 230 65" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4,2" />
            <circle cx="230" cy="65" r="14" fill="#b45309" stroke="#fde047" strokeWidth="2" />
            <text x="230" y="69" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">💥 2X</text>

            {/* Enemy launched flying */}
            <rect x="250" y="50" width="28" height="28" rx="6" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
            <text x="264" y="42" fill="#f87171" fontSize="9" textAnchor="middle" fontWeight="bold">العدو يطير عالياً!</text>
            <text x="264" y="68" fill="#fca5a5" fontSize="8" textAnchor="middle">vy = -8.5</text>

            {/* Dan Forden TOASTY Popup */}
            <rect x="420" y="90" width="150" height="85" rx="10" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
            <circle cx="455" cy="130" r="20" fill="#f87171" stroke="#fca5a5" strokeWidth="2" />
            <text x="455" y="135" fill="#450a0a" fontSize="12" textAnchor="middle" fontWeight="bold">🧔</text>
            <text x="515" y="120" fill="#fef08a" fontSize="13" textAnchor="middle" fontWeight="black">TOASTY! 🔥</text>
            <text x="515" y="140" fill="#fca5a5" fontSize="8" textAnchor="middle">احتمال 40% عند اللكمة</text>
            <text x="515" y="155" fill="#ffffff" fontSize="7" textAnchor="middle">اهتزاز شاشة سينمائي</text>
          </svg>
        );

      case 'boxes':
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <text x="300" y="25" fill="#a3a3a3" fontSize="12" textAnchor="middle" fontWeight="bold">
              مخطط حل مشكلة صندوق الوردة ومسار تصادم الرأس الآمن (Blocks & Items)
            </text>

            {/* Step 1: Head collision */}
            <rect x="35" y="60" width="140" height="135" rx="8" fill="#1c1917" stroke="#eab308" strokeWidth="1.5" />
            <text x="105" y="85" fill="#facc15" fontSize="11" textAnchor="middle" fontWeight="bold">1. اصطدام الرأس الآمن</text>
            <text x="105" y="115" fill="#e2e8f0" fontSize="9" textAnchor="middle">اصطدام رأس المقاتل</text>
            <text x="105" y="135" fill="#e2e8f0" fontSize="9" textAnchor="middle">بأسفل الصندوق بدقة</text>
            <text x="105" y="160" fill="#a3e635" fontSize="8" textAnchor="middle">ارتداد رأسي: -8 بكسل</text>

            <path d="M 185 125 L 215 125" stroke="#facc15" strokeWidth="2" markerEnd="arrow" />

            {/* Step 2: Safe spawn */}
            <rect x="225" y="60" width="165" height="135" rx="8" fill="#1c1917" stroke="#22c55e" strokeWidth="1.5" />
            <text x="307" y="85" fill="#4ade80" fontSize="11" textAnchor="middle" fontWeight="bold">2. انبثاق الوردة الخطي</text>
            <text x="307" y="115" fill="#e2e8f0" fontSize="9" textAnchor="middle">صعود تدريجي (Emerge Y)</text>
            <text x="307" y="135" fill="#e2e8f0" fontSize="9" textAnchor="middle">بدون حلقات فحص متكررة</text>
            <text x="307" y="160" fill="#86efac" fontSize="8" textAnchor="middle">تحول فوري لحجر صلب</text>

            <path d="M 395 125 L 425 125" stroke="#22c55e" strokeWidth="2" markerEnd="arrow" />

            {/* Step 3: Mortal Powerup */}
            <rect x="435" y="60" width="140" height="135" rx="8" fill="#1c1917" stroke="#f97316" strokeWidth="1.5" />
            <text x="505" y="85" fill="#fb923c" fontSize="11" textAnchor="middle" fontWeight="bold">3. هالة الوردة النارية</text>
            <text x="505" y="115" fill="#e2e8f0" fontSize="9" textAnchor="middle">اكتساب هالة اللهب</text>
            <text x="505" y="135" fill="#e2e8f0" fontSize="9" textAnchor="middle">مضاعفة ضرر المهارات</text>
            <text x="505" y="160" fill="#fdba74" fontSize="8" textAnchor="middle">سلاسة 60fps مستمرة</text>
          </svg>
        );

      case 'boss':
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <text x="300" y="25" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">
              مخطط حلبة معركة باوزر ونينجا الخصم وشريط حياة الزعيم
            </text>

            {/* Boss health bar simulation */}
            <rect x="150" y="45" width="300" height="22" rx="4" fill="#262626" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="152" y="47" width="220" height="18" rx="3" fill="#dc2626" />
            <text x="300" y="60" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
              👑 BOSS HP: 73% (Bowser / Rival Ninja)
            </text>

            {/* Arena bridge */}
            <line x1="50" y1="180" x2="550" y2="180" stroke="#78350f" strokeWidth="8" strokeDasharray="14,4" />
            <rect x="50" y="186" width="500" height="30" fill="#dc2626" opacity="0.6" />
            <text x="300" y="205" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">حمم بركانية مغمورة (Lava Pit)</text>

            {/* Player at left */}
            <rect x="70" y="130" width="30" height="48" rx="4" fill="#7c3aed" stroke="#c084fc" strokeWidth="2" />
            <text x="85" y="120" fill="#c084fc" fontSize="10" textAnchor="middle" fontWeight="bold">المقاتل</text>

            {/* Shadow Clone flying */}
            <path d="M 110 145 L 290 145" stroke="#a855f7" strokeWidth="3" strokeDasharray="5,3" />
            <text x="200" y="135" fill="#d8b4fe" fontSize="9" textAnchor="middle">شبح نوب الخاطف (-30 HP)</text>

            {/* Bowser / Rival at center */}
            <rect x="300" y="105" width="70" height="74" rx="8" fill="#15803d" stroke="#ef4444" strokeWidth="2" />
            <text x="335" y="95" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">الزعيم (باوزر / نينجا الخصم)</text>
            <text x="335" y="140" fill="#ffffff" fontSize="9" textAnchor="middle">قذائف نارية وجليدية</text>

            {/* Golden axe at right */}
            <rect x="500" y="140" width="20" height="38" rx="4" fill="#f59e0b" stroke="#fde68a" strokeWidth="2" />
            <text x="510" y="130" fill="#fbbf24" fontSize="9" textAnchor="middle" fontWeight="bold">الفأس 🪓</text>
            <text x="510" y="170" fill="#fde68a" fontSize="8" textAnchor="middle">إسقاط الجسر</text>

            {/* Tactical arrows */}
            <path d="M 95 125 Q 335 30 500 135" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" />
            <text x="335" y="42" fill="#38bdf8" fontSize="8" textAnchor="middle">القفز والاندفاع فوق باوزر نحو الفأس</text>
          </svg>
        );

      case 'worlds':
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <text x="300" y="25" fill="#38bdf8" fontSize="12" textAnchor="middle" fontWeight="bold">
              خريطة العوالم الستة: تسلسل المراحل والتنوع البيئي
            </text>

            {/* 6 World Badges */}
            {[
              { id: 1, name: 'عالم 1: المروج', color: '#166534', sub: 'أنابيب وغومبا', x: 20 },
              { id: 2, name: 'عالم 2: الكهوف', color: '#1e293b', sub: 'أنفاق وبلورات', x: 115 },
              { id: 3, name: 'عالم 3: القلعة', color: '#7f1d1d', sub: 'حمم وباوزر', x: 210 },
              { id: 4, name: 'عالم 4: الصحراء', color: '#854d0e', sub: 'أهرامات ورمال', x: 305 },
              { id: 5, name: 'عالم 5: المنطاد', color: '#0369a1', sub: 'سفن جوية ومدافع', x: 400 },
              { id: 6, name: 'عالم 6: الجحيم', color: '#581c87', sub: 'عرش نيثيرالم', x: 495 },
            ].map(w => (
              <g key={w.id}>
                <rect x={w.x} y="55" width="85" height="140" rx="8" fill={w.color} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
                <circle cx={w.x + 42} cy="85" r="16" fill="#000000" fillOpacity="0.4" />
                <text x={w.x + 42} y="90" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="bold">
                  W{w.id}
                </text>
                <text x={w.x + 42} y="125" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">
                  {w.name}
                </text>
                <text x={w.x + 42} y="145" fill="#d1d5db" fontSize="7" textAnchor="middle">
                  {w.sub}
                </text>
              </g>
            ))}

            {/* Progression line */}
            <path d="M 62 175 L 537 175" stroke="#facc15" strokeWidth="2" strokeDasharray="6,4" />
            <text x="300" y="215" fill="#facc15" fontSize="10" textAnchor="middle" fontWeight="bold">
              مسار تقدم خطي مدعوم بحفظ التقدم والنقاط في كل عالم 🏆
            </text>
          </svg>
        );

      case 'audio':
      default:
        return (
          <svg className="w-full h-64 sm:h-72 bg-neutral-950 rounded-xl border border-neutral-800 p-2" viewBox="0 0 600 240">
            <text x="300" y="25" fill="#a3a3a3" fontSize="12" textAnchor="middle" fontWeight="bold">
              المحرك الرسومي الصوتي: التوليد التناظري ومحرك الجسيمات 60FPS
            </text>
            <rect x="40" y="55" width="160" height="145" rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
            <text x="120" y="80" fill="#818cf8" fontSize="11" textAnchor="middle" fontWeight="bold">توليد الذبذبات التناظرية</text>
            <text x="120" y="105" fill="#c7d2fe" fontSize="9" textAnchor="middle">Square Wave: قفزة ماريو</text>
            <text x="120" y="125" fill="#c7d2fe" fontSize="9" textAnchor="middle">Noise Buffer: اندفاع الشيفت</text>
            <text x="120" y="145" fill="#c7d2fe" fontSize="9" textAnchor="middle">Sawtooth: زئير باوزر</text>
            <text x="120" y="165" fill="#c7d2fe" fontSize="9" textAnchor="middle">Sine Chords: هزيمة الأعداء</text>

            <rect x="220" y="55" width="160" height="145" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <text x="300" y="80" fill="#34d399" fontSize="11" textAnchor="middle" fontWeight="bold">محرك الجسيمات (Particles)</text>
            <text x="300" y="105" fill="#a7f3d0" fontSize="9" textAnchor="middle">بلورات جليد لسوب زيرو</text>
            <text x="300" y="125" fill="#a7f3d0" fontSize="9" textAnchor="middle">شرار ناري لسكوربيان</text>
            <text x="300" y="145" fill="#a7f3d0" fontSize="9" textAnchor="middle">دخان أرجواني لنوب سايبوت</text>
            <text x="300" y="165" fill="#a7f3d0" fontSize="9" textAnchor="middle">صواعق كهربائية لرايدن</text>

            <rect x="400" y="55" width="160" height="145" rx="10" fill="#701a75" stroke="#d946ef" strokeWidth="1.5" />
            <text x="480" y="80" fill="#f0abfc" fontSize="11" textAnchor="middle" fontWeight="bold">دقة البيكسل الآركيد</text>
            <text x="480" y="105" fill="#f5d0fe" fontSize="9" textAnchor="middle">Digitized Canvas Sprites</text>
            <text x="480" y="125" fill="#f5d0fe" fontSize="9" textAnchor="middle">Zero External Assets</text>
            <text x="480" y="145" fill="#f5d0fe" fontSize="9" textAnchor="middle">60 FPS Native Loop</text>
            <text x="480" y="165" fill="#f5d0fe" fontSize="9" textAnchor="middle">Frustum Culling</text>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
      <div
        id="slides-guide-modal"
        className="w-full max-w-5xl max-h-[94vh] flex flex-col bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden text-neutral-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 font-bold text-lg shadow-sm">
              📊
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-neutral-100 flex items-center gap-2">
                <span>ملف الشرح التفاعلي والمخططات الهندسية</span>
                <span className="text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800/70 px-2 py-0.5 rounded-full font-bold">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                شرح تحليلي شامل لكل ميكانيكيات اللعبة مع إمكانية طرح أسئلة عند كل شريحة وتلقي إجابات فورية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-copy-slide-report"
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-all"
              title="نسخ ملخص هذه الشريحة وأسئلتها"
            >
              <span>{copiedStatus ? '✅ تم النسخ!' : '📋 نسخ الشريحة'}</span>
            </button>
            <button
              id="btn-close-guide"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Slide Carousel Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 overflow-x-auto bg-neutral-950/60 border-b border-neutral-800 text-xs scrollbar-none">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all flex items-center gap-1.5 ${
                currentSlideIndex === idx
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span className="opacity-70 text-[10px]">#{idx + 1}</span>
              <span>{s.category}</span>
              {s.questions.length > 0 && (
                <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                  {s.questions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Slide Heading & Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-full">
                {currentSlide.category}
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-1 text-white">
                {currentSlide.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setActiveTab('slide')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  activeTab === 'slide' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📝 الشرح والتحليل
              </button>
              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  activeTab === 'diagram' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📊 المخطط الهندسي (SVG)
              </button>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="w-full">
            {renderDiagram(currentSlide.diagramType)}
          </div>

          {/* Slide Detailed Breakdown */}
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-sans bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800/80">
              {currentSlide.summary}
            </p>

            <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>✦</span>
                <span>العناصر الهندسية والقتالية في هذا المخطط:</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                {currentSlide.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span className="leading-normal">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Per-Slide Q&A Section */}
          <div className="border-t border-neutral-800 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-black text-cyan-400 flex items-center gap-2">
                <span>💬</span>
                <span>الأسئلة والنقاشات حول الشريحة {currentSlideIndex + 1} ({currentSlide.category})</span>
              </h4>
              <span className="text-xs text-neutral-400">
                {currentSlide.questions.length} أسئلة وإجابات مسجلة (محفوظة محلياً)
              </span>
            </div>

            {/* Quick Suggested Questions Chips */}
            {suggestedQuestions[currentSlide.id] && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-neutral-400 font-bold ml-1">💡 مقترحات سريعة:</span>
                {suggestedQuestions[currentSlide.id].map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddQuestion(sq)}
                    className="text-[11px] bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 hover:text-white px-2.5 py-1 rounded-full border border-neutral-700 transition-colors"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            )}

            {/* Question Input Form */}
            <form onSubmit={e => { e.preventDefault(); handleAddQuestion(); }} className="flex gap-2">
              <input
                id="input-slide-question"
                type="text"
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                placeholder="اكتب سؤالك أو استفسارك حول هذه الشريحة وسيجيبك النظام فورياً..."
                className="flex-1 bg-neutral-950 border border-neutral-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none transition-colors"
              />
              <button
                id="btn-submit-question"
                type="submit"
                disabled={!newQuestionText.trim()}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 rounded-xl text-xs sm:text-sm font-black text-white transition-all shadow-md"
              >
                إرسال السؤال
              </button>
            </form>

            {/* Existing Questions List */}
            <div className="space-y-3">
              {currentSlide.questions.map(q => (
                <div key={q.id} className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                      <span className="text-cyan-400">س:</span>
                      <span>{q.question}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500 font-mono">{q.timestamp}</span>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-neutral-500 hover:text-red-400 text-xs p-1 transition-colors"
                        title="حذف هذا السؤال"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {q.answer && (
                    <div className="bg-neutral-900/90 rounded-lg p-2.5 text-xs sm:text-sm text-neutral-300 border-r-2 border-cyan-400">
                      <span className="font-bold text-cyan-300 ml-1.5">ج:</span>
                      <span>{q.answer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer (Prev / Next Slide Navigation) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-800 bg-neutral-950/90">
          <button
            id="btn-prev-slide"
            disabled={currentSlideIndex === 0}
            onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl text-xs font-black bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors flex items-center gap-1"
          >
            ← الشريحة السابقة
          </button>
          <span className="text-xs text-neutral-400 font-mono font-bold">
            شريحة {currentSlideIndex + 1} من {slides.length}
          </span>
          <button
            id="btn-next-slide"
            disabled={currentSlideIndex === slides.length - 1}
            onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
            className="px-4 py-2 rounded-xl text-xs font-black bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors flex items-center gap-1"
          >
            الشريحة التالية →
          </button>
        </div>
      </div>
    </div>
  );
};
