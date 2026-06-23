"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  DARM_VRAGEN,
  DARM_SCHAAL_LABELS,
  type DarmAntwoord,
} from "@/lib/zelftest/darm-vragen";
import { bouwGezondeStartUitkomst } from "@/lib/freebie-bots/jouw-gezonde-start/uitkomst";

// ============================================================
// "Jouw gezonde start" — clientflow (fase 1, het skelet).
// welkom → gegevens → darm-vragen → advies-uitkomst → bedankt.
// Capture via /api/freebie-bot/opt-in, contact-knop via
// /api/freebie-bot/contact (die vuurt sinds 2026-06-23 de warm-trigger).
// Welkomstfilm + info-film zijn nu placeholder-slots (eigen-upload = fase 2).
// ============================================================

type Stap = "welkom" | "gegevens" | "vragen" | "uitkomst" | "bedankt";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  const aantalBeantwoord = Object.keys(darm).length;
  const alleBeantwoord = aantalBeantwoord === DARM_VRAGEN.length;
  const uitslag = bouwGezondeStartUitkomst(darm, voornaam);

  function gaNaarVragen() {
    if (!voornaam.trim() || !achternaam.trim()) {
      toast.error("Vul je voor- en achternaam in.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast.error("Vul een geldig e-mailadres in.");
      return;
    }
    if (telefoon.trim().length < 8) {
      toast.error("Vul je telefoonnummer in, dan kan ik persoonlijk meekijken.");
      return;
    }
    setStap("vragen");
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
      // Stil: de prospect mag hier nooit een fout zien.
    }
  }

  function toonUitkomst() {
    if (!alleBeantwoord) {
      toast.error("Beantwoord nog even alle vragen, dan krijg je je advies.");
      return;
    }
    void vangProspect();
    setStap("uitkomst");
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
      // Stil falen.
    }
    setBezig(false);
    setStap("bedankt");
  }

  return (
    <div className="min-h-screen bg-cm-black text-cm-white">
      <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-12 w-12 mx-auto mb-2" />
          <h1 className="text-3xl eleva-brand">ELEVA</h1>
        </div>

        {stap === "welkom" && (
          <div className="card border-gold-subtle space-y-5">
            <h2 className="font-serif-warm text-2xl text-cm-white">
              Welkom, fijn dat je er bent
            </h2>
            {welkomFilm}
            <div className="text-cm-white/80 text-sm leading-relaxed space-y-3">
              <p>
                Leuk dat je hier bent. Waarschijnlijk omdat iets je raakte en je
                nieuwsgierig werd. Hieronder kun je in een paar minuten een korte
                check doen, en je krijgt meteen een persoonlijk advies waar een
                fijne start voor je zou kunnen liggen.
              </p>
              <p>
                Daarna kijk ik graag samen met jou wat echt bij je past. Helemaal
                vrijblijvend, en op je eigen tempo.
              </p>
            </div>
            <button onClick={() => setStap("gegevens")} className="btn-gold w-full">
              Ja, ik wil de check doen
            </button>
          </div>
        )}

        {stap === "gegevens" && (
          <div className="card border-gold-subtle space-y-4">
            <h2 className="font-serif-warm text-xl text-cm-white">
              Vertel me even kort wie je bent
            </h2>
            <p className="text-cm-white/70 text-sm">
              Zo kan ik je je uitkomst sturen en, als je dat fijn vindt,
              persoonlijk met je meekijken.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Veld label="Voornaam" value={voornaam} onChange={setVoornaam} />
              <Veld label="Achternaam" value={achternaam} onChange={setAchternaam} />
            </div>
            <Veld label="E-mailadres" value={email} onChange={setEmail} type="email" placeholder="jouw@email.nl" />
            <Veld label="Telefoonnummer" value={telefoon} onChange={setTelefoon} type="tel" placeholder="06..." />
            <Veld label="Instagram (optioneel)" value={instagram} onChange={setInstagram} placeholder="@jouwnaam" />
            <Veld label="Facebook (optioneel)" value={facebook} onChange={setFacebook} placeholder="je Facebook-naam of -link" />
            <button onClick={gaNaarVragen} className="btn-gold w-full mt-2">
              Verder naar de check
            </button>
          </div>
        )}

        {stap === "vragen" && (
          <div className="card border-gold-subtle space-y-5">
            <div>
              <h2 className="font-serif-warm text-xl text-cm-white">
                Hoe herken je dit bij jezelf?
              </h2>
              <p className="text-cm-white/70 text-sm mt-1">
                Geen goed of fout, alleen jouw eerlijke gevoel. ({aantalBeantwoord}/
                {DARM_VRAGEN.length})
              </p>
            </div>
            <div className="space-y-5">
              {DARM_VRAGEN.map((v) => (
                <div key={v.id} className="space-y-2">
                  <p className="text-cm-white text-sm">{v.tekst}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {([0, 1, 2, 3] as DarmAntwoord[]).map((w) => (
                      <button
                        key={w}
                        onClick={() => setDarm((d) => ({ ...d, [v.id]: w }))}
                        className={`text-xs rounded-lg py-2 px-1 border transition-colors ${
                          darm[v.id] === w
                            ? "border-cm-gold bg-cm-gold/15 text-cm-gold"
                            : "border-cm-border text-cm-white/70 hover:border-cm-gold-dim"
                        }`}
                      >
                        {DARM_SCHAAL_LABELS[w]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={toonUitkomst}
              disabled={!alleBeantwoord}
              className="btn-gold w-full disabled:opacity-50"
            >
              Toon mijn advies
            </button>
          </div>
        )}

        {stap === "uitkomst" && (
          <div className="card border-gold-subtle space-y-5">
            <div className="text-center space-y-1">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Jouw persoonlijke advies
              </p>
              <h2 className="font-serif-warm text-2xl text-cm-white">{uitslag.kop}</h2>
            </div>
            <p className="text-cm-white/85 text-sm leading-relaxed">{uitslag.advies}</p>
            {infoFilm}
            <p className="text-cm-white/70 text-sm leading-relaxed">{uitslag.meekijken}</p>
            <button onClick={vraagContact} disabled={bezig} className="btn-gold w-full">
              {bezig ? "Bezig..." : "Ja, kijk persoonlijk met me mee"}
            </button>
          </div>
        )}

        {stap === "bedankt" && (
          <div className="card border-gold-subtle space-y-4 text-center">
            <div className="text-4xl">🌱</div>
            <h2 className="font-serif-warm text-2xl text-cm-white">
              Fijn, ik neem snel contact met je op
            </h2>
            <p className="text-cm-white/80 text-sm leading-relaxed">
              Dankjewel, {voornaam.trim() || "fijn dat je er was"}. Ik kijk
              persoonlijk even met je mee, zodat je de start kunt kiezen die het
              beste bij je past. Tot snel.
            </p>
            <p className="text-cm-white/50 text-xs">
              Klaargezet door {memberVoornaam} en het team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Veld({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-cm-white mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-cm"
      />
    </div>
  );
}
