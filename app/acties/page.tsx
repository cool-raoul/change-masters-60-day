import { redirect } from "next/navigation";

// ============================================================
// /acties is gepensioneerd. Vervangen door:
//   - 🎯 Volgende-beste-actie-radar op het dashboard (rijker:
//     gebruikt films, tests, fase, stilte-tijd, niet alleen
//     herinneringen)
//   - 🔔 /herinneringen voor het volledige beheer-overzicht
// ============================================================

export default function ActiesGepensioneerd() {
  redirect("/dashboard");
}
