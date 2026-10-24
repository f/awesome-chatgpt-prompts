import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface TagLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Returns a real 404 for unknown tags. This runs before the loading.tsx
 * boundary below it starts streaming the page with a 200 status.
 */
export default async function TagLayout({ children, params }: TagLayoutProps) {
  const { slug } = await params;
  const tag = await db.tag.findUnique({ where: { slug }, select: { id: true } });

  if (!tag) {
    notFound();
  }

  return children;
}
