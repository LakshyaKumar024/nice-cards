"use client";
import { TemplateCard } from "@/components/temlate-card";
import Image from "next/image";
import React, { useState } from "react";

// Dummy data for templates
const dummyTemplates = [
  {
    id: 1,
    name: "Elegant Wedding",
    description: "A sophisticated wedding invitation with gold accents",
    price: 29.99,
    category: "Wedding",
    image_url: "/images/wedding-elegant.jpg",
  },
  {
    id: 2,
    name: "Modern Birthday",
    description: "Clean and contemporary birthday party invitation",
    price: 19.99,
    category: "Birthday",
    image_url: "/images/birthday-modern.jpg",
  },
  {
    id: 3,
    name: "Corporate Event",
    description: "Professional business event invitation template",
    price: 24.99,
    category: "Business",
    image_url: "/images/corporate-event.jpg",
  },
  {
    id: 4,
    name: "Beach Wedding",
    description: "Tropical themed wedding invitation with ocean colors",
    price: 27.99,
    category: "Wedding",
    image_url: "/images/beach-wedding.jpg",
  },
  {
    id: 5,
    name: "Kids Birthday",
    description: "Fun and colorful birthday invitation for children",
    price: 17.99,
    category: "Birthday",
    image_url: "/images/kids-birthday.jpg",
  },
  {
    id: 6,
    name: "Anniversary",
    description: "Elegant anniversary celebration invitation",
    price: 22.99,
    category: "Anniversary",
    image_url: "/images/anniversary.jpg",
  },
  {
    id: 7,
    name: "Baby Shower",
    description: "Adorable baby shower invitation template",
    price: 18.99,
    category: "Baby Shower",
    image_url: "/images/baby-shower.jpg",
  },
  {
    id: 8,
    name: "Graduation",
    description: "Celebratory graduation party invitation",
    price: 21.99,
    category: "Graduation",
    image_url: "/images/graduation.jpg",
  },
];

// Dummy categories
const categories = [
  "All",
  "Wedding",
  "Birthday",
  "Business",
  "Anniversary",
  "Baby Shower",
  "Graduation",
];

// Import proper shadcn components (make sure these are installed)
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const session = true;
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [purchasedIds, setPurchasedIds] = useState<Set<number>>(new Set());

  // Filter templates based on selected category
  const filteredTemplates =
    selectedCategory === "All"
      ? dummyTemplates
      : dummyTemplates.filter(
          (template) => template.category === selectedCategory
        );

  const handlePurchase = (templateId: number) => {
    setPurchasedIds((prev) => new Set([...Array.from(prev), templateId]));
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-[#6c47ff] to-[#8a6cff] bg-clip-text text-transparent px-4">
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
                className="flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm px-2 sm:px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted"
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
              key={template.id}
              id={template.id}
              name={template.name}
              description={template.description || ""}
              price={template.price}
              category={template.category}
              imageUrl={template.image_url}
              onPurchase={handlePurchase}
              isPurchased={purchasedIds.has(template.id)}
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
