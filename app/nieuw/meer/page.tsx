// Meer: alles wat je af en toe nodig hebt, gegroepeerd en twee tikken diep.
// Founder-gereedschap alleen zichtbaar voor founders, netjes bij elkaar.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
  { emoji: "🧪", label: "Modus-test", href: "/instellingen/modus-test" },
  { emoji: "🚀", label: "Core 2.0 preview", href: "/core-v10" },
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
  if (user) {
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isFounder = (profiel as { role?: string | null } | null)?.role === "founder";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3 border-b border-cm-gold/20 pb-4">
        <h1 className="font-serif-warm text-2xl text-cm-white">⚙️ Meer</h1>
        <span className="ml-auto text-xs text-cm-white/50">
          alles bereikbaar, niets opdringerig
        </span>
      </div>
      <Groep titel="Voor je business" items={BUSINESS} />
      <Groep titel="Jouw account" items={ACCOUNT} />
      {isFounder && <Groep titel="Founder-gereedschap 👑" items={FOUNDER} />}
    </div>
  );
}
