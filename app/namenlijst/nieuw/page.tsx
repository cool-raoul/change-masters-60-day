"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";

export default function NieuwProspectPagina() {
  const { v } = useTaal();
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    volledige_naam: "",
    telefoon: "",
    email: "",
    instagram: "",
    facebook: "",
    beroep: "",
    bron: "warm",
    prioriteit: "normaal",
    notities: "",
    pipeline_fase: "prospect",
  });

  function updateVeld(veld: string, waarde: string) {
    setFormData((prev) => ({ ...prev, [veld]: waarde }));
  }

  async function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.volledige_naam.trim()) {
      toast.error(v("nieuw.naam_verplicht"));
      return;
    }

    setLaden(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error(v("nieuw.niet_ingelogd"));
      return;
    }

    const { data, error } = await supabase
      .from("prospects")
      .insert({
        user_id: user.id,
        ...formData,
      })
      .select()
      .single();

    if (error) {
      toast.error(v("nieuw.fout") + ": " + error.message);
    } else {
      toast.success(`${formData.volledige_naam} ${v("nieuw.toegevoegd")}`);
      router.push(`/namenlijst/${data.id}`);
    }

    setLaden(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/namenlijst" className="text-cm-white hover:text-cm-white">
          {v("algemeen.terug")}
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            {v("nieuw.titel")}
          </h1>
          <p className="text-cm-white text-sm">{v("nieuw.subtitel")}</p>
        </div>
      </div>

      <form onSubmit={handleOpslaan} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-cm-white mb-1.5">
              {v("nieuw.naam")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.volledige_naam}
              onChange={(e) => updateVeld("volledige_naam", e.target.value)}
              placeholder={v("nieuw.naam_placeholder")}
              className="input-cm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">{v("algemeen.telefoon")}</label>
            <input
              type="tel"
              value={formData.telefoon}
              onChange={(e) => updateVeld("telefoon", e.target.value)}
              placeholder="+31 6 12345678"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">{v("registreer.email")}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateVeld("email", e.target.value)}
              placeholder="naam@email.nl"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => updateVeld("instagram", e.target.value)}
              placeholder="@gebruikersnaam"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">Facebook</label>
            <input
              type="text"
              value={formData.facebook}
              onChange={(e) => updateVeld("facebook", e.target.value)}
              placeholder="Facebook naam"
              className="input-cm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-cm-white mb-1.5">Beroep</label>
            <input
              type="text"
              value={formData.beroep}
              onChange={(e) => updateVeld("beroep", e.target.value)}
              placeholder="Bijv. docent, verpleegkundige, ondernemer"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">{v("nieuw.bron")}</label>
            <select
              value={formData.bron}
              onChange={(e) => updateVeld("bron", e.target.value)}
              className="input-cm"
            >
              <option value="warm">{v("nieuw.bron.warm")}</option>
              <option value="social">{v("nieuw.bron.social")}</option>
              <option value="doorverwijzing">{v("nieuw.bron.doorverwijzing")}</option>
              <option value="koud">{v("nieuw.bron.koud")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">{v("nieuw.prioriteit")}</label>
            <select
              value={formData.prioriteit}
              onChange={(e) => updateVeld("prioriteit", e.target.value)}
              className="input-cm"
            >
              <option value="hoog">{v("nieuw.prioriteit.hoog")}</option>
              <option value="normaal">{v("nieuw.prioriteit.normaal")}</option>
              <option value="laag">{v("nieuw.prioriteit.laag")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-cm-white mb-1.5">{v("nieuw.pipeline_fase")}</label>
            <select
              value={formData.pipeline_fase}
              onChange={(e) => updateVeld("pipeline_fase", e.target.value)}
              className="input-cm"
            >
              <option value="prospect">{v("fase.prospect")}</option>
              <option value="uitgenodigd">{v("fase.uitgenodigd")}</option>
              <option value="one_pager">{v("fase.one_pager")}</option>
              <option value="presentatie">{v("fase.presentatie")}</option>
              <option value="followup">{v("fase.followup")}</option>
              <option value="member">{v("fase.member")}</option>
              <option value="shopper">{v("fase.shopper")}</option>
              <option value="not_yet">{v("fase.not_yet")}</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-cm-white mb-1.5">{v("nieuw.notities")}</label>
            <textarea
              value={formData.notities}
              onChange={(e) => updateVeld("notities", e.target.value)}
              placeholder={v("nieuw.notities_placeholder")}
              className="textarea-cm"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={laden} className="btn-gold flex-1">
            {laden ? v("algemeen.laden") : v("nieuw.toevoegen")}
          </button>
          <Link href="/namenlijst" className="btn-secondary px-6 text-center">
            {v("algemeen.annuleren")}
          </Link>
        </div>
      </form>
    </div>
  );
}
