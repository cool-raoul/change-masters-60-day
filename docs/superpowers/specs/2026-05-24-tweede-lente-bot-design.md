# Tweede Lente Bot, Design

> Pilot voor de freebie-bot-architectuur. Lead-magnet voor het team. Doelgroep:
> vrouwen in peri-, volle of post-overgang. Eindstation: opt-in voor 5-mail-reeks +
> productlinks (drempelvrij zelf-bestelbare supplementen) + optioneel persoonlijk
> contact-aanbod. Bot-content is claim-vrij geformuleerd (EFSA + ACM-compliant).

## Doel

Een korte (5-10 minuten) web-bot die vrouwen in de overgang naar een team-vrouw
van Lifeplus toeleidt door:

1. Herkennende vragen + persoonlijke spiegel in het Eleva-team-stem
2. Lichte richting-suggestie (3 aanpassingen + 3 supplementen) zonder claim
3. Eind-opt-in voor mailreeks + member-Mini-ELEVA-koppeling
4. Optioneel persoonlijk-contact-aanbod via de team-vrouw die verwees

De bot is geen ChatGPT-vervanger. De toegevoegde waarde zit in: Eleva-stem,
echte vrouw-aan-de-andere-kant, vervolg via mailreeks + Mini-ELEVA, en
herkenning binnen het team-collectief.

## Doelgroep

Vrouwen in peri- / volle / post-overgang. De bot vraagt in de eerste stap
naar de fase en past de patroonherkenning daarop aan. Geen leeftijdsgrens
in de UI; member-vrouwen schatten zelf in welke fase zij voelen.

## Lead-attributie via tracking-token

Elke team-member krijgt per bot een **unieke 16-char hex tracking-token**.
Same patroon als productadvies-test (`/test/[token]`).

- URL: `/bot/tweede-lente/[token]`
- Token-tabel: `freebie_bot_member_tokens` met (member_id, bot_slug, token).
  Eén actieve token per (member_id, bot_slug)-combinatie.
- Member ziet haar persoonlijke link in haar dashboard (kopieer-knop) en
  plakt die in social posts, DM's, bio-link.
- Bij bezoek zonder token of met onbekend token: redirect naar een korte
  landingspagina "deze link is niet geldig, vraag een team-vrouw om een
  geldige link". GEEN keuze-formulier voor de vrouw.

De vrouw zelf vult dus **alleen e-mail + naam** in. De koppeling aan de
team-vrouw gaat volautomatisch via de token.

## Vier blokken in de bot

### Blok 1, Warme intro

Statische zin in het Eleva-team-stem (geen Gaby-specifiek). Member-tag
wordt impliciet meegegeven door token, maar de team-vrouw-naam wordt
NIET getoond aan de prospect om twee redenen:

1. Naam-mismatch tussen social en systeem (Raoul, 2026-05-24)
2. De vrouw moet zich op zichzelf richten, niet op de afzender

Concept-tekst (Gaby vult in):
> *"Welkom 💟 Fijn dat je hier bent. Wij zijn vrouwen die door deze fase
> zijn gegaan en wij hebben deze ruimte voor jou gemaakt. Vijf minuten,
> zeven vragen, en aan het eind een spiegel + een paar concrete ideeën
> waar veel vrouwen in jouw fase voor kiezen. Klaar?"*

Knop: "Ja, start de vragen".

### Blok 2, Vragen-blok (7 vragen, één per scherm)

Voortgangsbalk bovenaan (1/7, 2/7, ...). Geen vrije tekst, alleen
multi-choice voor voorspelbaarheid + AI-veiligheid.

**Vraag 1: Fase-keuze.**
*"In welke fase voel je je nu?"*
- Pre-overgang (ik merk subtiele veranderingen, maar mijn cyclus loopt nog)
- Peri-overgang (mijn cyclus is onregelmatig, of er gebeurt duidelijk iets)
- Volle overgang (ik zit er midden in, hormonen zijn duidelijk anders)
- Post-overgang (mijn cyclus is een tijd weg, ik zoek het nieuwe ritme)
- Ik weet het niet precies (gewoon nieuwsgierig)

**Vraag 2: Wat valt op?** (1-3 keuzes)
*"Wat valt je het meest op in je lichaam de laatste maanden?"*
- Energie-patroon (moe op andere momenten dan vroeger)
- Slaapritme (anders inslapen, doorslapen of vroeg wakker)
- Stemming (vlakker, korter lontje, of meer reflectie)
- Warmte-golven (opvliegers, nachtelijke warmte)
- Cyclus-veranderingen (intensiteit, lengte, frequentie)
- Lichaamsbeleving (gewicht-verschuiving, gewrichten, huid)
- Mentaal helder-zijn (concentratie, woord-vinden, vermoeidheid in hoofd)

**Vraag 3: Eet-ritme.**
*"Hoe loopt eten op een gewone dag?"*
- Regelmatig en bewust
- Onregelmatig, maar wel gevarieerd
- Vaak iets snels tussendoor
- Ik wisselt het sterk per dag

**Vraag 4: Beweging.**
*"Hoeveel beweeg je op een gewone week?"*
- Stevig: meer dan 3 keer per week iets fysieks
- Licht: 1-2 keer per week iets, plus dagelijks wat lopen
- Wisselend: soms wel, soms helemaal niet
- Weinig op dit moment

**Vraag 5: Rust en ontspanning.**
*"Hoe makkelijk kun je echt rusten?"*
- Goed, ik kan zonder schuldgevoel niets doen
- Wisselend, hangt van de dag af
- Lastig, mijn hoofd staat vaak aan
- Bijna niet, ik draai door

**Vraag 6: Met wie deel je dit?**
*"Met wie deel je wat je in deze fase ervaart?"*
- Mijn partner
- Een vriendin of vrouw uit mijn omgeving
- Mijn huisarts of een professional
- Eigenlijk met niemand echt

**Vraag 7: Wat zoek je vandaag?**
*"Wat zou jij vandaag het liefst willen?"*
- Iets om mee te beginnen (kleine stap)
- Begrip dat ik niet de enige ben
- Een rustige spiegel op waar ik nu sta
- Concrete kennis over wat in deze fase werkt

### Blok 3, Spiegel-blok (AI Haiku, template-bewaakt)

AI Haiku ontvangt de 7 antwoorden + een **strakke system-prompt** die haar
beperkt tot:

1. Eén openings-zin van ongeveer 2 regels, in Eleva-team-stem ("warm,
   herkennend, geen advies, geen belofte").
2. Eén patroon-paragraaf (3-4 regels) die opmerkt welke combi opvalt
   ("we zien dat je [thema] aangeeft + [thema], dat is een patroon dat
   we vaker horen bij vrouwen die...").
3. Drie aanpassingen (concrete, eenvoudige zinnen).
4. Eén afsluitings-zin die overgaat naar het opt-in-blok.

De system-prompt bevat **vooraf-vastgelegde EFSA-veilige template-zinnen**
waar de AI uit moet kiezen voor de drie aanpassingen. Bv:
- "Iets meer water in de ochtend bewust drinken"
- "Een vast moment per dag voor stilte van vijf minuten"
- "Een wandeling als bewuste afsluiter van de dag"
- "Een eet-ritme dat met je energie meeschuift"
- "Aandacht voor wat je 's avonds eet"
- "Twee dagen per week iets fysieks dat je leuk vindt"

Geen producten in dit blok. Producten komen in het volgende blok.

### Blok 4, Opt-in + product-blok + contact-aanbod

**Sub-blok 4a, Mailreeks-opt-in:**
> *"Wil je vijf avonden een korte mail over [hun thema-A] + [thema-B]?
> Geschreven door vrouwen uit ons team die deze fase hebben gelopen.
> Niet om iets te beloven, wel om je opties te tonen."*
>
> Velden: voornaam + e-mailadres + checkbox toestemming.

**Sub-blok 4b, Product-richting (claim-vrij):**
> *"Wat veel vrouwen in jouw fase als laagdrempelig startpunt kiezen,
> zonder gesprek of programma vooraf, zijn drie supplementen die je
> zelf in onze webshop kunt bestellen:*
>
> - *MenaPlus, vaak gekozen door vrouwen in volle of post-overgang*
> - *Women's Gold, vrouwen-specifiek dagelijks basis-supplement*
> - *Vitamins D & K, breed gekozen ondersteuning*
>
> *Geen advies, wel een richting. Voor specifieke vragen of een
> persoonlijke kennismaking kun je hieronder iemand uit ons team
> erbij vragen."*
>
> Drie productlinks naar de webshop van de team-vrouw (via haar
> bestellinks die in ELEVA gekoppeld zijn). Geen claim-zinnen
> ("helpt bij" / "ondersteunt" / "verlicht").

**Sub-blok 4c, Persoonlijk contact-aanbod (optioneel):**
> *"Wil je dat een vrouw uit ons team binnen een paar dagen contact
> opneemt voor een vrijblijvend gesprekje van 15 minuten? Geen
> verkoopgesprek, wel iemand die meedenkt over jouw fase."*
>
> Checkbox (default uit). Bij aanvinken: notificatie naar de
> team-vrouw via haar Mini-ELEVA dashboard.

**Sub-blok 4d, Prominent disclaimer:**
> *"Dit is geen medisch advies. Voor specifieke klachten, een
> persoonlijke aanpak of vragen over je gezondheid, raadpleeg
> altijd je huisarts of gynaecoloog. Onze bot deelt ervaringen
> en richtingen, geen behandeling."*

## De 5-mail-reeks (over 5 dagen, dagelijks)

Onderwerpen volgens jullie eerdere brainstorm (mei 2026):

1. **Dag 1, Ritme.** Wat een vast ritme doet in deze fase. Verwijzing
   naar de drie aanpassingen die de bot suggereerde.
2. **Dag 2, Voeding.** Eenvoudige voedings-aandachtspunten. Verwijzing
   naar de Lifeplus-supplementen als laagdrempelige basis.
3. **Dag 3, Rust en ontspanning.** Vijf minuten stilte als instap.
4. **Dag 4, Lichaamswijsheid.** Hoe je naar signalen kunt luisteren
   zonder ze te interpreteren als alarm.
5. **Dag 5, Contact-aanbod.** Persoonlijk-gesprek-uitnodiging + drie
   productlinks + de mogelijkheid om in Mini-ELEVA verder te kijken.

Tekst per mail: Eleva-team-stem, 200-300 woorden, claim-vrij. Gaby
levert eerste concept aan. Raoul + Claude doen een claim-vrij-review
op elke zin tegen EFSA + ACM voordat de reeks live gaat. (Mentor-feature
is NIET de checker, dit is een handmatige menselijke review-stap.)

## Trigger-mechaniek (hoe een team-vrouw de bot inzet)

In het Eleva-dashboard onder "Mijn freebies" ziet elke team-vrouw:
- Een lijst beschikbare freebie-bots
- Per bot: haar unieke tracking-link met kopieer-knop
- Per bot: aantal opt-ins via haar link (counter)
- Per bot: kort beheers-overzicht (datums, statussen)

Voorbeeld-zin voor de social-post die zij in haar bio plakt of in een
trigger-woord-reactie stuurt:
> *"Wil je 5 minuten naar je eigen ritme kijken in deze fase? Reageer
> met TWEEDE-LENTE en ik stuur je m'n persoonlijke link."*

De vrouw reageert, de team-vrouw stuurt haar tracking-link via DM. Zo
houdt de team-vrouw zelf controle over wie haar link krijgt, en de
prospect heeft het gevoel van een persoonlijke uitnodiging.

## Tech-architectuur

**Routes:**
- `/bot/tweede-lente/[token]` - bot-pagina, openbaar
- `/bot/tweede-lente` - landingspagina "vraag een team-vrouw om een geldige link"
- `/api/freebie-bot/start` - POST, ontvangt token, returnt member_id + bot-config
- `/api/freebie-bot/spiegel` - POST, ontvangt antwoorden, returnt AI-spiegel
- `/api/freebie-bot/opt-in` - POST, slaat lead op + opent Mini-ELEVA
- `/instellingen/freebies` - bestaande pagina, uitgebreid met "Mijn tracking-links" sectie

**DB:**
- `freebie_bot_member_tokens` (NIEUW): id, member_id, bot_slug, token (unique), created_at
- `freebie_opt_ins` (BESTAAT): uitbreiden met kolom `bot_antwoorden jsonb` + `spiegel_tekst text`

**AI:**
- Claude Haiku via bestaande Anthropic-integratie
- System-prompt met strakke claim-vrije template-zinnen
- Max 500 tokens output per spiegel

**Mini-ELEVA-koppeling:**
- Bij opt-in: maak rij in `klantomgeving_klanten` aan met member_id + lead_email
- Status: nieuw
- Bron: tweede-lente-bot
- Member krijgt push-notificatie in haar dashboard

## Claim-vrije bewaking

Drie lagen verdediging:

1. **Vraag-niveau**: alle vragen zijn multi-choice, geen vrije tekst die
   AI als input krijgt. Voorkomt dat de AI door een open antwoord wordt
   verleid tot een claim-zin.
2. **System-prompt-niveau**: de AI mag de spiegel-paragraaf alleen
   opbouwen uit vooraf-vastgelegde template-zinnen. Geen vrije generatie
   van adviezen.
3. **Eind-blok-niveau**: het opt-in + product + contact-blok is volledig
   statisch in code. Geen AI-tussenkomst.

Bewaakte vocabulaire (verboden in alle teksten):
- helpt bij, verlicht, verbetert, ondersteunt klacht, lost op, verhelpt,
  geneest, behandelt, werkt tegen
- "bewezen", "gegarandeerd", "wetenschappelijk aangetoond"
- Specifieke claims over hormonen, opvliegers, slaap, stemming

Toegestane vervangingen:
- "veel vrouwen in deze fase kiezen voor..."
- "wordt vaak ervaren als..."
- "een richting die veel vrouwen rust geeft..."
- Productnamen worden altijd zonder claim-zin genoemd (alleen naam + neutrale beschrijving zoals "vrouwen-specifiek dagelijks basis-supplement")

## Wat de pilot oplevert (succes-criteria)

- Acht team-vrouwen testen Tweede Lente in week 1
- Doelmeting: 20+ opt-ins in eerste 14 dagen na live-gaan
- Mailreeks-open-rate boven 40%
- Twee tot vijf persoonlijk-contact-aanvragen in eerste maand
- Geen EFSA / ACM-klachten

Na pilot: dezelfde architectuur als template voor de andere zeven bots
(Slaap-Loep, Energie-Loep, etc.).

## Open vragen voor Gaby (Raoul vangt op)

1. Definitieve openings-tekst van Blok 1 (2-3 zinnen in haar stem)
2. Tien template-zinnen voor de "drie aanpassingen" (claim-vrij)
3. Vijf mail-templates van 200-300 woorden per stuk
4. Toon-voorbeelden uit haar eigen ervaring (twee of drie korte
   anekdotes die in mails of bot-spiegel ingezet kunnen worden)
5. Welke productlink-pagina's gebruikt het team voor MenaPlus,
   Women's Gold, Vitamins D&K (worden ze uit bestellinks-koppeling
   getrokken of statische URL's)

## Niet in scope voor pilot

- Per-team-vrouw personalisatie van bot-content (later mogelijk)
- WhatsApp-Bot-integratie (bot is web-only voor pilot)
- AB-testing varianten (eerst één werkende versie)
- Multi-language (Nederlands-only voor pilot)
- Pro-modus-specifieke variant (Pro krijgt later eigen bot-set)
