import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { escapeLikePattern } from "@/lib/utils";

interface UserProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

/**
 * Returns a real 404 for unknown users and for any other top-level path this
 * catch-all segment receives. This runs before the loading.tsx boundary below
 * it starts streaming the page with a 200 status.
 */
export default async function UserProfileLayout({ children, params }: UserProfileLayoutProps) {
  const { username: rawUsername } = await params;
  const decodedUsername = decodeURIComponent(rawUsername);

  // Only support /@username format
  if (!decodedUsername.startsWith("@")) {
    notFound();
  }

  const user = await db.user.findFirst({
    where: { username: { equals: escapeLikePattern(decodedUsername.slice(1)), mode: "insensitive" } },
    select: { id: true },
  });

  if (!user) {
    notFound();
  }

  return children;
}
