"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function InteractiveBookBanner() {
  const t = useTranslations("promptWritingGuide.interactiveBanner");
  const BOOK_WIDTH = 120;
  const BOOK_HEIGHT = 173;
  const BOOK_DEPTH = 15;

  return (
    <div className="mb-8 border rounded-[var(--radius)] overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <style>{`
        @keyframes bookFlip {
          0%   { transform: rotateY(0deg); }
          30%  { transform: rotateY(18deg); }
          50%  { transform: rotateY(18deg); }
          80%  { transform: rotateY(-18deg); }
          100% { transform: rotateY(-18deg); }
        }
        @keyframes bookReturn {
          0%   { transform: rotateY(-18deg); }
          100% { transform: rotateY(0deg); }
        }
        @keyframes lightGlow {
          0%   { opacity: 0; }
          30%  { opacity: 0.25; }
          50%  { opacity: 0.2; }
          80%  { opacity: 0.35; }
          100% { opacity: 0.3; }
        }
        @keyframes lightFade {
          0%   { opacity: 0.3; }
          100% { opacity: 0; }
        }
        .banner-book-3d-anim {
          animation: bookReturn 0.5s ease-out forwards;
        }
        .banner-book-3d-anim:hover {
          animation: bookFlip 2.5s ease-in-out forwards;
        }
        .banner-light-anim {
          animation: lightFade 0.5s ease-out forwards;
        }
        .banner-book-3d-anim:hover .banner-light-anim {
          animation: lightGlow 2.5s ease-in-out forwards;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 3D Book */}
        <Link
          href="https://fka.gumroad.com/l/art-of-chatgpt-prompting"
          className="shrink-0"
          style={{ perspective: "800px" }}
        >
          <div
            className="banner-book-3d-anim relative"
            style={{
              width: BOOK_WIDTH,
              height: BOOK_HEIGHT,
              transformStyle: "preserve-3d",
            }}
          >
            {/* FRONT: Book Cover */}
            <div className="absolute inset-0 rounded-sm shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="/book-cover.jpg"
                alt="The Interactive Book of Prompting"
                fill
                className="object-cover"
              />
              {/* Subtle radial light glow from top-right */}
              <div
                className="banner-light-anim absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)",
                }}
              />
            </div>

            {/* Drop shadow under book */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/20 blur-md rounded-full opacity-50" />

            {/* RIGHT: Pages edge */}
            <div
              className="absolute top-0"
              style={{
                width: BOOK_DEPTH,
                height: BOOK_HEIGHT,
                right: 0,
                transform: "rotateY(-90deg)",
                transformOrigin: "right center",
                background:
                  "repeating-linear-gradient(to bottom, #f8f8f8 0px, #e0e0e0 1px, #f8f8f8 2px)",
              }}
            />

            {/* LEFT: Spine edge */}
            <div
              className="absolute top-0 rounded-l-sm"
              style={{
                width: BOOK_DEPTH,
                height: BOOK_HEIGHT,
                left: 0,
                transform: "rotateY(90deg)",
                transformOrigin: "left center",
                background: "linear-gradient(to right, #1a3535, #234848)",
              }}
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {t("badge")}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("description")}
          </p>
          <Button asChild size="sm">
            <Link href="https://fka.gumroad.com/l/art-of-chatgpt-prompting">
              <BookOpen className="mr-2 h-4 w-4" />
              {t("cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
