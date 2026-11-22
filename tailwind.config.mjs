/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        ink: "var(--text)",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        accent: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
      },
      fontFamily: {
        sans: ["var(--font-ui)"],
        mono: ["var(--font-code)"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        "card-hover":
          "0 4px 12px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.25)",
        "card-hover-dark":
          "0 4px 16px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.2)",
        "ios": "0 0 0 1px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
        "ios-dark": "0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        card: "0.75rem",
        ios: "0.625rem",
      },
      backdropBlur: {
        ios: "20px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};
