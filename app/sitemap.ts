import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nicecards.shop'

  // Static routes
  const routes = [
    '',
    '/search',
    '/privacy',
    '/terms',
    
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic template routes can be added here if needed
  // Commented out to avoid build-time fetch errors
  // const templates = await fetch(`${baseUrl}/api/design`).then(res => res.json())
  // const templateRoutes = templates.data.map((template: any) => ({
  //   url: `${baseUrl}/design/${template.uuid}`,
  //   lastModified: new Date(template.created_at),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }))

  return [...routes]
}
