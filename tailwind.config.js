/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0f1d",
        "background-secondary": "#0d1424",
        cyan: {
          DEFAULT: "#00f2fe",
          400: "#38effc",
          500: "#00f2fe",
        },
        purple: {
          DEFAULT: "#9d4edd",
          400: "#b572ed",
          500: "#9d4edd",
        },
        emerald: {
          DEFAULT: "#10b981",
          400: "#34d399",
          500: "#10b981",
        },
        mint: "#6ee7b7",
        amber: {
          DEFAULT: "#f59e0b",
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        heading: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      animation: {
        fade: "fade 0.4s ease-out forwards",
        rise: "rise 0.5s ease-out forwards",
        pulseGlow: "pulseGlow 2.5s infinite",
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.45" },
        },
      },
    },
  },
  plugins: [],
};
