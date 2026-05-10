"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// EditModeContext, founder-edit-state per browser-sessie.
//
// Wordt aan-/uitgezet via <EditModeToggle/> en blijft AAN tussen
// dag-springen, refreshes, sessions (localStorage). Components die
// in edit-modus moeten reageren (EditableTekst, hover-styling, etc.)
// roepen useEditModus() aan.
//
// Default bij eerste bezoek voor founder: UIT. Eerst rustig kijken,
// dan pas pencils zien.
// ============================================================

type Ctx = {
  editModusAan: boolean;
  setEditModusAan: (aan: boolean) => void;
};

const EditModeCtx = createContext<Ctx>({
  editModusAan: false,
  setEditModusAan: () => {
    // no-op default — provider hoort er omheen te staan
  },
});

const STORAGE_KEY = "eleva-edit-modus-aan";

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editModusAan, setAanState] = useState(false);

  // Hydrate vanuit localStorage bij mount. We doen dit in useEffect zodat
  // SSR niet probeert localStorage te lezen (zou crashen).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "true") setAanState(true);
    } catch {
      // negeer (private browsing, storage disabled)
    }
  }, []);

  function setEditModusAan(aan: boolean) {
    setAanState(aan);
    try {
      window.localStorage.setItem(STORAGE_KEY, aan ? "true" : "false");
    } catch {
      // negeer
    }
  }

  return (
    <EditModeCtx.Provider value={{ editModusAan, setEditModusAan }}>
      {children}
    </EditModeCtx.Provider>
  );
}

export function useEditModus(): Ctx {
  return useContext(EditModeCtx);
}
