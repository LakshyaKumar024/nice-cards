"use client";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Download,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface Template {
  uuid: string;
  name: string;
  description: string;
  price: number;
  catogery: string;
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
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const { templateId } = use(params);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching template:", templateId);

        const response = await fetch(`/api/design/${templateId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch template: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();
        console.log("API response:", result);

        // Extract the template data from the nested data property
        const data = result.data;

        // Validate required fields
        if (!data?.uuid || !data?.name) {
          throw new Error("Invalid template data received");
        }

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
        // TODO: MAKE THIS WORK
        const purchasedTemplates = false;
        setIsPurchased(purchasedTemplates);
      } catch (error) {
        console.error("Error fetching template:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load template"
        );
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);
  console.log("user",user?.id);
  
  const handlePurchase = async () => {
    if (!template) return;
    setPurchasing(true);
    try {
      router.push(`/design/${template.uuid}/checkout`);
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Purchase failed. Please try again.");
    } finally {
    }
  };

  const handleDownload = () => {
    if (!template) return;

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
    router.push(`/editor/${template.uuid}`);
  };

  const handleBack = () => {
    router.push("/");
  };

  // Helper function to get valid image URL or fallback
  const getImageSrc = () => {
    if (!template) return null;
    const src = template.preview_url || template.image_url;
    return src && src.trim() !== "" ? src : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-xl text-gray-600">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4 max-w-2xl mx-auto">
            <p className="text-xl text-red-600 mb-2 font-semibold">
              Error Loading Template
            </p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Template not found</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  const imageSrc = getImageSrc();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4 sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Templates</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Template Preview */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden shadow-lg bg-white border">
              <div className="aspect-[3/4] w-full relative bg-gray-100">
                {imageSrc && !imageError ? (
                  <Image
                    src={imageSrc}
                    alt={`${template.name} preview`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">
                        No preview available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {template.preview_url && imageSrc && !imageError && (
              <div className="text-sm text-gray-600 text-center">
                Full template preview - All elements are customizable
              </div>
            )}

            {/* Template Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {typeof template.rating === "number" &&
                  !isNaN(template.rating)
                    ? template.rating.toFixed(1)
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="bg-white rounded-lg p-3 border shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {typeof template.downloads === "number" &&
                  !isNaN(template.downloads)
                    ? template.downloads.toLocaleString()
                    : "0"}
                </div>
                <div className="text-xs text-gray-500">Downloads</div>
              </div>
              <div className="bg-white rounded-lg p-3 border shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {template.createdAt
                    ? new Date(template.createdAt).getFullYear()
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-500">Published</div>
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
                  <Badge className="bg-purple-100 text-purple-700 text-sm">
                    {template.catogery || "Uncategorized"}
                  </Badge>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    $
                    {typeof template.price === "number" &&
                    !isNaN(template.price)
                      ? template.price.toFixed(2)
                      : "0.00"}
                  </p>
                  <p className="text-sm text-gray-600">One-time purchase</p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {template.description || "No description available."}
              </p>
            </div>

            {/* Customizable Fields */}
            <div className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm">
              <h3 className="font-semibold text-lg mb-3">
                Customizable Fields:
              </h3>
              <div className="text-sm text-gray-600">
                All text fields, colors, and layout elements can be customized
                to match your brand.
              </div>
            </div>

            {/* Features */}
            <div className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm">
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
                    className="w-full bg-purple-600 hover:bg-purple-700"
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
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Purchase Template - $
                      {typeof template.price === "number" &&
                      !isNaN(template.price)
                        ? template.price.toFixed(2)
                        : "0.00"}
                    </>
                  )}
                </Button>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ✓ Unlimited edits & downloads available
                </p>
                <p className="text-sm text-gray-600">
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
