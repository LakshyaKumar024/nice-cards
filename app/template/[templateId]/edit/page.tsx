import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { getTemplateData } from "@/lib/templates"

type Props = {
  params: Promise<{ templateId: string }> // ✅ note: Promise type
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params  // ✅ must await
  const template = await getTemplateData(templateId)

  return {
    title: `${template.name} - Edit Pages | SVG Template Manager`,
    description: `View and edit all pages from your ${template.name} template`,
  }
}

export default async function TemplateEditPage({ params }: Props) {
  const { templateId } = await params  // ✅ must await
  const template = await getTemplateData(templateId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Templates
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{template.name}</h1>
          <p className="text-muted-foreground">Select a page to start editing</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {template.pages.map((page) => (
            <Card key={page.serialNo} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardHeader className="space-y-4">
                <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={page.preview || "/placeholder.svg"}
                    alt={page.title}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription>Page {page.serialNo}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/template/${templateId}/edit/${page.serialNo}`}>
                  <Button className="w-full">Edit Page</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
