import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0891B2",
          light: "#06B6D4",
          dark: "#0E7490",
        },
        secondary: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        dark: {
          bg: "#0F172A",
          surface: "#1E293B",
          surface2: "#263548",
          border: "#334155",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #0891B2 0%, #0E7490 50%, #10B981 100%)",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(8, 145, 178, 0.3), 0 0 40px rgba(8, 145, 178, 0.1)",
        "glow-secondary": "0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)",
      },
    },
  },
  plugins: [],
}

export default config