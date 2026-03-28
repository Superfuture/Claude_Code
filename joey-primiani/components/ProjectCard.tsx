'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Project } from '@/lib/projects'

interface ProjectCardProps {
  project: Project
  compact?: boolean
}

export default function ProjectCard({ project, compact = false }: ProjectCardProps) {
  if (compact) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
        }}
      >
        <Link href={`/work/${project.slug}`}>
          <div
            className="group flex items-center justify-between py-5 transition-colors duration-200"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-baseline gap-8">
              <span
                style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em', minWidth: '24px' }}
              >
                {project.index}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                  color: 'var(--fg)',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                }}
              >
                {project.title}
                {project.subtitle && (
                  <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}> — {project.subtitle}</span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-8">
              <span
                className="hidden md:block"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {project.category}
              </span>
              <span
                style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--muted)' }}
              >
                {project.year}
              </span>
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: 'var(--fg)', fontSize: '16px' }}
              >
                →
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
      }}
    >
      <Link href={`/work/${project.slug}`}>
        <div
          className="group relative overflow-hidden flex items-end justify-between p-8 transition-all duration-500 h-72 md:h-96"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Background photo */}
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${project.heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.42)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)' }} />

          <div className="relative z-10 flex items-end justify-between w-full">
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                {project.index} — {project.category}
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  color: '#ffffff',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                {project.title}
                {project.subtitle && (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}> — {project.subtitle}</span>
                )}
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                {project.role} · {project.year}
              </p>
            </div>
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: '#ffffff', fontSize: '20px' }}
            >
              →
            </span>
          </div>

          <div
            className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          />
        </div>
      </Link>
    </motion.div>
  )
}
