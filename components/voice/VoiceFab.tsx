"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTaal } from "@/lib/i18n/TaalContext";
import { PipelineFase, ContactType } from "@/lib/supabase/types";
import { gebruikSpraak } from "./gebruikSpraak";

const MAX_SECONDEN = 120;

type ActieNieuweProspect = {
  type: "nieuwe_prospect";
  volledige_naam: string;
  pipeline_fase?: PipelineFase;
  notities?: string;
  relatie?: string;
};

type ActieUpdateProspect = {
  type: "update_prospect";
  prospect_id: string;
  pipeline_fase?: PipelineFase;
  notities_toevoegen?: string;
};

type ActieNotitie = {
  type: "notitie";
  prospect_naam: string;
  notitie: string;
};

type ActieTaak = {
  type: "taak";
  prospect_naam: string;
  titel: string;
  vervaldatum?: string;
};

type ActieUpdateDetails = {
  type: "update_details";
  prospect_id: string;
  telefoon?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  prioriteit?: "hoog" | "normaal" | "laag";
};

type ActieContactLog = {
  type: "contact_log";
  prospect_naam: string;
  contact_type: ContactType;
  notities?: string;
  nieuwe_fase?: PipelineFase;
};

type ActieStatsIncrement = {
  type: "stats_increment";
  datum?: string;
  contacten_gemaakt?: number;
  uitnodigingen?: number;
  followups?: number;
  presentaties?: number;
  nieuwe_klanten?: number;
  nieuwe_partners?: number;
};

type ActieVoltooiHerinnering = {
  type: "voltooi_herinnering";
  herinnering_id: string;
};

type ActieUpdateHerinnering = {
  type: "update_herinnering";
  herinnering_id: string;
  nieuwe_vervaldatum?: string;
  nieuwe_titel?: string;
};

type ActieProductBestelling = {
  type: "product_bestelling";
  prospect_naam: string;
  product_omschrijving: string;
  besteldatum?: string;
  notities?: string;
};

type Actie =
  | ActieNieuweProspect
  | ActieUpdateProspect
  | ActieNotitie
  | ActieTaak
  | ActieUpdateDetails
  | ActieContactLog
  | ActieStatsIncrement
  | ActieVoltooiHerinnering
  | ActieUpdateHerinnering
  | ActieProductBestelling;

type Intentie = "data" | "coach" | "mixed";

type ParseResultaat = {
  transcript: string;
  gecorrigeerd_transcript?: string;
  intentie: Intentie;
  samenvatting: string;
  redenatie?: string;
  acties: Actie[];
  coach_bericht: string | null;
  coach_prospect_id?: string | null;
  coach_prospect_naam?: string | null;
  onduidelijk: string[];
  waarschuwingen?: string[];
};

type Fase = "dicht" | "opname" | "bewerken" | "verwerken" | "preview" | "opslaan";

export function VoiceFab() {
  const { taal } = useTaal();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [fase, setFase] = useState<Fase>("dicht");
  const [resultaat, setResultaat] = useState<ParseResultaat | null>(null);
  const [acties, setActies] = useState<Actie[]>([]);
  const [bewerkTekst, setBewerkTekst] = useState("");
  const [coachProspectId, setCoachProspectId] = useState<string | null>(null);
  const [coachProspectNaam, setCoachProspectNaam] = useState<string | null>(null);

  // Scroll-aware: verbergen bij scroll-down, tonen bij scroll-up of aan top.
  // Zo is de FAB nooit in de weg van knoppen/velden onderaan een pagina.
  const [zichtbaar, setZichtbaar] = useState(true);
  const laatsteScrollRef = useRef(0);
  const scrollTimerRef = useRef<any>(null);

  useEffect(() => {
    // Zoek het scrollable main-element (AppShell heeft <main overflow-y-auto>).
    // Val terug op window als main niet gevonden wordt (publieke pagina's).
    const main = document.querySelector("main");
    const target: HTMLElement | Window = main instanceof HTMLElement ? main : window;

    function huidigeScroll() {
      return target instanceof Window ? window.scrollY : (target as HTMLElement).scrollTop;
    }

    laatsteScrollRef.current = huidigeScroll();

    function onScroll() {
      const nu = huidigeScroll();
      const delta = nu - laatsteScrollRef.current;
      // Kleine jitter negeren
      if (Math.abs(delta) < 8) return;
      if (nu < 40) {
        setZichtbaar(true);
      } else if (delta > 0) {
        // scroll-down
        setZichtbaar(false);
      } else {
        // scroll-up
        setZichtbaar(true);
      }
      laatsteScrollRef.current = nu;
      // Na 1.5s zonder scroll weer tonen — zo kan de user altijd bij de knop
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setZichtbaar(true), 1500);
    }

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [pathname]);

  const spraak = gebruikSpraak({
    taal,
    maxSeconden: MAX_SECONDEN,
    onMaxBereikt: () => verwerkHuidig(),
  });

  // Modal is fixed inset-0 z-50 en main heeft overscroll-y-contain —
  // scroll-chaining wordt daardoor al voorkomen. Geen body-lock nodig;
  // die veroorzaakte juist iOS stuck-scroll na sluiten (touchAction="none"
  // werd niet altijd correct herberekend).

  // Verberg op auth/onboarding pagina's
  const verbergen =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/registreer") ||
    pathname?.startsWith("/welkom") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/mijn-why");

  if (verbergen) return null;

  function openen() {
    setFase("opname");
    spraak.reset();
    setTimeout(() => spraak.start(), 50);
  }

  function verwerkHuidig() {
    const tekst = spraak.stop();
    if (tekst.length < 3) {
      toast.error("Geen tekst opgevangen");
      setFase("dicht");
      return;
    }
    setBewerkTekst(tekst);
    setFase("bewerken");
  }

  function opnieuwOpnemen() {
    spraak.reset();
    setBewerkTekst("");
    setFase("opname");
    setTimeout(() => spraak.start(), 50);
  }

  async function verwerk(tekst: string) {
    setFase("verwerken");
    try {
      const res = await fetch("/api/voice-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: tekst, taal }),
      });
      if (!res.ok) {
        const err = await res.text();
        toast.error("Verwerken mislukt: " + err);
        setFase("dicht");
        return;
      }
      const data: ParseResultaat = await res.json();
      setResultaat(data);
      setActies(data.acties);
      setCoachProspectId(data.coach_prospect_id || null);
      setCoachProspectNaam(data.coach_prospect_naam || null);
      setFase("preview");
    } catch (err: any) {
      toast.error("Fout: " + (err?.message || "onbekend"));
      setFase("dicht");
    }
  }

  async function bevestig() {
    if (!resultaat) return;
    setFase("opslaan");
    try {
      const { gemaakt } = await voerActiesUit();
      if (acties.length > 0 && gemaakt.length > 0) {
        toast.success("Opgeslagen!", {
          duration: 12000,
          action: {
            label: "Ongedaan maken",
            onClick: async () => {
              await undoGemaakteActies(gemaakt);
              toast.info(`${gemaakt.length} actie(s) ongedaan gemaakt`);
              router.refresh();
            },
          },
        });
      } else {
        toast.success(acties.length > 0 ? "Opgeslagen!" : "Klaar");
      }
      // Sluit modal EERST zodat DOM settled is voor de refresh.
      // Voorkomt iOS Safari scroll-lock na router.refresh().
      sluit();
      setTimeout(() => router.refresh(), 100);
    } catch (err: any) {
      toast.error("Opslaan mislukt: " + (err?.message || "onbekend"));
      setFase("preview");
    }
  }

  async function undoGemaakteActies(
    gemaakt: Array<{ tabel: string; id: string }>
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    // Omgekeerde volgorde: eerst side-effects (logs, herinneringen), dan prospects
    for (const { tabel, id } of [...gemaakt].reverse()) {
      await supabase.from(tabel).delete().eq("id", id).eq("user_id", user.id);
    }
  }

  async function naarMentor() {
    if (!resultaat?.coach_bericht) return;

    const bericht = resultaat.coach_bericht;

    // Voer eerst alle acties uit zodat een net-aangemaakte prospect beschikbaar is
    // voor koppeling aan het mentor-gesprek.
    let naamNaarId: Record<string, string> = {};
    if (acties.length > 0) {
      setFase("opslaan");
      const resultaatUit = await voerActiesUit();
      naamNaarId = resultaatUit.naamNaarId;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      return;
    }

    // Resolve prospect_id: eerst parser-match, anders via net-aangemaakte naam
    let prospectIdVoorGesprek: string | null = coachProspectId;
    let prospectNaamVoorTitel: string | null = coachProspectNaam;

    if (!prospectIdVoorGesprek && coachProspectNaam) {
      const match = naamNaarId[coachProspectNaam.toLowerCase()];
      if (match) prospectIdVoorGesprek = match;
    }

    // Fallback: als er net een nieuwe_prospect is aangemaakt EN geen coach_prospect
    // is herkend, maar het coach_bericht noemt die nieuwe naam → koppel alsnog.
    if (!prospectIdVoorGesprek) {
      for (const a of acties) {
        if (a.type === "nieuwe_prospect" && a.volledige_naam) {
          const id = naamNaarId[a.volledige_naam.toLowerCase()];
          if (id && bericht.toLowerCase().includes(a.volledige_naam.toLowerCase().split(" ")[0])) {
            prospectIdVoorGesprek = id;
            prospectNaamVoorTitel = a.volledige_naam;
            break;
          }
        }
      }
    }

    const titel = prospectNaamVoorTitel
      ? `Advies voor ${prospectNaamVoorTitel}`
      : bericht.length > 40 ? bericht.substring(0, 37) + "..." : bericht;
    const { data: nieuw, error } = await supabase
      .from("ai_gesprekken")
      .insert({
        user_id: user.id,
        prospect_id: prospectIdVoorGesprek,
        titel,
        berichten: [],
      })
      .select()
      .single();

    if (error || !nieuw) {
      toast.error("Kon gesprek niet starten");
      return;
    }

    sluit();
    router.push(`/coach/${nieuw.id}?auto=${encodeURIComponent(bericht)}`);
  }

  async function voerActiesUit(): Promise<{ gemaakt: Array<{ tabel: string; id: string }>; naamNaarId: Record<string, string> }> {
    const gemaakt: Array<{ tabel: string; id: string }> = [];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { gemaakt, naamNaarId: {} };

    const naamNaarId: Record<string, string> = {};
    const { data: bestaand } = await supabase
      .from("prospects")
      .select("id, volledige_naam")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false);

    (bestaand || []).forEach((p: any) => {
      naamNaarId[p.volledige_naam.toLowerCase()] = p.id;
    });

    for (const a of acties) {
      if (a.type === "nieuwe_prospect") {
        const notitieVeld = [
          a.notities || "",
          a.relatie ? `Relatie: ${a.relatie}` : "",
        ].filter(Boolean).join("\n\n");
        const { data } = await supabase
          .from("prospects")
          .insert({
            user_id: user.id,
            volledige_naam: a.volledige_naam,
            pipeline_fase: a.pipeline_fase || "prospect",
            bron: "warm",
            prioriteit: "normaal",
            notities: notitieVeld || null,
          })
          .select()
          .single();
        if (data) {
          naamNaarId[a.volledige_naam.toLowerCase()] = data.id;
          gemaakt.push({ tabel: "prospects", id: data.id });
        }
      }
    }
    for (const a of acties) {
      if (a.type === "update_prospect") {
        const { data: huidig } = await supabase
          .from("prospects")
          .select("notities, pipeline_fase")
          .eq("id", a.prospect_id)
          .single();
        const bestaandeNotitie = huidig?.notities || "";
        const updates: any = {
          updated_at: new Date().toISOString(),
          laatste_contact: new Date().toISOString().split("T")[0],
        };
        if (a.pipeline_fase) updates.pipeline_fase = a.pipeline_fase;
        if (a.notities_toevoegen) {
          updates.notities = bestaandeNotitie
            ? `${bestaandeNotitie}\n\n[${new Date().toLocaleDateString("nl-NL")}] ${a.notities_toevoegen}`
            : a.notities_toevoegen;
        }
        await supabase
          .from("prospects")
          .update(updates)
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        // Audit-trail: log fase-wijziging of notitie-toevoeging in contact_logs
        if (a.pipeline_fase || a.notities_toevoegen) {
          const { data: log } = await supabase
            .from("contact_logs")
            .insert({
              prospect_id: a.prospect_id,
              user_id: user.id,
              contact_type: "notitie",
              notities: a.notities_toevoegen || null,
              fase_voor: huidig?.pipeline_fase || null,
              fase_na: a.pipeline_fase || huidig?.pipeline_fase || null,
            })
            .select("id")
            .single();
          if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
        }
      }
    }
    for (const a of acties) {
      if (a.type === "notitie") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()];
        if (!id) continue;
        const { data: huidig } = await supabase
          .from("prospects")
          .select("notities, pipeline_fase")
          .eq("id", id)
          .single();
        const bestaandeNotitie = huidig?.notities || "";
        const nieuweNotitie = bestaandeNotitie
          ? `${bestaandeNotitie}\n\n[${new Date().toLocaleDateString("nl-NL")}] ${a.notitie}`
          : a.notitie;
        await supabase
          .from("prospects")
          .update({
            notities: nieuweNotitie,
            updated_at: new Date().toISOString(),
            laatste_contact: new Date().toISOString().split("T")[0],
          })
          .eq("id", id)
          .eq("user_id", user.id);
        // Audit-trail: elke notitie ook loggen in contact_logs
        const { data: log } = await supabase
          .from("contact_logs")
          .insert({
            prospect_id: id,
            user_id: user.id,
            contact_type: "notitie",
            notities: a.notitie,
            fase_voor: huidig?.pipeline_fase || null,
            fase_na: huidig?.pipeline_fase || null,
          })
          .select("id")
          .single();
        if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
      }
    }
    for (const a of acties) {
      if (a.type === "taak") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()] || null;
        const vervaldatum = a.vervaldatum || standaardDatum();
        const { data: h } = await supabase
          .from("herinneringen")
          .insert({
            user_id: user.id,
            prospect_id: id,
            herinnering_type: "followup",
            titel: a.titel,
            beschrijving: a.titel,
            vervaldatum,
          })
          .select("id")
          .single();
        if (h) gemaakt.push({ tabel: "herinneringen", id: h.id });
      }
    }
    for (const a of acties) {
      if (a.type === "update_details") {
        const updates: any = { updated_at: new Date().toISOString() };
        if (a.telefoon) updates.telefoon = a.telefoon;
        if (a.email) updates.email = a.email;
        if (a.instagram) updates.instagram = a.instagram;
        if (a.facebook) updates.facebook = a.facebook;
        if (a.prioriteit) updates.prioriteit = a.prioriteit;
        await supabase
          .from("prospects")
          .update(updates)
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
      }
    }
    for (const a of acties) {
      if (a.type === "contact_log") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()];
        if (!id) continue;
        const { data: huidig } = await supabase
          .from("prospects")
          .select("pipeline_fase")
          .eq("id", id)
          .single();
        const { data: log } = await supabase
          .from("contact_logs")
          .insert({
            prospect_id: id,
            user_id: user.id,
            contact_type: a.contact_type,
            notities: a.notities || null,
            fase_voor: huidig?.pipeline_fase || null,
            fase_na: a.nieuwe_fase || huidig?.pipeline_fase || null,
          })
          .select("id")
          .single();
        if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
        const prospectUpdate: any = {
          laatste_contact: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        };
        if (a.nieuwe_fase) prospectUpdate.pipeline_fase = a.nieuwe_fase;
        await supabase
          .from("prospects")
          .update(prospectUpdate)
          .eq("id", id)
          .eq("user_id", user.id);
      }
    }
    for (const a of acties) {
      if (a.type === "stats_increment") {
        const datum = a.datum || new Date().toISOString().split("T")[0];
        const { data: huidig } = await supabase
          .from("dagelijkse_stats")
          .select("*")
          .eq("user_id", user.id)
          .eq("stat_datum", datum)
          .maybeSingle();

        await supabase.from("dagelijkse_stats").upsert(
          {
            user_id: user.id,
            stat_datum: datum,
            contacten_gemaakt: (huidig?.contacten_gemaakt || 0) + (a.contacten_gemaakt || 0),
            uitnodigingen: (huidig?.uitnodigingen || 0) + (a.uitnodigingen || 0),
            followups: (huidig?.followups || 0) + (a.followups || 0),
            presentaties: (huidig?.presentaties || 0) + (a.presentaties || 0),
            nieuwe_klanten: (huidig?.nieuwe_klanten || 0) + (a.nieuwe_klanten || 0),
            nieuwe_partners: (huidig?.nieuwe_partners || 0) + (a.nieuwe_partners || 0),
          },
          { onConflict: "user_id,stat_datum" }
        );
      }
    }
    for (const a of acties) {
      if (a.type === "voltooi_herinnering") {
        await supabase
          .from("herinneringen")
          .update({ voltooid: true })
          .eq("id", a.herinnering_id)
          .eq("user_id", user.id);
      }
    }
    for (const a of acties) {
      if (a.type === "product_bestelling") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()];
        if (!id) continue;
        const besteldatum = a.besteldatum || new Date().toISOString().split("T")[0];
        // Postgres trigger maakt automatisch reminders op 21/51/81 dagen
        const { data: pb } = await supabase
          .from("product_bestellingen")
          .insert({
            prospect_id: id,
            user_id: user.id,
            besteldatum,
            product_omschrijving: a.product_omschrijving,
            notities: a.notities || null,
          })
          .select("id")
          .single();
        if (pb) gemaakt.push({ tabel: "product_bestellingen", id: pb.id });
        const { data: huidig } = await supabase
          .from("prospects")
          .select("pipeline_fase")
          .eq("id", id)
          .single();
        const faseUpdate: any = {
          laatste_contact: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        };
        if (huidig?.pipeline_fase !== "shopper" && huidig?.pipeline_fase !== "member") {
          faseUpdate.pipeline_fase = "shopper";
        }
        await supabase
          .from("prospects")
          .update(faseUpdate)
          .eq("id", id)
          .eq("user_id", user.id);
      }
    }
    for (const a of acties) {
      if (a.type === "update_herinnering") {
        const updates: any = {};
        if (a.nieuwe_vervaldatum) updates.vervaldatum = a.nieuwe_vervaldatum;
        if (a.nieuwe_titel) updates.titel = a.nieuwe_titel;
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("herinneringen")
            .update(updates)
            .eq("id", a.herinnering_id)
            .eq("user_id", user.id);
        }
      }
    }

    return { gemaakt, naamNaarId };
  }

  function sluit() {
    spraak.reset();
    setFase("dicht");
    setResultaat(null);
    setActies([]);
    setBewerkTekst("");
    setCoachProspectId(null);
    setCoachProspectNaam(null);
  }

  function verwijderActie(idx: number) {
    setActies((prev) => prev.filter((_, i) => i !== idx));
  }

  function formatTijd(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // FAB altijd in de DOM houden; alleen pointer-events/opacity/transform wisselen.
  // iOS Safari heeft repaint-glitches bij position:fixed elementen die via React
  // conditioneel unmounten/mounten na route-transities — daardoor verdween de knop.
  const fabVerborgen = fase !== "dicht" || !zichtbaar;

  return (
    <>
      {/* Floating Action Button — altijd gerenderd, visueel verborgen via CSS */}
      <button
        onClick={openen}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-cm-gold text-cm-black shadow-gold-lg flex items-center justify-center text-2xl active:scale-95 transition-all duration-200"
        style={{
          opacity: fabVerborgen ? 0 : 1,
          transform: fabVerborgen ? "translate3d(0, 96px, 0)" : "translate3d(0, 0, 0)",
          pointerEvents: fabVerborgen ? "none" : "auto",
          WebkitTransform: fabVerborgen ? "translate3d(0, 96px, 0)" : "translate3d(0, 0, 0)",
          willChange: "transform, opacity",
        }}
        aria-label="Inspreken"
        aria-hidden={fabVerborgen}
        tabIndex={fabVerborgen ? -1 : 0}
      >
        🎙️
      </button>

      {fase !== "dicht" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-cm-surface border border-cm-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto">
            {fase === "opname" && (
              <div className="p-6 space-y-5">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 animate-pulse mb-3">
                    <span className="text-4xl">🎙️</span>
                  </div>
                  <p className="text-cm-white text-lg font-semibold">Luisteren...</p>
                  <p className="text-cm-gold font-mono text-2xl mt-1">
                    {formatTijd(spraak.seconden)} / {formatTijd(MAX_SECONDEN)}
                  </p>
                  <p className="text-cm-white opacity-60 text-xs mt-2">
                    Vertel alles: wie je sprak, wat er is gebeurd, vragen aan de mentor...
                  </p>
                </div>

                {!spraak.ondersteund || !spraak.toegang ? (
                  <div className="space-y-2">
                    <p className="text-sm text-cm-white opacity-80">
                      Spraak-herkenning werkt niet in deze browser. Gebruik de microfoon-knop op je toetsenbord om te dicteren:
                    </p>
                    <textarea
                      value={spraak.transcript}
                      onChange={(e) => spraak.setTranscript(e.target.value)}
                      className="textarea-cm text-sm w-full"
                      rows={6}
                      placeholder="Tik hier en gebruik je toetsenbord-microfoon..."
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="card bg-cm-surface-2 min-h-[120px]">
                    {spraak.transcript || spraak.interim ? (
                      <p className="text-cm-white text-sm whitespace-pre-wrap">
                        {spraak.transcript}
                        <span className="opacity-50">{spraak.interim}</span>
                      </p>
                    ) : (
                      <p className="text-cm-white text-sm opacity-50 italic">
                        Begin met praten...
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={sluit} className="btn-secondary flex-1">
                    Annuleren
                  </button>
                  <button
                    onClick={verwerkHuidig}
                    className="btn-gold flex-1"
                    disabled={spraak.huidigeTekst().length < 3}
                  >
                    ✓ Stop & bewerk
                  </button>
                </div>
              </div>
            )}

            {fase === "bewerken" && (
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-cm-white mb-1">
                    📝 Bewerk je tekst
                  </h2>
                  <p className="text-cm-white text-xs opacity-70">
                    Corrigeer spelfouten of verkeerd verstane woorden voordat ELEVA het verwerkt.
                  </p>
                </div>
                <textarea
                  value={bewerkTekst}
                  onChange={(e) => setBewerkTekst(e.target.value)}
                  className="textarea-cm text-sm w-full"
                  rows={8}
                  autoFocus
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={sluit} className="btn-secondary sm:flex-1">
                    Annuleren
                  </button>
                  <button onClick={opnieuwOpnemen} className="btn-secondary sm:flex-1">
                    🎙️ Opnieuw
                  </button>
                  <button
                    onClick={() => verwerk(bewerkTekst.trim())}
                    className="btn-gold sm:flex-1"
                    disabled={bewerkTekst.trim().length < 3}
                  >
                    ✓ Verwerk met ELEVA
                  </button>
                </div>
              </div>
            )}

            {fase === "verwerken" && (
              <div className="p-8 text-center space-y-3">
                <div className="inline-block w-12 h-12 border-4 border-cm-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-cm-white">ELEVA begrijpt wat je zei...</p>
              </div>
            )}

            {fase === "preview" && resultaat && (
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-cm-white mb-1">
                    🎙️ {resultaat.intentie === "coach" ? "Vraag aan de mentor" : "Klopt dit?"}
                  </h2>
                  <p className="text-cm-white text-sm opacity-80">{resultaat.samenvatting}</p>
                </div>

                {resultaat.gecorrigeerd_transcript &&
                  resultaat.gecorrigeerd_transcript.trim() !== resultaat.transcript.trim() && (
                    <div className="card bg-cm-surface-2 text-sm border border-cm-gold/30">
                      <p className="text-cm-gold text-xs font-medium mb-1">✨ ELEVA heeft dit begrepen als:</p>
                      <p className="text-cm-white text-sm whitespace-pre-wrap">
                        {resultaat.gecorrigeerd_transcript}
                      </p>
                    </div>
                  )}

                <details className="card bg-cm-surface-2 text-sm">
                  <summary className="cursor-pointer text-cm-white opacity-70">Jouw originele tekst</summary>
                  <p className="text-cm-white text-sm mt-2 whitespace-pre-wrap">{resultaat.transcript}</p>
                  <button
                    onClick={() => {
                      setBewerkTekst(resultaat.transcript);
                      setResultaat(null);
                      setActies([]);
                      setFase("bewerken");
                    }}
                    className="mt-2 text-xs text-cm-gold hover:underline"
                  >
                    ✏️ Bewerk tekst en verwerk opnieuw
                  </button>
                </details>

                {resultaat.redenatie && (
                  <details className="card bg-cm-surface-2 text-sm">
                    <summary className="cursor-pointer text-cm-white opacity-70">🧠 Hoe ELEVA redeneerde</summary>
                    <p className="text-cm-white text-xs mt-2 whitespace-pre-wrap opacity-80">{resultaat.redenatie}</p>
                  </details>
                )}

                {resultaat.waarschuwingen && resultaat.waarschuwingen.length > 0 && (
                  <div className="card border-red-500/40 bg-red-500/5">
                    <p className="text-xs text-red-400 uppercase tracking-wider mb-1">⚠️ Waarschuwingen</p>
                    {resultaat.waarschuwingen.map((w, i) => (
                      <p key={i} className="text-cm-white text-sm">• {w}</p>
                    ))}
                  </div>
                )}

                {acties.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-cm-white uppercase tracking-wider opacity-60">
                      Wat ELEVA gaat vastleggen:
                    </p>
                    {acties.map((a, i) => (
                      <ActieKaart key={i} actie={a} onVerwijder={() => verwijderActie(i)} />
                    ))}
                  </div>
                )}

                {resultaat.coach_bericht && (() => {
                  // Zoek een nieuwe_prospect in de acties wiens voornaam in het coach_bericht voorkomt
                  const bericht = resultaat.coach_bericht.toLowerCase();
                  const nieuweMatch = acties.find(
                    (a) => a.type === "nieuwe_prospect" &&
                      a.volledige_naam &&
                      bericht.includes(a.volledige_naam.toLowerCase().split(" ")[0])
                  ) as { type: "nieuwe_prospect"; volledige_naam: string } | undefined;
                  const weergaveNaam = coachProspectNaam || nieuweMatch?.volledige_naam || null;
                  const isBestaand = !!(coachProspectNaam && coachProspectId);
                  const isNieuw = !isBestaand && !!nieuweMatch;
                  return (
                    <div className="card border-cm-gold/30 bg-cm-gold/5 space-y-2">
                      <p className="text-xs text-cm-gold uppercase tracking-wider">
                        🧭 Vraag voor de mentor
                      </p>
                      <p className="text-cm-white text-sm">{resultaat.coach_bericht}</p>
                      {isBestaand && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-cm-gold/20">
                          <p className="text-cm-white text-xs">
                            👤 Wordt gekoppeld aan: <span className="font-semibold text-cm-gold">{weergaveNaam}</span>
                          </p>
                          <button
                            onClick={() => { setCoachProspectId(null); setCoachProspectNaam(null); }}
                            className="text-red-400 hover:text-red-300 text-xs"
                            title="Ontkoppel deze prospect (advies wordt algemeen)"
                          >
                            ✕ ontkoppel
                          </button>
                        </div>
                      )}
                      {isNieuw && (
                        <p className="text-cm-white text-xs pt-1 border-t border-cm-gold/20">
                          👤 Wordt gekoppeld aan <span className="font-semibold text-cm-gold">{weergaveNaam}</span> zodra die wordt aangemaakt.
                        </p>
                      )}
                      {!isBestaand && !isNieuw && resultaat.intentie !== "data" && (
                        <p className="text-cm-white text-xs opacity-60 pt-1 border-t border-cm-gold/20">
                          Geen prospect herkend — advies wordt algemeen opgeslagen.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {resultaat.onduidelijk.length > 0 && (
                  <div className="card border-yellow-500/30 bg-yellow-500/5">
                    <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Vragen</p>
                    {resultaat.onduidelijk.map((v, i) => (
                      <p key={i} className="text-cm-white text-sm">• {v}</p>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button onClick={sluit} className="btn-secondary sm:flex-1">
                    Annuleren
                  </button>
                  {/* Combi-flow: zowel data-acties als een vraag voor de mentor → één knop die alles afhandelt */}
                  {resultaat.coach_bericht && acties.length > 0 && (
                    <button onClick={naarMentor} className="btn-gold sm:flex-1">
                      ✅ Opslaan + naar mentor
                    </button>
                  )}
                  {/* Alleen coach-vraag, geen data */}
                  {resultaat.coach_bericht && acties.length === 0 && (
                    <button onClick={naarMentor} className="btn-gold sm:flex-1">
                      🧭 Naar mentor
                    </button>
                  )}
                  {/* Alleen data, geen coach-vraag */}
                  {acties.length > 0 && !resultaat.coach_bericht && (
                    <button onClick={bevestig} className="btn-gold sm:flex-1">
                      ✅ Opslaan
                    </button>
                  )}
                </div>
              </div>
            )}

            {fase === "opslaan" && (
              <div className="p-8 text-center space-y-3">
                <div className="inline-block w-12 h-12 border-4 border-cm-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-cm-white">Opslaan...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ActieKaart({ actie, onVerwijder }: { actie: Actie; onVerwijder: () => void }) {
  const content = beschrijfActie(actie);

  return (
    <div className="card bg-cm-surface-2 flex gap-3">
      <span className="text-2xl">{content.icoon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-cm-white font-semibold text-sm">{content.titel}</p>
        {content.details.map((d, i) => (
          <p key={i} className="text-cm-white text-xs opacity-70 mt-0.5">{d}</p>
        ))}
      </div>
      <button
        onClick={onVerwijder}
        className="text-red-400 hover:text-red-300 text-sm"
        title="Verwijder deze actie"
      >
        ✕
      </button>
    </div>
  );
}

function beschrijfActie(actie: any): { icoon: string; titel: string; details: string[] } {
  const onbekend = {
    icoon: "❓",
    titel: `Onbekende actie: ${actie?.type ?? "geen type"}`,
    details: [JSON.stringify(actie).slice(0, 120)],
  };

  if (!actie || typeof actie !== "object" || typeof actie.type !== "string") {
    return onbekend;
  }

  try {
    switch (actie.type) {
      case "nieuwe_prospect":
        return {
          icoon: "📥",
          titel: "Nieuwe: " + (actie.volledige_naam || "(geen naam)"),
          details: [
            actie.pipeline_fase ? `Fase: ${actie.pipeline_fase}` : null,
            actie.notities || null,
            actie.relatie ? `👨‍👩‍👧 ${actie.relatie}` : null,
          ].filter(Boolean) as string[],
        };
      case "update_prospect":
        return {
          icoon: actie.pipeline_fase ? "⚠️" : "🔄",
          titel: actie.pipeline_fase ? `Fase-wijziging → ${actie.pipeline_fase}` : "Bijwerken",
          details: [
            actie.notities_toevoegen ? `Notitie: ${actie.notities_toevoegen}` : null,
          ].filter(Boolean) as string[],
        };
      case "notitie":
        return {
          icoon: "📝",
          titel: `Notitie bij ${actie.prospect_naam || "(onbekend)"}`,
          details: [actie.notitie || ""].filter(Boolean),
        };
      case "taak":
        return {
          icoon: "⏰",
          titel: actie.titel || "Nieuwe taak",
          details: [
            actie.prospect_naam ? `Bij: ${actie.prospect_naam}` : null,
            actie.vervaldatum ? `Datum: ${actie.vervaldatum}` : null,
          ].filter(Boolean) as string[],
        };
      case "update_details":
        return {
          icoon: "📇",
          titel: "Contactgegevens bijwerken",
          details: [
            actie.telefoon ? `📞 ${actie.telefoon}` : null,
            actie.email ? `✉️ ${actie.email}` : null,
            actie.instagram ? `📸 ${actie.instagram}` : null,
            actie.facebook ? `📘 ${actie.facebook}` : null,
            actie.prioriteit ? `⭐ Prioriteit: ${actie.prioriteit}` : null,
          ].filter(Boolean) as string[],
        };
      case "contact_log":
        return {
          icoon: "💬",
          titel: `Contact met ${actie.prospect_naam || "(onbekend)"}`,
          details: [
            actie.contact_type ? `Type: ${actie.contact_type}` : null,
            actie.notities || null,
            actie.nieuwe_fase ? `→ Nieuwe fase: ${actie.nieuwe_fase}` : null,
          ].filter(Boolean) as string[],
        };
      case "stats_increment": {
        const items: string[] = [];
        if (actie.contacten_gemaakt) items.push(`+${actie.contacten_gemaakt} contacten`);
        if (actie.uitnodigingen) items.push(`+${actie.uitnodigingen} uitnodigingen`);
        if (actie.followups) items.push(`+${actie.followups} follow-ups`);
        if (actie.presentaties) items.push(`+${actie.presentaties} presentaties`);
        if (actie.nieuwe_klanten) items.push(`+${actie.nieuwe_klanten} klanten`);
        if (actie.nieuwe_partners) items.push(`+${actie.nieuwe_partners} partners`);
        return {
          icoon: "📊",
          titel: "Dagstats bijwerken" + (actie.datum ? ` (${actie.datum})` : ""),
          details: items,
        };
      }
      case "voltooi_herinnering":
        return {
          icoon: "✅",
          titel: "Herinnering afvinken",
          details: [actie.herinnering_id ? `id: ${String(actie.herinnering_id).slice(0, 8)}...` : ""].filter(Boolean),
        };
      case "update_herinnering":
        return {
          icoon: "📅",
          titel: "Herinnering bijwerken",
          details: [
            actie.nieuwe_titel ? `Nieuwe titel: ${actie.nieuwe_titel}` : null,
            actie.nieuwe_vervaldatum ? `Nieuwe datum: ${actie.nieuwe_vervaldatum}` : null,
          ].filter(Boolean) as string[],
        };
      case "product_bestelling":
        return {
          icoon: "📦",
          titel: `Bestelling: ${actie.product_omschrijving || "(geen beschrijving)"}`,
          details: [
            actie.prospect_naam ? `Klant: ${actie.prospect_naam}` : null,
            actie.besteldatum ? `Datum: ${actie.besteldatum}` : `Datum: vandaag`,
            actie.notities || null,
          ].filter(Boolean) as string[],
        };
      default:
        return onbekend;
    }
  } catch {
    return onbekend;
  }
}

function standaardDatum(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}
