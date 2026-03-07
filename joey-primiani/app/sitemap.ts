import { MetadataRoute } from 'next'
import { projects } from '@/lib/projects'

const BASE = 'https://joeyprimiani.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const projectPages = projects.map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    ...projectPages,
  ]
}
