import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hand Galaxy - 3D Gesture Controlled Particle Universe",
  description:
    "Interactive 3D particle galaxy powered by Next.js 15, React Three Fiber, and MediaPipe Hand Landmarker AI.",
  keywords: ["Next.js 15", "React Three Fiber", "Three.js", "MediaPipe", "Hand Tracking", "3D Particles"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-100 antialiased overflow-hidden select-none`}>
        {children}
      </body>
    </html>
  );
}
