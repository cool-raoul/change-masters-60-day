"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/ui/Reveal";
import { InfoFilmSpeler } from "@/components/freebies/InfoFilmSpeler";
import { EditableTekst } from "@/components/cms/EditableTekst";
import { useEditModus } from "@/components/cms/EditModeContext";
import {
  DARM_VRAGEN,
  DARM_SCHAAL_LABELS,
  type DarmAntwoord,
} from "@/lib/zelftest/darm-vragen";
import {
  bouwGezondeStartUitkomst,
  GEZONDE_START_UITKOMST_FRAGMENTEN,
} from "@/lib/freebie-bots/jouw-gezonde-start/uitkomst";
import {
  DOEL_OPTIES,
  AFVAL_OPTIES,
  INVESTERING_OPTIES,
  INVESTERING_LABEL,
  afvalVraagtReset,
  type DoelId,
  type AfvalId,
  type InvesteringId,
} from "@/lib/freebie-bots/jouw-gezonde-start/vragen";
import { bouwGezondeStartHeat } from "@/lib/freebie-bots/jouw-gezonde-start/heat";

// ============================================================
// "Jouw gezonde start" — clientflow.
// Premium crème-goud freebie-stijl met zachte animaties.
// welkom → gegevens → darm-check → doel + investering → advies → bedankt.
//
// FOUNDER-EDIT: elke tekst is aanpasbaar (voor iedereen) via het
// tekst_overrides-systeem. Blok-teksten krijgen een inline-potlood (<T>);
// knop-/optie-/pill-teksten blijven klikbaar en krijgen in edit-modus een
// compact editor-veldje ernaast (<EditNaast>), zodat de flow bruikbaar blijft.
// ============================================================

const NS = "jouw-gezonde-start";

const BG =
  "linear-gradient(180deg, #f7f1e4 0%, #f4ebd0 30%, #ead8a0 70%, #f0e8d2 100%)";
const KNOP = "linear-gradient(135deg, #0d0d0d 0%, #2a2110 50%, #0d0d0d 100%)";
const GOUD = "linear-gradient(135deg, #c9a961 0%, #ead8a0 100%)";

type Stap = "welkom" | "gegevens" | "vragen" | "doel" | "uitkomst" | "bedankt";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STAP_NR: Record<Stap, number> = {
  welkom: 1,
  vragen: 2,
  doel: 3,
  gegevens: 4,
  uitkomst: 5,
  bedankt: 5,
};

type AsTag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span" | "li";

// Founder-context: overrides + of edit-modus aan staat + of je founder bent.
const FreebieCtx = createContext<{
  overrides: Record<string, string>;
  isFounder: boolean;
  editModusAan: boolean;
}>({ overrides: {}, isFounder: false, editModusAan: false });

// Inline bewerkbare blok-tekst (potlood naast de tekst in edit-modus).
function T({
  sleutel,
  standaard,
  as,
  className,
  multiline,
  rows,
  hint,
  vars,
}: {
  sleutel: string;
  standaard: string;
  as?: AsTag;
  className?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  vars?: Record<string, string>;
}) {
  const { overrides, isFounder, editModusAan } = useContext(FreebieCtx);
  return (
    <EditableTekst
      namespace={NS}
      sleutel={sleutel}
      standaard={standaard}
      overrides={overrides}
      isFounder={isFounder}
      editModusAan={editModusAan}
      as={as}
      className={className}
      multiline={multiline}
      rows={rows}
      hint={hint}
      vars={vars}
    />
  );
}

// Compact editor-veldje naast een knop/optie/pill (alleen in edit-modus).
function EditNaast({
  sleutel,
  standaard,
  hint,
  multiline,
}: {
  sleutel: string;
  standaard: string;
  hint?: string;
  multiline?: boolean;
}) {
  const { isFounder, editModusAan } = useContext(FreebieCtx);
  if (!isFounder || !editModusAan) return null;
  return (
    <T
      sleutel={sleutel}
      standaard={standaard}
      as="div"
      className="mt-1 text-xs"
      hint={hint}
      multiline={multiline}
    />
  );
}

export function GezondeStartFlow({
  token,
  memberVoornaam,
  welkomFilm,
  infoFilmSoort,
  infoFilmUrl,
  tekstOverrides,
  isFounder,
}: {
  token: string;
  memberVoornaam: string;
  welkomFilm: ReactNode;
  infoFilmSoort: string | null;
  infoFilmUrl: string | null;
  tekstOverrides: Record<string, string>;
  isFounder: boolean;
}) {
  const { editModusAan } = useEditModus();
  const [stap, setStap] = useState<Stap>("welkom");
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [darm, setDarm] = useState<Record<string, DarmAntwoord>>({});
  const [doelen, setDoelen] = useState<DoelId[]>([]);
  const [afvalWens, setAfvalWens] = useState<AfvalId | null>(null);
  const [investering, setInvestering] = useState<InvesteringId | null>(null);
  const [toonTelefoon, setToonTelefoon] = useState(false);
  const [contactReden, setContactReden] = useState<
    "persoonlijk" | "resultaten"
  >("persoonlijk");
  const [bezig, setBezig] = useState(false);
  const optInGedaanRef = useRef(false);

  // Resolver voor knop-/optie-/pill-teksten (toont override of standaard).
  const t = (sleutel: string, standaard: string) =>
    tekstOverrides[sleutel] ?? standaard;

  const aantal = Object.keys(darm).length;
  const alleBeantwoord = aantal === DARM_VRAGEN.length;
  const uitslag = bouwGezondeStartUitkomst({
    darmAntwoorden: darm,
    doelen,
    afvalWens,
    voornaam,
    overrides: tekstOverrides,
  });
  const heat = bouwGezondeStartHeat({
    darmTotaal: uitslag.totaal,
    darmMax: uitslag.max,
    doelenCount: doelen.length,
    afvalReset: afvalVraagtReset(afvalWens),
    investering,
  });

  function naar(s: Stap) {
    setStap(s);
    if (typeof window !== "undefined") {
      window.history.pushState({ gezondeStartStap: s }, "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function terug() {
    if (typeof window !== "undefined") window.history.back();
  }

  // Browser-terug (en de in-page terug-knoppen) gaan één stap terug in de flow,
  // met behoud van wat al is ingevuld, in plaats van de pagina te verlaten.
  useEffect(() => {
    window.history.replaceState({ gezondeStartStap: "welkom" }, "");
    function onPop(e: PopStateEvent) {
      const s = (e.state as { gezondeStartStap?: Stap } | null)
        ?.gezondeStartStap;
      if (s) {
        setStap(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Founder-preview: vul een representatief voorbeeld en spring naar de uitslag
  // om de bouwsteen-teksten te kunnen bewerken.
  function springNaarUitslag() {
    const voorbeeld: Record<string, DarmAntwoord> = {};
    DARM_VRAGEN.forEach((v) => {
      voorbeeld[v.id] = 2 as DarmAntwoord;
    });
    setDarm(voorbeeld);
    setDoelen(["energie", "afvallen"]);
    setAfvalWens("vijf_tien");
    setInvestering("altijd");
    naar("uitkomst");
  }

  function bekijkUitslag() {
    if (!voornaam.trim() || !achternaam.trim())
      return toast.error("Vul je voor- en achternaam in.");
    if (!EMAIL_RE.test(email))
      return toast.error("Vul een geldig e-mailadres in.");
    void vangProspect();
    naar("uitkomst");
  }

  async function vangProspect() {
    if (optInGedaanRef.current) return;
    optInGedaanRef.current = true;
    try {
      await fetch("/api/freebie-bot/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          token,
          leadVoornaam: voornaam.trim(),
          leadAchternaam: achternaam.trim(),
          leadEmail: email.trim(),
          leadTelefoon: telefoon.trim() || null,
          antwoorden: {
            darmTotaal: uitslag.totaal,
            darmBucket: uitslag.bucket,
            doelen,
            afvalWens,
            investering,
            warmte: heat.categorie,
            warmteScore: heat.score,
          },
          spiegelTekst: `🌱 Jouw gezonde start\n${heat.label} (warmte ${heat.score}/10)\nInvesteren in gezondheid: ${investering ? INVESTERING_LABEL[investering] : "?"}\nDoel: ${doelen.map((d) => DOEL_OPTIES.find((o) => o.id === d)?.label).filter(Boolean).join(", ") || "-"}\nDarm-score: ${uitslag.totaal}/${uitslag.max} → advies: ${uitslag.programmaLabel}`,
          contactGewenst: false,
          herkomstInstagram: instagram.trim().replace(/^@/, "") || null,
          herkomstFacebook: facebook.trim() || null,
          herkomstBron: "podcast",
        }),
      });
    } catch {
      /* stil */
    }
  }

  function gaNaarDoel() {
    if (!alleBeantwoord) return toast.error("Beantwoord nog even alle vragen.");
    naar("doel");
  }

  function gaNaarGegevens() {
    if (doelen.length === 0)
      return toast.error("Kies nog even waar je naar verlangt.");
    if (!investering)
      return toast.error("Beantwoord nog even de laatste vraag.");
    naar("gegevens");
  }

  async function vraagContact() {
    if (telefoon.trim().length < 8)
      return toast.error(
        "Vul je telefoonnummer in, dan kan ik persoonlijk met je meekijken.",
      );
    setBezig(true);
    try {
      await fetch("/api/freebie-bot/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadEmail: email.trim(),
          leadVoornaam: voornaam.trim(),
          leadAchternaam: achternaam.trim(),
          leadTelefoon: telefoon.trim(),
          reden:
            contactReden === "resultaten"
              ? "Wil meer info + in de resultaten-groep (voeg toe aan Facebookgroep)"
              : "Wil persoonlijk meekijken",
        }),
      });
    } catch {
      /* stil */
    }
    setBezig(false);
    naar("bedankt");
  }

  return (
    <FreebieCtx.Provider
      value={{ overrides: tekstOverrides, isFounder, editModusAan }}
    >
      <div
        className="relative min-h-screen overflow-hidden"
        style={{ background: BG, color: "#1a1a1a" }}
      >
        <div aria-hidden className="pointer-events-none fixed top-10 -left-8 text-[170px] opacity-[0.04] rotate-12 select-none">🌱</div>
        <div aria-hidden className="pointer-events-none fixed top-1/3 -right-12 text-[170px] opacity-[0.04] -rotate-12 select-none">✨</div>
        <div aria-hidden className="pointer-events-none fixed bottom-24 -left-6 text-[150px] opacity-[0.04] rotate-6 select-none">🌿</div>

        <div className="relative mx-auto max-w-2xl px-4 py-6 sm:py-10">
          <ProgressBar nr={STAP_NR[stap]} />

          {editModusAan && isFounder && stap !== "uitkomst" && (
            <div className="mt-3 text-center">
              <button
                onClick={springNaarUitslag}
                className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 rounded-full px-4 py-1.5 hover:bg-amber-200"
              >
                ⤵ Spring naar de uitslag (om die te bewerken)
              </button>
            </div>
          )}

          <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-white/40 p-6 sm:p-9 mt-6 border border-[#ead8a0]/60">
            {stap === "welkom" && (
              <Reveal richting="fade">
                <section className="space-y-6">
                  <div className="text-center space-y-3">
                    <Orb emoji="🌱" />
                    <Tag>{t("welkom.tag", "Jouw gezonde start")}</Tag>
                    <EditNaast sleutel="welkom.tag" standaard="Jouw gezonde start" hint="Label-pill bovenaan" />
                    <T as="h1" sleutel="welkom.titel" standaard="Welkom, fijn dat je er bent" className="text-3xl sm:text-4xl font-extrabold leading-tight" />
                  </div>
                  {welkomFilm}
                  <div className="text-[15px] leading-relaxed text-[#3a3526] space-y-3">
                    <T as="p" multiline rows={4} sleutel="welkom.p1" standaard="Leuk dat je hier bent. Waarschijnlijk omdat iets je raakte en je nieuwsgierig werd. In een paar minuten doe je een korte check, en je krijgt meteen een persoonlijk advies waar een fijne start voor jou zou kunnen liggen." />
                    <T as="p" multiline rows={3} sleutel="welkom.p2" standaard="Daarna kijk ik graag samen met jou wat echt bij je past. Helemaal vrijblijvend, en op je eigen tempo." />
                  </div>
                  <div>
                    <GoudKnop onClick={() => naar("vragen")}>{t("welkom.knop", "Ja, ik wil de check doen")}</GoudKnop>
                    <EditNaast sleutel="welkom.knop" standaard="Ja, ik wil de check doen" hint="Tekst op de knop" />
                  </div>
                </section>
              </Reveal>
            )}

            {stap === "gegevens" && (
              <Reveal richting="fade">
                <section className="space-y-5">
                  <div className="text-center space-y-2">
                    <Tag>{t("gegevens.tag", "Laatste stap")}</Tag>
                    <EditNaast sleutel="gegevens.tag" standaard="Laatste stap" hint="Pill" />
                    <T as="h2" sleutel="gegevens.titel" standaard="Je persoonlijke uitslag staat voor je klaar" className="text-2xl sm:text-3xl font-extrabold" />
                    <T as="p" multiline rows={4} sleutel="gegevens.sub" standaard="Laat je naam en e-mail achter, dan zie je meteen je uitslag. En in een korte film neem ik je rustig mee in wat de programma's inhouden en wat ze voor jou zouden kunnen betekenen, zodat je een compleet beeld krijgt en ik je echt verder kan helpen." className="text-sm text-[#6b6450]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Veld labelSleutel="gegevens.label.voornaam" labelStandaard="Voornaam" value={voornaam} onChange={setVoornaam} />
                    <Veld labelSleutel="gegevens.label.achternaam" labelStandaard="Achternaam" value={achternaam} onChange={setAchternaam} />
                  </div>
                  <Veld labelSleutel="gegevens.label.email" labelStandaard="E-mailadres" value={email} onChange={setEmail} type="email" placeholder="jouw@email.nl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Veld labelSleutel="gegevens.label.instagram" labelStandaard="Instagram" sub="optioneel" value={instagram} onChange={setInstagram} placeholder="@jouwnaam" />
                    <Veld labelSleutel="gegevens.label.facebook" labelStandaard="Facebook" sub="optioneel" value={facebook} onChange={setFacebook} placeholder="je naam of link" />
                  </div>
                  <div className="space-y-1">
                    <T
                      as="p"
                      multiline
                      rows={3}
                      sleutel="gegevens.privacy"
                      standaard="Je gegevens komen alleen bij {naam} terecht, om je je uitkomst te sturen en het persoonlijk met je af te stemmen. We delen niks met derden en je kunt je altijd afmelden."
                      vars={{ naam: memberVoornaam }}
                      className="text-[11px] text-[#a0936e] leading-relaxed"
                    />
                    <a
                      href="/privacybeleid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[11px] underline text-[#8a7f5e] hover:text-[#5a4710]"
                    >
                      Lees ons privacybeleid
                    </a>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <TerugKnop onClick={terug} />
                    <div className="flex-1">
                      <GoudKnop onClick={bekijkUitslag}>{t("gegevens.knop", "Bekijk mijn uitslag")}</GoudKnop>
                      <EditNaast sleutel="gegevens.knop" standaard="Bekijk mijn uitslag" hint="Knop" />
                    </div>
                  </div>
                </section>
              </Reveal>
            )}

            {stap === "vragen" && (
              <Reveal richting="fade">
                <section className="space-y-5">
                  <div className="text-center space-y-2">
                    <Tag>{t("vragen.tag", "De check")}</Tag>
                    <EditNaast sleutel="vragen.tag" standaard="De check" hint="Pill" />
                    <T as="h2" sleutel="vragen.titel" standaard="Hoe herken je dit bij jezelf?" className="text-2xl sm:text-3xl font-extrabold" />
                    <T as="p" multiline rows={2} sleutel="vragen.sub" standaard="Geen goed of fout, alleen jouw eerlijke gevoel." className="text-sm text-[#6b6450]" />
                    <div className="mx-auto max-w-xs">
                      <div className="h-1.5 rounded-full bg-[#e7dcb8] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(aantal / DARM_VRAGEN.length) * 100}%`, background: GOUD }} />
                      </div>
                      <p className="text-[11px] text-[#a0936e] mt-1.5 font-semibold">{aantal} van {DARM_VRAGEN.length}</p>
                    </div>
                  </div>

                  {editModusAan && isFounder && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 space-y-1">
                      <p className="text-xs font-bold text-amber-800">✏️ Antwoord-schaal (geldt voor alle vragen)</p>
                      {([0, 1, 2, 3] as DarmAntwoord[]).map((w) => (
                        <T key={w} sleutel={`schaal.${w}`} standaard={DARM_SCHAAL_LABELS[w]} as="div" className="text-sm text-[#5a5440]" />
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {DARM_VRAGEN.map((v, i) => (
                      <Reveal key={v.id} richting="up" delay={Math.min(i * 35, 250)}>
                        <div className="rounded-2xl border border-[#ead8a0]/70 bg-[#fdfaf0] p-4">
                          <T as="p" multiline rows={2} sleutel={`darm.${v.id}`} standaard={v.tekst} className="text-[15px] text-[#2a2616] mb-3" />
                          <div className="grid grid-cols-4 gap-1.5">
                            {([0, 1, 2, 3] as DarmAntwoord[]).map((w) => {
                              const actief = darm[v.id] === w;
                              return (
                                <button
                                  key={w}
                                  onClick={() => setDarm((d) => ({ ...d, [v.id]: w }))}
                                  className="text-[11px] sm:text-xs font-semibold rounded-xl py-2.5 px-1 transition-all active:scale-95"
                                  style={
                                    actief
                                      ? { background: KNOP, color: "#f0e8d2", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }
                                      : { background: "#fff", color: "#8a7f5e", border: "1px solid #e7dcb8" }
                                  }
                                >
                                  {t(`schaal.${w}`, DARM_SCHAAL_LABELS[w])}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <TerugKnop onClick={terug} />
                    <div className="flex-1">
                      <GoudKnop onClick={gaNaarDoel} disabled={!alleBeantwoord}>{t("vragen.knop", "Verder")}</GoudKnop>
                      <EditNaast sleutel="vragen.knop" standaard="Verder" hint="Knop" />
                    </div>
                  </div>
                </section>
              </Reveal>
            )}

            {stap === "doel" && (
              <Reveal richting="fade">
                <section className="space-y-5">
                  <div className="text-center space-y-2">
                    <Tag>{t("doel.tag", "Bijna klaar")}</Tag>
                    <EditNaast sleutel="doel.tag" standaard="Bijna klaar" hint="Pill" />
                    <T as="h2" sleutel="doel.titel" standaard="Wat zou je het liefst positief veranderen?" className="text-2xl sm:text-3xl font-extrabold" />
                    <T as="p" multiline rows={2} sleutel="doel.sub" standaard="Kies wat voor jou speelt. Meerdere mag." className="text-sm text-[#6b6450]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {DOEL_OPTIES.map((o) => {
                      const actief = doelen.includes(o.id);
                      return (
                        <button
                          key={o.id}
                          onClick={() =>
                            setDoelen((d) =>
                              d.includes(o.id) ? d.filter((x) => x !== o.id) : [...d, o.id],
                            )
                          }
                          className="text-sm font-semibold rounded-xl py-3 px-3 text-left transition-all active:scale-[0.98]"
                          style={
                            actief
                              ? { background: KNOP, color: "#f0e8d2", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }
                              : { background: "#fff", color: "#5a5440", border: "1px solid #e7dcb8" }
                          }
                        >
                          {t(`doel.optie.${o.id}`, o.label)}
                        </button>
                      );
                    })}
                  </div>
                  {editModusAan && isFounder && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 space-y-1">
                      <p className="text-xs font-bold text-amber-800">✏️ Doel-opties</p>
                      {DOEL_OPTIES.map((o) => (
                        <T key={o.id} sleutel={`doel.optie.${o.id}`} standaard={o.label} as="div" className="text-sm text-[#5a5440]" />
                      ))}
                    </div>
                  )}

                  {doelen.includes("afvallen") && (
                    <Reveal richting="up">
                      <div className="rounded-2xl border border-[#ead8a0]/70 bg-[#fdfaf0] p-4 space-y-2.5">
                        <T as="p" sleutel="afval.titel" standaard="Hoeveel zou je het liefst willen afvallen?" className="text-sm font-semibold text-[#5a5440]" />
                        <div className="grid grid-cols-2 gap-2">
                          {AFVAL_OPTIES.map((o) => {
                            const actief = afvalWens === o.id;
                            return (
                              <button
                                key={o.id}
                                onClick={() => setAfvalWens(o.id)}
                                className="text-xs font-semibold rounded-lg py-2.5 px-2 transition-all"
                                style={
                                  actief
                                    ? { background: KNOP, color: "#f0e8d2" }
                                    : { background: "#fff", color: "#8a7f5e", border: "1px solid #e7dcb8" }
                                }
                              >
                                {t(`afval.optie.${o.id}`, o.label)}
                              </button>
                            );
                          })}
                        </div>
                        {editModusAan && isFounder && (
                          <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-2 space-y-1">
                            <p className="text-[11px] font-bold text-amber-800">✏️ Afval-opties</p>
                            {AFVAL_OPTIES.map((o) => (
                              <T key={o.id} sleutel={`afval.optie.${o.id}`} standaard={o.label} as="div" className="text-xs text-[#5a5440]" />
                            ))}
                          </div>
                        )}
                      </div>
                    </Reveal>
                  )}

                  <div className="rounded-2xl border border-[#ead8a0]/70 bg-[#fdfaf0] p-4 space-y-2.5">
                    <T as="p" sleutel="investering.titel" standaard="Ben je bereid om te investeren in je gezondheid?" className="text-sm font-semibold text-[#5a5440]" />
                    <T as="p" multiline rows={2} sleutel="investering.sub" standaard="Een eerlijk antwoord helpt, zo weet ik hoe ik je het beste kan helpen." className="text-xs text-[#a0936e]" />
                    <div className="space-y-2">
                      {INVESTERING_OPTIES.map((o) => {
                        const actief = investering === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => setInvestering(o.id)}
                            className="w-full text-sm font-semibold rounded-xl py-3 px-3 text-left transition-all active:scale-[0.99]"
                            style={
                              actief
                                ? { background: KNOP, color: "#f0e8d2", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }
                                : { background: "#fff", color: "#5a5440", border: "1px solid #e7dcb8" }
                            }
                          >
                            {t(`investering.optie.${o.id}`, o.label)}
                          </button>
                        );
                      })}
                    </div>
                    {editModusAan && isFounder && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-2 space-y-1">
                        <p className="text-[11px] font-bold text-amber-800">✏️ Investerings-opties</p>
                        {INVESTERING_OPTIES.map((o) => (
                          <T key={o.id} sleutel={`investering.optie.${o.id}`} standaard={o.label} as="div" className="text-xs text-[#5a5440]" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <TerugKnop onClick={terug} />
                    <div className="flex-1">
                      <GoudKnop onClick={gaNaarGegevens} disabled={doelen.length === 0 || !investering}>{t("doel.knop", "Verder")}</GoudKnop>
                      <EditNaast sleutel="doel.knop" standaard="Verder" hint="Knop" />
                    </div>
                  </div>
                </section>
              </Reveal>
            )}

            {stap === "uitkomst" && (
              <Reveal richting="scale">
                <section className="space-y-6">
                  <button
                    onClick={terug}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8a7f5e] hover:text-[#5a4710] transition-colors"
                  >
                    ← Terug
                  </button>
                  <div className="text-center space-y-3">
                    <Orb emoji="🌿" />
                    <Tag>{t("uitkomst.tag", "Jouw persoonlijke advies")}</Tag>
                    <EditNaast sleutel="uitkomst.tag" standaard="Jouw persoonlijke advies" hint="Pill" />
                    <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{uitslag.kop}</h2>
                    <div className="text-5xl" aria-hidden>
                      🎬
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-5 sm:p-6 space-y-3.5 text-[15px] leading-relaxed"
                    style={{ background: "linear-gradient(135deg, #faf5e6 0%, #f0e8d2 100%)", border: "1px solid #ead8a0", color: "#3a3526" }}
                  >
                    {uitslag.narratief.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  {editModusAan && isFounder && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 space-y-3">
                      <p className="text-xs font-bold text-amber-900">
                        ✏️ Uitslag-bouwstenen — pas elke zin aan (geldt voor
                        iedereen). Hierboven zie je een voorbeeld; de juiste zin
                        wordt automatisch gekozen op basis van de antwoorden.
                      </p>
                      {GEZONDE_START_UITKOMST_FRAGMENTEN.map((f) => (
                        <div key={f.key}>
                          <p className="text-[11px] font-semibold text-amber-800 mb-0.5">
                            {f.label}
                          </p>
                          <T
                            sleutel={f.key}
                            standaard={f.standaard}
                            multiline={f.multiline}
                            rows={3}
                            hint={f.hint}
                            as="div"
                            className="text-sm text-[#3a3526]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {infoFilmUrl && (
                    <InfoFilmSpeler
                      soort={infoFilmSoort}
                      url={infoFilmUrl}
                      token={token}
                      leadEmail={email}
                    />
                  )}

                  <T
                    as="p"
                    multiline
                    rows={4}
                    sleutel="uitkomst.waarom"
                    standaard="Online vind je eindeloos veel tips en adviezen, van het hele internet tot ChatGPT aan toe. En toch lukt het zo vaak net niet, omdat algemene info niet op jóu is afgestemd. Daarom zetten we persoonlijke aandacht voorop: dat er echt met je wordt meegekeken, op jouw situatie. Dat maakt het verschil, en het helpt je om het ook echt vol te houden."
                    className="text-[14px] leading-relaxed text-[#3a3526] bg-[#faf5e6] border border-[#ead8a0] rounded-2xl p-4"
                  />

                  {!toonTelefoon ? (
                    <div className="space-y-2.5">
                      <div>
                        <GoudKnop
                          onClick={() => {
                            setContactReden("persoonlijk");
                            setToonTelefoon(true);
                          }}
                        >
                          {t("uitkomst.knop", "Ja, kijk persoonlijk met me mee")}
                        </GoudKnop>
                        <EditNaast sleutel="uitkomst.knop" standaard="Ja, kijk persoonlijk met me mee" hint="Knop 1 (persoonlijk contact)" />
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setContactReden("resultaten");
                            setToonTelefoon(true);
                          }}
                          className="flex items-center justify-center w-full py-3 px-6 rounded-full font-semibold text-sm border border-[#c9a961] text-[#8a6d1f] bg-white/70 hover:bg-[#faf5e6] transition-all"
                        >
                          {t("uitkomst.resultaten.knop", "Ik wil graag meer info en resultaten zien")}
                        </button>
                        <EditNaast sleutel="uitkomst.resultaten.knop" standaard="Ik wil graag meer info en resultaten zien" hint="Knop 2 (meer info + resultaten)" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-2xl border border-[#ead8a0] bg-[#fdfaf0] p-4">
                      <button
                        onClick={() => setToonTelefoon(false)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#ddd0a8] bg-white px-4 py-2 text-xs font-semibold text-[#5a5440] hover:bg-[#faf5e6] transition-colors"
                      >
                        ← Terug naar de keuze
                      </button>
                      {contactReden === "resultaten" ? (
                        <>
                          <T
                            as="p"
                            multiline
                            rows={2}
                            sleutel="uitkomst.resultaten.titel"
                            standaard="Leuk! Laat je telefoonnummer achter, dan voeg ik je toe en stuur ik je meer info en de resultaten."
                            className="text-sm font-semibold text-[#5a5440]"
                          />
                          <T
                            as="p"
                            multiline
                            rows={2}
                            sleutel="uitkomst.resultaten.uitleg"
                            standaard="Voor onze groep met ervaringen en resultaten voeg ik je persoonlijk toe, daarom heb ik even je nummer nodig. Geen spam, en je kunt je altijd afmelden."
                            className="text-xs text-[#a0936e] leading-relaxed"
                          />
                        </>
                      ) : (
                        <>
                          <T
                            as="p"
                            multiline
                            rows={2}
                            sleutel="uitkomst.telefoon.titel"
                            standaard="Fijn! Laat je telefoonnummer achter, dan kijk ik persoonlijk even met je mee."
                            className="text-sm font-semibold text-[#5a5440]"
                          />
                          <T
                            as="p"
                            multiline
                            rows={2}
                            sleutel="uitkomst.telefoon.uitleg"
                            standaard="Ik gebruik je nummer alleen om persoonlijk contact met je op te nemen over je uitkomst, niet voor spam. Je kunt je altijd afmelden."
                            className="text-xs text-[#a0936e] leading-relaxed"
                          />
                        </>
                      )}
                      <input
                        type="tel"
                        value={telefoon}
                        onChange={(e) => setTelefoon(e.target.value)}
                        placeholder="06..."
                        className="w-full rounded-xl border border-[#ddd0a8] bg-white px-4 py-3 text-[15px] text-[#1a1a1a] placeholder-[#bcae86] outline-none transition focus:border-[#c9a961] focus:ring-2 focus:ring-[#c9a961]/30"
                      />
                      <GoudKnop onClick={vraagContact} disabled={bezig}>
                        {bezig ? "Bezig..." : t("uitkomst.telefoon.knop", "Versturen, en kijk met me mee")}
                      </GoudKnop>
                      <EditNaast sleutel="uitkomst.telefoon.knop" standaard="Versturen, en kijk met me mee" hint="Knop" />
                    </div>
                  )}
                </section>
              </Reveal>
            )}

            {stap === "bedankt" && (
              <Reveal richting="scale">
                <section className="text-center space-y-4 py-2">
                  <Orb emoji="🌱" />
                  <T as="h2" sleutel="bedankt.titel" standaard="Fijn, ik neem snel contact met je op" className="text-2xl sm:text-3xl font-extrabold" />
                  <T
                    as="p"
                    multiline
                    rows={3}
                    sleutel="bedankt.body"
                    standaard="Dankjewel, {naam}. Ik kijk persoonlijk even met je mee, zodat je de start kunt kiezen die het beste bij je past. Tot snel."
                    vars={{ naam: voornaam.trim() || "fijn dat je er was" }}
                    className="text-[15px] leading-relaxed text-[#3a3526] max-w-md mx-auto"
                  />
                </section>
              </Reveal>
            )}
          </div>

          <div className="text-center mt-5">
            <T
              as="p"
              sleutel="footer.klaargezet"
              standaard="Klaargezet door {naam} en het team"
              vars={{ naam: memberVoornaam }}
              className="text-[11px] text-[#a0936e] tracking-wide"
            />
          </div>

          <OfficieleDisclaimer />
        </div>
      </div>
    </FreebieCtx.Provider>
  );
}

// ============================================================
// Sub-componenten
// ============================================================
// Officiële disclaimer (zoals het team elders gebruikt). Klein, onderaan de
// pagina. Vaste tekst (niet bewerkbaar) zodat 'ie overal gelijk blijft.
function OfficieleDisclaimer() {
  return (
    <div className="mx-auto mt-4 max-w-xl space-y-2 text-[10px] leading-relaxed text-[#a0936e]">
      <p className="font-semibold uppercase tracking-wide">Disclaimer</p>
      <p>
        Deze pagina&apos;s bevatten informatie over voedingssupplementen. Deze
        zijn bedoeld als een aanvulling op de voeding. Het zijn geen
        geneesmiddelen en geen enkele uiteenzetting op deze pagina&apos;s dienen
        te worden opgevat als een claim of een bewering dat deze producten
        bedoeld zijn om te worden gebruikt bij de behandeling of preventie van
        enige ziekte. De eventuele adviezen zijn geheel vrijblijvend en liggen
        uitsluitend op het vlak van voeding en voedingssupplementen. Indien u
        lichamelijk ziek bent, raadpleeg dan een therapeut of (natuur)arts en
        volg zijn/haar adviezen. Lifeplus noch de auteurs stellen zich
        aansprakelijk voor eventuele schade, die zou kunnen voortvloeien uit de
        adviezen of eventuele onjuistheden of onvolledigheden.
      </p>
      <p>
        Deze mensen die hun ervaringen delen hebben het holistische
        vitaliteitsprogramma gevolgd, hebben hun leefstijl aangepast, zijn anders
        gaan eten, meer water gaan drinken en ondersteunen hun lichaam met
        hoogwaardige vitaalstoffen.
      </p>
    </div>
  );
}

function ProgressBar({ nr }: { nr: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full transition-all duration-500"
          style={{
            background: i < nr ? "#0d0d0d" : i === nr ? "#c9a961" : "rgba(224, 216, 188, 0.6)",
            boxShadow: i === nr ? "0 0 12px rgba(201, 169, 97, 0.55)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function Orb({ emoji }: { emoji: string }) {
  return (
    <div className="relative mx-auto h-20 w-20">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c9a961] to-[#ead8a0] blur-xl opacity-70" />
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#faf5e6] to-[#f0e8d2] text-4xl shadow-md ring-4 ring-white/70">
        {emoji}
      </div>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm"
      style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #2a2110 100%)", color: "#ead8a0" }}
    >
      {children}
    </span>
  );
}

function GoudKnop({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 block py-3.5 px-8 rounded-full font-bold text-base transition-all w-full hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      style={{ background: KNOP, color: "#f0e8d2" }}
    >
      {children}
    </button>
  );
}

function TerugKnop({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 h-12 w-12 rounded-full border border-[#ddd0a8] text-[#8a7f5e] hover:bg-[#faf5e6] transition-colors flex items-center justify-center text-lg"
      aria-label="Terug"
    >
      ←
    </button>
  );
}

function Veld({
  labelSleutel,
  labelStandaard,
  sub,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  labelSleutel: string;
  labelStandaard: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-[#5a5440] mb-1.5">
        <T as="span" sleutel={labelSleutel} standaard={labelStandaard} />
        {sub && <span className="font-normal text-[#a0936e]"> · {sub}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#ddd0a8] bg-[#fdfbf4] px-4 py-3 text-[15px] text-[#1a1a1a] placeholder-[#bcae86] outline-none transition focus:border-[#c9a961] focus:ring-2 focus:ring-[#c9a961]/30"
      />
    </div>
  );
}
