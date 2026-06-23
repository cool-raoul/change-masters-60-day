"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/ui/Reveal";
import {
  DARM_VRAGEN,
  DARM_SCHAAL_LABELS,
  type DarmAntwoord,
} from "@/lib/zelftest/darm-vragen";
import { bouwGezondeStartUitkomst } from "@/lib/freebie-bots/jouw-gezonde-start/uitkomst";

// ============================================================
// "Jouw gezonde start" — clientflow (fase 1).
// Premium crème-goud freebie-stijl met zachte animaties.
// welkom → gegevens → darm-check → advies → bedankt.
// Capture via /api/freebie-bot/opt-in, contact via /api/freebie-bot/contact
// (die vuurt de warm-trigger). Welkom-/info-film zijn nu placeholder-slots.
// ============================================================

const BG =
  "linear-gradient(180deg, #f7f1e4 0%, #f4ebd0 30%, #ead8a0 70%, #f0e8d2 100%)";
const KNOP =
  "linear-gradient(135deg, #0d0d0d 0%, #2a2110 50%, #0d0d0d 100%)";
const GOUD =
  "linear-gradient(135deg, #c9a961 0%, #ead8a0 100%)";

type Stap = "welkom" | "gegevens" | "vragen" | "uitkomst" | "bedankt";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STAP_NR: Record<Stap, number> = {
  welkom: 1,
  gegevens: 2,
  vragen: 3,
  uitkomst: 4,
  bedankt: 4,
};

export function GezondeStartFlow({
  token,
  memberVoornaam,
  welkomFilm,
  infoFilm,
}: {
  token: string;
  memberVoornaam: string;
  welkomFilm: ReactNode;
  infoFilm: ReactNode;
}) {
  const [stap, setStap] = useState<Stap>("welkom");
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [darm, setDarm] = useState<Record<string, DarmAntwoord>>({});
  const [bezig, setBezig] = useState(false);
  const optInGedaanRef = useRef(false);

  const aantal = Object.keys(darm).length;
  const alleBeantwoord = aantal === DARM_VRAGEN.length;
  const uitslag = bouwGezondeStartUitkomst(darm, voornaam);

  function naar(s: Stap) {
    setStap(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function gaNaarVragen() {
    if (!voornaam.trim() || !achternaam.trim()) return toast.error("Vul je voor- en achternaam in.");
    if (!EMAIL_RE.test(email)) return toast.error("Vul een geldig e-mailadres in.");
    if (telefoon.trim().length < 8) return toast.error("Vul je telefoonnummer in, dan kan ik persoonlijk meekijken.");
    naar("vragen");
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
          antwoorden: { darmTotaal: uitslag.totaal, darmBucket: uitslag.bucket },
          spiegelTekst: `🌱 Jouw gezonde start\nDarm-score: ${uitslag.totaal}/${uitslag.max} → advies: ${uitslag.bucketLabel}`,
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

  function toonUitkomst() {
    if (!alleBeantwoord) return toast.error("Beantwoord nog even alle vragen, dan krijg je je advies.");
    void vangProspect();
    naar("uitkomst");
  }

  async function vraagContact() {
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
        }),
      });
    } catch {
      /* stil */
    }
    setBezig(false);
    naar("bedankt");
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: BG, color: "#1a1a1a" }}>
      <div aria-hidden className="pointer-events-none fixed top-10 -left-8 text-[170px] opacity-[0.04] rotate-12 select-none">🌱</div>
      <div aria-hidden className="pointer-events-none fixed top-1/3 -right-12 text-[170px] opacity-[0.04] -rotate-12 select-none">✨</div>
      <div aria-hidden className="pointer-events-none fixed bottom-24 -left-6 text-[150px] opacity-[0.04] rotate-6 select-none">🌿</div>

      <div className="relative mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <ProgressBar nr={STAP_NR[stap]} />

        <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-white/40 p-6 sm:p-9 mt-6 border border-[#ead8a0]/60">
          {stap === "welkom" && (
            <Reveal richting="fade">
              <section className="space-y-6">
                <div className="text-center space-y-3">
                  <Orb emoji="🌱" />
                  <Tag>Jouw gezonde start</Tag>
                  <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Welkom, fijn dat je er bent</h1>
                </div>
                {welkomFilm}
                <div className="text-[15px] leading-relaxed text-[#3a3526] space-y-3">
                  <p>Leuk dat je hier bent. Waarschijnlijk omdat iets je raakte en je nieuwsgierig werd. In een paar minuten doe je een korte check, en je krijgt meteen een persoonlijk advies waar een fijne start voor jou zou kunnen liggen.</p>
                  <p>Daarna kijk ik graag samen met jou wat echt bij je past. Helemaal vrijblijvend, en op je eigen tempo.</p>
                </div>
                <GoudKnop onClick={() => naar("gegevens")}>Ja, ik wil de check doen</GoudKnop>
              </section>
            </Reveal>
          )}

          {stap === "gegevens" && (
            <Reveal richting="fade">
              <section className="space-y-5">
                <div className="text-center space-y-2">
                  <Tag>Stap 1 van 2</Tag>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">Vertel me even kort wie je bent</h2>
                  <p className="text-sm text-[#6b6450]">Zo kan ik je je uitkomst sturen en, als je dat fijn vindt, persoonlijk met je meekijken.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Veld label="Voornaam" value={voornaam} onChange={setVoornaam} />
                  <Veld label="Achternaam" value={achternaam} onChange={setAchternaam} />
                </div>
                <Veld label="E-mailadres" value={email} onChange={setEmail} type="email" placeholder="jouw@email.nl" />
                <Veld label="Telefoonnummer" value={telefoon} onChange={setTelefoon} type="tel" placeholder="06..." />
                <div className="grid grid-cols-2 gap-3">
                  <Veld label="Instagram" sub="optioneel" value={instagram} onChange={setInstagram} placeholder="@jouwnaam" />
                  <Veld label="Facebook" sub="optioneel" value={facebook} onChange={setFacebook} placeholder="je naam of link" />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <TerugKnop onClick={() => naar("welkom")} />
                  <GoudKnop onClick={gaNaarVragen}>Verder naar de check</GoudKnop>
                </div>
              </section>
            </Reveal>
          )}

          {stap === "vragen" && (
            <Reveal richting="fade">
              <section className="space-y-5">
                <div className="text-center space-y-2">
                  <Tag>Stap 2 van 2</Tag>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">Hoe herken je dit bij jezelf?</h2>
                  <p className="text-sm text-[#6b6450]">Geen goed of fout, alleen jouw eerlijke gevoel.</p>
                  <div className="mx-auto max-w-xs">
                    <div className="h-1.5 rounded-full bg-[#e7dcb8] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(aantal / DARM_VRAGEN.length) * 100}%`, background: GOUD }} />
                    </div>
                    <p className="text-[11px] text-[#a0936e] mt-1.5 font-semibold">{aantal} van {DARM_VRAGEN.length}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {DARM_VRAGEN.map((v, i) => (
                    <Reveal key={v.id} richting="up" delay={Math.min(i * 35, 250)}>
                      <div className="rounded-2xl border border-[#ead8a0]/70 bg-[#fdfaf0] p-4">
                        <p className="text-[15px] text-[#2a2616] mb-3">{v.tekst}</p>
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
                                {DARM_SCHAAL_LABELS[w]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <TerugKnop onClick={() => naar("gegevens")} />
                  <GoudKnop onClick={toonUitkomst} disabled={!alleBeantwoord}>Toon mijn advies</GoudKnop>
                </div>
              </section>
            </Reveal>
          )}

          {stap === "uitkomst" && (
            <Reveal richting="scale">
              <section className="space-y-6">
                <div className="text-center space-y-3">
                  <Orb emoji="🌿" />
                  <Tag>Jouw persoonlijke advies</Tag>
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{uitslag.kop}</h2>
                </div>
                <div className="rounded-2xl p-5 text-[15px] leading-relaxed" style={{ background: "linear-gradient(135deg, #faf5e6 0%, #f0e8d2 100%)", border: "1px solid #ead8a0", color: "#3a3526" }}>
                  {uitslag.advies}
                </div>
                {infoFilm}
                <p className="text-[15px] leading-relaxed text-[#6b6450]">{uitslag.meekijken}</p>
                <GoudKnop onClick={vraagContact} disabled={bezig}>{bezig ? "Bezig..." : "Ja, kijk persoonlijk met me mee"}</GoudKnop>
              </section>
            </Reveal>
          )}

          {stap === "bedankt" && (
            <Reveal richting="scale">
              <section className="text-center space-y-4 py-2">
                <Orb emoji="🌱" />
                <h2 className="text-2xl sm:text-3xl font-extrabold">Fijn, ik neem snel contact met je op</h2>
                <p className="text-[15px] leading-relaxed text-[#3a3526] max-w-md mx-auto">
                  Dankjewel, {voornaam.trim() || "fijn dat je er was"}. Ik kijk persoonlijk even met je mee, zodat je de start kunt kiezen die het beste bij je past. Tot snel.
                </p>
              </section>
            </Reveal>
          )}
        </div>

        <p className="text-center text-[11px] text-[#a0936e] mt-5 tracking-wide">
          Klaargezet door {memberVoornaam} en het team
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Sub-componenten
// ============================================================
function ProgressBar({ nr }: { nr: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4].map((i) => (
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
  label,
  sub,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#5a5440] mb-1.5">
        {label} {sub && <span className="font-normal text-[#a0936e]">· {sub}</span>}
      </label>
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
