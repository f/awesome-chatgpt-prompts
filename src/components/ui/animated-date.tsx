"use client";

import { useState, useCallback } from "react";
import { Calendar } from "lucide-react";

interface AnimatedDateProps {
  date: Date;
  relativeText: string;
  locale?: string;
}

export function AnimatedDate({ date, relativeText, locale = "en" }: AnimatedDateProps) {
  const [showExact, setShowExact] = useState(false);

  const exactDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const handleClick = useCallback(() => {
    if (showExact) return;
    
    setShowExact(true);
    setTimeout(() => {
      setShowExact(false);
    }, 2000);
  }, [showExact]);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
    >
      <Calendar className="h-4 w-4" />
      <span className="relative overflow-hidden h-5 text-left">
        <span
          className={`block transition-transform duration-300 ease-in-out ${
            showExact ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          {relativeText}
        </span>
        <span
          className={`block transition-transform duration-300 ease-in-out ${
            showExact ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          {exactDate}
        </span>
      </span>
    </button>
  );
}
