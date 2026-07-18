# Resetcode: dagelijkse check-in + Groeipad + push (ontwerp, akkoord Raoul 18 juli)

Raoul gaf akkoord ("bouwen maar!") op het ontwerp uit de brainstorm. Doel: een
reden om elke dag in te loggen, een dagboek dat de Mentor bijhoudt, en een
visueel pad dat de reis van A tot Z toont. Bouwvolgorde: check-in → Groeipad →
push.

## 1. Dagelijkse check-in (het dagboek, de motor)

Bij het eerste bezoek van een nieuwe dag opent de Mentor met een klein
momentje: "Hoe voel je je vandaag?" met drie tik-opties (top / gaat wel /
zwaar), optioneel gewicht en een vrij zinnetje. Twintig seconden. Alles wordt
onthouden en de Mentor doet er iets mee (streak benoemen, bij stilstand de
woosh-uitleg). Op verzoek ("mijn voortgang") een voortgangs-kaart: gewichtslijn
+ gevoels-reeks van begin tot nu. Werkt door alle programma's heen en voedt het
eind-gesprek met de begeleider.

Data: `resetcode_checkin` (link_id, datum uniek per dag, stemming, gewicht,
taille/heup/borst optioneel, notitie). Meet-waarden mogen leeg; gewicht is de
belangrijkste dagelijkse.

## 2. Het Groeipad (het gezicht)

De stap-pill wordt een vol pad-scherm (stijl van het Duolingo-achtige mockup):
- Alle fases van het huidige programma als stations op een slingerpad.
- Binnen de actieve fase de dagen als bolletjes; "JIJ" pulseert op de dag van nu.
- Afgeronde stappen met een vinkje; klikbaar om terug te lezen (chat blijft de bron).
- Vooruit: komende fases zichtbaar met naam + emoji maar met een slotje ("komt na fase 2"). Wel overzicht, niet openen.
- Als vergezicht bovenaan: de vervolg-programma's (na darm: Holistic Reset + Dagelijkse basis) als bergtoppen.
De check-in kleurt het dag-bolletje in → zichtbare streak.

Dag-nummer komt uit `station_sinds` (al aanwezig). Geen extra opslag nodig
behalve de check-ins voor de streak-kleuring.

## 3. Push (de aanjager)

Hergebruik van het Mini-ELEVA-patroon (prospect-subscriptions zonder account).
- Nieuwe tabel `resetcode_klant_subscriptions` (link_id + endpoint + keys), upsert op (link_id, endpoint).
- Client-opt-in component (kopie van ProspectPushOptIn) via /api/resetcode/push-subscribe.
- Eerlijk: browser/OS vraagt altijd één keer toestemming; op iPhone moet de app op het beginscherm staan (moedigen we al aan). We vragen het op een natuurlijk moment op dag 1 ("zal ik je elke ochtend een seintje geven voor je check-in?").
- Seintjes: ochtend-check-in-herinnering (later via cron), plus de bestaande momenten (dag 10-video, fase-overgang) kunnen hierheen.

## Bouwstenen

- lib/resetcode/klant-links.ts: check-in-status + laatste meetpunten meesturen.
- app/api/resetcode/checkin: check-in opslaan + streak teruggeven.
- app/api/resetcode/push-subscribe: abonnement per link.
- components/resetcode/MentorWereld.tsx: dagelijkse opening, voortgangs-kaart, Groeipad-scherm, push-opt-in.
- app/k/[token]/page.tsx: check-in-vandaag-gedaan + reeks meegeven.

## Buiten deze ronde

De cron die 's ochtends de push echt verstuurt (los aan te zetten); geavanceerde
grafieken; export van het dagboek.
