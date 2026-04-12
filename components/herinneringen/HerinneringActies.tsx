"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function HerinneringActies({ herinneringId }: { herinneringId: string }) {
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function markeerVoltooid() {
    setLaden(true);
    const { error } = await supabase
      .from("herinneringen")
      .update({ voltooid: true })
      .eq("id", herinneringId);

    if (error) {
      toast.error("Kon herinnering niet markeren");
    } else {
      toast.success("Herinnering afgevinkt ✓");
      router.refresh();
    }
    setLaden(false);
  }

  return (
    <button
      onClick={markeerVoltooid}
      disabled={laden}
      className="text-cm-muted hover:text-green-400 transition-colors p-1 text-lg"
      title="Markeer als voltooid"
    >
      ✓
    </button>
  );
}
