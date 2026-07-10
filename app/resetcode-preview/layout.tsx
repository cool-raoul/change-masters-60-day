// File: app/resetcode-preview/layout.tsx
//
// Layout-wrapper voor de Resetcode-klantomgeving: bewust een
// EIGEN frisse, lichte look (crème + programma-kleuren), los
// van de donkere member-app. Feedback Raoul 10 juli: de
// klantomgeving mag hipper en out-of-the-box.

export default function ResetcodePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-stone-800"
      style={{ backgroundColor: "#FAF6EF" }}
    >
      {children}
    </div>
  );
}
