// File: app/k/layout.tsx
//
// Kale, donkere wrapper voor de klant-links: geen sidebar, geen
// app-navigatie. De klant ziet alleen de Mentor-wereld.

export default function KlantLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1512" }}>
      {children}
    </div>
  );
}
