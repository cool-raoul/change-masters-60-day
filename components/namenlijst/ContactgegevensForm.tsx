"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Prospect } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  prospect: Prospect;
}

export function ContactgegevensForm({ prospect }: Props) {
  const [bewerkModus, setBewerkModus] = useState(false);
  const [laden, setLaden] = useState(false);
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
      toast.error("Kon wijzigingen niet opslaan");
    } else {
      toast.success("Contactgegevens bijgewerkt");
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
            Contactgegevens
          </h2>
          <button
            onClick={() => setBewerkModus(true)}
            className="text-cm-gold text-xs hover:text-cm-gold-light transition-colors"
          >
            ✏️ Bewerken
          </button>
        </div>

        {prospect.telefoon && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Telefoon</p>
            <p className="text-cm-white text-sm">{prospect.telefoon}</p>
          </div>
        )}
        {prospect.email && (
          <div>
            <p className="text-xs text-cm-white opacity-60">E-mail</p>
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
            <p className="text-xs text-cm-white opacity-60">Bron</p>
            <p className="text-cm-white text-sm capitalize">{prospect.bron}</p>
          </div>
        )}
        {prospect.notities && (
          <div>
            <p className="text-xs text-cm-white opacity-60">Notities</p>
            <p className="text-cm-white text-sm">{prospect.notities}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-cm-white opacity-60">Prioriteit</p>
          <p className="text-cm-white text-sm capitalize">{prospect.prioriteit}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={slaOp} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          Contactgegevens bewerken
        </h2>
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Volledige naam
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
          E-mail
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
          Notities
        </label>
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          placeholder="Extra informatie over dit contact..."
          className="textarea-cm text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-xs text-cm-white opacity-60 mb-1">
          Prioriteit
        </label>
        <select
          value={prioriteit}
          onChange={(e) =>
            setPrioriteit(e.target.value as "hoog" | "normaal" | "laag")
          }
          className="input-cm text-sm"
        >
          <option value="hoog">⭐ Hoog</option>
          <option value="normaal">Normaal</option>
          <option value="laag">Laag</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={annuleer}
          className="btn-secondary text-sm flex-1"
          disabled={laden}
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={laden}
          className="btn-gold text-sm flex-1"
        >
          {laden ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </form>
  );
}
