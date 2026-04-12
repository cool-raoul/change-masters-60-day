import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Change Masters brand kleuren
        "cm-black": "#0A0A0A",
        "cm-surface": "#111111",
        "cm-surface-2": "#1A1A1A",
        "cm-border": "#2A2A2A",
        "cm-gold": "#C9A84C",
        "cm-gold-light": "#E8C96B",
        "cm-gold-dim": "#8A6E28",
        "cm-white": "#F5F5F0",
        "cm-muted": "#888888",
        // Pipeline fase kleuren
        "fase-lead": "#3A3A3A",
        "fase-uitgenodigd": "#1A2A3A",
        "fase-presentatie": "#2A1A3A",
        "fase-followup": "#2A2A1A",
        "fase-klant": "#1A2A1A",
        "fase-partner": "#1A2A1A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["DM Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #C9A84C 0%, #E8C96B 50%, #C9A84C 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #111111 0%, #1A1A1A 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(201, 168, 76, 0.15)",
        "gold-lg": "0 0 40px rgba(201, 168, 76, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(201, 168, 76, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
