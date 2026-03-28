'use client'

import { motion } from 'framer-motion'

const words = ['Designer.', 'Engineer.', 'Builder.']

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 32, skewY: 2 },
  show: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, delay: 0.9 } },
}

export default function HeroSection() {
  return (
    <div className="relative z-10 flex flex-col justify-end h-full px-10 pb-20 md:px-16 md:pb-24">
      {/* Headline */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="overflow-hidden"
      >
        {words.map((word) => (
          <div key={word} className="overflow-hidden">
            <motion.h1
              variants={item}
              className="block leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(4.5rem, 13vw, 12rem)',
                lineHeight: 0.92,
                color: 'var(--fg)',
              }}
            >
              {word}
            </motion.h1>
          </div>
        ))}
      </motion.div>

      {/* Sub-line */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-8 flex items-center gap-8"
      >
        <p
          className="tracking-[0.22em] uppercase"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', fontSize: '11px', letterSpacing: '0.22em' }}
        >
          Forbes 30 Under 30 &nbsp;·&nbsp; Founder &nbsp;·&nbsp; San Francisco
        </p>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-16 flex items-center gap-3"
        style={{ color: 'var(--muted)' }}
      >
        <div
          className="w-8 h-px"
          style={{ background: 'var(--muted)' }}
        />
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Scroll
        </span>
      </motion.div>
    </div>
  )
}
