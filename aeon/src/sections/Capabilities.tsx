import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FadingVideo } from '../components/FadingVideo';

interface CardProps {
  icon: ReactNode;
  title: string;
  body: string;
  tags: string[];
}

function Card({ icon, title, body, tags }: CardProps) {
  return (
    <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="liquid-glass w-11 h-11 rounded-[0.75rem] flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
          {tags.map((t) => (
            <span
              key={t}
              className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1" />
      <div className="mt-6">
        <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
          {title}
        </h3>
        <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
          {body}
        </p>
      </div>
    </div>
  );
}

const cards: CardProps[] = [
  {
    icon: (
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
      </svg>
    ),
    title: 'Cure Engine',
    body: 'AI agents running drug discovery, protein folding, and adaptive clinical trials at unprecedented scale. The end of disease, within our lifetime.',
    tags: ['Drug Discovery', 'Protein Folding', 'Adaptive Trials', 'Open Access'],
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
      </svg>
    ),
    title: 'Climate Reversal',
    body: 'Autonomous agents for carbon removal, fusion research acceleration, and global ecosystem restoration — reversing what we broke.',
    tags: ['Carbon Removal', 'Fusion Research', 'Ecosystem AI', 'Open Source'],
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
      </svg>
    ),
    title: 'Prosperity Loop',
    body: 'Universal access to expert-level intelligence — AI tutors, clinicians, and economic infrastructure for every language, every village, everywhere.',
    tags: ['Universal Tutor', 'Local Languages', 'Economic Infra', 'Always On'],
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="relative min-h-screen w-full overflow-hidden bg-black">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 flex flex-col min-h-screen">
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-auto"
        >
          <div className="text-sm font-body text-white/80 mb-6 tracking-[0.15em]">// CAPABILITIES</div>
          <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
            Humanity
            <br />
            accelerated.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
              whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
            >
              <Card {...c} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
