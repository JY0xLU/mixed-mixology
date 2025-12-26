import React, { useState, useEffect, useRef } from 'react';
import FluidGlass from '../components/FluidGlass';
import WaveVisualizer from '../components/WaveVisualizer';
import { generateCocktail } from '../services/geminiService';
import { AppState, MoodCocktail, Language } from '../types';
import { getTranslation } from '../utils/translations';

// Augment window for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

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
  const [isListening, setIsListening] = useState(false);
  
  // Emotional Palette State
  const [moodValue, setMoodValue] = useState(0); // -1 (Sad) to 1 (Happy)
  const [intensityValue, setIntensityValue] = useState(0.2); // 0 (Calm) to 1 (High Energy)
  const [isManualOverride, setIsManualOverride] = useState(false); // If true, auto-analysis stops

  const [statusText, setStatusText] = useState(t.readyStatus);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
             setInputText(prev => {
                const spacer = prev.length > 0 && ![' ', '\n'].includes(prev.slice(-1)) ? ' ' : '';
                return prev + spacer + finalTranscript;
             });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          setStatusText(t.errorStatus);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [t]);

  // Update language of recognition
  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatusText(t.readyStatus);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setStatusText(t.micListening);
    }
  };

  // Update status text when language changes if idle
  useEffect(() => {
    if (!isProcessing && !isListening && inputText.length === 0) {
      setStatusText(t.readyStatus);
    } else if (inputText.length > 0 && !isProcessing && !isListening) {
      setStatusText(t.capturingStatus);
    }
  }, [language, t, isProcessing, isListening]);

  // Real-time Auto Analysis (Only runs if user hasn't manually touched sliders)
  useEffect(() => {
    if (isManualOverride) return; // User has taken control

    if (inputText.length === 0) {
      setMoodValue(0);
      setIntensityValue(0.2);
      if (!isListening) setStatusText(t.silenceStatus);
      return;
    }

    if (!isListening) setStatusText(t.capturingStatus);
    
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
    const isChinese = /[\u4e00-\u9fa5]/.test(lowerInput);

    if (isChinese) {
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
                if (checkNegation(idx)) score += 0.2;
                else score -= 0.3;
                idx = lowerInput.indexOf(word, idx + 1);
            }
        });

        positiveBase.forEach(word => {
            let idx = lowerInput.indexOf(word);
            while (idx !== -1) {
                if (checkNegation(idx)) score -= 0.2;
                else score += 0.3;
                idx = lowerInput.indexOf(word, idx + 1);
            }
        });

    } else {
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
                        val = -val * 0.8;
                    }
                }
                score += val;
            }
        });
    }
    
    const newMood = Math.max(-1, Math.min(1, score));
    setMoodValue(newMood);
    
    let newIntensity = Math.min(1, inputText.length / 100);
    if (inputText.includes('!') || inputText.includes('！')) newIntensity += 0.2;
    if (Math.abs(score) > 0.5) newIntensity += 0.2;
    
    setIntensityValue(Math.min(1, Math.max(0.1, newIntensity)));

  }, [inputText, t, isManualOverride, isListening]);

  const handleStartMixing = async () => {
    if (!inputText.trim() && moodValue === 0) return; // Allow mixing if just sliders moved? Let's require text for prompt.

    setIsProcessing(true);
    setStatusText(t.distillingStatus);
    
    try {
      // We pass the inputText + " [Mood: X, Intensity: Y]" as context to the AI?
      // Or we just let the AI derive it. The user wants the visual to match. 
      // We'll append a system note to the prompt in the service if needed, but for now 
      // the visual is the immediate feedback. The AI analyzes text. 
      // Ideally, we should pass these values to the generator, but to keep changes minimal
      // we just let the AI analyze the text which drove the defaults. 
      // If manual override, we might want to append a hint string.
      
      let finalPrompt = inputText;
      if (isManualOverride) {
        const moodDesc = moodValue > 0 ? "Positive/Bright" : "Negative/Deep";
        const energyDesc = intensityValue > 0.5 ? "High Energy" : "Low Energy";
        finalPrompt += ` (Context: User intentionally set the mood to ${moodDesc} and intensity to ${energyDesc})`;
      }

      const cocktail = await generateCocktail(finalPrompt, language);
      
      // OPTIONAL: Force the result cocktail to match user's slider colors?
      // For now, let the AI be the "Expert Mixologist" interpretation.
      
      setTimeout(() => {
        setIsProcessing(false);
        onMixComplete(cocktail);
      }, 2000);
    } catch (e) {
      setIsProcessing(false);
      setStatusText(t.errorStatus);
    }
  };

  const handleSliderChange = (type: 'mood' | 'intensity', val: number) => {
      setIsManualOverride(true);
      if (type === 'mood') setMoodValue(val);
      if (type === 'intensity') setIntensityValue(val);
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-slate-950">
      
      {/* View Specific Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start pointer-events-none">
        <div></div>
        <div className="flex gap-3 pointer-events-auto">
          <button 
             onClick={toggleLanguage}
             className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-xs font-serif text-slate-300 hover:text-white backdrop-blur-sm border border-white/5 transition-all shadow-lg hover:bg-slate-700/80"
           >
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

      {/* (A) Glass Visualizer - Responds to Sliders */}
      <div className="flex-grow relative z-10 flex flex-col items-center justify-center p-4 min-h-[35%] transition-all duration-500">
        <FluidGlass 
          moodValue={moodValue} 
          intensity={intensityValue} 
          isAnalyzing={isProcessing || isListening} 
        />
        
        {/* Helper status text floating near glass */}
        <div className="absolute bottom-4 text-center">
            <span className={`text-xs text-slate-400 font-medium tracking-widest uppercase transition-opacity duration-300 ${isListening ? 'animate-pulse text-purple-400' : ''}`}>
                {statusText}
            </span>
        </div>
      </div>

      {/* Control Area */}
      <div className="w-full bg-slate-900/80 backdrop-blur-xl rounded-t-[2.5rem] border-t border-white/10 p-6 flex flex-col items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all">
        
        {/* (B) Emotional Palette (Sliders) */}
        <div className="w-full max-w-sm mb-6 space-y-5">
            {/* Mood Slider */}
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>{t.sliderDeep}</span>
                    <span>{t.labelMood}</span>
                    <span>{t.sliderBright}</span>
                </div>
                <input 
                    type="range" 
                    min="-1" max="1" step="0.1"
                    value={moodValue}
                    onChange={(e) => handleSliderChange('mood', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    style={{
                        backgroundImage: `linear-gradient(to right, #4338ca, #64748b, #fbbf24)`
                    }}
                />
            </div>

            {/* Intensity Slider */}
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Low</span>
                    <span>{t.labelEnergy}</span>
                    <span>High</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="1" step="0.1"
                    value={intensityValue}
                    onChange={(e) => handleSliderChange('intensity', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
            </div>
        </div>

        {/* (C) Input Area with Mic */}
        <div className="w-full max-w-lg mb-6 relative">
            <div className="relative">
                <textarea
                    className="w-full bg-slate-800/50 text-white pl-4 pr-12 py-4 rounded-2xl border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all placeholder:text-slate-600 text-sm font-sans leading-relaxed shadow-inner"
                    rows={2}
                    placeholder={t.placeholder}
                    value={inputText}
                    onChange={(e) => {
                        setInputText(e.target.value);
                        if (e.target.value === '') setIsManualOverride(false); // Reset manual override if cleared
                    }}
                    disabled={isProcessing}
                />
                
                {/* Voice Button */}
                <button 
                    onClick={toggleListening}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                        isListening 
                        ? 'bg-red-500/20 text-red-400 animate-pulse ring-2 ring-red-500/50' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={t.micStart}
                >
                    {isListening ? (
                         // Stop Icon
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                           <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                         </svg>
                    ) : (
                         // Mic Icon
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                           <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                           <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                         </svg>
                    )}
                </button>
            </div>
            
            {isListening && (
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                    <div className="text-[10px] text-red-400 font-mono animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        REC
                    </div>
                </div>
            )}
        </div>

        {/* (D) CTA */}
        <button
          onClick={handleStartMixing}
          disabled={isProcessing || (inputText.length < 1 && moodValue === 0)}
          className={`
            w-full max-w-sm py-4 rounded-full font-serif text-lg tracking-wide font-semibold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95
            ${isProcessing || (inputText.length < 1 && moodValue === 0)
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/30 border border-white/10'}
          `}
        >
          {isProcessing ? t.mixProcessing : t.mixButton}
        </button>
      </div>
    </div>
  );
};

export default MixingView;