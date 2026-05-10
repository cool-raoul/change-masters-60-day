"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// ThemeContext — dark of light, persistent via localStorage.
//
// Dark is default. Light wordt geactiveerd door class 'light' op
// <html>. Anti-flash gebeurt via een inline-script in app/layout.tsx
// dat synchronously de classe set vóór React hydrate (zie
// ThemeInlineScript). Deze context handelt user-driven toggle af.
// ============================================================

export type Thema = "dark" | "light";

type Ctx = {
  thema: Thema;
  zetThema: (t: Thema) => void;
};

const ThemaCtx = createContext<Ctx>({
  thema: "dark",
  zetThema: () => {},
});

const STORAGE_KEY = "eleva-thema";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [thema, zetThemaState] = useState<Thema>("dark");

  // Sync vanuit DOM-class op mount (inline script heeft 'm al gezet).
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    zetThemaState(isLight ? "light" : "dark");
  }, []);

  function zetThema(t: Thema) {
    zetThemaState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // negeer (private browsing, storage disabled)
    }
    if (t === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }

  return (
    <ThemaCtx.Provider value={{ thema, zetThema }}>
      {children}
    </ThemaCtx.Provider>
  );
}

export function useThema(): Ctx {
  return useContext(ThemaCtx);
}

/**
 * Inline-script om vóór React-hydratie de juiste class op <html>
 * te zetten. Voorkomt flash-of-wrong-theme bij eerste paint.
 * Returnt een string met JavaScript-code voor dangerouslySetInnerHTML.
 */
export const themeInlineScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch(e) {}
})();
`;
