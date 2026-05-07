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
        // Aangepast 7 mei 2026 ochtend: minder zwart, meer donkergrijs.
        // De waarden komen nu dichter bij wat in de HTML-mockup als
        // 'frame-binnenin' werd getoond, niet de zwarte rand eromheen.
        "cm-black": "#181b21",       // donkergrijs (was #0d0e10 te donker, was vroeger #0A0A0A pure black)
        "cm-surface": "#21252d",     // lichter grijs voor cards en topbar
        "cm-surface-2": "#2a2f38",   // nog iets lichter voor sub-cards / accents
        "cm-border": "#363c47",      // border subtiel mee opgehoogd voor contrast
        "cm-gold": "#b89a52",        // gedempt goud, niet knal (was #C9A84C)
        "cm-gold-light": "#d4af52",  // iets dimmer dan oorspronkelijk light
        "cm-gold-dim": "#6e5a30",    // donker goud voor borders/lijnen
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
          "linear-gradient(135deg, #b89a52 0%, #d4af52 50%, #b89a52 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #16181c 0%, #1a1d22 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(184, 154, 82, 0.15)",
        "gold-lg": "0 0 40px rgba(184, 154, 82, 0.2)",
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
          "0%, 100%": { boxShadow: "0 0 5px rgba(184, 154, 82, 0.25)" },
          "50%": { boxShadow: "0 0 20px rgba(184, 154, 82, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
