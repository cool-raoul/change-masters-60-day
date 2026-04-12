"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChatBericht } from "@/lib/supabase/types";
import { toast } from "sonner";

export default function MijnWhyPagina() {
  const [berichten, setBerichten] = useState<ChatBericht[]>([]);
  const [invoer, setInvoer] = useState("");
  const [laden, setLaden] = useState(false);
  const [gestartMetCoach, setGestartMetCoach] = useState(false);
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [voorgesteldWhy, setVoorgesteldWhy] = useState<string | null>(null);
  const [volledigeAntwoord, setVolledigeAntwoord] = useState("");
  const [bestaandeWhy, setBestaandeWhy] = useState<string | null>(null);
  const chatEindRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setGebruikersnaam(user.user_metadata.full_name.split(" ")[0]);
      }
      if (user) {
        // Check of er al een WHY is opgeslagen
        supabase
          .from("why_profiles")
          .select("why_samenvatting")
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.why_samenvatting) {
              setBestaandeWhy(data.why_samenvatting);
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    chatEindRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  async function startCoach() {
    setGestartMetCoach(true);
    setLaden(true);
    setBestaandeWhy(null); // Verberg bestaande WHY tijdens gesprek

    const beginBerichten: ChatBericht[] = [
      {
        role: "user",
        content: `Hoi, ik ben ${gebruikersnaam}. Ik wil graag mijn WHY helder krijgen.`,
        timestamp: new Date().toISOString(),
      },
    ];

    await stuurBericht(beginBerichten);
  }

  async function stuurBericht(nieuweBerichtenLijst?: ChatBericht[]) {
    const huidigeBerichten = nieuweBerichtenLijst || berichten;
    if (!laden && !nieuweBerichtenLijst) {
      if (!invoer.trim()) return;
      const nieuwBericht: ChatBericht = {
        role: "user",
        content: invoer,
        timestamp: new Date().toISOString(),
      };
      const bijgewerkteBerichten = [...huidigeBerichten, nieuwBericht];
      setBerichten(bijgewerkteBerichten);
      setInvoer("");
      setLaden(true);
      await streamAntwoord(bijgewerkteBerichten);
    } else {
      setBerichten(huidigeBerichten);
      await streamAntwoord(huidigeBerichten);
    }
  }

  async function streamAntwoord(berPakket: ChatBericht[]) {
    try {
      const response = await fetch("/api/why-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ berichten: berPakket, naam: gebruikersnaam }),
      });

      if (!response.ok) throw new Error("API fout");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Geen stream");

      const decoder = new TextDecoder();
      let antwoordTekst = "";

      const tijdelijkBericht: ChatBericht = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setBerichten((prev) => [...prev, tijdelijkBericht]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        antwoordTekst += decoder.decode(value, { stream: true });
        setBerichten((prev) => {
          const bijgewerkt = [...prev];
          bijgewerkt[bijgewerkt.length - 1] = {
            ...tijdelijkBericht,
            content: antwoordTekst,
          };
          return bijgewerkt;
        });
      }

      setVolledigeAntwoord(antwoordTekst);

      // Controleer of WHY samenvatting aanwezig is — toon bevestiging
      if (antwoordTekst.includes("MIJN WHY:")) {
        const whyMatch = antwoordTekst.match(/MIJN WHY:([\s\S]+?)(?:\n\n|$)/);
        const whySamenvatting = whyMatch
          ? whyMatch[1].trim()
          : antwoordTekst.substring(0, 500);
        setVoorgesteldWhy(whySamenvatting);
      }
    } catch {
      toast.error("Er is iets misgegaan. Probeer opnieuw.");
    } finally {
      setLaden(false);
    }
  }

  async function bevestigWhy() {
    if (!voorgesteldWhy) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const transcript = berichten.map((b) => ({
      role: b.role,
      content: b.content,
      timestamp: b.timestamp,
    }));

    await supabase.from("why_profiles").upsert({
      user_id: user.id,
      gesprek_transcript: transcript,
      why_samenvatting: voorgesteldWhy,
      updated_at: new Date().toISOString(),
    });

    await supabase
      .from("profiles")
      .update({ onboarding_klaar: true })
      .eq("id", user.id);

    setOpgeslagen(true);
    setVoorgesteldWhy(null);
    toast.success("Jouw WHY is opgeslagen!");
  }

  async function finetuneWhy() {
    setVoorgesteldWhy(null);
    // Stuur automatisch een bericht om verder te finetunen
    const nieuwBericht: ChatBericht = {
      role: "user",
      content: "Ik wil mijn WHY nog iets aanscherpen. Kun je me helpen om het nog krachtiger te maken?",
      timestamp: new Date().toISOString(),
    };
    const bijgewerkt = [...berichten, nieuwBericht];
    setBerichten(bijgewerkt);
    setLaden(true);
    await streamAntwoord(bijgewerkt);
  }

  async function handleInvoer(e: React.FormEvent) {
    e.preventDefault();
    if (!invoer.trim() || laden) return;

    setVoorgesteldWhy(null); // Reset WHY voorstel bij nieuw bericht

    const nieuwBericht: ChatBericht = {
      role: "user",
      content: invoer,
      timestamp: new Date().toISOString(),
    };
    const bijgewerkt = [...berichten, nieuwBericht];
    setBerichten(bijgewerkt);
    setInvoer("");
    setLaden(true);
    await streamAntwoord(bijgewerkt);
  }

  return (
    <div className="min-h-screen bg-cm-black flex flex-col">
      {/* Header */}
      <div className="border-b border-cm-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-cm-white">
            Jouw{" "}
            <span className="text-gold-gradient">WHY</span>
          </h1>
          <p className="text-cm-muted text-sm">
            Ontdek wat jou écht drijft — de basis van jouw 60-dagenrun
          </p>
        </div>
        {opgeslagen && (
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-gold text-sm"
          >
            Naar dashboard →
          </button>
        )}
        <div className="text-cm-gold text-2xl">✦</div>
      </div>

      {/* Chat venster */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Bestaande WHY tonen als er al één is */}
        {bestaandeWhy && !gestartMetCoach && (
          <div className="mb-6">
            <div className="card border-gold-subtle">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span>
                <h2 className="text-lg font-display font-bold text-cm-gold">
                  Jouw huidige WHY
                </h2>
              </div>
              <p className="text-cm-white text-sm leading-relaxed italic mb-4">
                &ldquo;{bestaandeWhy}&rdquo;
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn-secondary text-sm flex-1"
                >
                  ← Terug naar dashboard
                </button>
                <button
                  onClick={startCoach}
                  className="btn-gold text-sm flex-1"
                >
                  WHY opnieuw ontdekken
                </button>
              </div>
            </div>
          </div>
        )}

        {!gestartMetCoach && !bestaandeWhy ? (
          // Start scherm — eerste keer
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-display font-bold text-cm-white mb-4">
              Welkom, {gebruikersnaam || "teamlid"}!
            </h2>
            <p className="text-cm-muted max-w-md mb-8 leading-relaxed">
              Voordat je begint aan de 60-dagenrun, is het cruciaal dat jouw{" "}
              <strong className="text-cm-white">WHY</strong> helder is.
              <br /><br />
              Onze AI-coach gaat met jou in gesprek om te ontdekken wat jou
              écht drijft. Dit duurt ongeveer 5-10 minuten.
            </p>
            <div className="bg-gold-subtle border border-gold-subtle rounded-xl p-4 max-w-sm mb-8 text-left">
              <p className="text-cm-gold text-sm font-semibold mb-2">
                Wat we gaan ontdekken:
              </p>
              <ul className="text-cm-muted text-sm space-y-1.5">
                <li>✓ Waarom je dit echt wilt doen</li>
                <li>✓ Jouw financiële doel (concreet bedrag)</li>
                <li>✓ Hoe jouw leven eruitziet als het lukt</li>
                <li>✓ Jouw persoonlijke WHY-tekst</li>
              </ul>
            </div>
            <button onClick={startCoach} className="btn-gold px-8 py-3 text-lg">
              Start het gesprek →
            </button>
          </div>
        ) : gestartMetCoach ? (
          // Chat berichten
          <>
            {berichten.map((bericht, i) => (
              <div
                key={i}
                className={`flex ${
                  bericht.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    bericht.role === "user"
                      ? "bg-cm-gold text-cm-black font-medium rounded-br-sm"
                      : "bg-cm-surface-2 border border-cm-border text-cm-white rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {bericht.content}
                    {laden &&
                      i === berichten.length - 1 &&
                      bericht.role === "assistant" &&
                      bericht.content === "" && (
                        <span className="inline-block w-2 h-4 bg-cm-gold animate-pulse ml-1" />
                      )}
                  </p>
                </div>
              </div>
            ))}
            {laden && berichten[berichten.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-cm-surface-2 border border-cm-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            {/* WHY Bevestiging */}
            {voorgesteldWhy && !opgeslagen && (
              <div className="card border-2 border-cm-gold bg-gold-subtle mx-auto max-w-md">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">✦</div>
                  <h3 className="text-lg font-display font-bold text-cm-gold">
                    Jouw WHY
                  </h3>
                </div>
                <p className="text-cm-white text-sm leading-relaxed italic text-center mb-6 px-2">
                  &ldquo;{voorgesteldWhy}&rdquo;
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={finetuneWhy}
                    className="btn-secondary flex-1 text-sm py-3"
                  >
                    Verder finetunen
                  </button>
                  <button
                    onClick={bevestigWhy}
                    className="btn-gold flex-1 text-sm py-3 font-bold"
                  >
                    Dit is &apos;m! ✓
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEindRef} />
          </>
        ) : null}
      </div>

      {/* Opgeslagen banner */}
      {opgeslagen && (
        <div className="bg-gold-subtle border-t border-gold-subtle p-6 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-cm-gold font-semibold text-lg mb-1">
            Jouw WHY is opgeslagen!
          </p>
          <p className="text-cm-muted text-sm mb-4">
            Je kunt je WHY altijd terugvinden op het dashboard en hier aanpassen.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-gold px-8 py-3"
          >
            Naar het dashboard →
          </button>
        </div>
      )}

      {/* Invoer */}
      {gestartMetCoach && !opgeslagen && !voorgesteldWhy && (
        <div className="border-t border-cm-border p-4 max-w-2xl mx-auto w-full">
          <form onSubmit={handleInvoer} className="flex gap-3">
            <input
              type="text"
              value={invoer}
              onChange={(e) => setInvoer(e.target.value)}
              placeholder="Jouw antwoord..."
              className="input-cm flex-1"
              disabled={laden}
            />
            <button
              type="submit"
              disabled={laden || !invoer.trim()}
              className="btn-gold px-6"
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
