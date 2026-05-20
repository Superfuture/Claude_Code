import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const COLS = [
  {
    label: 'About',
    links: [
      { label: 'Mission', href: '#' },
      { label: 'Approach', href: '#capabilities' },
      { label: 'Manifesto', href: '#' },
      { label: 'Team', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    label: 'Work',
    links: [
      { label: 'Cure Engine', href: '#capabilities' },
      { label: 'Climate Reversal', href: '#capabilities' },
      { label: 'Prosperity Loop', href: '#capabilities' },
      { label: 'Research papers', href: '#' },
      { label: 'Open source', href: '#' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Brand kit', href: '/brand.html' },
      { label: 'Press kit', href: '#' },
      { label: 'Investor brief', href: '#' },
      { label: 'Updates', href: '#subscribe' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    label: 'Contact',
    links: [
      { label: 'hello@aeon.ai', href: 'mailto:hello@aeon.ai' },
      { label: 'Press inquiries', href: 'mailto:press@aeon.ai' },
      { label: 'Partnerships', href: 'mailto:partners@aeon.ai' },
      { label: 'Twitter / X', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-black overflow-hidden">
      <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-10">
        {/* link grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="col-span-2 md:col-span-4 flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="liquid-glass w-10 h-10 inline-flex items-center justify-center rounded-full">
                <span className="font-heading italic text-white text-xl leading-none">a</span>
              </div>
              <span className="font-heading italic text-white text-2xl tracking-[-0.03em]">aeon</span>
            </div>
            <p className="text-sm md:text-base text-white/65 font-body font-light leading-snug max-w-xs">
              Building autonomous AI agents to take on humanity's most urgent problems. Built carefully. Aimed long. Open to the world.
            </p>
            <a
              href="#subscribe"
              className="self-start mt-2 liquid-glass rounded-full inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white font-body"
            >
              Join the mission <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>

          {COLS.map((col, i) => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
              className="col-span-1 md:col-span-2"
            >
              <div className="text-[11px] text-white/45 font-body font-medium tracking-[0.2em] mb-5">
                {col.label.toUpperCase()}
              </div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/85 hover:text-white font-body font-light transition-colors underline-offset-4 decoration-white/30 hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* giant wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative mt-24 md:mt-32 mb-16 select-none"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(232,218,189,0.12) 0%, rgba(232,218,189,0.03) 35%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="relative font-heading italic text-white text-center leading-[0.78] tracking-[-0.06em]"
            style={{ fontSize: 'clamp(5rem, 28vw, 28rem)' }}
          >
            aeon
            <span
              className="font-heading italic"
              style={{ color: '#E8DABD', fontSize: '0.18em', verticalAlign: 'top', marginLeft: '-0.1em' }}
            >
              *
            </span>
          </div>
        </motion.div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* bottom bar */}
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-[11px] text-white/45 font-body tracking-[0.15em]">
            <span>© 2026 AEON · AI FOR HUMANITY+</span>
            <span className="hidden md:inline">SAN FRANCISCO</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-white/45 font-body tracking-[0.15em]">
            <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-white transition-colors">TERMS</a>
            <a href="/brand.html" className="hover:text-white transition-colors">BRAND</a>
            <span className="font-heading italic text-white/70 normal-case tracking-normal text-sm">
              For the next thousand years.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
