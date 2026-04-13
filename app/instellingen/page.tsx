import { createClient } from "@/lib/supabase/server";
import { InstellingenForm } from "@/components/InstellingenForm";

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
