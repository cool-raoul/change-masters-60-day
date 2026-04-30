import Link from "next/link";

// ============================================================
// /over-eleva — features-overzicht in jip-en-janneketaal.
//
// Voor pilot-testers en nieuwe members: wat zit er in ELEVA en wat
// heb je eraan? Zelfde inhoud als docs/ELEVA-features-uitleg.md, hier
// als nette in-app pagina zodat je 'm kan delen via een ELEVA-link.
// ============================================================

export const dynamic = "force-static";

type Feature = {
  emoji: string;
  titel: string;
  watIsHet: string;
  watHebJeEraan: string;
  waar: string;
  nieuw?: boolean;
};

const FEATURES: Feature[] = [
  {
    emoji: "🏁",
    titel: "21-daags playbook",
    watIsHet:
      "Een dagelijkse tegel op je dashboard die je 21 dagen lang door het hele vak meeneemt. Per dag een korte teaching, afvinklijst en links naar de juiste plek.",
    watHebJeEraan:
      "Je hoeft niet te bedenken wat je moet doen. Open ELEVA, zie wat dag het is, en je hebt direct je dag-acties in beeld.",
    waar: "Dashboard — gouden tegel 'Vandaag is dag X'",
  },
  {
    emoji: "🎬",
    titel: "Films per dag (founder-CMS)",
    watIsHet:
      "Per playbook-dag kan de founder een YouTube/Vimeo-link plakken. De film verschijnt automatisch boven de dagtegel.",
    watHebJeEraan:
      "Members krijgen visuele uitleg op de juiste dag, in plaats van losse links. Geen film? Dan ook geen lege placeholder.",
    waar: "/instellingen/films (alleen founder)",
  },
  {
    emoji: "✍️",
    titel: "Founder-bewerkbaar (jij bent de redacteur)",
    watIsHet:
      "Op vrijwel elke tekst in ELEVA staat voor founders een ✍️-knop. Klik, pas aan, bewaar — direct live voor alle members. Werkt op de 21 playbook-dagen, alle scripts en de onboarding-titels.",
    watHebJeEraan:
      "Tijdens de pilot komt feedback over woorden, toon, voorbeelden. Jij past het direct zelf aan — geen developer-loop nodig.",
    waar: "Op de pagina zelf, naast de tekst die je wilt aanpassen",
  },
  {
    emoji: "🤖",
    titel: "ELEVA Mentor",
    watIsHet:
      "Een AI-coach die je kent. Hij weet welke dag je zit, kent je WHY, kent alle technieken (4-stappen-uitnodiging, Feel-Felt-Found, edification, FORM, Doel-Tijd-Termijn). Hij schrijft DM's, helpt bij bezwaren, doet roleplay, geeft productadvies.",
    watHebJeEraan:
      "Je hoeft niet te bedenken wát je moet zeggen. Vraag de mentor en krijg antwoord in jouw stijl, klaar om te kopiëren of door te sturen. Werkt 24/7.",
    waar: "Menu → ELEVA Mentor",
  },
  {
    emoji: "📝",
    titel: "Mijn zinnen",
    watIsHet:
      "Eén plek waar al je eigen geschreven teksten bij elkaar staan: edification-zin, closing-zin, why-stuk. Je schrijft ze in het playbook (op dag 18 bv.) en vindt ze hier altijd terug.",
    watHebJeEraan:
      "Je hoeft niets te onthouden. Je edification-zin schrijf je één keer goed op dag 18 — daarna gebruik je 'm bij elke 3-weg.",
    waar: "Menu → Mijn zinnen",
  },
  {
    emoji: "👥",
    titel: "Namenlijst (Pipeline-weergave)",
    watIsHet:
      "Al je prospects in 1 overzicht, gesorteerd per fase: lead → uitgenodigd → one-pager → presentatie → shopper → member. Sleep tussen fases of klik door.",
    watHebJeEraan:
      "Je ziet in 1 oogopslag waar je staat. Hoeveel mensen in welke fase? Waar lekt mijn pijplijn?",
    waar: "Menu → Namenlijst",
  },
  {
    emoji: "📋",
    titel: "Scripts (uitnodigen, bezwaren, follow-up, sluiting, edification)",
    watIsHet:
      "Een bibliotheek met kant-en-klare scripts voor elk gespreksmoment: 60-dagen-uitnodiging, Feel-Felt-Found-bezwaarrespons, follow-ups in 5 fases, closing met Doel-Tijd-Termijn, edification-formules.",
    watHebJeEraan:
      "Geen vrees voor 'wat zeg ik?'. Open scripts, kies de juiste, kopieer, vul de naam in en stuur.",
    waar: "Menu → Scripts",
  },
  {
    emoji: "💬",
    titel: "3-weg-gesprek-tool",
    watIsHet:
      "Per prospect een aparte sectie met de 5 voorgevulde stappen van een 3-weg-gesprek: aankondiging, introductie, 'stap terug', sponsor-opening, follow-up. Met je sponsor-naam al ingevuld.",
    watHebJeEraan:
      "Stap voor stap krijg je de juiste tekst klaar om te plakken. Voorkomt de 3 grootste fouten in 3-wegs.",
    waar: "Klik op een prospect → '💬 3-weg gesprek scripts'. Plus dashboard-tegel '🤝 Klaar voor 3-weg' met klaar-prospects.",
  },
  {
    emoji: "🎯",
    titel: "Productadvies-test",
    watIsHet:
      "Een online test (3 schalen) die jij naar prospects stuurt. Zij vullen 'm in, jij krijgt automatisch een productadvies op maat dat je kunt doorsturen. Plus aanvullende darmvragenlijst voor wie meer detail wil.",
    watHebJeEraan:
      "Geen handmatig analyseren wat iemand nodig heeft. Test invullen → resultaat → klant.",
    waar: "Op de prospect-kaart → 'Stuur productadvies-test'",
  },
  {
    emoji: "📤",
    titel: "Verzendtimer",
    watIsHet:
      "Een bericht NU schrijven en kiezen wanneer je het wil versturen: morgen 9u, over 2 dagen, over een week. Je krijgt op die dag een herinnering met de tekst klaar om te kopiëren.",
    watHebJeEraan:
      "Geen losse to-do's bijhouden. Je hebt een follow-up-bericht klaar in je hoofd → klik 'verzend later' → klaar.",
    waar: "Bij elke deel-knop — '⏱️ Verzend later'",
    nieuw: true,
  },
  {
    emoji: "📷",
    titel: "QR-code",
    watIsHet:
      "Bij elke deelbare link verschijnt nu een QR-knop. Tikt iemand erop tijdens een face-to-face moment, dan toont je scherm een grote QR. Andere persoon scant met camera-app → zit direct in de juiste pagina.",
    watHebJeEraan:
      "Geen 'stuur me even die link via WhatsApp'-omweg meer. Schermpje laten zien, scannen, klaar.",
    waar: "Naast Kopieer-link, in elke deel-flow",
    nieuw: true,
  },
  {
    emoji: "🎙️",
    titel: "Spraak-FAB (gouden microfoon)",
    watIsHet:
      "Onderin elk scherm staat een gouden microfoon-knop. Klik en spreek: 'Nieuwe prospect Jan uit voetbalclub' → Jan staat in je namenlijst. 'Follow-up over 3 dagen voor Linda' → herinnering klaar.",
    watHebJeEraan:
      "Onderweg, op de fiets, na een gesprek: niets typen, gewoon inspreken. Een minuut werk wordt 5 seconden.",
    waar: "Overal, gouden microfoon rechtsonder",
  },
  {
    emoji: "🛎️",
    titel: "Stilte-nudges",
    watIsHet:
      "Als je een dag of meer geen taak hebt afgevinkt, krijg je 's ochtends een vriendelijke prik. Bij 2+ dagen krijgt je sponsor ook een melding zodat 'ie even kan checken.",
    watHebJeEraan:
      "Je raakt het ritme niet kwijt. Sponsor weet wanneer je een schouderklop nodig hebt.",
    waar: "Automatisch (in je dagelijkse pushes)",
  },
  {
    emoji: "🔔",
    titel: "Sponsor-pushes bij activiteit",
    watIsHet:
      "Zodra een teamlid een playbook-stap voltooit, krijg jij als sponsor een push: '[Naam] — dag 5 stap voltooid'.",
    watHebJeEraan:
      "Realtime zicht op je teamleden. Gebruik die info om gericht te steunen — geen lange Zoom-checks.",
    waar: "Automatisch op je telefoon",
  },
  {
    emoji: "🧪",
    titel: "Test-modus",
    watIsHet:
      "Voor pilot-testers: een paarse toolbar bovenaan dashboard met 'Spring naar dag X'. Verzet je virtuele dag zodat je in een halve dag door alle 21 dagen kunt klikken.",
    watHebJeEraan:
      "Niet 21 dagen wachten om alles te testen. Springen, kijken, terugspringen.",
    waar: "Alleen voor users met is_tester=true of role='founder'",
    nieuw: true,
  },
  {
    emoji: "⚡",
    titel: "Voltooi-tracking + reminders",
    watIsHet:
      "Het systeem onthoudt wat je hebt afgevinkt. Belangrijke admin-stappen blijven zichtbaar als reminder bovenaan tot je ze hebt gedaan — ook al is die dag voorbij.",
    watHebJeEraan:
      "Niets glipt onder het tafelkleed. Een dag overslaan? Geen ramp — wat belangrijk is, blijft zichtbaar.",
    waar: "Dashboard, tegel '⚠️ Open setup-stappen'",
  },
  {
    emoji: "📅",
    titel: "Wekelijkse review",
    watIsHet:
      "Op dag 7, 14 en 21 een korte 5-min reflectie: wat ging goed, wat schuurde, waar focus ik volgende week. Sponsor leest mee — om te ondersteunen, niet beoordelen.",
    watHebJeEraan:
      "Patronen zien in plaats van blind doorlopen. Schurend stuk = volgende-week-oefening.",
    waar: "Dashboard → 'Wekelijkse review' op de review-dagen",
  },
  {
    emoji: "🎓",
    titel: "Onboarding (eerste login)",
    watIsHet:
      "6-stappen-walkthrough: welkom, WHY-gesprek met Mentor, project-uitleg, eerste 5 namen, uitnodigingsscript, dagdoelen.",
    watHebJeEraan:
      "Geen kale start. Je weet aan het einde wat je gaat doen, en hebt al je eerste namen + WHY in je profiel.",
    waar: "Automatisch bij eerste login. Daarna /onboarding?preview=true",
  },
  {
    emoji: "🤝",
    titel: "Sponsor-koppeling",
    watIsHet:
      "Elke member heeft een vaste sponsor (degene die hem/haar uitnodigde). Sponsor ziet activiteit, krijgt pushes, en is in 1 klik bereikbaar.",
    watHebJeEraan:
      "Niemand staat alleen. De lijn naar boven (mentor, vraagbaak) is altijd open.",
    waar: "Menu → Mijn Team",
  },
  {
    emoji: "🌐",
    titel: "Meertalig",
    watIsHet:
      "ELEVA is volledig vertaald in NL, EN, FR, ES, DE en PT. Member kiest zijn voorkeurstaal in instellingen.",
    watHebJeEraan:
      "Klaar voor internationale uitrol — niet eerst herbouwen voor Belgisch/Duits/Frans team.",
    waar: "/instellingen → taalvoorkeur",
  },
  {
    emoji: "🛒",
    titel: "Bestellinks (founder)",
    watIsHet:
      "Per Lifeplus-pakket plak je je eigen webshop-URL. ELEVA gebruikt die links automatisch in productadvies-flows.",
    watHebJeEraan:
      "Iedere member heeft zijn eigen verkooplink, geen handmatig knip-werk.",
    waar: "/instellingen/bestellinks",
  },
  {
    emoji: "⚖️",
    titel: "Compliance ingebouwd",
    watIsHet:
      "Nooit medische claims, nooit inkomenbeloften, automatische disclaimers bij elk productadvies, evidence-based gezondheidstaal.",
    watHebJeEraan:
      "Je hoeft niet bang te zijn dat je per ongeluk iets fout zegt. Het systeem houdt het netjes binnen Lifeplus AV en EU Claims Regulation.",
    waar: "Automatisch overal",
  },
];

export default function OverElevaPagina() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-cm-white">
          ELEVA — wat zit erin en wat heb je eraan?
        </h1>
        <p className="text-cm-white opacity-70 mt-2 leading-relaxed">
          Alle functies van ELEVA op een rij, in normale taal. Zodat je weet
          wat het systeem voor je doet en waar je wat kunt vinden — handig
          voor de pilot.
        </p>
      </div>

      <div className="card border-gold-subtle">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          Korte samenvatting
        </h2>
        <ul className="text-cm-white text-sm space-y-1.5 opacity-90">
          <li>
            <strong>Dagelijks gebruik:</strong> dashboard → playbook-tegel →
            klik-en-doen
          </li>
          <li>
            <strong>Bij twijfel:</strong> ELEVA Mentor (AI-coach)
          </li>
          <li>
            <strong>Voor 3-wegs:</strong> prospect-kaart → "💬 3-weg gesprek
            scripts"
          </li>
          <li>
            <strong>Voor productadvies:</strong> prospect-kaart → "Stuur
            productadvies-test"
          </li>
          <li>
            <strong>Voor jou als founder:</strong> ✍️ knoppen overal — pas aan
            wat schuurt, direct live
          </li>
          <li>
            <strong>Voor de testgroep:</strong> 🧪 toolbar bovenaan dashboard
            om snel door alle 21 dagen te klikken
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        {FEATURES.map((f, i) => (
          <div key={i} className="card space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h3 className="text-cm-white font-display font-semibold text-base">
                <span className="text-2xl mr-1.5">{f.emoji}</span>
                {f.titel}
              </h3>
              {f.nieuw && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
                  Nieuw
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-cm-white text-sm leading-relaxed">
                <strong className="text-cm-gold opacity-90">Wat is het?</strong>{" "}
                {f.watIsHet}
              </p>
              <p className="text-cm-white text-sm leading-relaxed">
                <strong className="text-cm-gold opacity-90">
                  Wat heb je eraan?
                </strong>{" "}
                {f.watHebJeEraan}
              </p>
              <p className="text-cm-white text-xs opacity-60 italic">
                📍 {f.waar}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-gold-subtle text-center space-y-2">
        <p className="text-cm-white text-sm">
          Vragen, bug-rapporten, of woordkeus die schuurt?
        </p>
        <p className="text-cm-white text-sm opacity-70">
          Geef het door in de pilot-WhatsApp-groep — founders houden het
          systeem live up-to-date.
        </p>
      </div>

      <div className="text-center pt-2">
        <Link href="/dashboard" className="btn-secondary text-sm">
          ← Terug naar dashboard
        </Link>
      </div>
    </div>
  );
}
