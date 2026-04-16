"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";

interface Props {
  prospectId: string;
  notities: string | null;
}

export function AantekeningenInklapbaar({ prospectId, notities }: Props) {
  const [open, setOpen] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [tekst, setTekst] = useState(notities || "");
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { v } = useTaal();

  async function slaOp() {
    setLaden(true);
    const { error } = await supabase
      .from("prospects")
      .update({ notities: tekst || null, updated_at: new Date().toISOString() })
      .eq("id", prospectId);
    if (error) {
      toast.error("Opslaan mislukt");
    } else {
      toast.success("Aantekeningen opgeslagen");
      setBewerken(false);
      router.refresh();
    }
    setLaden(false);
  }

  const heeftNotities = !!notities?.trim();

  return (
    <div className="card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            📝 Aantekeningen
          </h2>
          {!heeftNotities && (
            <span className="text-xs text-cm-white opacity-30">— leeg</span>
          )}
        </div>
        <span className={`text-cm-gold text-lg transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {bewerken ? (
            <>
              <textarea
                value={tekst}
                onChange={(e) => setTekst(e.target.value)}
                rows={5}
                placeholder="Schrijf hier je aantekeningen over deze persoon..."
                className="textarea-cm text-sm w-full"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={slaOp}
                  disabled={laden}
                  className="btn-gold text-sm flex-1"
                >
                  {laden ? "Opslaan..." : "Opslaan"}
                </button>
                <button
                  onClick={() => { setTekst(notities || ""); setBewerken(false); }}
                  className="btn-secondary text-sm"
                >
                  Annuleer
                </button>
              </div>
            </>
          ) : (
            <>
              {heeftNotities ? (
                <p className="text-cm-white text-sm whitespace-pre-wrap leading-relaxed">{notities}</p>
              ) : (
                <p className="text-cm-white text-sm opacity-40 italic">Nog geen aantekeningen.</p>
              )}
              <button
                onClick={() => setBewerken(true)}
                className="text-cm-gold text-xs hover:text-cm-gold-light transition-colors"
              >
                ✏️ {heeftNotities ? "Bewerken" : "Toevoegen"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
