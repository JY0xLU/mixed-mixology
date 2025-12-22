import React from 'react';
import { AppState, MoodCocktail } from '../types';

interface HistoryViewProps {
  history: MoodCocktail[];
  setAppState: (state: AppState) => void;
  onSelect: (cocktail: MoodCocktail) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, setAppState, onSelect }) => {
  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-white">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <h2 className="font-serif text-2xl">Menu of Memories</h2>
        <button onClick={() => setAppState(AppState.IDLE)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
             <span className="font-serif italic text-lg">The shelf is empty.</span>
             <span className="text-xs mt-2">Start a session to fill your menu.</span>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative overflow-hidden bg-slate-800/40 border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-slate-800/60 transition-all"
            >
                {/* Color Strip */}
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
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block mb-1">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div 
                            className="w-3 h-3 rounded-full inline-block" 
                            style={{ backgroundColor: item.baseColor, boxShadow: `0 0 8px ${item.baseColor}` }} 
                        />
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;