# Ronde 3 — Em-dashes + AI-isms in member-facing content (buiten Core)

5 agenten over: uitnodig-scripts, playbook-helpers, freebie-content, UI-strings
en de Mentor-prompts.

---

## ✅ Al veilig gefixt vannacht (gepusht)

**11 em-dashes in member-facing UI-chrome** vervangen door gewone leestekens
(geen founder-tekst, geen T-override-strings):
- `MiniElevaIntroTour.tsx` — 4 bullets (de intro-tour die de prospect ziet)
- `PushResyncBanner.tsx` — 2
- `PWAInstallPrompt.tsx`, `MentorFunnelAnalyseKnop.tsx` (2),
  `MiniElevaProspectChat.tsx` (+ "read-only" → "alleen-lezen"),
  `sponsor/mini-eleva/page.tsx`

> Bewust **niet** aangeraakt: de em-dash in `QuoteBlok.tsx` (dat is een
> conventionele citaat-attributie-streep) en de `MiniElevaUitnodigKnop`
> option-label (kleiner, fiddly). Beide laag-prioriteit.

**Goed om te weten:** de Reset-check-content en de Core-content bevatten
**nul** em-dashes. De bekende anti-pattern-zin ("Daar hebben wij, als team
binnen een Europees bedrijf…") staat al netjes met komma's. Op em-dash-vlak is
de echte content schoon; het zat alleen in UI-chrome.

---

## ⚠️ Voor jou (founder-tekst — niet aangeraakt)

- **`scripts-data.ts`** — een paar slogan-/sales-deck-zinnen ("Het is
  systeem-werk, geen klusjes-werk", "zonder investeringen en zonder risico").
  "Zonder risico" leunt richting een absolute inkomensuitspraak (ACM). Jouw
  hook, dus jouw keuze; even samen langslopen.
- **`reset-check/content.ts`** — de tijds-beloftes "binnen 7 tot 10 dagen
  verschil voelen" (regel 22) en "binnen 4 of 5 dagen middagdip kleiner"
  (regel 56). Dit is dezelfde claim-vrij-pass als ronde 1 en 2. Tijd-anker
  eruit, rest behouden.

## ⚠️ Voor Gaby (energie- & hormonen-bot — nog niet live, TODO-GABY)
Deze twee freebie-bots dragen bovenaan al "nog niet in ELEVA-stem". De scan
bevestigt dat, met **3 claim-vrij-issues van hoog niveau** die echt eerst weg
moeten vóór de bots prospect-zichtbaar gaan:
- **hormonen:219** — "letterlijk levensreddend" + "significant lager risico op
  botbreuken" (directe gezondheids-/preventieclaim, EFSA). Hoogste prioriteit.
- **energie:240** — "alcohol is biologisch een lichte vergif … lever
  onschadelijk maken".
- **energie:42** — "kost je gemiddeld 30 procent productiviteit" (hard
  cijfer-effect).
- Plus veel medische taal (oestrogeen, hypothalamus, mitochondriën,
  dopamine-desensibilisatie) + tijds-beloftes ("binnen een week minder
  opvliegers"). De hele set vraagt een medisch→beleving-vertaalslag.

## ⚠️ UI-toon (met jou afstemmen, geen auto-fix)
- `WelcomePopup.tsx` — "laten we beginnen" (klassiek ChatGPT-ism).
- `premium/page.tsx` — "Haal alles uit ELEVA" (marketing-opener).
- `ontdek-eleva` showcase — "Alles wat je nodig hebt, op één plek" (generieke
  SaaS-slogan; founder-override T-string).

## ⚠️ Mentor-prompt (de moeite waard, even checken)
De Mentor-system-prompt lijkt **geen expliciet verbod** te bevatten op
em-dashes / AI-isms, en geen harde "praat in Raoul's stem + claim-vrij"-richtlijn
(en er staat een en-dash in een fase-planning-regel). Dat betekent dat de
Mentor in zíjn antwoorden alsnog em-dashes/AI-taal kan produceren. Een kleine
toevoeging aan de prompt (stem + claim-vrij + geen em-dashes/AI-isms) dekt al
zijn output in één keer af. Omdat dit het hart van de Mentor raakt, laat ik 'm
voor jou liggen i.p.v. 'm vannacht aan te passen.
