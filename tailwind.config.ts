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
        // ELEVA "Stiller met glow" palet (mockup 4, akkoord 7 mei 2026).
        // Aangepast 10 mei 2026 avond op basis van Raoul's feedback +
        // mockup-screenshot: dieper zwart, subtielere borders, warmer
        // goud. De vorige (donkergrijs) waarden voelden niet strak genoeg;
        // de mockup heeft een diep-zwart-met-fluweel-glow karakter.
        "cm-black": "#0c0e12",       // diep donker, bijna zwart maar nog warmte
        "cm-surface": "#15171c",     // cards: subtiele elevatie boven achtergrond
        "cm-surface-2": "#1d2026",   // sub-cards / accents, één stapje lichter
        "cm-border": "#262a32",      // borders subtieler, bijna onzichtbaar maar voelbaar
        "cm-gold": "#c4a04a",        // warmer rijker goud, amber-richting
        "cm-gold-light": "#e0bc62",  // helderder highlight voor accent-buttons
        "cm-gold-dim": "#5d4a25",    // donker goud voor borders/lijnen
        "cm-white": "#e8e6e0",       // gebroken cream, zachter dan puur wit
        "cm-muted": "#8a8b8e",       // neutraal grijs
        // Pipeline fase kleuren, functioneel behouden
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
          "linear-gradient(135deg, #c4a04a 0%, #e0bc62 50%, #c4a04a 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #0c0e12 0%, #15171c 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(196, 160, 74, 0.15)",
        "gold-lg": "0 0 40px rgba(196, 160, 74, 0.2)",
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
          "0%, 100%": { boxShadow: "0 0 5px rgba(196, 160, 74, 0.25)" },
          "50%": { boxShadow: "0 0 20px rgba(196, 160, 74, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
