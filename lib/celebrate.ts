// ============================================================
// celebrate(), helper om een confetti-celebration af te vuren vanaf
// elke client-component. Werkt via een custom event dat de
// CelebrationLayer (in AppShell) opvangt.
//
// Gebruik:
//   import { celebrate } from "@/lib/celebrate";
//   celebrate();           // mini-confetti (default)
//   celebrate("groot");    // grote confetti (mijlpaal)
//
// No-op tijdens SSR (window-check).
// ============================================================

export function celebrate(intensiteit: "klein" | "groot" = "klein") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("eleva-celebrate", { detail: { intensiteit } }),
  );
}
