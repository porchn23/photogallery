'use client';
import { useEffect, useRef } from 'react';

export default function AIFaceBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const updatePos = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      mouse.current = { x, y, active: true };
    };

    const stopInteraction = () => { mouse.current.active = false; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', updatePos);
    window.addEventListener('touchstart', updatePos);
    window.addEventListener('touchmove', updatePos);
    window.addEventListener('touchend', stopInteraction);
    window.addEventListener('mouseleave', stopInteraction);
    
    resize();

    const pastelPalette = [
      'rgba(244, 114, 182, 0.18)', // Pink
      'rgba(59, 130, 246, 0.15)',  // Blue
      'rgba(251, 191, 36, 0.12)',  // Yellow
      'rgba(34, 197, 94, 0.15)',   // Green
      'rgba(139, 92, 246, 0.12)',  // Purple
    ];

    const lines = Array.from({ length: 100 }).map((_, i) => ({
      y: (canvas.height / 100) * i,
      baseAmplitude: 10 + Math.random() * 25,
      freq1: 0.001 + Math.random() * 0.001,
      freq2: 0.002 + Math.random() * 0.002,
      speed1: 0.0004 + Math.random() * 0.0006,
      speed2: 0.0008 + Math.random() * 0.001,
      phase: Math.random() * Math.PI,
      color: pastelPalette[i % pastelPalette.length]
    }));

    const draw = (time) => {
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.0;
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        
        for (let x = 0; x < canvas.width; x += 10) {
          const wave1 = Math.sin(x * line.freq1 + time * line.speed1 + line.phase);
          const wave2 = Math.sin(x * line.freq2 - time * line.speed2 + line.phase);
          
          let noise = (wave1 + wave2 * 0.5) * line.baseAmplitude;
          
          if (mouse.current.active) {
            const dx = x - mouse.current.x;
            const dy = line.y - mouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 250) {
              const force = Math.pow(1 - dist / 250, 2);
              noise += (mouse.current.y - line.y) * force * 0.5;
            }
          }

          const y = line.y + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // --- ส่วนที่ปรับลดพื้นที่เฟสบางลง 20% ---
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // ลดรัศมีการเฟสลงจาก 0.7 เหลือ 0.56 (ลดลง 20%)
      const maskRadius = Math.max(canvas.width, canvas.height) * 0.56; 
      
      const maskGradient = ctx.createRadialGradient(
        centerX, centerY, 0, 
        centerX, centerY, maskRadius
      );
      
      maskGradient.addColorStop(0, 'rgba(250, 250, 250, 0.98)');   
      maskGradient.addColorStop(0.4, 'rgba(250, 250, 250, 0.90)'); 
      maskGradient.addColorStop(0.7, 'rgba(250, 250, 250, 0.40)'); 
      maskGradient.addColorStop(1, 'rgba(250, 250, 250, 0)');      
      
      ctx.fillStyle = maskGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mouse.current.active) {
        const glow = ctx.createRadialGradient(
          mouse.current.x, mouse.current.y, 0, 
          mouse.current.x, mouse.current.y, 250
        );
        glow.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw(0);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', updatePos);
      window.removeEventListener('touchstart', updatePos);
      window.removeEventListener('touchmove', updatePos);
      window.removeEventListener('touchend', stopInteraction);
      window.removeEventListener('mouseleave', stopInteraction);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-[0.9]" 
    />
  );
}