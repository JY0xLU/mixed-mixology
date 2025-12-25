import React, { useState, useEffect } from 'react';
import MixingView from './views/MixingView';
import ResultView from './views/ResultView';
import HistoryView from './views/HistoryView';
import { AppState, MoodCocktail, Language } from './types';
import { translateCocktail } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [previousAppState, setPreviousAppState] = useState<AppState>(AppState.IDLE);
  const [lastCocktail, setLastCocktail] = useState<MoodCocktail | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLangSwitching, setIsLangSwitching] = useState(false);
  const [isTranslatingContent, setIsTranslatingContent] = useState(false);
  
  // Initialize history from LocalStorage
  const [history, setHistory] = useState<MoodCocktail[]>(() => {
    try {
      const saved = localStorage.getItem('mood_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('mood_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (cocktail: MoodCocktail) => {
    setHistory((prev) => [cocktail, ...prev]);
  };

  const handleMixComplete = (cocktail: MoodCocktail) => {
    setLastCocktail(cocktail);
    addToHistory(cocktail);
    // When mix completes, we go to result. Back should go to IDLE (mixing).
    setPreviousAppState(AppState.IDLE);
    setAppState(AppState.RESULT);
  };

  const handleHistorySelect = (cocktail: MoodCocktail) => {
    setLastCocktail(cocktail);
    // When selecting from history, Back should return to HISTORY.
    setPreviousAppState(AppState.HISTORY);
    setAppState(AppState.RESULT);
  };

  const handleBackFromResult = () => {
    setAppState(previousAppState);
  };

  const toggleLanguage = () => {
    if (isLangSwitching) return;
    
    const nextLang = language === 'en' ? 'zh' : 'en';

    // 1. Start Visual Transition (Fade out)
    setIsLangSwitching(true);
    
    const transitionDuration = 300; // Faster transition for better UX

    // 2. Schedule State Change (synced with fade out)
    setTimeout(() => {
        setLanguage(nextLang);
        
        // If we have a cocktail and we are viewing it, we need to translate it
        // We do NOT await this. We let it run in background and show loading state in View.
        if (appState === AppState.RESULT && lastCocktail) {
            setIsTranslatingContent(true);
            translateCocktail(lastCocktail, nextLang)
                .then(translated => {
                    setLastCocktail(translated);
                    setHistory(prev => prev.map(c => c.id === translated.id ? translated : c));
                })
                .catch(e => {
                    console.error("Failed to translate cocktail during switch", e);
                })
                .finally(() => {
                    setIsTranslatingContent(false);
                });
        }

        // 3. Fade In (delayed slightly to allow render)
        setTimeout(() => {
            setIsLangSwitching(false); 
        }, 50);
    }, transitionDuration);
  }

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Mobile-first Container constrained width on desktop */}
      <div className="w-full h-full md:max-w-[480px] md:h-[90vh] md:max-h-[900px] md:rounded-[3rem] md:border-8 md:border-slate-900 md:shadow-2xl bg-[#0f172a] relative overflow-hidden flex flex-col">
        
        {/* Main Content with Transition Effect */}
        <main 
            className={`flex-grow w-full h-full relative transition-all duration-300 ease-out transform ${
                isLangSwitching 
                ? 'opacity-0 blur-md translate-y-4 scale-95' // State 1: Erased/Submerged
                : 'opacity-100 blur-0 translate-y-0 scale-100' // State 2: Floating/Emerging
            }`}
        >
          {appState === AppState.IDLE && (
            <MixingView 
              setAppState={setAppState} 
              onMixComplete={handleMixComplete}
              language={language}
              toggleLanguage={toggleLanguage}
              onShowHistory={() => setAppState(AppState.HISTORY)}
            />
          )}
          
          {appState === AppState.RESULT && (
            <ResultView 
              cocktail={lastCocktail} 
              setAppState={setAppState} 
              language={language}
              toggleLanguage={toggleLanguage}
              onBack={handleBackFromResult}
              isTranslating={isTranslatingContent}
            />
          )}

          {appState === AppState.HISTORY && (
            <HistoryView 
              history={history} 
              setAppState={setAppState} 
              onSelect={handleHistorySelect}
              language={language}
              toggleLanguage={toggleLanguage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;