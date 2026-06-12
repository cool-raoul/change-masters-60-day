// File: app/founder/mail-preview/page.tsx
//
// Founder-only preview van de Reset-check mail-sequence. Rendert alle
// 5 mails server-side met dummy-data, in beide varianten (lead nog
// niet / al wel in mini-ELEVA geweest), zodat Raoul de mails kan ZIEN
// voordat de feature-flag aan gaat.
//
// Verstuurt niets, schrijft niets. Puur kijken.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { resetCheckTemplateVoorDag } from "@/lib/reset-check/mails";

export const dynamic = "force-dynamic";

// Dummy-antwoorden met energie als sterkste signaal, zodat het
// gepersonaliseerde future-self-blok in mail 4 zichtbaar is in de
// preview (zelfde shape als echte bot_antwoorden).
const DUMMY_ANTWOORDEN = {
  voornaam: "Sandra",
  achternaam: "Voorbeeld",
  email: "voorbeeld@eleva.app",
  instagram: "",
  facebook: "",
  telefoon: "",
  scores: {
    spijsvertering: 1,
    stoelgang: 0,
    darmcomfort: 1,
    gewichtsgevoel: 1,
    eetpatroon: 1,
    energie_dag: 3,
    energie_avond: 3,
    slaap: 1,
    voeding_bewust: 1,
    intentie: 2,
  },
  profiel: {
    geslacht_leeftijd: "vrouw_35plus",
    investering: "misschien",
  },
  medisch: [],
  medischVrij: "",
};

const DUMMY = {
  leadVoornaam: "Sandra",
  memberVoornaam: "Raoul",
  spiegelTekst: null,
  antwoorden: DUMMY_ANTWOORDEN,
  unsubscribeUrl: "#afmelden-voorbeeld",
  miniElevaUrl: "https://voorbeeld.eleva.app/m/p-voorbeeldtoken",
};

export default async function MailPreviewPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profiel as { role?: string } | null)?.role !== "founder") {
    redirect("/dashboard");
  }

  const dagen = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <header className="space-y-1 pt-2">
        <p className="text-xs tracking-widest uppercase text-cm-gold/80">
          Founder-preview
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-cm-white">
          Reset-check mail-sequence
        </h1>
        <p className="text-cm-white/60 text-sm leading-relaxed">
          Alle 5 mails zoals een lead ze ontvangt. Per mail twee varianten:
          de lead is nog niet in de mini-ELEVA geweest (vol introductie-blok)
          of al wel (korte verwijzing). Er wordt hier niets verstuurd; de
          echte verzending blijft uit tot de feature-flag aan staat.
        </p>
      </header>

      {dagen.map((dag) => {
        const template = resetCheckTemplateVoorDag(dag);
        if (!template) return null;
        const nogNiet = template.bouwHtml({
          ...DUMMY,
          alInMiniEleva: false,
        });
        const alWel = template.bouwHtml({
          ...DUMMY,
          alInMiniEleva: true,
        });
        return (
          <section key={dag} className="space-y-4">
            <div className="border-b border-cm-gold/30 pb-2">
              <h2 className="text-cm-gold font-bold text-lg">
                Mail {dag} · onderwerp: {template.onderwerp}
              </h2>
            </div>
            <div className="space-y-2">
              <p className="text-cm-white/70 text-xs font-semibold uppercase tracking-wider">
                Variant A · lead was nog niet in mini-ELEVA
              </p>
              <div
                className="rounded-xl overflow-hidden border border-cm-border bg-white"
                dangerouslySetInnerHTML={{ __html: nogNiet }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-cm-white/70 text-xs font-semibold uppercase tracking-wider">
                Variant B · lead is al binnen geweest
              </p>
              <div
                className="rounded-xl overflow-hidden border border-cm-border bg-white"
                dangerouslySetInnerHTML={{ __html: alWel }}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
