"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Prospect } from "@/lib/supabase/types";
import { toast } from "sonner";

const STAPPEN = [
  { key: "stap_1_welkom", label: "Welkom & uitleg onboarding doorlopen" },
  { key: "stap_2_run", label: "60-dagenrun begrepen (3 fasen + dagdoelen)" },
  { key: "stap_3_namen", label: "Eerste namen toegevoegd aan de lijst" },
  { key: "stap_4_script", label: "Uitnodigingsscript gelezen en geoefend" },
  { key: "stap_5_doelen", label: "Dagdoelen ingesteld" },
];

interface Voortgang {
  stap_1_welkom: boolean;
  stap_2_run: boolean;
  stap_3_namen: boolean;
  stap_4_script: boolean;
  stap_5_doelen: boolean;
}

export function OnboardingChecklist({ prospect }: { prospect: Prospect }) {
  const [voortgang, setVoortgang] = useState<Voortgang | null>(null);
  const [laden, setLaden] = useState(false);
  const [emailInvoer, setEmailInvoer] = useState("");
  const [koppelLaden, setKoppelLaden] = useState(false);
  const [gekoppeldEmail, setGekoppeldEmail] = useState<string | null>(null);
  const [ontkoppelenBezig, setOntkoppelenBezig] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (prospect.pipeline_fase !== "member") return;
    if (prospect.gekoppelde_user_id) {
      laadVoortgang(prospect.gekoppelde_user_id);
      laadGekoppeldEmail(prospect.gekoppelde_user_id);
    }
  }, [prospect.gekoppelde_user_id, prospect.pipeline_fase]);

  // Alleen tonen bij members
  if (prospect.pipeline_fase !== "member") return null;

  async function laadVoortgang(userId: string) {
    setLaden(true);
    const { data } = await supabase
      .from("onboarding_voortgang")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setVoortgang(
      data || { stap_1_welkom: false, stap_2_run: false, stap_3_namen: false, stap_4_script: false, stap_5_doelen: false }
    );
    setLaden(false);
  }

  async function laadGekoppeldEmail(userId: string) {
    const { data } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (data?.email) setGekoppeldEmail(data.email);
  }

  async function koppelAanGebruiker() {
    if (!emailInvoer.trim()) return;
    setKoppelLaden(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", emailInvoer.trim().toLowerCase())
      .maybeSingle();

    if (!profile) {
      toast.error("Geen ELEVA-gebruiker gevonden met dit e-mailadres");
      setKoppelLaden(false);
      return;
    }

    const { error } = await supabase
      .from("prospects")
      .update({ gekoppelde_user_id: profile.id })
      .eq("id", prospect.id);

    if (error) {
      toast.error("Kon niet koppelen");
    } else {
      toast.success("Gekoppeld ✓");
      setGekoppeldEmail(profile.email);
      setEmailInvoer("");
      // Refresh de pagina zodat het prospect object ook updated is
      window.location.reload();
    }
    setKoppelLaden(false);
  }

  async function ontkoppelen() {
    setOntkoppelenBezig(true);
    await supabase.from("prospects").update({ gekoppelde_user_id: null }).eq("id", prospect.id);
    setGekoppeldEmail(null);
    setVoortgang(null);
    setOntkoppelenBezig(false);
    window.location.reload();
  }

  async function toggleStap(stapKey: string, huidigeWaarde: boolean) {
    if (!prospect.gekoppelde_user_id) return;
    const nieuweWaarde = !huidigeWaarde;

    // Optimistisch updaten
    setVoortgang((prev) => (prev ? { ...prev, [stapKey]: nieuweWaarde } : null));

    const { error } = await supabase
      .from("onboarding_voortgang")
      .upsert(
        { user_id: prospect.gekoppelde_user_id, [stapKey]: nieuweWaarde, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) {
      setVoortgang((prev) => (prev ? { ...prev, [stapKey]: huidigeWaarde } : null));
      toast.error("Kon niet opslaan");
    } else if (nieuweWaarde) {
      // Stuur push notificatie naar leider
      fetch("/api/onboarding/stap-voltooid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stap: stapKey }),
      }).catch(() => {});
    }
  }

  const aantalKlaar = voortgang ? Object.values(voortgang).filter(Boolean).length : 0;
  const allesKlaar = aantalKlaar === 5;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🎓 Onboarding</h3>
        {voortgang && (
          <span className={`text-xs font-semibold ${allesKlaar ? "text-green-400" : "text-cm-gold"}`}>
            {aantalKlaar}/5 {allesKlaar ? "✓ klaar" : "stappen"}
          </span>
        )}
      </div>

      {/* Niet gekoppeld */}
      {!prospect.gekoppelde_user_id && (
        <div className="space-y-3">
          <p className="text-cm-white text-xs opacity-60">
            Koppel dit contact aan hun ELEVA-account om onboarding-voortgang te zien en samen af te vinken.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInvoer}
              onChange={(e) => setEmailInvoer(e.target.value)}
              placeholder="e-mailadres van member..."
              className="input-cm text-sm flex-1"
              onKeyDown={(e) => e.key === "Enter" && koppelAanGebruiker()}
            />
            <button
              onClick={koppelAanGebruiker}
              disabled={koppelLaden || !emailInvoer.trim()}
              className="btn-gold text-sm px-3 disabled:opacity-50"
            >
              {koppelLaden ? "..." : "Koppel"}
            </button>
          </div>
          <p className="text-cm-white text-xs opacity-40">
            Het e-mailadres waarmee de member zich heeft geregistreerd in ELEVA.
          </p>
        </div>
      )}

      {/* Gekoppeld + checklist */}
      {prospect.gekoppelde_user_id && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
              <p className="text-cm-white text-xs opacity-60">{gekoppeldEmail || "Gekoppeld"}</p>
            </div>
            <button
              onClick={ontkoppelen}
              disabled={ontkoppelenBezig}
              className="text-cm-white opacity-30 hover:opacity-60 text-xs transition-opacity"
            >
              ontkoppel
            </button>
          </div>

          {laden ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-cm-gold/30 border-t-cm-gold rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {STAPPEN.map((stap) => {
                const klaar = voortgang?.[stap.key as keyof Voortgang] || false;
                return (
                  <button
                    key={stap.key}
                    onClick={() => toggleStap(stap.key, klaar)}
                    className="w-full flex items-center gap-3 text-left group py-1"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      klaar ? "bg-cm-gold border-cm-gold" : "border-cm-border group-hover:border-cm-gold"
                    }`}>
                      {klaar && <span className="text-cm-black text-[10px] font-bold">✓</span>}
                    </div>
                    <span className={`text-sm transition-colors leading-tight ${
                      klaar ? "text-cm-white opacity-50 line-through" : "text-cm-white group-hover:text-cm-gold"
                    }`}>
                      {stap.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {allesKlaar && (
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 text-center mt-2">
              <p className="text-green-400 text-sm font-semibold">🎉 Onboarding volledig afgerond!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
