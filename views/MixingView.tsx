import React, { useState, useEffect } from 'react';
import FluidGlass from '../components/FluidGlass';
import MoodSlider from '../components/MoodSlider';
import WaveVisualizer from '../components/WaveVisualizer';
import { generateCocktail } from '../services/geminiService';
import { AppState, MoodCocktail } from '../types';

interface MixingViewProps {
  setAppState: (state: AppState) => void;
  setLastCocktail: (cocktail: MoodCocktail) => void;
  addToHistory: (cocktail: MoodCocktail) => void;
}

const MixingView: React.FC<MixingViewProps> = ({ setAppState, setLastCocktail, addToHistory }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedMood, setSimulatedMood] = useState(0);
  const [simulatedIntensity, setSimulatedIntensity] = useState(0.2);
  const [statusText, setStatusText] = useState('Ready to listen...');

  // Simulate "Real-time" analysis based on text length and content keywords
  // In a full production app, this would use a debounce + lightweight model API
  useEffect(() => {
    if (inputText.length === 0) {
      setSimulatedMood(0);
      setSimulatedIntensity(0.1);
      setStatusText('Silence is an ingredient too...');
      return;
    }

    setStatusText('Capturing your essence...');
    
    // Very basic heuristic for visual feedback before the real AI kicks in
    const negativeWords = ['sad', 'tired', 'angry', 'lost', 'dark', 'heavy', 'stress', 'pain'];
    const positiveWords = ['happy', 'bright', 'joy', 'excited', 'light', 'love', 'good'];
    
    let score = 0;
    const words = inputText.toLowerCase().split(/\s+/);
    words.forEach(w => {
      if (negativeWords.some(nw => w.includes(nw))) score -= 0.2;
      if (positiveWords.some(pw => w.includes(pw))) score += 0.2;
    });
    
    // Clamp
    const newMood = Math.max(-1, Math.min(1, score));
    setSimulatedMood(newMood);
    
    // Intensity based on length and exclamation
    let newIntensity = Math.min(1, inputText.length / 100);
    if (inputText.includes('!')) newIntensity += 0.2;
    setSimulatedIntensity(Math.min(1, Math.max(0.1, newIntensity)));

  }, [inputText]);

  const handleStartMixing = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setStatusText('Distilling your emotions...');
    
    try {
      const cocktail = await generateCocktail(inputText);
      setLastCocktail(cocktail);
      addToHistory(cocktail);
      
      // Artificial delay for the "Mixing" experience
      setTimeout(() => {
        setIsProcessing(false);
        setAppState(AppState.RESULT);
      }, 2000);
    } catch (e) {
      setIsProcessing(false);
      setStatusText('Connection interrupted. Try again.');
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      
      {/* (A) Glass Visualizer */}
      <div className="flex-grow relative z-10 flex flex-col items-center justify-center p-4 min-h-[40%]">
        <FluidGlass 
          moodValue={simulatedMood} 
          intensity={simulatedIntensity} 
          isAnalyzing={isProcessing || inputText.length > 0} 
        />
      </div>

      {/* Control Area */}
      <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-t-3xl border-t border-white/10 p-6 flex flex-col items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* (B) Mood Slider */}
        <MoodSlider value={simulatedMood} label={statusText} />

        {/* (C) Wave / Input */}
        <div className="w-full max-w-lg mt-4 mb-6">
           {isProcessing ? (
             <WaveVisualizer isActive={true} />
           ) : (
             <textarea
              className="w-full bg-slate-800/50 text-white p-4 rounded-xl border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all placeholder:text-slate-500 text-sm font-sans leading-relaxed"
              rows={3}
              placeholder="How are you feeling right now? Tell me about your day, your stress, or your joy..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
             />
           )}
        </div>

        {/* (D) CTA */}
        <button
          onClick={handleStartMixing}
          disabled={isProcessing || inputText.length < 3}
          className={`
            w-full max-w-sm py-4 rounded-full font-serif text-lg tracking-wide font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95
            ${isProcessing || inputText.length < 3 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/30'}
          `}
        >
          {isProcessing ? 'Mixing...' : 'Brew My Emotion'}
        </button>
      </div>
    </div>
  );
};

export default MixingView;