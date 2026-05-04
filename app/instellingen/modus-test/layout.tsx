// /instellingen/modus-test gebruikt de AppShell van de bovenliggende
// /instellingen/layout.tsx, dus geen extra layout nodig hier.
// Dit bestand is alleen aanwezig om te documenteren dat de sidebar werkt
// via overerving uit de instellingen-layout.

export default function ModusTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
