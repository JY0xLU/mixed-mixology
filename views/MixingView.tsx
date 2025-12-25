import React, { useState, useEffect } from 'react';
import FluidGlass from '../components/FluidGlass';
import MoodSlider from '../components/MoodSlider';
import WaveVisualizer from '../components/WaveVisualizer';
import { generateCocktail } from '../services/geminiService';
import { AppState, MoodCocktail, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MixingViewProps {
  setAppState: (state: AppState) => void;
  onMixComplete: (cocktail: MoodCocktail) => void;
  language: Language;
  toggleLanguage: () => void;
  onShowHistory: () => void;
}

const MixingView: React.FC<MixingViewProps> = ({ 
  setAppState, 
  onMixComplete,
  language,
  toggleLanguage,
  onShowHistory
}) => {
  const t = getTranslation(language);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedMood, setSimulatedMood] = useState(0);
  const [simulatedIntensity, setSimulatedIntensity] = useState(0.2);
  const [statusText, setStatusText] = useState(t.readyStatus);

  // Update status text when language changes if idle
  useEffect(() => {
    if (!isProcessing && inputText.length === 0) {
      setStatusText(t.readyStatus);
    } else if (inputText.length > 0 && !isProcessing) {
      setStatusText(t.capturingStatus);
    }
  }, [language, t]);

  // Simulate "Real-time" analysis based on text length, content keywords, and negation
  useEffect(() => {
    if (inputText.length === 0) {
      setSimulatedMood(0);
      setSimulatedIntensity(0.1);
      setStatusText(t.silenceStatus);
      return;
    }

    setStatusText(t.capturingStatus);
    
    // Expanded keyword lists
    const enNegators = ['not', 'no', 'never', 'dont', "don't", 'cant', "can't", 'wont', "won't", 'didnt', "didn't", 'isnt', "isn't", 'aint', "ain't", 'hardly', 'scarcely'];
    const zhNegators = ['不', '没', '无', '非', '别', '勿'];
    
    const negativeBase = [
        'sad', 'tired', 'angry', 'lost', 'dark', 'heavy', 'stress', 'pain', 'bad', 'down', 'awful', 
        'terrible', 'cry', 'hate', 'lonely', 'anxious', 'worry', 'scared', 'fear', 'fail', 'boring', 'empty',
        '累', '难过', '痛苦', '烦', '死', '坏', '糟', '悲', '恨', '惧', '怕', '痛', '丧', '低', '哀', '愁', '苦'
    ];
    
    const positiveBase = [
        'happy', 'bright', 'joy', 'excited', 'light', 'love', 'good', 'great', 'awesome', 'wonderful', 
        'cool', 'calm', 'peace', 'smile', 'laugh', 'fun', 'win', 'success', 'confident', 'hope',
        '开心', '乐', '爱', '棒', '好', '喜', '爽', '美', '赞', '赢', '顺', '幸', '福', '悦'
    ];
    
    let score = 0;
    const lowerInput = inputText.toLowerCase();

    // Check if input contains Chinese characters
    const isChinese = /[\u4e00-\u9fa5]/.test(lowerInput);

    if (isChinese) {
        // --- Chinese Logic (Character based) ---
        // We scan for keywords and check the character immediately preceding them.
        
        // Helper to check negation
        const checkNegation = (index: number) => {
            if (index > 0) {
                const prevChar = lowerInput[index - 1];
                if (zhNegators.includes(prevChar)) return true;
            }
            return false;
        };

        negativeBase.forEach(word => {
            let idx = lowerInput.indexOf(word);
            while (idx !== -1) {
                if (checkNegation(idx)) {
                    score += 0.2; // "Not sad" -> slightly positive
                } else {
                    score -= 0.3;
                }
                idx = lowerInput.indexOf(word, idx + 1);
            }
        });

        positiveBase.forEach(word => {
            let idx = lowerInput.indexOf(word);
            while (idx !== -1) {
                if (checkNegation(idx)) {
                    score -= 0.2; // "Not happy" -> slightly negative
                } else {
                    score += 0.3;
                }
                idx = lowerInput.indexOf(word, idx + 1);
            }
        });

    } else {
        // --- English Logic (Token based) ---
        const tokens = lowerInput.replace(/[.,!?;:()"]/g, ' ').split(/\s+/).filter(w => w.length > 0);
        
        tokens.forEach((word, index) => {
            let val = 0;
            const isNegWord = negativeBase.some(nw => word.includes(nw));
            const isPosWord = positiveBase.some(pw => word.includes(pw));

            if (isNegWord) val = -0.3;
            else if (isPosWord) val = 0.3;

            if (val !== 0) {
                if (index > 0) {
                    const prevWord = tokens[index - 1];
                    if (enNegators.includes(prevWord)) {
                        val = -val * 0.8; // Invert
                    }
                }
                score += val;
            }
        });
    }
    
    // Clamp between -1 and 1
    const newMood = Math.max(-1, Math.min(1, score));
    setSimulatedMood(newMood);
    
    // Intensity logic
    let newIntensity = Math.min(1, inputText.length / 100);
    if (inputText.includes('!') || inputText.includes('！')) newIntensity += 0.2;
    if (Math.abs(score) > 0.5) newIntensity += 0.2;
    
    setSimulatedIntensity(Math.min(1, Math.max(0.1, newIntensity)));

  }, [inputText, t]);

  const handleStartMixing = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setStatusText(t.distillingStatus);
    
    try {
      const cocktail = await generateCocktail(inputText, language);
      
      setTimeout(() => {
        setIsProcessing(false);
        onMixComplete(cocktail); // Use new callback
      }, 2000);
    } catch (e) {
      setIsProcessing(false);
      setStatusText(t.errorStatus);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      
      {/* View Specific Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start pointer-events-none">
        {/* Left Side (Empty for now) */}
        <div></div>
        
        {/* Right Side Controls */}
        <div className="flex gap-3 pointer-events-auto">
          <button 
             onClick={toggleLanguage}
             className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-xs font-serif text-slate-300 hover:text-white backdrop-blur-sm border border-white/5 transition-all shadow-lg hover:bg-slate-700/80"
             title={language === 'en' ? "Switch to Chinese" : "Switch to English"}
           >
             {/* Showing Current Language for clarity */}
             {language === 'en' ? 'EN' : '中'}
           </button>
           
           <button 
             onClick={onShowHistory}
             className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-300 hover:text-white backdrop-blur-sm border border-white/5 transition-all hover:bg-slate-700/80"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
             </svg>
           </button>
        </div>
      </div>

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
        <div className="w-full max-w-md px-6 py-4">
            {/* Translated Labels - Only ONE set of labels here */}
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium tracking-widest uppercase">
                <span>{t.sliderDeep}</span>
                <span>{t.sliderBright}</span>
            </div>
            {/* Slider Component - Passing empty label to avoid duplication inside */}
            <MoodSlider value={simulatedMood} label="" />
            
            <div className="text-center mt-3">
                <span className="text-xs text-slate-300 animate-pulse">{statusText}</span>
            </div>
        </div>

        {/* (C) Wave / Input */}
        <div className="w-full max-w-lg mt-4 mb-6">
           {isProcessing ? (
             <WaveVisualizer isActive={true} />
           ) : (
             <textarea
              className="w-full bg-slate-800/50 text-white p-4 rounded-xl border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all placeholder:text-slate-500 text-sm font-sans leading-relaxed"
              rows={3}
              placeholder={t.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
             />
           )}
        </div>

        {/* (D) CTA */}
        <button
          onClick={handleStartMixing}
          disabled={isProcessing || inputText.length < 2}
          className={`
            w-full max-w-sm py-4 rounded-full font-serif text-lg tracking-wide font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95
            ${isProcessing || inputText.length < 2 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/30'}
          `}
        >
          {isProcessing ? t.mixProcessing : t.mixButton}
        </button>
      </div>
    </div>
  );
};

export default MixingView;