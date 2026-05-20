import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { FadingVideo } from '../components/FadingVideo';
import { BlurText } from '../components/BlurText';
import { Navbar } from '../components/Navbar';

interface Props {
  onCta: () => void;
}

export function Hero({ onCta }: Props) {
  const initial = { filter: 'blur(10px)', opacity: 0, y: 20 };
  const animate = { filter: 'blur(0px)', opacity: 1, y: 0 };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: '120%', height: '120%' }}
      />

      <Navbar onCta={onCta} />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center">
          <motion.div
            initial={initial}
            animate={animate}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="liquid-glass rounded-full inline-flex items-center gap-2 p-1"
          >
            <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">
              New
            </span>
            <span className="text-sm text-white/90 font-body pr-3">
              First Civilizational AI Agents Deploy 2026
            </span>
          </motion.div>

          <div className="mt-6 flex justify-center">
            <BlurText
              text="Imagine a World Where AI Solves Humanity's Greatest Challenges"
              className="text-[3.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-3xl tracking-[-3px] sm:tracking-[-4px]"
            />
          </div>

          <motion.p
            initial={initial}
            animate={animate}
            transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
            className="mt-6 text-base md:text-lg text-white/85 max-w-2xl font-body font-light leading-snug"
          >
            aeon is building autonomous AI agents to take on humanity's most urgent problems — disease, climate, poverty — at the scale they actually need. Built carefully. Aimed long. Open to the world.
          </motion.p>

          <motion.div
            initial={initial}
            animate={animate}
            transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8"
          >
            <button
              onClick={onCta}
              className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white font-body inline-flex items-center gap-2"
            >
              Join the Mission <ArrowUpRight className="h-5 w-5" />
            </button>
            <a
              href="#capabilities"
              className="text-sm font-medium text-white/85 hover:text-white font-body inline-flex items-center gap-1.5 transition-colors"
            >
              See the work <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={initial}
            animate={animate}
            transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-3 sm:gap-4 mt-10 w-full max-w-md sm:max-w-[460px] px-2 sm:px-0"
          >
            <div className="liquid-glass p-4 sm:p-5 rounded-[1.25rem]">
              <div className="text-3xl sm:text-4xl font-heading italic text-white tracking-[-1px] leading-none">
                1,000 Yrs
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-body font-light mt-2 leading-snug">
                Designed for long-term impact
              </div>
            </div>
            <div className="liquid-glass p-4 sm:p-5 rounded-[1.25rem]">
              <div className="text-3xl sm:text-4xl font-heading italic text-white tracking-[-1px] leading-none">
                8.1B
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-body font-light mt-2 leading-snug">
                Lives within reach
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
