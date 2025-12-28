"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ActivityChart } from "./activity-chart";

interface ActivityChartWrapperProps {
  data: { date: string; count: number }[];
  locale?: string;
}

export function ActivityChartWrapper({ data, locale }: ActivityChartWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams?.get("date") || undefined;

  const handleDateClick = useCallback((date: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (date) {
      params.set("date", date);
      params.delete("page"); // Reset to page 1 when filtering
    } else {
      params.delete("date");
    }
    
    // Always switch to prompts tab when filtering by date
    if (date) {
      params.set("tab", "prompts");
    }
    
    const newUrl = `?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  return (
    <ActivityChart
      data={data}
      locale={locale}
      selectedDate={selectedDate}
      onDateClick={handleDateClick}
    />
  );
}
