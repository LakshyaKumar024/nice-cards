"use client";
import { TemplateCard } from "@/components/temlate-card";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const categories = [
  "All",
  "WEDDING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "GRADUATION",
  "BABYSHOWER",
  "FESTIVAL",
  "INVITATION",
  "CORPORATE"
];

// Import proper shadcn components (make sure these are installed)
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  tags: string[];
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [purchasedIds, setPurchasedIds] = useState<Set<number>>(new Set());
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch("/api/design")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.data);
        console.log(data.data);
      });
  }, []);

  // Filter templates based on selected category
  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((template) => template.catogery === selectedCategory);

  const handlePurchase = (templateId: string) => {
    // setPurchasedIds((prev) => new Set([...Array.from(prev), templateId]));
    alert(`Template ${templateId} purchased successfully!`);
  };

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

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-6 sm:mb-8 lg:mb-12 w-full"
        >
          <TabsList className="flex flex-wrap justify-center gap-1 sm:gap-2 h-auto p-1 sm:p-2 bg-muted/50 rounded-lg">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-1 sm:flex-none min-w-20 sm:min-w-[100px] text-xs sm:text-sm px-2 sm:px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted"
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
