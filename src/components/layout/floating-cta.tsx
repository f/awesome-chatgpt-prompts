"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FloatingCTAProps {
  isOAuth: boolean;
  showRegisterButton: boolean;
  logo: string;
  logoDark?: string;
  brandName: string;
}

export function FloatingCTA({ isOAuth, showRegisterButton, logo, logoDark, brandName }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const tHomepage = useTranslations("homepage");
  const tNav = useTranslations("nav");

  useEffect(() => {
    // Check if user previously dismissed this
    const dismissed = sessionStorage.getItem("floating-cta-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    // Observer for bottom CTA
    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        // Show floating CTA when bottom CTA is not visible AND hero is not visible
        setIsVisible(!entry.isIntersecting && !isHeroVisible);
      },
      {
        threshold: 0.1,
      }
    );

    // Observer for hero section
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
        // Update visibility based on both hero and bottom CTA
        const bottomCTA = document.querySelector("[data-bottom-cta]");
        if (bottomCTA) {
          const bottomRect = bottomCTA.getBoundingClientRect();
          const isBottomVisible = bottomRect.top < window.innerHeight && bottomRect.bottom > 0;
          setIsVisible(!entry.isIntersecting && !isBottomVisible);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const bottomCTA = document.querySelector("[data-bottom-cta]");
    const heroSection = document.querySelector("[data-hero-section]");
    
    if (bottomCTA) {
      bottomObserver.observe(bottomCTA);
    }
    
    if (heroSection) {
      heroObserver.observe(heroSection);
    }

    return () => {
      if (bottomCTA) {
        bottomObserver.unobserve(bottomCTA);
      }
      if (heroSection) {
        heroObserver.unobserve(heroSection);
      }
    };
  }, [isHeroVisible]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("floating-cta-dismissed", "true");
  };

  if (!showRegisterButton || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Outer glow layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent blur-2xl rounded-lg -m-4 animate-pulse" />
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-primary/15 blur-xl rounded-lg" />
      
      <div className="relative flex items-center gap-3 p-4 pr-5 rounded-lg border border-primary/40 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl backdrop-blur-sm hover:border-primary/60 hover:shadow-primary/50 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 absolute -top-2 -right-2 rounded-full bg-background border border-primary/40 shadow-sm hover:bg-muted hover:border-primary/60"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Logo with glow */}
          <div className="relative animate-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-primary/20 blur-lg rounded-full opacity-75 animate-pulse" />
            <Image
              src={logo}
              alt={brandName}
              width={40}
              height={40}
              className="relative h-10 w-10 dark:hidden"
            />
            <Image
              src={logoDark || logo}
              alt={brandName}
              width={40}
              height={40}
              className="relative h-10 w-10 hidden dark:block"
            />
          </div>
          
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{tHomepage("readyToStart")}</p>
            <p className="text-xs text-muted-foreground">{tHomepage("freeAndOpen")}</p>
          </div>
          
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 shadow-lg">
            <Link href={isOAuth ? "/login" : "/register"}>
              {isOAuth ? tNav("login") : tHomepage("createAccount")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
