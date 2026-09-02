import { useState } from 'react';
import { FighterId, GameState } from './types';
import { GameCanvas } from './game/GameCanvas';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { SlidesGuideModal } from './components/SlidesGuideModal';

export default function App() {
  const [selectedFighter, setSelectedFighter] = useState<FighterId>('noob');
  const [isCharacterSelectOpen, setIsCharacterSelectOpen] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>('character_select');

  const handleStartGame = () => {
    setIsCharacterSelectOpen(false);
    setGameState('playing');
  };

  const handleOpenCharacterSelect = () => {
    setIsCharacterSelectOpen(true);
    setGameState('character_select');
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-black overflow-hidden flex flex-col select-none touch-none font-sans">
      {/* Game Canvas & Playfield */}
      <section className="relative flex-1 w-full h-full overflow-hidden">
        <GameCanvas
          character={selectedFighter}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenSelectFighter={handleOpenCharacterSelect}
          gameState={gameState}
          setGameState={setGameState}
        />
      </section>

      {/* Character Selection Modal */}
      <CharacterSelectModal
        isOpen={isCharacterSelectOpen}
        selectedFighter={selectedFighter}
        onSelectFighter={setSelectedFighter}
        onStartGame={handleStartGame}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Interactive Explanation Slides & Diagrams Modal (with Per-Slide Questions) */}
      <SlidesGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </main>
  );
}
