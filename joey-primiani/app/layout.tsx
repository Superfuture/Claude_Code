import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import Cursor from '@/components/Cursor'
import Nav from '@/components/Nav'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Joey Primiani',
    template: '%s — Joey Primiani',
  },
  description:
    'Designer. Engineer. Builder. Forbes 30 Under 30. Founder of Official. Previously Google X, LinkedIn, Lady Gaga Little Monsters, Intuit.',
  metadataBase: new URL('https://joeyprimiani.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://joeyprimiani.com',
    siteName: 'Joey Primiani',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Joey Primiani' }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@jp',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Joey Primiani',
  url: 'https://joeyprimiani.com',
  sameAs: [
    'https://twitter.com/jp',
    'https://linkedin.com/in/jprim',
    'https://official.com',
  ],
  jobTitle: 'Founder & CEO',
  worksFor: { '@type': 'Organization', name: 'Official' },
  description: 'Designer, engineer, and entrepreneur. Forbes 30 Under 30.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <Cursor />
          <Nav />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
