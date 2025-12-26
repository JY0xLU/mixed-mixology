import React, { useState } from 'react';
import { AppState, MoodCocktail, Language } from '../types';
import { getTranslation } from '../utils/translations';
import SonicPlayer from '../components/SonicPlayer';
import BreathingExercise from '../components/BreathingExercise';
import ShareCard from '../components/ShareCard';

interface ResultViewProps {
  cocktail: MoodCocktail | null;
  setAppState: (state: AppState) => void;
  language: Language;
  toggleLanguage: () => void;
  onBack: () => void;
  isTranslating: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ cocktail, setAppState, language, toggleLanguage, onBack, isTranslating }) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'abstract' | 'real'>('abstract');
  const [showBreathing, setShowBreathing] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Translation map for ingredient parts
  const partMap: Record<string, { en: string; zh: string }> = {
    "Base": { en: "BASE", zh: "基酒" },
    "Middle": { en: "MIDDLE", zh: "中调" },
    "Top": { en: "TOP", zh: "前调" },
    "Finish": { en: "FINISH", zh: "尾韵" }
  };

  const normalizePart = (p: string): string => {
    if (!p) return 'Base';
    const raw = p.trim();
    if (raw === '基酒') return 'Base';
    if (raw === '中调') return 'Middle';
    if (raw === '前调') return 'Top';
    if (raw === '尾韵') return 'Finish';
    const lower = raw.toLowerCase();
    if (lower === 'base') return 'Base';
    if (lower === 'middle') return 'Middle';
    if (lower === 'top') return 'Top';
    if (lower === 'finish') return 'Finish';
    return 'Base';
  };

  const getPartLabel = (part: string) => {
    const standardKey = normalizePart(part);
    const entry = partMap[standardKey];
    return entry ? entry[language] : part.toUpperCase();
  };
  
  if (!cocktail) return <div className="text-white">{t.noDrink}</div>;

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-slate-900 pb-10 relative">
      
      {/* --- Overlays --- */}
      {showBreathing && (
        <BreathingExercise 
            onClose={() => setShowBreathing(false)} 
            title={cocktail.copingTip || t.copingBtn}
            labels={{ inhale: t.inhale, hold: t.hold, exhale: t.exhale }}
        />
      )}
      
      {showShare && (
        <ShareCard 
            cocktail={cocktail}
            onClose={() => setShowShare(false)}
            title={t.shareTitle}
        />
      )}

      {/* Header / Navigation */}
      <div className="w-full p-4 flex justify-between items-center z-20 sticky top-0 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-2 -ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>
        
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 absolute left-1/2 transform -translate-x-1/2">{t.signatureBlend}</span>
        
        <div className="flex gap-2">
            {/* Share Button (Top Right) */}
            <button 
             onClick={() => setShowShare(true)}
             className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white border border-white/5 transition-all"
             title={t.shareBtn}
            >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
             </svg>
           </button>

            <button 
             onClick={toggleLanguage}
             className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-serif text-slate-300 hover:text-white border border-white/5 transition-all"
           >
             {language === 'en' ? 'EN' : '中'}
           </button>
        </div> 
      </div>

      {/* 🟣 Title Area */}
      <div className="text-center px-6 mt-4 mb-8 min-h-[100px] flex flex-col items-center justify-center">
        {isTranslating ? (
           <div className="flex flex-col items-center gap-3 w-full animate-pulse">
             <div className="h-8 w-3/4 bg-white/10 rounded-lg" />
             <div className="h-4 w-5/6 bg-white/5 rounded-lg" />
           </div>
        ) : (
           <>
            <h1 className="font-serif text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-2 leading-tight animate-fadeIn">
              {cocktail.name}
            </h1>
            <p className="font-sans text-sm text-slate-400 font-light italic opacity-80 animate-fadeIn">
              {cocktail.description}
            </p>
           </>
        )}
      </div>

      {/* 🟢 Visual Abstract Bottle */}
      <div className="relative w-full flex justify-center items-center h-64 mb-6">
        <div 
          className="absolute w-48 h-48 rounded-full blur-[60px] opacity-40 animate-pulse"
          style={{ backgroundColor: cocktail.baseColor }}
        />
        <div 
          className="absolute w-32 h-32 rounded-full blur-[40px] opacity-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: cocktail.secondaryColor }}
        />

        <div className="relative z-10 w-24 h-48 border border-white/20 rounded-t-full rounded-b-2xl bg-white/5 backdrop-blur-sm overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div 
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
              style={{ 
                height: `${40 + (cocktail.intensity * 40)}%`,
                background: `linear-gradient(to top, ${cocktail.baseColor}, ${cocktail.secondaryColor})`,
                opacity: 0.8
              }}
            />
            <div className="absolute top-4 left-2 w-2 h-32 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* ⚠️ Emergency / Coping Button (Conditional) */}
      {(cocktail.copingTip || cocktail.moodValue < -0.5) && (
        <div className="flex justify-center mb-6 animate-slideUp">
             <button 
               onClick={() => setShowBreathing(true)}
               className="flex items-center gap-2 px-5 py-2 bg-teal-900/30 border border-teal-500/30 rounded-full text-teal-200 text-xs font-semibold tracking-wide hover:bg-teal-900/50 transition-all shadow-[0_0_15px_rgba(20,184,166,0.1)]"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                 {cocktail.copingTip || t.copingBtn}
             </button>
        </div>
      )}

      {/* 🎛️ Toggle Switch */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-800/50 p-1 rounded-full flex relative">
          <button 
            onClick={() => setActiveTab('abstract')}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all z-10 ${activeTab === 'abstract' ? 'text-white' : 'text-slate-500'}`}
          >
            {t.tabAbstract}
          </button>
          <button 
             onClick={() => setActiveTab('real')}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all z-10 ${activeTab === 'real' ? 'text-white' : 'text-slate-500'}`}
          >
            {t.tabReal}
          </button>
          {/* Slider Background */}
          <div 
            className={`absolute top-1 bottom-1 w-[50%] bg-white/10 rounded-full transition-all duration-300 ${activeTab === 'abstract' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1'}`} 
          />
        </div>
      </div>

      {/* 🟠 Content Card */}
      <div className="px-6 w-full max-w-md mx-auto space-y-4">
        
        {/* Sonic Player */}
        {cocktail.sonicVibe && (
           <SonicPlayer 
             vibe={cocktail.sonicVibe} 
             moodValue={cocktail.moodValue}
             labelPlay={t.playAmbience} 
             labelStop={t.stopAmbience} 
            />
        )}

        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl min-h-[300px]">
          
          {activeTab === 'abstract' ? (
            // --- Abstract View ---
            <>
              <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
                <h3 className="font-serif text-xl text-white">{t.moodComposition}</h3>
                <span className="text-xs font-mono text-slate-400">
                  {t.intensity}: {Math.round(cocktail.intensity * 100)}%
                </span>
              </div>

              <div className="space-y-4">
                {cocktail.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex flex-col animate-slideUp" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{getPartLabel(ing.part)}</span>
                      {isTranslating ? <div className="h-4 w-24 bg-white/10 rounded animate-pulse" /> : <span className="text-sm font-serif text-white">{ing.name}</span>}
                    </div>
                    {isTranslating ? <div className="h-3 w-full bg-white/5 rounded animate-pulse mt-2" /> : <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">{ing.reason}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-500 uppercase tracking-widest">{t.sensation}</span>
                <span className="text-sm font-semibold text-slate-200">{cocktail.sensation}</span>
              </div>
            </>
          ) : (
            // --- Real Recipe View ---
            <>
              {cocktail.realRecipe ? (
                <>
                  <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-serif text-xl text-white">{cocktail.realRecipe.drinkName}</h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase border border-slate-600 px-2 py-0.5 rounded-full">
                      {cocktail.realRecipe.type}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">{t.ingredients}</h4>
                    <ul className="space-y-1">
                      {cocktail.realRecipe.ingredients.map((item, i) => (
                        <li key={i} className="text-sm text-slate-200 flex items-center gap-2">
                          <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">{t.instructions}</h4>
                    <ol className="space-y-3">
                      {cocktail.realRecipe.steps.map((step, i) => (
                        <li key={i} className="text-sm text-slate-400 font-light flex gap-3">
                          <span className="font-mono text-slate-600 font-bold">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              ) : (
                 <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <p>Generating Real Recipe...</p>
                 </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* 🟡 Footer CTA */}
      <div className="w-full px-6 mt-6 mb-8 flex flex-col space-y-3 max-w-md mx-auto">
        <button 
          onClick={() => setAppState(AppState.HISTORY)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
        >
          {t.saveCollection}
        </button>
        <button 
          onClick={() => setAppState(AppState.IDLE)}
          className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all"
        >
          {t.mixAnother}
        </button>
      </div>

    </div>
  );
};

export default ResultView;