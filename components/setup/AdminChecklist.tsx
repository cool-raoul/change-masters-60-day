"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

type Props = {
  beginVoltooiingen: Record<string, boolean>;
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function AdminChecklist({ beginVoltooiingen, isFounder, overrides }: Props) {
  const [voltooid, setVoltooid] = useState<Record<string, boolean>>(beginVoltooiingen);
  const [bezig, setBezig] = useState<string | null>(null);
  const router = useRouter();

  async function afvinken(slug: string) {
    setBezig(slug);
    const r = await fetch("/api/setup/markeer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setBezig(null);
    if (!r.ok) {
      toast.error("Niet gelukt om af te vinken, probeer 'm zo nog eens.");
      return;
    }
    setVoltooid((v) => ({ ...v, [slug]: true }));
    toast.success("Afgevinkt");
    router.refresh();
  }

  const aantalOpen = ADMIN_ITEMS.filter((it) => !voltooid[it.slug]).length;

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-cm-gold">
        <EditableTekst
          namespace="setup-admin"
          sleutel="header.titel"
          standaard="Eenmalige admin-stappen"
          overrides={overrides}
          isFounder={isFounder}
          as="h1"
          className="text-2xl font-display font-bold text-cm-white mb-2"
        />
        <EditableBlok
          namespace="setup-admin"
          sleutel="header.uitleg"
          standaard="Vijf stappen die je één keer doet en daarna nooit meer. Advies: doe ze binnen drie dagen, ze zijn nodig voor de rest van je traject. Heb je 'm al in een andere modus afgevinkt? Dan staat hij hier vanzelf groen."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          rows={3}
        />
        {aantalOpen > 0 ? (
          <p className="text-cm-gold text-sm font-semibold mt-3">
            Nog {aantalOpen} stap{aantalOpen === 1 ? "" : "pen"} open
          </p>
        ) : (
          <p className="text-emerald-300 text-sm font-semibold mt-3">
            ✓ Alle admin-stappen afgevinkt
          </p>
        )}
      </div>

      {ADMIN_ITEMS.map((item) => {
        const isAf = !!voltooid[item.slug];
        return (
          <div
            key={item.slug}
            className={`card border-l-4 transition-colors ${
              isAf ? "border-emerald-500/60 opacity-60" : "border-cm-gold/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.emoji}</span>
                <EditableTekst
                  namespace="setup-admin"
                  sleutel={`${item.slug}.titel`}
                  standaard={item.titel}
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h3"
                  className="text-lg font-semibold text-cm-white"
                />
              </div>
              {isAf && (
                <span className="text-xs bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 px-2 py-1 rounded-full">
                  ✓ Gedaan
                </span>
              )}
            </div>
            <EditableBlok
              namespace="setup-admin"
              sleutel={`${item.slug}.uitleg`}
              standaard={item.uitleg}
              overrides={overrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white text-sm opacity-80 leading-relaxed mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              {item.route && (
                <a
                  href={item.route}
                  className="text-sm bg-cm-surface border border-cm-border text-cm-white px-3 py-2 rounded-lg"
                >
                  Open uitleg
                </a>
              )}
              {!isAf && (
                <button
                  onClick={() => afvinken(item.slug)}
                  disabled={bezig === item.slug}
                  className="btn-gold text-sm px-3 py-2 disabled:opacity-50"
                >
                  {bezig === item.slug ? "Bezig..." : "Markeer als gedaan"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
