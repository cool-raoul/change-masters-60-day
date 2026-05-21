// File: lib/mentor-profiel/helpers.ts
//
// Lees + schrijf-functies voor het Mentor-profiel. Werkt met JSONB
// merge (geen volledige overschrijving). Faalt graceful naar leeg
// profiel als tabel nog niet bestaat.

import { createClient } from "@/lib/supabase/server";
import type { MentorProfiel } from "./types";

/** Returnt het Mentor-profiel voor een user. Leeg object bij geen record of error. */
export async function leesMentorProfiel(userId: string): Promise<MentorProfiel> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("mentor_profielen")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    const record = data as { data?: MentorProfiel } | null;
    return record?.data ?? {};
  } catch {
    return {};
  }
}

/** Merge-patch het Mentor-profiel. Bestaande velden blijven behouden tenzij overschreven. */
export async function patchMentorProfiel(
  userId: string,
  patch: Partial<MentorProfiel>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const huidig = await leesMentorProfiel(userId);
    const merged: MentorProfiel = { ...huidig, ...patch };
    const { error } = await supabase
      .from("mentor_profielen")
      .upsert(
        { user_id: userId, data: merged, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "onbekend" };
  }
}
