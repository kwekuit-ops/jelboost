import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff9ff",
          100: "#dff2ff",
          200: "#b9e6ff",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        accent: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark:    "#0f0f1a",
          card:    "#f8faff",
          "card-dark": "#1a1a2e",
          border:  "#e2e8f0",
          "border-dark": "#2d2d4e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #082f49 0%, #0c4a6e 45%, #0284c7 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(6,182,212,0.06) 100%)",
        "brand-gradient": "linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #06b6d4 100%)",
        "dark-gradient": "linear-gradient(180deg, #08111d 0%, #102136 100%)",
        "cta-gradient": "linear-gradient(135deg, #075985 0%, #0284c7 50%, #0891b2 100%)",
      },
      boxShadow: {
        brand: "0 4px 24px rgba(14,165,233,0.30)",
        "brand-lg": "0 8px 48px rgba(14,165,233,0.35)",
        glow: "0 0 40px rgba(14,165,233,0.22)",
        "glow-accent": "0 0 40px rgba(6,182,212,0.20)",
        card: "0 2px 16px rgba(0,0,0,0.06)",
        "card-dark": "0 2px 16px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 1.5s infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        gradient: "gradientShift 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
