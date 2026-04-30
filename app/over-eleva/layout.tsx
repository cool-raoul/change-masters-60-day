import { AppShell } from "@/components/layout/AppShell";

export default function OverElevaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
