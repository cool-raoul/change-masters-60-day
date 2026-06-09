// File: app/instellingen/reset-check-leads/page.tsx
//
// Founder-admin voor inzendingen via /reset-check (Holistic Reset
// persoonlijke check). Sortering op heat-score (hoogste eerst),
// zodat Raoul en Gaby de warmste leads als eerste kunnen bellen.
//
// Auto-delete na 30 dagen tenzij contact_opgenomen_at is gevuld
// (RLS in migration). Founder kan status/notitie inline bijwerken
// in volgende iteratie. Voor MVP alleen lees-overzicht.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  created_at: string;
  voornaam: string;
  achternaam: string | null;
  email: string;
  telefoon: string | null;
  instagram: string | null;
  facebook: string | null;
  antwoorden: {
    profiel?: {
      geslacht_leeftijd?: string;
      afvalpogingen?: string;
      afvalwens?: string;
      investering?: string;
    };
    medisch?: string[];
    medischVrij?: string;
    scores?: Record<string, number>;
  } | null;
  heat_score: number | null;
  heat_categorie: string | null;
  status: string;
  notitie: string | null;
  contact_opgenomen_at: string | null;
};

const HEAT_KLEUREN: Record<string, string> = {
  heet: "bg-red-500/15 text-red-200 border-red-500/40",
  lauw: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  koel: "bg-blue-500/15 text-blue-200 border-blue-500/40",
  koud: "bg-slate-500/15 text-slate-300 border-slate-500/40",
};

const HEAT_EMOJI: Record<string, string> = {
  heet: "🔥",
  lauw: "🌤",
  koel: "💧",
  koud: "❄️",
};

const AFVAL_LABELS: Record<string, string> = {
  aankomen: "Wil aankomen",
  geen: "Niks",
  "0-5": "0-5 kg",
  "5-10": "5-10 kg",
  "10-20": "10-20 kg",
  "20+": "20+ kg",
};

const INVESTERING_LABELS: Record<string, string> = {
  altijd: "✅ Altijd al",
  misschien: "🤔 Misschien",
  nee: "❌ Nu nog niet",
};

const GESLACHT_LABELS: Record<string, string> = {
  vrouw_35plus: "Vrouw, 35+",
  vrouw_jonger: "Vrouw, <35",
  man: "Man",
  anders: "Niet gezegd",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ResetCheckLeadsPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/instellingen");

  let inzendingen: Submission[] = [];
  try {
    const { data } = await supabase
      .from("reset_check_submissions")
      .select(
        "id, created_at, voornaam, achternaam, email, telefoon, instagram, facebook, antwoorden, heat_score, heat_categorie, status, notitie, contact_opgenomen_at",
      )
      .order("heat_score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200);
    inzendingen = (data ?? []) as Submission[];
  } catch (e) {
    console.error("reset-check-leads error", e);
  }

  const totaal = inzendingen.length;
  const heetCount = inzendingen.filter((i) => i.heat_categorie === "heet").length;
  const lauwCount = inzendingen.filter((i) => i.heat_categorie === "lauw").length;
  const metTelefoon = inzendingen.filter((i) => i.telefoon && i.telefoon.length >= 8).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">🎁 Reset-check leads</h1>
          <p className="text-sm text-slate-400 mt-1">
            Inzendingen via <Link href="/reset-check" className="text-cm-gold underline">/reset-check</Link>,
            gesorteerd op heat-score (hoogste eerst). Auto-delete na 30 dagen.
          </p>
        </div>
        <Link href="/instellingen/freebies" className="text-cm-gold text-sm hover:underline">
          ← Terug naar freebies
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatTegel label="Totaal" waarde={totaal} />
        <StatTegel label="🔥 Heet" waarde={heetCount} klasse="text-red-300" />
        <StatTegel label="🌤 Lauw" waarde={lauwCount} klasse="text-amber-300" />
        <StatTegel label="📱 Met telefoon" waarde={metTelefoon} klasse="text-cm-gold" />
      </div>

      {/* Lijst */}
      {totaal === 0 ? (
        <div className="rounded-md border border-slate-700 bg-slate-900/40 p-8 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-slate-400">
            Nog geen inzendingen. Zodra mensen <code className="bg-slate-800 px-1">/reset-check</code> invullen verschijnen ze hier.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inzendingen.map((i) => (
            <LeadKaart key={i.id} lead={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function StatTegel({ label, waarde, klasse }: { label: string; waarde: number; klasse?: string }) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${klasse ?? "text-slate-100"}`}>{waarde}</div>
    </div>
  );
}

function LeadKaart({ lead }: { lead: Submission }) {
  const p = lead.antwoorden?.profiel ?? {};
  const medisch = lead.antwoorden?.medisch ?? [];
  const heeftMedisch = medisch.filter((s) => s !== "geen").length > 0;
  const isZwanger = medisch.includes("zwanger");
  const heatKleur = lead.heat_categorie ? HEAT_KLEUREN[lead.heat_categorie] : HEAT_KLEUREN.koud;
  const heatEmoji = lead.heat_categorie ? HEAT_EMOJI[lead.heat_categorie] : "";

  const whatsappUrl = lead.telefoon
    ? `https://wa.me/${lead.telefoon.replace(/[^0-9]/g, "").replace(/^0/, "31")}`
    : null;

  return (
    <article className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-base font-medium">
            {lead.voornaam} {lead.achternaam ?? ""}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${heatKleur}`}>
            {heatEmoji} {lead.heat_categorie ?? "?"} ({lead.heat_score ?? "?"})
          </span>
          {isZwanger && (
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border bg-pink-500/15 text-pink-200 border-pink-500/40">
              🌷 Zwanger / bv
            </span>
          )}
          {heeftMedisch && !isZwanger && (
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border bg-orange-500/15 text-orange-200 border-orange-500/40">
              ⚕️ Medisch ({medisch.length})
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400">{formatDate(lead.created_at)}</div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <Info label="E-mail" waarde={<a href={`mailto:${lead.email}`} className="text-cm-gold hover:underline break-all">{lead.email}</a>} />
        <Info
          label="Telefoon"
          waarde={
            lead.telefoon ? (
              <span className="flex items-center gap-2">
                <span>{lead.telefoon}</span>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener" className="text-green-300 hover:underline">
                    💬 WA
                  </a>
                )}
              </span>
            ) : (
              <span className="text-slate-500 italic">geen nummer</span>
            )
          }
        />
        <Info
          label="Socials"
          waarde={
            <span className="text-slate-300">
              {lead.instagram && <span className="block">📸 {lead.instagram}</span>}
              {lead.facebook && <span className="block">📘 {lead.facebook}</span>}
              {!lead.instagram && !lead.facebook && (
                <span className="text-slate-500 italic">niet ingevuld</span>
              )}
            </span>
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Info label="Profiel" waarde={GESLACHT_LABELS[p.geslacht_leeftijd ?? ""] ?? "?"} />
        <Info label="Afval-wens" waarde={AFVAL_LABELS[p.afvalwens ?? ""] ?? "?"} />
        <Info label="Investering" waarde={INVESTERING_LABELS[p.investering ?? ""] ?? "?"} />
        <Info label="Afval-pogingen" waarde={p.afvalpogingen ?? "?"} />
      </div>

      {heeftMedisch && (
        <div className="mt-3 rounded-md bg-orange-500/5 border border-orange-500/30 p-2 text-xs">
          <div className="font-bold text-orange-200 mb-1">Medische punten</div>
          <div className="text-orange-100/80">
            {medisch.filter((s) => s !== "geen").join(", ")}
          </div>
          {lead.antwoorden?.medischVrij && (
            <div className="mt-2 italic text-orange-100/70">&quot;{lead.antwoorden.medischVrij}&quot;</div>
          )}
        </div>
      )}
    </article>
  );
}

function Info({ label, waarde }: { label: string; waarde: React.ReactNode }) {
  return (
    <div>
      <div className="text-slate-500 uppercase tracking-wider text-[10px]">{label}</div>
      <div className="text-slate-200 mt-0.5">{waarde}</div>
    </div>
  );
}
