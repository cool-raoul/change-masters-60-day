// File: app/lanceer-reis/layout.tsx
//
// Layout-wrapper voor de lanceer-reis-preview: zelfde luchtige
// Core-kleurstelling als de live Core, ook als de founder zelf
// in een andere modus zit.

export default function LanceerReisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="modus-core min-h-screen bg-cm-black text-cm-white">
      {children}
    </div>
  );
}
