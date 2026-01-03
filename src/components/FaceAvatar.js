'use client';
import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';

export default function FaceAvatar({ faceUrl, box, className }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!faceUrl || !box) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    // ❌ เอา crossOrigin ออก เพื่อลองดูว่าจะโหลดได้ไหม (อาจจะ Tainted แต่แสดงผลได้)
    // img.crossOrigin = "Anonymous"; 
    img.src = faceUrl;
    
    img.onload = () => {
        // Safe Parse
        const bLeft = Number(box.Left);
        const bTop = Number(box.Top);
        const bWidth = Number(box.Width);
        const bHeight = Number(box.Height);
        
        if (isNaN(bLeft)) return;

        // คำนวณพิกัด Crop
        const sx = bLeft * img.width;
        const sy = bTop * img.height;
        const sw = bWidth * img.width;
        const sh = bHeight * img.height;
        
        // Padding 20%
        const pX = sw * 0.2;
        const pY = sh * 0.2;
        
        const finalSx = Math.max(0, sx - pX);
        const finalSy = Math.max(0, sy - pY);
        const finalSw = Math.min(img.width - finalSx, sw + pX*2);
        const finalSh = Math.min(img.height - finalSy, sh + pY*2);
        
        // ตั้งขนาด Canvas
        canvas.width = 150;
        canvas.height = 150;
        
        // วาด (Crop & Resize)
        ctx.drawImage(img, finalSx, finalSy, finalSw, finalSh, 0, 0, canvas.width, canvas.height);
    };
  }, [faceUrl, box]);

  return (
    <div className={`relative overflow-hidden ${className} bg-zinc-900`}>
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
}