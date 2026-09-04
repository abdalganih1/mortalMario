import React from 'react';
import { FighterId } from '../types';
import { FIGHTERS, FIGHTER_UNLOCK, isFighterUnlocked } from '../game/characters';
import { soundManager } from '../audio/soundEffects';

interface CharacterSelectModalProps {
  selectedFighter: FighterId;
  onSelectFighter: (fighter: FighterId) => void;
  onStartGame: () => void;
  isOpen: boolean;
  onOpenGuide?: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedFighter,
  onSelectFighter,
  onStartGame,
  isOpen,
  onOpenGuide,
}) => {
  if (!isOpen) return null;

  const fighters = Object.values(FIGHTERS);
  // Never show a locked fighter as selected
  const effectiveFighter = isFighterUnlocked(selectedFighter) ? selectedFighter : 'subzero';
  const current = FIGHTERS[effectiveFighter];

  const handlePick = (id: FighterId) => {
    if (!isFighterUnlocked(id)) {
      soundManager.playError();
      return;
    }
    soundManager.playPunch();
    onSelectFighter(id);
  };

  const handleConfirm = () => {
    soundManager.playDash();
    if (effectiveFighter !== selectedFighter) onSelectFighter(effectiveFighter);
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none overflow-y-auto">
      <div
        id="character-select-box"
        className="w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-neutral-950 border-2 border-red-800/80 rounded-2xl shadow-2xl p-4 sm:p-7 flex flex-col gap-4 sm:gap-6 text-neutral-100"
      >
        {/* Title */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono tracking-widest text-amber-500 uppercase">
            Mortal Mario Kombat • Choose Your Fighter
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
            اختر مقاتلك للمغامرة
          </h1>
          <p className="text-xs text-neutral-400">
            اسحب أفقياً لتصفح المقاتلين الـ13 👉 المقفل ينفتح بالفوز بالمراحل
          </p>
        </div>

        {/* Fighter Cards — swipe carousel on mobile, scrollable grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:max-h-[46vh] snap-x snap-mandatory sm:snap-none pb-2 sm:pb-1 -mx-1 px-1">
          {fighters.map(fighter => {
            const isSelected = effectiveFighter === fighter.id;
            const locked = !isFighterUnlocked(fighter.id);
            return (
              <button
                key={fighter.id}
                id={`select-fighter-${fighter.id}`}
                onClick={() => handlePick(fighter.id)}
                disabled={locked}
                className={`group relative p-3 sm:p-4 rounded-xl border-2 text-right transition-all flex flex-col justify-between overflow-hidden snap-center shrink-0 w-[68vw] max-w-[240px] sm:w-auto sm:max-w-none min-h-[150px] sm:min-h-[132px] ${
                  locked
                    ? 'border-neutral-800 bg-neutral-950/80 opacity-50 saturate-0 cursor-not-allowed'
                    : isSelected
                    ? 'border-red-500 bg-neutral-900 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02]'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900/90 opacity-80'
                }`}
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 inset-x-0 h-1.5"
                  style={{ backgroundColor: fighter.primaryColor }}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{locked ? '🔒' : fighter.avatar}</span>
                    <span
                      className="text-xs font-mono font-black uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${fighter.primaryColor}22`,
                        color: fighter.primaryColor,
                        border: `1px solid ${fighter.primaryColor}55`,
                      }}
                    >
                      {fighter.name}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white">{fighter.nameAr}</h3>
                    <p className="text-[11px] text-neutral-400 leading-snug">{fighter.title}</p>
                  </div>
                </div>

                {/* Special move highlight */}
                <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 block">
                    {fighter.id === 'noob' ? '✨ حركة محدثة:' : 'المهارة الرئيسية:'}
                  </span>
                  <span className="text-xs font-bold text-neutral-200 block truncate">
                    {locked ? `يفتح بالمرحلة ${FIGHTER_UNLOCK[fighter.id] + 1} 🏆` : fighter.special1Name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Fighter Detailed Inspector */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                تفاصيل المقاتل المختار
              </span>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{current.nameAr}</span>
                <span className="text-xs font-mono text-neutral-400">({current.name})</span>
              </h2>
            </div>
            <span className="text-xs italic text-amber-300 font-mono">
              "{current.quote}"
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {current.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-neutral-950/70 border border-neutral-800/80 p-3 rounded-lg">
              <span className="text-[11px] font-bold text-cyan-400 block mb-1">
                المهارة 1: {current.special1Name}
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                {current.special1Desc}
              </p>
            </div>
            <div className="bg-neutral-950/70 border border-neutral-800/80 p-3 rounded-lg">
              <span className="text-[11px] font-bold text-indigo-400 block mb-1">
                المهارة 2: {current.special2Name}
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                {current.special2Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {onOpenGuide && (
            <button
              id="btn-open-guide-select"
              onClick={onOpenGuide}
              className="py-3.5 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.99] text-neutral-200 border border-neutral-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>📊</span>
              <span>ملف الشرح والمخططات</span>
            </button>
          )}
          <button
            id="btn-confirm-start-game"
            onClick={handleConfirm}
            className="flex-1 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 active:scale-[0.99] text-white font-black text-base sm:text-lg tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>بدء القتال في عوالم ماريو</span>
            <span>⚔️</span>
          </button>
        </div>
      </div>
    </div>
  );
};
