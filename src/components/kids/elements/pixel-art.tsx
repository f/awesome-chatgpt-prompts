"use client";

import { cn } from "@/lib/utils";

// Pixel Art Tree (Pine)
export function PixelTree({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 16 24" 
      className={cn("w-8 h-12", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Tree top */}
      <rect x="6" y="0" width="4" height="2" fill="#228B22" />
      <rect x="4" y="2" width="8" height="2" fill="#228B22" />
      <rect x="2" y="4" width="12" height="2" fill="#2E8B2E" />
      <rect x="4" y="6" width="8" height="2" fill="#228B22" />
      <rect x="2" y="8" width="12" height="2" fill="#2E8B2E" />
      <rect x="0" y="10" width="16" height="2" fill="#228B22" />
      <rect x="2" y="12" width="12" height="2" fill="#2E8B2E" />
      <rect x="0" y="14" width="16" height="2" fill="#1E6B1E" />
      {/* Trunk */}
      <rect x="6" y="16" width="4" height="8" fill="#8B4513" />
    </svg>
  );
}

// Pixel Art Bush
export function PixelBush({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 16 10" 
      className={cn("w-8 h-5", className)}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="0" width="8" height="2" fill="#32CD32" />
      <rect x="2" y="2" width="12" height="2" fill="#228B22" />
      <rect x="0" y="4" width="16" height="4" fill="#2E8B2E" />
      <rect x="2" y="8" width="12" height="2" fill="#1E6B1E" />
    </svg>
  );
}

// Pixel Art Cloud
export function PixelCloud({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 12" 
      className={cn("w-12 h-6", className)}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="0" width="8" height="2" fill="white" />
      <rect x="2" y="2" width="14" height="2" fill="white" />
      <rect x="0" y="4" width="20" height="4" fill="white" />
      <rect x="14" y="2" width="6" height="2" fill="white" />
      <rect x="16" y="4" width="8" height="4" fill="white" />
      <rect x="2" y="8" width="20" height="2" fill="#f0f0f0" />
      <rect x="4" y="10" width="16" height="2" fill="#e8e8e8" />
    </svg>
  );
}

// Pixel Art Castle
export function PixelCastle({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      className={cn("w-16 h-16", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Towers */}
      <rect x="0" y="4" width="6" height="4" fill="#808080" />
      <rect x="0" y="0" width="2" height="4" fill="#696969" />
      <rect x="4" y="0" width="2" height="4" fill="#696969" />
      <rect x="26" y="4" width="6" height="4" fill="#808080" />
      <rect x="26" y="0" width="2" height="4" fill="#696969" />
      <rect x="30" y="0" width="2" height="4" fill="#696969" />
      {/* Main body */}
      <rect x="0" y="8" width="32" height="16" fill="#A0A0A0" />
      <rect x="4" y="8" width="24" height="4" fill="#888888" />
      {/* Windows */}
      <rect x="6" y="14" width="4" height="4" fill="#4169E1" />
      <rect x="22" y="14" width="4" height="4" fill="#4169E1" />
      {/* Door */}
      <rect x="12" y="16" width="8" height="8" fill="#8B4513" />
      <rect x="14" y="18" width="4" height="6" fill="#654321" />
      {/* Flag */}
      <rect x="15" y="4" width="2" height="8" fill="#654321" />
      <rect x="17" y="4" width="6" height="4" fill="#FF4444" />
      {/* Base */}
      <rect x="0" y="24" width="32" height="8" fill="#696969" />
    </svg>
  );
}

// Pixel Art Mountain
export function PixelMountain({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 16" 
      className={cn("w-12 h-8", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Snow cap */}
      <rect x="10" y="0" width="4" height="2" fill="white" />
      <rect x="8" y="2" width="8" height="2" fill="white" />
      {/* Mountain body */}
      <rect x="6" y="4" width="12" height="2" fill="#808080" />
      <rect x="4" y="6" width="16" height="2" fill="#696969" />
      <rect x="2" y="8" width="20" height="2" fill="#606060" />
      <rect x="0" y="10" width="24" height="6" fill="#505050" />
    </svg>
  );
}

// Pixel Art Flower
export function PixelFlower({ className, color = "#FF69B4" }: { className?: string; color?: string }) {
  return (
    <svg 
      viewBox="0 0 8 12" 
      className={cn("w-4 h-6", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Petals */}
      <rect x="2" y="0" width="4" height="2" fill={color} />
      <rect x="0" y="2" width="2" height="4" fill={color} />
      <rect x="6" y="2" width="2" height="4" fill={color} />
      <rect x="2" y="6" width="4" height="2" fill={color} />
      {/* Center */}
      <rect x="2" y="2" width="4" height="4" fill="#FFD700" />
      {/* Stem */}
      <rect x="3" y="8" width="2" height="4" fill="#228B22" />
    </svg>
  );
}

// Pixel Art Star
export function PixelStar({ className, filled = false }: { className?: string; filled?: boolean }) {
  const color = filled ? "#FFD700" : "#D3D3D3";
  return (
    <svg 
      viewBox="0 0 12 12" 
      className={cn("w-4 h-4", className)}
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="5" y="0" width="2" height="2" fill={color} />
      <rect x="4" y="2" width="4" height="2" fill={color} />
      <rect x="0" y="4" width="12" height="2" fill={color} />
      <rect x="2" y="6" width="8" height="2" fill={color} />
      <rect x="2" y="8" width="2" height="2" fill={color} />
      <rect x="8" y="8" width="2" height="2" fill={color} />
      <rect x="0" y="10" width="2" height="2" fill={color} />
      <rect x="10" y="10" width="2" height="2" fill={color} />
    </svg>
  );
}

// Pixel Art Robot (Promi) with mood support
type PromiMood = "happy" | "thinking" | "excited" | "confused" | "celebrating";

interface PixelRobotProps {
  className?: string;
  mood?: PromiMood;
}

// Mouth shapes for different moods
const mouthShapes: Record<PromiMood, { x: number; y: number; width: number; height: number; fill: string }[]> = {
  happy: [
    { x: 6, y: 10, width: 4, height: 1, fill: "#333" },
    { x: 5, y: 9, width: 1, height: 1, fill: "#333" },
    { x: 10, y: 9, width: 1, height: 1, fill: "#333" },
  ],
  thinking: [
    { x: 7, y: 10, width: 2, height: 1, fill: "#333" },
  ],
  excited: [
    { x: 5, y: 9, width: 6, height: 2, fill: "#333" },
    { x: 6, y: 10, width: 4, height: 1, fill: "#FF6B6B" },
  ],
  confused: [
    { x: 6, y: 10, width: 3, height: 1, fill: "#333" },
    { x: 9, y: 9, width: 1, height: 1, fill: "#333" },
  ],
  celebrating: [
    { x: 5, y: 9, width: 6, height: 2, fill: "#333" },
    { x: 6, y: 9, width: 4, height: 1, fill: "#FF6B6B" },
  ],
};

// Eye variations for moods
const eyeVariations: Record<PromiMood, { leftPupil: { x: number; y: number }; rightPupil: { x: number; y: number }; extra?: { x: number; y: number; width: number; height: number; fill: string }[] }> = {
  happy: { leftPupil: { x: 5, y: 7 }, rightPupil: { x: 10, y: 7 } },
  thinking: { leftPupil: { x: 6, y: 6 }, rightPupil: { x: 11, y: 6 } },
  excited: { 
    leftPupil: { x: 5, y: 7 }, 
    rightPupil: { x: 10, y: 7 },
    extra: [
      { x: 3, y: 5, width: 1, height: 1, fill: "#FFD700" },
      { x: 12, y: 5, width: 1, height: 1, fill: "#FFD700" },
    ]
  },
  confused: { 
    leftPupil: { x: 5, y: 7 }, 
    rightPupil: { x: 10, y: 6 },
    extra: [
      { x: 13, y: 3, width: 2, height: 1, fill: "#FFD700" },
      { x: 14, y: 2, width: 1, height: 1, fill: "#FFD700" },
    ]
  },
  celebrating: { 
    leftPupil: { x: 5, y: 7 }, 
    rightPupil: { x: 10, y: 7 },
    extra: [
      { x: 0, y: 0, width: 1, height: 1, fill: "#FF6B6B" },
      { x: 15, y: 1, width: 1, height: 1, fill: "#22C55E" },
      { x: 2, y: 2, width: 1, height: 1, fill: "#FFD700" },
      { x: 14, y: 3, width: 1, height: 1, fill: "#3B82F6" },
    ]
  },
};

export function PixelRobot({ className, mood = "happy" }: PixelRobotProps) {
  const mouthParts = mouthShapes[mood];
  const eyeData = eyeVariations[mood];
  
  return (
    <svg 
      viewBox="0 0 16 20" 
      className={cn("w-8 h-10", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Confetti/effects for certain moods */}
      {eyeData.extra?.map((rect, i) => (
        <rect key={`extra-${i}`} x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={rect.fill} />
      ))}
      {/* Antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#FFD700" />
      <rect x="6" y="2" width="4" height="2" fill="#C0C0C0" />
      {/* Head */}
      <rect x="2" y="4" width="12" height="8" fill="#4A90D9" />
      {/* Eyes - white part */}
      <rect x="4" y="6" width="3" height="3" fill="white" />
      <rect x="9" y="6" width="3" height="3" fill="white" />
      {/* Pupils - position varies by mood */}
      <rect x={eyeData.leftPupil.x} y={eyeData.leftPupil.y} width="2" height="2" fill="#333" />
      <rect x={eyeData.rightPupil.x} y={eyeData.rightPupil.y} width="2" height="2" fill="#333" />
      {/* Mouth - varies by mood */}
      {mouthParts.map((rect, i) => (
        <rect key={`mouth-${i}`} x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={rect.fill} />
      ))}
      {/* Body */}
      <rect x="4" y="12" width="8" height="6" fill="#4A90D9" />
      <rect x="6" y="14" width="4" height="2" fill="#FFD700" />
      {/* Arms */}
      <rect x="0" y="12" width="4" height="2" fill="#4A90D9" />
      <rect x="12" y="12" width="4" height="2" fill="#4A90D9" />
      {/* Feet */}
      <rect x="4" y="18" width="3" height="2" fill="#333" />
      <rect x="9" y="18" width="3" height="2" fill="#333" />
    </svg>
  );
}

// Pixel Art Level Node
export function PixelLevelNode({ 
  state, 
  levelNumber,
  className 
}: { 
  state: "locked" | "available" | "completed";
  levelNumber: string;
  className?: string;
}) {
  const bgColor = state === "completed" ? "#22C55E" : state === "available" ? "#3B82F6" : "#6B7280";
  const borderColor = state === "completed" ? "#16A34A" : state === "available" ? "#2563EB" : "#4B5563";
  const glowColor = state === "available" ? "rgba(59, 130, 246, 0.4)" : state === "completed" ? "rgba(34, 197, 94, 0.3)" : "transparent";
  
  return (
    <div className={cn("relative", className)}>
      {/* Glow effect */}
      {state !== "locked" && (
        <div 
          className="absolute inset-0 -m-2 rounded-lg animate-pulse"
          style={{ backgroundColor: glowColor }}
        />
      )}
      <svg 
        viewBox="0 0 24 24" 
        className="w-16 h-16 md:w-20 md:h-20"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Outer border */}
        <rect x="2" y="0" width="20" height="2" fill={borderColor} />
        <rect x="0" y="2" width="2" height="20" fill={borderColor} />
        <rect x="22" y="2" width="2" height="20" fill={borderColor} />
        <rect x="2" y="22" width="20" height="2" fill={borderColor} />
        {/* Inner fill */}
        <rect x="2" y="2" width="20" height="20" fill={bgColor} />
        {/* Icon based on state */}
        {state === "locked" && (
          <>
            {/* Lock icon */}
            <rect x="9" y="8" width="6" height="2" fill="#333" />
            <rect x="8" y="10" width="8" height="8" fill="#333" />
            <rect x="10" y="12" width="4" height="4" fill="#666" />
          </>
        )}
        {state === "available" && (
          <>
            {/* Play icon */}
            <rect x="9" y="7" width="2" height="10" fill="white" />
            <rect x="11" y="9" width="2" height="6" fill="white" />
            <rect x="13" y="11" width="2" height="2" fill="white" />
          </>
        )}
        {state === "completed" && (
          <>
            {/* Checkmark */}
            <rect x="6" y="12" width="2" height="4" fill="white" />
            <rect x="8" y="14" width="2" height="2" fill="white" />
            <rect x="10" y="12" width="2" height="4" fill="white" />
            <rect x="12" y="10" width="2" height="4" fill="white" />
            <rect x="14" y="8" width="2" height="4" fill="white" />
            <rect x="16" y="6" width="2" height="4" fill="white" />
          </>
        )}
      </svg>
      {/* Level number badge */}
      <div 
        className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-sm font-bold bg-amber-400 text-amber-900 shadow-md"
        style={{ 
          clipPath: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)",
        }}
      >
        {levelNumber}
      </div>
    </div>
  );
}

// Pixel Art Path Segment
export function PixelPath({ width = 100, className }: { width?: number; className?: string }) {
  const segments = Math.ceil(width / 8);
  return (
    <svg 
      viewBox={`0 0 ${width} 8`}
      className={cn("h-2", className)}
      style={{ width: `${width}px`, imageRendering: "pixelated" }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <rect 
          key={i}
          x={i * 8} 
          y="2" 
          width="6" 
          height="4" 
          fill={i % 2 === 0 ? "#D4A574" : "#C4956A"} 
        />
      ))}
    </svg>
  );
}

// Pixel Art Sports Car
export function PixelCar({ className, color = "#E74C3C" }: { className?: string; color?: string }) {
  // Darker shade for details
  const darkColor = color === "#E74C3C" ? "#C0392B" : color === "#27AE60" ? "#1E8449" : "#2471A3";
  return (
    <svg 
      viewBox="0 0 36 14" 
      className={cn("w-28 h-11", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Shadow */}
      <rect x="4" y="12" width="28" height="2" fill="#00000033" />
      {/* Car body - low sleek profile */}
      <rect x="2" y="6" width="32" height="6" fill={color} />
      {/* Sloped hood */}
      <rect x="26" y="5" width="8" height="2" fill={color} />
      {/* Low cabin */}
      <rect x="10" y="3" width="14" height="4" fill={color} />
      {/* Body details/shading */}
      <rect x="2" y="10" width="32" height="2" fill={darkColor} />
      {/* Windshield - angled */}
      <rect x="20" y="3" width="4" height="3" fill="#87CEEB" />
      {/* Rear window */}
      <rect x="12" y="4" width="4" height="2" fill="#87CEEB" />
      {/* Wheels - larger sporty */}
      <rect x="4" y="10" width="6" height="4" fill="#222" />
      <rect x="5" y="11" width="4" height="2" fill="#555" />
      <rect x="26" y="10" width="6" height="4" fill="#222" />
      <rect x="27" y="11" width="4" height="2" fill="#555" />
      {/* Headlights */}
      <rect x="32" y="6" width="2" height="2" fill="#FFD700" />
      {/* Taillights */}
      <rect x="2" y="7" width="2" height="2" fill="#DC143C" />
      {/* Spoiler */}
      <rect x="2" y="4" width="6" height="2" fill={darkColor} />
      <rect x="4" y="2" width="2" height="2" fill={darkColor} />
    </svg>
  );
}

// Pixel Art Old Classic Car (Beetle style)
export function PixelOldCar({ className, color = "#27AE60" }: { className?: string; color?: string }) {
  const darkColor = color === "#27AE60" ? "#1E8449" : "#1a5276";
  return (
    <svg 
      viewBox="0 0 28 14" 
      className={cn("w-22 h-11", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Shadow */}
      <rect x="4" y="12" width="20" height="2" fill="#00000033" />
      {/* Car body - rounded beetle shape */}
      <rect x="2" y="6" width="24" height="6" fill={color} />
      {/* Rounded roof */}
      <rect x="6" y="2" width="16" height="6" fill={color} />
      <rect x="8" y="1" width="12" height="2" fill={color} />
      {/* Body shading */}
      <rect x="2" y="10" width="24" height="2" fill={darkColor} />
      {/* Front fender bump */}
      <rect x="20" y="5" width="6" height="2" fill={color} />
      {/* Rear fender bump */}
      <rect x="2" y="5" width="6" height="2" fill={color} />
      {/* Windshield - rounded */}
      <rect x="16" y="3" width="4" height="3" fill="#87CEEB" />
      {/* Rear window */}
      <rect x="8" y="3" width="4" height="3" fill="#87CEEB" />
      {/* Wheels */}
      <rect x="4" y="10" width="5" height="4" fill="#222" />
      <rect x="5" y="11" width="3" height="2" fill="#555" />
      <rect x="19" y="10" width="5" height="4" fill="#222" />
      <rect x="20" y="11" width="3" height="2" fill="#555" />
      {/* Headlights - round */}
      <rect x="24" y="7" width="2" height="2" fill="#FFD700" />
      {/* Taillights */}
      <rect x="2" y="7" width="2" height="2" fill="#DC143C" />
      {/* Chrome bumpers */}
      <rect x="24" y="10" width="2" height="2" fill="#C0C0C0" />
      <rect x="2" y="10" width="2" height="2" fill="#C0C0C0" />
    </svg>
  );
}

// Pixel Art A-Team style Van with optional text
export function PixelVan({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={cn("relative", className)}>
      <svg 
        viewBox="0 0 40 20" 
        className="w-32 h-16"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Shadow */}
        <rect x="4" y="18" width="32" height="2" fill="#00000033" />
        
        {/* Van body - white */}
        <rect x="2" y="4" width="34" height="12" fill="#F5F5F5" />
        
        {/* Roof */}
        <rect x="4" y="2" width="30" height="4" fill="#E8E8E8" />
        
        {/* Windshield */}
        <rect x="28" y="4" width="6" height="6" fill="#87CEEB" />
        
        {/* Wheels */}
        <rect x="6" y="16" width="6" height="4" fill="#222" />
        <rect x="7" y="17" width="4" height="2" fill="#555" />
        <rect x="28" y="16" width="6" height="4" fill="#222" />
        <rect x="29" y="17" width="4" height="2" fill="#555" />
        
        {/* Headlights */}
        <rect x="34" y="8" width="2" height="2" fill="#FFD700" />
        {/* Taillights */}
        <rect x="2" y="12" width="2" height="2" fill="#DC143C" />
        
        {/* Front bumper */}
        <rect x="34" y="14" width="4" height="2" fill="#333" />
      </svg>
      {/* Text overlay on van side */}
      {text && (
        <span 
          className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold text-[11px] whitespace-nowrap"
          style={{ textShadow: "0.5px 0.5px 0 #fff", transform: "scaleX(-1)" }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

// Pixel Art Lake
export function PixelLake({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 16" 
      className={cn("w-16 h-8", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Lake water - multiple shades of blue */}
      <rect x="4" y="4" width="24" height="2" fill="#5DADE2" />
      <rect x="2" y="6" width="28" height="2" fill="#3498DB" />
      <rect x="0" y="8" width="32" height="4" fill="#2980B9" />
      <rect x="2" y="12" width="28" height="2" fill="#3498DB" />
      <rect x="6" y="14" width="20" height="2" fill="#5DADE2" />
      {/* Water sparkles */}
      <rect x="8" y="8" width="2" height="2" fill="#AED6F1" />
      <rect x="18" y="10" width="2" height="2" fill="#AED6F1" />
      <rect x="24" y="8" width="2" height="2" fill="#D4E6F1" />
      {/* Shore/edge */}
      <rect x="4" y="2" width="6" height="2" fill="#C4A574" />
      <rect x="22" y="2" width="6" height="2" fill="#C4A574" />
    </svg>
  );
}

// Pixel Art Small Pond
export function PixelPond({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 20 12" 
      className={cn("w-10 h-6", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pond water */}
      <rect x="4" y="2" width="12" height="2" fill="#5DADE2" />
      <rect x="2" y="4" width="16" height="4" fill="#3498DB" />
      <rect x="4" y="8" width="12" height="2" fill="#2980B9" />
      {/* Water sparkle */}
      <rect x="8" y="4" width="2" height="2" fill="#AED6F1" />
      {/* Lily pad */}
      <rect x="12" y="6" width="4" height="2" fill="#27AE60" />
    </svg>
  );
}

// Pixel Art Cessna-style Plane with Banner (banner trails behind)
export function PixelPlaneWithBanner({ className, bannerText = "LEARN AI!" }: { className?: string; bannerText?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      {/* Banner trailing behind - wavy flag style with wave animation */}
      <div 
        className="bg-[#FFD700] border-2 border-[#DAA520] px-4 py-1.5 -mr-1"
        style={{ 
          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 4px 50%)",
          animation: "flagWave 0.4s steps(2) infinite",
        }}
      >
        <span className="text-[#8B4513] font-bold text-sm whitespace-nowrap">{bannerText}</span>
      </div>
      
      {/* Banner rope */}
      <svg viewBox="0 0 24 8" className="w-6 h-2 -mr-1" style={{ imageRendering: "pixelated" }}>
        <rect x="0" y="3" width="24" height="2" fill="#8B4513" />
      </svg>
      
      {/* Cessna-style Plane */}
      <svg 
        viewBox="0 0 48 28" 
        className="w-24 h-14"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Fuselage (body) - white/cream */}
        <rect x="8" y="12" width="28" height="8" fill="#F5F5F5" />
        <rect x="6" y="14" width="4" height="4" fill="#E8E8E8" />
        <rect x="34" y="12" width="6" height="6" fill="#F5F5F5" />
        
        {/* Nose cone */}
        <rect x="38" y="14" width="4" height="4" fill="#E8E8E8" />
        <rect x="40" y="15" width="3" height="2" fill="#D0D0D0" />
        
        {/* Cockpit windows - blue */}
        <rect x="30" y="13" width="6" height="3" fill="#87CEEB" />
        <rect x="31" y="13" width="2" height="2" fill="#5CB8E8" />
        <rect x="34" y="13" width="2" height="2" fill="#5CB8E8" />
        
        {/* High wing (Cessna style - wing on top) */}
        <rect x="16" y="8" width="20" height="4" fill="#F5F5F5" />
        <rect x="14" y="9" width="4" height="2" fill="#E8E8E8" />
        <rect x="34" y="9" width="4" height="2" fill="#E8E8E8" />
        {/* Wing strut */}
        <rect x="22" y="12" width="2" height="2" fill="#888" />
        <rect x="28" y="12" width="2" height="2" fill="#888" />
        
        {/* Red stripe on fuselage */}
        <rect x="10" y="16" width="26" height="2" fill="#E74C3C" />
        
        {/* Tail section */}
        <rect x="4" y="10" width="6" height="2" fill="#F5F5F5" />
        <rect x="2" y="8" width="4" height="4" fill="#F5F5F5" />
        <rect x="0" y="6" width="4" height="4" fill="#E8E8E8" />
        {/* Horizontal stabilizer */}
        <rect x="2" y="18" width="8" height="2" fill="#F5F5F5" />
        
        {/* Propeller hub */}
        <rect x="43" y="14" width="3" height="4" fill="#444" />
        
        {/* Animated propeller */}
        <g style={{ transformOrigin: "45px 16px", animation: "spin 0.1s linear infinite" }}>
          <rect x="44" y="8" width="2" height="6" fill="#666" />
          <rect x="44" y="18" width="2" height="6" fill="#666" />
        </g>
        
        {/* Landing gear */}
        <rect x="18" y="20" width="2" height="4" fill="#555" />
        <rect x="16" y="24" width="6" height="2" fill="#333" />
        <rect x="30" y="20" width="2" height="4" fill="#555" />
        <rect x="28" y="24" width="6" height="2" fill="#333" />
      </svg>
    </div>
  );
}
