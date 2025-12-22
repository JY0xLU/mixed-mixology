import React from 'react';

const WaveVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return <div className="h-16 w-full" />;

  return (
    <div className="h-16 w-full flex items-center justify-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-t from-purple-400 to-pink-300 w-1 rounded-full animate-pulse"
          style={{
            height: '40%',
            animationDuration: `${0.8 + i * 0.2}s`,
            animationDelay: `${i * 0.1}s`,
            animationIterationCount: 'infinite',
            transformOrigin: 'center',
            animationName: 'wave'
          }}
        >
          <style>{`
            @keyframes wave {
              0%, 100% { height: 20%; opacity: 0.5; }
              50% { height: 100%; opacity: 1; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};

export default WaveVisualizer;