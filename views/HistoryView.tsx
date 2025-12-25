import React, { useState, useMemo, useEffect } from 'react';
import { AppState, MoodCocktail, PeriodSummary, Language } from '../types';
import { generateHistorySummary } from '../services/geminiService';
import { getTranslation } from '../utils/translations';

interface HistoryViewProps {
  history: MoodCocktail[];
  setAppState: (state: AppState) => void;
  onSelect: (cocktail: MoodCocktail) => void;
  language: Language;
  toggleLanguage: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, setAppState, onSelect, language, toggleLanguage }) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'menu' | 'insights'>('menu');
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Clear summary when language changes to force regeneration in correct language
  useEffect(() => {
    setSummary(null);
  }, [language]);

  // Filter history for the last 7 days for the chart/insights
  const recentHistory = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return history.filter(h => h.createdAt > cutoff).sort((a, b) => a.createdAt - b.createdAt);
  }, [history]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const result = await generateHistorySummary(recentHistory, language);
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  // --- Chart Logic ---
  const chartPath = useMemo(() => {
    if (recentHistory.length < 2) return "";
    const width = 100;
    const height = 50;
    
    const minTime = recentHistory[0].createdAt;
    const maxTime = recentHistory[recentHistory.length - 1].createdAt;
    const timeRange = maxTime - minTime || 1;

    const points = recentHistory.map(item => {
      const x = ((item.createdAt - minTime) / timeRange) * width;
      const normMood = (item.moodValue + 1) / 2;
      const y = (1 - normMood) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [recentHistory]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-white">
      {/* Header */}
      <div className="pt-6 px-6 pb-2 flex items-center justify-between">
        <h2 className="font-serif text-2xl">{t.journeyTitle}</h2>
        
        <div className="flex items-center gap-3">
            <button 
             onClick={toggleLanguage}
             className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-serif text-slate-300 hover:text-white border border-white/5 transition-all"
             title={language === 'en' ? "Switch to Chinese" : "Switch to English"}
           >
             {/* Show Current Language */}
             {language === 'en' ? 'EN' : '中'}
           </button>

            <button onClick={() => setAppState(AppState.IDLE)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4 border-b border-slate-800">
        <div className="flex space-x-6 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`pb-2 border-b-2 transition-all ${activeTab === 'menu' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}
          >
            {t.menuTab}
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`pb-2 border-b-2 transition-all ${activeTab === 'insights' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}
          >
            {t.insightsTab}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'menu' ? (
          // --- MENU LIST TAB ---
          <div className="p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 opacity-60">
                 <span className="font-serif italic text-lg">{t.emptyShelf}</span>
                 <span className="text-xs mt-2">{t.emptyShelfSub}</span>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative overflow-hidden bg-slate-800/40 border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-slate-800/60 transition-all"
                >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1" 
                      style={{ background: `linear-gradient(to bottom, ${item.baseColor}, ${item.secondaryColor})` }}
                    />
                    <div className="flex justify-between items-start pl-3">
                        <div>
                            <h3 className="font-serif text-lg text-slate-200 group-hover:text-white transition-colors">{item.name}</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic opacity-80">{item.description}</p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-slate-400">{item.sensation}</span>
                                <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-slate-400">
                                  {t.moodLabel}: {item.moodValue.toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-mono block mb-1">
                                {new Date(item.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-600 font-mono block">
                                {new Date(item.createdAt).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute:'2-digit', hour12: false })}
                            </span>
                        </div>
                    </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // --- INSIGHTS TAB ---
          <div className="p-6 space-y-8">
            
            {/* 1. Visualization Chart */}
            <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4">{t.waveTitle}</h3>
              <div className="h-32 w-full relative flex items-center justify-center">
                {recentHistory.length < 2 ? (
                  <p className="text-xs text-slate-600 italic">{t.notEnoughData}</p>
                ) : (
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     {/* Grid lines */}
                     <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                     
                     {/* Gradient Area under curve */}
                     <path 
                      d={`${chartPath} L 100,50 L 0,50 Z`} 
                      fill="url(#grad1)" 
                      opacity="0.2" 
                    />
                     <defs>
                       <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" style={{stopColor:'rgb(147, 51, 234)', stopOpacity:1}} />
                         <stop offset="100%" style={{stopColor:'rgb(147, 51, 234)', stopOpacity:0}} />
                       </linearGradient>
                     </defs>

                     {/* The Line */}
                     <path d={chartPath} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                     
                     {/* Dots */}
                     {recentHistory.map((item, i) => {
                        const width = 100;
                        const height = 50;
                        const minTime = recentHistory[0].createdAt;
                        const maxTime = recentHistory[recentHistory.length - 1].createdAt;
                        const timeRange = maxTime - minTime || 1;
                        const x = ((item.createdAt - minTime) / timeRange) * width;
                        const normMood = (item.moodValue + 1) / 2;
                        const y = (1 - normMood) * height;
                        
                        return (
                          <circle key={i} cx={x} cy={y} r="1.5" fill="white" />
                        );
                     })}
                  </svg>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>{t.negative}</span>
                <span>{t.neutral}</span>
                <span>{t.positive}</span>
              </div>
            </div>

            {/* 2. AI Summary Section */}
            <div>
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs uppercase tracking-widest text-slate-400">{t.weeklyBreakdown}</h3>
                 <button 
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary || recentHistory.length === 0}
                  className="text-xs bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                 >
                   {isGeneratingSummary ? t.analyzing : t.generateReport}
                 </button>
               </div>

               {summary ? (
                 <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-2xl p-6 border border-white/10 animate-fadeIn">
                   <div className="flex items-center space-x-3 mb-4">
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                        </svg>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400">{t.dominantMood}</div>
                       <div className="font-serif text-lg text-white">{summary.dominantMood}</div>
                     </div>
                   </div>

                   <p className="text-sm text-slate-300 leading-relaxed font-light mb-6 border-l-2 border-purple-500/50 pl-4">
                     {summary.summaryText}
                   </p>

                   <div className="bg-slate-950/50 rounded-xl p-4">
                     <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{t.recommendedTitle}</div>
                     <div className="font-serif text-amber-200 text-lg">{summary.suggestedDrinkName}</div>
                     <div className="text-xs text-slate-400 italic mt-1">{summary.suggestedDrinkDescription}</div>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
                   <p className="text-slate-500 text-sm">
                     {recentHistory.length > 0 
                       ? t.reportPrompt 
                       : t.reportNoData}
                   </p>
                 </div>
               )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;