import { ReactNode } from "react";

// ============================================================
// Mini-ELEVA layout, eigen schil zonder de member-app sidebar.
//
// Prospects komen via /m/[token] en zien een aparte, schone omgeving
// die niet aanvoelt als "een tool van de member" maar als een eigen
// welkom-omgeving. Geen sidebar, geen menu naar /dashboard etc.
// ============================================================

export default function MiniElevaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cm-bg text-cm-white">
      <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
