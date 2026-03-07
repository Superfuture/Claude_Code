import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { projects, getProjectBySlug } from '@/lib/projects'
import PasswordGate from '@/components/PasswordGate'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} — Joey Primiani`,
      description: project.description,
      images: [{ url: project.heroImage }],
    },
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const currentIndex = projects.findIndex((p) => p.slug === slug)
  const prev = projects[currentIndex - 1]
  const next = projects[currentIndex + 1]

  const content = (
    <main style={{ background: 'var(--bg)' }}>
      {/* Hero — CSS background degrades silently when no image file exists */}
      <div
        className="relative h-[60vh] md:h-[75vh] overflow-hidden"
        style={{
          backgroundImage: `url(${project.heroImage}), linear-gradient(135deg, #0a1628 0%, #0d2640 50%, #050d18 100%)`,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
        }}
      >
        {/* Dim overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(5,5,5,0.5)' }} />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, var(--bg) 5%, rgba(5,5,5,0.2) 60%, transparent 100%)',
          }}
        />

        {/* Back link */}
        <div className="absolute top-24 left-10 md:left-16">
          <Link
            href="/work"
            className="text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-60 flex items-center gap-2"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
          >
            <span>←</span> Work
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-10 md:px-16 -mt-24 relative z-10 pb-32">
        {/* Index + category */}
        <div className="flex items-center gap-4 mb-6">
          <span
            className="text-xs tracking-[0.1em] tabular-nums"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
          >
            {project.index}
          </span>
          <span
            className="text-xs tracking-[0.1em] uppercase"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
          >
            {project.category}
          </span>
        </div>

        {/* Title */}
        <h1
          className="mb-2 leading-tight"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            color: 'var(--fg)',
          }}
        >
          {project.title}
          {project.subtitle && (
            <span style={{ color: 'var(--muted)' }}>
              {' '}— {project.subtitle}
            </span>
          )}
        </h1>

        {/* Meta row */}
        <div
          className="flex flex-wrap items-center gap-6 mb-16 pt-8 pb-8"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p
              className="text-xs tracking-[0.1em] uppercase mb-1"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
            >
              Role
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-sans)' }}
            >
              {project.role}
            </p>
          </div>
          <div>
            <p
              className="text-xs tracking-[0.1em] uppercase mb-1"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
            >
              Year
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-sans)' }}
            >
              {project.year}
            </p>
          </div>
          {project.url && (
            <div>
              <p
                className="text-xs tracking-[0.1em] uppercase mb-1"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                Live
              </p>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-opacity hover:opacity-60"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
              >
                View site →
              </a>
            </div>
          )}
        </div>

        {/* Long description */}
        <p
          className="leading-relaxed mb-16"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
            color: 'var(--fg)',
          }}
        >
          {project.longDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-24">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs tracking-[0.1em] uppercase px-3 py-1"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Prev / Next navigation */}
        <div
          className="flex items-center justify-between pt-10"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="group flex flex-col gap-1 transition-opacity hover:opacity-60"
            >
              <span
                className="text-xs tracking-[0.1em] uppercase"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                ← Previous
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--fg)', fontFamily: 'var(--font-serif)' }}
              >
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex flex-col items-end gap-1 transition-opacity hover:opacity-60"
            >
              <span
                className="text-xs tracking-[0.1em] uppercase"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                Next →
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--fg)', fontFamily: 'var(--font-serif)' }}
              >
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </main>
  )

  if (project.password) {
    return (
      <PasswordGate slug={project.slug} password={project.password}>
        {content}
      </PasswordGate>
    )
  }

  return content
}
