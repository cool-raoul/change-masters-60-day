# Nacht 18→19 juni — overzicht

Goedemorgen Raoul. Hieronder wat ik vannacht heb doorgelicht en gedaan, met
bovenaan de dingen die jouw beslissing vragen. Elke ronde heeft een eigen
rapport in deze map. Veilige fixes heb ik al gedaan + gepusht; alles wat jouw
stem, founder-tekst of de database raakt, heb ik laten staan als voorstel.

## Status van de 4 rondes
- [x] **Ronde 1 — Reset-check funnel** → `01-resetcheck-funnel-audit.md`
- [x] **Ronde 2 — Core 21 dagen pilot-klaar scan** → `02-core-21-dagen.md`
- [ ] Ronde 3 — Em-dashes + AI-isms codebreed → `03-emdash-ai-isms.md`
- [ ] Ronde 4 — Brede gezondheids-audit → `04-brede-audit.md`

---

## Belangrijkste punten tot nu toe (ronde 1)

**Al veilig gefixt + gepusht:** dubbele-vangst-guard, lead-niet-kwijt-bij-
tabsluiten (keepalive), mini-ELEVA-aanvraag crasht niet meer bij dubbele kaart,
Stripe-fout-domein hersteld, diagnose-env opgeschoond, comment rechtgetrokken.

**Vraagt jouw beslissing (kort):**
1. **Hoog** — uitkomst-mail + push hangen aan de mail-queue-insert; ontkoppelen
   zodat ze niet stil wegvallen als een migratie achterloopt. (samen)
2. **Midden** — 3 kleine DB-migraties voor race-veiligheid (dubbele kaart /
   dubbele mailreeks / dubbele omgeving voorkomen). (samen)
3. **Midden** — contact-route: telefoonnummer kan stil verloren gaan; minimale
   prospect-kaart aanmaken als die ontbreekt.
4. **Stem/claim-vrij** — tijdsbeloftes in de uitkomst-content (regels 22/56/78
   van content.ts) loskoppelen van het effect. Jouw tekst, dus jouw keuze.

Details + file:regel per punt staan in `01-resetcheck-funnel-audit.md`.

---

## Ronde 2 — Core 21 dagen (samenvatting)

**Goed nieuws:** de Core-content is sterk. Geen em-dashes, geen ChatGPT-isms,
jullie stem zit er goed in. Polish + een paar stap-logica-bugs, geen herbouw.
Ik heb hier **niks** aangepast (jouw tekst). Alles staat per dag in
`02-core-21-dagen.md`.

**Eerst dit (kan een member laten vastlopen):**
1. Sideflows sturen naar "dag 2" terwijl ze pas vanaf dag 14 spelen.
2. Pre-post belooft "over 21 dagen" een seintje, maar het systeem triggert op
   dag 14. (kies één bron)
3. Dag 6 verwijst naar het 3-soorten-DM-script dat je in dag 1 mocht skippen.
4. Dag 11 "dashboard" vs. knop naar /statistieken; dag 12 Academy-anker checken.

**Daarna (jouw stem):** een korte claim-vrij/tijds-prognose-pass (dag 1/7/9/19 +
sideflows) en wat AI-ism/slogan-polish (dag 8/13/18/19/20/21). Sluit aan op de
`content.ts`-tijdsbeloftes uit ronde 1 — handig samen te doen.

---

*Dit document wordt door de nacht aangevuld na elke ronde.*
