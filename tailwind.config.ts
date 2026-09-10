import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        base: {
          DEFAULT: "#05070D",
          50: "#0B0F1A",
          100: "#0D1220",
          200: "#111729",
          300: "#161E33",
        },
        ink: {
          DEFAULT: "#EAF0FF",
          muted: "#96A2C0",
          faint: "#616E90",
        },
        brand: {
          cyan: "#22D3EE",
          sky: "#38BDF8",
          violet: "#8B5CF6",
          purple: "#A855F7",
          pink: "#F472B6",
        },
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#FB7185",
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 60px -24px rgba(3,6,18,0.9)",
        glow: "0 0 0 1px rgba(139,92,246,0.18), 0 20px 60px -20px rgba(139,92,246,0.55)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.2), 0 20px 60px -20px rgba(34,211,238,0.45)",
        soft: "0 18px 50px -30px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(120deg, #22D3EE 0%, #8B5CF6 55%, #F472B6 100%)",
        "brand-gradient-soft":
          "linear-gradient(120deg, rgba(34,211,238,0.16) 0%, rgba(139,92,246,0.16) 55%, rgba(244,114,182,0.14) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s infinite",
        float: "float 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "spin-slow": "spin-slow 22s linear infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
