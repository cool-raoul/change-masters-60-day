"use client";

import { useState } from "react";
import type { Slot } from "@/lib/webinar/slots";
import { AgendaKnoppen } from "@/components/webinar/AgendaKnoppen";

// ============================================================
// Het aanmeldformulier: naam, e-mail, telefoon (optioneel) en een
// zelfgekozen kijkmoment. Na aanmelden verschijnt de bevestiging
// met de kijklink meteen in beeld, zodat iemand die "nu meteen"
// koos niet op een mail hoeft te wachten.
// ============================================================

type Props = {
  token: string;
  slots: Slot[];
  memberVoornaam: string;
  duurMinuten: number;
  webinarTitel: string;
};

export function InschrijfFormulier({
  token,
  slots,
  memberVoornaam,
  duurMinuten,
  webinarTitel,
}: Props) {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [gekozen, setGekozen] = useState<string>(slots[0]?.start ?? "");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [klaar, setKlaar] = useState<{
    kijkUrl: string;
    direct: boolean;
    kijkToken: string;
    slotStart: string;
  } | null>(null);

  async function verstuur() {
    setFout(null);
    if (naam.trim().length < 2) return setFout("Vul je naam even in.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return setFout("Dat e-mailadres klopt nog niet helemaal.");
    if (!gekozen) return setFout("Kies een moment dat jou uitkomt.");

    setBezig(true);
    try {
      const res = await fetch("/api/webinar/inschrijven", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          naam: naam.trim(),
          email: email.trim(),
          telefoon: telefoon.trim() || undefined,
          slotStart: gekozen,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.kijkUrl) {
        setFout(data?.error ?? "Er ging iets mis. Probeer het zo nog eens.");
        setBezig(false);
        return;
      }
      setKlaar({
        kijkUrl: data.kijkUrl,
        direct: Boolean(slots.find((s) => s.start === gekozen)?.isDirect),
        kijkToken: String(data.kijkUrl).split("/").pop() ?? "",
        slotStart: gekozen,
      });
    } catch {
      setFout("Geen verbinding. Probeer het zo nog eens.");
    }
    setBezig(false);
  }

  if (klaar) {
    return (
      <div className="card border-2 border-emerald-500/50 space-y-3 text-center">
        <p className="text-3xl">🎉</p>
        <h2 className="text-xl font-display font-bold">Je staat genoteerd</h2>
        <p className="text-cm-white/80 text-sm leading-relaxed">
          {klaar.direct
            ? "Je kunt direct beginnen. Pak er even rustig de tijd voor, het duurt ongeveer " +
              duurMinuten +
              " minuten."
            : "Je krijgt een mailtje met je kijklink, en vlak voor je gekozen moment nog een herinnering. Zet 'm even in je agenda, dat helpt echt."}
        </p>
        <a
          href={klaar.kijkUrl}
          className="btn-gold w-full py-3 inline-block text-center font-semibold"
        >
          {klaar.direct ? "Start het webinar →" : "Bewaar je kijklink →"}
        </a>

        {/* Agenda-knoppen alleen bij een gepland moment; wie nu meteen
            kijkt heeft er niets aan. */}
        {!klaar.direct && (
          <div className="pt-2 text-left">
            <AgendaKnoppen
              token={klaar.kijkToken}
              titel={webinarTitel}
              startIso={klaar.slotStart}
              duurMinuten={duurMinuten}
              kijkUrl={klaar.kijkUrl}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">Hoe heet je?</label>
        <input
          className="input-cm w-full"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="Je naam"
          autoComplete="name"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">Je e-mailadres</label>
        <input
          className="input-cm w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jij@voorbeeld.nl"
          autoComplete="email"
        />
        <p className="text-cm-white/45 text-xs">
          Hier stuurt {memberVoornaam} je kijklink naartoe.
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">
          Telefoonnummer (mag je overslaan)
        </label>
        <input
          className="input-cm w-full"
          value={telefoon}
          onChange={(e) => setTelefoon(e.target.value)}
          placeholder="06..."
          autoComplete="tel"
        />
      </div>

      <div className="space-y-2 pt-1">
        <label className="text-sm text-cm-white/85">
          Wanneer komt het jou uit?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <button
              key={s.start}
              type="button"
              onClick={() => setGekozen(s.start)}
              className={`rounded-lg border-2 px-3 py-2.5 text-sm text-left transition-all ${
                gekozen === s.start
                  ? "border-cm-gold bg-cm-gold/10 text-cm-white"
                  : "border-cm-border bg-cm-surface text-cm-white/80 hover:border-cm-gold/40"
              } ${s.isDirect ? "col-span-2 font-semibold" : ""}`}
            >
              {s.isDirect ? "▶ " : ""}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {fout && <p className="text-red-300 text-sm">{fout}</p>}

      <button
        onClick={verstuur}
        disabled={bezig}
        className="btn-gold w-full py-3.5 font-bold disabled:opacity-50"
      >
        {bezig ? "Bezig..." : "Meld me aan →"}
      </button>
    </div>
  );
}
