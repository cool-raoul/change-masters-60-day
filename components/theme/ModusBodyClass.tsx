// File: components/theme/ModusBodyClass.tsx
//
// Server-component wrapper die op basis van de user-modus (sprint/core/pro)
// een class op de wrapper-div zet zodat heel de app van de Core-user een
// luchtigere kleurstelling krijgt (en de Sprint-user de huidige donkere).
//
// Werkt naast .light (theme) en .core-v6 (route-specifiek voor /core-v6).
// CSS-rules:
//   .modus-core           : luchtig grijs in dark-theme
//   .light .modus-core    : wittere variant in light-theme
//
// Renderd op root-layout-niveau, voor alle routes. Bij niet-ingelogd:
// geen modus → geen class. Bij modus=null (nog niet gekozen): geen class.

import { createClient } from "@/lib/supabase/server";

export async function ModusBodyClass({
  children,
}: {
  children: React.ReactNode;
}) {
  let modusClass = "";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("modus")
        .eq("id", user.id)
        .maybeSingle();
      const modus = (profile as { modus?: string | null } | null)?.modus ?? null;
      if (modus === "core") modusClass = "modus-core";
      else if (modus === "sprint") modusClass = "modus-sprint";
      else if (modus === "pro") modusClass = "modus-pro";
    }
  } catch {
    modusClass = "";
  }
  // Wrapper moet zelf min-h-screen + bg-cm-black hebben zodat de
  // achtergrond gegarandeerd de modus-kleur pakt en geen kale body-zwart
  // doorkomt als de modus-class de kleur-variabelen overschrijft.
  // Lege class als modus onbekend: dan default styling (Sprint-donker).
  return (
    <div className={`${modusClass} min-h-screen bg-cm-black text-cm-white`}>
      {children}
    </div>
  );
}
