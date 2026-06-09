# ELEVA, wat zit erin en wat heb je eraan?

> **Voor de pilot, mei 2026**
> Een overzicht in normale taal van alle functies in ELEVA, zodat je weet wat het systeem voor je doet en waar je wat kunt vinden.
>
> Voor de korte versie ("waarom zou ik 'm gebruiken?"): zie `docs/ELEVA-pitch-onepager.md`.

---

## Rol-aware: je ziet alleen wat bij jouw rol past

Niet elke feature is voor iedereen. ELEVA filtert wat je ziet op basis van je rol in het systeem:

- **Member** (de gewone gebruiker, default voor iedereen): ziet alle dagelijkse-werk-features. Geen CMS-werk, geen instellingen voor de hele bibliotheek.
- **Leider** (sponsor met team): ziet hetzelfde als member, plus team-relevante zaken zoals stilte-nudges naar downline.
- **Founder** (hoofdbeheerder, voor nu Raoul): ziet alles, inclusief het CMS voor films, scripts, mentor-training en bestellinks.

Founder-only features zijn in dit document gemarkeerd met **🔒 Alleen voor founders**. Een member ziet ze niet in `/over-eleva`, niet in de rondleiding, en niet in de sidebar. Op die manier voorkomen we dat een gebruiker zelfs maar wéét dat er CMS-werk bestaat waar 'ie geen rechten op heeft.

**Verandering van rol:** als een member een sponsor wordt met team, of als de founder een tweede beheerder aanwijst, krijgt die persoon automatisch de extra features te zien zodra de rol in de database wijzigt. Geen herinstallatie, geen nieuwe app.

---

## 🏁 Het 21-daagse playbook

**Wat is het?**
Een dagelijkse tegel op je dashboard die je 21 dagen lang door het hele vak meeneemt. Per dag een korte teaching ("wat leer je vandaag"), een afvinklijst ("wat ga je vandaag doen"), en links naar de juiste plek in ELEVA.

**Wat heb je eraan?**
Je hoeft niet te bedenken wat je moet doen. Je opent ELEVA, ziet wat dag het is, en hebt direct je dag-acties in beeld. Geen overload, geen verloren ritme.

**Waar?** `/dashboard`, de gouden tegel "Vandaag is dag X".

---

## 📊 Voortgang-modus, niet kalender (NIEUW)

**Wat is het?**
Members staan op de eerste dag waar nog niet alles is afgevinkt, niet op kalenderdag. Sla je 5 dagen over door drukte? Morgen ben je nog steeds op dezelfde dag, niet 5 dagen verder. Founders en testers werken wel kalender-gebaseerd, zodat de tester-toolbar (sprint door de 21 dagen) blijft werken.

**Wat heb je eraan?**
Niemand verliest content of motivatie door een drukke periode. Je raakt niet 'achter', je gaat gewoon door waar je was. De 60-dagen-run is voortgang, niet een kalender-aftellertje.

**Waar?** Automatisch in het dashboard. Vandaag-flow gebruikt dezelfde berekening.

---

## 🎬 Welkomstfilm (NIEUW)

**Wat is het?**
De eerste keer dat een member z'n dashboard opent, krijgt 'ie automatisch een korte (~2 min) welkomstfilm te zien: wie zijn Raoul + Gaby, wat is ELEVA, hoe werkt het systeem, en "vertrouw het proces". Daarna altijd terug op te roepen via de 🎬-knop in de Topbar.

**Wat heb je eraan?**
Een nieuwe member voelt direct dat-ie binnen is bij iets met ziel, niet bij een tool die uit de fabriek komt. Sponsor hoeft niet alles zelf uit te leggen, het systeem doet het.

**Waar?** Automatisch op /dashboard bij eerste bezoek. Daarna 🎬-knop rechtsboven.

---

## 📺 Prospect-films sturen + tracken (NIEUW, killer-feature)

**Wat is het?**
Op een prospect-kaart staat de knop "Stuur film". Member kiest één van de prospect-films die founders hebben geüpload, krijgt een **unieke share-link**, en plakt die in WhatsApp. De prospect klikt en kijkt. ELEVA volgt **realtime** hoeveel procent is afgekeken.

Bij een drempel (bv. 80% gekeken):
- ELEVA schuift de prospect automatisch naar fase 'follow-up'
- Member krijgt een push: *"[Naam] heeft 73% van [film-titel] bekeken"*
- De juiste opvolg-tekst staat klaar op de prospect-kaart

**Wat heb je eraan?**
Geen "heb je 'm bekeken?"-appjes meer. Films werken voor je terwijl je slaapt of een bedrijf draait. Het wordt een actief verkoop-instrument in plaats van een passieve link in een WhatsApp-thread. Werkt voor YouTube én Vimeo.

**Waar?** Prospect-kaart → "Stuur film". Founder uploadt films via `/instellingen/films` (sectie "Prospect-films").

---

## 🎬 Films per dag (founder-CMS) 🔒

> **Alleen voor founders.**

**Wat is het?**
Een plek waar de founder per playbook-dag een YouTube/Vimeo-link kan plakken. Die film verschijnt automatisch boven de dagtegel.

**Wat heb je eraan?**
Members krijgen visuele uitleg op de juiste dag, in plaats van losse links die ze moeten zoeken. Geen film? Dan gewoon geen film-blokje, niets vervelends in beeld.

**Waar?** `/instellingen/films` (alleen founder).

---

## ✍️ Founder-bewerkbaar (jij bent de redacteur) 🔒

> **Alleen voor founders.**

**Wat is het?**
Op vrijwel elke tekst in ELEVA staat voor founders (jij + Gaby) een "✍️ Bewerk voor iedereen"-knop. Klik, pas aan, bewaar, direct live voor alle members.

**Werkt op:**
- Alle 21 playbook-dag-teksten (titel, teaching, dag-doel, "waarom dit werkt")
- Alle scripts (uitnodigingen, bezwaar, follow-up, sluiting, edification)
- De kerntitels en intro's van alle 6 onboarding-stappen

**Wat heb je eraan?**
Tijdens de pilot komt feedback over woorden, toon, voorbeelden. Jij past het direct zelf aan, geen developer-loop nodig.

**Waar?** Op de pagina zelf, naast de tekst die je wilt aanpassen.

---

## 🤖 ELEVA Mentor

**Wat is het?**
Een AI-mentor die je kent. Hij weet welke dag je zit, kent je WHY, kent je sponsor, en kent alle technieken (4-stappen-uitnodiging, Feel-Felt-Found, edification, FORM, Doel-Tijd-Termijn). Hij schrijft DM's, helpt bij bezwaren, doet roleplay, geeft productadvies.

**Wat heb je eraan?**
Je hoeft niet te bedenken wát je moet zeggen. Je vraagt de mentor en krijgt een antwoord in jouw stijl, klaar om te kopiëren of door te sturen. Werkt 24/7.

**Waar?** Menu → ELEVA Mentor.

---

## 🧠 Train-de-Mentor (NIEUW) 🔒

> **Alleen voor founders.**

**Wat is het?**
Founders kunnen vraag-antwoord-voorbeelden uit echte WhatsApp-gesprekken toevoegen aan de Mentor. Een prospect stelt een vraag, de member-of-founder antwoordt, founder kopieert beide en plakt het in `/instellingen/mentor-trainen`. De Mentor gebruikt die voorbeelden vanaf dat moment als context bij vergelijkbare vragen.

Voorbeeldvragen worden getagd voor doelgroep `member`, `prospect` of `beide` (default), zodat het ene voorbeeld zowel de huidige Mentor als de toekomstige programma-mentor voor prospects voedt.

**Wat heb je eraan?**
De Mentor wordt scherper met elke pilot-week, zonder developer-loop, zonder herstart. Members in Maastricht leren van gesprekken die in Dordrecht hebben gewerkt. Het hele systeem leert uit jouw praktijk.

**Waar?** `/instellingen/mentor-trainen` (alleen founder).

---

## 📝 Mijn zinnen

**Wat is het?**
Eén plek waar al je eigen geschreven teksten bij elkaar staan: edification-zin, closing-zin, why-stuk, etc. Je schrijft ze in het playbook (op dag 18 bijv.) en vindt ze hier altijd terug.

**Wat heb je eraan?**
Je hoeft niets te onthouden. Je edification-zin schrijf je één keer goed op dag 18, daarna gebruik je 'm bij elke 3-weg.

**Waar?** Menu → Mijn zinnen.

---

## 👥 Namenlijst (Pipeline-weergave)

**Wat is het?**
Al je prospects in 1 overzicht, gesorteerd per fase: lead → uitgenodigd → one-pager → presentatie → shopper → member. Sleep ze tussen fases of klik door naar een prospect-kaart voor alle details.

**Wat heb je eraan?**
Je ziet in 1 oogopslag waar je staat. Hoeveel mensen zitten in welke fase? Waar lekt mijn pijplijn? Geen losse Excel-blaadjes nodig.

**Waar?** Menu → Namenlijst.

---

## 🎯 Volgende-beste-actie radar (NIEUW)

**Wat is het?**
Op je dashboard staat een tegel met je top-3 prospects van **vandaag**. Niet alfabetisch, niet alle 47, maar de drie waar nu het meeste rendement zit. ELEVA weegt timing (hoe lang geleden contact), pipeline-fase (welke is rijp), en signalen (heeft prospect bv. een film gekeken).

**Wat heb je eraan?**
Verlost je van "waar begin ik?" Drie namen, drie acties, dag opent. De radar haalt voorrang weg bij wie geen aandacht hoeft, en zet voorrang op wie staat te wachten.

**Waar?** Dashboard, tegel "🎯 Volgende beste actie".

---

## 📋 Scripts (uitnodigen, bezwaren, follow-up, sluiting, edification)

**Wat is het?**
Een bibliotheek met kant-en-klare scripts voor elk gespreksmoment: 60-dagen-uitnodiging, Feel-Felt-Found-bezwaarrespons, follow-ups in 5 fases, closing met Doel-Tijd-Termijn, edification-formules.

**Wat heb je eraan?**
Geen vrees voor "wat zeg ik?". Open scripts, kies de juiste, kopieer, vul de naam in en stuur.

**Waar?** Menu → Scripts.

---

## 🎙️ Spraak-naar-uitnodiging (NIEUW)

**Wat is het?**
Op een prospect-kaart staat een microfoon-knop. Je drukt 'm in en spreekt context in: *"Ken Maria van de sportschool, business-getypt, druk leven, twee kinderen."* ELEVA zet dat door naar Worre's 4-stappen-uitnodiging in jouw stijl, met de "haast"-stap als optionele toevoeging voor business-prospects.

**Wat heb je eraan?**
De drempel naar 'eerste bericht sturen' wordt minimaal. Geen typen, geen perfectie-val, geen 'wat schrijf ik nou'. Spreek context, kopieer DM, plak in WhatsApp.

**Waar?** Prospect-kaart, microfoon-knop. Sluit aan op het algemene voice-everywhere principe.

---

## 💬 3-weg-gesprek-tool

**Wat is het?**
Per prospect een aparte sectie met de 5 voorgevulde stappen van een 3-weg-gesprek: aankondiging, introductie, "stap terug", sponsor-opening, follow-up. Met je sponsor-naam al ingevuld.

**Wat heb je eraan?**
Je hoeft niets zelf te bedenken bij een 3-weg. Stap voor stap krijg je de juiste tekst klaar om te plakken in het WhatsApp-groepje. Voorkomt de 3 grootste fouten.

**Waar?** Klik op een prospect → "💬 3-weg gesprek scripts".

**Bonus:** Op het dashboard verschijnt een tegel "🤝 Klaar voor 3-weg" met prospects die in presentatie- of one-pager-fase staan.

---

## 🎯 Productadvies-test

**Wat is het?**
Een online test (3 schalen) die jij naar prospects stuurt. Zij vullen 'm in, jij krijgt automatisch een productadvies op maat dat je kunt doorsturen. Plus aanvullende darmvragenlijst voor wie meer detail wil.

**Wat heb je eraan?**
Geen handmatig analyseren wat iemand nodig heeft. Test invullen → resultaat → klant.

**Waar?** Op de prospect-kaart → "Stuur productadvies-test".

---

## 📤 Verzendtimer

**Wat is het?**
Een bericht NU schrijven en kiezen wanneer je het wil versturen: morgen 9u, over 2 dagen, over een week. Je krijgt op die dag een herinnering met de tekst klaar om te kopiëren.

**Wat heb je eraan?**
Geen losse to-do's bijhouden. Je hebt een follow-up-bericht klaar in je hoofd → klik "verzend later" → klaar. Het systeem herinnert je op tijd.

**Waar?** Bij elke deel-knop, "⏱️ Verzend later".

---

## 📷 QR-code

**Wat is het?**
Bij elke deelbare link verschijnt nu een QR-knop. Tikt iemand erop tijdens een face-to-face moment (event, koffie, ouderavond, beurs), dan toont je scherm een grote QR. Andere persoon scant met camera-app → zit direct in de juiste pagina.

**Wat heb je eraan?**
Geen "stuur me even die link via WhatsApp"-omweg meer. Letterlijk schermpje laten zien, scannen, klaar.

**Waar?** Naast Kopieer-link, in elke deel-flow.

---

## 🎙️ Spraak-FAB (de gouden microfoonknop)

**Wat is het?**
Onderin elk scherm staat een gouden microfoon-knop. Klik en spreek: *"Nieuwe prospect Jan uit voetbalclub"*, Jan staat in je namenlijst. *"Follow-up over 3 dagen voor Linda"*, herinnering klaar. Werkt voor alle hoofd-acties.

**Wat heb je eraan?**
Onderweg, op de fiets, na een gesprek bij de school: niets typen, gewoon inspreken. Een minuut werk wordt 5 seconden.

**Waar?** Overal, gouden microfoon-knop rechtsonder.

---

## 🟢 Online-stip op teamleden (NIEUW)

**Wat is het?**
In je teamoverzicht zie je een groen bolletje bij teamleden die NU in ELEVA actief zijn (laatste activiteit < 2 minuten). Werkt twee kanten op: je sponsor ziet 'm bij jou, jij ziet 'm bij je downline.

**Wat heb je eraan?**
Je weet wanneer iemand bereikbaar is voor een snelle vraag, in plaats van in 't blinde te bellen. Sponsor weet wanneer een schouderklop of opmerking direct landt, in plaats van in een lege chat verdwijnt.

**Waar?** Mijn Team / TeamBoom-overzicht.

---

## 🔍 Wat ziet mijn sponsor van mij? (NIEUW)

**Wat is het?**
Een aparte transparantie-pagina onder /instellingen die eerlijk uitlegt welke data wordt gedeeld met je sponsor (activiteit, voltooide stappen, online-stip) en wat privé blijft (chat-inhoud met de Mentor, persoonlijke notities, prospect-namen). Plus een **toggle om je online-stip uit te zetten** voor wie liever niet zichtbaar is.

**Wat heb je eraan?**
Het privacy-bezwaar wordt nooit een muur. Je weet precies wat sponsor ziet, en je hebt de regie. Net zo open als wat het ELEVA-systeem zelf belooft te doen.

**Waar?** /instellingen → "Wat ziet mijn sponsor van mij?".

---

## 🛎️ Stilte-nudges (vriendelijke prikkel bij inactiviteit)

**Wat is het?**
Als je een dag (of meer) geen taak hebt afgevinkt, krijg je 's ochtends een vriendelijke prik. Bij 2+ dagen stilte krijgt je sponsor ook een melding zodat 'ie even kan checken.

**Wat heb je eraan?**
Je raakt het ritme niet kwijt. En je sponsor weet wanneer je een schouderklop kunt gebruiken, voor 'ie 'm zelf moet vragen.

**Waar?** Automatisch (in je dagelijkse pushes). Toggle via /instellingen.

---

## 🔔 Sponsor-pushes bij activiteit

**Wat is het?**
Zodra een teamlid een playbook-stap voltooit, krijg je als sponsor een push: *"[Naam], dag 5 stap voltooid: 5 namen toegevoegd"*.

**Wat heb je eraan?**
Je weet realtime hoe je teamleden lopen. Die info gebruik je om gericht te steunen, geen lange Zoom-checks.

**Waar?** Automatisch op je telefoon (push) als je teamleden hebt.

---

## 🧪 Test-modus (voor pilot-testers) 🔒

> **Alleen voor founders + users met `is_tester=true`.**

**Wat is het?**
Voor jullie 6-7 testers: een paarse toolbar bovenaan dashboard met "Spring naar dag X". Verzet je virtuele dag zodat je in een halve dag door alle 21 dagen kunt klikken voor bug-rapporten.

**Wat heb je eraan?**
Niet 21 dagen wachten om alles te testen. Springen, kijken, terugspringen.

**Waar?** Alleen voor users met `is_tester=true` of role='founder'.

---

## ⚡ Voltooi-tracking + reminders openstaande admin

**Wat is het?**
Het systeem onthoudt wat je hebt afgevinkt en wat nog open staat. Belangrijke admin-stappen (webshop, krediet, teams-admin, bestellinks) blijven zichtbaar als reminder bovenaan tot je ze hebt gedaan, ook al is die dag al voorbij.

**Wat heb je eraan?**
Niets glipt onder het tafelkleed. De ene dag overslaan? Geen ramp, wat belangrijk is, blijft zichtbaar.

**Waar?** Dashboard, tegel "⚠️ Open setup-stappen".

---

## 📅 Wekelijkse review

**Wat is het?**
Op dag 7, 14 en 21 een korte 5-min reflectie: wat ging goed, wat liep niet soepel, waar focus ik volgende week. Sponsor leest mee, niet om te beoordelen, om te ondersteunen.

**Wat heb je eraan?**
Patronen gaan zien in plaats van blind doorlopen. Jouw schurende stuk = volgende-week-oefening.

**Waar?** Dashboard → widget "Wekelijkse review" op de review-dagen.

---

## 🎓 Onboarding (eerste keer login)

**Wat is het?**
6-stappen-walkthrough als je voor het eerst ELEVA opent: welkom, WHY-gesprek met de Mentor, 60-dagen-uitleg, eerste 5 namen toevoegen, uitnodigingsscript lezen, dagdoelen instellen.

**Wat heb je eraan?**
Geen kale start in een vol systeem. Je weet aan het einde wat je gaat doen, en hebt al je eerste namen + WHY in je profiel staan.

**Waar?** Automatisch bij eerste login. Daarna te bekijken via `/onboarding?preview=true`.

---

## 🤝 Sponsor-koppeling

**Wat is het?**
Elke member heeft een vaste sponsor (degene die hem/haar uitgenodigd heeft). Sponsor ziet activiteit, krijgt pushes, en is in 1 klik bereikbaar via de FAB.

**Wat heb je eraan?**
Niemand staat alleen. De lijn naar boven (mentor, vraagbaak) is altijd open.

**Waar?** Menu → Mijn Team, voor jou als sponsor zie je alle members onder je.

---

## ☀️ Tijd-bewuste groet (NIEUW)

**Wat is het?**
Het dashboard begroet je met "Goedemorgen", "Goedemiddag", "Goedenavond" of "Goedenacht" afhankelijk van het moment. Werkt server-side in Europe/Amsterdam-tijdzone, dus geen rare flikker tussen server en browser.

**Wat heb je eraan?**
Klein detail, voelt menselijk. ELEVA praat tegen jou alsof er iemand achter zit, niet een server in een datacenter.

**Waar?** Dashboard, dagtegel-header, en het 'eerste bezoek vandaag'-modal.

---

## 📲 Pull-to-refresh op mobiel (NIEUW)

**Wat is het?**
Trek het scherm naar beneden vanuit bovenaan, ELEVA ververst de pagina. Spinner verschijnt, data komt opnieuw binnen. Werkt op iOS en Android.

**Wat heb je eraan?**
Het mobiele gevoel zoals je gewend bent van Instagram of Mail. Niet de hele app afsluiten als je een nieuwe push hebt gehad en wilt zien wat er is.

**Waar?** Op alle pagina's, mobiel.

---

## 🌐 Meertalig

**Wat is het?**
ELEVA is volledig vertaald in NL, EN, FR, ES, DE en PT. Member kiest zijn voorkeurstaal in instellingen.

**Wat heb je eraan?**
Klaar voor internationale uitrol, niet eerst herbouwen voor Belgisch/Duits/Frans team.

**Waar?** /instellingen → taalvoorkeur.

---

## 🛒 Bestellinks 🔒

> **Alleen voor founders.**

**Wat is het?**
Per Lifeplus-pakket plak je je eigen webshop-URL. ELEVA gebruikt die links automatisch in productadvies-flows.

**Wat heb je eraan?**
Iedere member heeft zijn eigen verkooplink, geen handmatig knip-werk nodig.

**Waar?** /instellingen/bestellinks.

---

## ⚖️ Compliance ingebouwd

**Wat is het?**
Nooit medische claims, nooit inkomenbeloften, automatische disclaimers bij elk productadvies, evidence-based gezondheidstaal. De Mentor weet wat wel en niet mag.

**Wat heb je eraan?**
Je hoeft niet bang te zijn dat je per ongeluk iets fout zegt. Het systeem houdt het netjes binnen Lifeplus AV en EU Claims Regulation.

---

## Korte samenvatting voor de pilot

- **Dagelijks gebruik:** dashboard → playbook-tegel → klik-en-doen
- **Bij twijfel:** ELEVA Mentor (AI-mentor)
- **Voor 3-wegs:** prospect-kaart → "💬 3-weg gesprek scripts"
- **Voor productadvies:** prospect-kaart → "Stuur productadvies-test"
- **Voor films naar prospects:** prospect-kaart → "Stuur film"
- **Voor jou als founder:** ✍️ knoppen overal, pas aan wat niet lekker loopt, direct live
- **Voor de testgroep:** 🧪 toolbar om snel door alle 21 dagen te klikken

**Vragen, bug-rapporten, woordkeus-feedback** kunnen via de pilot-WhatsApp-groep. Founders houden het systeem live up-to-date.
