import React, { useState, useEffect, useRef } from 'react';
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

  // --- Cache System ---
  // Stores cocktail data keys by "ID-LANGUAGE" (e.g., "123456-en": { ...data })
  const cocktailCache = useRef<Record<string, MoodCocktail>>({});

  const getCacheKey = (id: string, lang: Language) => `${id}-${lang}`;
  
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
    
    // Seed the cache with this initial generation
    const key = getCacheKey(cocktail.id, language);
    cocktailCache.current[key] = cocktail;

    // When mix completes, we go to result. Back should go to IDLE (mixing).
    setPreviousAppState(AppState.IDLE);
    setAppState(AppState.RESULT);
  };

  const handleHistorySelect = (cocktail: MoodCocktail) => {
    // When selecting from history, check if we have a version in the CURRENT language
    const key = getCacheKey(cocktail.id, language);
    
    if (cocktailCache.current[key]) {
        // Cache hit! Use the correct language version
        setLastCocktail(cocktailCache.current[key]);
    } else {
        // Cache miss (or first load). 
        // If the cocktail's stored language matches current app language, use it.
        // Otherwise, we might need to translate it, but for now we load what we have.
        setLastCocktail(cocktail);
        
        // If languages mismatch, we could trigger auto-translate here, 
        // but let's let the user decide to toggle if they want.
        // Seeding the cache with what we have:
        const inferredLang = cocktail.language || 'en'; // Default to en for legacy data
        cocktailCache.current[getCacheKey(cocktail.id, inferredLang)] = cocktail;
    }

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
    const transitionDuration = 300; 

    // 2. Schedule State Change
    setTimeout(() => {
        setLanguage(nextLang);
        
        // Handling Translation with Cache
        if (appState === AppState.RESULT && lastCocktail) {
            const cacheKey = getCacheKey(lastCocktail.id, nextLang);

            if (cocktailCache.current[cacheKey]) {
                // INSTANT SWAP: Data exists in cache
                setLastCocktail(cocktailCache.current[cacheKey]);
                setIsTranslatingContent(false);
            } else {
                // FETCH: Data not in cache
                setIsTranslatingContent(true);
                translateCocktail(lastCocktail, nextLang)
                    .then(translated => {
                        setLastCocktail(translated);
                        // Save to cache
                        cocktailCache.current[cacheKey] = translated;
                        
                        // Optional: Update history item to reflect we now have this version? 
                        // Actually better not to mutate history excessively, cache is ephemeral enough for session.
                    })
                    .catch(e => {
                        console.error("Failed to translate cocktail during switch", e);
                    })
                    .finally(() => {
                        setIsTranslatingContent(false);
                    });
            }
        }

        // 3. Fade In
        setTimeout(() => {
            setIsLangSwitching(false); 
        }, 50);
    }, transitionDuration);
  }

  return (
    <div className="w-screen h-[100dvh] bg-slate-950 flex items-center justify-center font-sans antialiased selection:bg-purple-500 selection:text-white overflow-hidden">
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