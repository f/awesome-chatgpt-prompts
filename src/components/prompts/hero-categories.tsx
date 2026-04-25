"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeroCategories() {
  const t = useTranslations("heroIndustries");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/prompts?q=${encodeURIComponent(searchQuery.trim())}&ai=1`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <form onSubmit={handleSearch} className="w-full max-w-lg">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 text-base bg-background/80 backdrop-blur-md border-2 border-primary/30 rounded-xl shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>

      <div className="w-full max-w-lg aspect-video rounded-xl overflow-hidden border-2 border-primary/30 shadow-md bg-background/80 backdrop-blur-md">
        <iframe
          className="w-full h-full"
          src="https://www.youtube-nocookie.com/embed/T1Ay91zvkok?start=372"
          title={t("videoTitle")}
          loading="lazy"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}
