"use client";

import { useState } from "react";
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

  return (
    <div
      onMouseEnter={() => setShowExact(true)}
      onMouseLeave={() => setShowExact(false)}
      className="flex items-center gap-1 cursor-default"
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
    </div>
  );
}
