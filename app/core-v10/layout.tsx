// File: app/core-v10/layout.tsx
//
// Layout-wrapper voor alle /core-v10/* preview-routes. Voegt de
// "modus-core" CSS-class toe zodat de preview dezelfde luchtige
// Core-kleurstelling krijgt als de live Core (zie globals.css),
// ook als de founder zelf in een andere modus zit.

export default function CoreV10Layout({
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
