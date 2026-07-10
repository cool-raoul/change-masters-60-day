// File: app/resetcode-preview/layout.tsx
//
// Layout-wrapper voor de Resetcode-preview: zelfde luchtige
// Core-kleurstelling als de andere founder-previews, ongeacht
// de modus waarin de founder zelf zit.

export default function ResetcodePreviewLayout({
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
