import type { Metadata } from 'next'
import { motion } from 'framer-motion'
import { projects } from '@/lib/projects'
import ProjectCard from '@/components/ProjectCard'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected projects by Joey Primiani — Google X, Little Monsters, LinkedIn, Intuit, and Official.',
}

// Server component — motion wrapped in client cards
export default function WorkPage() {
  return (
    <main
      className="min-h-screen px-10 pt-32 pb-24 md:px-16"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p
            className="text-xs tracking-[0.2em] uppercase mb-4"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
          >
            Work
          </p>
          <h1
            className="leading-none"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: 'var(--fg)',
            }}
          >
            Selected Projects
          </h1>
        </div>

        {/* Project list */}
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </main>
  )
}
