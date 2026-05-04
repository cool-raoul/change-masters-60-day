import { AppShell } from "@/components/layout/AppShell";

export default function WelkomKeuzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
