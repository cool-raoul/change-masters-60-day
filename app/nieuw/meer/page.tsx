// Meer: alles wat je af en toe nodig hebt, gegroepeerd en twee tikken diep.
// Founder-gereedschap alleen zichtbaar voor founders, netjes bij elkaar.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NieuweLayoutToggle } from "@/components/layout/NieuweLayoutToggle";

export const dynamic = "force-dynamic";

type Item = { emoji: string; label: string; sub?: string; href: string };

const BUSINESS: Item[] = [
  { emoji: "🎁", label: "Mijn freebies", sub: "je deel-links, films en teksten", href: "/instellingen/mijn-tracking-links" },
  { emoji: "📊", label: "Statistieken", sub: "je cijfers per dag en week", href: "/statistieken" },
  { emoji: "🌟", label: "Premium", href: "/premium" },
];

const ACCOUNT: Item[] = [
  { emoji: "👤", label: "Profiel & instellingen", sub: "foto, tempo, route, taal, meldingen", href: "/instellingen" },
  { emoji: "🧠", label: "Wat de Mentor over je weet", href: "/instellingen/mentor-profiel" },
  { emoji: "🔒", label: "Wat ziet mijn sponsor", href: "/instellingen/wat-ziet-mijn-sponsor" },
  { emoji: "🛠️", label: "Administratieve stappen", sub: "webshop, bestellinks, teams", href: "/setup" },
  { emoji: "💡", label: "Over ELEVA", href: "/over-eleva" },
];

const FOUNDER: Item[] = [
  { emoji: "🎬", label: "Films-beheer", href: "/instellingen/films" },
  { emoji: "🎓", label: "Mentor trainen", href: "/instellingen/mentor-trainen" },
  { emoji: "📝", label: "Mijn aanpassingen (teksten)", href: "/instellingen/tekst-overrides" },
  { emoji: "💊", label: "Mentor product-kennis", href: "/instellingen/mentor-kennis" },
  { emoji: "🪴", label: "Mini-ELEVA beheren", href: "/instellingen/mini-eleva-preview" },
  { emoji: "🎙️", label: "Spraak naar Mentor", href: "/founder/spraak-mentor" },
  { emoji: "🧪", label: "Modus-test", href: "/instellingen/modus-test" },
  { emoji: "🚀", label: "Lanceer-reis preview", sub: "de nieuwe 30/40-dagen-opzet", href: "/lanceer-reis" },
  { emoji: "🔭", label: "Core 2.0 preview (oud)", href: "/core-v10" },
  { emoji: "📧", label: "Mail-preview", href: "/founder/mail-preview" },
  { emoji: "🩺", label: "Diagnose", href: "/diagnose" },
];

function Groep({ titel, items }: { titel: string; items: Item[] }) {
  return (
    <div className="card">
      <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-cm-white/50 mb-1.5">
        {titel}
      </p>
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-b-0 text-sm text-cm-white hover:text-cm-gold transition-colors"
        >
          <span className="w-5 text-center">{i.emoji}</span>
          <span>{i.label}</span>
          {i.sub && (
            <span className="ml-auto text-xs text-cm-white/40 text-right">
              {i.sub}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

export default async function NieuwMeer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isFounder = false;
  let layoutAan = false;
  if (user) {
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role, nieuwe_layout")
      .eq("id", user.id)
      .maybeSingle();
    const p = profiel as {
      role?: string | null;
      nieuwe_layout?: boolean | null;
    } | null;
    isFounder = p?.role === "founder";
    layoutAan = p?.nieuwe_layout === true;
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-baseline gap-3 border-b border-cm-gold/20 pb-4">
        <h1 className="font-serif-warm text-2xl text-cm-white">⚙️ Meer</h1>
        <span className="ml-auto text-xs text-cm-white/50">
          alles bereikbaar, niets opdringerig
        </span>
      </div>
      <div className="card border-cm-gold/40 bg-cm-gold/5 flex items-center gap-4 flex-wrap">
        <p className="text-sm text-cm-white flex-1 min-w-[200px]">
          {layoutAan
            ? "✨ De nieuwe layout staat aan voor jouw account. Terug naar de oude kan altijd."
            : "✨ Zet de nieuwe layout aan voor je hele account (alleen jij ziet dit)."}
        </p>
        <NieuweLayoutToggle aan={layoutAan} />
      </div>
      <Groep titel="Voor je business" items={BUSINESS} />
      <Groep titel="Jouw account" items={ACCOUNT} />
      {isFounder && <Groep titel="Founder-gereedschap 👑" items={FOUNDER} />}
    </div>
  );
}
