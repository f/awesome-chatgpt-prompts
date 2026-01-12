import { KidsHeader } from "@/components/kids/layout/kids-header";

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 dark:from-sky-950 dark:via-background dark:to-emerald-950">
      <KidsHeader />
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
