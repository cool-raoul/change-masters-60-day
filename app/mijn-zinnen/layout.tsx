import { AppShell } from "@/components/layout/AppShell";
export default function MijnZinnenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
