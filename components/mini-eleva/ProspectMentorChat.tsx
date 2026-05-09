"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

// ============================================================
// ProspectMentorChat, het AI-mentor-venster aan de prospect-kant.
//
// Verschilt van components/coach/ChatVenster.tsx:
//   - Geen Supabase-auth, alle calls verlopen via token-only API
//   - Geen prospect/profile-context (de prospect IS de gebruiker)
//   - Hard quotum-display (50 vragen) zichtbaar in UI
//   - Knop "haal sponsor erbij" prominent bovenaan
//   - Geen snelle-opties knoppen (we willen niet sturen)
//
// Streaming via dezelfde text/plain chunked response als /api/coach.
// ============================================================

type Bericht = {
  id?: string;
  rol: "prospect" | "ai_mentor" | "member" | "sponsor";
  content: string;
  created_at?: string;
};

type Props = {
  token: string;
  prospectVoornaam: string;
  initieleBerichten: Bericht[];
  initieelGebruikt: number;
  limiet: number;
  memberNaam: string | null;
  sponsorNaam: string | null;
};

export function ProspectMentorChat({
  token,
  prospectVoornaam,
  initieleBerichten,
  initieelGebruikt,
  limiet,
  memberNaam,
  sponsorNaam,
}: Props) {
  const [berichten, setBerichten] = useState<Bericht[]>(initieleBerichten);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [streamendAntwoord, setStreamendAntwoord] = useState("");
  const [gebruikt, setGebruikt] = useState(initieelGebruikt);
  const [quotumBereikt, setQuotumBereikt] = useState(initieelGebruikt >= limiet);
  const eindRef = useRef<HTMLDivElement>(null);

  const scrollNaarOnder = useCallback(() => {
    eindRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollNaarOnder();
  }, [berichten, streamendAntwoord, scrollNaarOnder]);

  async function verstuurVraag() {
    const vraag = invoer.trim();
    if (!vraag || bezig || quotumBereikt) return;

    setBezig(true);
    setInvoer("");
    setBerichten((b) => [...b, { rol: "prospect", content: vraag }]);
    setStreamendAntwoord("");

    try {
      const res = await fetch("/api/mini-eleva/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, vraag }),
      });

      if (res.status === 429) {
        // Quotum bereikt
        const data = await res.json().catch(() => ({}));
        setQuotumBereikt(true);
        setBerichten((b) => [
          ...b,
          {
            rol: "ai_mentor",
            content:
              data.bericht ??
              "Je hebt het maximaal aantal vragen bereikt. Haal er een mens bij voor verdere vragen.",
          },
        ]);
        setBezig(false);
        return;
      }

      if (!res.ok || !res.body) {
        const tekst = await res.text().catch(() => "");
        toast.error(tekst || "Mentor reageert niet, probeer opnieuw");
        setBezig(false);
        return;
      }

      // Stream het antwoord token-voor-token
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let totaal = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        totaal += chunk;
        setStreamendAntwoord(totaal);
      }

      setBerichten((b) => [...b, { rol: "ai_mentor", content: totaal }]);
      setStreamendAntwoord("");
      setGebruikt((g) => {
        const nieuw = g + 1;
        if (nieuw >= limiet) setQuotumBereikt(true);
        return nieuw;
      });
    } catch {
      toast.error("Verbindingsfout, probeer opnieuw");
    } finally {
      setBezig(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      verstuurVraag();
    }
  }

  const resterend = Math.max(0, limiet - gebruikt);
  const sponsorErbijTekst =
    memberNaam && sponsorNaam
      ? `Haal ${memberNaam.split(" ")[0]} of ${sponsorNaam.split(" ")[0]} erbij`
      : memberNaam
        ? `Haal ${memberNaam.split(" ")[0]} erbij`
        : "Haal sponsor erbij";

  return (
    <div className="flex flex-col h-full">
      {/* Top-balk met haal-erbij-knop en quotum */}
      <div className="card border-l-4 border-cm-gold/60 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-cm-white/70 leading-relaxed flex-1 min-w-[180px]">
          Vraag me wat je wilt over Lifeplus, ELEVA of het verdienmodel. Ik ben
          de ELEVA-mentor, een AI. Wat we hier bespreken blijft tussen ons. Voor
          diepere vragen kun je{" "}
          <span className="text-cm-gold font-semibold">{memberNaam ?? "de member"}</span>
          {sponsorNaam ? ` of ${sponsorNaam}` : ""} erbij halen.
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => {
              // Drie-persoonschat krijgen we in een latere stap. Voor nu
              // vertellen we de prospect dat de hint is doorgegeven aan de
              // member, via een activiteit-log.
              fetch("/api/mini-eleva/sponsor-erbij", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              })
                .then((r) => {
                  if (r.ok) {
                    toast.success(
                      `${memberNaam ?? "De member"} krijgt een seintje dat je hulp wilt`,
                    );
                  } else {
                    toast.error("Niet gelukt om door te geven");
                  }
                })
                .catch(() => toast.error("Verbindingsfout"));
            }}
            className="btn-gold text-xs whitespace-nowrap"
          >
            🤝 {sponsorErbijTekst}
          </button>
          <span className="text-[10px] text-cm-white/40">
            Vragen: {gebruikt}/{limiet}
          </span>
        </div>
      </div>

      {/* Berichten-lijst */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {berichten.length === 0 && !streamendAntwoord && (
          <div className="card bg-cm-surface-2/50 text-sm leading-relaxed">
            <p className="text-cm-white/90">
              Hoi {prospectVoornaam}! Ik ben de ELEVA-mentor. Stel me gerust
              een vraag, hoe simpel of kritisch ook. Bijvoorbeeld:
            </p>
            <ul className="text-cm-white/60 text-xs mt-2 space-y-1 list-disc list-inside">
              <li>Wat is Lifeplus eigenlijk?</li>
              <li>Hoe werkt het verdienen precies?</li>
              <li>Wat zit er in het Holistic Reset-pakket?</li>
              <li>Is dit niet gewoon een piramide?</li>
            </ul>
          </div>
        )}

        {berichten.map((b, i) => (
          <BerichtBubbel key={b.id ?? i} bericht={b} />
        ))}

        {streamendAntwoord && (
          <BerichtBubbel
            bericht={{ rol: "ai_mentor", content: streamendAntwoord }}
          />
        )}

        {bezig && !streamendAntwoord && (
          <div className="text-cm-white/40 text-xs italic px-1">
            Mentor denkt na...
          </div>
        )}

        <div ref={eindRef} />
      </div>

      {/* Invoerveld */}
      {!quotumBereikt ? (
        <div className="border-t border-cm-white/10 pt-3 flex items-end gap-2">
          <textarea
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={bezig}
            placeholder={
              bezig ? "Even geduld..." : "Stel je vraag... (Enter om te sturen)"
            }
            rows={2}
            maxLength={2000}
            className="flex-1 bg-cm-surface-2 border border-cm-white/10 rounded-lg px-3 py-2 text-sm text-cm-white placeholder:text-cm-white/30 resize-none focus:outline-none focus:border-cm-gold/40 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={verstuurVraag}
            disabled={!invoer.trim() || bezig}
            className="btn-gold text-sm whitespace-nowrap disabled:opacity-50"
          >
            {bezig ? "..." : "Stuur"}
          </button>
        </div>
      ) : (
        <div className="border-t border-cm-white/10 pt-3 text-center">
          <p className="text-cm-white/60 text-xs leading-relaxed">
            Je hebt het maximaal aantal AI-vragen bereikt voor deze sessie. Voor
            verdere vragen kun je beter{" "}
            <span className="text-cm-gold font-semibold">
              {memberNaam ?? "de member"}
            </span>
            {sponsorNaam ? ` of ${sponsorNaam}` : ""} erbij halen via de knop
            hierboven.
          </p>
        </div>
      )}
    </div>
  );
}

function BerichtBubbel({ bericht }: { bericht: Bericht }) {
  const isProspect = bericht.rol === "prospect";
  const isAi = bericht.rol === "ai_mentor";

  if (isProspect) {
    return (
      <div className="flex justify-end">
        <div className="bg-cm-gold/15 border border-cm-gold/30 rounded-lg px-3 py-2 max-w-[85%] text-sm text-cm-white whitespace-pre-wrap">
          {bericht.content}
        </div>
      </div>
    );
  }

  if (isAi) {
    return (
      <div className="flex justify-start">
        <div className="bg-cm-surface-2 border border-cm-white/10 rounded-lg px-3 py-2 max-w-[85%] text-sm text-cm-white whitespace-pre-wrap">
          <p className="text-[10px] text-cm-gold/80 uppercase tracking-wider mb-1">
            ELEVA-mentor
          </p>
          {bericht.content}
        </div>
      </div>
    );
  }

  // member of sponsor (komen later in 3-persoonschat-scenario)
  return (
    <div className="flex justify-start">
      <div className="bg-cm-surface border border-cm-white/10 rounded-lg px-3 py-2 max-w-[85%] text-sm text-cm-white whitespace-pre-wrap">
        <p className="text-[10px] text-cm-white/50 uppercase tracking-wider mb-1">
          {bericht.rol === "member" ? "Member" : "Sponsor"}
        </p>
        {bericht.content}
      </div>
    </div>
  );
}
