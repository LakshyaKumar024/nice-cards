"use client";

import { TemplateCard } from "@/components/temlate-card";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

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
  tags: string[];
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [templates, setTemplates] = useState<Template[]>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetch("/api/design")
      .then((res) => res.json())
      .then((data) => setTemplates(data.data))
      .catch((err) => console.error("Failed to load templates:", err));
  }, []);

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((template) => template.catogery === selectedCategory);

  const handlePurchase = (templateId: string) => {
    alert(`Template ${templateId} purchased successfully!`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        {/* 🌟 Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14 lg:mb-16">
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <Image
              src="/logo.jpg"
              width={160}
              height={160}
              alt="NC"
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-lg object-cover shadow-md"
              priority
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
            Beautiful Invitation Templates
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose from our collection of stunning invitation card templates for
            every occasion.
          </p>

          {/* 🌓 Theme Toggle */}
          
        </div>

        {/* 🔖 Category Tabs */}
       <Tabs
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  className="mb-10 w-full"
>
  {/* 🆕 WRAPPER ADDED BELOW */}
  <div className="flex justify-center w-full">
    {/* 🆕 Added w-full sm:w-auto to handle centering properly */}
    <TabsList className="flex flex-wrap justify-center gap-3 sm:gap-4 h-auto p-3 sm:p-4 
      bg-gray-100 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-gray-800 
      shadow-sm w-full sm:w-auto">
      {categories.map((category) => (
        <TabsTrigger
          key={category}
          value={category}
          className="text-sm sm:text-base font-medium px-4 sm:px-6 py-2.5 rounded-md
          data-[state=active]:bg-purple-600 data-[state=active]:text-white
          text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800 transition"
        >
          {category}
        </TabsTrigger>
      ))}
    </TabsList>
  </div>
</Tabs>


        {/* 🎨 Templates Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
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

        {/* 🕳 Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20 sm:py-28 lg:py-32">
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 dark:text-gray-400">
              No templates found in this category.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
