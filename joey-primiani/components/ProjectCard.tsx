'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Project } from '@/lib/projects'

// Unique gradient per project slug — shows when no photo is present
const gradients: Record<string, string> = {
  official:         'linear-gradient(135deg, #0a1628 0%, #0d2640 50%, #091520 100%)',
  'google-x':       'linear-gradient(135deg, #0f1f0f 0%, #1a3a1a 50%, #0a150a 100%)',
  'little-monsters': 'linear-gradient(135deg, #1a0a28 0%, #2d1040 50%, #100820 100%)',
  linkedin:         'linear-gradient(135deg, #0a1828 0%, #0d2a40 50%, #081218 100%)',
  intuit:           'linear-gradient(135deg, #1a0f0a 0%, #3a1f10 50%, #150b08 100%)',
}

interface ProjectCardProps {
  project: Project
  compact?: boolean
}

export default function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
      }}
    >
      <Link href={`/work/${project.slug}`} data-cursor="view">
        <div
          className={`group relative overflow-hidden flex items-end justify-between p-6 transition-all duration-500 ${
            compact ? 'h-20' : 'h-64 md:h-80'
          }`}
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Background: gradient + photo via CSS (silently degrades if file missing) */}
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              background: gradients[project.slug] ?? 'var(--surface)',
              backgroundImage: [
                `url(${project.heroImage})`,
                gradients[project.slug] ?? 'var(--surface)',
              ].join(', '),
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, center',
              opacity: 1,
            }}
          />
          {/* Dim the photo so gradient shows through */}
          <div className="absolute inset-0" style={{ background: 'rgba(5,5,5,0.55)' }} />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 60%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-end justify-between w-full">
            <div className="flex items-center gap-6">
              <span
                className="text-xs tracking-[0.1em] tabular-nums"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                {project.index}
              </span>
              <div>
                <h3
                  className="font-serif leading-tight"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: compact ? '1rem' : '1.5rem',
                    color: 'var(--fg)',
                  }}
                >
                  {project.title}
                  {project.subtitle && (
                    <span style={{ color: 'var(--muted)' }}> — {project.subtitle}</span>
                  )}
                </h3>
                {!compact && (
                  <p
                    className="text-xs mt-1 tracking-wide"
                    style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
                  >
                    {project.role} &nbsp;·&nbsp; {project.year}
                  </p>
                )}
              </div>
            </div>

            {/* Arrow */}
            <span
              className="text-xl transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: 'var(--accent)' }}
              aria-hidden
            >
              →
            </span>
          </div>

          {/* Accent line on hover */}
          <div
            className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
            style={{ background: 'var(--accent)' }}
          />
        </div>
      </Link>
    </motion.div>
  )
}
