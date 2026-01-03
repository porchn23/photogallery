'use client';

import { useState } from 'react';
// import Image from 'next/image'; // ❌ ไม่ใช้ Next Image ชั่วคราว

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="w-full max-w-4xl mx-auto aspect-[4/3] md:aspect-[16/9] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none">
      
      {/* 1. รูป After (Base Layer) */}
      <div className="absolute inset-0">
         {/* ✅ ใช้ img ธรรมดา แทน Image */}
         <img 
           src="/Assets/before-after/after.jpg"
           alt="After AI"
           className="w-full h-full object-cover"
           draggable={false}
           crossOrigin="anonymous" // ✅ เพิ่มตัวนี้
         />
         <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full z-10">
           AI Enhanced
         </div>
      </div>

      {/* 2. รูป Before (Overlay Layer) */}
      <div 
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
         {/* ✅ ใช้ img ธรรมดา */}
         <img 
           src="/Assets/before-after/before.jpg"
           alt="Before Original"
           className="w-full h-full object-cover"
           draggable={false}
           crossOrigin="anonymous" // ✅ เพิ่มตัวนี้
         />
         <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full z-20">
           Original
         </div>
         <div className="absolute inset-y-0 right-0 w-0.5 bg-white/50"></div>
      </div>

      {/* 3. Slider Handle */}
      <div 
         className="absolute top-0 bottom-0 w-1 bg-transparent cursor-ew-resize flex items-center justify-center z-20"
         style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute inset-y-0 w-0.5 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.2)]"></div>
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-lg scale-100 group-hover:scale-110 transition-transform -ml-0.5 relative z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
        </div>
      </div>

      {/* 4. Input Control */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderPosition}
        onChange={(e) => setSliderPosition(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

    </div>
  );
}