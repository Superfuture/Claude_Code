/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1f1e1d", 2: "#3d3d3a", 3: "#6b6963" },
        bg: { DEFAULT: "#faf9f5", surface: "#ffffff", "surface-2": "#f4f1ea" },
        rule: { DEFAULT: "#e6e1d5", 2: "#ede8db" },
        accent: { DEFAULT: "#c96442", soft: "#f3e6df" },
        code: "#f7f4ec",
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
