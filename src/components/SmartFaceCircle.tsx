"use client";

import { useState } from "react";

interface SmartFaceCircleProps {
  url: string;
  box: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
  onClick: () => void;
}

export default function SmartFaceCircle({ url, box, onClick }: SmartFaceCircleProps) {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // 1. แปลง % เป็น Pixel จริง
    const faceW = box.width * naturalWidth;
    const faceH = box.height * naturalHeight;
    const faceX = box.left * naturalWidth;
    const faceY = box.top * naturalHeight;

    // 2. หาจุดกึ่งกลางหน้า
    const centerX = faceX + faceW / 2;
    const centerY = faceY + faceH / 2;

    // --- 🔥 จุดที่แก้ไข: ปรับสูตร Zoom Out ---
    // สูตรเดิม: (72 / Math.min(faceW, faceH)) * 0.8  <-- ซูม 80% (ใหญ่ไป)
    // สูตรใหม่: (72 / Math.max(faceW, faceH)) * 0.5  <-- ซูมแค่ 50% พอ (เห็นผม เห็นคอ)
    
    // ใช้ Math.max เพื่อยึดด้านที่ยาวที่สุดเป็นหลัก (กันหน้ายาวแล้วหลุดเฟรม)
    const scale = (72 / Math.max(faceW, faceH)) * 0.55; 

    setStyle({
      opacity: 1,
      position: "absolute",
      width: `${naturalWidth}px`,
      height: `${naturalHeight}px`,
      maxWidth: "none",
      // เลื่อนจุดกึ่งกลางหน้า มาวางที่จุดกึ่งกลางวงกลม (36, 36)
      transform: `translate(${-centerX}px, ${-centerY}px) scale(${scale})`,
      transformOrigin: `${centerX}px ${centerY}px`,
      left: "36px",
      top: "36px",
      transition: "opacity 0.3s ease",
    });
  };

  return (
    <button onClick={onClick} className="flex-shrink-0 group relative focus:outline-none">
      <div className="w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-105 transition-transform duration-300 shadow-lg">
        <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="face"
            onLoad={handleImageLoad}
            style={style}
            className="will-change-transform"
          />
        </div>
      </div>
    </button>
  );
}