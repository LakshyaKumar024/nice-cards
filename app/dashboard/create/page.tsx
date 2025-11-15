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
import { FileText, ImageIcon, FileJson } from "lucide-react";

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
  svg: z
    .instanceof(File)
    .refine(
      (file) => file.type === "image/svg+xml" || file.name.endsWith(".svg"),
      "SVG file required"
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
  const [svgFiles, setSvgFiles] = useState<(File | null)[]>([null]);
  const [svgFileNames, setSvgFileNames] = useState<string[]>([""]);

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

  // 🧩 SVG
  const handleSvgChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setSvgFileNames((prev) => {
        const updated = [...prev];
        updated[index] = file.name;
        return updated;
      });
      setSvgFiles((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
      form.setValue("svg", file, { shouldValidate: true }); // ✅ Sync with form
    }
  };

  const addSvgInput = () => {
    setSvgFiles((prev) => [...prev, null]);
    setSvgFileNames((prev) => [...prev, ""]);
  };

  const removeSvgInput = (index: number) => {
    setSvgFiles((prev) => prev.filter((_, i) => i !== index));
    setSvgFileNames((prev) => prev.filter((_, i) => i !== index));
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
      svg: undefined as unknown as File,
    },
  });

  const onSubmit = async (data: TemplateFormValues) => {
    setIsLoading(true);

    const dismiss = toast.loading("Uploading files...", {
      description: "Please wait while we upload your files.",
    });

    try {
      // Show upload progress
      const dismiss = toast.loading("Uploading files...", {
        description: "Please wait while your assets are being uploaded.",
      });

      // ---------- STEP 1: Upload Image ----------
      const imageForm = new FormData();
      imageForm.append("file", data.image);
      imageForm.append("type", "placeholder");

      const imageRes = await fetch("/api/dashboard/design/create", {
        method: "PUT",
        body: imageForm,
      });
      if (!imageRes.ok) throw new Error("Image upload failed");

      const imageJson = await imageRes.json();
      const imageFilename = imageJson?.data?.fileName;
      if (!imageFilename)
        throw new Error("No image filename returned from server");

      // ---------- STEP 2: Upload PDF ----------
      const pdfForm = new FormData();
      pdfForm.append("file", data.pdf);
      pdfForm.append("type", "pdf");

      const pdfRes = await fetch("/api/dashboard/design/create", {
        method: "PUT",
        body: pdfForm,
      });
      if (!pdfRes.ok) throw new Error("PDF upload failed");

      const pdfJson = await pdfRes.json();
      const pdfFilename = pdfJson?.data?.fileName;
      if (!pdfFilename) throw new Error("No PDF filename returned from server");

      // ---------- STEP 3: Upload SVGs (Parallel Uploads) ----------
      const svgUploadPromises = svgFiles
        .filter(Boolean)
        .map(async (svgFile) => {
          try {
            const svgForm = new FormData();
            svgForm.append("file", svgFile!);
            svgForm.append("type", "svg");

            const svgRes = await fetch("/api/dashboard/design/create", {
              method: "PUT",
              body: svgForm,
            });

            if (!svgRes.ok) {
              let errorText = "Unknown error";
              try {
                errorText = await svgRes.text();
              } catch (e) {
                console.error("Could not read error response:", e);
              }
              throw new Error(`Upload failed: ${svgRes.status} - ${errorText}`);
            }

            const svgJson = await svgRes.json();
            const svgFilename = svgJson?.data?.fileName;

            if (!svgFilename) {
              throw new Error("No filename returned from server");
            }

            return { success: true, filename: svgFilename, file: svgFile };
          } catch (error) {
            console.error(`Failed to upload ${svgFile!.name}:`, error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
              file: svgFile,
            };
          }
        });

      const svgResults = await Promise.all(svgUploadPromises);

      // Check for any failures
      const failedUploads = svgResults.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads
          .map((f) => `Failed to upload ${f.file!.name}: ${f.error}`)
          .join(", ");
        throw new Error(`SVG uploads failed: ${errorMessages}`);
      }

      const uploadedSvgFilenames = svgResults
        .filter(
          (result): result is { success: true; filename: string; file: File } =>
            result.success
        )
        .map((result) => result.filename);

      console.log("Uploaded SVG Filenames:", uploadedSvgFilenames);

      // ---------- STEP 4: Submit Metadata ----------
      const finalForm = new FormData();
      finalForm.append("name", data.name);
      finalForm.append("description", data.description || "");
      finalForm.append("category", data.category);
      finalForm.append("tags", data.tags);
      finalForm.append("price", data.price?.toString() || "0");
      finalForm.append("paid", data.paid.toString() || "false");
      finalForm.append("placeholderImage", imageFilename);
      finalForm.append("pdf", pdfFilename);
      finalForm.append("svg", JSON.stringify(uploadedSvgFilenames));

      const metaRes = await fetch("/api/dashboard/design/create", {
        method: "POST",
        body: finalForm,
      });

      if (!metaRes.ok) throw new Error("Failed to create template");

      toast.success("Template Published!", {
        description: "All files uploaded and template added successfully.",
      });

      // Reset form and state
      form.reset();
      setImagePreview("");
      setPdfFileName("");
      setSvgFiles([null]);
      setSvgFileNames([""]);

      toast.dismiss(dismiss);
    } catch (error) {
      console.error(error);
      toast.dismiss(dismiss);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to add template",
      });
    } finally {
      toast.dismiss(dismiss);
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

              {/* SVG */}
              <FormField
                control={form.control}
                name="svg"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      SVG Files<span className="text-destructive">*</span>
                    </FormLabel>
                    {svgFiles.map((_, index) => (
                      <div key={index} className="flex items-center gap-3 mb-2">
                        <Input
                          type="file"
                          accept=".svg"
                          onChange={(e) => handleSvgChange(e, index)}
                          className="bg-secondary/50 cursor-pointer"
                        />
                        {svgFileNames[index] && (
                          <span className="text-sm text-muted-foreground truncate">
                            {svgFileNames[index]}
                          </span>
                        )}
                        {svgFiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSvgInput(index)}
                            className="text-destructive text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSvgInput}
                      className="text-primary text-sm hover:underline"
                    >
                      + Add another SVG
                    </button>
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
                  setSvgFiles([null]);
                  setSvgFileNames([""]);
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
