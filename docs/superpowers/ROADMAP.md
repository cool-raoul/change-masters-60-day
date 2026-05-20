# ELEVA Roadmap

Levend overzicht. Claude houdt dit bij. Raoul kan hier altijd zien waar we staan zonder context te verzamelen.

Laatst bijgewerkt: 2026-05-20

---

## ✅ Recent afgerond

- **2026-05-20** "Administratieve stappen" rename + /setup/[slug] founder-bewerkbaar (titel, uitleg, eigen-film-URL, film-uitleg)
- **2026-05-19** Fase 3b onboarding-flow opschoning (K1+K2+K3+B6 opgelost, atomaire opslag, sessie-refresh)
- **2026-05-19** Fase 3a modus-bewust foundation (topbar, dashboard, stats, team via centrale helpers)
- **2026-05-18** Onboarding-redesign fase 2 (pre-day-1 gedeeld Sprint+Core, admin-rail /setup, per-modus dag-teller, cross-modus skip)

---

## 🛠 Werk in uitvoering

Volgorde-akkoord van Raoul op 2026-05-20:

### 1. Opruim-werk (klein, eerst)
- [ ] **Em-dashes bulk-fix in member-facing content** (~113 stuks, ~30 in code-comments mogen blijven)
  - `lib/playbook/tempo-aware.ts` (41)
  - `lib/academy/audio-onderweg-content.ts` (42)
  - `lib/playbook/weekritme.ts` (24)
  - `lib/academy/social-media-content.ts` (20)
  - `lib/academy/claim-vrij-content.ts` (7)
  - `lib/playbook/dagen.ts` (3)
  - 3 componenten (RadarBalk, PartnerCheckEmbed, EerstePartnerVieringTegel)
- [ ] **Films CMS in /instellingen opruimen** (geen functie meer sinds /setup/[slug] eigen film-URL kan)

### 2. Fase 3c cross-modus skip versterking
- [ ] B1, B2, B3, B5, B7 uit oorspronkelijke audit
  - `app-geinstalleerd` markering centraliseren
  - `ITEM_SLUGS` imports consistent
  - Taak-mapping centraliseren zodat een Core'er die switcht naar Sprint geen dubbele taken krijgt

### 3. Mentor-prompt update
- [ ] `lib/prompts/coach-systeem-prompt.ts` bijwerken voor:
  - Claim-vrij voor algemene communicatie (niet alleen supplementen)
  - Sprint/Core/Pro-framing
  - Partner-check + momentum-radar
  - Nieuwe uitnodig-stijl (na #4)

### 4. Uitnodig-scripts her-brainstorm
- [ ] 4 voorbeeld-varianten staan klaar (A vitaliteit-warm, B business-warm, C lauw, D met prospect-WHY-haakje)
- [ ] Wacht op Raoul's akkoord met Core-perspectief erbij
- Plekken om aan te passen na akkoord:
  - `lib/scripts-data.ts:9-115`
  - `lib/playbook/dagen.ts:159` + `:449-466`
  - `lib/academy/dmo-content.ts:419-494`
  - `lib/prompts/coach-systeem-prompt.ts`

### 5. Core-content ronde
- [ ] Dag 2, dag 5 t/m 21 + verankering + lifetime templates
- Stem-anker: kennisbank pagina's (zie [[raoul-stem-anker]])

### 6. Sprint-structurele issues
- [ ] Eric Worre first-win op dag 1 (laagdrempelig bericht naar warmste contact)
- [ ] Dag 6 ontladen (FFF + 5-fasen splitsen)
- [ ] Sponsor-rol consistent maken (instructeur, mentor, cheerleader oscillatie)
- [ ] Week 3 rode draad geven
- [ ] Dag 2 vs dag 4 timing-mismatch oplossen

---

## 📦 Geparkeerd, lichte triggers

- **ChatGPT-isms herschrijven** (top 7 sterk verdacht, 8 mild) — losse polish-ronde
- **Profielfoto's in /team TeamBoom** — aparte ronde
- **Mentor-kennisbank vrijschakelen** (2017 CSV ingeladen, wacht op claims-grens-ontwerp)
- **Lifeplus IP en pakketten herziening** (wachten op Raoul+Gaby)

---

## 🚫 Buiten scope voor nu

- Pro-content schrijven (15 stappen, na Core gereed)
- Sprint-team gedeelde overview (nieuwe feature, na Core+Pro)
- Mini-ELEVA vervolgvisie buckets (na Core+Pro)

---

## Werkwijze

Bij elke afgeronde taak commit ik óók een update van dit bestand. Bij elke nieuwe taak op het bordje hangt 'ie hier vóór ik begin. Als Raoul vraagt "waar zijn we", begin ik bij de bovenste open ☐ in sectie 🛠.
