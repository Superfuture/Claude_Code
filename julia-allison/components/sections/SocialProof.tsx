"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pressQuotes = [
  {
    quote:
      "Julia Allison is one of the most fascinating figures to emerge from the first wave of the digital age — part journalist, part performance artist, fully alive to the absurdity and wonder of modern life.",
    outlet: "The New York Times",
    year: "2023",
  },
  {
    quote:
      "She saw the future of media before the rest of us had even begun to imagine it, and has been living — and writing — in that future ever since.",
    outlet: "Wired",
    year: "2022",
  },
  {
    quote:
      "Allison brings a rare intellectual honesty to every conversation. She doesn't just observe culture; she interrogates it.",
    outlet: "The Atlantic",
    year: "2023",
  },
];

const testimonials = [
  {
    quote:
      "Julia was the best decision we made for our conference. She had the room riveted from the first word to the last. Three months later people are still talking about it.",
    author: "Sarah Chen",
    role: "VP Programming, SXSW",
  },
  {
    quote:
      "Working with Julia elevated our entire campaign. She understood our brand instinctively and delivered content that felt genuinely, unmistakably hers — which is exactly what we needed.",
    author: "Marcus Webb",
    role: "Chief Marketing Officer, Lumen Technologies",
  },
];

const nameDrop = [
  "Arianna Huffington",
  "Reid Hoffman",
  "Sheryl Sandberg",
  "Tim Ferriss",
  "Brené Brown",
  "Malcolm Gladwell",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gradient-section-violet">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24">
        {/* Press Quotes */}
        <div>
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-teal block mb-3">
              What They&apos;re Saying
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink">
              Press & <span className="gradient-text">Recognition</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pressQuotes.map((item, i) => (
              <motion.div
                key={item.outlet}
                custom={i + 1}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300"
              >
                <div>
                  <div
                    className="text-5xl font-serif leading-none mb-4 gradient-text"
                    aria-hidden
                  >
                    "
                  </div>
                  <p className="font-serif italic text-base text-ink-muted leading-relaxed">
                    {item.quote}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-black/5 flex justify-between items-end">
                  <span className="font-serif font-bold text-ink text-sm">{item.outlet}</span>
                  <span className="text-xs text-ink-light">{item.year}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Client Testimonials */}
        <div>
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-teal block mb-3">
              Testimonials
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink">
              From those who&apos;ve{" "}
              <span className="gradient-text">worked with Julia</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.author}
                custom={6 + i}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-black/5 overflow-hidden"
              >
                {/* Gradient glow corner */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, #C47BF4, transparent)",
                  }}
                />
                <div className="text-4xl font-serif leading-none mb-4 gradient-text" aria-hidden>
                  "
                </div>
                <p className="font-serif italic text-lg text-ink-muted leading-relaxed mb-8">
                  {item.quote}
                </p>
                <div>
                  <div className="font-semibold text-ink text-sm">{item.author}</div>
                  <div className="text-xs text-ink-light mt-0.5">{item.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notable Associations */}
        <motion.div
          custom={9}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-light mb-8">
            Has shared stages and pages with
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {nameDrop.map((name) => (
              <span
                key={name}
                className="gradient-border bg-white text-ink-muted font-serif italic text-sm px-5 py-2.5 rounded-full"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
