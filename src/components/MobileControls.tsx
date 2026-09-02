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
    }
  };

  const fighter = getFighterDetails();
  const isUpShiftAvailable = upShiftCooldown <= 0 && (isGrounded || hasAirShift);

  return (
    <div
      id="mobile-touch-controller"
      dir="ltr"
      className="fixed inset-x-0 bottom-0 pointer-events-none z-40 select-none pb-2 sm:pb-3 px-3 sm:px-6 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent"
    >
      {/* Top Controls Guide Banner (Clear, uncluttered instruction) */}
      <div className="flex justify-center mb-1.5 pointer-events-none">
        <div className="bg-neutral-900/80 border border-neutral-700/70 rounded-full px-3 py-0.5 text-[10px] sm:text-xs text-neutral-300 flex items-center gap-2 backdrop-blur-sm shadow-md">
          <span className="text-amber-400 font-bold">2x 🦘 قفز = 🚀 شيفت لأعلى</span>
          <span className="text-neutral-500">|</span>
          <span className="text-cyan-400 font-bold">2x ⬅️/➡️ = ⚡ شفت خاطف</span>
          <span className="text-neutral-500">|</span>
          <span className="text-red-400 font-bold">2x 🥊 = {fighter.closeShort}</span>
        </div>
      </div>

      {/* Main Touch Buttons Row (Decluttered: 2 buttons on left, 3 on right) */}
      <div className="flex justify-between items-end w-full">
        {/* LEFT SIDE: Directional Controls (Double-tap left/right = Dash Left/Right) */}
        <div className="flex items-center gap-2.5 pointer-events-auto" dir="ltr">
          {/* LEFT BUTTON */}
          <button
            id="btn-move-left"
            type="button"
            {...bindControl('left')}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-neutral-900/90 border-2 border-neutral-700 active:border-cyan-400 active:bg-neutral-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Move Left / Double-tap to Dash Left"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[11px] font-black text-neutral-200">يسار</span>
            <span className="text-[8px] font-mono text-cyan-400 tracking-tighter">2x ⚡ شفت</span>
          </button>

          {/* RIGHT BUTTON */}
          <button
            id="btn-move-right"
            type="button"
            {...bindControl('right')}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-neutral-900/90 border-2 border-neutral-700 active:border-cyan-400 active:bg-neutral-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Move Right / Double-tap to Dash Right"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[11px] font-black text-neutral-200">يمين</span>
            <span className="text-[8px] font-mono text-cyan-400 tracking-tighter">2x ⚡ شفت</span>
          </button>
        </div>

        {/* RIGHT SIDE: 3 Ergonomic Buttons (Ranged Special, Attack, Jump) */}
        <div className="flex items-end gap-2.5 pointer-events-auto" dir="ltr">
          {/* 1. DEDICATED RANGED SPECIAL (حركة 2 البعيدة - زر منفصل ومخصص) */}
          <button
            id="btn-action-ranged-special"
            type="button"
            {...bindControl('rangedSpecial')}
            className={`h-16 sm:h-18 px-3.5 sm:px-4 rounded-2xl border-2 flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-sm ${
              fighter.rangedTheme
            } ${cdRanged > 0 ? 'opacity-65' : 'hover:brightness-110'}`}
            aria-label="Ranged Special Move"
          >
            <span className="text-xs sm:text-sm font-black whitespace-nowrap leading-tight">
              {fighter.rangedName}
            </span>
            <span className="text-[9px] font-mono opacity-90 tracking-tighter">
              {cdRanged > 0 ? `⏳ ${Math.ceil(cdRanged)}s` : '🎯 حركة بعيدة'}
            </span>
          </button>

          {/* 2. ATTACK BUTTON (نفس زر الضربة: نقرة = لكمة/أبركت، نقرتين = حركة 1 القريبة) */}
          <button
            id="btn-action-attack"
            type="button"
            {...bindControl('attack')}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-red-900/90 border-2 border-red-500 active:border-red-300 active:bg-red-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Attack / Double-tap for Close Special"
          >
            <span className="text-xs sm:text-sm font-black leading-tight">🥊 قتال</span>
            <span className="text-[9px] font-mono text-red-200 tracking-tighter">
              {cdClose > 0 ? `⏳ ${Math.ceil(cdClose)}s` : `2x ${fighter.closeShort}`}
            </span>
          </button>

          {/* 3. JUMP BUTTON (نقرة = قفز، نقرتين ورا بعض = شيفت للأعلى المشروط بلمس الأرض) */}
          <button
            id="btn-action-jump"
            type="button"
            {...bindControl('jump')}
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-transform backdrop-blur-sm ${
              isUpShiftAvailable
                ? 'bg-emerald-700/90 border-emerald-400 active:bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-900/70 border-emerald-600/60 text-emerald-200'
            }`}
            aria-label="Jump / Double-tap for Upward Super Shift"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-xs font-black">قفز</span>
            <span className="text-[8px] font-mono tracking-tighter">
              {upShiftCooldown > 0
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
