# Sprint 60 Day Run, Audit

> **Status:** read-only audit. Geen wijzigingen aan code tot Raoul + Gaby gemarkeerd hebben wat aangepakt moet worden.
> **Wat ingevuld:** Dag 1 + maandag-weekritme als sample. Rest van dagen 2-21 + dinsdag–zondag volgt na stijl-akkoord.
> **Bronbestanden:** [lib/playbook/dagen.ts](lib/playbook/dagen.ts) (dag 1-21) · [lib/playbook/weekritme.ts](lib/playbook/weekritme.ts) (dag 22-60)

## Audit-categorieën per dag

- **Wat staat er**, 1-2 zinnen samenvatting
- **Lijkt goed**, wat ik zou laten staan
- **Schurende taal**, woorden of zinnen die ik anders zou voorstellen, met motivatie
- **Onlogica in opdrachten**, instructies die elkaar tegenspreken of verwarren
- **Hiaten**, wat ontbreekt
- **IP-vermeldingen**, alle plekken waar IP / 200 / 150 voorkomen (wachten op 150-vs-200-beslissing)
- **Pakket-vermeldingen**, Lifeplus-product/pakket-namen (wachten op pakket-herziening)
- **Filmpjes**, `filmSlug`-velden, of plekken waar een film logisch zou zijn

## Hoe Raoul + Gaby dit gebruiken

1. Loop het door, markeer per blok wat aangepakt mag worden, bv. `[FIX]` voor "graag aanpassen", `[NEE]` voor "laten staan", `[?]` voor "twijfel, bespreken".
2. Stuur het terug.
3. Ik voer de gemarkeerde wijzigingen uit in volgorde, in kleine commits per dag.

---

## Dag 1, 🚀 Welkom! Vandaag leg je je fundament

**Wat staat er:** Twee verplichte taken, telefooncontacten importeren (`vcard-upload` inline embed, vereistMobiel) + sponsor-melding (`sponsor-melding` inline embed). Lange `watJeLeert` over "voorraadkast", "aantallen-verhaal", "NIVEA komt morgen", "jij laat zien, zij beslissen", en "overweldigd voelen is normaal".

**Lijkt goed:**
- Toon is warm en eerlijk, geen pushy verkooptaal.
- *"Jij laat zien, zij beslissen"* als kern-mental-shift is sterk.
- *"Niet alleen"* boodschap aan het eind voelt juist voor dag 1.
- `vereistMobiel: true` op vcard-upload is netjes afgevangen.
- `waaromWerktDit` zonder bron, past bij eigen-stem; je hoeft niet alles aan Worre toe te schrijven.

**Schurende taal:**
- *"We ontdubbelen automatisch"* (regel 56), technisch jargon. Voorstel: *"Dubbele namen worden niet apart geteld."*
- *"fundament-dag"* (regel 53), koppelteken voelt los. Voorstel: *"fundamentdag"* of *"rustige fundament-dag"* voluit.
- *"OVERWELDIGD VOELEN IS NORMAAL"* (regel 85), caps voelt geforceerd in een afsluiter. Voorstel: kleine letters, gewoon zachte zin: *"Overweldigd voelen is normaal."*
- *"geldt voor iedereen hetzelfde"* (regel 85), komt ook in [fasen.ts](lib/playbook/fasen.ts) regel 17 voor. Herhaling tussen fase-intro en dag 1 voelt redundant, eentje schrappen.

**Onlogica in opdrachten:**
- Geen.

**Hiaten:**
- Geen verbinding met **webshop-frame** uit V5-besluiten. Sprint dag 1 noemt webshop nog niet als kernframe, past dat hier wel bij Sprint, of komt het pas dag 2 met de webshop-aanmaak-taak? Beslissing nodig.
- Veronderstelt dat **WHY al is ingevuld** ("Je onboarding zit erop, dus je WHY staat al"). Wat als die niet af is? Geen fallback-instructie.
- Geen verwijzing naar `/mijn-why` als terug-link voor wie de WHY wil bijwerken.

**IP-vermeldingen:** geen.

**Pakket-vermeldingen:** geen.

**Filmpjes:** geen `filmSlug`. Niet nodig, `vcard-upload` en `sponsor-melding` inline embeds doen het werk. Welkomstfilm zit elders ([components/welkom/WelkomstFilm.tsx](components/welkom/WelkomstFilm.tsx)).

---

## Maandag, Plannen (weekritme dag 22-60)

**Wat staat er:** 7 taken (5 verplicht), focus = pipeline-review + week-planning + dagelijkse aantallen (10 invites, 10 follow-ups, 3 namen). Optioneel inhaaldag inbouwen + week-plan delen met sponsor.

**Lijkt goed:**
- *"Een week die je niet plant, plant jou"* in `teaching` is sterk en geheugenwaardig.
- Combinatie planning + dagelijkse aantallen op maandag, voorkomt dat planning een vlucht-activiteit wordt.
- Inhaaldag-systematiek + 50% verhoging is helder en niet-veroordelend.
- *"Pak pen en papier als ELEVA even te klein voelt. Het resultaat hoort in ELEVA, het denken mag overal."*, mooi.

**Schurende taal:**
- *"3 prioriteit-prospects kiezen"* (`ma-week-plan` label), *"prioriteit-prospects"* is jargon. Voorstel: *"3 prospects waar je deze week echt op gaat focussen"*.
- *"Plan deze week 1-2 dagen waar je +50% aantallen draait"* (regel 46), *"aantallen draait"* is hard. Voorstel: *"Plan deze week 1-2 dagen met +50% (15 invites in plaats van 10)"*.
- `ma-sponsor-plan` label *"Deel je week-plan met je sponsor (optioneel)"*, *"(optioneel)"* binnen het label is dubbel met `verplicht: false`. Voorstel: weghalen uit label, het verplicht-veld doet het werk.

**Onlogica in opdrachten:**
- `ma-pipeline-review` zegt *"Wie is langer dan 5 dagen niet bewogen?"*, maar 5 dagen is willekeurig en kan voor verschillende fases anders zijn (een prospect in *"presentatie"* vraagt sneller opvolging dan iemand in *"shopper"*). Voorstel: laat de drempel weg of laat de Mentor 'm geven op basis van fase.

**Hiaten:**
- Geen verwijzing naar **doel-stelling**, maandag zou een natuurlijk moment zijn om kort terug te kijken op je 30-dagen-doel (uit Stap 21 Core / V5-besluit). Past in V6-roadmap, voor nu noteren.
- Geen Tijdlijn-pulsmoment-trigger. Maandag is een ideaal moment om te checken of er Shoppers zijn waarvoor pulsmoment 1/2/3 nu relevant is.

**IP-vermeldingen:** geen.

**Pakket-vermeldingen:** geen.

**Filmpjes:** geen `filmSlug`. Niet nodig op maandag, pure ritme-dag.

---

## Dagen 2 t/m 21, nog uit te werken

| Dag | Status |
|---|---|
| 2, Open je hoofd: alle namen op de lijst | nog niet geaudit |
| 3, Je socials zijn een goudmijn | nog niet geaudit |
| 4, ... | nog niet geaudit |
| 5–21 | nog niet geaudit |

## Weekritme dag 22-60, nog uit te werken

| Weekdag | Status |
|---|---|
| Maandag, plannen | ✅ geaudit (sample) |
| Dinsdag, uitnodigen | nog niet geaudit |
| Woensdag, 3-weg | nog niet geaudit |
| Donderdag, follow-up | nog niet geaudit |
| Vrijdag, socials | nog niet geaudit |
| Zaterdag, events & leren | nog niet geaudit |
| Zondag, review | nog niet geaudit |

---

## Eerste algemene observaties (te valideren als de hele audit klaar is)

1. **Webshop-frame ontbreekt structureel in Sprint.** Sprint praat over uitnodigingen, presentaties, 3-weg, pipeline-fases, maar niet over de webshop als ankerpunt. Past dit bewust niet bij Sprint (snelheid-focus, geen webshop-fillers), of moet het waarvan-het-bestaat ergens worden ingebouwd?
2. **Tijdlijn-pulsmomenten 1-3** uit V5-besluit zitten nog niet in dag 1-21. Past Tijdlijn beter in Core, of moet Sprint óók gebruik maken van de pulsmomenten?
3. **Bezwaren-bibliotheek (Worre 21)**, nog niet geïntegreerd in Sprint-content. Bezwaren-stap zit in dag 5 *(`label: "Bezwaar-scripts in Scripts"`)* maar verwijst naar `/scripts`-pagina, niet naar de Worre-bibliotheek.
4. **IP-waarden** worden in Sprint vrijwel niet genoemd (alleen *"200+"* in een netwerk-grootte-voorbeeld dag 2 regel 186, dus géén IP-vermelding). Mogelijk komen IP-waarden alleen voor in [lib/lifeplus/pakketten.ts](lib/lifeplus/pakketten.ts) en [lib/lifeplus/prijslijst.ts](lib/lifeplus/prijslijst.ts), dat is waar de 150-vs-200-beslissing landt. Sprint zelf ongetroffen.
5. **Pakket-vermeldingen** in Sprint: minimaal. Dag 13 noemt *"Daily BioBasics + OmeGold"* en *"Darmen in Balans"* in voorbeeld-script-tekst (regel 1201, 1204). Dat zijn de plekken waar pakket-herziening Sprint kan raken, markering nodig zodra pakketten herzien zijn.
