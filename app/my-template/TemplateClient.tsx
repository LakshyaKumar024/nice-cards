"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FileImage, Search, Grid, Eye, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TemplatesClient({ initialTemplates }) {
  const [searchQuery, setSearchQuery] = useState("");

  const truncate = (text = "", max) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  // 👍 Compute filtered templates without storing state
  const filteredTemplates = initialTemplates.filter((template) => {
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.catogery.toLowerCase().includes(query)
    );
  });

  const parceImage = (dmpImage: string): string => {
    try {
      const imageArray: string[] = JSON.parse(dmpImage);
      return imageArray[0]
    } catch (e) {
      return dmpImage
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-5 sm:py-12">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            My Templates
          </h2>
          <p className="mt-3 text-md text-muted-foreground">
            Access and manage your purchased Cards
          </p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-4">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Grid className="h-4 w-4" />
          <span>
            {filteredTemplates.length}{" "}
            {filteredTemplates.length === 1 ? "template" : "templates"} found
          </span>
        </div>

        {filteredTemplates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.uuid}
                className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent"
              >
                <Link href={`/design/${template.uuid}`}>
                  <div className="relative h-48 w-full bg-muted overflow-hidden cursor-pointer">
                    {parceImage(template.image) ? (
                      <Image
                        src={parceImage(template.image)}
                        alt={template.name}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileImage className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </Link>

                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 text-lg">
                    {template.name}
                  </CardTitle>

                  <CardDescription className="line-clamp-2">
                    {truncate(template.description || template.catogery, 80)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Link href={`/design/${template.uuid}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full group/btn hover:bg-accent hover:text-accent-foreground"
                      >
                        <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        View
                      </Button>
                    </Link>
                    
                    <Link href={`/edit/${template.uuid}`} className="flex-1">
                      <Button 
                        className="w-full group/btn bg-primary hover:bg-primary/90"
                      >
                        <Edit className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg">
            <FileImage className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">No Cards Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try another keyword" : "You have no purchased cards yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
