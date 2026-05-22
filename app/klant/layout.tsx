// File: app/klant/layout.tsx
//
// Layout voor de klantomgeving-routes. Voor pilot is dit een eenvoudige
// shell zonder eigen branding. Later: aparte branding voor klant-rol-Mentor.

export default function KlantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="mx-auto max-w-4xl text-sm text-slate-400">
          👥 Mijn klanten
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
