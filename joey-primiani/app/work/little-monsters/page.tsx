import type { Metadata } from 'next'
import LittleMonstersCase from './LittleMonstersCase'

const heroImage =
  'https://storage.googleapis.com/pr-newsroom-wp/1/2025/03/lady-gaga-little-monster-press-conference-spotify-12-1024x683.jpg'

export const metadata: Metadata = {
  title: 'Little Monsters — Lady Gaga Fan Platform',
  description:
    "Joey Primiani co-founded and designed Little Monsters — Lady Gaga's superfan social platform. Forbes 30 Under 30. A purpose-built creative community for millions of passionate fans, built before fan platforms were a category.",
  keywords: [
    'Little Monsters',
    'Lady Gaga',
    'fan platform',
    'Joey Primiani',
    'social network',
    'Forbes 30 Under 30',
    'product design',
    'co-founder',
  ],
  openGraph: {
    title: 'Little Monsters — Lady Gaga Fan Platform by Joey Primiani',
    description:
      "Co-founded and designed Little Monsters — Lady Gaga's creative community for millions of superfans. Built before fan platforms were a category.",
    images: [{ url: heroImage, width: 1024, height: 683, alt: 'Little Monsters — Lady Gaga fan platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Little Monsters — Joey Primiani',
    description: "Co-founded Lady Gaga's superfan social platform.",
    images: [heroImage],
  },
}

export default function Page() {
  return <LittleMonstersCase />
}
