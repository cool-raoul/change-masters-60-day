# Podcast-freebie (Sandy) — ontwerp

Datum: 2026-06-23. Status: ONTWERP, wacht op Raoul's go + keuzes.

## Doel
Podcast (Erit & Monique) → Sandy's welkomstfilm → freebie: gegevens + korte
test → darm-kuur-advies (Darm in balans / Darm in balans plus) als laagdrempelige
start (ideaal ook richting de Reset, en makkelijk te plannen rond vakanties),
met de Reset als grotere vervolg-reis. Contact-knop voor persoonlijk advies.

## Architectuur (volgt freebie-bot-architectuur-regel — GEEN eigen tabel/API)
- Nieuwe geregistreerde freebie-bot (slug TBD), `type: "score"`.
- Hergebruikt opt-in/contact/mail-queue/pipeline automatisch.
- Flow gemodelleerd op reset-check: `app/bot/<slug>/[token]/{page.tsx, flow.tsx}`.

## Flow (stappen)
1. Sandy-welkomstfilm (MediaBlokken `teaser`).
2. Gegevens: e-mail + telefoon (VERPLICHT), Instagram + Facebook (optioneel).
3. Korte test: darm-vragen (kern → kuur-score) + doel-vraag + sleutel-profiel
   (geslacht/leeftijd, afval-wens) + medische zelf-check.
4. Uitkomst: darm-kuur (Darm in balans / Darm in balans plus) als start, met de
   Reset als vervolg.
5. Informatie-film (MediaBlokken `verdieping`).
6. Contact-knop (persoonlijk advies).

## Vragen
- **Darm (kern, scoort):** hergebruik `lib/zelftest/darm-vragen.ts` (15 vragen,
  drempel 20 → "basis" = Darm in balans / "plus" = Darm in balans plus).
- **Doel-vraag (nieuw, claimvrij):** "Wat zou je positief willen veranderen?"
  opties: meer energie · wat lichter worden · beter slapen · meer rust/balans ·
  comfortabeler vanbinnen · fitter & sterker · anders (vrij veld).
- **Profiel:** geslacht + leeftijd, afval-wens (uit reset-check).
- **Medisch:** reset-check `MEDISCHE_PUNTEN` (zelf-check + disclaimer).
- **ANTI-OVERWHELM:** NIET alle 13 reset-score-vragen er ook nog bovenop. De
  darm-vragen zijn de scorende kern; reset wordt als vervolg benoemd.

## AVG (privacy-by-design)
- **Medische antwoorden: ALLEEN client-side.** Worden NIET meegestuurd naar de
  opt-in → nooit opgeslagen. Gebruikt voor de veiligheids-disclaimer + om in de
  uitkomst te sturen ("bespreek dit even met Sandy voor je start"). Sandy hoort
  de details in het persoonlijke gesprek (natuurlijk gesprek, niet opslaan).
- **Darm:** alleen de uitkomst-bucket opslaan (zoals productadvies-darmtest),
  niet de losse antwoorden.
- **Doel + profiel:** in `antwoorden` zoals gebruikelijk (geen medische data).

## Koppeling aan de warm-trigger-funnel (gisteren gebouwd)
- **Lead → namenlijst:** automatisch via `/api/freebie-bot/opt-in` + 🌷-marker.
- **Contact-knop:** `/api/freebie-bot/contact` → `warmNaarOpvolgen` (naar Opvolgen
  + herinnering) + push. AL GEBOUWD.
- **Informatie-film bekeken (na capture):** YouTube-%-tracking (zoals
  prospect-film / mini-eleva-film) → melding + `warmNaarOpvolgen`. NIEUWE
  koppeling in deze freebie.

## Open keuzes voor Raoul (vóór bouw)
1. Slug + bot-titel + ManyChat-trigger-woord.
2. Doel-vraag-opties akkoord?
3. Medisch NIET opslaan akkoord (let op spanning: "meer info" vs "niks opslaan";
   voorstel = client-side + via gesprek, niet opslaan).
4. Uitkomst-focus: darm-kuur primair + Reset als vervolg, akkoord?
5. Anti-overwhelm: darm als scorende kern, NIET alle reset-vragen erbij, akkoord?

## Bouw in fasen (na go)
- Fase 1 (skelet om op te schieten): bot registreren + flow met Sandy-video +
  gegevens + contact-knop + darm-vragen + darm-uitkomst.
- Fase 2: doel-vraag + profiel + medische zelf-check (client-side) + rijkere
  uitkomst (darm + Reset-vervolg).
- Fase 3: informatie-film + video-watch-trigger.
