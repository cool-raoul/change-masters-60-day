import { createClient } from "@/lib/supabase/server";
import { InstellingenForm } from "@/components/InstellingenForm";
import { PresenceToggle } from "@/components/presence/PresenceToggle";
import { SocialAccountsForm } from "@/components/instellingen/SocialAccountsForm";
import { TempoSectie } from "@/components/instellingen/TempoSectie";
import type { CommitmentUren } from "@/lib/dagdoelen";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

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
  const isFounder = rol === "founder";

  // Founder-tekst-overrides voor de sectie-titels en uitleg-blokken op
  // deze pagina. Founders kunnen via ✏️-knop alle teksten direct
  // bewerken zonder code-deploy.
  const tekstOverrides = await haalTekstOverridesMulti(supabase, ["instellingen"]);
  const overrides = namespaceAlsRecord(tekstOverrides, "instellingen");

  // commitment_uren staat in user_metadata (zie onboarding-stap-4).
  // Voor de TempoSectie willen we weten of er ECHT een keuze is
  // gemaakt (vs. niet ingesteld), dus geen fallback naar default.
  const ruwUren = Number(
    (user.user_metadata as { commitment_uren?: unknown } | undefined)
      ?.commitment_uren,
  );
  const huidigUren: CommitmentUren | null =
    ruwUren === 2 || ruwUren === 4 || ruwUren === 6 ? ruwUren : null;

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

      {/* Tempo-keuze (commitment_uren). Belangrijk: prominente plek
          voor zowel bestaande users (die nog geen tempo hebben omdat
          ze vóór deze feature klaar waren met onboarding) als nieuwe
          users die later willen switchen. */}
      <TempoSectie huidigUren={huidigUren} />

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
          <EditableTekst
            namespace="instellingen"
            sleutel="sponsor_transparantie.titel"
            standaard="🔍 Wat ziet mijn sponsor van mij?"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2"
            hint="Titel van de 'wat ziet mijn sponsor'-link in /instellingen"
          />
          <EditableTekst
            namespace="instellingen"
            sleutel="sponsor_transparantie.uitleg"
            standaard="Eerlijke uitleg over welke data wordt gedeeld en wat privé blijft."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white opacity-70 text-sm mt-1"
            multiline
            rows={2}
            hint="Uitleg-zin van de 'wat ziet mijn sponsor'-link"
          />
        </div>
        <span className="text-cm-gold text-lg flex-shrink-0">→</span>
      </Link>

      {/* Onboarding preview */}
      <div className="card space-y-3">
        <EditableTekst
          namespace="instellingen"
          sleutel="onboarding_preview.titel"
          standaard="🎓 Onboarding"
          overrides={overrides}
          isFounder={isFounder}
          as="h2"
          className="text-sm font-semibold text-cm-white uppercase tracking-wider"
          hint="Titel van de onboarding-preview-sectie"
        />
        <EditableBlok
          namespace="instellingen"
          sleutel="onboarding_preview.uitleg"
          standaard="Bekijk de volledige onboarding-wizard zoals een nieuw member die ziet. Handig als sponsor om nieuwe members te begeleiden."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-60"
          rows={2}
          hint="Uitleg van de onboarding-preview-sectie"
        />
        <Link href="/onboarding?preview=true" className="btn-secondary text-sm inline-block">
          Bekijk onboarding (preview) →
        </Link>
      </div>

      {/* Bestellinks (per pakket) */}
      <div className="card space-y-3">
        <EditableTekst
          namespace="instellingen"
          sleutel="bestellinks.titel"
          standaard="🛒 Bestellinks"
          overrides={overrides}
          isFounder={isFounder}
          as="h2"
          className="text-sm font-semibold text-cm-white uppercase tracking-wider"
          hint="Titel van de bestellinks-sectie"
        />
        <EditableBlok
          namespace="instellingen"
          sleutel="bestellinks.uitleg"
          standaard="Koppel je Lifeplus-webshop URL aan elk pakket. ELEVA gebruikt die links automatisch in productadvies-flows."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-60"
          rows={2}
          hint="Uitleg van de bestellinks-sectie"
        />
        <Link href="/instellingen/bestellinks" className="btn-secondary text-sm inline-block">
          Beheer bestellinks →
        </Link>
      </div>

      {/* Film-CMS, alleen voor leiders/founders */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <EditableTekst
            namespace="instellingen"
            sleutel="films_cms.titel"
            standaard="🎬 Films-CMS"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de Films-CMS-sectie (founder-only)"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="films_cms.uitleg"
            standaard="Beheer de films die in onboarding en op andere plekken worden getoond. Plak een YouTube/Vimeo URL, de embed gebeurt automatisch."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-60"
            rows={2}
            hint="Uitleg van de Films-CMS-sectie"
          />
          <Link href="/instellingen/films" className="btn-secondary text-sm inline-block">
            Beheer films →
          </Link>
        </div>
      )}

      {/* Mentor product-kennisbank, founder-only */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <EditableTekst
            namespace="instellingen"
            sleutel="mentor_kennis.titel"
            standaard="📚 Mentor product-kennis (intern)"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de Mentor-kennis-sectie"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="mentor_kennis.uitleg"
            standaard="127 aandoening-naar-supplement-koppelingen uit 2017 (Dr. McKee + jarenlange teamervaring). Loop ze rij voor rij door en valideer welke nu nog steeds kloppen. ELEVA Mentor gebruikt alléén gevalideerde regels, en altijd claim-vrij."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-60"
            rows={3}
            hint="Uitleg van de Mentor-kennis-sectie"
          />
          <Link href="/instellingen/mentor-kennis" className="btn-secondary text-sm inline-block">
            Open kennis-validatie →
          </Link>
        </div>
      )}

      {/* Modus-test, founder-only proefaccount-switcher */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <EditableTekst
            namespace="instellingen"
            sleutel="modus_test.titel"
            standaard="🧪 Modus-test (proefaccount-switcher)"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de modus-test-sectie"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="modus_test.uitleg"
            standaard='Switch je eigen account tussen Sprint, Core, Pro of "nieuwe gebruiker" om steeds vanaf het begin te zien hoe een instromer ELEVA ervaart. Geen tweede account nodig.'
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-60"
            rows={3}
            hint="Uitleg van de modus-test-sectie"
          />
          <Link href="/instellingen/modus-test" className="btn-secondary text-sm inline-block">
            Open modus-test →
          </Link>
        </div>
      )}

      {/* Mentor-training (founder-only) */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <EditableTekst
            namespace="instellingen"
            sleutel="mentor_trainen.titel"
            standaard="🧠 Train de Mentor"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de Mentor-train-sectie"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="mentor_trainen.uitleg"
            standaard="Voeg vraag-antwoord-voorbeelden toe uit echte WhatsApp-gesprekken. De Mentor leert direct van jouw aanpak en gebruikt ze bij vergelijkbare vragen van members. Werkt voor de huidige Mentor en straks ook voor de programma-coach (prospect-zijde)."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-60"
            rows={3}
            hint="Uitleg van de Mentor-train-sectie"
          />
          <Link href="/instellingen/mentor-trainen" className="btn-secondary text-sm inline-block">
            Train de Mentor →
          </Link>
        </div>
      )}

      {/* Playbook preview & bewerken (founder-only) */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <EditableTekst
            namespace="instellingen"
            sleutel="playbook_bewerken.titel"
            standaard="✍️ 21-daags Playbook, preview & bewerken"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de playbook-bewerken-sectie"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="playbook_bewerken.uitleg"
            standaard="Scrol door alle 21 dagen heen, lees rustig de teksten zoals members ze zien, en klik op de ✏️-knop naast elke tekst om aan te passen. Wijzigingen zijn onmiddellijk live voor alle members. Met de pijltjes onderaan blader je verder."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-70 leading-relaxed"
            rows={4}
            hint="Uitleg van de playbook-bewerken-sectie"
          />
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
