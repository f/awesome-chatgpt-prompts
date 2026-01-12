"use client";

import { useState, useRef, useCallback } from "react";

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

// 8-bit chiptune music generator using Web Audio API
class ChiptunePlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;
  private step = 0;

  // Fun bouncy 8-bit melody - playful and catchy!
  private melody = [
    // Part 1: Bouncy intro
    523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0,       // C5 - E5 - G5 - E5 (bouncy)
    698.46, 0, 783.99, 0, 880.00, 783.99, 659.25, 0,  // F5 - G5 - A5 G5 E5 (climb up!)
    // Part 2: Silly descending
    783.99, 698.46, 659.25, 587.33, 523.25, 0, 392.00, 0,  // G5 F5 E5 D5 C5 - G4 (slide down)
    440.00, 493.88, 523.25, 0, 659.25, 0, 523.25, 0,  // A4 B4 C5 - E5 - C5 (pop back up)
    // Part 3: Playful jumps
    392.00, 523.25, 392.00, 523.25, 659.25, 783.99, 659.25, 0,  // G4 C5 G4 C5 E5 G5 E5 (jumping!)
    880.00, 0, 783.99, 0, 659.25, 523.25, 587.33, 659.25,  // A5 - G5 - E5 C5 D5 E5
    // Part 4: Fun ending
    783.99, 0, 659.25, 0, 523.25, 587.33, 659.25, 783.99,  // G5 - E5 - C5 D5 E5 G5
    880.00, 783.99, 659.25, 523.25, 392.00, 0, 523.25, 0,  // A5 G5 E5 C5 G4 - C5 (finish!)
  ];

  // Funky bass line - groovy!
  private bass = [
    // Part 1
    130.81, 0, 130.81, 164.81, 196.00, 0, 164.81, 0,  // C3 - C3 E3 G3 - E3
    174.61, 0, 196.00, 0, 220.00, 196.00, 164.81, 0,  // F3 - G3 - A3 G3 E3
    // Part 2
    196.00, 174.61, 164.81, 146.83, 130.81, 0, 98.00, 0,  // G3 F3 E3 D3 C3 - G2
    110.00, 123.47, 130.81, 0, 164.81, 0, 130.81, 0,  // A2 B2 C3 - E3 - C3
    // Part 3
    98.00, 130.81, 98.00, 130.81, 164.81, 196.00, 164.81, 0,  // G2 C3 G2 C3 E3 G3 E3
    220.00, 0, 196.00, 0, 164.81, 130.81, 146.83, 164.81,  // A3 - G3 - E3 C3 D3 E3
    // Part 4
    196.00, 0, 164.81, 0, 130.81, 146.83, 164.81, 196.00,  // G3 - E3 - C3 D3 E3 G3
    220.00, 196.00, 164.81, 130.81, 98.00, 0, 130.81, 0,  // A3 G3 E3 C3 G2 - C3
  ];

  async start() {
    if (this.isPlaying) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume audio context if suspended (required by browsers)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.2;
      this.masterGain.connect(this.audioContext.destination);
      this.isPlaying = true;
      this.step = 0;

      // Play notes at upbeat tempo
      this.intervalId = window.setInterval(() => this.playStep(), 150);
    } catch (error) {
      console.error("Failed to start audio:", error);
    }
  }

  private playStep() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const noteIndex = this.step % this.melody.length;

    // Play melody (square wave for 8-bit sound) - skip if 0 (rest)
    if (this.melody[noteIndex] > 0) {
      this.playNote(this.melody[noteIndex], now, 0.12, "square", 0.12);
    }
    
    // Play bass (triangle wave) - louder and deeper, skip if 0
    if (this.bass[noteIndex] > 0) {
      this.playNote(this.bass[noteIndex], now, 0.14, "triangle", 0.15);
      // Add sub-bass for extra punch
      this.playNote(this.bass[noteIndex] / 2, now, 0.14, "sine", 0.08);
    }

    // Aggressive dubstep-style percussion
    if (this.step % 8 === 0) {
      this.playDrum(now, "kick");
      this.playDrum(now + 0.15, "kick"); // Double kick
    } else if (this.step % 8 === 4) {
      this.playDrum(now, "snare");
    } else if (this.step % 2 === 1) {
      this.playDrum(now, "hihat");
    }
    
    // Wobble bass on every other beat for dubstep feel
    if (this.step % 4 === 2) {
      this.playWobble(now);
    }

    this.step++;
  }

  private playNote(freq: number, time: number, duration: number, type: OscillatorType, volume: number) {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  private playDrum(time: number, type: "kick" | "hihat" | "snare" = "hihat") {
    if (!this.audioContext || !this.masterGain) return;

    if (type === "kick") {
      // Heavy dubstep kick - deep and punchy
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
      
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(time);
      osc.stop(time + 0.2);
      
      // Add click for attack
      const click = this.audioContext.createOscillator();
      const clickGain = this.audioContext.createGain();
      click.type = "square";
      click.frequency.value = 800;
      clickGain.gain.setValueAtTime(0.15, time);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start(time);
      click.stop(time + 0.02);
      
    } else if (type === "snare") {
      // Aggressive dubstep snare - noise + tone
      const bufferSize = this.audioContext.sampleRate * 0.15;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const noiseGain = this.audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.3, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 3000;
      filter.Q.value = 1;
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      
      noise.start(time);
      noise.stop(time + 0.15);
      
      // Add tone body
      const tone = this.audioContext.createOscillator();
      const toneGain = this.audioContext.createGain();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(200, time);
      tone.frequency.exponentialRampToValueAtTime(100, time + 0.05);
      toneGain.gain.setValueAtTime(0.2, time);
      toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      tone.connect(toneGain);
      toneGain.connect(this.masterGain);
      tone.start(time);
      tone.stop(time + 0.08);
      
    } else {
      // Hi-hat - crispy noise
      const bufferSize = this.audioContext.sampleRate * 0.04;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 9000;
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      noise.start(time);
      noise.stop(time + 0.04);
    }
  }

  private playWobble(time: number) {
    if (!this.audioContext || !this.masterGain) return;

    // Classic dubstep wobble bass
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.value = 55; // Low A
    
    // LFO for wobble effect
    lfo.type = "sine";
    lfo.frequency.value = 8; // Wobble speed
    lfoGain.gain.value = 400;
    
    lfo.connect(lfoGain);
    
    // Create filter for wobble
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    filter.Q.value = 8;
    
    lfoGain.connect(filter.frequency);
    
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    lfo.start(time);
    osc.start(time);
    lfo.stop(time + 0.3);
    osc.stop(time + 0.3);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isPlaying = false;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export function MusicButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ChiptunePlayer | null>(null);

  const toggleMusic = useCallback(async () => {
    if (!playerRef.current) {
      playerRef.current = new ChiptunePlayer();
    }

    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
    } else {
      await playerRef.current.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

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

// Legacy export for backwards compatibility
export function BackgroundMusic() {
  return null;
}
