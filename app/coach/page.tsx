import { createClient } from "@/lib/supabase/server";
import { NieuwGesprekKnop } from "@/components/coach/NieuwGesprekKnop";
import { GesprekkenLijst } from "@/components/coach/GesprekkenLijst";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function CoachPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();

  const [{ data: gesprekken }, { data: prospects }] = await Promise.all([
    supabase.from("ai_gesprekken").select("*, prospect:prospects(volledige_naam)").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20),
    supabase.from("prospects").select("id, volledige_naam, pipeline_fase").eq("user_id", user.id).eq("gearchiveerd", false).order("volledige_naam"),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            🤖 {v("coach.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">{v("coach.subtitel", taal)}</p>
        </div>
        <NieuwGesprekKnop userId={user.id} prospects={prospects || []} />
      </div>

      {/* Info kaart */}
      <div className="card border-gold-subtle">
        <div className="flex gap-4">
          <div className="text-4xl">🎓</div>
          <div>
            <h2 className="text-cm-white font-semibold mb-2">{v("coach.wat_kan", taal)}</h2>
            <ul className="text-cm-white text-sm space-y-1">
              <li>✓ {taal === "en" ? "Write personalized DM scripts for a specific prospect" : taal === "fr" ? "Écrire des scripts DM personnalisés pour un prospect" : taal === "es" ? "Escribir scripts DM personalizados para un prospecto" : taal === "de" ? "Personalisierte DM-Skripte für einen Kontakt schreiben" : taal === "pt" ? "Escrever scripts DM personalizados para um prospecto" : "DM-scripts schrijven op maat voor een specifiek prospect"}</li>
              <li>✓ {taal === "en" ? "Handle objections with Feel-Felt-Found" : taal === "fr" ? "Traiter les objections avec Feel-Felt-Found" : taal === "es" ? "Manejar objeciones con Feel-Felt-Found" : taal === "de" ? "Einwände mit Feel-Felt-Found behandeln" : taal === "pt" ? "Lidar com objeções com Feel-Felt-Found" : "Bezwaren behandelen met Feel-Felt-Found"}</li>
              <li>✓ {taal === "en" ? "Write follow-up messages" : taal === "fr" ? "Formuler des messages de suivi" : taal === "es" ? "Formular mensajes de seguimiento" : taal === "de" ? "Follow-up Nachrichten formulieren" : taal === "pt" ? "Formular mensagens de acompanhamento" : "Follow up berichten formuleren"}</li>
              <li>✓ {taal === "en" ? "Apply the Goal-Time-Deadline closing" : taal === "fr" ? "Appliquer la clôture Objectif-Temps-Délai" : taal === "es" ? "Aplicar el cierre Objetivo-Tiempo-Plazo" : taal === "de" ? "Die Ziel-Zeit-Termin-Abschluss anwenden" : taal === "pt" ? "Aplicar o fechamento Meta-Tempo-Prazo" : "De Doel-Tijd-Termijn closing toepassen"}</li>
              <li>✓ {taal === "en" ? "Strategic advice per pipeline phase" : taal === "fr" ? "Conseils stratégiques par phase pipeline" : taal === "es" ? "Consejos estratégicos por fase de pipeline" : taal === "de" ? "Strategische Beratung pro Pipeline-Phase" : taal === "pt" ? "Conselhos estratégicos por fase do pipeline" : "Strategisch advies per pipeline-fase"}</li>
              <li>✓ {taal === "en" ? "Mindset coaching and motivation" : taal === "fr" ? "Coaching mindset et motivation" : taal === "es" ? "Coaching de mentalidad y motivación" : taal === "de" ? "Mindset-Coaching und Motivation" : taal === "pt" ? "Coaching de mentalidade e motivação" : "Mindset coaching en motivatie"}</li>
              <li>✓ {taal === "en" ? "Accountability — are you keeping up with your daily actions?" : taal === "fr" ? "Responsabilité — respectes-tu tes actions quotidiennes ?" : taal === "es" ? "Responsabilidad — ¿cumples con tus acciones diarias?" : taal === "de" ? "Accountability — hältst du deine täglichen Aktionen ein?" : taal === "pt" ? "Responsabilidade — você está cumprindo suas ações diárias?" : "Accountability — houd jij je aan jouw dagelijkse acties?"}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Eerdere gesprekken */}
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
          {v("coach.eerdere", taal)}
        </h2>
        <GesprekkenLijst gesprekken={gesprekken || []} />
      </div>
    </div>
  );
}
