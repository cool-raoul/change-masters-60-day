# Morgen-Raoul, vragen-stack na de nacht-bouw

> Verzameld tijdens nacht-bouw 2026-05-22 / 23. Loop door als je terug bent. Antwoorden in deze
> file noteren of in chat, dan vul ik morgen verder.

## Status nacht-bouw

Wordt bijgewerkt onderweg. Per commit volgt hier een korte regel met wat is gebouwd.

- Task 1: feature-flag `core_v6_actief` op profiles (SQL-migratie + lib helper). SQL nog niet gedraaid, ligt klaar in supabase/migrations/.
- Task 2: Mentor-profiel datamodel + SQL + helpers. SQL ligt klaar in supabase/migrations/.
- Task 3: Drie-laags Mentor Laag 1 (standaardvragen-bibliotheek). SQL + matcher klaar. Inhoud (30-50 vragen) nog leeg, wacht op Raoul-en-Gaby-input.
- Task 4: Drie-laags Mentor Laag 2 (model-tier-router). analyseerSignalen + kiesModelTier + modelIdVoorTier. Nog niet gekoppeld aan /api/coach, dat is een latere Fase.
- Task 5: Drie-laags Mentor Laag 3 (sponsor-escalatie). Tabel + log-functie + open-count helper. Push-notificatie naar sponsor nog niet, komt in latere Fase.
- Task 6: Drie-laags Mentor unified API (lib/mentor/index.ts). Eén functie vraagAanMentor() routeert door alle drie lagen. Nog niet gekoppeld aan /api/coach route (latere Fase, want huidige route is Sprint-stabiel).
- Task 7: Freebies datamodel + SQL + types + voorbeeld-toolkit. Vijf PLACEHOLDER-templates in code (energie / slaap / darm / sport / hormonen). TODO-GABY: claim-vrije inhoud per stuk schrijven.
- Task 8: Klantomgeving datamodel + SQL + types + pulse-momenten. Vijf tijdlijn-pulsmomenten gedefinieerd (dag 0 / 5 / 14 / 28 / 56). Mentor-acties + member-seintjes per pulse staan klaar. Inhoud kan Gaby morgen aanscherpen.
- Task 9: Core V6 21-ankerstappen-scaffold (lib/playbook/core-dagen-v6.ts). Mechanica + taken concreet, watJeLeert + waaromWerktDit zijn PLACEHOLDER met TODO-GABY-markers. Klaar voor schrijfsessie met Gaby.
- Task 10: CompactDMOBlok (K1-anti-overwhelm). Default ingeklapt, header toont 'X van Y vandaag'. Klikbaar af te vinken per taak.
- Task 11: KlantenTegel (K2-anti-overwhelm). Eén tegel op dashboard met aantal klanten + nieuwe signalen. Klik opent lijst /klant (route komt in Task 14).

## Verhelderingsvragen voor jullie (Raoul + Gaby)

### V6-content (kan ik niet zelf invullen)

1. **Welke 5 tot 10 freebies leggen we klaar in de founder-toolkit?**
   Onderwerpen die in V6 staan: energie, slaap, darmen, sport-prestatie, hormonen, immuniteit, ontstekings-remming.
   Welke 5 voor pilot? Welke vormen (pdf / mini-mailreeks / mini-film / mini-test)?

2. **De 21 Core-ankerstappen krijgen elke een `watJeLeert`-tekst en `doel`-zin in jullie stem.**
   Welke stappen mag de Mentor concepten voorstellen, welke schrijven jullie zelf vanaf nul?
   Voor pilot kan ik PLACEHOLDER zetten, maar voor live moet er content.

3. **De drie verhalen (Stap 8): persoonlijk / product / business.**
   Voorbeeld-verhalen in jullie stem als template voor members? Of laten we elke member zelf?

4. **Eric Worre edification-zin over sponsor.** Heb je een eigen template-zin die we als startpunt
   in de Mentor-prompt mogen zetten?

5. **Drie-laags Mentor standaardvragen (Laag 1): welke 30 tot 50 vragen?**
   Ik kan een eerste set van 20 voorstellen op basis van wat in de pilot is gevraagd, mag dat?

### Beslissingen die naar bouw vragen

6. **Klantomgeving 30-dagen-auto-delete.** Telt vanaf laatste klant-activiteit, of vanaf
   bestelling, of vanaf opt-in? Ik kies vanaf laatste-activiteit tenzij je iets anders zegt.

7. **Sponsor-escalatie opt-in.** Per escalatie vragen (telkens akkoord-knop) of één keer in
   Core-onboarding (Stap 1) een vinkje? Ik kies één keer in onboarding tenzij je iets anders zegt.

8. **Mentor-profiel rijke record.** Slaat als één JSON-blob op (snelle leesperformance, lastig
   te queryen) of als losse rijen per profiel-veld (queryable, meer overhead). Ik kies JSON-blob
   in `mentor_profielen.data` met getypeerde keys tenzij je anders zegt.

9. **Core V6 routes.** Nieuwe `/core-v6` route bouwen naast bestaande `/welkom-core`, of vervang
   ik de bestaande direct? Ik bouw NAAST (`/core-v6`) tenzij je iets anders zegt. Switch via
   feature-flag `core_v6_actief` in `profiles`.

### Open V6-vragen die in het document staan

Deze staan in `OVERZICHT-CORE-V6.html` onderaan, hier alleen als checklist:

- Hoe slaan we het Mentor-profiel op? (zie #8 hierboven)
- Welke doel-types kunnen worden ingesteld?
- Klantomgeving, hoe wordt-ie aangemaakt? (auto / handmatig / uitnodig-mail)
- Wat als prospect klantomgeving-uitnodiging niet activeert?
- Exacte zinnen verfijnen (Raoul-en-Gaby-toon)
- Tempo-verschil, hoe communiceer je dat?
- Mentor als les-curator, hoe veilig houden? (K5-kompas dekt dit deels)
- Escalatie-trigger Mentor naar sponsor, wanneer precies?
- DMO + ankerstap, hoe naast elkaar tonen op /vandaag? (K1-kompas dekt dit)
- Freebie-toolkit, welke 5 tot 10 freebies?
- Eigen-freebie-flow met Mentor, hoe zwaar?

## Aannames die ik maak tijdens de nacht (om door te bouwen, kun je morgen omdraaien)

- **Bouw alles als skelet naast bestaande code, niet in plaats van.** Sprint blijft 100% draaien.
- **DB-migraties als SQL-files in `supabase/migrations/` met datum-prefix.** Niet uitvoeren, jij
  draait ze morgen in Supabase SQL editor.
- **Feature-flag `core_v6_actief` in `profiles`** beschermt nieuwe routes. Default false.
- **PLACEHOLDER-content** waar Gaby moet schrijven, duidelijk gemarkeerd in code-comments.
- **Anti-overwhelm-kompas K1 tot K5** als toets bij elke nieuwe UI.
- **Geen content-changes aan bestaande Sprint-teksten.**
- **`npm run build` moet groen blijven na elke commit.**
