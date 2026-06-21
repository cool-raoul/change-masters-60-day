import { AppShell } from "@/components/layout/AppShell";

export default function LessenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
