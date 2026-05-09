import { createClient } from "@/lib/supabase/server";
import { InstellingenForm } from "@/components/InstellingenForm";
import { PresenceToggle } from "@/components/presence/PresenceToggle";
import { SocialAccountsForm } from "@/components/instellingen/SocialAccountsForm";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function InstellingenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const rol = (profile as { role?: string | null } | null)?.role ?? "";
  // Voor nu alleen founder. Later kunnen we dit verbreden naar 'leider'.
  const magFilmsBeheren = rol === "founder";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4">
        {v("algemeen.terug", taal)}
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("instellingen.titel", taal)}
        </h1>
        <p className="text-cm-white mt-1">{v("instellingen.subtitel", taal)}</p>
      </div>

      <InstellingenForm profile={profile} email={user.email || ""} />

      {/* Social-profielen, gebruikt door /vandaag taken die naar
          Facebook / Instagram / LinkedIn verwijzen. */}
      <SocialAccountsForm
        initieel={{
          facebook_url:
            (profile as { facebook_url?: string | null } | null)
              ?.facebook_url ?? null,
          instagram_url:
            (profile as { instagram_url?: string | null } | null)
              ?.instagram_url ?? null,
          linkedin_url:
            (profile as { linkedin_url?: string | null } | null)
              ?.linkedin_url ?? null,
        }}
      />

      <PresenceToggle
        initieelAan={
          (profile as { presence_zichtbaar?: boolean } | null)
            ?.presence_zichtbaar !== false
        }
      />

      {/* Transparantie: wat ziet mijn sponsor van mij */}
      <Link
        href="/instellingen/wat-ziet-mijn-sponsor"
        className="card flex items-center justify-between gap-3 hover:border-cm-gold-dim transition-colors"
      >
        <div>
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2">
            🔍 Wat ziet mijn sponsor van mij?
          </h2>
          <p className="text-cm-white opacity-70 text-sm mt-1">
            Eerlijke uitleg over welke data wordt gedeeld en wat privé blijft.
          </p>
        </div>
        <span className="text-cm-gold text-lg flex-shrink-0">→</span>
      </Link>

      {/* Onboarding preview */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🎓 Onboarding</h2>
        <p className="text-cm-white text-sm opacity-60">
          Bekijk de volledige onboarding-wizard zoals een nieuw member die ziet. Handig als sponsor om nieuwe members te begeleiden.
        </p>
        <Link href="/onboarding?preview=true" className="btn-secondary text-sm inline-block">
          Bekijk onboarding (preview) →
        </Link>
      </div>

      {/* Bestellinks (per pakket) */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🛒 Bestellinks</h2>
        <p className="text-cm-white text-sm opacity-60">
          Koppel je Lifeplus-webshop URL aan elk pakket. ELEVA gebruikt die links automatisch in productadvies-flows.
        </p>
        <Link href="/instellingen/bestellinks" className="btn-secondary text-sm inline-block">
          Beheer bestellinks →
        </Link>
      </div>

      {/* Film-CMS, alleen voor leiders/founders */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🎬 Films-CMS</h2>
          <p className="text-cm-white text-sm opacity-60">
            Beheer de films die in onboarding en op andere plekken worden getoond. Plak een YouTube/Vimeo URL, de embed gebeurt automatisch.
          </p>
          <Link href="/instellingen/films" className="btn-secondary text-sm inline-block">
            Beheer films →
          </Link>
        </div>
      )}

      {/* Modus-test, founder-only proefaccount-switcher */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🧪 Modus-test (proefaccount-switcher)</h2>
          <p className="text-cm-white text-sm opacity-60">
            Switch je eigen account tussen Sprint, Core, Pro of &quot;nieuwe gebruiker&quot; om steeds vanaf het begin te zien hoe een instromer ELEVA ervaart. Geen tweede account nodig.
          </p>
          <Link href="/instellingen/modus-test" className="btn-secondary text-sm inline-block">
            Open modus-test →
          </Link>
        </div>
      )}

      {/* Mentor-training (founder-only) */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🧠 Train de Mentor</h2>
          <p className="text-cm-white text-sm opacity-60">
            Voeg vraag-antwoord-voorbeelden toe uit echte WhatsApp-gesprekken. De Mentor leert direct van jouw aanpak en gebruikt ze bij vergelijkbare vragen van members. Werkt voor de huidige Mentor en straks ook voor de programma-coach (prospect-zijde).
          </p>
          <Link href="/instellingen/mentor-trainen" className="btn-secondary text-sm inline-block">
            Train de Mentor →
          </Link>
        </div>
      )}

      {/* Playbook preview & bewerken (founder-only) */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            ✍️ 21-daags Playbook, preview & bewerken
          </h2>
          <p className="text-cm-white text-sm opacity-70 leading-relaxed">
            Scrol door alle 21 dagen heen, lees rustig de teksten zoals members
            ze zien, en klik op de <span className="text-cm-gold">✏️</span>
            -knop naast elke tekst om aan te passen. Wijzigingen zijn{" "}
            <strong>onmiddellijk live</strong> voor alle members. Met de{" "}
            <strong>← Dag N − 1 / Dag N + 1 →</strong>-pijltjes onderaan blader
            je verder.
          </p>
          <Link
            href="/playbook?dag=1&preview=true"
            className="btn-secondary text-sm inline-block"
          >
            Open preview vanaf dag 1 →
          </Link>
        </div>
      )}
    </div>
  );
}
