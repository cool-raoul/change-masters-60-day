import { createClient } from "@/lib/supabase/server";
import { InstellingenForm } from "@/components/InstellingenForm";
import Link from "next/link";

export default async function InstellingenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4">
        ← Terug
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Instellingen
        </h1>
        <p className="text-cm-white mt-1">Beheer jouw profiel en account</p>
      </div>

      <InstellingenForm profile={profile} email={user.email || ""} />
    </div>
  );
}
