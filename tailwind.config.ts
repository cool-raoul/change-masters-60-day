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
        // ELEVA "Stiller met glow" palet, nu met thema-switch via CSS-vars.
        // Concrete waardes staan in app/globals.css. Dark = default, light
        // wordt geactiveerd door class="light" op <html> (zie ThemeContext).
        // De `<alpha-value>`-modifier laat Tailwind opacity-utilities zoals
        // bg-cm-gold/20 correct genereren.
        "cm-black": "rgb(var(--cm-black) / <alpha-value>)",
        "cm-surface": "rgb(var(--cm-surface) / <alpha-value>)",
        "cm-surface-2": "rgb(var(--cm-surface-2) / <alpha-value>)",
        "cm-border": "rgb(var(--cm-border) / <alpha-value>)",
        "cm-gold": "rgb(var(--cm-gold) / <alpha-value>)",
        "cm-gold-light": "rgb(var(--cm-gold-light) / <alpha-value>)",
        "cm-gold-dim": "rgb(var(--cm-gold-dim) / <alpha-value>)",
        "cm-white": "rgb(var(--cm-white) / <alpha-value>)",
        "cm-muted": "rgb(var(--cm-muted) / <alpha-value>)",
        "cm-on-gold": "rgb(var(--cm-on-gold) / <alpha-value>)",
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
        // De gradient-gold-utility staat ook in globals.css (CSS-var
        // versie), die wint omdat-ie meeswitcht met het thema. Deze
        // Tailwind-config-versie blijft voor backwards-compat met
        // bestaande bg-gradient-gold-aanroepen.
        "gradient-gold":
          "linear-gradient(135deg, rgb(var(--cm-gold)) 0%, rgb(var(--cm-gold-light)) 50%, rgb(var(--cm-gold)) 100%)",
        "gradient-dark":
          "linear-gradient(135deg, rgb(var(--cm-black)) 0%, rgb(var(--cm-surface)) 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgb(var(--cm-gold) / 0.15)",
        "gold-lg": "0 0 40px rgb(var(--cm-gold) / 0.2)",
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
