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
  pages?: number | null;
  uuid: string;
  name: string;
  description: string;
  price: number;
  catogery: string;
  paid: boolean;
  pdf: string;
  svg: string;
  image: string;
  preview_url: string | null;
  rating: number;
  downloads: number;
  createdAt: string;
  tags: string[];
}

export function TemplateDetail({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { isLoaded, user } = useUser();

  const router = useRouter();

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      if (!isLoaded || !templateId) {
        return;
      }

      try {
        const res = await fetch(`/api/design/${templateId}`, {
          method: "POST",
          body: JSON.stringify({ userId: user?.id }),
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch template");
        const result = await res.json();
        const data = result.data;
        if (!data?.uuid) throw new Error("Invalid template data");
        setTemplate(data);
        console.log("user === ", user);
        console.log(data.hasPurchased);
        setIsPurchased(data.hasPurchased);

        // Parse tags safely
        let parsed: string[] = [];
        if (typeof data.tags === "string") {
          try {
            parsed = JSON.parse(data.tags || "[]");
          } catch {
            parsed = data.tags.split(",").map((t: string) => t.trim());
          }
        } else if (Array.isArray(data.tags)) parsed = data.tags;
        setTags(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading template");
      } finally {
        setLoading(false);
      }
    };
    if (templateId) fetchTemplate();
  }, [templateId, isLoaded, user]);

  const handlePurchase = () => {
    setPurchasing(true);
    if (!template) return;
    router.push(`/design/${template.uuid}/checkout`);
    setPurchasing(false);
  };

  const handleDownload = () => {
    if (!template || !template.pdf) return;

    // Extract the filename from the path
    const fileName = template.pdf.split("/").pop()!;

    // API route URL
    const apiUrl = `/api/getPdf/${fileName}`;

    // Create a hidden link and trigger download
    const link = document.createElement("a");
    link.href = apiUrl;
    link.download = `${template.name.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading "${template.name}"...`);
  };

  const handleEditTemplate = () => router.push(`/edit/${template?.uuid}`);
  const handleBack = () => router.push("/");

  // Remove any extra quotes from the image URL
  const imageSrc = template?.image
    ? template.image.replace(/^["']|["']$/g, "")
    : null;
  console.log("Image src:", imageSrc);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Loading template...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-red-50 dark:bg-[#1a1a1a] border border-red-200 dark:border-red-600 rounded-lg p-6 mb-4 max-w-2xl mx-auto">
            <p className="text-xl text-red-600 dark:text-red-400 mb-2 font-semibold">
              Error Loading Template
            </p>
            <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
          </div>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </div>
      </div>
    );

  if (!template)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-colors">
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
          Template not found
        </p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-800 dark:text-gray-200 transition-colors">
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 sm:mb-6 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Templates</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Preview */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-[#121212] border dark:border-gray-800">
              <div className="aspect-3/4 w-full relative bg-gray-100 dark:bg-[#1a1a1a]">
                {isPurchased ? (
                  <>
                    {imageSrc && !imageError ? (
                      <div className="relative w-full h-full">
                        <iframe
                          src={`/api/getPdf/${template.pdf}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full rounded-xl"
                          style={{
                            border: "none",
                          }}
                          title="PDF Document"
                          // ✅ Remove sandbox attribute as it was too restrictive
                          // ✅ Keep basic event handlers but make them less intrusive
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 dark:text-gray-500 text-sm">
                            No preview available
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {imageSrc && !imageError ? (
                      <Image
                        src={imageSrc || "/placeholder.svg"}
                        alt={`${template.name} preview`}
                        fill
                        className="object-cover"
                        priority
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 dark:text-gray-500 text-sm">
                            No preview available
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {template.preview_url && imageSrc && !imageError && (
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Full template preview — All elements are customizable
              </div>
            )}

            {!isPurchased && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  🔒 Limited Preview
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Purchase to see the full template and unlock all customization
                  features
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                {
                  label: "Pages",
                  value: template.pages?.toFixed(1) || "N/A",
                },
                {
                  label: "Downloads",
                  value: template.downloads?.toLocaleString() || "0",
                },
                {
                  label: "Published",
                  value: new Date(template.createdAt).getFullYear() || "N/A",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#121212] rounded-lg p-3 border dark:border-gray-800 shadow-sm"
                >
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {template.name}
                  </h1>
                  <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm">
                    {template.catogery || "Uncategorized"}
                  </Badge>
                </div>
                <div className="sm:text-right">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ₹
                    {typeof template.price === "number"
                      ? template.price.toFixed(2)
                      : "0.00"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    One-time purchase
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {template.description || "No description available."}
              </p>
            </div>

            {/* Custom Fields */}
            <div className="border rounded-lg p-6 bg-white dark:bg-[#121212] dark:border-gray-800 shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">
                Customizable Fields:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All text fields, colors, and layout elements can be customized
                to match your brand.
              </p>
            </div>

            {/* Features */}
            <div className="border rounded-lg p-6 bg-white dark:bg-[#121212] dark:border-gray-800 shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">
                Template Features:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                {[
                  "High-quality 300 DPI resolution",
                  "Print-ready PDF format",
                  "Digital sharing options",
                  "Fully customizable text",
                  "Multiple color variations",
                  "Lifetime updates",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isPurchased ? (
                <>
                  <Button
                    onClick={handleEditTemplate}
                    size="lg"
                    className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Edit Template
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full dark:border-gray-600 dark:text-gray-200 bg-transparent"
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
                  className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white cursor-pointer"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Purchase Template - ₹
                      {typeof template.price === "number"
                        ? template.price.toFixed(2)
                        : "0.00"}
                    </>
                  )}
                </Button>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✓ Unlimited edits & downloads available
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
