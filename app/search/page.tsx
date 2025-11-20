import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}): Promise<Metadata> {
  // Await the searchParams object first
  const params = await searchParams;
  const query = params.query || "Search";

  return {
    title: query, // root layout adds " – Nice Card"
    description: query
      ? `Find ${query} templates for your design needs. Browse professional templates and designs.`
      : "Search for templates across all categories. Find the perfect design for your project.",
    openGraph: {
      title: query ? `${query} - Templates` : "Search Templates",
      description: query
        ? `Discover ${query} templates`
        : "Search for professional templates",
    },
    robots: {
      index: true, // Allow indexing
      follow: true, // Allow following links
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6">
        {/* Skeleton content */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-14 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            Loading search...
          </p>
        </div>
      </div>
    </div>
  );
}
