"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Star, GitFork, Users, FileText, Terminal, Bot, Cpu } from "lucide-react";

// ─── Animated Counter ───────────────────────────────────────────────
function AnimatedNumber({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSlide() {
  const stats = [
    { icon: Star, label: "GitHub Stars", value: 145000, suffix: "+", color: "text-yellow-500" },
    { icon: FileText, label: "Community Prompts", value: 1000, suffix: "+", color: "text-blue-500" },
    { icon: Users, label: "Contributors", value: 300, suffix: "+", color: "text-green-500" },
    { icon: GitFork, label: "Forks", value: 19200, suffix: "+", color: "text-purple-500" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-12 leading-normal text-foreground">
        By the Numbers
      </h1>
      <div className="grid grid-cols-2 gap-8 md:gap-12 w-full max-w-4xl">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center p-6 md:p-8 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
          >
            <stat.icon className={cn("w-8 h-8 md:w-10 md:h-10 mb-4", stat.color)} />
            <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              <AnimatedNumber target={stat.value} suffix={stat.suffix} />
            </span>
            <span className="text-sm md:text-lg text-muted-foreground mt-2 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline ───────────────────────────────────────────────────────
const timelineEvents = [
  { year: "Dec 2022", title: "The Repository", description: "Awesome ChatGPT Prompts created on GitHub — a curated collection of effective prompts. Endorsed by OpenAI co-founder Greg Brockman", color: "bg-blue-500" },
  { year: "2024", title: "UI Renewal", description: "Major UI update built with AI coding assistants. GitHub Copilot support.", color: "bg-orange-500" },
  { year: "2026", title: "The Platform", description: "Full-featured platform with Next.js — user accounts, typed prompts, change requests, the Prompting Book & self-hosting", color: "bg-purple-500" },
  { year: "2026", title: "Agentic Future", description: "Agent skills, MCP integration, workflows, and prompt-as-code standard", color: "bg-primary" },
];

export function TimelineSlide() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= timelineEvents.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center h-full">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-normal text-foreground">
        Our Journey
      </h1>
      <div className="relative ml-2">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {timelineEvents.map((event, i) => (
            <div
              key={event.year}
              className={cn(
                "flex items-start gap-5 transition-all duration-700 ease-out",
                i < visibleCount ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              )}
            >
              <div className={cn("w-6 h-6 rounded-full flex-shrink-0 z-10 ring-4 ring-background", event.color)} />
              <div className="-mt-0.5">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{event.year}</span>
                <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{event.title}</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-snug">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Typed Prompts Demo ─────────────────────────────────────────────
const imageCodeLines = [
  { text: 'import { image } from "prompts.chat";', color: "text-muted-foreground" },
  { text: "", color: "" },
  { text: "const prompt = image()", color: "text-blue-400" },
  { text: '  .subject("a lone samurai")', color: "text-green-400" },
  { text: '  .environment("bamboo forest at dawn")', color: "text-green-400" },
  { text: '  .shot("wide")', color: "text-cyan-400" },
  { text: '  .lens("35mm")', color: "text-cyan-400" },
  { text: '  .angle("low-angle")', color: "text-cyan-400" },
  { text: '  .lightingType("rim")', color: "text-yellow-400" },
  { text: '  .timeOfDay("golden-hour")', color: "text-yellow-400" },
  { text: '  .medium("cinematic")', color: "text-purple-400" },
  { text: "  .build();", color: "text-blue-400" },
];

const typeErrorLines = [
  { text: "// Type-safe — catches errors at build time!", color: "text-muted-foreground" },
  { text: "", color: "" },
  { text: "image()", color: "text-blue-400" },
  { text: '  .shot("ultra-zoom")', color: "text-red-400", isError: true },
  { text: "//       ^^^^^^^^^^^", color: "text-red-500", isAnnotation: true },
  { text: '// TypeError: "ultra-zoom" is not assignable', color: "text-red-500", isAnnotation: true },
  { text: '// to type ShotType.', color: "text-red-500", isAnnotation: true },
  { text: "// Expected: \"extreme-close-up\" | \"close-up\"", color: "text-red-500/70", isAnnotation: true },
  { text: "// | \"medium\" | \"wide\" | \"extreme-wide\" | ...", color: "text-red-500/70", isAnnotation: true },
];

export function TypedPromptsDemoSlide() {
  const [visibleCode, setVisibleCode] = useState(0);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (visibleCode < imageCodeLines.length) {
      const t = setTimeout(() => setVisibleCode((v) => v + 1), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowError(true), 600);
    return () => clearTimeout(t);
  }, [visibleCode]);

  return (
    <div className="flex flex-col justify-center h-full">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 leading-normal text-foreground">
        Typed Prompts SDK
      </h1>
      <p className="text-base md:text-lg text-muted-foreground mb-6">
        <span className="font-mono bg-muted px-2 py-0.5 rounded text-primary">npm install prompts.chat</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
        {/* Image builder code panel */}
        <div className="bg-muted/50 border border-border rounded-xl p-4 md:p-5 font-mono text-xs md:text-sm">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-sans font-bold">Image Builder</div>
          {imageCodeLines.slice(0, visibleCode).map((line, i) => (
            <div key={i} className={cn("leading-relaxed", line.color || "h-3")}>
              {line.text}
              {i === visibleCode - 1 && visibleCode < imageCodeLines.length && (
                <span className="animate-pulse text-primary">|</span>
              )}
            </div>
          ))}
        </div>
        {/* Type error panel */}
        <div className={cn(
          "border rounded-xl p-4 md:p-5 font-mono text-xs md:text-sm transition-all duration-500",
          showError ? "opacity-100 translate-y-0 bg-red-500/5 border-red-500/30" : "opacity-0 translate-y-4 bg-muted/50 border-border"
        )}>
          <div className={cn(
            "text-xs uppercase tracking-wider mb-3 font-sans font-bold transition-colors duration-500",
            showError ? "text-red-500" : "text-muted-foreground"
          )}>
            Type Error
          </div>
          {showError && typeErrorLines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "leading-relaxed transition-all duration-300",
                line.color || "h-3",
                line.isError && "underline decoration-wavy decoration-red-500 underline-offset-4",
              )}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Model Comparison Bar Chart ─────────────────────────────────────
const models = [
  { name: "1.8T params", promptNeed: 40, color: "bg-emerald-500", icon: Bot },
  { name: "~1T params", promptNeed: 45, color: "bg-blue-500", icon: Bot },
  { name: "8B params", promptNeed: 75, color: "bg-orange-500", icon: Cpu },
  { name: "3.8B params", promptNeed: 90, color: "bg-red-500", icon: Cpu },
  { name: "2B params", promptNeed: 95, color: "bg-purple-500", icon: Cpu },
];

export function ModelComparisonSlide() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col justify-center h-full">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-normal text-foreground">
        Prompt Quality Impact
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-10">
        Smaller models need <span className="text-primary font-semibold">significantly better prompts</span> to produce quality output
      </p>
      <div className="space-y-5 max-w-4xl">
        {models.map((model, i) => (
          <div key={model.name} className="flex items-center gap-4">
            <div className="w-28 md:w-36 flex items-center gap-2 flex-shrink-0">
              <model.icon className="w-5 h-5 text-muted-foreground" />
              <div className="text-sm md:text-base font-semibold text-foreground">{model.name}</div>
            </div>
            <div className="flex-1 h-10 md:h-12 bg-muted rounded-lg overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-lg flex items-center justify-end pr-3 transition-all ease-out",
                  model.color
                )}
                style={{
                  width: animated ? `${model.promptNeed}%` : "0%",
                  transitionDuration: `${800 + i * 200}ms`,
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <span className="text-white text-xs md:text-sm font-bold">{model.promptNeed}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground max-w-4xl">
        <span>← Less dependent on prompt quality</span>
        <span>More dependent on prompt quality →</span>
      </div>
    </div>
  );
}

// ─── Feature Showcase Grid ──────────────────────────────────────────
interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  { icon: <FileText className="w-6 h-6" />, title: "Typed Prompts", description: "Structured inputs & outputs" },
  { icon: <Terminal className="w-6 h-6" />, title: "Agent Skills", description: "Multi-file AI capabilities" },
  { icon: <GitFork className="w-6 h-6" />, title: "Change Requests", description: "PRs for prompts" },
  { icon: <Users className="w-6 h-6" />, title: "Promptmasters", description: "Community leaderboard" },
  { icon: <Cpu className="w-6 h-6" />, title: "MCP Integration", description: "Tool-aware prompts" },
  { icon: <Bot className="w-6 h-6" />, title: "AI Search", description: "Semantic discovery" },
];

export function FeatureShowcaseSlide() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealed((prev) => {
        if (prev >= features.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-12 leading-normal text-foreground">
        Platform Features
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={cn(
              "flex flex-col items-center text-center p-6 rounded-2xl border border-border transition-all duration-500 ease-out",
              i < revealed
                ? "opacity-100 translate-y-0 bg-muted/40 scale-100"
                : "opacity-0 translate-y-8 scale-90"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              {feature.icon}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground">{feature.title}</h3>
            <p className="text-sm md:text-base text-muted-foreground mt-1">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
