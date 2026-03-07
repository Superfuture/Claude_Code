'use client'

import { motion } from 'framer-motion'

const fade = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
  },
})

const quotes = [
  { quote: 'Ingenious', source: 'Fast Company' },
  { quote: 'Simple and brilliant', source: 'TechCrunch' },
  { quote: 'Charming and incredibly unique', source: 'Mashable' },
]

const credentials = [
  'Forbes 30 Under 30',
  'Business Insider 25 Under 25',
  'US Patent 8,869,068',
  'Stanford Guest Lecturer',
  'TEDx Speaker',
]

export default function AboutSection() {
  return (
    <div
      id="about"
      className="relative z-10 flex flex-col justify-center h-full px-10 py-20 md:px-16"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          <motion.p
            variants={fade(0)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-xs tracking-[0.2em] uppercase mb-8"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
          >
            About
          </motion.p>

          <motion.p
            variants={fade(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="leading-relaxed mb-6"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: 'var(--fg)',
            }}
          >
            Award-winning designer, engineer, and entrepreneur. Founded his first company at 8.
            Sold his second to Yahoo! at 21.
          </motion.p>

          <motion.p
            variants={fade(0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-sm leading-relaxed mb-10"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
          >
            Working at the intersection of technology, art, and pop culture — building things
            that enable creative connection. Currently building{' '}
            <a
              href="https://official.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-60"
              style={{ color: 'var(--fg)' }}
            >
              Official
            </a>
            .
          </motion.p>

          {/* Press quotes */}
          <motion.div
            variants={fade(0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-6 mb-10"
          >
            {quotes.map(({ quote, source }) => (
              <div key={source}>
                <p
                  className="text-sm italic mb-1"
                  style={{ color: 'var(--fg)', fontFamily: 'var(--font-serif)' }}
                >
                  &ldquo;{quote}&rdquo;
                </p>
                <p
                  className="text-xs tracking-[0.1em]"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
                >
                  — {source}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Social links */}
          <motion.div
            variants={fade(0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex items-center gap-6"
          >
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
                className="text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-60"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                {label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Right — portrait + credentials */}
        <motion.div
          variants={fade(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-8"
        >
          {/* Portrait — CSS bg, silently degrades to gradient if no file */}
          <div
            className="relative w-full aspect-[4/5] overflow-hidden flex items-center justify-center"
            style={{
              border: '1px solid var(--border)',
              backgroundImage: 'url(https://assets.dunked.com/assets/prod/117833/p4jtspn6mio1736188435.jpeg), linear-gradient(135deg, #0d1520 0%, #1a2535 50%, #0a1018 100%)',
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, center',
              filter: 'grayscale(1)',
              transition: 'filter 0.7s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.filter = 'grayscale(0)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.filter = 'grayscale(1)')}
          >
          </div>

          {/* Credentials */}
          <ul className="space-y-2">
            {credentials.map((c) => (
              <li
                key={c}
                className="flex items-center gap-3 text-xs tracking-wide"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
              >
                <span style={{ color: 'var(--accent)' }}>—</span>
                {c}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
