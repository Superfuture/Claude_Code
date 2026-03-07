export interface Project {
  slug: string
  index: string
  title: string
  subtitle?: string
  year: number
  category: string
  role: string
  description: string
  longDescription: string
  heroImage: string
  images?: string[]
  url?: string
  tags: string[]
  password?: string
}

// All heroImage URLs are Unsplash CDN — free for use under the Unsplash License
export const projects: Project[] = [
  {
    slug: 'official',
    index: '01',
    title: 'Official',
    year: 2024,
    category: 'Founder · Product',
    role: 'Founder & CEO',
    description: 'The next generation of fan-to-creator connection.',
    longDescription:
      'Building the infrastructure for authentic relationships between creators and the people who love their work. Official reimagines what it means to be a fan in the modern internet — moving beyond likes and follows toward genuine connection, community, and shared experience.',
    // Large concert crowd stage — Tijs van Leur / Unsplash
    heroImage:
      'https://images.unsplash.com/photo-1734002861999-242adfb53e92?w=1920&q=85&fit=crop&auto=format',
    url: 'https://official.com',
    tags: ['Founder', 'Product', 'Design'],
  },
  {
    slug: 'google-x',
    index: '02',
    title: 'Google X',
    subtitle: 'Project Wing',
    year: 2016,
    category: 'Product Design',
    role: 'Lead Designer',
    description: "Designed the UX for Google's drone delivery moonshot.",
    longDescription:
      "Created simple, intuitive user-centered solutions for Google X Labs Project Wing — Google's autonomous drone delivery system. Designed the end-to-end experience from order placement through aerial delivery, making complex logistics invisible to the user.",
    // Aerial city at night drone shot — Musa Ortaç / Unsplash
    heroImage:
      'https://images.unsplash.com/photo-1731351621470-8aebda14d242?w=1920&q=85&fit=crop&auto=format',
    tags: ['UX', 'Moonshot', 'Systems Design'],
  },
  {
    slug: 'little-monsters',
    index: '03',
    title: 'Little Monsters',
    subtitle: 'Lady Gaga',
    year: 2012,
    category: 'Product Design',
    role: 'Product Designer',
    description: "A creative social network for Lady Gaga's global fan community.",
    longDescription:
      "Designed Little Monsters — Lady Gaga's super-fan social network — a creative online community where fans share, create, and inspire one another. The platform gave millions of passionate fans a home built specifically for their culture, moving fan community from comment sections to a purpose-built creative space.",
    // Concert crowd silhouette — Adi Rahman / Unsplash
    heroImage:
      'https://images.unsplash.com/photo-1533544514075-0269c5f5a4be?w=1920&q=85&fit=crop&auto=format',
    tags: ['Social', 'Community', 'Fan Tech'],
  },
  {
    slug: 'linkedin',
    index: '04',
    title: 'LinkedIn',
    year: 2019,
    category: 'Product Design',
    role: 'Senior Product Designer',
    description: 'Core product experiences for 900M+ professionals.',
    longDescription:
      "Designed core product experiences for the world's largest professional network. Focused on helping people discover opportunities, build meaningful professional relationships, and present their best selves to the world — at a scale affecting hundreds of millions of users.",
    // Dark phone + laptop — Matthew Kwong / Unsplash
    heroImage:
      'https://images.unsplash.com/photo-1522937335625-b87ea99dc133?w=1920&q=85&fit=crop&auto=format',
    url: 'https://linkedin.com',
    tags: ['Scale', 'Product Design', 'B2C'],
  },
  {
    slug: 'intuit',
    index: '05',
    title: 'Intuit Labs',
    year: 2015,
    category: 'Design Leadership',
    role: 'Design Lead',
    description: 'Led design across Mint, TurboTax, and QuickBooks.',
    longDescription:
      'Managed and led Intuit Labs, working with hundreds of teams to launch new product experiences across Mint, TurboTax, QuickBooks, and more. Focused on making financial tools feel approachable and human — reducing anxiety and building confidence for millions of people managing their money.',
    // Code on screens colorful dark — Jakub Żerdzicki / Unsplash
    heroImage:
      'https://images.unsplash.com/photo-1754039984985-ef607d80113a?w=1920&q=85&fit=crop&auto=format',
    url: 'https://intuit.com',
    tags: ['Leadership', 'FinTech', 'Scale'],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
