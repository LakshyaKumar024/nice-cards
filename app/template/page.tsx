import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileImage } from "lucide-react"

export default function HomePage() {
  // Mock template data - in production, this would come from a database
  const templates = [
    { id: "certificate-1", name: "Professional Certificate", pages: 3, preview: "/templates/certificate-1/page-1.svg" },
    { id: "invitation-1", name: "Event Invitation Pack", pages: 2, preview: "/templates/invitation-1/page-1.svg" },
    { id: "badge-1", name: "ID Badge Collection", pages: 4, preview: "/templates/badge-1/page-1.svg" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">SVG Template Manager</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Manage and customize your purchased SVG templates with ease
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-muted">
                  <FileImage className="h-16 w-16 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <CardDescription>{template.pages} pages available</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/template/${template.id}/edit`}>
  <Button className="w-full">View Pages</Button>
</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
