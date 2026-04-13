"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { vertaal, Taal } from "./vertalingen";

interface TaalContextType {
  taal: Taal;
  v: (sleutel: string) => string;
  setTaal: (taal: Taal) => void;
}

const TaalContext = createContext<TaalContextType>({
  taal: "nl",
  v: (sleutel: string) => sleutel,
  setTaal: () => {},
});

export function TaalProvider({
  children,
  initialTaal,
}: {
  children: ReactNode;
  initialTaal?: Taal;
}) {
  const [taal, setTaal] = useState<Taal>(initialTaal || "nl");

  useEffect(() => {
    if (!initialTaal) {
      // Lees taal uit Supabase user metadata
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.user_metadata?.taal) {
          setTaal(user.user_metadata.taal as Taal);
        }
      });
    }
  }, [initialTaal]);

  function v(sleutel: string) {
    return vertaal(sleutel, taal);
  }

  return (
    <TaalContext.Provider value={{ taal, v, setTaal }}>
      {children}
    </TaalContext.Provider>
  );
}

export function useTaal() {
  return useContext(TaalContext);
}
