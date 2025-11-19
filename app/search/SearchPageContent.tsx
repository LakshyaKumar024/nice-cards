"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/template-card";
import Link from "next/link";

export interface Template {
  uuid: string;
  name: string;
  description: string;
  price: number;
  catogery: string;
  image: string;
  editable_fields: Array<{
    label: string;
    type: string;
    required: boolean;
  }>;
  rating: number;
  downloads: number;
  created_at: string;
  isPurchased: boolean;
  tags: string[];
}

export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState<string>(queryFromUrl);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Initialize loading based on whether there's a query
  const [loading, setLoading] = useState<boolean>(!!queryFromUrl);

  useEffect(() => {
    if (!queryFromUrl) {
      // No need to set loading to false here since we initialized it properly
      return;
    }
    
    const getQuery = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ query: queryFromUrl }),
        });
        
        const data = await response.json();
        setTemplates(data.data || []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    getQuery();
  }, [queryFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePurchase = () => {};

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-sm border-2 focus:border-primary transition-colors w-full"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="px-4 sm:px-8 py-5 sm:py-6 rounded-xl text-base sm:text-lg font-semibold"
            >
              <Search className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </form>
        </div>

        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Search Results
            {queryFromUrl && (
              <> for <span className="text-primary">&quot;{queryFromUrl}&quot;</span></>
            )}
          </h1>
          <p className="text-muted-foreground">
            {loading
              ? "Searching..."
              : queryFromUrl
              ? `Found ${templates.length} template${templates.length !== 1 ? "s" : ""}`
              : "Enter a search term to find templates"}
          </p>
        </div>

        {/* Templates Grid */}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {templates.map((template) => (
              <TemplateCard
                key={template.uuid}
                uuid={template.uuid}
                name={template.name}
                description={template.description || ""}
                price={template.price}
                category={template.catogery}
                imageUrl={template.image}
                isPurchased={template.isPurchased}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-lg text-muted-foreground">
              Searching for templates...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && queryFromUrl && templates.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-4">
              No templates found for &quot;{queryFromUrl}&quot;
            </p>
            <Link
              href="/"
              className="inline-block text-primary hover:underline"
            >
              Browse all templates
            </Link>
          </div>
        )}

        {/* Initial State - No Search */}
        {!loading && !queryFromUrl && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-4">
              Enter a search term to find templates
            </p>
          </div>
        )}
      </main>
    </div>
  );
}