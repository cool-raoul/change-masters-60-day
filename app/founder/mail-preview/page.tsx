// File: app/founder/mail-preview/page.tsx
//
// Founder-only preview van mail-sequences. Drie niveaus uitklapbaar
// (native <details>, geen client-JS):
//   1. de sequence ("Reset-check mail-sequence")
//   2. de mail (1 t/m 5, met onderwerp)
//   3. de variant (A: nog niet in mini-ELEVA / B: al wel binnen)
//
// Nieuwe sequences (andere bots, andere mail-soorten) komen hier als
// extra <SequenceBlok> onder. Verstuurt niets, schrijft niets.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { resetCheckTemplateVoorDag } from "@/lib/reset-check/mails";
import { bouwResetUitkomstMail } from "@/lib/reset-check/uitkomst-mail";
import type { GenericMailInput } from "@/lib/freebie-bots/mail-template-types";

export const dynamic = "force-dynamic";

// Dummy-antwoorden met energie als sterkste signaal, zodat het
// gepersonaliseerde future-self-blok in mail 4 zichtbaar is in de
// preview (zelfde shape als echte bot_antwoorden).
const DUMMY_ANTWOORDEN = {
  voornaam: "Sandra",
  achternaam: "Voorbeeld",
  email: "voorbeeld@my-eleva.com",
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

const DUMMY: Omit<GenericMailInput, "alInMiniEleva"> = {
  leadVoornaam: "Sandra",
  memberVoornaam: "Raoul",
  spiegelTekst: null,
  antwoorden: DUMMY_ANTWOORDEN,
  unsubscribeUrl: "#afmelden-voorbeeld",
  miniElevaUrl: "https://my-eleva.com/m/p-voorbeeldtoken",
};

function VariantBlok({
  label,
  toelichting,
  html,
}: {
  label: string;
  toelichting: string;
  html: string;
}) {
  return (
    <details className="group rounded-lg border border-cm-border bg-cm-surface overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-3 hover:bg-cm-gold/5 transition-colors">
        <span>
          <span className="text-cm-white text-sm font-semibold">{label}</span>
          <span className="text-cm-white/50 text-xs block mt-0.5">
            {toelichting}
          </span>
        </span>
        <span className="text-cm-gold text-xs transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div
        className="border-t border-cm-border bg-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </details>
  );
}

function MailBlok({
  dag,
  onderwerp,
  variantA,
  variantB,
}: {
  dag: number;
  onderwerp: string;
  variantA: string;
  variantB: string;
}) {
  return (
    <details className="group rounded-xl border border-cm-border bg-cm-surface-2 overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-cm-gold/5 transition-colors">
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cm-gold/15 border border-cm-gold/40 text-cm-gold text-sm font-bold flex items-center justify-center">
            {dag}
          </span>
          <span className="min-w-0">
            <span className="text-cm-white text-sm font-semibold block truncate">
              Mail {dag}
            </span>
            <span className="text-cm-white/55 text-xs block truncate">
              Onderwerp: {onderwerp}
            </span>
          </span>
        </span>
        <span className="text-cm-gold text-xs flex-shrink-0 transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="border-t border-cm-border p-3 space-y-2">
        <VariantBlok
          label="Variant A · vol omgeving-blok"
          toelichting="Lead is nog niet in de mini-ELEVA geweest"
          html={variantA}
        />
        <VariantBlok
          label="Variant B · korte verwijzing"
          toelichting="Lead is al binnen geweest"
          html={variantB}
        />
      </div>
    </details>
  );
}

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

  const mails = [1, 2, 3, 4, 5]
    .map((dag) => {
      const template = resetCheckTemplateVoorDag(dag);
      if (!template) return null;
      return {
        dag,
        onderwerp: template.onderwerp,
        variantA: template.bouwHtml({ ...DUMMY, alInMiniEleva: false }),
        variantB: template.bouwHtml({ ...DUMMY, alInMiniEleva: true }),
      };
    })
    .filter(Boolean) as Array<{
    dag: number;
    onderwerp: string;
    variantA: string;
    variantB: string;
  }>;

  // De directe uitkomst-mail die de prospect meteen na het invullen krijgt:
  // een spiegeling van haar scherm, zonder member-intel.
  const uitkomstMail = bouwResetUitkomstMail({
    leadVoornaam: "Sandra",
    antwoorden: DUMMY_ANTWOORDEN,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <header className="space-y-1 pt-2">
        <p className="text-xs tracking-widest uppercase text-cm-gold/80">
          Founder-preview
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-cm-white">
          Mail-preview
        </h1>
        <p className="text-cm-white/60 text-sm leading-relaxed">
          Alle mail-sequences zoals leads ze ontvangen. Klik een sequence
          open, dan een mail, dan een variant. Er wordt hier niets
          verstuurd; echte verzending blijft uit tot de feature-flag aan
          staat.
        </p>
      </header>

      {/* ===== Directe uitkomst-mail (meteen na invullen) ===== */}
      {uitkomstMail && (
        <details className="group rounded-2xl border border-cm-gold/40 bg-cm-surface-2 overflow-hidden" open>
          <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-3 hover:bg-cm-gold/5 transition-colors">
            <span className="flex items-center gap-3">
              <span className="text-2xl">📩</span>
              <span>
                <span className="text-cm-white font-bold block">
                  Directe uitkomst-mail (Reset-check)
                </span>
                <span className="text-cm-white/55 text-xs block mt-0.5">
                  Krijgt de prospect meteen na het invullen · Onderwerp:{" "}
                  {uitkomstMail.onderwerp}
                </span>
              </span>
            </span>
            <span className="text-cm-gold text-sm transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-cm-gold/20 p-4">
            <VariantBlok
              label="Prospect-uitkomst · zoals ze 'm op het scherm zag"
              toelichting="Banner, het verschil dat we zien, uitkomst per thema, inzicht en 4 tips. Geen heat-score, profiel of medische punten."
              html={uitkomstMail.html}
            />
          </div>
        </details>
      )}

      {/* ===== Sequence: Reset-check ===== */}
      <details className="group rounded-2xl border border-cm-gold/40 bg-cm-surface-2 overflow-hidden" open>
        <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-3 hover:bg-cm-gold/5 transition-colors">
          <span className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <span>
              <span className="text-cm-white font-bold block">
                Reset-check mail-sequence
              </span>
              <span className="text-cm-white/55 text-xs block mt-0.5">
                5 mails · verse tip per dag + koopmotief + mini-ELEVA-knop
              </span>
            </span>
          </span>
          <span className="text-cm-gold text-sm transition-transform group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="border-t border-cm-gold/20 p-4 space-y-3">
          {mails.map((m) => (
            <MailBlok
              key={m.dag}
              dag={m.dag}
              onderwerp={m.onderwerp}
              variantA={m.variantA}
              variantB={m.variantB}
            />
          ))}
        </div>
      </details>

      {/* Volgende sequences (Energie & Focus, Hormonen & Overgang, ...)
          komen hier als extra <details>-blokken zodra ze bestaan. */}
    </div>
  );
}
