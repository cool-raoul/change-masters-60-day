"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function NieuwProspectPagina() {
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    volledige_naam: "",
    telefoon: "",
    email: "",
    instagram: "",
    facebook: "",
    bron: "warm",
    prioriteit: "normaal",
    notities: "",
    pipeline_fase: "lead",
  });

  function updateVeld(veld: string, waarde: string) {
    setFormData((prev) => ({ ...prev, [veld]: waarde }));
  }

  async function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.volledige_naam.trim()) {
      toast.error("Naam is verplicht");
      return;
    }

    setLaden(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Niet ingelogd");
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
      toast.error("Kon prospect niet opslaan: " + error.message);
    } else {
      toast.success(`${formData.volledige_naam} toegevoegd!`);
      router.push(`/namenlijst/${data.id}`);
    }

    setLaden(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/namenlijst" className="text-cm-muted hover:text-cm-white">
          ← Terug
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            Nieuw Prospect
          </h1>
          <p className="text-cm-muted text-sm">Voeg iemand toe aan je namenlijst</p>
        </div>
      </div>

      <form onSubmit={handleOpslaan} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-cm-muted mb-1.5">
              Volledige naam <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.volledige_naam}
              onChange={(e) => updateVeld("volledige_naam", e.target.value)}
              placeholder="Voor- en achternaam"
              className="input-cm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">Telefoon</label>
            <input
              type="tel"
              value={formData.telefoon}
              onChange={(e) => updateVeld("telefoon", e.target.value)}
              placeholder="+31 6 12345678"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateVeld("email", e.target.value)}
              placeholder="naam@email.nl"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => updateVeld("instagram", e.target.value)}
              placeholder="@gebruikersnaam"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">Facebook</label>
            <input
              type="text"
              value={formData.facebook}
              onChange={(e) => updateVeld("facebook", e.target.value)}
              placeholder="Facebook naam"
              className="input-cm"
            />
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">Bron</label>
            <select
              value={formData.bron}
              onChange={(e) => updateVeld("bron", e.target.value)}
              className="input-cm"
            >
              <option value="warm">Warm contact (ken ik al)</option>
              <option value="social">Social media</option>
              <option value="doorverwijzing">Doorverwijzing</option>
              <option value="koud">Koud contact</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">Prioriteit</label>
            <select
              value={formData.prioriteit}
              onChange={(e) => updateVeld("prioriteit", e.target.value)}
              className="input-cm"
            >
              <option value="hoog">⭐ Hoog</option>
              <option value="normaal">Normaal</option>
              <option value="laag">Laag</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-cm-muted mb-1.5">Pipeline fase</label>
            <select
              value={formData.pipeline_fase}
              onChange={(e) => updateVeld("pipeline_fase", e.target.value)}
              className="input-cm"
            >
              <option value="lead">Lead</option>
              <option value="uitgenodigd">Uitgenodigd</option>
              <option value="presentatie">Presentatie</option>
              <option value="followup">Follow-up</option>
              <option value="klant">Klant</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-cm-muted mb-1.5">Notities</label>
            <textarea
              value={formData.notities}
              onChange={(e) => updateVeld("notities", e.target.value)}
              placeholder="Wat weet je over deze persoon? Wat is hun situatie?"
              className="textarea-cm"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={laden} className="btn-gold flex-1">
            {laden ? "Opslaan..." : "Prospect toevoegen"}
          </button>
          <Link href="/namenlijst" className="btn-secondary px-6 text-center">
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}
