import { useState } from 'react';
import { FighterId, GameState } from './types';
import { GameCanvas } from './game/GameCanvas';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { SlidesGuideModal } from './components/SlidesGuideModal';
import { StagesModal } from './components/StagesModal';
import { getSavedFighter, saveFighter, isFighterUnlocked } from './game/characters';

export default function App() {
  const [selectedFighter, setSelectedFighter] = useState<FighterId>(() => {
    const saved = getSavedFighter();
    return saved && isFighterUnlocked(saved) ? saved : 'subzero';
  });
  const [isCharacterSelectOpen, setIsCharacterSelectOpen] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isStagesOpen, setIsStagesOpen] = useState<boolean>(false);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [stageRequest, setStageRequest] = useState<{ idx: number; nonce: number } | null>(null);
  const [gameState, setGameState] = useState<GameState>('character_select');

  const pickFighter = (id: FighterId) => {
    setSelectedFighter(id);
    saveFighter(id);
  };

  const handleStartGame = () => {
    setIsCharacterSelectOpen(false);
    setGameState('playing');
  };

  const handleOpenCharacterSelect = () => {
    setIsCharacterSelectOpen(true);
    setGameState('character_select');
  };

  // A fresh unlock auto-switches you instantly (stage_clear does the same in-engine)
  const handleFighterUnlocked = (id: FighterId) => {
    setSelectedFighter(id);
    saveFighter(id);
  };

  const handlePickStage = (idx: number) => {
    setIsCharacterSelectOpen(false);
    setIsStagesOpen(false);
    setStageRequest({ idx, nonce: Date.now() });
    setGameState('playing');
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-black overflow-hidden flex flex-col select-none touch-none font-sans">
      {/* Game Canvas & Playfield */}
      <section className="relative flex-1 w-full h-full overflow-hidden">
        <GameCanvas
          character={selectedFighter}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenSelectFighter={handleOpenCharacterSelect}
          onOpenStages={() => setIsStagesOpen(true)}
          gameState={gameState}
          setGameState={setGameState}
          onFighterUnlocked={handleFighterUnlocked}
          stageRequest={stageRequest}
          onStageChange={setCurrentStageIdx}
        />
      </section>

      {/* Character Selection Modal */}
      <CharacterSelectModal
        isOpen={isCharacterSelectOpen}
        selectedFighter={selectedFighter}
        onSelectFighter={pickFighter}
        onStartGame={handleStartGame}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenStages={() => setIsStagesOpen(true)}
      />

      {/* Stages map modal (progress + jump to any cleared stage) */}
      <StagesModal
        isOpen={isStagesOpen}
        onClose={() => setIsStagesOpen(false)}
        currentIdx={currentStageIdx}
        onPick={handlePickStage}
      />

      {/* Interactive Explanation Slides & Diagrams Modal (with Per-Slide Questions) */}
      <SlidesGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </main>
  );
}
