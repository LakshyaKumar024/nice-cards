"use client";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Check, Download } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Template {
  uuid: string;
  name: string;
  description: string;
  price: number;
  category: string; // Fixed typo: catogery -> category
  paid: boolean;
  pdf: string;
  svg: string;
  image_url: string;
  preview_url: string | null;
  rating: number;
  downloads: number;
  createdAt: string;
  tags: string[];
}

export function TemplateDetail({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  const { templateId } = use(params);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/design/${templateId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.status}`);
        }

        const data = await response.json();
        setTemplate(data);

        // Parse tags safely
        let parsedTags: string[] = [];
        if (typeof data.tags === "string") {
          try {
            parsedTags = JSON.parse(data.tags || "[]");
          } catch {
            parsedTags = data.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean);
          }
        } else if (Array.isArray(data.tags)) {
          parsedTags = data.tags;
        }
        setTags(parsedTags);

        // Check if template is already purchased
        const purchasedTemplates = JSON.parse(
          localStorage.getItem("purchasedTemplates") || "[]"
        );
        setIsPurchased(purchasedTemplates.includes(data.uuid));
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handlePurchase = async () => {
    if (!template) return;

    setPurchasing(true);
    try {
      // Simulate API call for purchase
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add to purchased templates in localStorage
      const purchasedTemplates = JSON.parse(
        localStorage.getItem("purchasedTemplates") || "[]"
      );

      if (!purchasedTemplates.includes(template.uuid)) {
        purchasedTemplates.push(template.uuid);
        localStorage.setItem(
          "purchasedTemplates",
          JSON.stringify(purchasedTemplates)
        );
      }

      setIsPurchased(true);
      alert(`Successfully purchased "${template.name}"!`);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = () => {
    if (!template) return;

    // Create a temporary link for download
    const link = document.createElement("a");
    link.href = template.pdf || template.svg;
    link.download = `${template.name.replace(/\s+/g, "_")}.${
      template.pdf ? "pdf" : "svg"
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Downloading "${template.name}"...`);
  };

  const handleEditTemplate = () => {
    if (!template) return;
    // Navigate to edit page or open editor
    router.push(`/editor/${template.uuid}`);
  };

  const handleBack = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-xl text-muted-foreground">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">
            Template not found
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4 sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Templates</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Template Preview */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden shadow-elegant bg-card border">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src={template.preview_url || template.image_url}
                  alt={template.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>

            {template.preview_url && (
              <div className="text-sm text-muted-foreground text-center">
                Full template preview - All elements are customizable
              </div>
            )}

            {/* Template Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-2xl font-bold text-primary">
                  {template.rating}
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-2xl font-bold text-primary">
                  {template.downloads}
                </div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </div>
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-2xl font-bold text-primary">
                  {new Date(template.createdAt).getFullYear()}
                </div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={`${tag}-${index}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Template Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {template.name}
                  </h1>
                  <Badge className="bg-accent text-accent-foreground text-sm">
                    {template.category}
                  </Badge>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    ${template.price}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    One-time purchase
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Customizable Fields - Placeholder for future implementation */}
            <div className="border rounded-lg p-4 sm:p-6 bg-card">
              <h3 className="font-semibold text-lg mb-3">
                Customizable Fields:
              </h3>
              <div className="text-sm text-muted-foreground">
                All text fields, colors, and layout elements can be customized
                to match your brand.
              </div>
            </div>

            {/* Features */}
            <div className="border rounded-lg p-4 sm:p-6 bg-card">
              <h3 className="font-semibold text-lg mb-3">Template Features:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>High-quality 300 DPI resolution</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Print-ready PDF format</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Digital sharing options</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Fully customizable text</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Multiple color variations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Lifetime updates</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isPurchased ? (
                <>
                  <Button
                    onClick={handleEditTemplate}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Edit Template
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleDownload}
                  >
                    Download Files
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  size="lg"
                  className="w-full"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Purchase Template - ${template.price}
                    </>
                  )}
                </Button>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ✓ 30-day money-back guarantee
                </p>
                <p className="text-sm text-muted-foreground">
                  ✓ Lifetime updates included
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TemplateDetail;
