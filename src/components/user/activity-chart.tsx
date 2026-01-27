"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  locale?: string;
  selectedDate?: string;
  onDateClick?: (date: string | null) => void;
}

export function ActivityChart({ data, locale = "en", selectedDate, onDateClick }: ActivityChartProps) {
  const t = useTranslations("user");
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate weeks based on screen size (6 months for mobile, 12 for desktop)
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const weeks: { date: Date; count: number }[][] = [];
    const dataMap = new Map(data.map((d) => [d.date, d.count]));

    // 26 weeks (~6 months) for mobile, 52 weeks (~12 months) for desktop
    const daysBack = isMobile ? 182 : 364;
    
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysBack);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: { date: Date; count: number }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      currentWeek.push({
        date: new Date(currentDate),
        count: dataMap.get(dateStr) || 0,
      });

      if (currentDate.getDay() === 6 || currentDate.getTime() === today.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Calculate month labels
    const allMonths: { label: string; colStart: number; month: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          allMonths.push({
            label: firstDay.date.toLocaleDateString(locale, { month: "short" }),
            colStart: weekIndex,
            month,
          });
          lastMonth = month;
        }
      }
    });

    // Filter out overlapping labels - when two are too close, keep the second one
    const months: { label: string; colStart: number }[] = [];
    for (let i = 0; i < allMonths.length; i++) {
      const current = allMonths[i];
      const next = allMonths[i + 1];
      
      // If next month is too close (< 4 columns), skip current and show next instead
      if (next && next.colStart - current.colStart < 4) {
        continue;
      }
      months.push({ label: current.label, colStart: current.colStart });
    }

    return { weeks, months };
  }, [data, locale, isMobile]);

  // Calculate max count for intensity scaling
  const maxCount = useMemo(() => {
    return Math.max(1, ...data.map((d) => d.count));
  }, [data]);

  // Get intensity level (0-4) based on count
  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  // Total contributions in visible range
  const totalContributions = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (isMobile ? 182 : 364));
    return data
      .filter((d) => new Date(d.date) >= cutoffDate)
      .reduce((sum, d) => sum + d.count, 0);
  }, [data, isMobile]);

  const dayLabels = ["", "M", "", "W", "", "F", ""];

  return (
    <div className="w-full flex flex-col items-center md:items-start">
      <div className="text-sm text-muted-foreground mb-3">
        {totalContributions} {totalContributions === 1 ? t("contribution") : t("contributionsPlural")} {isMobile ? t("inLast6Months") : t("inLastYear")}
      </div>

      <div className="inline-block">
        {/* Month labels */}
        <div className="relative flex text-xs text-muted-foreground mb-1 ml-5 h-4">
          {months.map((month, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: `${month.colStart * 12}px` }}
            >
              {month.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[10px] leading-[10px] text-[9px]">
                {label}
              </div>
            ))}
          </div>

          {/* Activity grid */}
          <TooltipProvider delayDuration={100}>
          <div className="flex gap-0.5">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week.find((d) => d.date.getDay() === dayIndex);
                  const intensity = day ? getIntensity(day.count) : 0;
                  const isToday = day?.date.toDateString() === new Date().toDateString();
                  const isFuture = day && day.date > new Date();

                  if (!day || isFuture) {
                    return <div key={dayIndex} className="w-[10px] h-[10px]" />;
                  }

                  const dateStr = day.date.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;

                  const handleClick = () => {
                    if (onDateClick) {
                      // Toggle selection - if already selected, clear it
                      onDateClick(isSelected ? null : dateStr);
                    }
                  };

                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={handleClick}
                          className={`
                            w-[10px] h-[10px] rounded-full transition-all cursor-pointer
                            ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""}
                            ${isSelected ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-125" : ""}
                            ${
                              intensity === 0
                                ? "bg-muted"
                                : intensity === 1
                                ? "bg-primary/20"
                                : intensity === 2
                                ? "bg-primary/40"
                                : intensity === 3
                                ? "bg-primary/70"
                                : "bg-primary"
                            }
                          `}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {day.count} {day.count === 1 ? t("contribution") : t("contributionsPlural")}
                        </p>
                        <p className="text-muted-foreground">
                          {day.date.toLocaleDateString(locale, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </TooltipProvider>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground justify-end">
          <span>{t("less")}</span>
          <div className="w-[10px] h-[10px] rounded-full bg-muted" />
          <div className="w-[10px] h-[10px] rounded-full bg-primary/20" />
          <div className="w-[10px] h-[10px] rounded-full bg-primary/40" />
          <div className="w-[10px] h-[10px] rounded-full bg-primary/70" />
          <div className="w-[10px] h-[10px] rounded-full bg-primary" />
          <span>{t("more")}</span>
        </div>
      </div>
    </div>
  );
}
