"use client";

import type React from "react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import Image from "next/image";
import { FileText, ImageIcon } from "lucide-react";

const CATEGORIES = [
  "WEDDING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "GRADUATION",
  "BABYSHOWER",
  "FESTIVAL",
  "INVITATION",
  "CORPORATE",
  "OTHER",
];

const templateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  tags: z.string().min(1, "Tags are required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater").optional(),
  paid: z.boolean().default(false),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    ),
  pdf: z
    .instanceof(File)
    .refine(
      (file) => file.type === "application/pdf" || file.name.endsWith(".pdf"),
      "PDF file required"
    ),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export default function AddTemplatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pdfFileName, setPdfFileName] = useState<string>("");

  // 🖼️ Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      form.setValue("image", file, { shouldValidate: true }); // ✅ Sync with form
    }
  };

  // 📄 PDF
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      form.setValue("pdf", file, { shouldValidate: true }); // ✅ Sync with form
    }
  };

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as Resolver<TemplateFormValues>,
    defaultValues: {
      name: "",
      description: "",
      category: "OTHER",
      tags: "",
      price: 0,
      paid: false,
      // these won't affect files but help avoid type mismatch
      image: undefined as unknown as File,
      pdf: undefined as unknown as File,
    },
  });

  // In your onSubmit function - update the upload sections

  const onSubmit = async (data: TemplateFormValues) => {
    setIsLoading(true);

    const toastId = toast.loading("Starting upload process...");

    try {
      // ---------- STEP 1: Upload Image ----------
      toast.loading("Uploading image...", { id: toastId });

      const imageForm = new FormData();
      imageForm.append("file", data.image);

      console.log("🖼️ Uploading Image:", {
        fileName: data.image.name,
        fileSize: data.image.size,
        fileType: data.image.type
      });

      const imageRes = await fetch("/api/dashboard/design/create/image", {
        method: "POST",
        body: imageForm,
      });

      if (!imageRes.ok) {
        const errorText = await imageRes.text();
        console.error("❌ Image upload failed:", errorText);
        throw new Error(`Image upload failed: ${imageRes.status}`);
      }

      const imageJson = await imageRes.json();
      let imageFilename = imageJson?.data?.fileName;

      if (!imageFilename) {
        throw new Error("No image filename returned from server");
      }

      // Remove any extra quotes if they exist
      if (typeof imageFilename === 'string') {
        imageFilename = imageFilename.replace(/^["']|["']$/g, '');
      }

      console.log("✅ Image uploaded:", imageFilename);

      // ---------- STEP 2: Upload PDF ----------
      toast.loading("Uploading PDF...", { id: toastId });

      const pdfForm = new FormData();
      pdfForm.append("file", data.pdf);

      console.log("📄 Uploading PDF:", {
        fileName: data.pdf.name,
        fileSize: data.pdf.size,
        fileType: data.pdf.type
      });

      const pdfRes = await fetch("/api/dashboard/design/create/pdf", {
        method: "POST",
        body: pdfForm,
      });

      if (!pdfRes.ok) {
        const errorText = await pdfRes.text();
        console.error("❌ PDF upload failed:", errorText);
        throw new Error(`PDF upload failed: ${pdfRes.status}`);
      }

      const pdfJson = await pdfRes.json();
      const pdfFilename = pdfJson?.data?.fileName;

      if (!pdfFilename) {
        throw new Error("No PDF filename returned from server");
      }

      console.log("✅ PDF uploaded:", pdfFilename);

      // ---------- STEP 3: Submit Metadata ----------
      toast.loading("Creating template...", { id: toastId });

      const finalForm = new FormData();
      finalForm.append("name", data.name);
      finalForm.append("description", data.description || "");
      finalForm.append("category", data.category);
      finalForm.append("tags", data.tags);
      finalForm.append("price", data.price?.toString() || "0");
      finalForm.append("paid", data.paid.toString() || "false");
      finalForm.append("placeholderImage", imageFilename);
      finalForm.append("pdf", pdfFilename);
      finalForm.append("svg", "");

      console.log("📦 Submitting template metadata...");

      const metaRes = await fetch("/api/dashboard/design/create", {
        method: "POST",
        body: finalForm,
      });

      if (!metaRes.ok) {
        const errorText = await metaRes.text();
        console.error("❌ Template creation failed:", errorText);
        throw new Error(`Failed to create template: ${metaRes.status}`);
      }

      const metaJson = await metaRes.json();
      console.log("✅ Template created successfully:", metaJson);

      toast.success("Template Published!", {
        id: toastId,
        description: "All files uploaded and template added successfully.",
      });

      // Reset form and state
      form.reset();
      setImagePreview("");
      setPdfFileName("");

    } catch (error) {
      console.error("💥 Template submission error:", error);
      toast.error("Upload Failed", {
        id: toastId,
        description: error instanceof Error ? error.message : "Failed to add template",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-foreground mb-3 tracking-tight">
            Add New Template
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Share your design with the community. Upload your template assets to
            get started.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* ---- Template Fields ---- */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Template Details
                </h2>
              </div>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Template Name
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Wedding Invitation 2025"
                        {...field}
                        className="bg-secondary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the template..."
                        rows={3}
                        {...field}
                        className="resize-none bg-secondary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category<span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "OTHER"}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0) + cat.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tags<span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="elegant, minimal, modern"
                          {...field}
                          className="bg-secondary/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ---- Pricing ---- */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Pricing
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          className="bg-secondary/50"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        In cents (e.g., 999 = $9.99)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mt-0 text-sm font-medium">
                        This is a paid template
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ---- Upload Fields ---- */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Upload Assets
                </h2>
              </div>

              {/* Image */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Template Preview Image
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageChange}
                      className="bg-secondary/50 cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="mt-3 w-full max-w-sm">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="rounded-lg border object-cover"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* PDF */}
              <FormField
                control={form.control}
                name="pdf"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Documentation
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfChange}
                      className="bg-secondary/50 cursor-pointer"
                    />
                    {pdfFileName && (
                      <div className="flex items-center gap-3 mt-3 bg-secondary/30 p-2 rounded-md">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm">{pdfFileName}</span>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* ---- Submit ---- */}
            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 font-medium"
                size="lg"
              >
                {isLoading ? "Publishing..." : "Publish Template"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setImagePreview("");
                  setPdfFileName("");
                }}
                className="px-8 font-medium"
                size="lg"
              >
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}