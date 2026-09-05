import React from 'react';
import { Player, Enemy } from '../types';
import { FIGHTERS, MOVE_UNLOCK, MOVE_NAMES } from '../game/characters';

interface GameHUDProps {
  player: Player;
  currentWorld: number;
  currentLevel: number;
  stageIdx: number;
  timeRemaining: number;
  bossEnemy: Enemy | null;
  onOpenGuide: () => void;
  onOpenSelectFighter: () => void;
  onOpenStages?: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  onTogglePause: () => void;
  isPaused: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  currentWorld,
  currentLevel,
  stageIdx,
  timeRemaining,
  bossEnemy,
  onOpenGuide,
  onOpenSelectFighter,
  onOpenStages,
  onToggleSound,
  isMuted,
  isPaused,
  onTogglePause,
}) => {
  const fighter = FIGHTERS[player.character];
  const bloodPct = Math.max(0, ((player.blood ?? 100) / (player.maxBlood ?? 100)) * 100);
  // Next move to unlock (progression hint)
  const nextMove = (Object.keys(MOVE_UNLOCK) as (keyof typeof MOVE_UNLOCK)[]).find(m => stageIdx < MOVE_UNLOCK[m]);

  return (
    <div
      id="game-hud"
      className="absolute top-0 inset-x-0 z-50 pointer-events-none p-2 sm:p-3 flex flex-col gap-2 font-mono"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-white font-black drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
        {/* Left: Player Info & MK BLOOD BAR */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 px-2.5 py-1 rounded-xl border border-neutral-700/60 backdrop-blur-sm">
          <span className="text-base sm:text-lg">{fighter.avatar}</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-neutral-400 leading-none">{fighter.name}</span>
            {/* MK-style blood bar */}
            <div className="w-24 sm:w-36 h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700" dir="ltr">
              <div
                className={`h-full transition-all duration-200 ${bloodPct > 50 ? 'bg-gradient-to-r from-emerald-600 via-yellow-400 to-yellow-300' : bloodPct > 25 ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400' : 'bg-gradient-to-r from-red-700 via-red-500 to-red-400 animate-pulse'}`}
                style={{ width: `${bloodPct}%` }}
              />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {/* Health Hearts */}
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < player.health ? 'text-red-500' : 'text-neutral-600'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-neutral-300 ml-1">x{player.lives}</span>
              {player.isBlocking && <span className="text-[10px] text-blue-300 font-black">🛡️ دفاع</span>}
              {player.powerUp === 'flower' && <span className="text-[10px] text-pink-300 font-black">🌸x{player.flowerShield ?? 3}</span>}
              {player.powerUp !== 'none' && <span className="text-[10px] text-emerald-300 font-black">⬆️ كبير</span>}
            </div>
          </div>
        </div>

        {/* Center: Coins, Score & World */}
        <div className="flex items-center gap-3 sm:gap-6 bg-black/60 px-3 py-1 rounded-xl border border-neutral-700/60 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">🪙</span>
            <span className="text-amber-300">{player.coins.toString().padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-neutral-400 text-[10px] hidden sm:inline">WORLD</span>
            <span className="text-emerald-400 font-black">{currentWorld}-{currentLevel}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-neutral-400 text-[10px] hidden sm:inline">TIME</span>
            <span className={`${timeRemaining < 30 ? 'text-red-400 animate-pulse' : 'text-neutral-200'}`}>
              {timeRemaining}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <span className="text-neutral-400 text-[10px]">SCORE</span>
            <span className="text-white">{player.score.toString().padStart(6, '0')}</span>
          </div>

          {nextMove && (
            <div className="hidden sm:flex items-center gap-1" title="الحركة القادمة">
              <span className="text-fuchsia-300 text-[10px] font-black">🔓 {MOVE_NAMES[nextMove]} • مرحلة {MOVE_UNLOCK[nextMove] + 1}</span>
            </div>
          )}
        </div>

        {/* Right: Controls & Guide Quick Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Stages map button (progress + jump to any cleared stage) */}
          <button
            id="btn-open-stages-hud"
            onClick={onOpenStages}
            title="خريطة المراحل والتقدم"
            className="px-2.5 py-1.5 min-h-[44px] landscape:min-h-[44px] rounded-lg bg-emerald-900/80 hover:bg-emerald-800 active:scale-95 border border-emerald-500/80 text-emerald-100 text-xs font-bold flex items-center gap-1 transition-all backdrop-blur-sm shadow-md"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">المراحل</span>
          </button>
          {/* Guide & Diagrams button */}
          <button
            id="btn-open-guide-hud"
            onClick={onOpenGuide}
            title="دليل اللعبة والمخططات التفاعلية"
            className="px-2.5 py-1.5 min-h-[44px] rounded-lg bg-indigo-900/80 hover:bg-indigo-800 active:scale-95 border border-indigo-500/80 text-indigo-100 text-xs font-bold flex items-center gap-1 transition-all backdrop-blur-sm shadow-md"
          >
            <span>📊</span>
            <span className="hidden sm:inline">المخططات والشرح</span>
          </button>

          {/* Change Fighter button */}
          <button
            id="btn-change-fighter-hud"
            onClick={onOpenSelectFighter}
            title="تغيير المقاتل"
            className="px-2 py-1.5 min-h-[44px] rounded-lg bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 border border-neutral-700 text-neutral-200 text-xs font-bold transition-all backdrop-blur-sm"
          >
            🥋
          </button>

          {/* Mute button */}
          <button
            id="btn-toggle-sound-hud"
            onClick={onToggleSound}
            title="كتم/تشغيل الصوت"
            className="p-1.5 min-h-[44px] min-w-[44px] rounded-lg bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 border border-neutral-700 text-neutral-200 text-xs font-bold transition-all backdrop-blur-sm"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause button */}
          <button
            id="btn-pause-game-hud"
            onClick={onTogglePause}
            className="p-1.5 min-h-[44px] min-w-[44px] rounded-lg bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 border border-neutral-700 text-neutral-200 text-xs font-bold transition-all backdrop-blur-sm"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {/* BOSS HEALTH BAR (Bowser, Rival Ninja, Kombatant Boss, Fighter Boss) */}
      {bossEnemy && bossEnemy.isAlive && (
        <div className={`w-full max-w-md mx-auto bg-neutral-950/90 border-2 ${
          bossEnemy.type === 'bowser' ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
        } rounded-xl p-2 flex flex-col gap-1 pointer-events-auto backdrop-blur-sm`}>
          <div className="flex items-center justify-between text-xs font-black">
            <span className={`${bossEnemy.type === 'bowser' ? 'text-red-500' : 'text-amber-400'} flex items-center gap-1`}>
              <span>{bossEnemy.type === 'bowser' ? '👑' : bossEnemy.type === 'fighter_boss' ? '★' : '⚔️'}</span>
              <span>
                {bossEnemy.type === 'bowser'
                  ? 'BOWSER • باوزر زعيم القلعة'
                  : bossEnemy.type === 'fighter_boss'
                  ? `FINAL BOSS: ${(bossEnemy.fighterKind || 'warlord').toUpperCase()} • زعيم المقاتلين`
                  : `RIVAL BOSS: ${(bossEnemy.fighterKind || 'ninja').toUpperCase()} • الزعيم المنافس`}
              </span>
              {(bossEnemy.isDizzy) && <span className="text-yellow-300 animate-pulse">😵 دايخ!</span>}
            </span>
            <span className="text-amber-400 font-mono">
              {bossEnemy.health} / {bossEnemy.maxHealth} HP
            </span>
          </div>
          {/* Health Gauge */}
          <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700" dir="ltr">
            <div
              className={`h-full ${
                bossEnemy.type === 'bowser'
                  ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-400'
              } transition-all duration-200`}
              style={{ width: `${Math.max(0, (bossEnemy.health / bossEnemy.maxHealth) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
