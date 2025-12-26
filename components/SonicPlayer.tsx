import React, { useState, useEffect, useRef } from 'react';
import { SonicVibe } from '../types';

interface SonicPlayerProps {
  vibe: SonicVibe;
  moodValue: number; // -1 to 1, drives the scale selection
  labelPlay: string;
  labelStop: string;
}

const SonicPlayer: React.FC<SonicPlayerProps> = ({ vibe, moodValue, labelPlay, labelStop }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // In browser, setInterval returns a number. Using 'any' handles cases where types might be mixed.
  const timerRef = useRef<any>(null);
  
  // Clean up function to stop all sound immediately
  const stopAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return stopAudio;
  }, []);

  const playNote = (ctx: AudioContext, frequency: number, duration: number, isBright: boolean) => {
    const now = ctx.currentTime;
    
    // Create nodes
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const panner = ctx.createStereoPanner();

    // Configuration based on mood
    osc.type = isBright ? 'sine' : 'triangle';
    osc.frequency.value = frequency;

    // Detune for chorus effect (Lush sound)
    const randomDetune = (Math.random() - 0.5) * 10; // +/- 5 cents
    osc.detune.value = randomDetune;

    // Random Pan for stereo width
    panner.pan.value = (Math.random() * 0.8) - 0.4; // Slightly left or right

    // Envelope (ADSR)
    const attack = isBright ? 0.05 : 0.8;
    const release = isBright ? 3.0 : 5.0;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(isBright ? 0.15 : 0.1, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + release);

    // Connect graph
    osc.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(ctx.destination);

    // Play
    osc.start(now);
    osc.stop(now + attack + release + 1);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // --- Generative Music Logic ---
      
      // Scales (Frequencies in Hz)
      // C Major Pentatonic (Happy/Bright): C4, D4, E4, G4, A4, C5
      const majorScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
      
      // C Minor Pentatonic (Sad/Deep): C3, Eb3, F3, G3, Bb3, C4
      const minorScale = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13];

      const isHappy = moodValue > -0.1;
      const scale = isHappy ? majorScale : minorScale;
      const speed = isHappy ? 2500 : 4000; // Happy = faster, Sad = slower

      // Initial Note
      playNote(ctx, scale[0], 4, isHappy);

      // Loop
      timerRef.current = setInterval(() => {
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        
        // Pick a random note from the scale
        // Bias towards root notes for stability
        const noteIndex = Math.floor(Math.random() * scale.length);
        const freq = scale[noteIndex];
        
        // Occasionally play a chord (2 notes)
        playNote(ctx, freq, 4, isHappy);
        if (Math.random() > 0.7) {
             const harmonyIndex = (noteIndex + 2) % scale.length;
             playNote(ctx, scale[harmonyIndex], 4, isHappy);
        }

      }, speed);

      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163z" />
            </svg>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
             {isPlaying ? 'Now Playing' : 'Mood Music'}
          </div>
          <div className="text-sm font-serif text-slate-200">
            {vibe.genre || (moodValue > 0 ? "Serene Major" : "Ambient Minor")}
          </div>
        </div>
      </div>
      
      <button 
        onClick={togglePlay}
        className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
            isPlaying 
            ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {isPlaying ? labelStop : labelPlay}
      </button>
    </div>
  );
};

export default SonicPlayer;