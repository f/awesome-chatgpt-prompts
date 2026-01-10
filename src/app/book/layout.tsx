import { BookSidebar } from "@/components/book/sidebar";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <BookSidebar />
        <div className="flex-1 min-w-0 lg:mr-64">
          <div className="max-w-3xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
