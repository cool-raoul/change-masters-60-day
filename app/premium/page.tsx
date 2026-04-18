import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UpgradeKnop } from "@/components/premium/UpgradeKnop";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default async function PremiumPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_tot, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const premiumTot = (profile as any)?.premium_tot as string | null;
  const isPremium = premiumTot ? new Date(premiumTot) >= new Date() : false;

  const voordelen: { icoon: string; titel: string; uitleg: string }[] = [
    {
      icoon: "♾️",
      titel: "Onbeperkt chatten met ELEVA Mentor",
      uitleg: "Geen 20-berichten-limiet meer per dag. Spar zo vaak als je wilt met je AI-mentor voor advies, scripts, bezwaren en productadvies.",
    },
    {
      icoon: "⚡",
      titel: "Voorrang op drukke momenten",
      uitleg: "Als de servers het druk hebben sta jij vooraan in de rij. Nooit wachten, direct antwoord.",
    },
    {
      icoon: "🎙️",
      titel: "Onbeperkt spraakfunctie (Whisper)",
      uitleg: "Neem klantenkaarten, notities en advies-vragen in via spraak — de slimste transcriptie voor Lifeplus-producten en medische termen.",
    },
    {
      icoon: "🆕",
      titel: "Als eerste nieuwe functies",
      uitleg: "Premium-users krijgen toegang tot nieuwe functies (bv. slimme productadvies-flows, team-analytics) zodra ze af zijn.",
    },
    {
      icoon: "❤️",
      titel: "Bijdrage aan Lifeplus Foundation",
      uitleg: "Wat overblijft na server- en AI-kosten gaat rechtstreeks naar de Lifeplus Foundation. Jouw €2 helpt letterlijk anderen.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
      >
        ← Terug
      </Link>

      {/* Hero */}
      <div className="card border-cm-gold/30 bg-gradient-to-br from-cm-gold/10 to-transparent text-center py-8 space-y-3">
        <div className="text-5xl">🌟</div>
        <h1 className="text-3xl font-display font-bold text-cm-white">
          ELEVA <span className="text-cm-gold">Premium</span>
        </h1>
        <p className="text-cm-white opacity-80 max-w-xl mx-auto text-sm">
          Haal alles uit ELEVA: onbeperkt chatten met je mentor, voorrang bij
          drukte, nieuwe functies als eerste — én een bijdrage aan de Lifeplus
          Foundation.
        </p>
        <div className="pt-2">
          <span className="text-cm-gold text-4xl font-bold">€2</span>
          <span className="text-cm-white opacity-70"> / maand</span>
        </div>
        <p className="text-cm-white opacity-50 text-xs">
          Maandelijks opzegbaar · Eerste betaling vandaag · BTW inbegrepen
        </p>
      </div>

      {/* Status / actie */}
      {isPremium ? (
        <div className="card border-green-500/30 bg-green-500/5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <h2 className="text-cm-white font-bold text-lg">Je bent Premium</h2>
          </div>
          <p className="text-cm-white text-sm opacity-80">
            Je abonnement loopt tot{" "}
            <span className="text-cm-gold font-semibold">
              {premiumTot
                ? format(new Date(premiumTot), "d MMMM yyyy", { locale: nl })
                : "onbekend"}
            </span>
            . Hierna wordt 'ie automatisch verlengd. Dank je wel voor je steun ❤️
          </p>
        </div>
      ) : (
        <div className="card border-cm-gold/30 bg-cm-gold/5 space-y-3">
          <UpgradeKnop label="Upgrade nu voor €2/maand →" />
          <p className="text-cm-white text-xs opacity-60 text-center">
            Je wordt doorgestuurd naar Stripe — de beveiligde betaalomgeving.
            Betaal met iDEAL, creditcard of Apple/Google Pay.
          </p>
        </div>
      )}

      {/* Voordelen */}
      <div className="space-y-3">
        <h2 className="text-cm-white font-display font-bold text-xl">
          Wat krijg je?
        </h2>
        {voordelen.map((v, i) => (
          <div key={i} className="card flex gap-4 items-start">
            <span className="text-3xl flex-shrink-0">{v.icoon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-cm-white font-semibold text-sm">{v.titel}</p>
              <p className="text-cm-white text-xs opacity-70 mt-1 leading-relaxed">
                {v.uitleg}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toelichting kosten */}
      <div className="card bg-cm-surface-2 space-y-2">
        <p className="text-cm-white font-semibold text-sm">💡 Waarom €2?</p>
        <p className="text-cm-white text-xs opacity-70 leading-relaxed">
          Het draaien van ELEVA kost geld: servers, AI-modellen (OpenAI Whisper
          + GPT-4o), Supabase-database, Stripe-kosten. €2/maand is het
          kostendekkende minimum. Alles wat daarna overblijft gaat naar de{" "}
          <span className="text-cm-gold">Lifeplus Foundation</span> — dus je
          betaalt niet voor winst, maar voor continuïteit + goed doel.
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-2">
        <h2 className="text-cm-white font-display font-bold text-lg">
          Veelgestelde vragen
        </h2>

        <details className="card bg-cm-surface-2 text-sm">
          <summary className="cursor-pointer text-cm-white font-medium">
            Kan ik maandelijks opzeggen?
          </summary>
          <p className="text-cm-white text-xs opacity-70 mt-2 leading-relaxed">
            Ja. Je kunt op elk moment opzeggen via de Stripe klantportal (link
            volgt in je bevestigingsmail). Je behoudt premium tot het einde van
            de huidige betaalperiode.
          </p>
        </details>

        <details className="card bg-cm-surface-2 text-sm">
          <summary className="cursor-pointer text-cm-white font-medium">
            Wat als ik niet upgrade?
          </summary>
          <p className="text-cm-white text-xs opacity-70 mt-2 leading-relaxed">
            De gratis versie blijft volledig werken: je hebt 20 berichten per
            dag met de mentor, alle pipeline-functies, scripts, herinneringen,
            spraakfunctie en team-overzicht. Alleen het onbeperkt chatten en de
            voorrangsfunctie zitten achter Premium.
          </p>
        </details>

        <details className="card bg-cm-surface-2 text-sm">
          <summary className="cursor-pointer text-cm-white font-medium">
            Hoe word mijn betaling gebruikt?
          </summary>
          <p className="text-cm-white text-xs opacity-70 mt-2 leading-relaxed">
            1) Server- en AI-kosten (grootste post) · 2) Stripe transactiekosten
            (~€0,25 per betaling) · 3) Resterend bedrag → Lifeplus Foundation.
            Volledig transparant.
          </p>
        </details>

        <details className="card bg-cm-surface-2 text-sm">
          <summary className="cursor-pointer text-cm-white font-medium">
            Welke betaalmethoden werken?
          </summary>
          <p className="text-cm-white text-xs opacity-70 mt-2 leading-relaxed">
            iDEAL, creditcard (Visa/Mastercard/Amex), Apple Pay, Google Pay,
            Bancontact en SEPA-automatische incasso. Alles via Stripe — je
            bankgegevens komen nooit bij ELEVA of Change Masters terecht.
          </p>
        </details>
      </div>

      {/* CTA onderaan */}
      {!isPremium && (
        <div className="card border-cm-gold/30 bg-cm-gold/5 text-center space-y-3 py-6">
          <p className="text-cm-white font-semibold">Klaar om te starten?</p>
          <UpgradeKnop label="Upgrade nu voor €2/maand →" />
        </div>
      )}
    </div>
  );
}
