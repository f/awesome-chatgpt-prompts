"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ContributorAvatarProps {
  username: string;
}

export function ContributorAvatar({ username }: ContributorAvatarProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <Link
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      title={`@${username}`}
    >
      <Image
        src={`https://github.com/${username}.png`}
        alt=""
        width={32}
        height={32}
        className="rounded-full hover:ring-2 hover:ring-primary transition-all w-8 h-8"
        onError={() => setHasError(true)}
      />
    </Link>
  );
}
