"use client";
import { TemplateCard } from "@/components/template-card";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
// Import proper shadcn components (make sure these are installed)
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  "All",
  "WEDDING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "GRADUATION",
  "BABYSHOWER",
  "FESTIVAL",
  "INVITATION",
  "CORPORATE",
];


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

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch("/api/design")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.data);
        console.log(data.data);
      });
  }, []);

  // Handle search - navigate to search page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Filter templates based on selected category
  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((template) => template.catogery === selectedCategory);

  const handlePurchase = () => {};

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12 lg:mb-16">
          {/* Responsive logo */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <Image
              src="/logo.jpg"
              width={200}
              height={200}
              alt="NC"
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
              priority
            />
          </div>

          {/* Responsive heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-linear-to-r from-[#6c47ff] to-[#8a6cff] bg-clip-text text-transparent px-4">
            Beautiful Invitation Templates
          </h1>

          {/* Responsive paragraph */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md lg:max-w-2xl mx-auto px-4 sm:px-0">
            Choose from our collection of stunning invitation card templates for
            every occasion
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-base sm:text-lg rounded-xl shadow-sm border-2 focus:border-primary transition-colors"
            />
          </form>
        </div>

        {/* Categories Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-6 sm:mb-8 lg:mb-12 w-full"
        >
          <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-4 h-auto p-3 sm:p-4 bg-muted/50 rounded-xl shadow-sm">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-1 sm:flex-none min-w-[120px] sm:min-w-[140px] text-sm sm:text-base font-medium px-4 sm:px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredTemplates.map((template) => (
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

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground">
              No templates found in this category
            </p>
          </div>
        )}
      </main>
    </div>
  );
}