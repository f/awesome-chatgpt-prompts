"use client";

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedText({ children, className = "" }: AnimatedTextProps) {
  return (
    <span className="block overflow-visible">
      <span
        className={`animate-gradient-text ${className}`}
        style={{
          background: "linear-gradient(90deg, #3b82f6, #06b6d4, #10b981, #f97316, #ef4444, #3b82f6)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
          padding: "0.25em 0.15em",
          margin: "-0.25em -0.15em",
        }}
      >
        {children}
      </span>
    </span>
  );
}
