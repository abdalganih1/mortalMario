import React from 'react';
import { FighterId } from '../types';

export interface MobileControlsProps {
  character: FighterId;
  onPress: (
    action:
      | 'left'
      | 'right'
      | 'jump'
      | 'attack'
      | 'rangedSpecial'
      | 'closeSpecial'
      | 'dash'
      | 'dashUp'
      | 'down'
      | 'block'
      | 'special1'
      | 'special2'
  ) => void;
  onRelease: (
    action:
      | 'left'
      | 'right'
      | 'jump'
      | 'attack'
      | 'rangedSpecial'
      | 'closeSpecial'
      | 'dash'
      | 'dashUp'
      | 'down'
      | 'block'
      | 'special1'
      | 'special2'
  ) => void;
  cooldownRangedSpecial?: number;
  cooldownCloseSpecial?: number;
  cooldownSpecial1?: number;
  cooldownSpecial2?: number;
  cooldownDash?: number;
  upShiftCooldown?: number;
  hasAirShift?: boolean;
  isGrounded?: boolean;
  rangedLocked?: boolean;
  upshiftLocked?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  character,
  onPress,
  onRelease,
  cooldownRangedSpecial,
  cooldownCloseSpecial,
  cooldownSpecial1 = 0,
  cooldownSpecial2 = 0,
  upShiftCooldown = 0,
  hasAirShift = true,
  isGrounded = true,
  rangedLocked = false,
  upshiftLocked = false,
}) => {
  // Support both new prop names and backwards compatible prop names
  const cdRanged = cooldownRangedSpecial !== undefined ? cooldownRangedSpecial : cooldownSpecial1;
  const cdClose = cooldownCloseSpecial !== undefined ? cooldownCloseSpecial : cooldownSpecial2;

  const bindControl = (
    action:
      | 'left'
      | 'right'
      | 'jump'
      | 'attack'
      | 'rangedSpecial'
      | 'closeSpecial'
      | 'dash'
      | 'dashUp'
      | 'down'
      | 'block'
      | 'special1'
      | 'special2'
  ) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        onPress(action);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        onRelease(action);
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        onRelease(action);
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        onPress(action);
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        onRelease(action);
      },
      onMouseLeave: () => {
        onRelease(action);
      },
    };
  };

  const getFighterDetails = () => {
    switch (character) {
      case 'subzero':
        return {
          rangedName: 'قذيفة تجميد ❄️',
          rangedSub: 'Ice Blast',
          closeName: 'تزحلق جليد ⛸️',
          closeShort: 'تزحلق ⛸️',
          rangedTheme:
            'bg-cyan-950/90 border-cyan-400 text-cyan-100 shadow-[0_0_14px_rgba(6,182,212,0.45)]',
        };
      case 'scorpion':
        return {
          rangedName: 'رمح سكوربيان 🦂',
          rangedSub: 'Harpoon Spear',
          closeName: 'انتقال الجحيم 🔥',
          closeShort: 'انتقال 🔥',
          rangedTheme:
            'bg-amber-950/90 border-amber-400 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.45)]',
        };
      case 'noob':
        return {
          rangedName: 'شبح نوب 👤',
          rangedSub: 'Shadow Rush',
          closeName: 'دوامة الظل 🌀',
          closeShort: 'دوامة 🌀',
          rangedTheme:
            'bg-purple-950/90 border-purple-400 text-purple-100 shadow-[0_0_14px_rgba(168,85,247,0.45)]',
        };
      case 'raiden':
        return {
          rangedName: 'صاعقة برق ⚡',
          rangedSub: 'Lightning Bolt',
          closeName: 'توربيدو طائر 🚀',
          closeShort: 'توربيدو 🚀',
          rangedTheme:
            'bg-sky-950/90 border-sky-400 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.45)]',
        };
      case 'reptile':
        return {
          rangedName: 'بصاق أسيد 🦎',
          rangedSub: 'Acid Spit',
          closeName: 'كرة القوة 🟢',
          closeShort: 'كرة قوة 🟢',
          rangedTheme:
            'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-[0_0_14px_rgba(34,197,94,0.45)]',
        };
      case 'baraka':
        return {
          rangedName: 'شرارة شفرة 🔪',
          rangedSub: 'Blade Spark',
          closeName: 'تمزيق دوار 🌀',
          closeShort: 'تمزيق 🌀',
          rangedTheme:
            'bg-rose-950/90 border-rose-400 text-rose-100 shadow-[0_0_14px_rgba(244,63,94,0.45)]',
        };
      case 'liukang':
        return {
          rangedName: 'نار التنين 🐉',
          rangedSub: 'Dragon Fire',
          closeName: 'ركلة الدراجة 🦵',
          closeShort: 'دراجة 🦵',
          rangedTheme:
            'bg-orange-950/90 border-orange-400 text-orange-100 shadow-[0_0_14px_rgba(249,115,22,0.45)]',
        };
      case 'kitana':
        return {
          rangedName: 'رمي مروحة 🪭',
          rangedSub: 'Fan Throw',
          closeName: 'رفعة مروحة ⬆️',
          closeShort: 'رفعة ⬆️',
          rangedTheme:
            'bg-blue-950/90 border-blue-400 text-blue-100 shadow-[0_0_14px_rgba(96,165,250,0.45)]',
        };
      case 'shangtsung':
        return {
          rangedName: 'جمجمة روح 💀',
          rangedSub: 'Soul Skull',
          closeName: 'تحول ظل 👤',
          closeShort: 'تحول 👤',
          rangedTheme:
            'bg-violet-950/90 border-violet-400 text-violet-100 shadow-[0_0_14px_rgba(168,85,247,0.45)]',
        };
      case 'kunglao':
        return {
          rangedName: 'قبعة شفرة 🎩',
          rangedSub: 'Hat Throw',
          closeName: 'إعصار قبعة 🌀',
          closeShort: 'إعصار 🌀',
          rangedTheme:
            'bg-yellow-950/90 border-yellow-400 text-yellow-100 shadow-[0_0_14px_rgba(234,179,8,0.45)]',
        };
      case 'johnnycage':
        return {
          rangedName: 'كرة كيج 🕶️',
          rangedSub: 'Cage Bolt',
          closeName: 'لكمة الظل 👊',
          closeShort: 'ظل 👊',
          rangedTheme:
            'bg-green-950/90 border-green-400 text-green-100 shadow-[0_0_14px_rgba(74,222,128,0.45)]',
        };
      case 'jax':
        return {
          rangedName: 'موجة صدمة 🦾',
          rangedSub: 'Shockwave',
          closeName: 'غوتشا 👊👊',
          closeShort: 'غوتشا 👊',
          rangedTheme:
            'bg-slate-950/90 border-slate-400 text-slate-100 shadow-[0_0_14px_rgba(148,163,184,0.45)]',
        };
      case 'sonya':
        return {
          rangedName: 'حلقة طاقة 💖',
          rangedSub: 'Energy Ring',
          closeName: 'ركلة مقص 🦵',
          closeShort: 'مقص 🦵',
          rangedTheme:
            'bg-pink-950/90 border-pink-400 text-pink-100 shadow-[0_0_14px_rgba(244,114,182,0.45)]',
        };
      case 'kano':
        return { rangedName: 'سكين كانو 🔪', rangedSub: 'Knife', closeName: 'كرة مدفع 🌀', closeShort: 'مدفع 🌀', rangedTheme: 'bg-red-950/90 border-red-400 text-red-100 shadow-[0_0_14px_rgba(239,68,68,0.45)]' };
      case 'jade':
        return { rangedName: 'بوميرانغ 🪃', rangedSub: 'Rang', closeName: 'ركلة خفية 🦵', closeShort: 'خفية 🦵', rangedTheme: 'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-[0_0_14px_rgba(16,185,129,0.45)]' };
      case 'mileena':
        return { rangedName: 'سكين ساي 👄', rangedSub: 'Sai', closeName: 'انقضاض 👊', closeShort: 'عضة 👊', rangedTheme: 'bg-pink-950/90 border-pink-400 text-pink-100 shadow-[0_0_14px_rgba(236,72,153,0.45)]' };
      case 'ermac':
        return { rangedName: 'رفع ذهني 🔴', rangedSub: 'Slam', closeName: 'انتقال شبحي 👤', closeShort: 'شبح 👤', rangedTheme: 'bg-red-950/90 border-red-400 text-red-100 shadow-[0_0_14px_rgba(220,38,38,0.45)]' };
      case 'smoke':
        return { rangedName: 'قنبلة دخان 💨', rangedSub: 'Bomb', closeName: 'اندفاع دخان 🌀', closeShort: 'دخان 🌀', rangedTheme: 'bg-gray-950/90 border-gray-400 text-gray-100 shadow-[0_0_14px_rgba(156,163,175,0.45)]' };
      case 'rain':
        return { rangedName: 'كرة ماء 🌧️', rangedSub: 'Water', closeName: 'ينبوع ⬆️', closeShort: 'ينبوع ⬆️', rangedTheme: 'bg-sky-950/90 border-sky-400 text-sky-100 shadow-[0_0_14px_rgba(14,165,233,0.45)]' };
      case 'sindel':
        return { rangedName: 'صرخة 📢', rangedSub: 'Scream', closeName: 'جلدة شعر 💇', closeShort: 'جلدة 💇', rangedTheme: 'bg-purple-950/90 border-purple-400 text-purple-100 shadow-[0_0_14px_rgba(192,132,252,0.45)]' };
      case 'nightwolf':
        return { rangedName: 'سهم روح 🐺', rangedSub: 'Arrow', closeName: 'توماهوك 🪓', closeShort: 'فأس 🪓', rangedTheme: 'bg-yellow-950/90 border-yellow-400 text-yellow-100 shadow-[0_0_14px_rgba(161,98,7,0.45)]' };
      case 'kabal':
        return { rangedName: 'منشار 🌪️', rangedSub: 'Saw', closeName: 'نوماد ⚡', closeShort: 'نوماد ⚡', rangedTheme: 'bg-stone-950/90 border-stone-400 text-stone-100 shadow-[0_0_14px_rgba(120,113,108,0.45)]' };
      case 'sheeva':
        return { rangedName: 'نار شيفا 🔥', rangedSub: 'Fire', closeName: 'زلزال 👊', closeShort: 'زلزال 👊', rangedTheme: 'bg-orange-950/90 border-orange-400 text-orange-100 shadow-[0_0_14px_rgba(234,88,12,0.45)]' };
      case 'quanchi':
        return { rangedName: 'جمجمة 🔮', rangedSub: 'Skull', closeName: 'غيبوبة 😵', closeShort: 'غيبوبة 😵', rangedTheme: 'bg-lime-950/90 border-lime-400 text-lime-100 shadow-[0_0_14px_rgba(101,163,13,0.45)]' };
      case 'fujin':
        return { rangedName: 'عاصفة 🌪️', rangedSub: 'Wind', closeName: 'ركلة سماء 🦵', closeShort: 'سماء 🦵', rangedTheme: 'bg-slate-950/90 border-slate-200 text-slate-100 shadow-[0_0_14px_rgba(226,232,240,0.45)]' };
      case 'striker':
        return { rangedName: 'قنبلة 🚔', rangedSub: 'Grenade', closeName: 'هراوة 👮', closeShort: 'هراوة 👮', rangedTheme: 'bg-blue-950/90 border-blue-400 text-blue-100 shadow-[0_0_14px_rgba(37,99,235,0.45)]' };
      case 'goro':
        return { rangedName: 'نار غورو 👹', rangedSub: 'Fire', closeName: 'سحق 👊', closeShort: 'سحق 👊', rangedTheme: 'bg-amber-950/90 border-amber-400 text-amber-100 shadow-[0_0_14px_rgba(180,83,9,0.45)]' };
      case 'kintaro':
        return { rangedName: 'نار النمر 🐯', rangedSub: 'Flames', closeName: 'دوسة 🦶', closeShort: 'دوسة 🦶', rangedTheme: 'bg-red-950/90 border-red-400 text-red-100 shadow-[0_0_14px_rgba(220,38,38,0.45)]' };
      case 'shaokahn':
        return { rangedName: 'مطرقة كان 🔨', rangedSub: 'Hammer', closeName: 'دفعة كتف 💪', closeShort: 'كتف 💪', rangedTheme: 'bg-amber-950/90 border-yellow-400 text-yellow-100 shadow-[0_0_14px_rgba(245,158,11,0.45)]' };
    }
  };

  const fighter = getFighterDetails();
  const isUpShiftAvailable = upShiftCooldown <= 0 && (isGrounded || hasAirShift);

  return (
    <div
      id="mobile-touch-controller"
      dir="ltr"
      className="fixed inset-x-0 bottom-0 pointer-events-none z-40 select-none pb-[max(0.5rem,env(safe-area-inset-bottom))] landscape:pb-1 px-2 sm:px-6 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent"
    >
      {/* Main Touch Buttons Row — compact portrait grid, roomy desktop row */}
      <div className="flex justify-between items-end w-full gap-1">
        {/* LEFT SIDE: Directional Controls (Double-tap left/right = Dash Left/Right) */}
        <div className="flex items-center gap-1.5 pointer-events-auto" dir="ltr">
          {/* LEFT BUTTON */}
          <button
            id="btn-move-left"
            type="button"
            {...bindControl('left')}
            className="w-12 h-14 sm:w-20 sm:h-20 landscape:w-11 landscape:h-11 landscape:opacity-80 rounded-2xl bg-neutral-900/90 border-2 border-neutral-700 active:border-cyan-400 active:bg-neutral-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Move Left / Double-tap to Dash Left"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-black text-neutral-200">يسار</span>
            <span className="text-[7px] sm:text-[8px] font-mono text-cyan-400 tracking-tighter">2x ⚡ شفت</span>
          </button>

          {/* RIGHT BUTTON */}
          <button
            id="btn-move-right"
            type="button"
            {...bindControl('right')}
            className="w-12 h-14 sm:w-20 sm:h-20 landscape:w-11 landscape:h-11 landscape:opacity-80 rounded-2xl bg-neutral-900/90 border-2 border-neutral-700 active:border-cyan-400 active:bg-neutral-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Move Right / Double-tap to Dash Right"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-black text-neutral-200">يمين</span>
            <span className="text-[7px] sm:text-[8px] font-mono text-cyan-400 tracking-tighter">2x ⚡ شفت</span>
          </button>

          {/* DOWN / CROUCH / PIPE ENTER BUTTON */}
          <button
            id="btn-move-down"
            type="button"
            {...bindControl('down')}
            className="w-11 h-14 sm:w-16 sm:h-20 landscape:w-10 landscape:h-11 landscape:opacity-80 rounded-2xl bg-neutral-900/90 border-2 border-emerald-700 active:border-emerald-400 active:bg-neutral-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Crouch / Enter Warp Pipe"
          >
            <svg className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-black text-neutral-200">▼ انحناء</span>
            <span className="text-[7px] sm:text-[8px] font-mono text-emerald-400 tracking-tighter">أنبوب ▼</span>
          </button>
        </div>

        {/* RIGHT SIDE: compact 2x2 thumb grid on phones, full row on desktop */}
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-end sm:gap-2.5 pointer-events-auto" dir="ltr">
          {/* 0. DEDICATED DEFEND (زر الدفاع — اضغط باستمرار للصد) */}
          <button
            id="btn-action-defend"
            type="button"
            {...bindControl('block')}
            className="w-14 h-12 sm:w-16 sm:h-20 landscape:h-11 landscape:opacity-80 rounded-2xl bg-blue-950/90 border-2 border-blue-400 active:border-blue-200 active:bg-blue-900 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Defend / Block"
          >
            <span className="text-base sm:text-xl leading-tight">🛡️</span>
            <span className="text-[10px] sm:text-[11px] font-black leading-tight">دفاع</span>
            <span className="text-[7px] sm:text-[8px] font-mono text-blue-200 tracking-tighter">اضغط مطولاً</span>
          </button>
          {/* 1. DEDICATED RANGED SPECIAL (حركة 2 البعيدة - زر منفصل ومخصص) */}
          <button
            id="btn-action-ranged-special"
            type="button"
            {...bindControl('rangedSpecial')}
            className={`h-12 sm:h-18 px-2 sm:px-4 landscape:h-11 landscape:opacity-80 rounded-2xl border-2 flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-sm ${
              rangedLocked ? 'bg-neutral-900/90 border-neutral-700 text-neutral-400 saturate-0' : fighter.rangedTheme
            } ${cdRanged > 0 ? 'opacity-65' : 'hover:brightness-110'}`}
            aria-label="Ranged Special Move"
          >
            <span className="text-[10px] sm:text-sm font-black whitespace-nowrap leading-tight">
              {rangedLocked ? '🔒 مقفولة' : fighter.rangedName}
            </span>
            <span className="text-[7px] sm:text-[9px] font-mono opacity-90 tracking-tighter">
              {rangedLocked ? 'المرحلة 3' : cdRanged > 0 ? `⏳ ${Math.ceil(cdRanged)}s` : '🎯 حركة بعيدة'}
            </span>
          </button>

          {/* 2. ATTACK BUTTON (نفس زر الضربة: نقرة = لكمة/أبركت، نقرتين = حركة 1 القريبة) */}
          <button
            id="btn-action-attack"
            type="button"
            {...bindControl('attack')}
            className="w-14 h-12 sm:w-20 sm:h-20 landscape:h-11 landscape:opacity-80 rounded-2xl bg-red-900/90 border-2 border-red-500 active:border-red-300 active:bg-red-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Attack / Double-tap for Close Special"
          >
            <span className="text-[10px] sm:text-sm font-black leading-tight">🥊 قتال</span>
            <span className="text-[7px] sm:text-[9px] font-mono text-red-200 tracking-tighter">
              {cdClose > 0 ? `⏳ ${Math.ceil(cdClose)}s` : `2x ${fighter.closeShort}`}
            </span>
          </button>

          {/* 3. JUMP BUTTON (نقرة = قفز، نقرتين ورا بعض = شيفت للأعلى المشروط بلمس الأرض) */}
          <button
            id="btn-action-jump"
            type="button"
            {...bindControl('jump')}
            className={`w-14 h-12 sm:w-20 sm:h-20 landscape:h-11 landscape:opacity-80 rounded-2xl border-2 flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-transform backdrop-blur-sm ${
              isUpShiftAvailable
                ? 'bg-emerald-700/90 border-emerald-400 active:bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-900/70 border-emerald-600/60 text-emerald-200'
            }`}
            aria-label="Jump / Double-tap for Upward Super Shift"
          >
            <svg className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-[10px] sm:text-xs font-black">قفز</span>
            <span className="text-[7px] sm:text-[8px] font-mono tracking-tighter">
              {upshiftLocked
                ? '🔒 المرحلة 4'
                : upShiftCooldown > 0
                ? `⏳ ${Math.ceil(upShiftCooldown)}s`
                : !isGrounded && !hasAirShift
                ? '⛔ المس الأرض'
                : '2x 🚀 شيفت'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
