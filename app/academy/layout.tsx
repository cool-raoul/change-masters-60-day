import { AppShell } from "@/components/layout/AppShell";

// Academy zit binnen het normale ELEVA-shell (sidebar, topbar, etc.)
// zodat de member er via de sidebar bij komt en altijd terug kan
// naar dashboard/namenlijst/coach via dezelfde navigatie.

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
