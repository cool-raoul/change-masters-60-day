"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// RealtimeProspectsRefresh — abonneert op alle wijzigingen aan prospects,
// herinneringen, contact_logs en productadvies_tests van de huidige user
// en triggert router.refresh() zodra er iets verandert. Daarmee zien
// pagina's die deze component mounten (namenlijst, prospect-detail) live
// updates uit ALLE bronnen — voice-FAB, prospect-form, ProspectActieForm,
// drag-drop, productadvies-vragenlijst-submit, push-getriggerde reminders,
// auto-cron — zonder dat we elke mutatie-bron afzonderlijk hoeven te
// koppelen.
//
// Debounce ~250ms zodat een stortvloed van wijzigingen (bv. 10 acties
// uit één voice-commando) niet 10× refresh triggert.
// ============================================================

export function RealtimeProspectsRefresh({ userId }: { userId: string }) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function planRefresh() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        router.refresh();
      }, 250);
    }

    const channel = supabase
      .channel(`prospects-live-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prospects",
          filter: `user_id=eq.${userId}`,
        },
        planRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "herinneringen",
          filter: `user_id=eq.${userId}`,
        },
        planRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_logs",
          filter: `user_id=eq.${userId}`,
        },
        planRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "productadvies_tests",
          filter: `member_id=eq.${userId}`,
        },
        planRefresh,
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
