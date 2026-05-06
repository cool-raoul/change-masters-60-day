"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Prospect } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTaal } from "@/lib/i18n/TaalContext";
import { KanaalIconen } from "@/components/gedeeld/KanaalIconen";

interface Props {
  prospect: Prospect;
}

export function ContactgegevensForm({ prospect }: Props) {
  const { v } = useTaal();
  const [bewerkModus, setBewerkModus] = useState(false);
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [volledigeNaam, setVolledigeNaam] = useState(prospect.volledige_naam);
  const [telefoon, setTelefoon] = useState(prospect.telefoon || "");
  const [email, setEmail] = useState(prospect.email || "");
  const [instagram, setInstagram] = useState(prospect.instagram || "");
  const [facebook, setFacebook] = useState(prospect.facebook || "");
  const [beroep, setBeroep] = useState(prospect.beroep || "");
  const [notities, setNotities] = useState(prospect.notities || "");
  const [situatieKort, setSituatieKort] = useState(prospect.situatie_kort || "");
  const [aiBezig, setAiBezig] = useState(false);
  const [prioriteit, setPrioriteit] = useState<"hoog" | "normaal" | "laag">(
    prospect.prioriteit
  );

  // Roept de AI-samenvat-API aan om uit de aantekeningen één korte
  // situatie-zin te maken (5-10 woorden) die in het 3-weg-script
  // gebruikt wordt op de [situatie]-plek. Werkt alleen als er
  // aantekeningen zijn.
  async function vatSamen() {
    if (!notities.trim()) {
      toast.error("Vul eerst aantekeningen in");
      return;
    }
    setAiBezig(true);
    try {
      const res = await fetch("/api/situatie-samenvatting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notities }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.situatie) setSituatieKort(data.situatie);
    } catch (err) {
      toast.error("Samenvatten niet gelukt, probeer opnieuw");
      console.error(err);
    } finally {
      setAiBezig(false);
    }
  }

  async function slaOp(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    const { error } = await supabase
      .from("prospects")
      .update({
        volledige_naam: volledigeNaam,
        telefoon: telefoon || null,
        email: email || null,
        instagram: instagram || null,
        facebook: facebook || null,
        beroep: beroep || null,
        notities: notities || null,
        situatie_kort: situatieKort || null,
        prioriteit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prospect.id);

    if (error) {
      toast.error(v("contact.fout"));
    } else {
      toast.success(v("contact.bijgewerkt"));
      setBewerkModus(false);
      router.refresh();
    }

    setLaden(false);
  }

  function annuleer() {
    setVolledigeNaam(prospect.volledige_naam);
    setTelefoon(prospect.telefoon || "");
    setEmail(prospect.email || "");
    setInstagram(prospect.instagram || "");
    setFacebook(prospect.facebook || "");
    setBeroep(prospect.beroep || "");
    setNotities(prospect.notities || "");
    setSituatieKort(prospect.situatie_kort || "");
    setPrioriteit(prospect.prioriteit);
    setBewerkModus(false);
  }

  if (!bewerkModus) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            {v("contact.gegevens")}
          </h2>
          <button
            onClick={() => setBewerkModus(true)}
            className="text-cm-gold text-xs hover:text-cm-gold-light transition-colors"
          >
            {v("contact.bewerken")}
          </button>
        </div>

        {prospect.telefoon && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Telefoon</p>
            <div className="flex items-center gap-2">
              <p className="text-cm-white text-sm flex-1 min-w-0 truncate">{prospect.telefoon}</p>
              <KanaalIconen
                prospect={{ telefoon: prospect.telefoon }}
                grootte="compact"
              />
            </div>
          </div>
        )}
        {prospect.email && (
          <div>
            <p className="text-xs text-cm-white opacity-60">{v("registreer.email")}</p>
            <div className="flex items-center gap-2">
              <p className="text-cm-white text-sm flex-1 min-w-0 truncate">{prospect.email}</p>
              <KanaalIconen
                prospect={{ email: prospect.email }}
                grootte="compact"
              />
            </div>
          </div>
        )}
        {prospect.instagram && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Instagram</p>
            <div className="flex items-center gap-2">
              <p className="text-cm-white text-sm flex-1 min-w-0 truncate">{prospect.instagram}</p>
              <KanaalIconen
                prospect={{ instagram: prospect.instagram }}
                grootte="compact"
              />
            </div>
          </div>
        )}
        {prospect.facebook && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Facebook</p>
            <div className="flex items-center gap-2">
              <p className="text-cm-white text-sm flex-1 min-w-0 truncate">{prospect.facebook}</p>
              <KanaalIconen
                prospect={{ facebook: prospect.facebook }}
                grootte="compact"
              />
            </div>
          </div>
        )}
        {prospect.beroep && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Beroep</p>
            <p className="text-cm-white text-sm">{prospect.beroep}</p>
          </div>
        )}
        {prospect.bron && (
          <div>
            <p className="text-xs text-cm-white opacity-60">{v("contact.bron")}</p>
            <p className="text-cm-white text-sm capitalize">{prospect.bron}</p>
          </div>
        )}
        {prospect.notities && (
          <div>
            <p className="text-xs text-cm-white opacity-60">{v("namenlijst.aantekeningen")}</p>
            <p className="text-cm-white text-sm">{prospect.notities}</p>
          </div>
        )}
        {prospect.situatie_kort && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Situatie (kort, voor 3-weg)</p>
            <p className="text-cm-white text-sm">{prospect.situatie_kort}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-cm-white opacity-60">{v("contact.prioriteit")}</p>
          <p className="text-cm-white text-sm capitalize">{prospect.prioriteit}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={slaOp} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          {v("contact.gegevens_bewerken")}
        </h2>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          {v("contact.naam")}
        </label>
        <input
          type="text"
          value={volledigeNaam}
          onChange={(e) => setVolledigeNaam(e.target.value)}
          className="input-cm text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Telefoon
        </label>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={telefoon}
            onChange={(e) => setTelefoon(e.target.value)}
            placeholder="+31 6 12345678"
            className="input-cm text-sm flex-1 min-w-0"
          />
          {telefoon && (
            <KanaalIconen prospect={{ telefoon }} grootte="compact" />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          {v("registreer.email")}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@email.nl"
            className="input-cm text-sm flex-1 min-w-0"
          />
          {email && <KanaalIconen prospect={{ email }} grootte="compact" />}
        </div>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Instagram
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@gebruikersnaam"
            className="input-cm text-sm flex-1 min-w-0"
          />
          {instagram && (
            <KanaalIconen prospect={{ instagram }} grootte="compact" />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Facebook
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="Naam of URL"
            className="input-cm text-sm flex-1 min-w-0"
          />
          {facebook && (
            <KanaalIconen prospect={{ facebook }} grootte="compact" />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Beroep
        </label>
        <input
          type="text"
          value={beroep}
          onChange={(e) => setBeroep(e.target.value)}
          placeholder="Bijv. docent, verpleegkundige, ondernemer"
          className="input-cm text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          {v("namenlijst.aantekeningen")}
        </label>
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          placeholder={v("contact.extra_info")}
          className="textarea-cm text-sm"
          rows={3}
        />
      </div>

      {/* Korte situatie-zin voor 3-weg-script. Apart van de aantekeningen,
          want de [situatie]-placeholder in stap 2 leest dit letterlijk
          terug ("Ze is op zoek naar [situatie]"). Daar wil je geen vrije-
          tekst-aantekeningen, wel een korte natuurlijke zin. */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs text-cm-white opacity-60">
            Situatie (kort, voor 3-weg)
          </label>
          <button
            type="button"
            onClick={vatSamen}
            disabled={aiBezig || !notities.trim()}
            className="text-xs text-cm-gold hover:text-cm-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={
              notities.trim()
                ? "Laat AI een korte zin maken uit je aantekeningen"
                : "Vul eerst aantekeningen in om te kunnen samenvatten"
            }
          >
            {aiBezig ? "✨ bezig..." : "✨ samenvatten uit aantekeningen"}
          </button>
        </div>
        <input
          type="text"
          value={situatieKort}
          onChange={(e) => setSituatieKort(e.target.value)}
          placeholder="bv. meer energie en financiële vrijheid"
          className="input-cm text-sm"
        />
        <p className="text-xs text-cm-white opacity-40 mt-1">
          Wordt gebruikt in 3-weg-script: &quot;Ze/Hij is op zoek naar ...&quot;
        </p>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          {v("contact.prioriteit")}
        </label>
        <select
          value={prioriteit}
          onChange={(e) =>
            setPrioriteit(e.target.value as "hoog" | "normaal" | "laag")
          }
          className="input-cm text-sm"
        >
          <option value="hoog">{v("nieuw.prioriteit.hoog")}</option>
          <option value="normaal">{v("nieuw.prioriteit.normaal")}</option>
          <option value="laag">{v("nieuw.prioriteit.laag")}</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={annuleer}
          className="btn-secondary text-sm flex-1"
          disabled={laden}
        >
          {v("algemeen.annuleren")}
        </button>
        <button
          type="submit"
          disabled={laden}
          className="btn-gold text-sm flex-1"
        >
          {laden ? v("algemeen.laden") : v("algemeen.opslaan")}
        </button>
      </div>
    </form>
  );
}
