"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const slides = [
  {
    src: "/images/hero-1.jpg",
    alt: "Julia Allison — editorial portrait",
    position: "object-[center_20%]",
  },
  {
    src: "/images/hero-2.jpg",
    alt: "Julia Allison — speaking",
    position: "object-center",
  },
  {
    src: "/images/hero-3.jpg",
    alt: "Julia Allison — media appearance",
    position: "object-[center_15%]",
  },
];

const SLIDE_DURATION = 5000;

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-hero animate-glow pointer-events-none" />

      {/* Photo carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].src}
              alt={slides[current].alt}
              fill
              priority={current === 0}
              className={`object-cover ${slides[current].position}`}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay gradient — left side for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/60 to-cream/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-transparent to-cream/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 w-full">
        <div className="max-w-2xl">
          {/* Pre-title label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="h-px w-8 bg-gradient-brand block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Media Personality · Author · Speaker
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif font-black leading-[0.9] mb-6"
            style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
          >
            <span className="gradient-text">Julia</span>
            <br />
            <span className="gradient-text">Allison</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="font-serif italic text-xl md:text-2xl text-ink-muted leading-relaxed mb-10 max-w-lg"
          >
            {/* Replace with Julia&apos;s actual tagline */}
            "The intersection of technology, media, and the very human desire to be known."
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#book">
              <button className="relative overflow-hidden px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal/30 group">
                <span
                  className="absolute inset-0 bg-gradient-brand bg-[length:200%_200%] animate-[gradientShift_6s_ease_infinite]"
                />
                <span className="relative">Book Julia</span>
              </button>
            </a>
            <a href="#about">
              <button className="gradient-border bg-white/80 backdrop-blur-sm text-ink text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                About Julia
              </button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-6 lg:left-8 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setIsAutoPlaying(false);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-gradient-brand" : "w-4 bg-ink/20"
            }`}
            style={
              i === current
                ? { background: "linear-gradient(90deg, #1FB6BF, #C47BF4)" }
                : undefined
            }
          />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-ink-light rotate-90 origin-center">
          scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-ink-light to-transparent" />
      </motion.div>
    </section>
  );
}
