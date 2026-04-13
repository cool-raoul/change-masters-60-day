import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { PIPELINE_FASEN } from "@/lib/supabase/types";
import { ProspectActieForm } from "@/components/namenlijst/ProspectActieForm";
import { ContactLogLijst } from "@/components/namenlijst/ContactLogLijst";
import { ContactgegevensForm } from "@/components/namenlijst/ContactgegevensForm";
import { getServerTaal, v } from "@/lib/i18n/server";
import { Locale } from "date-fns";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

export default async function ProspectDetailPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const [{ data: prospect }, { data: contactLogs }, { data: bestellingen }, { data: coachGesprekken }] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("contact_logs")
        .select("*")
        .eq("prospect_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("product_bestellingen")
        .select("*")
        .eq("prospect_id", id)
        .order("besteldatum", { ascending: false }),
      supabase
        .from("ai_gesprekken")
        .select("id, titel, created_at, updated_at")
        .eq("prospect_id", id)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
    ]);

  if (!prospect) notFound();

  const faseInfo = PIPELINE_FASEN.find((f) => f.fase === prospect.pipeline_fase);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/namenlijst" className="text-cm-white hover:text-cm-white">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-cm-white">
              {prospect.volledige_naam}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: faseInfo?.tekstkleur, background: `${faseInfo?.kleur}` }}
              >
                {faseInfo?.label}
              </span>
              {prospect.prioriteit === "hoog" && (
                <span className="text-cm-gold text-xs">{v("prospect.hoge_prioriteit", taal)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/coach?prospect=${id}`} className="btn-secondary text-sm">
            🤖 {v("nav.coach", taal)}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contactgegevens */}
        <div className="card space-y-3">
          <ContactgegevensForm prospect={prospect} />

          <div className="border-t border-cm-border pt-3 mt-3">
            <p className="text-xs text-cm-white opacity-60">{v("prospect.toegevoegd", taal)}</p>
            <p className="text-cm-white text-sm">
              {format(new Date(prospect.created_at), "d MMMM yyyy", { locale: datumLocale })}
            </p>
          </div>

          {/* Productbestellingen */}
          {bestellingen && bestellingen.length > 0 && (
            <div className="border-t border-cm-border pt-3 mt-3">
              <p className="text-xs text-cm-white mb-2">{v("prospect.bestellingen", taal)}</p>
              {bestellingen.map((b) => (
                <div key={b.id} className="bg-cm-surface-2 rounded-lg p-2 text-xs mb-2">
                  <p className="text-cm-white">
                    {format(new Date(b.besteldatum), "d MMM yyyy", { locale: datumLocale })}
                  </p>
                  <p className="text-cm-white">{b.product_omschrijving}</p>
                  <p className="text-cm-gold mt-1">
                    {v("prospect.herinnering", taal)}{" "}
                    {format(new Date(b.tweede_bestelling_reminder_datum), "d MMM yyyy", { locale: datumLocale })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acties + contactlog */}
        <div className="lg:col-span-2 space-y-4">
          <ProspectActieForm prospect={prospect} userId={user.id} />
          <ContactLogLijst
            contactLogs={contactLogs || []}
            prospect={prospect}
            userId={user.id}
          />

          {/* AI Coach gesprekken */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
                {v("prospect.coach_gesprekken", taal)}
              </h2>
              <Link
                href={`/coach?prospect=${id}`}
                className="text-cm-gold text-xs hover:text-cm-gold-light"
              >
                {v("prospect.nieuw_gesprek", taal)}
              </Link>
            </div>

            {(!coachGesprekken || coachGesprekken.length === 0) ? (
              <p className="text-cm-white text-sm">
                {v("prospect.geen_gesprekken", taal)}
              </p>
            ) : (
              <div className="space-y-2">
                {coachGesprekken.map((gesprek) => (
                  <Link
                    key={gesprek.id}
                    href={`/coach/${gesprek.id}`}
                    className="flex items-center justify-between bg-cm-surface-2 rounded-lg p-3 hover:border hover:border-cm-gold-dim transition-colors group"
                  >
                    <div>
                      <p className="text-cm-white text-sm font-medium group-hover:text-cm-gold transition-colors">
                        {gesprek.titel || v("prospect.coach_gesprek", taal)}
                      </p>
                      <p className="text-cm-white text-xs opacity-60 mt-0.5">
                        {format(new Date(gesprek.updated_at), "d MMM yyyy, HH:mm", { locale: datumLocale })}
                      </p>
                    </div>
                    <span className="text-cm-gold text-sm">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
