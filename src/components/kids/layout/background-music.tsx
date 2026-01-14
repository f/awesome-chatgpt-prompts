"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const MUSIC_ENABLED_KEY = "kids-music-enabled";
const MUSIC_VOLUME_KEY = "kids-music-volume";

// Shared audio instance and context for cross-component communication
interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicContext() {
  return useContext(MusicContext);
}

// Pixel art speaker icons
function PixelSpeakerOn() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="5" width="3" height="6" fill="currentColor" />
      <rect x="5" y="4" width="2" height="8" fill="currentColor" />
      <rect x="7" y="3" width="2" height="10" fill="currentColor" />
      <rect x="11" y="4" width="2" height="2" fill="currentColor" />
      <rect x="11" y="10" width="2" height="2" fill="currentColor" />
      <rect x="13" y="6" width="2" height="4" fill="currentColor" />
    </svg>
  );
}

function PixelSpeakerOff() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="5" width="3" height="6" fill="currentColor" />
      <rect x="5" y="4" width="2" height="8" fill="currentColor" />
      <rect x="7" y="3" width="2" height="10" fill="currentColor" />
      <rect x="11" y="4" width="2" height="2" fill="currentColor" />
      <rect x="13" y="6" width="2" height="2" fill="currentColor" />
      <rect x="11" y="10" width="2" height="2" fill="currentColor" />
      <rect x="13" y="10" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

// Provider component that manages the audio element
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedEnabled = localStorage.getItem(MUSIC_ENABLED_KEY);
    const savedVolume = localStorage.getItem(MUSIC_VOLUME_KEY);
    
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    
    // Default to enabled if not set
    if (savedEnabled === null || savedEnabled === "true") {
      setIsPlaying(true);
    }
  }, []);

  // Create and manage audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("/kids-music.mp3");
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    localStorage.setItem(MUSIC_ENABLED_KEY, isPlaying.toString());
    
    if (!audioRef.current) return;
    
    if (isPlaying && hasInteracted) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked, will retry on user interaction
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, hasInteracted]);

  // Listen for first user interaction to enable autoplay
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [isPlaying]);

  return (
    <MusicContext.Provider value={{ isPlaying, volume, setIsPlaying, setVolume, audioRef }}>
      {children}
    </MusicContext.Provider>
  );
}

export function MusicButton() {
  const context = useMusicContext();
  
  // Fallback for when not wrapped in provider
  const [localPlaying, setLocalPlaying] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const isPlaying = context?.isPlaying ?? localPlaying;
  const setIsPlaying = context?.setIsPlaying ?? setLocalPlaying;

  const toggleMusic = useCallback(() => {
    if (context) {
      context.setIsPlaying(!context.isPlaying);
    } else {
      // Fallback behavior
      if (!localAudioRef.current) {
        localAudioRef.current = new Audio("/kids-music.mp3");
        localAudioRef.current.loop = true;
        localAudioRef.current.volume = 0.3;
      }
      
      if (localPlaying) {
        localAudioRef.current.pause();
        setLocalPlaying(false);
      } else {
        localAudioRef.current.play().catch(() => {});
        setLocalPlaying(true);
      }
    }
  }, [context, localPlaying]);

  return (
    <button
      onClick={toggleMusic}
      className="pixel-btn pixel-btn-amber px-2 py-1.5 h-8 flex items-center"
      aria-label={isPlaying ? "Mute music" : "Play music"}
      title={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? <PixelSpeakerOn /> : <PixelSpeakerOff />}
    </button>
  );
}

// Volume slider component for settings
export function MusicVolumeSlider() {
  const context = useMusicContext();
  
  if (!context) return null;
  
  const { volume, setVolume, isPlaying, setIsPlaying } = context;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
            isPlaying 
              ? "bg-[#22C55E] text-white" 
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {isPlaying ? "🔊 On" : "🔇 Off"}
        </button>
        <span className="text-sm text-[#5D4037]">{Math.round(volume * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={volume * 100}
        onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
        className="w-full h-2 bg-[#D4A574] rounded-lg appearance-none cursor-pointer accent-[#8B4513]"
      />
    </div>
  );
}

// Legacy export for backwards compatibility
export function BackgroundMusic() {
  return null;
}
