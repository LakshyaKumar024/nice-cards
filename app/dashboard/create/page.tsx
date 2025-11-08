"use client"

import type React from "react"
import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, FileText, ImageIcon, FileJson } from "lucide-react"

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
]

const templateSchema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  tags: z.string().min(1, "Tags are required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater").optional(),
  paid: z.boolean().default(false),
  image: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, "Image must be less than 5MB"),
  svg: z
    .instanceof(File)
    .refine((file) => file.type === "image/svg+xml" || file.name.endsWith(".svg"), "SVG file required"),
  pdf: z
    .instanceof(File)
    .refine((file) => file.type === "application/pdf" || file.name.endsWith(".pdf"), "PDF file required"),
})

type TemplateFormValues = z.infer<typeof templateSchema>

export default function AddTemplatePage() {
  
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [pdfFileName, setPdfFileName] = useState<string>("")
  const [svgFiles, setSvgFiles] = useState<(File | null)[]>([null])
  const [svgFileNames, setSvgFileNames] = useState<string[]>([""])

  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      setSvgFileNames((prev) => {
        const updated = [...prev]
        updated[index] = file.name
        return updated
      })

      setSvgFiles((prev) => {
        const updated = [...prev]
        updated[index] = file
        return updated
      })

      // Assuming form.setValue("svg", file) is correct
    }
  }

  const addSvgInput = () => {
    setSvgFiles((prev) => [...prev, null])
    setSvgFileNames((prev) => [...prev, ""])
  }

  const removeSvgInput = (index: number) => {
    setSvgFiles((prev) => prev.filter((_, i) => i !== index))
    setSvgFileNames((prev) => prev.filter((_, i) => i !== index))
  }

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as Resolver<TemplateFormValues>,
    defaultValues: {
      paid: false,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Assuming form.setValue("image", file) is correct
    }
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFileName(file.name)
      // Assuming form.setValue("pdf", file) is correct
    }
  }

  const onSubmit = async (data: TemplateFormValues) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description || "")
      formData.append("category", data.category)
      formData.append("tags", data.tags)
      formData.append("price", data.price?.toString() || "0")
      formData.append("paid", data.paid.toString())
      formData.append("image", data.image)
      formData.append("svg", data.svg)
      formData.append("pdf", data.pdf)

      const response = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create template")
      }

      await response.json()

      toast.success("Success", {
        description: "Template added successfully!",
      })

      form.reset()
      setImagePreview("")
      setPdfFileName("")
      setSvgFiles([null])
      setSvgFileNames([""])
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to add template",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-foreground mb-3 tracking-tight">Add New Template</h1>
          <p className="text-lg text-muted-foreground font-light">
            Share your design with the community. Upload your template assets to get started.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="pb-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Template Details</h2>
              </div>

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Template Name
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Wedding Invitation 2025" {...field} className="bg-secondary/50" />
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
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the template features and design style..."
                        rows={3}
                        {...field}
                        className="resize-none bg-secondary/50"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Help buyers understand what makes your template special
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Category
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "OTHER"}>
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
                      <FormLabel className="text-sm font-medium">
                        Tags
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="elegant, minimal, modern" {...field} className="bg-secondary/50" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Comma-separated keywords for discoverability
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="pb-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} className="bg-secondary/50" />
                      </FormControl>
                      <FormDescription className="text-xs">In cents (e.g., 999 = $9.99)</FormDescription>
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="mt-0 text-sm font-medium">This is a paid template</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="pb-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Upload Assets</h2>
              </div>

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Template Preview Image
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          id="image"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleImageChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer bg-secondary/50"
                        />
                      </div>
                      <FormMessage />
                      {imagePreview && (
                        <div className="relative w-full max-w-sm">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            width={400}
                            height={300}
                            className="w-full h-auto rounded-lg border border-border/50 object-cover"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Preview uploaded</p>
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
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      SVG Files
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="space-y-3">
                      {svgFiles.map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border/50 hover:border-border transition-colors"
                        >
                          <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="file"
                            accept=".svg"
                            onChange={(e) => handleSvgChange(e, index)}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer flex-1"
                          />
                          {svgFileNames[index] && (
                            <span className="text-sm text-foreground/70 truncate max-w-[150px]">
                              {svgFileNames[index]}
                            </span>
                          )}
                          {svgFiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSvgInput(index)}
                              className="text-destructive/70 hover:text-destructive text-sm font-medium transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addSvgInput}
                        className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        <span className="mr-2">+</span> Add SVG file
                      </button>

                      <FormMessage />
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
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Documentation
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          id="pdf"
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer bg-secondary/50"
                        />
                      </div>
                      <FormMessage />
                      {pdfFileName && (
                        <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-sm text-foreground font-medium">{pdfFileName}</span>
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border/50">
              <Button type="submit" disabled={isLoading} className="px-8 font-medium" size="lg">
                {isLoading ? "Publishing..." : "Publish Template"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setImagePreview("")
                  setPdfFileName("")
                  setSvgFiles([null])
                  setSvgFileNames([""])
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
  )
}
