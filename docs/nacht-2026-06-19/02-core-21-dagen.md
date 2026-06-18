# Ronde 2 — Core 21-dagen pilot-klaar scan

4 agenten (3 blokken van 7 dagen + de sideflows) hebben `core-dagen-v9.ts` en
`core-sideflows-v9.ts` nagelopen op stem, claim-vrij, AI-isms/em-dashes en
stap-logica.

**Goed nieuws vooraf:** de Core-content is sterk. Geen em-dashes, geen klassieke
ChatGPT-isms, jullie stem zit er goed in (warme openers, 🥰/💪🏽 op de juiste
plek, terug-vragen). Dit is **polish + een paar echte stap-logica-bugs**, geen
herbouw. Ik heb hier bewust **niks** aangepast (het is jouw tekst). Per dag de
voorstellen.

---

## 🔴 Eerst dit — stap-logica die een member kan laten vastlopen

1. **Sideflows: "ga door naar dag 2" klopt niet (HOOG).** De 21-dagen-post-flow
   sluit af met "ga verder met dag 2 (top-20-namenlijst)", maar die flow wordt
   pas vanaf **dag 14+** getriggerd ([vandaag/page.tsx:293]). Iemand op dag 16
   stuur je dan terug naar dag 2. → Verwijzing naar "dag 2" tijdvrij maken
   ("je pakt je dag van vandaag weer op").
2. **Sideflows: "over 21 dagen krijg je een seintje" vs. trigger op dag 14
   (HOOG).** De pre-post belooft een herinnering over ~21 dagen, maar het
   systeem zet de 21-dagen-post al klaar vanaf dag 14. Belofte en gedrag lopen
   uiteen. → Tekst zonder cijfer ("je krijgt vanzelf een seintje wanneer het
   zover is") óf de trigger naar ~21 dagen brengen. Kies één bron.
3. **Dag 1 → Dag 6: 3-soorten-DM-script (midden).** Dag 1 laat je de post-keuze
   (waar dat script wordt klaargezet) skippen, maar dag 6 verwijst er twee keer
   naar alsof het er is. Wie skipte loopt vast. → In dag 6 een vangnet: "Nog
   geen post-keuze gemaakt? Vraag de Mentor het 3-soorten-DM-script."
4. **Dag 11: tekst zegt "dashboard", knop gaat naar /statistieken (midden).** →
   Tekst en route gelijktrekken.
5. **Dag 12: verwijst naar Academy-anker `#module-8` (midden).** → Even checken
   of die module-anchor echt bestaat, anders dode link.

---

## 🟠 Claim-vrij & tijds-prognoses (jouw stem — ACM-gevoelig)
Dit is de inhoudelijk belangrijkste opruiming. Telkens een tijdsframe of
resultaat losgekoppeld:
- **Dag 1:** "wat je gaat merken in de komende drie weken" → tijdsframe eruit.
- **Dag 7:** "mensen die in maand twee afhaken" → impliciet inkomens-tijdpad,
  weghalen.
- **Dag 9:** "drie maanden later degenen die alle 3-wegs met gemak doen" →
  succes+tijd-belofte verzachten.
- **Dag 19:** "vaak merk je binnen een paar dagen al verschil" → tijdsbelofte
  schrappen.
- **Sideflow 21-dagen-post:** "bewezen sterk … soms meerdere productgebruikers
  op één dag" → resultaat-verwachting verzachten + "verschilt per persoon".
- **Dag 4:** voorbeeld "sinds ik dit gebruik merk ik…" → koppel aan gedrag
  ("sinds ik bewuster leef…"), conform vertaaltabel.
- Lichter (dag 3, 14, 20, sideflow "overgewicht"): zie detail-rapport.

> Dit overlapt met de tijdsbeloftes die ronde 1 in `content.ts` vond (regels
> 22/56/78). Het is dezelfde claim-vrij-pass; handig om in één keer te doen.

---

## 🟡 AI-isms / geforceerde drieslagen / slogans (polish in jouw stem)
Klein, maar ze stapelen tot een "tic" over de dagen:
- **Dag 8:** "diep duiken" → ChatGPT-ism, vervangen.
- **Dag 13:** "werkt als een magneet" + kop "DE SPIEGEL VAN DE MENTOR" →
  gepolijste copy, concreter maken.
- **Dag 18:** "klaar is beter dan perfect" → cliché, in jouw woorden.
- **Dag 19:** "groeimotor" + "pipeline zonder check is een lijst…" → AI-woord +
  geforceerde tegenstelling.
- **Dag 20:** "de hefboom" 3× herhaald → tot één plek beperken.
- **Dag 21:** "Succes is geen toeval. Succes is ingepland." → tegeltjeswijsheid
  op de meest emotionele dag; persoonlijker.
- **Terugkerend patroon:** de "niet X, wel Y"-constructie en parallelle
  drieslagen komen vaak voor (dag 1/4/6/18/19/20 + sideflows). Eén of twee per
  dag is sterk; meer wordt een sjabloon. Detail-rapport noemt elke plek.

---

## ⚪ Klein / code-hygiëne
- **Sideflow const heet `VEERTIEN_DAGEN_POST_SIDEFLOW`** terwijl het de
  21-dagen-post is (V7-restant). Puur intern hernoemen (raakt geen
  member-tekst); ik heb 'm laten staan omdat 't de live playbook-module raakt —
  quick-win voor overdag.
- Diverse dubbelingen binnen één dag (dag 3 "mond vol tanden" 2×, dag 1+7
  dezelfde "twee keer"-drieslag). Detail per dag in de agent-output.

---

*De volledige per-dag-output (elk fragment + voorstel) staat in de
workflow-transcript; de bovenstaande lijst is de samenvatting waarop jullie
"samen per 7 dagen" snel kunnen werken.*
