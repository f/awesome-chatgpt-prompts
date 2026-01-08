"use client";

import Link from "next/link";
import Image from "next/image";
import { analyticsSponsor } from "@/lib/analytics";

interface SponsorLinkProps {
  name: string;
  url: string;
  logo: string;
  darkLogo?: string;
  className?: string;
}

export function SponsorLink({ name, url, logo, darkLogo, className }: SponsorLinkProps) {
  const handleClick = () => {
    analyticsSponsor.click(name, url);
  };

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="opacity-60 hover:opacity-100 transition-opacity"
      onClick={handleClick}
    >
      {darkLogo ? (
        <>
          <Image
            src={logo}
            alt={name}
            width={120}
            height={40}
            className={`h-9 w-auto dark:hidden ${className || ''}`}
          />
          <Image
            src={darkLogo}
            alt={name}
            width={120}
            height={40}
            className={`h-9 w-auto hidden dark:block ${className || ''}`}
          />
        </>
      ) : (
        <Image
          src={logo}
          alt={name}
          width={120}
          height={40}
          className={`h-9 w-auto dark:invert ${className || ''}`}
        />
      )}
    </Link>
  );
}

interface BecomeSponsorLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function BecomeSponsorLink({ href, children, className }: BecomeSponsorLinkProps) {
  const handleClick = () => {
    analyticsSponsor.becomeSponsorClick();
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

interface BuiltWithLinkProps {
  href: string;
  toolName: string;
  children: React.ReactNode;
}

export function BuiltWithLink({ href, toolName, children }: BuiltWithLinkProps) {
  const handleClick = () => {
    analyticsSponsor.builtWithClick(toolName);
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
