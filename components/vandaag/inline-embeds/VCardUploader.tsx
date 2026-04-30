"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// VCardUploader — inline-embed voor /vandaag dag 1 'telefoon-import'
//
// Member uploadt een .vcf-bestand vanaf zijn telefoon, wij parsen het
// hier in de browser (lichtgewicht regex), tonen een preview, en
// schrijven het bij bevestiging in bulk weg in de prospects-tabel.
//
// Geen wegnavigeren — de hele actie blijft in de dag-flow.
//
// Vereenvoudigde vCard-parser: pakt FN: (full name) en eerste TEL:
// per BEGIN:VCARD-blok. vCard 3.0 én 4.0 supported, ook iOS-export
// met 'TEL;type=...:'-varianten en QUOTED-PRINTABLE-namen.
// ============================================================

type Contact = { naam: string; telefoon: string | null };

type Props = {
  /** Wordt aangeroepen zodra de import succesvol is — vinkt de taak af. */
  opVoltooid: () => void;
  /** Of de huidige stap al voltooid was — dan tonen we een geslaagd-status. */
  alVoltooid: boolean;
};

function parseVCard(tekst: string): Contact[] {
  const blokken = tekst.split(/BEGIN:VCARD/i).slice(1);
  const contacten: Contact[] = [];
  for (const blok of blokken) {
    const eind = blok.indexOf("END:VCARD");
    const inhoud = eind >= 0 ? blok.slice(0, eind) : blok;
    // Unfold lines (vCard line continuation = lijn die start met spatie/tab)
    const ontvouwen = inhoud.replace(/\r?\n[ \t]/g, "");
    const regels = ontvouwen.split(/\r?\n/);
    let naam = "";
    let telefoon: string | null = null;
    for (const regel of regels) {
      // FN:... of FN;CHARSET=UTF-8:...
      const fnMatch = regel.match(/^FN(?:;[^:]+)?:(.+)$/i);
      if (fnMatch && !naam) {
        naam = fnMatch[1].trim();
      }
      // TEL:..., TEL;TYPE=CELL:..., TEL;type=cell,voice:...
      const telMatch = regel.match(/^TEL(?:;[^:]+)?:(.+)$/i);
      if (telMatch && !telefoon) {
        telefoon = telMatch[1].trim().replace(/\s+/g, "");
      }
      // N:Achternaam;Voornaam;... als FN ontbreekt
      const nMatch = regel.match(/^N(?:;[^:]+)?:(.+)$/i);
      if (nMatch && !naam) {
        const delen = nMatch[1].split(";").map((s) => s.trim()).filter(Boolean);
        // [achter, voor, midden, prefix, suffix]
        const voor = delen[1] || "";
        const achter = delen[0] || "";
        naam = `${voor} ${achter}`.trim();
      }
    }
    if (naam) {
      contacten.push({ naam, telefoon });
    }
  }
  // Dedup op (naam-lower + telefoon)
  const gezien = new Set<string>();
  return contacten.filter((c) => {
    const k = `${c.naam.toLowerCase()}|${c.telefoon ?? ""}`;
    if (gezien.has(k)) return false;
    gezien.add(k);
    return true;
  });
}

export function VCardUploader({ opVoltooid, alVoltooid }: Props) {
  const [voorbeeld, setVoorbeeld] = useState<Contact[]>([]);
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(alVoltooid);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function leesBestand(bestand: File) {
    if (!bestand.name.toLowerCase().endsWith(".vcf")) {
      toast.error("Kies een .vcf-bestand (vCard-export)");
      return;
    }
    try {
      const tekst = await bestand.text();
      const contacten = parseVCard(tekst);
      if (contacten.length === 0) {
        toast.error("Geen contacten gevonden in dit bestand");
        return;
      }
      setVoorbeeld(contacten);
      toast.success(`${contacten.length} contact${contacten.length === 1 ? "" : "en"} gevonden`);
    } catch {
      toast.error("Kon het bestand niet lezen");
    }
  }

  async function bevestigImport() {
    if (voorbeeld.length === 0) return;
    setBezig(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niet ingelogd");
        return;
      }

      // Bestaande prospects ophalen om dubbelingen te filteren (op
      // volledige_naam + telefoon-combi). Eenvoudig en robuust voor
      // typische namenlijst-grootte (<2000 prospects).
      const { data: bestaand } = await supabase
        .from("prospects")
        .select("volledige_naam, telefoon")
        .eq("user_id", user.id);
      const reedsAanwezig = new Set(
        ((bestaand as Array<{ volledige_naam: string; telefoon: string | null }>) || []).map(
          (p) => `${p.volledige_naam.toLowerCase()}|${p.telefoon ?? ""}`,
        ),
      );

      const nieuw = voorbeeld
        .filter((c) => !reedsAanwezig.has(`${c.naam.toLowerCase()}|${c.telefoon ?? ""}`))
        .map((c) => ({
          user_id: user.id,
          volledige_naam: c.naam.slice(0, 200),
          telefoon: c.telefoon?.slice(0, 50) ?? null,
          pipeline_fase: "prospect" as const,
          actief: true,
          gearchiveerd: false,
        }));

      if (nieuw.length === 0) {
        toast.success("Alle contacten stonden al op je namenlijst — niks nieuws");
        setKlaar(true);
        opVoltooid();
        return;
      }

      // Insert in batches van 100 om Supabase-payload-limieten te vermijden.
      const batchGrootte = 100;
      let toegevoegd = 0;
      for (let i = 0; i < nieuw.length; i += batchGrootte) {
        const batch = nieuw.slice(i, i + batchGrootte);
        const { error } = await supabase.from("prospects").insert(batch);
        if (error) {
          toast.error(`Import mislukt bij ${toegevoegd}/${nieuw.length} — probeer opnieuw`);
          return;
        }
        toegevoegd += batch.length;
      }

      toast.success(`🎉 ${toegevoegd} nieuw${toegevoegd === 1 ? "e contact" : "e contacten"} toegevoegd aan je namenlijst`);
      setKlaar(true);
      opVoltooid();
    } catch {
      toast.error("Onbekende fout — probeer opnieuw");
    } finally {
      setBezig(false);
    }
  }

  if (klaar) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
          ✓ Contacten staan op je namenlijst
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          Top — je voorraadkast is gevuld. Op naar de volgende stap.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-3">
      <div className="space-y-1.5">
        <h4 className="text-cm-gold font-semibold text-sm">📂 Upload je vCard-bestand</h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          Op iPhone: Contacten-app → ⚙ → Exporteer als vCard → mail/airdrop
          naar jezelf. Op Android: Contacten-app → ⋮ Menu → Importeren/Exporteren
          → Naar .vcf-bestand. Sleep het bestand hieronder of kies 'm.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".vcf,text/vcard,text/x-vcard"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void leesBestand(f);
        }}
        className="block w-full text-xs text-cm-white file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cm-gold file:text-cm-black hover:file:opacity-90 file:cursor-pointer"
      />

      {voorbeeld.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-cm-border">
          <p className="text-cm-white text-xs font-semibold">
            {voorbeeld.length} contact{voorbeeld.length === 1 ? "" : "en"} gevonden — eerste 5:
          </p>
          <ul className="space-y-1 text-xs text-cm-white opacity-80">
            {voorbeeld.slice(0, 5).map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex-1 truncate">{c.naam}</span>
                {c.telefoon && (
                  <span className="opacity-60 text-[10px] whitespace-nowrap">{c.telefoon}</span>
                )}
              </li>
            ))}
            {voorbeeld.length > 5 && (
              <li className="opacity-60 italic">… en {voorbeeld.length - 5} meer</li>
            )}
          </ul>
          <button
            type="button"
            onClick={bevestigImport}
            disabled={bezig}
            className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50"
          >
            {bezig
              ? "Importeren..."
              : `✓ Importeer ${voorbeeld.length} contact${voorbeeld.length === 1 ? "" : "en"}`}
          </button>
        </div>
      )}
    </div>
  );
}
