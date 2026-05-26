// File: app/core-v9/layout.tsx
//
// Layout-wrapper voor alle /core-v9/* routes. Voegt CSS-class "core-v9" toe
// die de luchtig-grijze kleurstelling activeert (zie .core-v9 in globals.css).
// Alle Tailwind-utilities die op var(--cm-*) leunen (zoals bg-cm-black,
// text-cm-white, border-cm-border, btn-gold) pakken automatisch deze waarden
// binnen Core V6, terwijl Sprint zijn donkere look behoudt.

export default function CoreV9Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="core-v9 min-h-screen bg-cm-black text-cm-white">
      {children}
    </div>
  );
}
