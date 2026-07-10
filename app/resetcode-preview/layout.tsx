// File: app/resetcode-preview/layout.tsx
//
// Layout-wrapper voor de Mentor-wereld (richting D): diepe
// warme groentint, de chat vult het scherm. De brainstorm-
// pagina zet zijn eigen lichte achtergrond.

export default function ResetcodePreviewLayout({
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
