// /welkom-keuze gebruikt geen AppShell meer per 2026-05-19.
// Reden: nieuwe gebruiker heeft nog geen modus gekozen, dus de sidebar
// (Dashboard, Mentor, Namenlijst etc) is misleidend en de Topbar zou
// "Dag 1 van 60" tonen wat ook niet klopt. Full-screen flow zoals
// /vandaag en /onboarding.

export default function WelkomKeuzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cm-black">{children}</div>;
}
