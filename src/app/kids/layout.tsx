import { Schoolbell } from "next/font/google";
import { getLocale } from "next-intl/server";
import { KidsHeader } from "@/components/kids/layout/kids-header";
import { MusicProvider } from "@/components/kids/layout/background-music";
import { LevelProvider } from "@/components/kids/providers/level-context";

const RTL_LOCALES = ["ar", "he", "fa"];

const kidsFont = Schoolbell({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kids",
});

// Pixel art cloud component for background
function PixelCloudBg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 32 16" 
      className={className}
      style={{ imageRendering: "pixelated", ...style }}
    >
      <rect x="8" y="8" width="16" height="8" fill="white" />
      <rect x="4" y="12" width="8" height="4" fill="white" />
      <rect x="20" y="12" width="8" height="4" fill="white" />
      <rect x="12" y="4" width="8" height="4" fill="white" />
      <rect x="6" y="8" width="4" height="4" fill="white" />
      <rect x="22" y="8" width="4" height="4" fill="white" />
    </svg>
  );
}

export default async function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const isRtl = RTL_LOCALES.includes(locale);

  return (
    <LevelProvider>
    <MusicProvider>
    <div 
      className={`fixed inset-0 flex flex-col text-xl light ${kidsFont.className}`} 
      data-theme="light" 
      dir={isRtl ? "rtl" : "ltr"}
      style={{ colorScheme: "light" }}
    >
      {/* Smooth gradient sky background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, #4A90D9 0%, #87CEEB 30%, #98D8F0 60%, #B8E8F8 100%)"
        }}
      />
      
      {/* Animated pixel clouds - drift from left to right */}
      <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        <PixelCloudBg 
          className="absolute w-24 h-12 opacity-90 animate-cloud-slow"
          style={{ top: "8%", left: 0, animationDelay: "0s" }}
        />
        <PixelCloudBg 
          className="absolute w-32 h-16 opacity-80 animate-cloud-medium"
          style={{ top: "15%", left: 0, animationDelay: "-10s" }}
        />
        <PixelCloudBg 
          className="absolute w-20 h-10 opacity-85 animate-cloud-fast"
          style={{ top: "5%", left: 0, animationDelay: "-5s" }}
        />
        <PixelCloudBg 
          className="absolute w-28 h-14 opacity-75 animate-cloud-slow"
          style={{ top: "22%", left: 0, animationDelay: "-20s" }}
        />
        <PixelCloudBg 
          className="absolute w-16 h-8 opacity-70 animate-cloud-medium"
          style={{ top: "12%", left: 0, animationDelay: "-15s" }}
        />
        <PixelCloudBg 
          className="absolute w-36 h-18 opacity-60 animate-cloud-fast"
          style={{ top: "28%", left: 0, animationDelay: "-8s" }}
        />
      </div>

      <KidsHeader />
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
    </MusicProvider>
    </LevelProvider>
  );
}
