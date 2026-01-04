"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  "teachers",
  "developers",
  "marketers",
  "designers",
  "writers",
  "analysts",
  "entrepreneurs",
  "researchers",
  "students",
  "consultants",
  "engineers",
  "creators",
  "lawyers",
  "doctors",
  "nurses",
  "accountants",
  "salespeople",
  "recruiters",
  "managers",
  "executives",
  "freelancers",
  "photographers",
  "musicians",
  "artists",
  "architects",
  "scientists",
  "journalists",
  "editors",
  "translators",
  "coaches",
  "therapists",
  "trainers",
  "chefs",
  "realtors",
  "investors",
  "traders",
];

const INDUSTRY_KEYWORDS: Record<string, string> = {
  teachers: "teach,learn,education,lesson,classroom",
  developers: "code,programming,software,debug,api",
  marketers: "marketing,campaign,brand,seo,content",
  designers: "design,ui,ux,creative,visual",
  writers: "write,content,blog,article,copywriting",
  analysts: "data,analysis,report,metrics,insights",
  entrepreneurs: "startup,business,pitch,strategy,growth",
  researchers: "research,study,academic,paper,hypothesis",
  students: "study,homework,essay,exam,learning",
  consultants: "consulting,advice,strategy,client,solution",
  engineers: "engineering,technical,system,architecture,build",
  creators: "content,video,social,creative,audience",
  lawyers: "legal,law,contract,compliance,court",
  doctors: "medical,health,diagnosis,patient,treatment",
  nurses: "nursing,patient,care,health,clinical",
  accountants: "accounting,finance,tax,budget,audit",
  salespeople: "sales,deal,pitch,customer,negotiation",
  recruiters: "hiring,recruitment,interview,candidate,talent",
  managers: "management,team,project,leadership,planning",
  executives: "executive,leadership,strategy,decision,board",
  freelancers: "freelance,client,proposal,contract,invoice",
  photographers: "photography,photo,shoot,editing,camera",
  musicians: "music,song,composition,audio,production",
  artists: "art,creative,illustration,painting,portfolio",
  architects: "architecture,design,building,plan,structure",
  scientists: "science,experiment,research,hypothesis,data",
  journalists: "journalism,news,article,interview,story",
  editors: "editing,review,proofread,content,revision",
  translators: "translation,language,localization,interpret",
  coaches: "coaching,motivation,goals,performance,mindset",
  therapists: "therapy,mental,counseling,wellness,support",
  trainers: "training,fitness,workout,exercise,program",
  chefs: "cooking,recipe,food,kitchen,culinary",
  realtors: "real estate,property,listing,home,market",
  investors: "investment,portfolio,stocks,returns,market",
  traders: "trading,market,stocks,analysis,strategy",
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function HeroCategories() {
  const t = useTranslations("heroIndustries");
  const router = useRouter();
  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [changingIdx, setChangingIdx] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastChangedIdx, setLastChangedIdx] = useState<number | null>(null);

  const getRandomItems = useCallback(() => {
    return shuffleArray(INDUSTRIES).slice(0, 9);
  }, []);

  useEffect(() => {
    setVisibleItems(getRandomItems());
  }, [getRandomItems]);

  useEffect(() => {
    if (visibleItems.length === 0) return;

    const interval = setInterval(() => {
      // Pick a random position to change (not the same as last time)
      let randomPosition = Math.floor(Math.random() * 9);
      while (randomPosition === lastChangedIdx) {
        randomPosition = Math.floor(Math.random() * 9);
      }
      setChangingIdx(randomPosition);
      setLastChangedIdx(randomPosition);

      setTimeout(() => {
        setVisibleItems(prev => {
          const newItems = [...prev];
          // Find an industry not currently visible
          const available = INDUSTRIES.filter(ind => !prev.includes(ind));
          if (available.length > 0) {
            newItems[randomPosition] = available[Math.floor(Math.random() * available.length)];
          } else {
            // If all are visible, just pick a random one
            newItems[randomPosition] = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
          }
          return newItems;
        });
        
        // Flash the cell
        setIsFlashing(true);
        setTimeout(() => {
          setIsFlashing(false);
          setChangingIdx(null);
        }, 400);
      }, 200);
    }, 1500);

    return () => clearInterval(interval);
  }, [visibleItems.length, lastChangedIdx]);

  const handleClick = (industry: string) => {
    const keywords = INDUSTRY_KEYWORDS[industry] || industry;
    router.push(`/prompts?q=${encodeURIComponent(keywords)}&ai=1`);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-lg text-muted-foreground">{t("prefix")}</p>
      
      <div className="grid grid-cols-3 border border-border/50 rounded-lg overflow-hidden backdrop-blur-md bg-background/50">
        {visibleItems.map((industry, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(industry)}
            className={cn(
              "w-40 px-4 py-3 text-sm font-medium whitespace-nowrap truncate",
              "hover:bg-primary hover:text-primary-foreground",
              "cursor-pointer transition-all duration-200",
              "border-r border-b border-border",
              "[&:nth-child(3n)]:border-r-0",
              "[&:nth-child(n+7)]:border-b-0",
              changingIdx === idx && !isFlashing && "opacity-0 scale-95",
              changingIdx === idx && isFlashing 
                ? "bg-primary/40 scale-105" 
                : "bg-muted/30"
            )}
          >
            {t(industry)}
          </button>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">{t("clickToExplore")}</p>
    </div>
  );
}
