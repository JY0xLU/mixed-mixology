import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, MoodCocktail, PeriodSummary, Language } from '../types';
import { generateHistorySummary } from '../services/geminiService';
import { getTranslation } from '../utils/translations';
import MoodBottle from '../components/MoodBottle';
import { playGlassClink } from '../utils/audioEffects';

interface HistoryViewProps {
  history: MoodCocktail[];
  setAppState: (state: AppState) => void;
  onSelect: (cocktail: MoodCocktail) => void;
  language: Language;
  toggleLanguage: () => void;
}

type ViewMode = 'list' | 'calendar' | 'shelf';

const HistoryView: React.FC<HistoryViewProps> = ({ history, setAppState, onSelect, language, toggleLanguage }) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'menu' | 'insights'>('menu');
  const [viewMode, setViewMode] = useState<ViewMode>('shelf'); // Default to shelf now
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Interaction State
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const pressTimer = useRef<any>(null);

  // Clear summary when language changes
  useEffect(() => {
    setSummary(null);
  }, [language]);

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

  // --- Calendar Helpers ---
  const calendarDays = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        // Find if we have drinks on this day
        const drinks = history.filter(h => {
            const d = new Date(h.createdAt);
            return d.getDate() === i && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
        days.push({ day: i, drinks });
    }
    return days;
  }, [history]);

  // --- Long Press Logic ---
  const handleTouchStart = (id: string) => {
      pressTimer.current = setTimeout(() => {
          setLongPressId(id);
          playGlassClink(); // Play sound!
          // Auto clear after 2 seconds
          setTimeout(() => setLongPressId(null), 2000);
      }, 500); // 500ms to trigger long press
  };

  const handleTouchEnd = () => {
      if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          pressTimer.current = null;
      }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-white select-none">
      {/* Header */}
      <div className="pt-6 px-6 pb-2 flex items-center justify-between">
        <h2 className="font-serif text-2xl">{t.journeyTitle}</h2>
        
        <div className="flex items-center gap-3">
            <button 
             onClick={toggleLanguage}
             className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-serif text-slate-300 hover:text-white border border-white/5 transition-all"
           >
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
      <div className="px-6 pb-2 border-b border-slate-800 flex justify-between items-end">
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

        {/* View Switcher for Menu */}
        {activeTab === 'menu' && (
            <div className="flex bg-slate-800 rounded-lg p-0.5 mb-2">
                <button 
                    onClick={() => setViewMode('shelf')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'shelf' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                    title={t.viewShelf}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                     </svg>
                </button>
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                    title={t.viewList}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <button 
                    onClick={() => setViewMode('calendar')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                    title={t.viewCalendar}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                </button>
            </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'menu' ? (
          <div className="p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 opacity-60">
                 <span className="font-serif italic text-lg">{t.emptyShelf}</span>
                 <span className="text-xs mt-2">{t.emptyShelfSub}</span>
              </div>
            ) : (
               <>
                 {viewMode === 'shelf' && (
                    <div className="flex flex-wrap gap-x-2 gap-y-8 justify-start items-end p-2 pb-10">
                        {/* Render items on "Shelves" */}
                        {history.map((item) => (
                            <div 
                                key={item.id} 
                                className="relative w-[30%] sm:w-[22%] aspect-[3/5] flex flex-col items-center justify-end group"
                                onTouchStart={() => handleTouchStart(item.id)}
                                onTouchEnd={handleTouchEnd}
                                onMouseDown={() => handleTouchStart(item.id)} // For desktop testing
                                onMouseUp={handleTouchEnd}
                                onMouseLeave={handleTouchEnd}
                                onContextMenu={(e) => e.preventDefault()} // Prevent right click
                                onClick={() => {
                                    if (!longPressId) onSelect(item);
                                }}
                            >
                                {/* Floating Label on Long Press */}
                                {longPressId === item.id && (
                                    <div className="absolute -top-12 z-20 bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs shadow-xl animate-bounce flex flex-col items-center whitespace-nowrap">
                                        <span className="font-bold text-[10px] text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="font-serif italic">{item.name}</span>
                                        <div className="absolute -bottom-1 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-purple-500/30"></div>
                                    </div>
                                )}

                                {/* The Bottle Component */}
                                <div className={`w-full h-full p-1 transition-transform duration-200 ${longPressId === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                                    <MoodBottle 
                                        moodValue={item.moodValue}
                                        baseColor={item.baseColor}
                                        secondaryColor={item.secondaryColor}
                                        intensity={item.intensity}
                                    />
                                </div>

                                {/* Shelf Base Line */}
                                <div className="absolute -bottom-2 w-full h-[2px] bg-white/10 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>
                            </div>
                        ))}
                    </div>
                 )}

                 {viewMode === 'list' && (
                    <div className="space-y-3">
                         {history.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => onSelect(item)}
                          className="group relative overflow-hidden bg-slate-800/40 border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-slate-800/60 transition-all"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, ${item.baseColor}, ${item.secondaryColor})` }}/>
                            <div className="flex justify-between items-start pl-3">
                                <div>
                                    <h3 className="font-serif text-lg text-slate-200 group-hover:text-white transition-colors">{item.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic opacity-80">{item.description}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-slate-400">{item.sensation}</span>
                                        {item.realRecipe && <span className="text-[10px] uppercase tracking-wider border border-purple-500/30 text-purple-300 px-2 py-1 rounded">Real</span>}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[10px] text-slate-500 font-mono block mb-1">
                                        {new Date(item.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                      ))}
                    </div>
                 )}

                 {viewMode === 'calendar' && (
                     <div className="grid grid-cols-7 gap-2 p-2">
                         {['S','M','T','W','T','F','S'].map((d,i) => (
                             <div key={i} className="text-center text-xs text-slate-600 font-bold mb-2">{d}</div>
                         ))}
                         {calendarDays.map((d, i) => (
                             <div key={i} className="aspect-square rounded-lg bg-slate-800/30 border border-white/5 flex flex-col items-center justify-start pt-1 relative overflow-hidden">
                                 <span className="text-[10px] text-slate-500 z-10">{d.day}</span>
                                 {d.drinks.length > 0 && (
                                     <div className="flex flex-wrap gap-0.5 justify-center mt-1 w-full px-1">
                                         {d.drinks.map((drink) => (
                                             <div 
                                                key={drink.id} 
                                                onClick={() => onSelect(drink)}
                                                className="w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform" 
                                                style={{ backgroundColor: drink.baseColor }}
                                                title={drink.name}
                                             />
                                         ))}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 )}
               </>
            )}
          </div>
        ) : (
          // --- INSIGHTS TAB ---
          <div className="p-6 space-y-8">
            <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4">{t.waveTitle}</h3>
              <div className="h-32 w-full relative flex items-center justify-center">
                {recentHistory.length < 2 ? (
                  <p className="text-xs text-slate-600 italic">{t.notEnoughData}</p>
                ) : (
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                     <path d={`${chartPath} L 100,50 L 0,50 Z`} fill="url(#grad1)" opacity="0.2" />
                     <defs>
                       <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" style={{stopColor:'rgb(147, 51, 234)', stopOpacity:1}} />
                         <stop offset="100%" style={{stopColor:'rgb(147, 51, 234)', stopOpacity:0}} />
                       </linearGradient>
                     </defs>
                     <path d={chartPath} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>{t.negative}</span>
                <span>{t.neutral}</span>
                <span>{t.positive}</span>
              </div>
            </div>

            {/* AI Summary Section */}
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
                     {recentHistory.length > 0 ? t.reportPrompt : t.reportNoData}
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