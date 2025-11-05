"use client";

import type React from "react";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  const [svgFileName, setSvgFileName] = useState<string>("");
  const [pdfFileName, setPdfFileName] = useState<string>("");

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as Resolver<TemplateFormValues>,
    defaultValues: {
      paid: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", file);
    }
  };

  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSvgFileName(file.name);
      form.setValue("svg", file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      form.setValue("pdf", file);
    }
  };

  const onSubmit = async (data: TemplateFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("category", data.category);
      formData.append("tags", data.tags);
      formData.append("price", data.price?.toString() || "0");
      formData.append("paid", data.paid.toString());
      formData.append("image", data.image);
      formData.append("svg", data.svg);
      formData.append("pdf", data.pdf);

      const response = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      await response.json();

      toast.success("Success", {
        description: "Template added successfully!",
      });

      form.reset();
      setImagePreview("");
      setSvgFileName("");
      setPdfFileName("");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to add template",
      });
    } finally {
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Add New Template
            </h1>
            <p className="text-muted-foreground">
              Create and upload a new design template to your library
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Basic Information
                </h2>

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Template Name{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Wedding Invitation 2025"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the template features and use case..."
                          rows={4}
                          {...field}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Tags Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Category <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "OTHER"}
                        >
                          <FormControl>
                            <SelectTrigger>
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

                  {/* Tags */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tags <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormDescription>comma-separated</FormDescription>
                        <FormControl>
                          <Input
                            placeholder="e.g., elegant, minimal, modern"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Pricing
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Field */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (in cents)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Paid Toggle */}
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
                        <FormLabel className="mt-0!">
                          Mark as paid template
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* File Uploads Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Files</h2>

                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Template Image{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="space-y-3">
                        <Input
                          id="image"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleImageChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        <FormMessage />
                        {imagePreview && (
                          <div className="relative w-full max-w-xs">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-auto rounded-lg border border-border object-cover"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Image preview
                            </p>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* SVG Upload */}
                <FormField
                  control={form.control}
                  name="svg"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        SVG File <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="space-y-3">
                        <Input
                          id="svg"
                          type="file"
                          accept=".svg"
                          onChange={handleSvgChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        <FormMessage />
                        {svgFileName && (
                          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                SVG
                              </span>
                            </div>
                            <span className="text-sm text-foreground font-medium">
                              {svgFileName}
                            </span>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* PDF Upload */}
                <FormField
                  control={form.control}
                  name="pdf"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        PDF File <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="space-y-3">
                        <Input
                          id="pdf"
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        <FormMessage />
                        {pdfFileName && (
                          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                PDF
                              </span>
                            </div>
                            <span className="text-sm text-foreground font-medium">
                              {pdfFileName}
                            </span>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-border">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? "Uploading..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setImagePreview("");
                    setSvgFileName("");
                    setPdfFileName("");
                  }}
                  className="px-8"
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
