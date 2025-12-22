import React, { useEffect, useRef } from 'react';

interface FluidGlassProps {
  moodValue: number; // -1 to 1
  intensity: number; // 0 to 1
  isAnalyzing: boolean;
}

const FluidGlass: React.FC<FluidGlassProps> = ({ moodValue, intensity, isAnalyzing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to interpolate colors
    const interpolateColor = (color1: number[], color2: number[], factor: number) => {
      // arguments object is not available in arrow functions, and TypeScript enforces parameter count.
      const result = color1.slice();
      for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
      }
      return `rgba(${result[0]}, ${result[1]}, ${result[2]}, 0.6)`;
    };

    const deepColor = [75, 0, 130]; // Indigo
    const sadColor = [50, 80, 200]; // Blue
    const neutralColor = [200, 200, 200]; // Grey/White
    const happyColor = [255, 215, 0]; // Gold
    const intenseColor = [255, 69, 0]; // Red-Orange

    const render = () => {
      if (!canvas || !ctx) return;
      
      // Resize handling
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }

      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 0.01 + (intensity * 0.05);

      // Determine Color
      let fillColor;
      if (moodValue < -0.3) {
        fillColor = interpolateColor(deepColor, sadColor, (moodValue + 1) / 0.7);
      } else if (moodValue > 0.3) {
        fillColor = interpolateColor(happyColor, intenseColor, (moodValue - 0.3) / 0.7);
      } else {
         fillColor = interpolateColor(sadColor, happyColor, (moodValue + 1) / 2);
      }

      // Glass Container Shape (Rounded Rectangle/Cup)
      const cupX = w * 0.2;
      const cupW = w * 0.6;
      const cupY = h * 0.1;
      const cupH = h * 0.8;
      const radius = 40;

      ctx.save();
      // Define clipping path for the liquid (inside the cup)
      ctx.beginPath();
      ctx.roundRect(cupX, cupY, cupW, cupH, [10, 10, radius, radius]);
      ctx.clip();

      // Liquid Logic
      const liquidLevel = 0.4 + (intensity * 0.3); // 40% to 70% full based on intensity
      const baseHeight = h - (cupY + (cupH * liquidLevel));
      
      // Draw Waves
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.fillStyle = fillColor;
        // Make layers increasingly transparent
        ctx.globalAlpha = 0.4 + (i * 0.15); 
        
        ctx.beginPath();
        const frequency = 0.01 + (i * 0.005);
        const amplitude = 10 + (intensity * 20); // Higher waves with intensity
        const phase = timeRef.current * (i + 1) + (isAnalyzing ? timeRef.current * 5 : 0);

        ctx.moveTo(cupX, h); // Bottom Left
        
        for (let x = cupX; x <= cupX + cupW; x += 10) {
          const y = baseHeight + Math.sin((x * frequency) + phase) * amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(cupX + cupW, h); // Bottom Right
        ctx.lineTo(cupX, h); // Close
        ctx.fill();
      }

      // Bubbles if analyzing or intense
      if (isAnalyzing || intensity > 0.5) {
        const bubbleCount = Math.floor(intensity * 20) + 5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        for(let j=0; j<bubbleCount; j++) {
           const bx = cupX + (Math.sin(timeRef.current * 0.1 * j) * 0.5 + 0.5) * cupW;
           const by = h - ((timeRef.current * (20 + j * 5)) % (cupH * liquidLevel));
           const bSize = (Math.sin(j) + 2) * 2;
           ctx.beginPath();
           ctx.arc(bx, by, bSize, 0, Math.PI * 2);
           ctx.fill();
        }
      }

      ctx.restore();

      // Draw Glass Border Overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cupX, cupY, cupW, cupH, [10, 10, radius, radius]);
      ctx.stroke();

      // Reflections
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(cupX + 10, cupY + 10, 10, cupH - 40, 5);
      ctx.fill();

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [moodValue, intensity, isAnalyzing]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full max-w-[400px] max-h-[600px]" />
    </div>
  );
};

export default FluidGlass;