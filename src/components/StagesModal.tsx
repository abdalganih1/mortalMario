import React from 'react';
import { LEVEL_DEFINITIONS } from '../game/levels';
import { getMaxStageCleared, FIGHTER_UNLOCK } from '../game/characters';
import { FighterId } from '../types';
import { soundManager } from '../audio/soundEffects';

interface StagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIdx: number;
  onPick: (idx: number) => void;
}

// Which fighters unlock at each stage index (for badges)
const UNLOCK_AT: Record<number, FighterId[]> = {};
(Object.entries(FIGHTER_UNLOCK) as [FighterId, number][]).forEach(([id, req]) => {
  if (!UNLOCK_AT[req]) UNLOCK_AT[req] = [];
  UNLOCK_AT[req].push(id);
});

export const StagesModal: React.FC<StagesModalProps> = ({ isOpen, onClose, currentIdx, onPick }) => {
  if (!isOpen) return null;
  const maxCleared = getMaxStageCleared();
  const maxEnterable = Math.min(LEVEL_DEFINITIONS.length - 1, maxCleared + 1);

  const handlePick = (idx: number) => {
    if (idx > maxEnterable) {
      soundManager.playError();
      return;
    }
    soundManager.playDash();
    onPick(idx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none overflow-y-auto" dir="rtl">
      <div className="w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-neutral-950 border-2 border-emerald-800/80 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4 text-neutral-100">
        <div className="text-center space-y-1 shrink-0">
          <span className="text-[11px] font-mono tracking-widest text-emerald-500 uppercase">
            🗺️ Stages • {LEVEL_DEFINITIONS.length} مرحلة
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-emerald-400">
            المراحل
          </h1>
          <p className="text-xs text-neutral-400">
            وصلت للمرحلة {maxCleared + 2 > LEVEL_DEFINITIONS.length ? LEVEL_DEFINITIONS.length : maxCleared + 2} • اضغط أي مرحلة خضراء لتدخلها فوراً
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 landscape:grid-cols-8 gap-2 overflow-y-auto p-1">
          {LEVEL_DEFINITIONS.map((lv, idx) => {
            const cleared = idx <= maxCleared;
            const isCurrent = idx === currentIdx;
            const enterable = idx <= maxEnterable;
            const unlocks = UNLOCK_AT[idx + 1] || [];
            return (
              <button
                key={idx}
                id={`stage-btn-${idx}`}
                onClick={() => handlePick(idx)}
                disabled={!enterable}
                title={`${lv.nameAr}${unlocks.length ? ' • يفتح: ' + unlocks.join('، ') : ''}`}
                className={`relative min-h-[64px] rounded-xl border-2 p-1.5 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_14px_rgba(245,158,11,0.5)] animate-pulse'
                    : cleared
                    ? 'border-emerald-700 bg-emerald-950/50 hover:bg-emerald-900/60'
                    : enterable
                    ? 'border-sky-600 bg-sky-950/50 hover:bg-sky-900/60'
                    : 'border-neutral-800 bg-neutral-950/80 opacity-40 saturate-0'
                }`}
              >
                <span className="text-lg leading-none">
                  {!enterable ? '🔒' : cleared ? '✅' : isCurrent ? '📍' : '▶️'}
                </span>
                <span className="text-sm font-black text-white leading-none">{idx + 1}</span>
                <span className="text-[8px] text-neutral-400 leading-tight truncate w-full text-center">
                  {lv.nameAr.split(':')[0]}
                </span>
                {unlocks.length > 0 && enterable && (
                  <span className="absolute -top-1.5 -left-1.5 text-[10px] bg-amber-500 text-black rounded-full w-5 h-5 flex items-center justify-center font-black" title="يفتح مقاتل!">
                    🔓
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -bottom-1.5 text-[8px] bg-amber-500 text-black rounded-full px-1.5 font-black whitespace-nowrap">
                    أنت هنا
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-sm active:scale-95 transition-all"
        >
          رجوع للعب 🔙
        </button>
      </div>
    </div>
  );
};
