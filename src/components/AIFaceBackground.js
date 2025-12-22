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

    // กำหนดชุดสีพาสเทล: ชมพู, ฟ้า, เหลือง, เขียว และม่วงจางๆ
    const pastelPalette = [
      'rgba(244, 114, 182, 0.12)', // Pink (ชมพู)
      'rgba(59, 130, 246, 0.08)',  // Blue (ฟ้า)
      'rgba(251, 191, 36, 0.07)',  // Yellow (เหลือง)
      'rgba(34, 197, 94, 0.08)',   // Green (เขียว)
      'rgba(139, 92, 246, 0.07)',  // Purple (ม่วง - ช่วยให้การไล่สีดูนุ่มนวลขึ้น)
    ];

    // สร้างกลุ่มเส้นสาย (เพิ่มจำนวนเส้นเป็น 50 เพื่อความละเอียด)
    const lines = Array.from({ length: 50 }).map((_, i) => ({
      y: (canvas.height / 50) * i,
      baseAmplitude: 15 + Math.random() * 35,
      freq1: 0.001 + Math.random() * 0.001,
      freq2: 0.002 + Math.random() * 0.002,
      speed1: 0.0004 + Math.random() * 0.0006,
      speed2: 0.0008 + Math.random() * 0.001,
      phase: Math.random() * Math.PI,
      // สลับสีพาสเทลตามลำดับเส้น
      color: pastelPalette[i % pastelPalette.length]
    }));

    const draw = (time) => {
      // พื้นหลังสีขาวนวลสะอาดตา
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.2;
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        
        for (let x = 0; x < canvas.width; x += 6) {
          // คำนวณคลื่นแบบพริ้วไหว
          const wave1 = Math.sin(x * line.freq1 + time * line.speed1 + line.phase);
          const wave2 = Math.sin(x * line.freq2 - time * line.speed2 + line.phase);
          
          let noise = (wave1 + wave2 * 0.5) * line.baseAmplitude;
          
          // ปฏิกิริยากับการเลื่อนเมาส์ (Liquid Displacement)
          if (mouse.current.active) {
            const dx = x - mouse.current.x;
            const dy = line.y - mouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 300) {
              const force = Math.pow(1 - dist / 300, 2);
              noise += (mouse.current.y - line.y) * force * 0.6;
            }
          }

          const y = line.y + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // รัศมีเรืองแสงจางๆ รอบจุดสัมผัส
      if (mouse.current.active) {
        const glow = ctx.createRadialGradient(
          mouse.current.x, mouse.current.y, 0, 
          mouse.current.x, mouse.current.y, 250
        );
        glow.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
        glow.addColorStop(0.5, 'rgba(244, 114, 182, 0.02)');
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