"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function HerinneringActies({ herinneringId }: { herinneringId: string }) {
  const [laden, setLaden] = useState(false);
  const [voltooid, setVoltooid] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function markeerVoltooid() {
    setLaden(true);
    setVoltooid(true);
    const { error } = await supabase
      .from("herinneringen")
      .update({ voltooid: true })
      .eq("id", herinneringId);

    if (error) {
      toast.error("Kon herinnering niet markeren");
      setVoltooid(false);
    } else {
      toast.success("Afgevinkt!");
      router.refresh();
    }
    setLaden(false);
  }

  return (
    <button
      onClick={markeerVoltooid}
      disabled={laden || voltooid}
      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        voltooid
          ? "bg-green-500 border-green-500 text-white"
          : "border-white/60 bg-white/10 hover:border-green-400 hover:bg-green-400/20 text-white/80 hover:text-green-400"
      }`}
      title="Afvinken"
    >
      <span className="text-sm font-bold">✓</span>
    </button>
  );
}
