import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getTemplateData, getPageData } from "@/lib/templates"

type Props = {
  params: Promise<{ templateId: string; serialNo: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId, serialNo } = await params
  const template = await getTemplateData(templateId)
  const page = await getPageData(templateId, serialNo)

  return {
    title: `${page.title} - ${template.name} | SVG Template Manager`,
    description: `Edit ${page.title} from your ${template.name} template`,
  }
}

export default async function PageEditPage({ params, searchParams }: Props) {
  const { templateId, serialNo } = await params
  const template = await getTemplateData(templateId)
  const page = await getPageData(templateId, serialNo)
  const queryParams = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/${templateId}/edit`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {template.name}
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{page.title}</h1>
          <p className="text-muted-foreground">Customize the text fields below to personalize your template</p>
        </div>

        {/* <SvgEditor page={page} templateId={templateId} serialNo={serialNo} initialValues={queryParams} /> */}
      </div>
    </div>
  )
}
