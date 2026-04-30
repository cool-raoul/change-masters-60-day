// /instellingen erft al een AppShell-layout van zijn parent (zie
// app/instellingen/layout.tsx). Daar geen tweede AppShell omheen
// zetten — anders dubbele Sidebar/Topbar/redirects en crash.
export default function PlaybookEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
