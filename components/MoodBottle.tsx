import React from 'react';

interface MoodBottleProps {
  moodValue: number; // -1 to 1
  baseColor: string;
  secondaryColor: string;
  intensity: number;
}

const MoodBottle: React.FC<MoodBottleProps> = ({ moodValue, baseColor, secondaryColor, intensity }) => {
  // Determine Type
  let type: 'round' | 'square' | 'slim' = 'slim';
  if (moodValue > 0.2) type = 'round';
  else if (moodValue < -0.2) type = 'square';

  // SVG Paths
  const paths = {
    // Round: A bubbly potion bottle
    round: "M 25 10 L 25 25 C 25 25 10 25 10 50 C 10 75 25 90 50 90 C 75 90 90 75 90 50 C 90 25 75 25 75 25 L 75 10 L 25 10 Z",
    // Square: A heavy whiskey decanter or flask
    square: "M 30 10 L 30 20 L 15 25 L 15 85 L 85 85 L 85 25 L 70 20 L 70 10 L 30 10 Z",
    // Slim: A test tube or tall glass
    slim: "M 35 10 L 35 80 C 35 90 65 90 65 80 L 65 10 L 35 10 Z"
  };

  // Visual Properties based on mood
  const isGlowing = type === 'round';
  const opacity = type === 'square' ? 0.9 : 0.6; // Square is dense/dark, Round/Slim is light
  
  // Fill ID for unique gradients
  const gradId = `grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative w-full h-full flex items-end justify-center transition-transform duration-300 ${isGlowing ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[80px]" preserveAspectRatio="xMidYBottom">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={baseColor} stopOpacity={opacity * 0.8} />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity={opacity} />
            <stop offset="100%" stopColor={baseColor} stopOpacity={opacity} />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
        </defs>

        {/* Bottle Shape */}
        <path 
          d={paths[type]} 
          fill={`url(#${gradId})`} 
          stroke="rgba(255,255,255,0.4)" 
          strokeWidth="1.5"
        />
        
        {/* Highlight / Reflection */}
        <path 
          d={type === 'round' 
            ? "M 30 35 Q 40 30 50 35" 
            : type === 'square' 
            ? "M 20 30 L 20 80" 
            : "M 40 20 L 40 70"
          }
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          fill="none"
        />

        {/* Liquid Level Line (Simple) */}
        <path
           d={type === 'round' ? "M 20 50 Q 50 55 80 50" : `M 20 ${50 + (1-intensity)*20} L 80 ${50 + (1-intensity)*20}`}
           stroke="rgba(255,255,255,0.2)"
           strokeWidth="1"
           fill="none"
        />
      </svg>
    </div>
  );
};

export default MoodBottle;