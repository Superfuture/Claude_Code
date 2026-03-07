import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FAF9F6",
        "off-white": "#F5F4F0",
        ink: "#111010",
        "ink-muted": "#4A4A4A",
        "ink-light": "#8A8A8A",
        teal: {
          DEFAULT: "#1FB6BF",
          light: "#5ED3D9",
          dark: "#0E8A92",
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #1FB6BF 0%, #6B8CFF 35%, #C47BF4 65%, #FF7BAC 85%, #FF9F6B 100%)",
        "gradient-brand-soft":
          "linear-gradient(135deg, #1FB6BF22 0%, #6B8CFF22 35%, #C47BF422 65%, #FF7BAC22 100%)",
        "gradient-hero":
          "radial-gradient(ellipse 80% 60% at 60% 40%, #1FB6BF18 0%, #C47BF412 50%, transparent 100%)",
        "gradient-section-teal":
          "linear-gradient(180deg, #FAF9F6 0%, #E8F7F8 50%, #FAF9F6 100%)",
        "gradient-section-violet":
          "linear-gradient(180deg, #FAF9F6 0%, #F0ECFD 50%, #FAF9F6 100%)",
        "gradient-section-rose":
          "linear-gradient(180deg, #FAF9F6 0%, #FDF0F5 50%, #FAF9F6 100%)",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "marquee-slow": "marquee 50s linear infinite",
        shimmer: "shimmer 4s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        glow: "glow 6s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
