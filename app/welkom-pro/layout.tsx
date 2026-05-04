import { AppShell } from "@/components/layout/AppShell";

export default function WelkomProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
