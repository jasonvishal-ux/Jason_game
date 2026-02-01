
import React, { useState } from 'react';
import Configurator from './components/Configurator';
import Game from './components/Game';
import { UserConfig, AISpecs } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'config' | 'game'>('config');
  const [currentConfig, setCurrentConfig] = useState<UserConfig | null>(null);
  const [currentSpecs, setCurrentSpecs] = useState<AISpecs | null>(null);

  const handleConfigComplete = (config: UserConfig, specs: AISpecs) => {
    setCurrentConfig(config);
    setCurrentSpecs(specs);
    setView('game');
  };

  const handleExitGame = () => {
    setView('config');
  };

  return (
    <main className="w-screen h-screen bg-black overflow-hidden flex flex-col">
      {view === 'config' && (
        <Configurator onComplete={handleConfigComplete} />
      )}
      
      {view === 'game' && currentConfig && currentSpecs && (
        <Game 
          config={currentConfig} 
          specs={currentSpecs} 
          onExit={handleExitGame} 
        />
      )}
    </main>
  );
};

export default App;
