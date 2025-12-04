"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileImage, Search, Grid } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Template {
  uuid: string;
  name: string;
  description: string;
  catogery: string;
  image: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/design/mytemplates", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.data);
        setFilteredTemplates(data.data);
      })
      .catch((error) => {
        console.error("Error fetching templates:", error);
      });
  }, []);

  useEffect(() => {
    if (!templates) return;

    const query = searchQuery.toLowerCase();
    const filtered = templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.catogery.toLowerCase().includes(query)
    );
    const setFilter = () => {
      setFilteredTemplates(filtered);
    };
    setFilter();
  }, [searchQuery, templates]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-5 sm:py-12">
          <div className="mb-5">
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              My Templates
            </h2>
            <p className="mt-3 text-md text-muted-foreground">
              Access and manage your purchased Cards
            </p>
          </div>

          {/* Search Bar */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Results Count */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Grid className="h-4 w-4" />
          <span>
            {filteredTemplates.length}{" "}
            {filteredTemplates.length === 1 ? "template" : "templates"} found
          </span>
        </div>

        {/* cards Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Link
                key={template.uuid}
                href={`/edit/${template.uuid}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent cursor-pointer">
                  {/* Image Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {!template.image ? (
                      <div className="flex h-full items-center justify-center">
                        <FileImage className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    ) : (
                      <Image
                        src={template.image}
                        alt={template.name}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                  </div>

                  {/* Content */}
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg text-foreground transition-none">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description || template.catogery}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Button

                      className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
                      onClick={(e) => {
                        router.push(`/edit/${template.uuid}`);
                      }}
                    >
                      Edit Template
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16 px-4">
            <FileImage className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No Card found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "You haven't purchased any cards yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
