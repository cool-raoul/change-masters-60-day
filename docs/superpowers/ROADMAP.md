# ELEVA Roadmap

Levend overzicht. Claude houdt dit bij. Raoul kan hier altijd zien waar we staan zonder context te verzamelen.

Laatst bijgewerkt: 2026-06-12

---

## 🎯 Pilot-status (review 2026-06-12)

Volledige codebase-review gedaan tegen het einddoel. Conclusie: het systeem
is inhoudelijk verder dan het operationeel was. Content, stem en flows zijn
pilot-waardig; de gaten zaten in de dunne laag werkend-in-de-echte-wereld.

| Gat uit review | Status |
|---|---|
| 🔴 Hourly reminders kapot sinds ~9 mei (CRON_SECRET) | ✅ Gefixt 2026-06-12, run #424 groen |
| 🔴 Dubbel Vercel-project failure-mails | ✅ Oude projecten al losgekoppeld, mails stoppen door reminders-fix |
| 🟠 Mini-ELEVA welkom-pagina Fase-6a placeholders | ✅ Pilot-waardig gemaakt 2026-06-12 |
| 🟠 Freebie-funnel eindigt dood (geen mails) | ☐ Raoul koos: alleen Reset-check sequence, rest handmatig nabellen |
| 🟡 Film-blokken leeg op dag-pagina's | ☐ Raoul koos: minimale set opnemen (welkomst + dag 1-7), lijstje volgt |
| 🟡 Sponsor-koppeling fragiel (?ref= zonder validatie) | ☐ Pilot-instructie: exacte registratie-links gebruiken |
| 🟢 Gebroken routes + 2 ChatGPT-isms | ✅ Gefixt 2026-06-12 |

---

## 🛠 Werk in uitvoering (volgorde met Raoul afgestemd 2026-06-12)

### 1. Reset-check mail-sequence (alleen deze bot)
- [ ] 5-mail-sequence schrijven in Raoul's stem (skelet bestaat uit Tweede-Lente-ronde)
- [ ] `templateVoorDag` voor reset-check vullen + cron/feature-flag aanzetten
- Energie & Focus + Hormonen & Overgang blijven handmatig nabellen (bewuste keuze)

### 2. Film-opname-lijstje voor Raoul
- [ ] Welkomstfilm + dag 1-7: per film de plek, het doel en een script-suggestie in Raoul's stem
- Raoul neemt op, vult zelf via edit-modus / Films-CMS

### 3. Sprint-specifieke uitnodig-scripts (uit parkeerlijst mei)
- [ ] Her-brainstorm, daarna Core- en Pro-specifiek (na Core-content ronde)

### 4. Core-content ronde
- [ ] Brainstorm op basis van `OVERZICHT-CORE-V5.html` (project-root)

---

## ✅ Recent afgerond

- **2026-06-12** Pilot-review met Fable 5: 4-sporen codebase-doorlichting, gaten geprioriteerd, bouw-loop afgesproken (klein zichtbaar stuk → live → kijken → verwerken)
- **2026-06-12** CRON_SECRET-fix: hourly reminders + stilte-nudges draaien weer (kapot sinds ~9 mei), GitHub run #424 groen, foutmail-stroom stopt
- **2026-06-12** Mini-ELEVA welkom-pagina pilot-waardig: video-placeholders vervangen door persoonlijk member-bericht + echte start-film per spoor (product/business) + team-context-blok
- **2026-06-12** Kleine fixes: 3× `/test-pakket-bouwer` → `/instellingen/mijn-tracking-links`, 2 ChatGPT-isms herschreven (ontdek-eleva mentor-pitch, wat-nu uitnodigen)
- **2026-06-11** Spraak-mentor proeftuin live op /founder/spraak-mentor: inspreken → transcript → vertalen (6 talen) → mentor-stem (6 stemmen) → mp3. D-ID pratende-video gebouwd maar geparkeerd (zie memory spraak-mentor-parkeerlijst)
- **2026-06-09/10** Coach → Mentor rename codebase-breed (86 strings, 23 files + DB-overrides). RLS-fix: tekst_overrides anon-leesbaar zodat WhatsApp-ontvangers founder-edits zien. VoiceFab + WatNuKnop scroll-aware en verborgen op chat-routes.
- **2026-06-08/09** /ontdek-eleva publieke showcase (19 features, pain-cards, FAQ, founder-bewerkbaar, OG-tags, verse-share-link). Reset-check freebie omgebouwd naar score-bot-architectuur (standing rule: freebie-bot-architectuur-regel).
- **2026-05-31** Core V9 live op /vandaag voor dag 1-21. Pilot-launch-plan: pilot week 1, live week 3. Mini-ELEVA twee-spoor (p-/b- tokens).
- **2026-05-26** Score-bots-pivot: Tweede Lente + Tweede Wind vervangen door Energie & Focus + Hormonen & Overgang.
- **2026-05-20** Em-dashes bulk-fix (142×), scripts-set 21 nieuw, Mentor-prompt claim-vrij niveau 2, Films-CMS opgeruimd, fase 3c bugs, git-tag `v-pilot-werkend-2026-05-20`.
- Ouder: zie git-history en memory-index.

---

## 📦 Geparkeerd, lichte triggers

- **Spraak-mentor pratende video** (D-ID): één regel terughalen, zie memory spraak-mentor-parkeerlijst
- **Mail-sequences Energie & Focus + Hormonen & Overgang** (handmatig nabellen in pilot)
- **Member-video-upload mini-ELEVA welkom** (persoonlijk bericht + film is de pilot-versie)
- **Profielfoto's in /team TeamBoom**, aparte ronde
- **Mentor-kennisbank vrijschakelen** (2017 CSV ingeladen, wacht op claims-grens-ontwerp)
- **Lifeplus IP en pakketten herziening** (wachten op Raoul+Gaby)
- **Vertalingen EN/FR/DE/ES/PT + i18n coach.* keys hernoemen** (NL eerst, dan EN)
- **Drie Core-versies opruimen** (core-dagen.ts/v6/v9 naast elkaar, V9 is live, hygiëne)
- **Twee oude Vercel-projecten verwijderen** (losgekoppeld, doen niets, netheid)
- **Supabase Pro PITR upgrade** (€25/m, gratis alternatief via docs/wekelijkse-data-export.md)

---

## 🚫 Buiten scope voor nu

- Leader-track (train-the-trainer, leader-cockpit), na pilot-validatie
- Pro-content verdieping (na Core gereed)
- Sprint-team gedeelde overview
- Mini-ELEVA vervolgvisie buckets (rename, content-films, vragen-bib, train-mentor)
- Eigen-freebie-maker (met claim-vrije bewaker)

---

## Werkwijze (bouw-loop, afgesproken 2026-06-12)

1. Doel kiezen (Raoul geeft het, of hoogste open gat)
2. Claude vertaalt naar kleinste zichtbare stuk + meldt risico-categorie
   (UI/tekst direct bouwen, DB/auth/RLS eerst spec + akkoord)
3. Bouwen → push → live-URL + kijklijstje van max 3 punten
4. Raoul kijkt op live, feedback mag voice/rommelig
5. Nieuwe ideeën → parkeerlijst, niet de bouwbank
6. Doel af → ROADMAP-commit. Elke sessie eindigt met actueel overzicht.
