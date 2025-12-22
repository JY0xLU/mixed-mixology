import React from 'react';
import { AppState, MoodCocktail } from '../types';

interface ResultViewProps {
  cocktail: MoodCocktail | null;
  setAppState: (state: AppState) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ cocktail, setAppState }) => {
  if (!cocktail) return <div className="text-white">No Drink Found</div>;

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-slate-900 pb-10">
      
      {/* Header / Navigation */}
      <div className="w-full p-4 flex justify-between items-center z-20">
        <button onClick={() => setAppState(AppState.IDLE)} className="text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Your Signature Blend</span>
        <div className="w-6" /> 
      </div>

      {/* 🟣 Title */}
      <div className="text-center px-6 mt-4 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-2 leading-tight">
          {cocktail.name}
        </h1>
        <p className="font-sans text-sm text-slate-400 font-light italic opacity-80">
          {cocktail.description}
        </p>
      </div>

      {/* 🟢 Visual Abstract Bottle */}
      <div className="relative w-full flex justify-center items-center h-64 mb-8">
        {/* Abstract Glow Background */}
        <div 
          className="absolute w-48 h-48 rounded-full blur-[60px] opacity-40 animate-pulse"
          style={{ backgroundColor: cocktail.baseColor }}
        />
        <div 
          className="absolute w-32 h-32 rounded-full blur-[40px] opacity-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: cocktail.secondaryColor }}
        />

        {/* The "Bottle/Glass" representation */}
        <div className="relative z-10 w-24 h-48 border border-white/20 rounded-t-full rounded-b-2xl bg-white/5 backdrop-blur-sm overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div 
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
              style={{ 
                height: `${40 + (cocktail.intensity * 40)}%`,
                background: `linear-gradient(to top, ${cocktail.baseColor}, ${cocktail.secondaryColor})`,
                opacity: 0.8
              }}
            />
            {/* Gloss */}
            <div className="absolute top-4 left-2 w-2 h-32 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* 🟠 Recipe Card */}
      <div className="px-6 w-full max-w-md mx-auto">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
          <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
            <h3 className="font-serif text-xl text-white">Mood Composition</h3>
            <span className="text-xs font-mono text-slate-400">
              Intensity: {Math.round(cocktail.intensity * 100)}%
            </span>
          </div>

          <div className="space-y-4">
            {cocktail.ingredients.map((ing, idx) => (
              <div key={idx} className="flex flex-col animate-fadeIn" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{ing.part}</span>
                  <span className="text-sm font-serif text-white">{ing.name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                  {ing.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
             <span className="text-xs text-slate-500 uppercase tracking-widest">Sensation</span>
             <span className="text-sm font-semibold text-slate-200">{cocktail.sensation}</span>
          </div>
        </div>
      </div>

      {/* 🟡 Footer CTA */}
      <div className="w-full px-6 mt-8 mb-8 flex flex-col space-y-3 max-w-md mx-auto">
        <button 
          onClick={() => setAppState(AppState.HISTORY)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
        >
          Save to Collection
        </button>
        <button 
          onClick={() => setAppState(AppState.IDLE)}
          className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all"
        >
          Mix Another
        </button>
      </div>

    </div>
  );
};

export default ResultView;