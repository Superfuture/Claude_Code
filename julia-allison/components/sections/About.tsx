"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="bg-gradient-section-teal py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Photo */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto lg:mx-0">
              <Image
                src="/images/about.jpg"
                alt="Julia Allison"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
              {/* Gradient frame overlay */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
            </div>
            {/* Decorative gradient blob behind photo */}
            <div
              className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 rounded-full opacity-30 blur-3xl"
              style={{ background: "linear-gradient(135deg, #1FB6BF, #C47BF4)" }}
            />
          </motion.div>

          {/* Text */}
          <div>
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="mb-4"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-teal">
                About Julia
              </span>
            </motion.div>

            <motion.h2
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="font-serif text-4xl md:text-5xl font-bold text-ink mb-6 leading-tight"
            >
              At the <span className="gradient-underline">intersection</span> of
              <br className="hidden md:block" /> media & culture
            </motion.h2>

            <motion.blockquote
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="font-serif italic text-xl text-ink-muted leading-relaxed mb-8 pl-5 border-l-2 border-teal"
            >
              "I&apos;ve always believed that the most interesting stories live at the edges — where technology meets humanity, where ambition meets vulnerability."
            </motion.blockquote>

            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="space-y-4 text-base text-ink-muted leading-relaxed"
            >
              {/* Replace with Julia's actual bio */}
              <p>
                Julia Allison is one of America&apos;s most recognized media personalities — a journalist, columnist, and television personality whose work has appeared in publications from The New York Times to Wired, and on screens from Bravo to NBC.
              </p>
              <p>
                Known for her incisive observations on technology, relationships, and modern life, Julia has built a career at the forefront of the digital age, writing about and living through the very changes she reports on.
              </p>
              <p>
                Whether on stage, on air, or on the page, she brings the same rare combination of intellectual rigor and radical honesty that has made her one of the most compelling voices of her generation.
              </p>
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="mt-10 flex flex-wrap gap-6"
            >
              {[
                { value: "15+", label: "Years in Media" },
                { value: "200+", label: "Publications" },
                { value: "50+", label: "TV Appearances" },
                { value: "100+", label: "Speaking Engagements" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-serif text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-ink-light mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
