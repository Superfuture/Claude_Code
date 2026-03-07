"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pressOutlets = [
  { name: "The New York Times", abbr: "NYT" },
  { name: "Wired", abbr: "WIRED" },
  { name: "Bravo", abbr: "BRAVO" },
  { name: "NBC", abbr: "NBC" },
  { name: "Vogue", abbr: "VOGUE" },
  { name: "TechCrunch", abbr: "TC" },
  { name: "The Guardian", abbr: "GUARDIAN" },
  { name: "Elle", abbr: "ELLE" },
  { name: "Vanity Fair", abbr: "VF" },
  { name: "Forbes", abbr: "FORBES" },
  { name: "CNN", abbr: "CNN" },
  { name: "The Atlantic", abbr: "ATLANTIC" },
];

// Duplicate for seamless loop
const allOutlets = [...pressOutlets, ...pressOutlets];

function PressLogo({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center h-10 px-6 group">
      <span className="font-serif font-bold text-xl tracking-tight text-ink/30 group-hover:text-ink/70 transition-colors duration-300 whitespace-nowrap select-none">
        {name}
      </span>
    </div>
  );
}

export function PressMarquee() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="press" ref={ref} className="py-16 bg-white overflow-hidden">
      {/* Gradient rules */}
      <div className="h-px bg-gradient-brand mb-10 mx-6 lg:mx-8 rounded-full opacity-40" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 px-6"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-light">
          As Seen In
        </span>
      </motion.div>

      {/* Marquee wrapper — fade edges */}
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, white, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(270deg, white, transparent)" }}
        />

        <div className="flex animate-marquee">
          {allOutlets.map((outlet, i) => (
            <PressLogo key={`${outlet.name}-${i}`} name={outlet.name} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-brand mt-10 mx-6 lg:mx-8 rounded-full opacity-40" />
    </section>
  );
}
