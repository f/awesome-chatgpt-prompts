import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Returns a real 404 for unknown categories. This runs before the loading.tsx
 * boundary below it starts streaming the page with a 200 status.
 */
export default async function CategoryLayout({ children, params }: CategoryLayoutProps) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug }, select: { id: true } });

  if (!category) {
    notFound();
  }

  return children;
}
