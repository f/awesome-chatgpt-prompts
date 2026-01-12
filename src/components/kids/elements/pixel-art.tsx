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

// Pixel Art Robot (Promi)
export function PixelRobot({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 16 20" 
      className={cn("w-8 h-10", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#FFD700" />
      <rect x="6" y="2" width="4" height="2" fill="#C0C0C0" />
      {/* Head */}
      <rect x="2" y="4" width="12" height="8" fill="#4A90D9" />
      <rect x="4" y="6" width="3" height="3" fill="white" />
      <rect x="9" y="6" width="3" height="3" fill="white" />
      <rect x="5" y="7" width="2" height="2" fill="#333" />
      <rect x="10" y="7" width="2" height="2" fill="#333" />
      <rect x="6" y="10" width="4" height="2" fill="#333" />
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
