import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Avorio caldo, come l'intonaco delle case di borgata
        cream: {
          50: "#FFFCF6",
          DEFAULT: "#FBF6EC",
          100: "#F6EEDD",
          200: "#EBDDC2",
          300: "#DCC69E",
        },
        // Blu cobalto delle maioliche siciliane
        maiolica: {
          50: "#EEF3FB",
          100: "#D8E3F4",
          200: "#B0C6E8",
          300: "#7FA0D4",
          400: "#4F78BC",
          500: "#2E58A2",
          600: "#214689",
          700: "#1B386E",
          800: "#162C56",
          900: "#101F3D",
          950: "#0A1428",
        },
        limone: {
          100: "#FDF3C8",
          200: "#FBE68F",
          300: "#F7D75C",
          400: "#F2C230",
          500: "#DDA70F",
          600: "#B5850A",
        },
        arancia: {
          100: "#FCE3D3",
          400: "#EE8A4F",
          500: "#E06A2C",
          600: "#C2531B",
          700: "#9C4115",
        },
        ink: {
          DEFAULT: "#18202F",
          soft: "#4B5567",
          muted: "#6E7787",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,31,61,0.04), 0 8px 24px -8px rgba(16,31,61,0.12)",
        lift: "0 2px 4px rgba(16,31,61,0.06), 0 20px 40px -16px rgba(16,31,61,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "sheet-up": "sheet-up 0.35s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
