import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "ROOPLIFE | AI FACE GRID - ระบบส่งรูปอัจฉริยะสำหรับช่างภาพมืออาชีพ",
    template: "%s | ROOPLIFE"
  },
  description: "เปลี่ยนงานอีเวนต์ให้ล้ำสมัยด้วยระบบส่งภาพ AI Real-time ค้นหาใบหน้าแม่นยำ แจกรูปผ่าน QR Code สำหรับงานแต่ง งานวิ่ง และงานอีเวนต์ทุกรูปแบบ",
  icons: {
    icon: [
      { url: "/rooplife-logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/rooplife-logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/rooplife-logo/favicon.ico",
    apple: "/rooplife-logo/apple-touch-icon.png",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/rooplife-logo/apple-touch-icon.png",
      },
    ],
  },
  keywords: ["ช่างภาพ", "ระบบส่งรูป", "AI Face Recognition", "งานแต่ง", "งานวิ่ง", "แกลเลอรี่รูปภาพ", "RoopLife"],
  openGraph: {
    title: "ROOPLIFE | ระบบแกลเลอรี่ AI สำหรับช่างภาพยุคใหม่",
    description: "ส่งรูปไวถึงมือลูกค้าทันทีด้วยระบบค้นหาใบหน้าอัจฉริยะ",
    url: "https://www.rooplife.com",
    images: [
      {
        url: "/rooplife-logo/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "ROOPLIFE AI Photo Gallery",
      },
    ],
    siteName: "ROOPLIFE",
    locale: "th_TH",
    type: "website",
  },
  alternates: {
    canonical: "https://www.rooplife.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOPLIFE | AI FACE GRID",
    description: "ระบบส่งรูปอัจฉริยะสำหรับช่างภาพมืออาชีพ",
    images: ["/rooplife-logo/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
