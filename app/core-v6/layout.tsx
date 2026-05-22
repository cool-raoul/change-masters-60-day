// File: app/core-v6/layout.tsx
//
// Layout-wrapper voor alle /core-v6/* routes. Voegt CSS-class "core-v6" toe
// die de luchtig-grijze kleurstelling activeert (zie .core-v6 in globals.css).
// Alle Tailwind-utilities die op var(--cm-*) leunen (zoals bg-cm-black,
// text-cm-white, border-cm-border, btn-gold) pakken automatisch deze waarden
// binnen Core V6, terwijl Sprint zijn donkere look behoudt.

export default function CoreV6Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="core-v6 min-h-screen bg-cm-black text-cm-white">
      {children}
    </div>
  );
}
