// File: components/freebies/ManyChatHandleiding.tsx
//
// Uitklap-blok met 5-stappen-handleiding voor het automatiseren van een
// freebie-trigger via ManyChat (Instagram comment → auto-DM met
// persoonlijke link). Gebruikt op /instellingen/mijn-tracking-links.

export function ManyChatHandleiding({
  voorbeeldLink,
  triggerVoorbeeld = "ENERGIE",
}: {
  voorbeeldLink?: string;
  triggerVoorbeeld?: string;
}) {
  const tonbeeldLink =
    voorbeeldLink ??
    "https://[jouw-domein]/bot/energie-en-focus/[jouw-token]";

  return (
    <details className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
      <summary className="cursor-pointer flex items-start gap-3 group">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xl">
          🤖
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium text-sky-100">
            Automatiseer via Instagram (optioneel, met ManyChat)
          </h3>
          <p className="mt-1 text-sm text-sky-200/70 leading-relaxed">
            Hoe je ervoor zorgt dat iedereen die op je post reageert met
            een trigger-woord automatisch een DM krijgt met je
            persoonlijke link. Klik om uit te klappen.
          </p>
        </div>
        <span className="text-sky-300 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <div className="mt-5 space-y-5 text-sm text-slate-200 leading-relaxed">
        <p className="text-xs text-sky-200/80 italic">
          ELEVA doet zelf de hele bot-flow + de prospect-tracking. ManyChat
          is alleen nodig voor het Instagram-stuk: een keyword in een
          comment of DM oppikken en automatisch reageren. De volgende
          vijf stappen kosten ongeveer een kwartier eenmalige setup.
        </p>

        <Stap nummer={1} titel="Maak een ManyChat-account">
          <p>
            Ga naar{" "}
            <a
              href="https://manychat.com"
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 underline hover:text-sky-200"
            >
              manychat.com
            </a>
            {" "}en maak een gratis account aan. De gratis tier is genoeg
            om te starten. Pas bij meer dan duizend contacten of geavanceerde
            features wordt het betaald.
          </p>
        </Stap>

        <Stap nummer={2} titel="Koppel je Instagram-business-account">
          <p>
            ManyChat-koppeling werkt alleen met een{" "}
            <strong>Instagram Business</strong>-account (geen Creator,
            geen Persoonlijk). Schakel om in je Instagram-instellingen
            naar 'Bedrijfsaccount' als dat nog niet zo is. Daarna in
            ManyChat: <em>Settings → Connect → Instagram</em>.
          </p>
        </Stap>

        <Stap nummer={3} titel="Maak een Keyword Trigger">
          <p>
            In ManyChat ga je naar <em>Automation → New Automation →
            Instagram → Comments / DMs</em>. Stel als trigger-woord het
            woord in dat jij in je social-post gebruikt. Voorbeeld:{" "}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">
              {triggerVoorbeeld}
            </code>
            .
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Tip: kies een woord dat niemand per ongeluk in een gewone
            comment typt, bijvoorbeeld een streepje of unieke spelling.
          </p>
        </Stap>

        <Stap nummer={4} titel="In de DM-respons: plak jouw ELEVA-link">
          <p>
            Schrijf een korte DM-tekst en plak jouw persoonlijke
            tracking-link erin. De link staat hierboven op deze pagina,
            kopieer 'm met de kopieer-knop.
          </p>
          <p className="mt-3 text-xs">
            <strong className="text-amber-200">Bonus-tip:</strong> voeg{" "}
            <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-200">
              ?ig=
            </code>
            <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-200">
              {"{{user_username}}"}
            </code>
            <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-200">
              &amp;via=instagram
            </code>{" "}
            toe aan het einde van de link. ManyChat vult de Instagram-naam
            van degene die reageerde automatisch in, en ELEVA koppelt die
            handle aan haar of zijn prospect-kaart. Handig: ook zonder
            telefoonnummer kun je dan via Instagram-DM contact opnemen.
          </p>
          <p className="mt-2 text-xs">Voorbeeld DM-tekst:</p>
          <pre className="mt-2 p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-300 whitespace-pre-wrap font-sans">
            Hoi! Fijn dat je reageerde. Hier is mijn persoonlijke link
            naar de korte vragenlijst, vijf minuten van je tijd:
            <br />
            <br />
            {tonbeeldLink}?ig={"{{user_username}}"}&amp;via=instagram
            <br />
            <br />
            Aan het eind krijg je een persoonlijk overzicht en concrete
            handvatten die in deze tijd vaak rust geven. Veel succes 🌷
          </pre>
        </Stap>

        <Stap nummer={5} titel="Test door zelf te reageren">
          <p>
            Publiceer een testpost en reageer er zelf op met je
            trigger-woord. ManyChat zou binnen een halve minuut een DM
            naar je sturen. Werkt het? Dan kan de echte post live.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Werkt het niet? Check in ManyChat de automation-statistieken
            en kijk of de comment werd opgepikt. Vaak ligt het aan de
            Instagram-koppeling die opnieuw geautoriseerd moet worden.
          </p>
        </Stap>

        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider mb-1">
            Wat ELEVA voor jou doet (en wat ManyChat dus niet hoeft)
          </div>
          <ul className="text-xs text-amber-100/80 leading-relaxed list-disc list-inside space-y-1">
            <li>De volledige bot-flow met 7 vragen + persoonlijk overzicht</li>
            <li>AI-gegenereerde herkenning + concrete handvatten + nutriënten</li>
            <li>Prospect-kaart aanmaken in jouw namenlijst (direct na intekening)</li>
            <li>De vijf-mail-vervolgreeks (komt in de volgende ELEVA-update)</li>
            <li>Bestellinks gekoppeld aan jouw webshop</li>
          </ul>
          <p className="text-xs text-amber-200/70 mt-2 italic">
            ManyChat = alleen Instagram-trigger. Alle andere workflow zit
            in ELEVA. Daarom blijft je ManyChat-tier laag, ongeacht hoeveel
            mensen je hebt.
          </p>
        </div>
      </div>
    </details>
  );
}

function Stap({
  nummer,
  titel,
  children,
}: {
  nummer: number;
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500 text-white text-sm font-bold mt-0.5">
        {nummer}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sky-100">{titel}</div>
        <div className="mt-1 text-slate-200 text-sm">{children}</div>
      </div>
    </div>
  );
}
