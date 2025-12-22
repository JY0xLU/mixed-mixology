import React, { useState } from 'react';
import MixingView from './views/MixingView';
import ResultView from './views/ResultView';
import HistoryView from './views/HistoryView';
import { AppState, MoodCocktail } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [lastCocktail, setLastCocktail] = useState<MoodCocktail | null>(null);
  const [history, setHistory] = useState<MoodCocktail[]>([]);

  const addToHistory = (cocktail: MoodCocktail) => {
    setHistory((prev) => [cocktail, ...prev]);
  };

  const handleHistorySelect = (cocktail: MoodCocktail) => {
    setLastCocktail(cocktail);
    setAppState(AppState.RESULT);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Mobile-first Container constrained width on desktop */}
      <div className="w-full h-full md:max-w-[480px] md:h-[90vh] md:max-h-[900px] md:rounded-[3rem] md:border-8 md:border-slate-900 md:shadow-2xl bg-[#0f172a] relative overflow-hidden flex flex-col">
        
        {/* Simple Top Navigation for demo purposes if not on result view */}
        {appState !== AppState.RESULT && (
           <div className="absolute top-0 right-0 p-6 z-50">
             {appState !== AppState.HISTORY && (
               <button 
                 onClick={() => setAppState(AppState.HISTORY)}
                 className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-300 hover:text-white backdrop-blur-sm border border-white/5 transition-all"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                 </svg>
               </button>
             )}
           </div>
        )}

        <main className="flex-grow w-full h-full relative">
          {appState === AppState.IDLE && (
            <MixingView 
              setAppState={setAppState} 
              setLastCocktail={setLastCocktail}
              addToHistory={addToHistory}
            />
          )}
          
          {appState === AppState.RESULT && (
            <ResultView 
              cocktail={lastCocktail} 
              setAppState={setAppState} 
            />
          )}

          {appState === AppState.HISTORY && (
            <HistoryView 
              history={history} 
              setAppState={setAppState} 
              onSelect={handleHistorySelect}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;