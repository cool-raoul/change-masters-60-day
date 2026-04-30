"use client";

import { useEffect } from "react";
import Link from "next/link";

// ============================================================
// Error boundary voor /instellingen/playbook. Vangt eventuele
// crashes in de editor op zodat de founder een nette boodschap
// + reset-knop krijgt i.p.v. een lege zwarte pagina.
// ============================================================

export default function PlaybookEditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Playbook-editor error:", error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/instellingen" className="btn-secondary text-sm">
        ← Terug naar instellingen
      </Link>
      <div className="card border-l-4 border-red-500 space-y-3">
        <h1 className="text-cm-white font-display font-bold text-lg">
          ⚠️ Er ging iets mis in de playbook-editor
        </h1>
        <p className="text-cm-white text-sm leading-relaxed">
          {error.message || "Onbekende fout"}
        </p>
        {error.digest && (
          <p className="text-cm-white text-xs opacity-50">
            Foutcode: <code>{error.digest}</code>
          </p>
        )}
        <div className="flex gap-2 flex-wrap pt-2">
          <button onClick={reset} className="btn-gold text-sm">
            Probeer opnieuw
          </button>
          <Link href="/dashboard" className="btn-secondary text-sm">
            Naar dashboard
          </Link>
        </div>
        <div className="border-t border-cm-border pt-3 mt-3">
          <p className="text-cm-white text-xs opacity-70 leading-relaxed">
            <strong>Mogelijke oorzaak:</strong> de SQL-migratie{" "}
            <code className="text-xs bg-cm-surface-2 px-1 rounded">
              playbook_overrides.sql
            </code>{" "}
            is nog niet gedraaid. Voer 'm uit in de Supabase SQL Editor en
            probeer opnieuw.
          </p>
        </div>
      </div>
    </div>
  );
}
