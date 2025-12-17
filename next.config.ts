import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อนุญาตให้โหลดรูปจากภายนอก (Supabase)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // ลบ experimental ทิ้งไปก่อน เพื่อให้รันผ่าน
};

export default nextConfig;