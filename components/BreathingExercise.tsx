import React, { useState, useEffect } from 'react';

interface BreathingExerciseProps {
  onClose: () => void;
  title: string;
  labels: { inhale: string; hold: string; exhale: string };
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose, title, labels }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    // 4-7-8 Breathing Pattern: Inhale 4s, Hold 7s, Exhale 8s
    // Simplified for UX: Inhale 4s, Hold 4s, Exhale 4s (Box Breathing) is often easier to follow visually
    
    const tick = () => {
      setTimer(prev => {
        if (prev > 1) return prev - 1;
        
        // Phase switch
        if (phase === 'inhale') {
          setPhase('hold');
          return 4;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 4;
        } else {
          setPhase('inhale');
          return 4;
        }
      });
    };

    // Fix: Remove explicit NodeJS.Timeout type which causes error in browser environment
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const getPhaseLabel = () => {
    if (phase === 'inhale') return labels.inhale;
    if (phase === 'hold') return labels.hold;
    return labels.exhale;
  };

  const getScale = () => {
    if (phase === 'inhale') return 'scale-150';
    if (phase === 'hold') return 'scale-150'; // Stay expanded
    return 'scale-100';
  };

  const getGlow = () => {
     if (phase === 'inhale') return 'shadow-[0_0_60px_rgba(167,243,208,0.4)]';
     if (phase === 'hold') return 'shadow-[0_0_80px_rgba(167,243,208,0.6)]';
     return 'shadow-[0_0_30px_rgba(167,243,208,0.2)]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-slate-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col items-center">
         <h3 className="text-xl text-slate-300 font-serif mb-12 tracking-wide opacity-80">{title}</h3>
         
         <div className="relative flex items-center justify-center w-64 h-64">
            {/* Outer Rings */}
            <div className={`absolute w-32 h-32 rounded-full border border-teal-500/20 transition-all duration-[4000ms] ease-in-out ${getScale()}`} />
            <div className={`absolute w-48 h-48 rounded-full border border-teal-500/10 transition-all duration-[4000ms] ease-in-out delay-100 ${getScale()}`} />
            
            {/* Main Circle */}
            <div 
              className={`w-24 h-24 rounded-full bg-teal-500/80 transition-all duration-[4000ms] ease-in-out flex items-center justify-center text-slate-900 font-bold text-lg ${getScale()} ${getGlow()}`}
            >
               {timer}
            </div>
         </div>

         <div className="mt-12 text-2xl font-light text-teal-100 tracking-[0.2em] uppercase animate-pulse">
            {getPhaseLabel()}
         </div>
      </div>
    </div>
  );
};

export default BreathingExercise;