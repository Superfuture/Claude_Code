import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import Nav from '@/components/Nav'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Joey Primiani — Designer, Engineer, Founder',
    template: '%s — Joey Primiani',
  },
  description:
    'Joey Primiani — Designer, engineer, and entrepreneur. Forbes 30 Under 30. Founder of Official. Previously Google X, LinkedIn, Lady Gaga Little Monsters, Intuit.',
  keywords: [
    'Joey Primiani',
    'product designer',
    'Forbes 30 Under 30',
    'Official',
    'Google X',
    'LinkedIn',
    'Little Monsters',
    'Lady Gaga',
    'Intuit',
    'founder',
    'UX design',
    'startup',
  ],
  metadataBase: new URL('https://joeyprimiani.com'),
  alternates: { canonical: 'https://joeyprimiani.com' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://joeyprimiani.com',
    siteName: 'Joey Primiani',
    title: 'Joey Primiani — Designer, Engineer, Founder',
    description:
      'Forbes 30 Under 30. Founder of Official. Previously Google X, LinkedIn, Lady Gaga Little Monsters, Intuit.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Joey Primiani' }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@jp',
    title: 'Joey Primiani — Designer, Engineer, Founder',
    description: 'Forbes 30 Under 30. Founder of Official. Previously Google X, LinkedIn, Lady Gaga Little Monsters.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Joey Primiani',
  url: 'https://joeyprimiani.com',
  image: 'https://joeyprimiani.com/og.png',
  sameAs: [
    'https://twitter.com/jp',
    'https://linkedin.com/in/jprim',
    'https://official.com',
  ],
  jobTitle: 'Founder & CEO',
  worksFor: { '@type': 'Organization', name: 'Official', url: 'https://official.com' },
  description: 'Designer, engineer, and entrepreneur. Forbes 30 Under 30. Co-founded Lady Gaga\'s Little Monsters fan platform. Previously Google X, LinkedIn, Intuit.',
  award: 'Forbes 30 Under 30',
  alumniOf: [
    { '@type': 'Organization', name: 'Google X' },
    { '@type': 'Organization', name: 'LinkedIn' },
    { '@type': 'Organization', name: 'Intuit' },
  ],
  knowsAbout: ['Product Design', 'UX Design', 'Software Engineering', 'Startups', 'Fan Platforms'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <Nav />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
