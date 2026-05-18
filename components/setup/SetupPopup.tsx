"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

// ============================================================
// SetupPopup, niet-blokkerende dialog op /vandaag.
//
// Verschijnt 1× per dag zolang er nog admin-rail items openstaan.
// LocalStorage onthoudt de dismiss-datum. Verdwijnt automatisch
// zodra alle 5 admin-items afgevinkt zijn (geen klaar-pop-up).
// ============================================================

type Props = {
  aantalOpen: number;
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function SetupPopup({ aantalOpen, isFounder, overrides }: Props) {
  const [zichtbaar, setZichtbaar] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (aantalOpen === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const dismissed = localStorage.getItem("setup_popup_dismissed");
    if (dismissed === today) return;
    setZichtbaar(true);
  }, [aantalOpen]);

  function later() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("setup_popup_dismissed", today);
    setZichtbaar(false);
  }

  function openSetup() {
    setZichtbaar(false);
    router.push("/setup");
  }

  if (!zichtbaar || aantalOpen === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-cm-surface border-2 border-cm-gold rounded-xl p-6 max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <EditableTekst
            namespace="setup-popup"
            sleutel="titel"
            standaard={`Je hebt nog ${aantalOpen} admin-stap${aantalOpen === 1 ? "" : "pen"} openstaan`}
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-xl font-display font-bold text-cm-white"
          />
        </div>
        <EditableBlok
          namespace="setup-popup"
          sleutel="body"
          standaard="Doe ze binnen drie dagen, ze zijn nodig voor de rest van je traject. Webshop, kredietformulier, teams-admin, bestellinks en productadvies-test."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm leading-relaxed opacity-90 text-center"
          rows={3}
        />
        <div className="flex flex-col gap-2 pt-2">
          <button onClick={openSetup} className="btn-gold py-3 font-semibold">
            <EditableTekst
              namespace="setup-popup"
              sleutel="cta_open"
              standaard="Open admin-checklist"
              overrides={overrides}
              isFounder={isFounder}
              as="span"
            />
          </button>
          <button
            onClick={later}
            className="py-2 text-cm-white text-sm opacity-70 hover:opacity-100"
          >
            <EditableTekst
              namespace="setup-popup"
              sleutel="cta_later"
              standaard="Later vandaag"
              overrides={overrides}
              isFounder={isFounder}
              as="span"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
