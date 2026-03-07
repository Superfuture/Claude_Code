'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Loader from '@/components/Loader'
import HeroSection from '@/components/HeroSection'
import WorkSection from '@/components/WorkSection'
import AboutSection from '@/components/AboutSection'

const ParticleHero = dynamic(() => import('@/components/ParticleHero'), { ssr: false })

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />

      <main
        className={`fixed inset-0 overflow-y-scroll scrollbar-hide snap-y snap-mandatory transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/* Hero */}
        <section
          className="relative flex-shrink-0 overflow-hidden"
          style={{ height: '100svh', scrollSnapAlign: 'start' }}
        >
          <ParticleHero />
          <HeroSection />
        </section>

        {/* Work */}
        <section
          className="relative flex-shrink-0 overflow-hidden"
          style={{ height: '100svh', scrollSnapAlign: 'start', background: 'var(--bg)' }}
        >
          <WorkSection />
        </section>

        {/* About */}
        <section
          className="relative flex-shrink-0 overflow-hidden"
          style={{ height: '100svh', scrollSnapAlign: 'start', background: 'var(--surface)' }}
        >
          <AboutSection />
        </section>

        {/* Footer strip */}
        <footer
          className="flex-shrink-0 flex items-center justify-between px-10 py-6 md:px-16"
          style={{
            scrollSnapAlign: 'start',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <span
            className="text-xs tracking-[0.1em]"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
          >
            © {new Date().getFullYear()} Joey Primiani
          </span>
          <div className="flex items-center gap-6">
            {[
              { href: 'https://twitter.com/jp', label: 'Twitter' },
              { href: 'https://linkedin.com/in/jprim', label: 'LinkedIn' },
              { href: 'mailto:jprimiani@gmail.com', label: 'Email' },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="text-xs tracking-[0.1em] uppercase transition-opacity hover:opacity-60"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                {label}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </>
  )
}
