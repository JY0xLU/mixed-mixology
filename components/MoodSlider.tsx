import React from 'react';

interface MoodSliderProps {
  value: number; // -1 to 1
  label: string;
}

const MoodSlider: React.FC<MoodSliderProps> = ({ value, label }) => {
  // Map -1...1 to 0...100%
  const percentage = ((value + 1) / 2) * 100;

  return (
    <div className="w-full">
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-700 to-yellow-700 opacity-50" />
        
        {/* Indicator */}
        <div 
            className="absolute top-0 bottom-0 w-4 h-4 -mt-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
            style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      {label && (
        <div className="text-center mt-3">
            <span className="text-xs text-slate-300 animate-pulse">{label}</span>
        </div>
      )}
    </div>
  );
};

export default MoodSlider;