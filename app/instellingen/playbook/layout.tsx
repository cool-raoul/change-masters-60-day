import { AppShell } from "@/components/layout/AppShell";
export default function PlaybookEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
