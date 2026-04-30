"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VCardUploader } from "@/components/vandaag/inline-embeds/VCardUploader";

// ============================================================
// BulkImportSectie — uitklap-blok bovenaan /namenlijst voor wie
// elke dag een nieuwe batch contacten wil toevoegen.
//
// Hergebruikt de VCardUploader (drie routes: native picker, zelf
// typen, vCard-bestand met selectie). Werkt zonder taak-koppeling
// — geen 'klaar'-state die ergens aan vasthangt.
//
// Bedoeld als ankerpunt voor: "ik heb 2000 contacten op m'n
// telefoon, ik wil ze niet allemaal in één keer". Eerste batch op
// dag 1 in de vandaag-flow, daarna kom je hier elke keer terug
// voor de volgende laag.
// ============================================================

export function BulkImportSectie() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-xl border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-3 group"
    >
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
        <div className="flex-1 min-w-0">
          <p className="text-cm-gold font-semibold text-sm flex items-center gap-2">
            ➕ Importeer meer contacten uit je telefoon
          </p>
          <p className="text-cm-white opacity-70 text-xs mt-0.5 leading-relaxed">
            Geen drukte — voeg een batch tegelijk toe. Dubbelen filtert ELEVA
            er automatisch uit.
          </p>
        </div>
        <span className="text-cm-gold text-xs transition-transform group-open:rotate-180 flex-shrink-0">
          ▼
        </span>
      </summary>

      {open && (
        <div className="mt-4 pt-4 border-t border-cm-border">
          <VCardUploader
            opVoltooid={() => {
              // Refresh zodat de nieuwe namen gelijk in de lijst/pipeline
              // verschijnen (server-component data wordt opnieuw opgehaald).
              router.refresh();
            }}
          />
        </div>
      )}
    </details>
  );
}
