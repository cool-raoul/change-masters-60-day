"use client";

import { useState, useEffect, useRef } from "react";
import { vandaagNL } from "@/lib/util/datum-nl";
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

type ActieVerwijderProspect = {
  type: "verwijder_prospect";
  prospect_id: string;
  volledige_naam?: string;
};

type ActieVerwijderHerinnering = {
  type: "verwijder_herinnering";
  herinnering_id: string;
  titel?: string;
};

type ActieHerstelProspect = {
  type: "herstel_prospect";
  prospect_id: string;
  volledige_naam?: string;
};

type ActieHernoemProspect = {
  type: "hernoem_prospect";
  prospect_id: string;
  nieuwe_naam: string;
  oude_naam?: string;
};

type ActieStatsSet = {
  type: "stats_set";
  datum?: string;
  contacten_gemaakt?: number;
  uitnodigingen?: number;
  followups?: number;
  presentaties?: number;
  nieuwe_klanten?: number;
  nieuwe_partners?: number;
};

type ActiePrioriteitSet = {
  type: "prioriteit_set";
  prospect_id: string;
  prioriteit: "hoog" | "normaal" | "laag";
  volledige_naam?: string;
};

type ActieWisNotities = {
  type: "wis_notities";
  prospect_id: string;
  volledige_naam?: string;
};

type NavigeerBestemming =
  | "dashboard"
  | "namenlijst"
  | "namenlijst_nieuw"
  | "herinneringen"
  | "acties"
  | "coach"
  | "premium"
  | "statistieken"
  | "mijn_why"
  | "team"
  | "zoeken"
  | "instellingen"
  | "producten"
  | "scripts"
  | "prospect";

type ActieNavigeer = {
  type: "navigeer";
  bestemming: NavigeerBestemming;
  prospect_id?: string;
  volledige_naam?: string;
};

type ActieZoek = {
  type: "zoek";
  zoekterm: string;
};

type ActieMijnWhyUpdate = {
  type: "mijn_why_update";
  nieuwe_why: string;
};

type ActieFaseBatch = {
  type: "fase_batch";
  prospect_ids: string[];
  nieuwe_fase: PipelineFase;
  namen?: string[];
};

type ActieMemberNotitieBulk = {
  type: "member_notitie_bulk";
  prospect_ids: string[];
  notitie: string;
  namen?: string[];
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
  | ActieProductBestelling
  | ActieVerwijderProspect
  | ActieVerwijderHerinnering
  | ActieHerstelProspect
  | ActieHernoemProspect
  | ActieStatsSet
  | ActiePrioriteitSet
  | ActieWisNotities
  | ActieNavigeer
  | ActieZoek
  | ActieMijnWhyUpdate
  | ActieFaseBatch
  | ActieMemberNotitieBulk;

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

type Fase = "dicht" | "opname" | "transcriberen" | "spraakfout" | "bewerken" | "verwerken" | "preview" | "opslaan";

export function VoiceFab() {
  const { taal } = useTaal();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [fase, setFase] = useState<Fase>("dicht");
  const [resultaat, setResultaat] = useState<ParseResultaat | null>(null);
  const [acties, setActies] = useState<Actie[]>([]);
  // Controle-scherm: zelf een gemiste notitie toevoegen.
  const [toevoegOpen, setToevoegOpen] = useState(false);
  const [toevoegNaam, setToevoegNaam] = useState("");
  const [toevoegTekst, setToevoegTekst] = useState("");
  const [bewerkTekst, setBewerkTekst] = useState("");
  const [coachProspectId, setCoachProspectId] = useState<string | null>(null);
  const [coachProspectNaam, setCoachProspectNaam] = useState<string | null>(null);
  const [spraakFoutTekst, setSpraakFoutTekst] = useState<string>("");
  const [spraakFoutDebug, setSpraakFoutDebug] = useState<string>("");
  const [bewerkenTranscribeert, setBewerkenTranscribeert] = useState(false);
  const bewerkTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  // True terwijl je vanuit het controle-scherm extra inspreekt: de nieuwe
  // acties worden dan AAN de lijst toegevoegd i.p.v. alles te vervangen.
  const toevoegModusRef = useRef(false);
  const bewerkCursorRef = useRef<number>(0);

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
      // Na 1.5s zonder scroll weer tonen, zo kan de user altijd bij de knop
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

  // Modal is fixed inset-0 z-50 en main heeft overscroll-y-contain.
  // scroll-chaining wordt daardoor al voorkomen. Geen body-lock nodig;
  // die veroorzaakte juist iOS stuck-scroll na sluiten (touchAction="none"
  // werd niet altijd correct herberekend).

  // Verberg op auth/onboarding pagina's, plus op routes met een
  // eigen, prominente mic-knop in de input (Mentor-chat, mini-ELEVA chat,
  // mentor-trainen-form). Anders is verwarrend welke je moet gebruiken.
  const verbergen =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/registreer") ||
    pathname?.startsWith("/welkom") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/mijn-why") ||
    pathname?.startsWith("/coach") ||
    pathname?.startsWith("/m/") ||
    pathname?.startsWith("/instellingen/mentor-trainen");

  if (verbergen) return null;

  function openen() {
    toevoegModusRef.current = false;
    setFase("opname");
    spraak.reset();
    setTimeout(() => spraak.start(), 50);
  }

  // Vanuit het controle-scherm extra inspreken. De opname loopt door de
  // normale trechter (verwerkHuidig), maar verwerk() plakt de nieuwe acties
  // aan de bestaande lijst i.p.v. te vervangen.
  function startToevoegInspreken() {
    toevoegModusRef.current = true;
    setToevoegOpen(false);
    setSpraakFoutTekst("");
    setSpraakFoutDebug("");
    spraak.reset();
    setFase("opname");
    setTimeout(() => spraak.start(), 50);
  }

  async function verwerkHuidig() {
    // Fallback-pad: browser zonder MediaRecorder, user heeft in de textarea
    // getypt. Geen Whisper nodig; tekst staat al in spraak.transcript.
    if (!spraak.ondersteund || !spraak.toegang) {
      const getypt = spraak.transcript.trim();
      if (getypt.length < 3) {
        toast.error("Geen tekst opgevangen");
        setFase("dicht");
        return;
      }
      spraak.reset();
      setBewerkTekst(getypt);
      setFase("bewerken");
      return;
    }

    // Server-pad: toon tussenfase terwijl de server transcribeert (~2-4s).
    setFase("transcriberen");
    const { tekst, fout, debug } = await spraak.stop();
    if (fout) {
      setSpraakFoutTekst(fout);
      setSpraakFoutDebug(debug || "");
      setFase("spraakfout");
      return;
    }
    if (!tekst || tekst.length < 3) {
      setSpraakFoutTekst("Geen tekst opgevangen, opname was mogelijk leeg.");
      setSpraakFoutDebug(debug || "");
      setFase("spraakfout");
      return;
    }
    setBewerkTekst(tekst);
    // Toevoeg-modus: ingesproken toevoeging gaat direct door de parser en
    // wordt aan de bestaande lijst geplakt (geen aparte bewerk-stap nodig;
    // je ziet het resultaat in het controle-scherm).
    if (toevoegModusRef.current) {
      await verwerk(tekst);
      return;
    }
    setFase("bewerken");
  }

  function opnieuwOpnemen() {
    spraak.reset();
    setBewerkTekst("");
    setSpraakFoutTekst("");
    setSpraakFoutDebug("");
    setFase("opname");
    setTimeout(() => spraak.start(), 50);
  }

  // Inline opname tijdens bewerken: gebruiker spreekt extra in en de nieuwe
  // tekst wordt op de cursor-positie ingevoegd. Belangrijk voor de
  // betrouwbaarheid:
  //  1. bewerkTekst lezen via setBewerkTekst-updater (huidige state) i.p.v.
  //     de closure-waarde, anders verliest een snelle 2e opname die niet
  //     in dezelfde render zit zijn vorige inhoud.
  //  2. setSelectionRange in een useEffect-achtige timeout zodat React
  //     eerst zijn nieuwe value heeft geflusht naar de DOM.
  //  3. Een state-flag voor het verbergen van de microfoon i.p.v. de
  //     textarea disabled zetten tijdens opname, sommige iOS-browsers
  //     verwerken value-updates op een net-disabled element niet correct.
  async function toggleBewerkOpname() {
    if (bewerkenTranscribeert) return;
    if (spraak.actief) {
      setBewerkenTranscribeert(true);
      const { tekst, fout } = await spraak.stop();
      setBewerkenTranscribeert(false);
      if (fout) {
        toast.error(fout);
        return;
      }
      if (!tekst || tekst.trim().length === 0) {
        toast.info("Niets opgevangen");
        return;
      }
      // Functional update: pak de NU geldige bewerkTekst, niet de gevangen
      // closure-waarde. Belangrijk wanneer de user heeft getypt of een
      // tweede opname doet kort na elkaar.
      let invoeggrootte = 0;
      let invoegPos = 0;
      setBewerkTekst((huidig) => {
        const pos = Math.min(bewerkCursorRef.current, huidig.length);
        const voor = huidig.slice(0, pos);
        const na = huidig.slice(pos);
        const spatieVoor = voor.length > 0 && !/\s$/.test(voor) ? " " : "";
        const spatieNa = na.length > 0 && !/^\s/.test(na) ? " " : "";
        const invoeging = spatieVoor + tekst + spatieNa;
        invoeggrootte = invoeging.length;
        invoegPos = pos;
        return voor + invoeging + na;
      });
      const nieuwePos = invoegPos + invoeggrootte;
      // requestAnimationFrame zodat React eerst de nieuwe value naar de DOM
      // heeft gepusht voordat we de cursor zetten.
      requestAnimationFrame(() => {
        const ta = bewerkTextareaRef.current;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(nieuwePos, nieuwePos);
        }
      });
    } else {
      // Cursor-bepaling voor de invoeg-positie:
      // - textarea heeft actieve focus EN gebruiker heeft daar zelf de
      //   cursor geplaatst → respecteer selectionStart (handig bij echt
      //   ergens midden in willen invoegen).
      // - anders → einde van bestaande tekst, zodat bij-spreken altijd
      //   ONDERAAN landt en niet bovenaan (was de standaard waardoor
      //   nieuwe tekst voor de oude geplakt werd).
      const ta = bewerkTextareaRef.current;
      const heeftFocus =
        typeof document !== "undefined" && document.activeElement === ta;
      bewerkCursorRef.current = heeftFocus
        ? ta?.selectionStart ?? bewerkTekst.length
        : bewerkTekst.length;
      spraak.reset();
      setTimeout(() => spraak.start(), 30);
    }
  }

  async function verwerk(tekst: string) {
    setFase("verwerken");
    try {
      // Kaart-context: spreek je op /namenlijst/[id], dan weet de parser
      // standaard over wie het gaat, ook als je de naam niet (goed) noemt.
      const kaartMatch = pathname?.match(/\/namenlijst\/([0-9a-fA-F-]{36})/);
      const actieveProspectId = kaartMatch ? kaartMatch[1] : null;
      const res = await fetch("/api/voice-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: tekst,
          taal,
          actieve_prospect_id: actieveProspectId,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        toast.error("Verwerken mislukt: " + err);
        // In toevoeg-modus het bestaande controle-scherm niet weggooien.
        setFase(toevoegModusRef.current ? "preview" : "dicht");
        toevoegModusRef.current = false;
        return;
      }
      const data: ParseResultaat = await res.json();
      // Toevoeg-modus: plak de nieuwe acties aan de bestaande lijst en houd
      // het bestaande controle-scherm vast (vervang niet alles).
      if (toevoegModusRef.current) {
        toevoegModusRef.current = false;
        setActies((prev) => [...prev, ...data.acties]);
        setFase("preview");
        return;
      }
      setResultaat(data);
      setActies(data.acties);
      setCoachProspectId(data.coach_prospect_id || null);
      setCoachProspectNaam(data.coach_prospect_naam || null);
      setFase("preview");
    } catch (err: any) {
      toast.error("Fout: " + (err?.message || "onbekend"));
      setFase(toevoegModusRef.current ? "preview" : "dicht");
      toevoegModusRef.current = false;
    }
  }

  async function bevestig() {
    if (!resultaat) return;
    setFase("opslaan");
    try {
      const { gemaakt, fouten } = await voerActiesUit();
      // Eerst eventuele fouten tonen, duidelijker dan een vrolijke
      // 'Opgeslagen!' toast bovenop een silent fail. Toast persist langer
      // zodat de user kan lezen wat er mis ging.
      if (fouten.length > 0) {
        const samenvatting =
          fouten.length === 1
            ? fouten[0]
            : `${fouten.length} acties faalden:\n• ${fouten.join("\n• ")}`;
        toast.error(samenvatting, { duration: 10000 });
      }
      // Daarna pas de success-toast, alleen als er ÉCHT iets gebeurd is.
      if (acties.length > 0 && gemaakt.length > 0) {
        const tekst =
          fouten.length > 0
            ? `${gemaakt.length} actie(s) wel opgeslagen`
            : "Opgeslagen!";
        toast.success(tekst, {
          duration: 4000,
          action: {
            label: "Ongedaan maken",
            onClick: async () => {
              await undoGemaakteActies(gemaakt);
              // Eerlijk over de reikwijdte: alleen nieuw-aangemaakte rijen
              // worden verwijderd; fase-wijzigingen en tellingen blijven.
              toast.info(
                `${gemaakt.length} nieuwe item(s) verwijderd. Gewijzigde fases of tellingen zet je zelf terug.`,
              );
              router.refresh();
            },
          },
        });
      } else if (fouten.length === 0) {
        toast.success(acties.length > 0 ? "Opgeslagen!" : "Klaar");
      }
      // Sluit modal EERST zodat DOM settled is voor de refresh.
      // Voorkomt iOS Safari scroll-lock na router.refresh().
      sluit();
      // Navigeer/zoek: één actie krijgt voorrang boven refresh.
      const nav = acties.find((a) => a.type === "navigeer") as ActieNavigeer | undefined;
      const zoekActie = acties.find((a) => a.type === "zoek") as ActieZoek | undefined;
      const doelUrl = nav
        ? navigatieUrl(nav)
        : zoekActie
        ? `/zoeken?q=${encodeURIComponent(zoekActie.zoekterm)}`
        : null;
      if (doelUrl) {
        setTimeout(() => router.push(doelUrl), 100);
      } else {
        setTimeout(() => router.refresh(), 100);
      }
    } catch (err: any) {
      toast.error("Opslaan mislukt: " + (err?.message || "onbekend"));
      setFase("preview");
    }
  }

  function navigatieUrl(a: ActieNavigeer): string {
    switch (a.bestemming) {
      case "dashboard": return "/dashboard";
      case "namenlijst": return "/namenlijst";
      case "namenlijst_nieuw": return "/namenlijst/nieuw";
      case "herinneringen": return "/herinneringen";
      case "acties": return "/acties";
      case "coach": return "/coach";
      case "premium": return "/premium";
      case "statistieken": return "/statistieken";
      case "mijn_why": return "/mijn-why";
      case "team": return "/team";
      case "zoeken": return "/zoeken";
      case "instellingen": return "/instellingen";
      case "producten": return "/producten";
      case "scripts": return "/scripts";
      case "prospect":
        return a.prospect_id ? `/namenlijst/${a.prospect_id}` : "/namenlijst";
      default:
        return "/dashboard";
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
      // Fouten niet verzwijgen: de acties zijn (deels) uitgevoerd, dus de
      // gebruiker moet weten wat er niet is opgeslagen.
      if (resultaatUit.fouten.length > 0) {
        toast.error(
          resultaatUit.fouten.length === 1
            ? resultaatUit.fouten[0]
            : `${resultaatUit.fouten.length} acties niet opgeslagen:\n• ${resultaatUit.fouten.join("\n• ")}`,
          { duration: 8000 },
        );
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      setFase("preview");
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
      // Terug naar het controle-scherm i.p.v. eeuwig op de spinner blijven.
      setFase("preview");
      return;
    }

    sluit();
    router.push(`/coach/${nieuw.id}?auto=${encodeURIComponent(bericht)}`);
  }

  async function voerActiesUit(): Promise<{
    gemaakt: Array<{ tabel: string; id: string }>;
    naamNaarId: Record<string, string>;
    fouten: string[];
  }> {
    const gemaakt: Array<{ tabel: string; id: string }> = [];
    const fouten: string[] = [];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { gemaakt, naamNaarId: {}, fouten: ["Niet ingelogd"] };

    // Hulp om elke supabase-mutatie consistent te checken zodat een
    // silent fail (RLS, FK, ontbrekend ID) niet meer ongezien voorbij gaat.
    function check(label: string, error: any) {
      if (error) {
        const boodschap = `${label}: ${error.message ?? error}`;
        console.error("[voerActiesUit]", boodschap, error);
        fouten.push(boodschap);
        return false;
      }
      return true;
    }

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
        const { data, error } = await supabase
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
        if (!check(`Nieuwe prospect "${a.volledige_naam}"`, error)) continue;
        if (data) {
          naamNaarId[a.volledige_naam.toLowerCase()] = data.id;
          gemaakt.push({ tabel: "prospects", id: data.id });
        }
      }
    }
    for (const a of acties) {
      if (a.type === "update_prospect") {
        if (!a.prospect_id) {
          fouten.push("Update prospect: geen prospect_id meegegeven");
          continue;
        }
        const { data: huidig } = await supabase
          .from("prospects")
          .select("notities, pipeline_fase")
          .eq("id", a.prospect_id)
          .single();
        const bestaandeNotitie = huidig?.notities || "";
        const updates: any = {
          updated_at: new Date().toISOString(),
          laatste_contact: vandaagNL(),
        };
        if (a.pipeline_fase) updates.pipeline_fase = a.pipeline_fase;
        if (a.notities_toevoegen) {
          updates.notities = bestaandeNotitie
            ? `${bestaandeNotitie}\n\n[${new Date().toLocaleDateString("nl-NL")}] ${a.notities_toevoegen}`
            : a.notities_toevoegen;
        }
        const { error: updErr } = await supabase
          .from("prospects")
          .update(updates)
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        if (!check(`Update prospect (${a.prospect_id})`, updErr)) continue;
        // Audit-trail: log fase-wijziging of notitie-toevoeging in contact_logs
        if (a.pipeline_fase || a.notities_toevoegen) {
          const { data: log, error: logErr } = await supabase
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
          check("Contact-log bij update_prospect", logErr);
          if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
        }
      }
    }
    for (const a of acties) {
      if (a.type === "notitie") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()];
        if (!id) {
          fouten.push(`Notitie voor "${a.prospect_naam}" niet opgeslagen, naam niet gevonden in je namenlijst`);
          continue;
        }
        const { data: huidig } = await supabase
          .from("prospects")
          .select("notities, pipeline_fase")
          .eq("id", id)
          .single();
        const bestaandeNotitie = huidig?.notities || "";
        const nieuweNotitie = bestaandeNotitie
          ? `${bestaandeNotitie}\n\n[${new Date().toLocaleDateString("nl-NL")}] ${a.notitie}`
          : a.notitie;
        const { error: updErr } = await supabase
          .from("prospects")
          .update({
            notities: nieuweNotitie,
            updated_at: new Date().toISOString(),
            laatste_contact: vandaagNL(),
          })
          .eq("id", id)
          .eq("user_id", user.id);
        if (!check(`Notitie voor "${a.prospect_naam}"`, updErr)) continue;
        // Audit-trail: elke notitie ook loggen in contact_logs
        const { data: log, error: logErr } = await supabase
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
        check(`Contact-log notitie voor "${a.prospect_naam}"`, logErr);
        if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
      }
    }
    for (const a of acties) {
      if (a.type === "taak") {
        const prospectNaam = a.prospect_naam || "";
        const id = prospectNaam ? naamNaarId[prospectNaam.toLowerCase()] || null : null;
        const vervaldatum = a.vervaldatum || standaardDatum();
        const { data: h, error: taakFout } = await supabase
          .from("herinneringen")
          .insert({
            user_id: user.id,
            prospect_id: id,
            herinnering_type: "followup",
            titel: a.titel || "Herinnering zonder titel",
            beschrijving: a.titel || "",
            vervaldatum,
          })
          .select("id")
          .single();
        check(`Herinnering "${a.titel}"`, taakFout);
        if (h) gemaakt.push({ tabel: "herinneringen", id: h.id });
      }
    }
    for (const a of acties) {
      if (a.type === "update_details") {
        if (!a.prospect_id) {
          fouten.push("Details bijwerken: geen prospect_id");
          continue;
        }
        const updates: any = { updated_at: new Date().toISOString() };
        if (a.telefoon) updates.telefoon = a.telefoon;
        if (a.email) updates.email = a.email;
        if (a.instagram) updates.instagram = a.instagram;
        if (a.facebook) updates.facebook = a.facebook;
        if (a.prioriteit) updates.prioriteit = a.prioriteit;
        const { error: updErr } = await supabase
          .from("prospects")
          .update(updates)
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        check(`Details bijwerken (${a.prospect_id})`, updErr);
      }
    }
    for (const a of acties) {
      if (a.type === "contact_log") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()];
        if (!id) {
          fouten.push(`Contact-log voor "${a.prospect_naam}" niet opgeslagen, naam niet gevonden`);
          continue;
        }
        const { data: huidig } = await supabase
          .from("prospects")
          .select("pipeline_fase")
          .eq("id", id)
          .single();
        // DB CHECK-constraint kent alleen deze types; het LLM kan vrijere
        // labels teruggeven ("whatsapp", "app"). Onbekend type wordt notitie,
        // anders faalt de insert en is het contactmoment weg.
        const veiligType = ["dm", "bel", "presentatie", "followup", "notitie"].includes(
          a.contact_type,
        )
          ? a.contact_type
          : "notitie";
        const { data: log, error: logErr } = await supabase
          .from("contact_logs")
          .insert({
            prospect_id: id,
            user_id: user.id,
            contact_type: veiligType,
            notities: a.notities || null,
            fase_voor: huidig?.pipeline_fase || null,
            fase_na: a.nieuwe_fase || huidig?.pipeline_fase || null,
          })
          .select("id")
          .single();
        check(`Contact-log voor "${a.prospect_naam}"`, logErr);
        if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
        const prospectUpdate: any = {
          laatste_contact: vandaagNL(),
          updated_at: new Date().toISOString(),
        };
        if (a.nieuwe_fase) prospectUpdate.pipeline_fase = a.nieuwe_fase;
        const { error: updErr } = await supabase
          .from("prospects")
          .update(prospectUpdate)
          .eq("id", id)
          .eq("user_id", user.id);
        check(`Prospect-update bij contact-log "${a.prospect_naam}"`, updErr);
      }
    }
    for (const a of acties) {
      if (a.type === "stats_increment") {
        const datum = a.datum || vandaagNL();
        const { data: huidig } = await supabase
          .from("dagelijkse_stats")
          .select("*")
          .eq("user_id", user.id)
          .eq("stat_datum", datum)
          .maybeSingle();

        const { error: statsErr } = await supabase.from("dagelijkse_stats").upsert(
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
        check("Dagstats bijwerken", statsErr);
      }
    }
    for (const a of acties) {
      if (a.type === "voltooi_herinnering") {
        if (!a.herinnering_id) {
          fouten.push("Voltooi herinnering: geen herinnering_id");
          continue;
        }
        const { error } = await supabase
          .from("herinneringen")
          .update({ voltooid: true })
          .eq("id", a.herinnering_id)
          .eq("user_id", user.id);
        check(`Herinnering ${a.herinnering_id} voltooien`, error);
      }
    }
    for (const a of acties) {
      if (a.type === "product_bestelling") {
        const id = naamNaarId[a.prospect_naam.toLowerCase()];
        if (!id) {
          fouten.push(`Bestelling voor "${a.prospect_naam}" niet opgeslagen, naam niet gevonden`);
          continue;
        }
        const besteldatum = a.besteldatum || vandaagNL();
        const { data: pb, error: pbErr } = await supabase
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
        if (!check(`Bestelling voor "${a.prospect_naam}"`, pbErr)) continue;
        if (pb) gemaakt.push({ tabel: "product_bestellingen", id: pb.id });
        const { data: huidig } = await supabase
          .from("prospects")
          .select("pipeline_fase")
          .eq("id", id)
          .single();
        const faseUpdate: any = {
          laatste_contact: vandaagNL(),
          updated_at: new Date().toISOString(),
        };
        if (huidig?.pipeline_fase !== "shopper" && huidig?.pipeline_fase !== "member") {
          faseUpdate.pipeline_fase = "shopper";
        }
        const { error: updErr } = await supabase
          .from("prospects")
          .update(faseUpdate)
          .eq("id", id)
          .eq("user_id", user.id);
        check(`Pipeline-fase bij bestelling "${a.prospect_naam}"`, updErr);
      }
    }
    for (const a of acties) {
      if (a.type === "update_herinnering") {
        if (!a.herinnering_id) {
          fouten.push("Herinnering bijwerken: geen herinnering_id");
          continue;
        }
        const updates: any = {};
        if (a.nieuwe_vervaldatum) updates.vervaldatum = a.nieuwe_vervaldatum;
        if (a.nieuwe_titel) updates.titel = a.nieuwe_titel;
        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from("herinneringen")
            .update(updates)
            .eq("id", a.herinnering_id)
            .eq("user_id", user.id);
          check(`Herinnering ${a.herinnering_id} bijwerken`, error);
        }
      }
    }
    for (const a of acties) {
      if (a.type === "verwijder_prospect") {
        if (!a.prospect_id) {
          fouten.push("Verwijder prospect: geen prospect_id");
          continue;
        }
        const { error } = await supabase
          .from("prospects")
          .update({ gearchiveerd: true, updated_at: new Date().toISOString() })
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        check("Prospect verwijderen", error);
      }
    }
    for (const a of acties) {
      if (a.type === "verwijder_herinnering") {
        if (!a.herinnering_id) {
          fouten.push("Verwijder herinnering: geen herinnering_id");
          continue;
        }
        const { error } = await supabase
          .from("herinneringen")
          .delete()
          .eq("id", a.herinnering_id)
          .eq("user_id", user.id);
        check("Herinnering verwijderen", error);
      }
    }
    for (const a of acties) {
      if (a.type === "herstel_prospect") {
        if (!a.prospect_id) {
          fouten.push("Herstel prospect: geen prospect_id");
          continue;
        }
        const { error } = await supabase
          .from("prospects")
          .update({ gearchiveerd: false, updated_at: new Date().toISOString() })
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        check("Prospect herstellen", error);
      }
    }
    for (const a of acties) {
      if (a.type === "hernoem_prospect") {
        if (!a.prospect_id || !a.nieuwe_naam) {
          fouten.push("Hernoemen: prospect_id of nieuwe_naam ontbreekt");
          continue;
        }
        const { error } = await supabase
          .from("prospects")
          .update({
            volledige_naam: a.nieuwe_naam,
            updated_at: new Date().toISOString(),
          })
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        check("Prospect hernoemen", error);
      }
    }
    for (const a of acties) {
      if (a.type === "stats_set") {
        const datum = a.datum || vandaagNL();
        const { data: huidig } = await supabase
          .from("dagelijkse_stats")
          .select("*")
          .eq("user_id", user.id)
          .eq("stat_datum", datum)
          .maybeSingle();
        const { error: statsSetErr } = await supabase.from("dagelijkse_stats").upsert(
          {
            user_id: user.id,
            stat_datum: datum,
            contacten_gemaakt: a.contacten_gemaakt ?? huidig?.contacten_gemaakt ?? 0,
            uitnodigingen: a.uitnodigingen ?? huidig?.uitnodigingen ?? 0,
            followups: a.followups ?? huidig?.followups ?? 0,
            presentaties: a.presentaties ?? huidig?.presentaties ?? 0,
            nieuwe_klanten: a.nieuwe_klanten ?? huidig?.nieuwe_klanten ?? 0,
            nieuwe_partners: a.nieuwe_partners ?? huidig?.nieuwe_partners ?? 0,
          },
          { onConflict: "user_id,stat_datum" }
        );
        check("Dagstats corrigeren", statsSetErr);
      }
    }
    for (const a of acties) {
      if (a.type === "prioriteit_set") {
        if (!a.prospect_id || !a.prioriteit) {
          fouten.push("Prioriteit: prospect_id of prioriteit ontbreekt");
          continue;
        }
        const { error } = await supabase
          .from("prospects")
          .update({ prioriteit: a.prioriteit, updated_at: new Date().toISOString() })
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        check("Prioriteit zetten", error);
      }
    }
    for (const a of acties) {
      if (a.type === "wis_notities") {
        if (!a.prospect_id) {
          fouten.push("Notities wissen: geen prospect_id");
          continue;
        }
        const { error } = await supabase
          .from("prospects")
          .update({ notities: null, updated_at: new Date().toISOString() })
          .eq("id", a.prospect_id)
          .eq("user_id", user.id);
        check("Notities wissen", error);
      }
    }
    for (const a of acties) {
      if (a.type === "mijn_why_update") {
        if (!a.nieuwe_why) {
          fouten.push("WHY bijwerken: geen nieuwe waarde");
          continue;
        }
        const { error } = await supabase
          .from("why_profiles")
          .upsert(
            {
              user_id: user.id,
              why_samenvatting: a.nieuwe_why,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        check("WHY bijwerken", error);
      }
    }
    for (const a of acties) {
      if (a.type === "fase_batch") {
        const ids = (a.prospect_ids || []).filter(Boolean);
        if (ids.length === 0 || !a.nieuwe_fase) {
          fouten.push("Batch fase-update: geen ids of fase");
          continue;
        }
        const { error } = await supabase
          .from("prospects")
          .update({
            pipeline_fase: a.nieuwe_fase,
            updated_at: new Date().toISOString(),
          })
          .in("id", ids)
          .eq("user_id", user.id);
        check(`Batch fase-update (${ids.length} prospects)`, error);
      }
    }
    for (const a of acties) {
      if (a.type === "member_notitie_bulk") {
        const ids = (a.prospect_ids || []).filter(Boolean);
        if (ids.length === 0 || !a.notitie) continue;
        const stempel = `[${new Date().toLocaleDateString("nl-NL")}] ${a.notitie}`;
        for (const id of ids) {
          const { data: huidig } = await supabase
            .from("prospects")
            .select("notities")
            .eq("id", id)
            .eq("user_id", user.id)
            .maybeSingle();
          const nieuweNotitie = huidig?.notities
            ? `${huidig.notities}\n\n${stempel}`
            : stempel;
          const { error: bulkUpdErr } = await supabase
            .from("prospects")
            .update({
              notities: nieuweNotitie,
              updated_at: new Date().toISOString(),
              laatste_contact: vandaagNL(),
            })
            .eq("id", id)
            .eq("user_id", user.id);
          check("Bulk-notitie bij prospect", bulkUpdErr);
          const { data: log, error: bulkLogErr } = await supabase
            .from("contact_logs")
            .insert({
              prospect_id: id,
              user_id: user.id,
              contact_type: "notitie",
              notities: a.notitie,
            })
            .select("id")
            .single();
          check("Bulk-notitie in notitieboekje", bulkLogErr);
          if (log) gemaakt.push({ tabel: "contact_logs", id: log.id });
        }
      }
    }

    return { gemaakt, naamNaarId, fouten };
  }

  function sluit() {
    spraak.reset();
    toevoegModusRef.current = false;
    setFase("dicht");
    setResultaat(null);
    setActies([]);
    setBewerkTekst("");
    setCoachProspectId(null);
    setCoachProspectNaam(null);
    setSpraakFoutTekst("");
    setSpraakFoutDebug("");
  }

  function verwijderActie(idx: number) {
    setActies((prev) => prev.filter((_, i) => i !== idx));
  }

  // Per-actie bewerken (✏️ in het controle-scherm): vervang de actie op idx
  // door de aangepaste versie. Wijzigt de naam mee, dan propageert die naar
  // alle gekoppelde acties, zodat notitie/taak/bestelling aan de juiste
  // persoon blijven hangen.
  function wijzigActie(idx: number, nieuwe: Actie) {
    setActies((prev) => {
      const oude: any = prev[idx];
      const oudeNaam = String(oude?.volledige_naam ?? oude?.prospect_naam ?? "")
        .trim()
        .toLowerCase();
      const nieuweNaam = String(
        (nieuwe as any)?.volledige_naam ?? (nieuwe as any)?.prospect_naam ?? "",
      ).trim();
      const naamGewijzigd =
        !!oudeNaam && !!nieuweNaam && oudeNaam !== nieuweNaam.toLowerCase();
      return prev.map((a: any, i) => {
        if (i === idx) return nieuwe;
        if (!naamGewijzigd) return a;
        const kopie = { ...a };
        if (
          typeof kopie.volledige_naam === "string" &&
          kopie.volledige_naam.trim().toLowerCase() === oudeNaam
        )
          kopie.volledige_naam = nieuweNaam;
        if (
          typeof kopie.prospect_naam === "string" &&
          kopie.prospect_naam.trim().toLowerCase() === oudeNaam
        )
          kopie.prospect_naam = nieuweNaam;
        return kopie;
      });
    });
  }

  function voegNotitieToe() {
    const tekst = toevoegTekst.trim();
    if (!tekst) return;
    setActies((prev) => [
      ...prev,
      { type: "notitie", prospect_naam: toevoegNaam.trim(), notitie: tekst } as Actie,
    ]);
    setToevoegNaam("");
    setToevoegTekst("");
    setToevoegOpen(false);
  }

  function formatTijd(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // FAB altijd in de DOM houden; alleen pointer-events/opacity/transform wisselen.
  // iOS Safari heeft repaint-glitches bij position:fixed elementen die via React
  // conditioneel unmounten/mounten na route-transities, daardoor verdween de knop.
  const fabVerborgen = fase !== "dicht" || !zichtbaar;

  return (
    <>
      {/* Floating Action Button, altijd gerenderd, visueel verborgen via CSS */}
      <button
        onClick={openen}
        className="fixed bottom-20 lg:bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cm-gold-light to-cm-gold text-cm-black ring-2 ring-cm-gold/30 flex items-center justify-center text-2xl active:scale-95 hover:scale-105 transition-all duration-200 animate-pulse-gold"
        style={{
          boxShadow:
            "0 0 32px rgba(184,154,82,0.45), 0 8px 20px rgba(0,0,0,0.45)",
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
                      Microfoon niet beschikbaar in deze browser. Gebruik de microfoon-knop op je toetsenbord om te dicteren:
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
                  <div className="card bg-cm-surface-2 min-h-[120px] flex items-center justify-center text-center">
                    <div>
                      <p className="text-cm-white text-sm opacity-80">
                        🎙️ Spreek alles in wat je kwijt wilt...
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={sluit} className="btn-secondary flex-1">
                    Annuleren
                  </button>
                  <button
                    onClick={verwerkHuidig}
                    className="btn-gold flex-1"
                    disabled={
                      (!spraak.ondersteund || !spraak.toegang)
                        ? spraak.transcript.trim().length < 3
                        : spraak.seconden < 1
                    }
                  >
                    ✓ Stop & bewerk
                  </button>
                </div>
              </div>
            )}

            {fase === "transcriberen" && (
              <div className="p-8 text-center space-y-3">
                <div className="inline-block w-12 h-12 border-4 border-cm-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-cm-white">Spraak wordt omgezet naar tekst...</p>
                <p className="text-cm-white text-xs opacity-60">Dit duurt meestal 2-4 seconden</p>
              </div>
            )}

            {fase === "spraakfout" && (
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-3">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h2 className="text-lg font-display font-bold text-cm-white">
                    Spraak werkte niet
                  </h2>
                </div>
                <div className="card bg-red-500/10 border border-red-500/40 space-y-2">
                  <p className="text-red-300 text-sm font-medium">{spraakFoutTekst}</p>
                  {spraakFoutDebug && (
                    <p className="text-cm-white text-xs opacity-60 font-mono break-all">
                      {spraakFoutDebug}
                    </p>
                  )}
                </div>
                <p className="text-cm-white text-xs opacity-70">
                  Stuur deze melding door als het probleem blijft, dan kan het
                  uitgezocht worden.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={sluit} className="btn-secondary sm:flex-1">
                    Sluiten
                  </button>
                  <button onClick={opnieuwOpnemen} className="btn-gold sm:flex-1">
                    🎙️ Opnieuw proberen
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
                    Corrigeer, typ bij, of druk op 🎙️ om vanaf je cursor extra in te spreken. Klik Verwerk wanneer alles compleet is.
                  </p>
                </div>
                <div className="relative">
                  <textarea
                    ref={bewerkTextareaRef}
                    value={bewerkTekst}
                    onChange={(e) => setBewerkTekst(e.target.value)}
                    className={`textarea-cm text-sm w-full pr-14 ${
                      spraak.actief || bewerkenTranscribeert
                        ? "opacity-60"
                        : ""
                    }`}
                    rows={8}
                    autoFocus
                    readOnly={spraak.actief || bewerkenTranscribeert}
                  />
                  {spraak.ondersteund && spraak.toegang && (
                    <button
                      type="button"
                      onClick={toggleBewerkOpname}
                      disabled={bewerkenTranscribeert}
                      className={`absolute bottom-2 right-2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        spraak.actief
                          ? "bg-red-600 text-white animate-pulse"
                          : "border border-cm-border bg-cm-surface-2 text-cm-gold hover:opacity-90"
                      } ${bewerkenTranscribeert ? "cursor-wait opacity-60" : ""}`}
                      title={
                        spraak.actief
                          ? "Stop opname"
                          : bewerkenTranscribeert
                          ? "Bezig met omzetten..."
                          : "Spreek vanaf cursor extra in"
                      }
                      aria-label="Microfoon"
                    >
                      {bewerkenTranscribeert ? "⏳" : "🎙️"}
                    </button>
                  )}
                  {spraak.actief && (
                    <div className="absolute top-2 right-2 text-[11px] text-red-400 font-semibold bg-cm-surface-2/90 px-2 py-0.5 rounded">
                      🔴 {formatTijd(spraak.seconden)} / {formatTijd(MAX_SECONDEN)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={sluit}
                    className="btn-secondary sm:flex-1"
                    disabled={spraak.actief || bewerkenTranscribeert}
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={opnieuwOpnemen}
                    className="btn-secondary sm:flex-1"
                    disabled={spraak.actief || bewerkenTranscribeert}
                  >
                    🔄 Helemaal opnieuw
                  </button>
                  <button
                    onClick={() => verwerk(bewerkTekst.trim())}
                    className="btn-gold sm:flex-1"
                    disabled={
                      bewerkTekst.trim().length < 3 ||
                      spraak.actief ||
                      bewerkenTranscribeert
                    }
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
                      <ActieKaart
                        key={i}
                        actie={a}
                        onVerwijder={() => verwijderActie(i)}
                        onWijzig={(nw) => wijzigActie(i, nw)}
                      />
                    ))}
                  </div>
                )}

                {/* Zelf een gemiste notitie toevoegen (dubbele controle). */}
                {resultaat.intentie !== "coach" &&
                  (toevoegOpen ? (
                    <div className="card bg-cm-surface-2 space-y-2">
                      <input
                        value={toevoegNaam}
                        onChange={(e) => setToevoegNaam(e.target.value)}
                        placeholder="Naam (bij wie hoort het?)"
                        className="input-cm text-sm"
                      />
                      <textarea
                        value={toevoegTekst}
                        onChange={(e) => setToevoegTekst(e.target.value)}
                        placeholder="Notitie…"
                        className="textarea-cm text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setToevoegOpen(false)}
                          className="btn-secondary text-xs flex-1"
                        >
                          Annuleren
                        </button>
                        <button
                          onClick={voegNotitieToe}
                          disabled={!toevoegTekst.trim()}
                          className="btn-gold text-xs flex-1 disabled:opacity-40"
                        >
                          Toevoegen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={startToevoegInspreken}
                        className="w-full text-cm-gold text-sm border border-dashed border-cm-gold/40 rounded-xl py-2.5 hover:bg-cm-gold/5 transition-colors font-medium"
                      >
                        🎙️ Inspreken om iets toe te voegen
                      </button>
                      <button
                        onClick={() => setToevoegOpen(true)}
                        className="text-cm-white/50 text-xs hover:text-cm-white/80 self-center"
                      >
                        of typ het zelf
                      </button>
                    </div>
                  ))}

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
                          Geen prospect herkend, advies wordt algemeen opgeslagen.
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

                {acties.length === 0 && !resultaat.coach_bericht && (
                  <div className="card border-cm-gold/30 bg-cm-gold/5 space-y-2">
                    <p className="text-xs text-cm-gold uppercase tracking-wider">💡 Geen actie herkend</p>
                    <p className="text-cm-white text-sm">
                      ELEVA heeft je tekst begrepen, maar kon er geen concrete actie uit afleiden.
                      Pas de tekst aan en probeer het opnieuw, bijvoorbeeld door een volledige
                      naam te noemen of duidelijker te zeggen wat je wilt (toevoegen, verwijderen,
                      notitie, herinnering, bestelling).
                    </p>
                    <button
                      onClick={() => {
                        setBewerkTekst(resultaat.gecorrigeerd_transcript || resultaat.transcript);
                        setResultaat(null);
                        setActies([]);
                        setFase("bewerken");
                      }}
                      className="btn-gold text-sm mt-1"
                    >
                      ✏️ Bewerk tekst en probeer opnieuw
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button onClick={sluit} className="btn-secondary sm:flex-1">
                    Annuleren
                  </button>
                  {/* Combi-flow: zowel data-acties als een vraag voor de mentor.
                      Twee knoppen: opslaan + mentor, of alleen opslaan (mentor-vraag weggooien). */}
                  {resultaat.coach_bericht && acties.length > 0 && (
                    <>
                      <button onClick={bevestig} className="btn-secondary sm:flex-1">
                        ✅ Alleen opslaan
                      </button>
                      <button onClick={naarMentor} className="btn-gold sm:flex-1">
                        🧭 Opslaan + naar mentor
                      </button>
                    </>
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

// Per actie-type: welke velden mag je in het controle-scherm met ✏️ aanpassen.
const BEWERKBARE_VELDEN: Record<
  string,
  { key: string; label: string; meerregelig?: boolean; datum?: boolean }[]
> = {
  nieuwe_prospect: [
    { key: "volledige_naam", label: "Naam" },
    { key: "notities", label: "Notitie", meerregelig: true },
  ],
  notitie: [
    { key: "prospect_naam", label: "Naam" },
    { key: "notitie", label: "Notitie", meerregelig: true },
  ],
  taak: [
    { key: "prospect_naam", label: "Naam" },
    { key: "titel", label: "Titel" },
    { key: "vervaldatum", label: "Datum", datum: true },
  ],
  product_bestelling: [
    { key: "prospect_naam", label: "Naam" },
    { key: "product_omschrijving", label: "Product" },
    { key: "besteldatum", label: "Datum", datum: true },
  ],
  contact_log: [
    { key: "prospect_naam", label: "Naam" },
    { key: "notities", label: "Notitie", meerregelig: true },
  ],
  update_prospect: [
    { key: "notities_toevoegen", label: "Notitie", meerregelig: true },
  ],
  update_herinnering: [
    { key: "nieuwe_titel", label: "Titel" },
    { key: "nieuwe_vervaldatum", label: "Datum", datum: true },
  ],
  hernoem_prospect: [{ key: "nieuwe_naam", label: "Nieuwe naam" }],
};

function ActieKaart({
  actie,
  onVerwijder,
  onWijzig,
}: {
  actie: Actie;
  onVerwijder: () => void;
  onWijzig: (nieuwe: Actie) => void;
}) {
  const content = beschrijfActie(actie);
  const isVerwijder =
    actie.type === "verwijder_prospect" ||
    actie.type === "verwijder_herinnering" ||
    actie.type === "wis_notities";
  const isNavigatie = actie.type === "navigeer" || actie.type === "zoek";
  const isNieuweNaam = actie.type === "nieuwe_prospect";

  const velden = BEWERKBARE_VELDEN[actie.type] || [];
  const [bewerk, setBewerk] = useState(false);
  const [concept, setConcept] = useState<any>(actie);

  // De lijst gebruikt index-keys: wordt een kaart erboven verwijderd, dan
  // schuift de actie onder deze component door. Sluit dan de bewerk-modus
  // zodat "Opslaan" nooit per ongeluk de verkeerde actie overschrijft.
  useEffect(() => {
    setBewerk(false);
    setConcept(actie);
  }, [actie]);

  return (
    <div
      className={`card flex gap-3 ${
        isVerwijder
          ? "bg-red-500/10 border-red-500/40"
          : isNavigatie
          ? "bg-cm-gold/10 border-cm-gold/30"
          : "bg-cm-surface-2"
      }`}
    >
      <span className="text-2xl">{content.icoon}</span>
      <div className="flex-1 min-w-0">
        {bewerk ? (
          <div className="space-y-2">
            {velden.map((vd) => (
              <div key={vd.key}>
                <label className="block text-[11px] uppercase tracking-wider text-cm-white/50 mb-0.5">
                  {vd.label}
                </label>
                {vd.meerregelig ? (
                  <textarea
                    value={concept[vd.key] ?? ""}
                    onChange={(e) =>
                      setConcept((c: any) => ({ ...c, [vd.key]: e.target.value }))
                    }
                    className="textarea-cm text-xs"
                    rows={2}
                  />
                ) : (
                  <input
                    type={vd.datum ? "date" : "text"}
                    value={concept[vd.key] ?? ""}
                    onChange={(e) =>
                      setConcept((c: any) => ({ ...c, [vd.key]: e.target.value }))
                    }
                    className="input-cm text-xs py-1"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => {
                  setConcept(actie);
                  setBewerk(false);
                }}
                className="btn-secondary text-xs flex-1"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  onWijzig(concept as Actie);
                  setBewerk(false);
                }}
                className="btn-gold text-xs flex-1"
              >
                Opslaan
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-cm-white font-semibold text-sm">{content.titel}</p>
            {content.details.map((d, i) => (
              <p key={i} className="text-cm-white text-xs opacity-70 mt-0.5">{d}</p>
            ))}
            {isNieuweNaam && (
              <p className="text-[11px] text-yellow-400 mt-1">
                ⚠️ nieuwe kaart, check de naam met ✏️
              </p>
            )}
          </>
        )}
      </div>
      {!bewerk && (
        <div className="flex flex-col gap-2 items-center">
          {velden.length > 0 && (
            <button
              onClick={() => {
                setConcept(actie);
                setBewerk(true);
              }}
              className="text-cm-gold/70 hover:text-cm-gold text-sm"
              title="Aanpassen"
            >
              ✏️
            </button>
          )}
          <button
            onClick={onVerwijder}
            className="text-red-400 hover:text-red-300 text-sm"
            title="Verwijder deze actie"
          >
            ✕
          </button>
        </div>
      )}
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
      case "verwijder_prospect":
        return {
          icoon: "🗑️",
          titel: `Verwijder: ${actie.volledige_naam || "prospect"}`,
          details: [
            "Wordt gearchiveerd (verdwijnt uit alle lijsten, kan teruggehaald worden).",
          ],
        };
      case "verwijder_herinnering":
        return {
          icoon: "🗑️",
          titel: `Verwijder herinnering: ${actie.titel || "(geen titel)"}`,
          details: ["Wordt definitief verwijderd."],
        };
      case "herstel_prospect":
        return {
          icoon: "♻️",
          titel: `Herstel: ${actie.volledige_naam || "prospect"}`,
          details: ["Uit archief terughalen, verschijnt weer in alle lijsten."],
        };
      case "hernoem_prospect":
        return {
          icoon: "✏️",
          titel: `Hernoemen → ${actie.nieuwe_naam || "(geen naam)"}`,
          details: [
            actie.oude_naam ? `Van: ${actie.oude_naam}` : null,
          ].filter(Boolean) as string[],
        };
      case "stats_set": {
        const items: string[] = [];
        if (actie.contacten_gemaakt !== undefined) items.push(`Contacten = ${actie.contacten_gemaakt}`);
        if (actie.uitnodigingen !== undefined) items.push(`Uitnodigingen = ${actie.uitnodigingen}`);
        if (actie.followups !== undefined) items.push(`Follow-ups = ${actie.followups}`);
        if (actie.presentaties !== undefined) items.push(`Presentaties = ${actie.presentaties}`);
        if (actie.nieuwe_klanten !== undefined) items.push(`Klanten = ${actie.nieuwe_klanten}`);
        if (actie.nieuwe_partners !== undefined) items.push(`Partners = ${actie.nieuwe_partners}`);
        return {
          icoon: "🔢",
          titel: "Dagstats CORRIGEREN" + (actie.datum ? ` (${actie.datum})` : ""),
          details: [...items, "Vervangt bestaande waarden, niet optellen."],
        };
      }
      case "prioriteit_set":
        return {
          icoon: "⭐",
          titel: `Prioriteit ${actie.prioriteit || "?"}, ${actie.volledige_naam || "prospect"}`,
          details: [],
        };
      case "wis_notities":
        return {
          icoon: "🧹",
          titel: `Notities wissen: ${actie.volledige_naam || "prospect"}`,
          details: ["Alle bestaande notities bij deze prospect worden leeggemaakt."],
        };
      case "navigeer": {
        const labels: Record<string, string> = {
          dashboard: "Dashboard",
          namenlijst: "Namenlijst",
          namenlijst_nieuw: "Nieuwe prospect",
          herinneringen: "Herinneringen",
          acties: "Volgende acties",
          coach: "ELEVA Mentor",
          premium: "Premium",
          statistieken: "Statistieken",
          mijn_why: "Mijn WHY",
          team: "Mijn team",
          zoeken: "Zoeken",
          instellingen: "Instellingen",
          producten: "Producten",
          scripts: "Scripts",
          prospect: actie.volledige_naam ? `Kaart: ${actie.volledige_naam}` : "Prospect-kaart",
        };
        return {
          icoon: "🧭",
          titel: `Ga naar: ${labels[actie.bestemming] || actie.bestemming}`,
          details: ["Opent de pagina na opslaan."],
        };
      }
      case "zoek":
        return {
          icoon: "🔍",
          titel: `Zoeken: "${actie.zoekterm || ""}"`,
          details: ["Opent de zoekpagina met resultaten."],
        };
      case "mijn_why_update":
        return {
          icoon: "💡",
          titel: "Mijn WHY bijwerken",
          details: [actie.nieuwe_why ? `"${String(actie.nieuwe_why).slice(0, 120)}${String(actie.nieuwe_why).length > 120 ? "..." : ""}"` : ""].filter(Boolean),
        };
      case "fase_batch":
        return {
          icoon: "📦",
          titel: `Bulk-fase → ${actie.nieuwe_fase || "?"}`,
          details: [
            `${(actie.prospect_ids || []).length} prospect(s)`,
            ...(actie.namen || []).slice(0, 5).map((n: string) => `• ${n}`),
            (actie.namen || []).length > 5 ? `... en ${(actie.namen || []).length - 5} meer` : null,
          ].filter(Boolean) as string[],
        };
      case "member_notitie_bulk":
        return {
          icoon: "📝",
          titel: `Notitie bij ${(actie.prospect_ids || []).length} prospect(s)`,
          details: [
            actie.notitie ? `"${String(actie.notitie).slice(0, 100)}"` : "",
            ...((actie.namen || []).slice(0, 5).map((n: string) => `• ${n}`)),
            (actie.namen || []).length > 5 ? `... en ${(actie.namen || []).length - 5} meer` : null,
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
