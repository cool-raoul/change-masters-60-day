import { createClient } from "@/lib/supabase/server";
import { InstellingenForm } from "@/components/InstellingenForm";
import { ProfielFotoUpload } from "@/components/instellingen/ProfielFotoUpload";
import { CoreTempoSectie } from "@/components/instellingen/CoreTempoSectie";
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
  // Modus-test pagina mag ook door pilot-testaccounts (is_tester=true)
  // gebruikt worden. Zo kunnen testers zonder founder-rechten wel
  // switchen tussen Sprint/Core/Pro om de flows te ervaren.
  const isTester =
    (profile as { is_tester?: boolean | null } | null)?.is_tester === true;
  const magModusTesten = isFounder || isTester;

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

      <ProfielFotoUpload
        userId={user.id}
        naam={(profile as { full_name?: string | null } | null)?.full_name ?? null}
        initieleFotoUrl={(profile as { foto_url?: string | null } | null)?.foto_url ?? null}
      />

      <InstellingenForm profile={profile} email={user.email || ""} />

      {/* Tempo-keuze (commitment_uren). Alleen voor Sprint-members, want
          Core gebruikt DTT (Doel-Tijd-Termijn) als ritme-bepaler. Beide
          tegelijk tonen is verwarrend. */}
      {(profile as { modus?: string | null } | null)?.modus !== "core" && (
        <TempoSectie huidigUren={huidigUren} />
      )}

      {/* Core-tempo-sectie verschijnt alleen voor members met modus=core.
          Member kan DTT op elk moment aanpassen. */}
      {(profile as { modus?: string | null } | null)?.modus === "core" && (
        <CoreTempoSectie
          initieelDoel={
            ((profile as { core_dtt?: { doel_per_maand?: number } | null } | null)
              ?.core_dtt?.doel_per_maand) ?? null
          }
          initieleUren={
            ((profile as { core_dtt?: { uren_per_week?: number } | null } | null)
              ?.core_dtt?.uren_per_week) ?? null
          }
          initieleTermijn={
            ((profile as { core_dtt?: { termijn_maanden?: number } | null } | null)
              ?.core_dtt?.termijn_maanden) ?? null
          }
        />
      )}

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

      {/* Freebie-bot tracking-links (pilot: Tweede Lente). Iedere member
          krijgt per actieve bot een unieke 16-char hex tracking-token in
          een persoonlijke URL. Iedereen die via die URL de bot doet komt
          als prospect in de namenlijst van de member terecht.

          Zichtbaarheid: alleen Core-members + founders. Bot is primair
          voor Core bedoeld; Sprint en Pro krijgen 'm in latere fase. */}
      {(isFounder ||
        (profile as { modus?: string } | null)?.modus === "core") && (
        <div className="card space-y-3">
          <EditableTekst
            namespace="instellingen"
            sleutel="tracking_links.titel"
            standaard="🔗 Mijn freebie-bot-links"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de freebie-bot-tracking-links-sectie"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="tracking_links.uitleg"
            standaard="Persoonlijke links naar onze freebie-bots, zoals Tweede Lente voor de overgang. Iedereen die via jouw link de bot doet komt als prospect in jouw namenlijst terecht."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-60"
            rows={2}
            hint="Uitleg van de freebie-bot-tracking-links-sectie"
          />
          <Link href="/instellingen/mijn-tracking-links" className="btn-secondary text-sm inline-block">
            Open mijn links →
          </Link>
        </div>
      )}

      {/* Film-CMS, alleen voor leiders/founders.
          Sinds 2026-05-20 is Films-CMS NIET meer voor Sprint-dag-films
          (die staan nu direct op /vandaag via ✏️ MediaBlokken edit-
          modus) en NIET voor /setup admin-items (die hebben hun eigen
          film-URL op /setup/[slug]). Films-CMS blijft wel actief voor:
          welkomstfilms per modus, prospect-films, leerpaden-films en
          academy-films. */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <EditableTekst
            namespace="instellingen"
            sleutel="films_cms.titel"
            standaard="🎬 Films-CMS (welkomst, prospect, leerpaden, academy)"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-sm font-semibold text-cm-white uppercase tracking-wider"
            hint="Titel van de Films-CMS-sectie (founder-only)"
          />
          <EditableBlok
            namespace="instellingen"
            sleutel="films_cms.uitleg"
            standaard="Beheer hier de films voor welkomstpagina's per modus, prospect-films, leerpaden en academy. Plak een YouTube/Vimeo URL, de embed gebeurt automatisch. NIET voor Sprint-dag-films, die plaats je direct op /vandaag via ✏️ edit-modus → + media. NIET voor /setup admin-items, die hebben hun eigen film-URL op /setup/[slug]."
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-60"
            rows={5}
            hint="Uitleg van de Films-CMS-sectie. Maak duidelijk welk soort films wel/niet hier horen."
          />
          <Link href="/instellingen/films" className="btn-secondary text-sm inline-block">
            Beheer films →
          </Link>
        </div>
      )}

      {/* Aanpassingen-overzicht (founder-only). Sinds 2026-05-21
          unified: toont alle drie soorten overrides (tekst, playbook-
          dag, scripts) op één plek met reset-knop per stuk. */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            ✍️ Mijn aanpassingen
          </h2>
          <p className="text-cm-white opacity-70 text-sm leading-relaxed">
            Eén plek voor alle tekst- en content-aanpassingen die jij hebt
            gemaakt op ELEVA (losse teksten, Sprint-dag-aanpassingen,
            script-aanpassingen). Snel terug naar standaard zetten als een
            nieuwe code-tekst niet doorkomt.
          </p>
          <Link
            href="/instellingen/tekst-overrides"
            className="btn-secondary text-sm inline-block"
          >
            Open overzicht →
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

      {/* Admin-checklist: 4 administratieve stappen (webshop, krediet,
          teams, bestellinks) voor alle modi. Zichtbaar voor iedereen,
          founder kan via /setup en /setup/[slug] de uitleg + films per
          item beheren (MediaBlokkenClient + EditableTekst). */}
      <div className="card space-y-3 border-l-4 border-cm-gold">
        <EditableTekst
          namespace="instellingen"
          sleutel="admin_checklist.titel"
          standaard="📋 Administratieve stappen"
          overrides={overrides}
          isFounder={isFounder}
          as="h2"
          className="text-sm font-semibold text-cm-white uppercase tracking-wider"
          hint="Titel van de admin-checklist-sectie op /instellingen"
        />
        <EditableBlok
          namespace="instellingen"
          sleutel="admin_checklist.uitleg"
          standaard="Webshop aanmaken, kredietformulier invullen, teams-administratie inrichten, bestellinks koppelen. Vier administratieve stappen voor je business. Klik op een item om de uitleg + film te zien."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-70 leading-relaxed"
          rows={3}
          hint="Korte uitleg boven de admin-checklist-knop"
        />
        <Link
          href="/setup"
          className="btn-gold text-sm inline-block px-4 py-2 font-semibold"
        >
          Open administratieve stappen →
        </Link>
      </div>

      {/* Modus-test: founder + tester proefaccount-switcher */}
      {magModusTesten && (
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

      {/* Playbook preview & bewerken sectie verwijderd per 2026-05-20.
          Founders bewerken dag-teksten nu rechtstreeks op /vandaag via
          de ✏️ Bewerk-knop per dag. De aparte /playbook?dag=N preview-
          pagina is daarmee overbodig geworden, zat alleen nog voor
          verwarring. Route blijft bestaan voor backwards-compat met
          eventuele bookmarks, maar geen actieve links meer. */}
    </div>
  );
}
