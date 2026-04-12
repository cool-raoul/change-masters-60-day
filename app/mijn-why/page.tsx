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
  const chatEindRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setGebruikersnaam(user.user_metadata.full_name.split(" ")[0]);
      }
    });
  }, []);

  useEffect(() => {
    chatEindRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  async function startCoach() {
    setGestartMetCoach(true);
    setLaden(true);

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

      // Voeg leeg assistent bericht toe
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

      // Controleer of WHY samenvatting aanwezig is
      if (antwoordTekst.includes("MIJN WHY:")) {
        await slaWhyOp([...berPakket, { role: "assistant", content: antwoordTekst, timestamp: new Date().toISOString() }], antwoordTekst);
      }
    } catch {
      toast.error("Er is iets misgegaan. Probeer opnieuw.");
    } finally {
      setLaden(false);
    }
  }

  async function slaWhyOp(transcript: ChatBericht[], whyTekst: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Extraheer de WHY samenvatting
    const whyMatch = whyTekst.match(/MIJN WHY:([\s\S]+?)(?:\n\n|$)/);
    const whySamenvatting = whyMatch
      ? whyMatch[1].trim()
      : whyTekst.substring(0, 500);

    // Sla op in database
    await supabase.from("why_profiles").upsert({
      user_id: user.id,
      gesprek_transcript: transcript,
      why_samenvatting: whySamenvatting,
      updated_at: new Date().toISOString(),
    });

    // Markeer onboarding als klaar
    await supabase
      .from("profiles")
      .update({ onboarding_klaar: true })
      .eq("id", user.id);

    setOpgeslagen(true);
  }

  async function handleInvoer(e: React.FormEvent) {
    e.preventDefault();
    if (!invoer.trim() || laden) return;

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
        <div className="text-cm-gold text-2xl">✦</div>
      </div>

      {/* Chat venster */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {!gestartMetCoach ? (
          // Start scherm
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
        ) : (
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
            <div ref={chatEindRef} />
          </>
        )}
      </div>

      {/* Opgeslagen banner */}
      {opgeslagen && (
        <div className="bg-gold-subtle border-t border-gold-subtle p-4 text-center">
          <p className="text-cm-gold font-semibold mb-3">
            ✦ Jouw WHY is opgeslagen! Je bent klaar om te beginnen.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-gold"
          >
            Naar het dashboard →
          </button>
        </div>
      )}

      {/* Invoer */}
      {gestartMetCoach && !opgeslagen && (
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
