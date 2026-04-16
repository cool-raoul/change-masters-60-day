"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Prospect } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTaal } from "@/lib/i18n/TaalContext";

interface Props {
  prospect: Prospect;
}

export function ContactgegevensForm({ prospect }: Props) {
  const { v } = useTaal();
  const [bewerkModus, setBewerkModus] = useState(false);
  const [laden, setLaden] = useState(false);
  const [notitiesOpen, setNotitiesOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [volledigeNaam, setVolledigeNaam] = useState(prospect.volledige_naam);
  const [telefoon, setTelefoon] = useState(prospect.telefoon || "");
  const [email, setEmail] = useState(prospect.email || "");
  const [instagram, setInstagram] = useState(prospect.instagram || "");
  const [facebook, setFacebook] = useState(prospect.facebook || "");
  const [notities, setNotities] = useState(prospect.notities || "");
  const [prioriteit, setPrioriteit] = useState<"hoog" | "normaal" | "laag">(
    prospect.prioriteit
  );

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
        notities: notities || null,
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
    setNotities(prospect.notities || "");
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
            <p className="text-xs text-cm-white opacity-60">{v("registreer.naam")}</p>
            <p className="text-cm-white text-sm">{prospect.telefoon}</p>
          </div>
        )}
        {prospect.email && (
          <div>
            <p className="text-xs text-cm-white opacity-60">{v("registreer.email")}</p>
            <p className="text-cm-white text-sm">{prospect.email}</p>
          </div>
        )}
        {prospect.instagram && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Instagram</p>
            <p className="text-cm-white text-sm">{prospect.instagram}</p>
          </div>
        )}
        {prospect.facebook && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Facebook</p>
            <p className="text-cm-white text-sm">{prospect.facebook}</p>
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
            <button
              onClick={() => setNotitiesOpen((o) => !o)}
              className="w-full flex items-center justify-between text-left group"
            >
              <p className="text-xs text-cm-white opacity-60 group-hover:opacity-90 transition-opacity">
                {v("namenlijst.aantekeningen")}
              </p>
              <span className={`text-cm-gold text-sm transition-transform duration-200 ${notitiesOpen ? "rotate-180" : ""}`}>
                ⌄
              </span>
            </button>
            {notitiesOpen && (
              <p className="text-cm-white text-sm mt-1 whitespace-pre-wrap">{prospect.notities}</p>
            )}
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
        <input
          type="tel"
          value={telefoon}
          onChange={(e) => setTelefoon(e.target.value)}
          placeholder="+31 6 12345678"
          className="input-cm text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          {v("registreer.email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@email.nl"
          className="input-cm text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Instagram
        </label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@gebruikersnaam"
          className="input-cm text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Facebook
        </label>
        <input
          type="text"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="Naam of URL"
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
