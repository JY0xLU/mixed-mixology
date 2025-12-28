// Simple synth for UI sound effects using Web Audio API

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playGlassClink = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const t = ctx.currentTime;
    
    // Create oscillator for the "ping"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High frequency sine wave with overtones for "glass" texture
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);

    // Sharp attack, long exponential decay
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Decay ring

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.5);

    // Add a second subtle overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3500, t);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.05, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.5);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};