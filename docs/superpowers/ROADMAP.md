# ELEVA Roadmap

Levend overzicht. Claude houdt dit bij. Raoul kan hier altijd zien waar we staan zonder context te verzamelen.

Laatst bijgewerkt: 2026-05-20

---

## ✅ Recent afgerond

- **2026-05-20** Scripts-set polish + uitbreiding: 21 nieuwe scripts in lib/scripts-data.ts (5 Aansluiten in_gesprek + 8 Uitnodigen uitgenodigd + 5 Opvolgen Informeren followup + 3 Opvolgen Dienstverlening followup), allemaal claim-vrij + zonder em-dashes + zonder "wat vond je ervan", in ELEVA-stem. Memory eleva-stem-uitnodigen vastgelegd.
- **2026-05-20** Mentor-prompt update: claim-vrij niveau 2 nu altijd in prompt (was alleen bij `social`/`motivatie` vraagtypes, miste bv. "21-dagen-Reset post"). Mentor doet zelf publieke-uiting-check op signaalwoorden. Academy uitgebreid met DMO + Spreken-zoals-het-raakt. Partner-check + Momentum-radar awareness: verwijst naar ELEVA-tool ipv zelf scripts genereren.
- **2026-05-20** Films-CMS volledig opgeruimd. Alleen Welkomstfilm + Modus-welkomstfilms + 10 Prospect-films over. Principe vastgelegd: MediaBlokken voor pagina-specifieke media, Films-CMS voor pop-ups en hergebruikte films.
- **2026-05-20** Fase 3c cross-modus skip versterking, alle 5 bugs live (B1+B2+B3+B5+B7). Centrale taak-cross-modus mapping, ITEM_SLUGS-constanten, NamenForm DB-count check.
- **2026-05-20** Founder-strip compact op mobiel (FounderTopStrip + TesterToolbar + EditModeToggle nu één regel op telefoon)
- **2026-05-20** Films-CMS verduidelijkt + Sprint-dag-films redundantie weg (per-dag film via Films-CMS verwijderd uit vandaag-flow, MediaBlokken edit-modus blijft enige weg voor Sprint-dag-video's). Films-CMS blijft actief voor welkomst, prospect, leerpaden, academy.
- **2026-05-20** Em-dashes bulk-fix in member-facing content (142 vervangingen in 8 bestanden, resterende 15 zijn code-comments)
- **2026-05-20** Veiligheidsslagen: git tag `v-pilot-werkend-2026-05-20`, smoke-test checklist, ROADMAP, risico-categorie regel
- **2026-05-20** "Administratieve stappen" rename + /setup/[slug] founder-bewerkbaar (titel, uitleg, eigen-film-URL, film-uitleg)
- **2026-05-19** Fase 3b onboarding-flow opschoning (K1+K2+K3+B6 opgelost, atomaire opslag, sessie-refresh)
- **2026-05-19** Fase 3a modus-bewust foundation (topbar, dashboard, stats, team via centrale helpers)
- **2026-05-18** Onboarding-redesign fase 2 (pre-day-1 gedeeld Sprint+Core, admin-rail /setup, per-modus dag-teller, cross-modus skip)

---

## 🛠 Werk in uitvoering

Volgorde-akkoord van Raoul op 2026-05-20:

### 1. Opruim-werk (klein, eerst)
- [x] ~~Em-dashes bulk-fix in member-facing content~~ (afgerond 2026-05-20, 142 vervangingen)
- [x] ~~Films CMS verduidelijkt en Sprint-dag-redundantie weg~~ (afgerond 2026-05-20)

### 2. Fase 3c cross-modus skip versterking
- [x] ~~B1, B2, B3, B5, B7 uit oorspronkelijke audit~~ (afgerond 2026-05-20)
  - app-geinstalleerd + push-aan markering toegevoegd in gaNaarStap
  - ITEM_SLUGS overal geïmporteerd waar relevant
  - Centrale taak-cross-modus mapping in lib/onboarding/taak-cross-modus.ts
  - NamenForm doel-check via DB-count

### 3. Mentor-prompt update
- [x] ~~Claim-vrij niveau 2 altijd in prompt, Mentor doet zelf publieke-uiting-check~~ (afgerond 2026-05-20)
- [x] ~~Sprint/Core/Pro-framing~~ (al eerder gedaan, padBeschrijving regel 89-101)
- [x] ~~Partner-check + Momentum-radar awareness~~ (afgerond 2026-05-20)
- [x] ~~Academy uitgebreid met DMO + Spreken-zoals-het-raakt~~ (afgerond 2026-05-20)
- [ ] **Nieuwe uitnodig-stijl** (wacht op #4 uitnodig-scripts her-brainstorm)

### 4. Uitnodig-scripts her-brainstorm
- [x] ~~Algemene scripts gepolisht en live~~ (21 stuks, afgerond 2026-05-20)
- [ ] **Modus-specifieke scripts** (Sprint/Core/Pro) wacht op brainstorm
- Plekken om aan te passen na modus-specifieke brainstorm:
  - `lib/scripts-data.ts:9-115` (oude 4 Sprint-werving-scripts, framing herzien)
  - `lib/playbook/dagen.ts:159` + `:449-466`
  - `lib/academy/dmo-content.ts:419-494`
  - `lib/prompts/coach-systeem-prompt.ts` (uitnodig-stijl in Mentor)

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

- **ChatGPT-isms herschrijven** (top 7 sterk verdacht, 8 mild), losse polish-ronde
- **Profielfoto's in /team TeamBoom**, aparte ronde
- **Mentor-kennisbank vrijschakelen** (2017 CSV ingeladen, wacht op claims-grens-ontwerp)
- **Lifeplus IP en pakketten herziening** (wachten op Raoul+Gaby)
- **Supabase Pro PITR upgrade** (€25/m, geparkeerd 2026-05-20, gratis alternatief via docs/wekelijkse-data-export.md)

---

## 🚫 Buiten scope voor nu

- Pro-content schrijven (15 stappen, na Core gereed)
- Sprint-team gedeelde overview (nieuwe feature, na Core+Pro)
- Mini-ELEVA vervolgvisie buckets (na Core+Pro)

---

## Werkwijze

Bij elke afgeronde taak commit ik óók een update van dit bestand. Bij elke nieuwe taak op het bordje hangt 'ie hier vóór ik begin. Als Raoul vraagt "waar zijn we", begin ik bij de bovenste open ☐ in sectie 🛠.
