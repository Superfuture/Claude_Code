'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { projects } from '@/lib/projects'
import ProjectCard from './ProjectCard'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export default function WorkSection() {
  // Show first 3 non-Official projects on the home page
  const featured = projects.filter(p => p.slug !== 'official').slice(0, 3)

  return (
    <div className="relative z-10 flex flex-col h-full px-10 py-20 md:px-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
        >
          Featured Work
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/work"
            className="text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-60 flex items-center gap-2"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
          >
            View all
            <span className="text-base leading-none">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex-1 flex flex-col gap-4 overflow-hidden"
      >
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} compact />
        ))}
      </motion.div>
    </div>
  )
}
