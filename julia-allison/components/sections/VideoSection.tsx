"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export function VideoSection() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <section id="speaking" ref={ref} className="py-24 lg:py-32 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-teal block mb-3">
            Speaking Reel
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight">
            Julia in <span className="gradient-text">action</span>
          </h2>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-teal/10 aspect-video group"
        >
          {/* Gradient border */}
          <div
            className="absolute inset-0 rounded-2xl p-px pointer-events-none z-10"
            style={{ background: "linear-gradient(135deg, #1FB6BF, #6B8CFF, #C47BF4, #FF7BAC)" }}
          >
            <div className="w-full h-full bg-ink rounded-2xl" />
          </div>

          {/* Actual content inside border */}
          <div className="absolute inset-[1.5px] rounded-2xl overflow-hidden z-20">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/video-poster.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            >
              <source src="/video/speaking-reel.mp4" type="video/mp4" />
            </video>

            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent transition-opacity duration-300 ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
            />

            {/* Play button for unmuted playback */}
            {!playing && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center z-30 group/btn"
                aria-label="Play speaking reel with sound"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/20 scale-150 blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover/btn:scale-110">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M8 5.14v14l11-7-11-7z"
                        fill="url(#playGrad)"
                        stroke="none"
                      />
                      <defs>
                        <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1FB6BF" />
                          <stop offset="100%" stopColor="#C47BF4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </button>
            )}

            {/* Pull quote overlay */}
            {!playing && (
              <div className="absolute bottom-6 left-6 right-6 z-30">
                <p className="font-serif italic text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl">
                  "She commands any room she&apos;s in — a rare combination of substance and magnetism."
                </p>
                <span className="text-white/60 text-xs uppercase tracking-widest mt-2 block font-sans">
                  — Wired Magazine
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Topics row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {[
            "Technology & Culture",
            "The Future of Media",
            "Modern Relationships",
            "Digital Identity",
            "Women in Tech",
            "Radical Transparency",
          ].map((topic) => (
            <span
              key={topic}
              className="gradient-border bg-white text-ink-muted text-xs font-medium px-4 py-2 rounded-full"
            >
              {topic}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
