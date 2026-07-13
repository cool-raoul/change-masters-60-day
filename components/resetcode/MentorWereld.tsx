"use client";

// ============================================================
// DE MENTOR-WERELD: de Resetcode-klantomgeving als één warm
// gesprek (richting D). Feedback-ronde 10 juli verwerkt:
// - WhatsApp-gevoel: geen scrollbalk, groter leesbaar font,
//   typ-indicator, berichten druppelen rustig binnen.
// - Geen knopjes-balk: alles loopt via het gesprek zelf; de
//   Mentor vertelt wat je kunt vragen en verstaat "tips",
//   "documenten", "wat mag ik eten", "verder" enzovoort.
// - Foto's: etiket-check vanuit de supermarkt via de camera.
// - Geheugen: het hele gesprek + je plek worden op dit toestel
//   onthouden (preview); na de database-ronde reist dat mee met
//   de klant-link over apparaten heen.
// ============================================================

import { useEffect, useRef, useState } from "react";
import {
  RESET_PROGRAMMAS,
  programmaVoor,
  stationVoor,
  type ResetProgramma,
  type ResetStation,
} from "@/lib/resetcode/programma";
import { waLinkNaar } from "@/lib/util/wa-nummer";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { SUIKER_NAMEN, WC_TIPS } from "@/lib/resetcode/producten";
import {
  touchpointTekst,
  type TouchpointSleutel,
} from "@/lib/resetcode/touchpoints";

type Kaart =
  | "regels"
  | "welniet"
  | "tips"
  | "video"
  | "documenten"
  | "contact"
  | "logi"
  | "vervolg"
  | "faq"
  | "suikers"
  | "wctips";

type ChatItem =
  | { van: "mentor"; soort: "tekst"; tekst: string }
  | { van: "mentor"; soort: "kaart"; kaart: Kaart; stationSlug: string }
  | { van: "mentor"; soort: "programma-keuze" }
  | { van: "ik"; soort: "tekst"; tekst: string }
  | { van: "ik"; soort: "foto"; dataUrl: string };

const OPSLAG_SLEUTEL = "resetcode-preview-gesprek-v1";
const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms));

const LOGI_LAGEN = [
  { label: "ZELDEN", inhoud: "zoet, gebak, fastfood", breedte: "34%", kleur: "#C97B7B" },
  { label: "MET MATE", inhoud: "granen en volkoren", breedte: "56%", kleur: "#C9A15C" },
  { label: "REGELMATIG", inhoud: "vis, vlees, eieren, zuivel", breedte: "78%", kleur: "#7FA35E" },
  { label: "VAAK", inhoud: "groente en fruit", breedte: "100%", kleur: "#4E8F4B" },
];

export default function MentorWereld({
  begeleiderNaam,
  token,
  klantVoornaam,
  programmaSlugVast,
  stationSlugStart,
  beginItems,
  memberTelefoon,
  mediaBlokken,
  isFounder,
  touchpointsAlVerteld,
  isBouwer,
  dueTouchpoint,
  kcalStart,
}: {
  begeleiderNaam: string;
  /** Klant-modus: token van de klant-link; het gesprek wordt dan op de server bewaard. */
  token?: string;
  klantVoornaam?: string;
  programmaSlugVast?: string;
  stationSlugStart?: string | null;
  beginItems?: ChatItem[];
  memberTelefoon?: string | null;
  /** Gevulde media per sleutel `${programma}/${station}-video` en `-docs`. */
  mediaBlokken?: Record<string, Blok[]>;
  /** Founder in de preview: mag media-plekken vullen (edit-modus). */
  isFounder?: boolean;
  /** Business-verhalen die deze klant al kreeg (over programma's heen). */
  touchpointsAlVerteld?: string[];
  /** Bouwt zelf al mee: dan geen webshop-verhalen, puur programma-coach. */
  isBouwer?: boolean;
  /** Tijd-gebonden touchpoint dat nú aan de beurt is (bijv. kern-verhaal rond dag 7). */
  dueTouchpoint?: TouchpointSleutel | null;
  /** Dagtotaal van de calorieteller (laaddagen), server-side berekend. */
  kcalStart?: number;
}) {
  const isKlant = Boolean(token);
  const verteldRef = useRef<Set<string>>(new Set(touchpointsAlVerteld ?? []));

  function markeerTouchpoint(sleutel: TouchpointSleutel) {
    if (!token) return;
    fetch("/api/resetcode/touchpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sleutel }),
    }).catch(() => {});
  }

  // Speelt een business-touchpoint, precies één keer per klant (ook over
  // meerdere programma's heen) en nooit voor bouwers of members.
  async function speelTouchpoint(sleutel: TouchpointSleutel) {
    if (isBouwer || rol === "member") return;
    if (verteldRef.current.has(sleutel)) return;
    const kernAl = verteldRef.current.has("kern-verhaal");
    const teksten = touchpointTekst(sleutel, begeleiderNaam, kernAl);
    verteldRef.current.add(sleutel);
    // basis-groeien zonder kern-verhaal vertelt het kern-verhaal zelf.
    const dektKern =
      sleutel === "kern-verhaal" || (sleutel === "basis-groeien" && !kernAl);
    if (dektKern) verteldRef.current.add("kern-verhaal");
    for (const tekst of teksten) {
      await mentorZegt(tekst, 1400);
      await wacht(600);
    }
    markeerTouchpoint(sleutel);
    if (dektKern && sleutel !== "kern-verhaal") markeerTouchpoint("kern-verhaal");
  }
  const [rol, setRol] = useState<"klant" | "member">("klant");
  const [programma, setProgramma] = useState<ResetProgramma | null>(null);
  const [station, setStation] = useState<ResetStation | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [mentorTypt, setMentorTypt] = useState(false);
  const [opneemt, setOpneemt] = useState(false);
  const [verwerkt, setVerwerkt] = useState(false);
  // Calorieteller (alleen actief op de laaddagen).
  const [kcalTotaal, setKcalTotaal] = useState<number>(kcalStart ?? 0);
  const [kanPraten, setKanPraten] = useState(false);
  const [toonReis, setToonReis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const gestart = useRef(false);

  useEffect(() => {
    setKanPraten(
      typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  // Scroll alleen wanneer er een NIEUW bericht bijkomt (of de typ-
  // indicator verschijnt), niet bij elk binnenstromend stukje tekst.
  // Zo blijf je bij een lang antwoord gewoon BOVENAAN het antwoord
  // lezen terwijl de rest eronder aangroeit (feedback Raoul).
  const vorigeAantal = useRef(0);
  useEffect(() => {
    if (items.length !== vorigeAantal.current || mentorTypt) {
      vorigeAantal.current = items.length;
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [items, mentorTypt]);

  // Klant-modus: gescripte items (welkom, kaartjes, echo's) naar de
  // server zodat het geheugen over apparaten meereist. Fire-and-forget.
  function logNaarServer(
    nieuwe: {
      van: "klant" | "mentor";
      soort: "tekst" | "kaart" | "foto";
      kaart?: string;
      stationSlug?: string | null;
      tekst?: string;
    }[],
  ) {
    if (!token) return;
    fetch("/api/resetcode/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, items: nieuwe }),
    }).catch(() => {});
  }

  // Geheugen: gesprek + plek bewaren op dit toestel (foto-data niet,
  // die is te groot voor localStorage; er blijft een tekst-spoor).
  // In klant-modus niet nodig: daar is de server het geheugen.
  useEffect(() => {
    if (!gestart.current || isKlant) return;
    try {
      const opTeSlaan = {
        rol,
        programmaSlug: programma?.slug ?? null,
        stationSlug: station?.slug ?? null,
        items: items.map((i) =>
          i.van === "ik" && i.soort === "foto"
            ? { van: "ik" as const, soort: "tekst" as const, tekst: "📷 (foto gestuurd)" }
            : i,
        ),
      };
      localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(opTeSlaan));
    } catch {
      // opslag vol of geblokkeerd: geen ramp in de preview
    }
  }, [items, programma, station, rol]);

  // Start: gesprek herstellen als dat er is, anders vers beginnen.
  useEffect(() => {
    if (gestart.current) return;
    gestart.current = true;

    // Klant-modus: alles komt van de server (via de pagina-props).
    if (isKlant && programmaSlugVast) {
      const prog = programmaVoor(programmaSlugVast);
      if (!prog) return;
      setProgramma(prog);
      const st = stationSlugStart
        ? stationVoor(prog.slug, stationSlugStart)
        : null;
      if (st && beginItems && beginItems.length > 0) {
        setStation(st);
        setItems([
          ...beginItems,
          {
            van: "mentor",
            soort: "tekst",
            tekst: `Welkom terug! 👋 We waren bij ${st.emoji} ${st.naam}. Waar wil je verder mee? Stel je vraag, stuur een foto van een etiket, of zeg "verder" voor de volgende stap.`,
          },
        ]);
        // Tijd-gebonden touchpoint (bijv. het kern-verhaal rond dag 7 van
        // de 16 dagen of van fase 2): rustig ná het welkom-terug.
        if (dueTouchpoint) {
          (async () => {
            await wacht(2500);
            await speelTouchpoint(dueTouchpoint);
          })();
        }
      } else {
        // Allereerste bezoek: warm welkom + eerste stap.
        (async () => {
          await mentorZegt(
            `Hé ${klantVoornaam ?? ""}, welkom! 🌿 Ik ben je Mentor. Ik ken jouw hele programma van begin tot eind en ik ben er dag en nacht, samen met ${begeleiderNaam}. Praat gewoon tegen me of typ, wat jij fijn vindt. En handig: zet deze pagina op je beginscherm (delen ▸ zet op beginscherm), dan sta ik altijd tussen je apps. Ik onthoud alles wat we bespreken. 💚`,
            1200,
          );
          await wacht(700);
          await introStation(prog, prog.stations[0]);
          fetch("/api/resetcode/stap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, station: prog.stations[0].slug }),
          }).catch(() => {});
        })();
      }
      return;
    }

    try {
      const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
      if (ruw) {
        const data = JSON.parse(ruw) as {
          rol?: "klant" | "member";
          programmaSlug?: string | null;
          stationSlug?: string | null;
          items?: ChatItem[];
        };
        const prog = data.programmaSlug ? programmaVoor(data.programmaSlug) : null;
        const st =
          prog && data.stationSlug
            ? stationVoor(prog.slug, data.stationSlug)
            : null;
        if (prog && st && Array.isArray(data.items) && data.items.length > 0) {
          if (data.rol) setRol(data.rol);
          setProgramma(prog);
          setStation(st);
          setItems([
            ...data.items,
            {
              van: "mentor",
              soort: "tekst",
              tekst: `Welkom terug! 👋 We waren bij ${st.emoji} ${st.naam}. Waar wil je verder mee? Stel je vraag, stuur een foto van een etiket, of zeg "verder" voor de volgende stap.`,
            },
          ]);
          return;
        }
      }
    } catch {
      // kapotte opslag: gewoon vers starten
    }
    versBeginnen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function versBeginnen() {
    setProgramma(null);
    setStation(null);
    setItems([]);
    setMentorTypt(true);
    await wacht(900);
    setMentorTypt(false);
    setItems([
      {
        van: "mentor",
        soort: "tekst",
        tekst: "Hé, welkom! 🌿 Ik ben je Mentor. Ik ken jouw hele programma van begin tot eind en ik ben er dag en nacht. Praat gewoon tegen me of typ, wat jij fijn vindt.",
      },
    ]);
    await wacht(1400);
    setMentorTypt(true);
    await wacht(1100);
    setMentorTypt(false);
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "tekst",
        tekst: "Eerst even dit: welk programma ga jij doen?",
      },
      { van: "mentor", soort: "programma-keuze" },
    ]);
  }

  async function mentorZegt(tekst: string, denkMs = 900) {
    setMentorTypt(true);
    await wacht(denkMs);
    setMentorTypt(false);
    setItems((b) => [...b, { van: "mentor", soort: "tekst", tekst }]);
    logNaarServer([{ van: "mentor", soort: "tekst", tekst }]);
  }

  async function mentorKaart(kaart: Kaart, stationSlug: string, denkMs = 700) {
    setMentorTypt(true);
    await wacht(denkMs);
    setMentorTypt(false);
    setItems((b) => [...b, { van: "mentor", soort: "kaart", kaart, stationSlug }]);
    logNaarServer([{ van: "mentor", soort: "kaart", kaart, stationSlug }]);
  }

  // Fase-intro, bewust RUSTIG (feedback Raoul 12 juli: geen spervuur van
  // berichtjes): één welkom-bericht, de regels, en de documenten worden
  // VOORGESCHOTELD in plaats van dat iemand erom moet vragen. Alles wat
  // meer is (tips, video, suikerlijst) komt op het juiste moment of op
  // verzoek.
  async function introStation(prog: ResetProgramma, st: ResetStation) {
    setStation(st);
    await mentorZegt(`${st.emoji} ${st.naam} · ${st.duur}\n\n${st.welkom}`, 1100);
    // Video van deze stap meteen laten zien (Boardslink-stijl:
    // "start hier de video"), vóór de regels.
    const heeftVideo =
      st.videoSlots.length > 0 ||
      (mediaBlokken?.[`${prog.slug}/${st.slug}-video`]?.length ?? 0) > 0;
    if (heeftVideo) {
      await wacht(600);
      await mentorKaart("video", st.slug, 800);
    }
    if (st.vandaagBelangrijk.length) {
      await wacht(700);
      await mentorKaart("regels", st.slug, 1000);
    }
    // Laaddagen: de Mentor ís de calorieteller (route 1, geen FatSecret).
    if (st.slug === "laaddagen") {
      await wacht(700);
      await mentorZegt(
        "En vandaag is het simpel: eten! 😋 Zeg of stuur me gewoon alles wat je eet (een foto van je bord of de verpakking mag ook), dan tel ik je calorieën automatisch mee. Bovenin zie je je teller richting de 3500+ lopen. Foutje gemaakt? Zeg gewoon \"haal die laatste weg\".",
        1100,
      );
    }
    // Documenten meteen aanreiken, met print-tip bij de start-stations.
    const heeftDocs =
      st.documenten.length > 0 ||
      (mediaBlokken?.[`${prog.slug}/${st.slug}-docs`]?.length ?? 0) > 0;
    if (heeftDocs) {
      await wacht(800);
      const isStart = st.slug === "start" || st.slug === "voorbereiding";
      await mentorZegt(
        isStart
          ? `Dit heb je nodig, ik zet het alvast voor je klaar. 🖨️ Tip: print je boekje${prog.slug === "reset" ? " en het meet- en weegschema" : ""} even uit, dat werkt het fijnst. En goed om te weten: ik ken de inhoud van al deze documenten. Doorlezen mag dus, maar hoeft niet, je kunt me er ook gewoon alles over vragen. Ik bedenk trouwens ook recepten voor je, of een dag- of weekschema dat precies in jouw fase past; zeg maar wat je in huis hebt. En zeg "verder" zodra je klaar bent voor de volgende stap.`
          : `Dit hoort bij deze fase, alvast voor je klaargezet. Ik ken de inhoud, dus vragen mag ook gewoon. Kwijt? Even roepen, dan stuur ik het opnieuw.`,
        1000,
      );
      await mentorKaart("documenten", st.slug, 700);
    }
    // Suiker-spiekbriefje proactief in de fases waar het ertoe doet:
    // niemand weet uit zichzelf dat suiker schuilnamen heeft.
    if (["zestien-dagen", "omschakeling"].includes(st.slug)) {
      await wacht(900);
      await mentorZegt(
        `Oh, en eentje die bijna niemand weet: op etiketten heet suiker zelden gewoon "suiker". Er zijn wel 150 schuilnamen. Scroll maar eens door dit spiekbriefje, en twijfel je in de winkel: stuur me een foto van de ingrediëntenlijst, dan kijk ik mee 📷`,
        1200,
      );
      await mentorKaart("suikers", st.slug, 800);
    }
    // Business-touchpoints die bij een stap-start horen (eenmalig per
    // klant, nooit voor bouwers). Het kern-verhaal rond dag 7 komt via
    // de tijd-gebonden route (dueTouchpoint), niet hier.
    const TOUCHPOINT_BIJ_STATION: Partial<Record<string, TouchpointSleutel>> = {
      stabilisatie: "reset-complimenten",
      "logisch-leven": "reset-afronding",
      ritme: "basis-week3",
      groeien: "basis-groeien",
    };
    const tp = TOUCHPOINT_BIJ_STATION[st.slug];
    if (tp) {
      await wacht(1000);
      await speelTouchpoint(tp);
    }
  }

  async function kiesProgramma(slug: string) {
    const prog = programmaVoor(slug);
    if (!prog) return;
    setProgramma(prog);
    setItems((b) => [
      ...b,
      { van: "ik", soort: "tekst", tekst: `Ik doe ${prog.naam} ${prog.emoji}` },
    ]);
    await mentorZegt(
      `Wat goed! Ik loop elke stap met je mee, samen met ${begeleiderNaam}. We beginnen bij het begin:`,
      1000,
    );
    await wacht(500);
    await introStation(prog, prog.stations[0]);
  }

  async function naarStation(slug: string, viaMenu = false) {
    if (!programma) return;
    const nieuw = stationVoor(programma.slug, slug);
    if (!nieuw || nieuw.slug === station?.slug) return;
    const echo = viaMenu ? `Ik wil naar ${nieuw.naam}` : "Verder!";
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echo }]);
    logNaarServer([{ van: "klant", soort: "tekst", tekst: echo }]);
    if (token) {
      fetch("/api/resetcode/stap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, station: nieuw.slug }),
      }).catch(() => {});
    }
    await introStation(programma, nieuw);
  }

  // Zachte intent-herkenning: houdt kaart-verzoeken en "verder" in de
  // flow van het gesprek, al het andere gaat naar de echte Mentor.
  async function lokaleIntent(vraag: string): Promise<boolean> {
    if (!programma || !station) return false;
    const t = vraag.toLowerCase();
    const zeg = () => {
      setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: vraag }]);
      logNaarServer([{ van: "klant", soort: "tekst", tekst: vraag }]);
    };

    if (/\b(verder|volgende( stap| fase)?|door naar de volgende|ik ben klaar met deze)\b/.test(t)) {
      const i = programma.stations.findIndex((s) => s.slug === station.slug);
      if (i < programma.stations.length - 1) {
        zeg();
        const volgend = programma.stations[i + 1];
        if (token) {
          fetch("/api/resetcode/stap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, station: volgend.slug }),
          }).catch(() => {});
        }
        await introStation(programma, volgend);
      } else {
        zeg();
        await mentorZegt("Je bent bij de laatste stap van je programma! 🎉", 800);
        // Einde 16 dagen: het eigen-ervaring-moment (eenmalig, geen bouwers).
        if (programma.slug === "darm") {
          await speelTouchpoint("darm-einde");
        }
        await mentorKaart("vervolg", station.slug);
      }
      return true;
    }
    if (/^tips?\b|\bjouw tips\b|\btips\b/.test(t) && t.length < 40) {
      zeg();
      await mentorZegt("Zeker! Dit is wat mensen vóór jou het meest hielp:", 800);
      await mentorKaart("tips", station.slug);
      return true;
    }
    if (/\bdocument|boekje(s)?\b/.test(t) && t.length < 50) {
      zeg();
      await mentorZegt("Dit hoort allemaal bij deze fase:", 700);
      await mentorKaart("documenten", station.slug);
      return true;
    }
    if (/\bvideo|filmpje\b/.test(t) && t.length < 40 && station.videoSlots.length) {
      zeg();
      await mentorKaart("video", station.slug, 800);
      return true;
    }
    if (/(wat mag ik( wel)? eten|wel en niet|eetlijst|voedingslijst|de lijst)/.test(t) && (station.welLijst.length || station.nietLijst.length)) {
      zeg();
      await mentorZegt("Kijk, zo simpel is het eigenlijk:", 800);
      await mentorKaart("welniet", station.slug);
      if (station.graphic === "logi-piramide") await mentorKaart("logi", station.slug, 600);
      return true;
    }
    if (/(vaak gevraagd|veelgestelde|faq)/.test(t)) {
      zeg();
      await mentorKaart("faq", station.slug, 800);
      return true;
    }
    if (/piramide|80\/20|kompas/.test(t) && station.graphic === "logi-piramide") {
      zeg();
      await mentorKaart("logi", station.slug, 800);
      return true;
    }
    if (/suikerlijst|suikernamen|suiker.*(lijst|namen|spiek)/.test(t)) {
      zeg();
      await mentorZegt("Goeie! Hier is het complete spiekbriefje uit jullie materiaal:", 700);
      await mentorKaart("suikers", station.slug);
      return true;
    }
    if (/\bwc\b|stoelgang|obstipatie|verstopping|poepen/.test(t) && t.length < 80) {
      zeg();
      await mentorKaart("wctips", station.slug, 900);
      return true;
    }
    return false;
  }

  // Spraak: opnemen met MediaRecorder en uitschrijven via Whisper
  // (/api/voice-transcribe). Betrouwbaarder dan de ingebouwde
  // browser-spraakherkenning, die op iPhones wispelturig is.
  async function startStopOpname() {
    if (opneemt) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType =
        ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find(
          (m) => MediaRecorder.isTypeSupported(m),
        ) ?? "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setOpneemt(false);
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size < 1500) return; // te kort, per ongeluk getikt
        setVerwerkt(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob);
          fd.append("taal", "nl");
          if (token) fd.append("resetToken", token);
          const res = await fetch("/api/voice-transcribe", {
            method: "POST",
            body: fd,
          });
          const data = (await res.json().catch(() => null)) as
            | { tekst?: string; fout?: string }
            | null;
          const tekst = data?.tekst?.trim();
          if (res.ok && tekst) {
            await verstuur(tekst);
          } else {
            await mentorZegt(
              "Ik kon je even niet goed verstaan. Probeer het nog een keer, of typ je vraag gewoon.",
              300,
            );
          }
        } catch {
          await mentorZegt(
            "Het opnemen lukte net niet, probeer het nog een keer of typ je vraag.",
            300,
          );
        } finally {
          setVerwerkt(false);
        }
      };
      recorder.start();
      setOpneemt(true);
    } catch {
      await mentorZegt(
        "Ik mag je microfoon nog niet gebruiken. Geef de browser even toestemming (bij de site-instellingen) en probeer het opnieuw.",
        300,
      );
    }
  }

  async function kiesFoto(bestand: File) {
    if (!programma || !station || bezig) return;
    if (bestand.size > 4_000_000) {
      await mentorZegt(
        "Die foto is net iets te groot voor mij. Probeer het nog eens zonder maximale kwaliteit, dan kijk ik meteen mee!",
        400,
      );
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const lezer = new FileReader();
      lezer.onload = () => resolve(String(lezer.result));
      lezer.onerror = reject;
      lezer.readAsDataURL(bestand);
    });
    setItems((b) => [...b, { van: "ik", soort: "foto", dataUrl }]);
    if (await probeerKcal("", dataUrl)) return;
    await roepMentor("", dataUrl);
  }

  // Laaddagen-calorieteller: eet-meldingen (tekst of foto) worden eerst
  // door de teller beoordeeld; geen eet-melding → gewone Mentor.
  async function probeerKcal(vraag: string, foto: string | null): Promise<boolean> {
    if (station?.slug !== "laaddagen") return false;
    setBezig(true);
    setMentorTypt(true);
    try {
      const res = await fetch("/api/resetcode/kcal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token ?? undefined,
          vraag,
          foto: foto ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        eten?: boolean;
        actie?: string;
        dagTotaal?: number | null;
        geschat?: number;
        antwoord?: string;
      } | null;
      if (res.ok && data?.eten && data.antwoord) {
        setItems((b) => [
          ...b,
          { van: "mentor", soort: "tekst", tekst: data.antwoord! },
        ]);
        setKcalTotaal((huidig) =>
          typeof data.dagTotaal === "number"
            ? data.dagTotaal
            : data.actie === "verwijder_laatste"
              ? huidig
              : huidig + (data.geschat ?? 0),
        );
        return true;
      }
    } catch {
      /* valt terug op de gewone Mentor */
    } finally {
      setMentorTypt(false);
      setBezig(false);
    }
    return false;
  }

  async function verstuur(tekstOverride?: string) {
    const vraag = (tekstOverride ?? invoer).trim();
    if (!vraag || bezig || !programma || !station) return;
    setInvoer("");
    if (await lokaleIntent(vraag)) return;
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: vraag }]);
    if (await probeerKcal(vraag, null)) return;
    await roepMentor(vraag, null);
  }

  async function roepMentor(vraag: string, foto: string | null) {
    if (!programma || !station) return;
    setBezig(true);
    const historie = items
      .filter((i): i is Extract<ChatItem, { soort: "tekst" }> => i.soort === "tekst")
      .slice(-8)
      .map((i) => ({
        rol: i.van === "ik" ? ("gebruiker" as const) : ("mentor" as const),
        tekst: i.tekst,
      }));
    setItems((b) => [...b, { van: "mentor", soort: "tekst", tekst: "" }]);

    try {
      const res = await fetch("/api/resetcode-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vraag,
          foto: foto ?? undefined,
          token: token ?? undefined,
          voornaam: klantVoornaam ?? undefined,
          programma: programma.slug,
          station: station.slug,
          rol: isKlant ? "klant" : rol,
          geschiedenis: historie,
        }),
      });
      if (!res.ok || !res.body) {
        const fout = await res.text().catch(() => "onbekende fout");
        zetLaatsteMentorTekst(`Er ging iets mis: ${fout}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let tekst = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        tekst += decoder.decode(value, { stream: true });
        zetLaatsteMentorTekst(tekst);
      }
    } catch {
      zetLaatsteMentorTekst("De verbinding viel even weg, probeer het nog een keer.");
    } finally {
      setBezig(false);
    }
  }

  function zetLaatsteMentorTekst(tekst: string) {
    setItems((b) => {
      const kopie = [...b];
      const laatste = kopie[kopie.length - 1];
      if (laatste && laatste.van === "mentor" && laatste.soort === "tekst") {
        kopie[kopie.length - 1] = { van: "mentor", soort: "tekst", tekst };
      }
      return kopie;
    });
  }

  // ---------- kaart-renderers ----------

  function Kaartje({ item }: { item: Extract<ChatItem, { soort: "kaart" }> }) {
    if (!programma) return null;
    const st = stationVoor(programma.slug, item.stationSlug);
    if (!st) return null;
    const kop = (emoji: string, titel: string) => (
      <p className="text-[13px] font-bold text-emerald-300 mb-1.5">
        {emoji} {titel}
      </p>
    );
    const kader =
      "rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3";

    switch (item.kaart) {
      case "regels":
        return (
          <div className={kader}>
            {kop("✅", "De regels van nu")}
            <ul className="space-y-2">
              {st.vandaagBelangrijk.map((r, i) => (
                <li key={i} className="text-[14px] text-white/85 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        );
      case "welniet":
        return (
          <div className={kader}>
            {kop("🥦", "Wel en even niet")}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Mag lekker</p>
                {st.welLijst.map((w, i) => (
                  <p key={i} className="text-[12px] text-white/80 leading-relaxed">• {w}</p>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1">Even niet</p>
                {st.nietLijst.map((n, i) => (
                  <p key={i} className="text-[12px] text-white/70 leading-relaxed">• {n}</p>
                ))}
              </div>
            </div>
          </div>
        );
      case "tips":
        return (
          <div className={kader}>
            {kop("💡", "Tips van mensen die je voorgingen")}
            <ul className="space-y-2">
              {st.tips.map((t, i) => (
                <li key={i} className="text-[14px] text-white/85 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">·</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        );
      case "faq":
        return (
          <div className={kader}>
            {kop("❓", "Vaak gevraagd in deze fase")}
            <div className="space-y-3">
              {st.veelgesteld.map((v, i) => (
                <div key={i}>
                  <p className="text-[14px] font-semibold text-white/95">{v.vraag}</p>
                  <p className="text-[13px] text-white/70 leading-relaxed mt-0.5">{v.antwoord}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "video": {
        const blokken =
          mediaBlokken?.[`${programma.slug}/${st.slug}-video`] ?? [];
        return (
          <div className={kader}>
            {kop("🎬", "Video bij deze fase")}
            {(blokken.length > 0 || isFounder) && (
              <div className="mt-1.5">
                <MediaBlokken
                  paginaNamespace="resetcode-klant"
                  paginaId={programma.slug}
                  positie={`${st.slug}-video`}
                  blokken={blokken}
                  isFounder={Boolean(isFounder)}
                />
              </div>
            )}
            {blokken.length === 0 &&
              st.videoSlots.map((v, i) => (
                <div key={i} className="mt-1.5 rounded-xl bg-black/40 border border-dashed border-emerald-500/30 px-3 py-7 text-center">
                  <p className="text-[13px] text-white/70">▶️ {v}</p>
                  <p className="text-[10px] text-emerald-400/60 mt-1">
                    {isFounder
                      ? "vul deze plek via de edit-modus (potlood)"
                      : "deze video komt er binnenkort aan"}
                  </p>
                </div>
              ))}
          </div>
        );
      }
      case "documenten": {
        const blokken =
          mediaBlokken?.[`${programma.slug}/${st.slug}-docs`] ?? [];
        return (
          <div className={kader}>
            {kop("📂", "Bij deze fase")}
            {(blokken.length > 0 || isFounder) && (
              <div className="mt-1.5">
                <MediaBlokken
                  paginaNamespace="resetcode-klant"
                  paginaId={programma.slug}
                  positie={`${st.slug}-docs`}
                  blokken={blokken}
                  isFounder={Boolean(isFounder)}
                />
              </div>
            )}
            {blokken.length === 0 && (
              <div className="space-y-1.5 mt-1.5">
                {st.documenten.map((d, i) => (
                  <div key={i} className="rounded-xl bg-black/30 border border-dashed border-emerald-500/25 px-3 py-2">
                    <p className="text-[13px] font-semibold text-white/90">{d.titel}</p>
                    <p className="text-[11px] text-white/55">{d.omschrijving}</p>
                    <p className="text-[10px] text-emerald-400/60 mt-0.5">
                      {isFounder
                        ? "vul deze plek via de edit-modus (potlood)"
                        : "komt er binnenkort aan"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      case "contact":
        return (
          <div className={kader}>
            {kop("🤝", `Samen met ${begeleiderNaam}`)}
            <p className="text-[14px] text-white/85 leading-relaxed">{st.contactMoment}</p>
            {isKlant && memberTelefoon ? (
              <a
                href={waLinkNaar(
                  memberTelefoon,
                  `Hoi ${begeleiderNaam}! Ik zit bij ${st.emoji} ${st.naam} in mijn programma. `,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                📱 App {begeleiderNaam}
              </a>
            ) : (
              <button
                className="mt-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white opacity-60 cursor-not-allowed"
                style={{ backgroundColor: "#25D366" }}
                title="Opent WhatsApp naar de begeleider (werkt op de echte klant-link)"
              >
                📱 App {begeleiderNaam}{" "}
                <span className="text-[10px] font-normal">(op de klant-link)</span>
              </button>
            )}
          </div>
        );
      case "logi":
        return (
          <div className={kader}>
            {kop("🔺", "Jouw 80/20-kompas")}
            <div className="flex flex-col items-center gap-1 mt-1">
              {LOGI_LAGEN.map((laag) => (
                <div
                  key={laag.label}
                  className="rounded-lg py-1.5 px-2 text-center"
                  style={{ width: laag.breedte, backgroundColor: laag.kleur }}
                >
                  <p className="text-[10px] font-extrabold tracking-wider text-white/95">{laag.label}</p>
                  <p className="text-[11px] text-white/90">{laag.inhoud}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/50 text-center mt-1.5">hoe lager, hoe vaker op je bord</p>
          </div>
        );
      case "vervolg":
        return (
          <div className={kader}>
            {kop("🎉", "En daarna?")}
            <p className="text-[14px] text-white/85 leading-relaxed">{programma.vervolg}</p>
          </div>
        );
      case "suikers":
        return (
          <div className={kader}>
            {kop("🍬", "Suiker-spiekbriefje")}
            <p className="text-[12px] text-white/70 leading-relaxed mb-2">
              Suiker heet zelden gewoon &quot;suiker&quot;. Zie je één van
              deze namen in de ingrediëntenlijst, dan is het suiker. Twijfel
              je? Stuur me een foto van het etiket.
            </p>
            <div className="max-h-56 overflow-y-auto chatscroll rounded-xl bg-black/30 px-3 py-2">
              <p className="text-[11px] text-white/70 leading-relaxed">
                {SUIKER_NAMEN.join(" · ")}
              </p>
            </div>
          </div>
        );
      case "wctips":
        return (
          <div className={kader}>
            {kop("💩", "Moeilijk naar de wc?")}
            <p className="text-[12px] text-white/70 leading-relaxed mb-1.5">
              Komt vaker voor tijdens het programma en hoort erbij. Dit
              helpt, rechtstreeks uit het programma-materiaal:
            </p>
            <ul className="space-y-1.5">
              {WC_TIPS.map((tip, i) => (
                <li key={i} className="text-[13px] text-white/85 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        );
    }
  }

  // ---------- render ----------

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "#0F1B17" }}>
      <style>{`
        @keyframes pols { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
        @keyframes verschijn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes stip { 0%,60%,100% { transform: translateY(0); opacity:.4 } 30% { transform: translateY(-4px); opacity:1 } }
        .pols { animation: pols 2.2s ease-in-out infinite }
        .verschijn { animation: verschijn .35s ease-out both }
        .chatscroll { scrollbar-width: none; -ms-overflow-style: none }
        .chatscroll::-webkit-scrollbar { display: none }
        .typstip { display:inline-block; width:7px; height:7px; border-radius:9999px; background:#6EE7B7; margin-right:4px; animation: stip 1.2s infinite }
      `}</style>

      {/* Kop */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
        <div
          className="h-11 w-11 rounded-full flex items-center justify-center text-xl pols flex-shrink-0"
          style={{ background: "radial-gradient(circle,#34D399 0%,#059669 100%)" }}
        >
          🌿
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-[15px] leading-tight">Je Mentor</p>
          <p className="text-emerald-400/80 text-[11px]">
            {mentorTypt || bezig ? "is aan het typen..." : "altijd wakker · kent jouw hele reis"}
          </p>
        </div>
        {programma && station && (
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            {station.slug === "laaddagen" && (
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{
                  backgroundColor: kcalTotaal >= 3500 ? "#065F46" : "#7C2D12",
                  color: kcalTotaal >= 3500 ? "#6EE7B7" : "#FDBA74",
                }}
                title="Jouw laaddag-teller: meld gewoon wat je eet"
              >
                🔥 ±{kcalTotaal} / 3500+
              </span>
            )}
            <button
              onClick={() => setToonReis((t) => !t)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/85 hover:bg-white/15"
            >
              {station.emoji} {station.nummer}/{programma.stations.length} ▾
            </button>
          </div>
        )}
      </header>

      {/* Reis-overlay */}
      {toonReis && programma && (
        <div className="border-b border-white/10 bg-[#0A1512] px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {programma.stations.map((s) => (
              <button
                key={s.slug}
                onClick={() => {
                  setToonReis(false);
                  naarStation(s.slug, true);
                }}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  s.slug === station?.slug
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {s.emoji} {s.naam}
              </button>
            ))}
            {!isKlant && (
              <>
                {/* Tijdmachine (alleen preview): speel het tijd-gebonden
                    dag 5-7 moment af alsof de klant dan terugkomt. */}
                {station &&
                  ["zestien-dagen", "omschakeling"].includes(station.slug) && (
                    <button
                      onClick={() => {
                        setToonReis(false);
                        verteldRef.current.delete("kern-verhaal");
                        speelTouchpoint("kern-verhaal");
                      }}
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
                    >
                      ⏩ dag 5-7 moment (webshop-verhaal)
                    </button>
                  )}
                <button
                  onClick={() => {
                    setToonReis(false);
                    try {
                      localStorage.removeItem(OPSLAG_SLEUTEL);
                    } catch {}
                    gestart.current = true;
                    versBeginnen();
                  }}
                  className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                >
                  ↺ opnieuw beginnen
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gesprek */}
      <div ref={scrollRef} className="chatscroll flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {items.map((item, i) => {
          if (item.van === "ik" && item.soort === "foto") {
            return (
              <div key={i} className="verschijn max-w-[70%] ml-auto rounded-2xl rounded-tr-sm overflow-hidden border border-emerald-600/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.dataUrl} alt="etiket-foto" className="w-full" />
              </div>
            );
          }
          if (item.van === "ik") {
            return (
              <div key={i} className="verschijn max-w-[80%] ml-auto rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-2.5">
                <p className="text-[15px] text-white leading-relaxed">{item.tekst}</p>
              </div>
            );
          }
          if (item.soort === "programma-keuze") {
            return (
              <div key={i} className="verschijn max-w-[92%] space-y-2">
                {RESET_PROGRAMMAS.map((prog) => (
                  <button
                    key={prog.slug}
                    onClick={() => !programma && kiesProgramma(prog.slug)}
                    disabled={Boolean(programma)}
                    className="w-full text-left rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3 hover:border-emerald-400/50 transition-colors disabled:opacity-50"
                  >
                    <p className="text-[15px] font-bold text-white">
                      {prog.emoji} {prog.naam}
                      <span className="text-emerald-400/80 font-semibold text-[11px] ml-2">{prog.duur}</span>
                    </p>
                    <p className="text-[13px] text-white/65 leading-relaxed mt-0.5">{prog.payoff}</p>
                  </button>
                ))}
              </div>
            );
          }
          if (item.soort === "kaart") {
            return (
              <div key={i} className="verschijn max-w-[92%]">
                <Kaartje item={item} />
              </div>
            );
          }
          return (
            <div key={i} className="verschijn max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-2.5">
              <p className="text-[15px] text-white/90 leading-relaxed whitespace-pre-wrap">
                {item.tekst || (bezig && i === items.length - 1 ? "..." : "")}
              </p>
            </div>
          );
        })}

        {/* Typ-indicator */}
        {mentorTypt && (
          <div className="verschijn max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 w-fit">
            <span className="typstip" style={{ animationDelay: "0s" }} />
            <span className="typstip" style={{ animationDelay: ".15s" }} />
            <span className="typstip" style={{ animationDelay: ".3s", marginRight: 0 }} />
          </div>
        )}
      </div>

      {/* Invoer */}
      <div className="px-3 pb-4 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) kiesFoto(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fotoRef.current?.click()}
            disabled={bezig || !programma}
            title="Stuur een foto van een etiket"
            className="h-11 w-11 flex-shrink-0 rounded-full bg-white/10 text-xl hover:bg-white/15 disabled:opacity-40"
          >
            📷
          </button>
          <input
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                verstuur();
              }
            }}
            placeholder={
              !programma
                ? "Kies eerst je programma hierboven..."
                : opneemt
                  ? "Ik neem op... tik de knop om te stoppen 🎧"
                  : verwerkt
                    ? "Even luisteren wat je zei..."
                    : "Typ of praat..."
            }
            disabled={bezig || !programma}
            className="min-w-0 flex-1 rounded-full bg-white/10 border border-white/15 px-4 py-3 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60"
          />
          {invoer.trim() ? (
            <button
              onClick={() => verstuur()}
              disabled={bezig || !programma}
              className="h-12 w-12 flex-shrink-0 rounded-full bg-emerald-600 text-xl font-bold text-white disabled:opacity-30"
            >
              ➤
            </button>
          ) : (
            kanPraten && (
              <button
                onClick={startStopOpname}
                disabled={bezig || verwerkt || !programma}
                title={opneemt ? "Stop de opname" : "Praat tegen je Mentor"}
                className={`h-12 w-12 flex-shrink-0 rounded-full text-2xl shadow-xl transition-all disabled:opacity-40 ${opneemt || verwerkt ? "pols" : ""}`}
                style={{
                  background: opneemt
                    ? "radial-gradient(circle,#F87171 0%,#B91C1C 100%)"
                    : "radial-gradient(circle,#34D399 0%,#047857 100%)",
                }}
              >
                {opneemt ? "⏹" : verwerkt ? "⏳" : "🎙️"}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
