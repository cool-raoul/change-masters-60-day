"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChatBericht } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";

export default function MijnWhyPagina() {
  const { v, taal } = useTaal();
  const [berichten, setBerichten] = useState<ChatBericht[]>([]);
  const [invoer, setInvoer] = useState("");
  const [laden, setLaden] = useState(false);
  const [paginaLaden, setPaginaLaden] = useState(true);
  const [gestartMetCoach, setGestartMetCoach] = useState(false);
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [voorgesteldWhy, setVoorgesteldWhy] = useState<string | null>(null);
  const [volledigeAntwoord, setVolledigeAntwoord] = useState("");
  const [bestaandeWhy, setBestaandeWhy] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const chatEindRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview") === "true";
    setIsPreview(preview);
  }, []);

  useEffect(() => {
    async function laadGegevens() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.full_name) {
          setGebruikersnaam(user.user_metadata.full_name.split(" ")[0]);
        } else if (user?.email) {
          setGebruikersnaam(user.email.split("@")[0]);
        }
        if (user) {
          const { data } = await supabase
            .from("why_profiles")
            .select("why_samenvatting")
            .eq("user_id", user.id)
            .maybeSingle();
          // Alleen opslaan als het een echte tekst is (niet *** of te kort)
          const why = data?.why_samenvatting;
          if (why && why.replace(/\*/g, "").trim().length > 20) {
            setBestaandeWhy(why.replace(/\*+/g, "").trim());
          }
        }
      } catch (err) {
        console.error("Fout bij laden WHY:", err);
      } finally {
        setPaginaLaden(false);
      }
    }
    laadGegevens();
  }, []);

  useEffect(() => {
    chatEindRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  async function startCoach() {
    setGestartMetCoach(true);
    setLaden(true);
    setBestaandeWhy(null); // Verberg bestaande WHY tijdens gesprek

    const startMessages: Record<string, string> = {
      nl: `Hoi, ik ben ${gebruikersnaam}. Ik wil graag mijn WHY helder krijgen.`,
      en: `Hi, I'm ${gebruikersnaam}. I'd like to get clear on my WHY.`,
      fr: `Salut, je suis ${gebruikersnaam}. J'aimerais clarifier mon WHY.`,
      es: `Hola, soy ${gebruikersnaam}. Me gustaría tener claro mi WHY.`,
      de: `Hallo, ich bin ${gebruikersnaam}. Ich möchte mein WHY klar bekommen.`,
      pt: `Oi, eu sou ${gebruikersnaam}. Gostaria de esclarecer meu WHY.`,
    };

    const beginBerichten: ChatBericht[] = [
      {
        role: "user",
        content: startMessages[taal] || startMessages["nl"],
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
        body: JSON.stringify({ berichten: berPakket, naam: gebruikersnaam, taal }),
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
      // Zoek naar variaties: "MIJN WHY:", "Mijn WHY:", "JOUW WHY:", etc.
      const whyPatterns = [
        /MIJN WHY:\s*([\s\S]+?)$/i,
        /JOUW WHY:\s*([\s\S]+?)$/i,
        /YOUR WHY:\s*([\s\S]+?)$/i,
        /MY WHY:\s*([\s\S]+?)$/i,
        /MON WHY:\s*([\s\S]+?)$/i,
        /MI WHY:\s*([\s\S]+?)$/i,
        /MEIN WHY:\s*([\s\S]+?)$/i,
        /MEU WHY:\s*([\s\S]+?)$/i,
      ];

      let gevondenWhy: string | null = null;
      for (const pattern of whyPatterns) {
        const match = antwoordTekst.match(pattern);
        if (match && match[1].trim().length > 30) {
          gevondenWhy = match[1].trim().replace(/^["'\u201c\u201e]+|["'\u201d]+$/g, "").trim();
          break;
        }
      }

      if (gevondenWhy) {
        setVoorgesteldWhy(gevondenWhy);
      }
    } catch {
      toast.error(v("actie.fout"));
    } finally {
      setLaden(false);
    }
  }

  async function bevestigWhy() {
    if (!voorgesteldWhy) return;

    // In preview-modus: toon alleen de WHY zonder op te slaan
    if (isPreview) {
      const schoneWhy = voorgesteldWhy.replace(/\*+/g, "").replace(/^["'\u201c\u201e]+|["'\u201d]+$/g, "").trim();
      setBestaandeWhy(schoneWhy);
      setOpgeslagen(true);
      setVoorgesteldWhy(null);
      toast.success("Preview — WHY wordt niet opgeslagen");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Schoon de WHY tekst op
    const schoneWhy = voorgesteldWhy
      .replace(/\*+/g, "")
      .replace(/^["'\u201c\u201e]+|["'\u201d]+$/g, "")
      .trim();

    const transcript = berichten.map((b) => ({
      role: b.role,
      content: b.content,
      timestamp: b.timestamp,
    }));

    // Probeer eerst update, dan insert als er nog geen row is
    const { data: bestaand } = await supabase
      .from("why_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (bestaand) {
      await supabase
        .from("why_profiles")
        .update({
          gesprek_transcript: transcript,
          why_samenvatting: schoneWhy,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("why_profiles").insert({
        user_id: user.id,
        gesprek_transcript: transcript,
        why_samenvatting: schoneWhy,
      });
    }

    await supabase
      .from("profiles")
      .update({ onboarding_klaar: true })
      .eq("id", user.id);

    // Stel onboarding_stap in als dit de eerste keer is (niet voor bestaande gebruikers)
    if (!user.user_metadata?.onboarding_stap) {
      await supabase.auth.updateUser({ data: { onboarding_stap: 1 } });
    }

    setBestaandeWhy(schoneWhy);
    setOpgeslagen(true);
    setVoorgesteldWhy(null);
    toast.success(v("why.opgeslagen"));
  }

  async function finetuneWhy() {
    setVoorgesteldWhy(null);
    // Stuur automatisch een bericht om verder te finetunen
    const finetuneMessages: Record<string, string> = {
      nl: "Ik wil mijn WHY nog iets aanscherpen. Kun je me helpen om het nog krachtiger te maken?",
      en: "I want to refine my WHY a bit more. Can you help me make it even more powerful?",
      fr: "Je veux affiner mon WHY un peu plus. Peux-tu m'aider à le rendre encore plus puissant ?",
      es: "Quiero afinar mi WHY un poco más. ¿Puedes ayudarme a hacerlo aún más poderoso?",
      de: "Ich möchte mein WHY noch etwas verfeinern. Kannst du mir helfen, es noch kraftvoller zu machen?",
      pt: "Quero refinar meu WHY um pouco mais. Pode me ajudar a torná-lo ainda mais poderoso?",
    };
    const nieuwBericht: ChatBericht = {
      role: "user",
      content: finetuneMessages[taal] || finetuneMessages["nl"],
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
      {/* Preview banner */}
      {isPreview && (
        <div className="bg-amber-900/40 border-b border-amber-600/40 px-4 py-2 text-center">
          <p className="text-amber-300 text-xs font-semibold">
            ⚠️ Preview-modus — gesprek en WHY worden NIET opgeslagen
          </p>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-cm-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-cm-white">
            {v("why.titel")}
          </h1>
          <p className="text-cm-white text-sm">
            {v("why.subtitel")}
          </p>
        </div>
        {opgeslagen && (
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-gold text-sm"
          >
            {v("why.naar_dashboard")} →
          </button>
        )}
        <div className="text-cm-gold text-2xl">✦</div>
      </div>

      {/* Chat venster */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">

        {/* Laadscherm */}
        {paginaLaden && (
          <div className="flex items-center justify-center h-full py-20">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce delay-100" />
              <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}

        {/* Bestaande WHY tonen als er al één is */}
        {!paginaLaden && bestaandeWhy && !gestartMetCoach && (
          <div className="mb-6">
            <div className="card border-gold-subtle">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span>
                <h2 className="text-lg font-display font-bold text-cm-gold">
                  {v("why.huidige")}
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
                  {v("why.terug")}
                </button>
                <button
                  onClick={startCoach}
                  className="btn-gold text-sm flex-1"
                >
                  {v("why.opnieuw")}
                </button>
              </div>
            </div>
          </div>
        )}

        {!paginaLaden && !gestartMetCoach && !bestaandeWhy ? (
          // Start scherm — eerste keer
          <div className="flex flex-col items-center justify-center h-full text-center py-12 max-w-lg mx-auto">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-display font-bold text-cm-white mb-4">
              {v("why.welkom")} {gebruikersnaam || "teamlid"}!
            </h2>

            {/* Uitleg wat een WHY is */}
            <div className="text-left w-full mb-6">
              <h3 className="text-cm-gold font-semibold mb-2">{v("why.wat_is")}</h3>
              <p className="text-cm-white text-sm leading-relaxed">
                {v("why.uitleg1")}
              </p>
              <p className="text-cm-white text-sm leading-relaxed mt-2">
                {v("why.uitleg2")}
              </p>
            </div>

            {/* Voorbeeld WHY */}
            <div className="w-full bg-gold-subtle border border-gold-subtle rounded-xl p-4 mb-6 text-left">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-2">
                ✦ {v("why.voorbeeld")}
              </p>
              <p className="text-cm-white text-sm leading-relaxed italic">
                &ldquo;{taal === "en"
                  ? "I'm a mother of two and I work as an account manager. I've always worked full-time to pay the bills and lost myself in the process. I desperately want to see more of the world with my family. I've found a way to build extra income online without investment and without risk, without it interfering with my current job. I'm super excited because I can work from anywhere, which gives me so much more freedom."
                  : "Ik ben moeder van twee kids en ik werk als accountmanager. Ik heb altijd fulltime gewerkt om alle rekeningen te betalen en mezelf daarin weggecijferd. Ik wil dolgraag met mijn gezin meer van de wereld zien. Ik heb een manier gevonden om online extra inkomsten op te bouwen zonder investeringen en zonder risico, zonder dat dit mijn huidige werk in de weg zit. Ik ben super enthousiast, want ik kan plaatsonafhankelijk werken, wat mij veel meer vrijheid geeft."}&rdquo;
              </p>
            </div>

            {/* Wat er gaat gebeuren */}
            <div className="w-full bg-cm-surface-2 border border-cm-border rounded-xl p-4 mb-8 text-left">
              <p className="text-cm-white text-sm font-semibold mb-2">
                {v("why.wat_gebeurt")}
              </p>
              <p className="text-cm-white text-sm leading-relaxed">
                {v("why.wat_gebeurt_uitleg")}
              </p>
            </div>

            <button onClick={startCoach} className="btn-gold px-8 py-3 text-lg">
              {v("why.start")} →
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
                    {v("why.titel")}
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
                    {v("why.finetunen")}
                  </button>
                  <button
                    onClick={bevestigWhy}
                    className="btn-gold flex-1 text-sm py-3 font-bold"
                  >
                    {v("why.bevestig")} ✓
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
            {v("why.opgeslagen")}
          </p>
          <p className="text-cm-white text-sm mb-4">
            {v("why.terugvinden")}
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="btn-gold px-8 py-3"
          >
            Volgende stap →
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
              placeholder={v("why.antwoord")}
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
