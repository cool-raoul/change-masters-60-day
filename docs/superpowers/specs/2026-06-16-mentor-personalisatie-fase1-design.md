# Mentor-personalisatie, Fase 1, design

> **Status:** spec, wacht op Raoul's bouw-akkoord. NIET bouwen voor "go".
> **Datum:** 2026-06-16
> **Context:** zie `ELEVA-mentor-plan.html` (visie + 3 fases) en
> `ELEVA-mentor-check.html` (huidige Mentor-capaciteiten). Memory:
> `mentor-personalisatie-visie`.

## Doel van Fase 1

De Mentor laten redeneren vanuit het Mentor-profiel (stem + niche) en de
Doel-Tijd-Termijn, op alle taken die er nu al zijn. Niets aan de buitenkant
verandert, behalve dat de Mentor merkbaar beter "deze persoon" aanvoelt.

Dit is de **lees-helft** van de architectuur, plus de makkelijke **capture**
van de velden die we zonder extra invul-werk kunnen vullen. Onthouden via
gesprek (Fase 2), reels maken (Fase 3) en prospect-kaart-notities (toekomst)
vallen er bewust buiten.

## Wat er al ligt

- Tabel `mentor_profielen` (JSONB `data`), RLS te controleren op user-only.
- `lib/mentor-profiel/types.ts` → `MentorProfiel` (stemVoorbeelden,
  nicheZaadje, passies, idealeKlant, eigenProducten, drieVerhalen,
  formContexts, talent, eersteDoel).
- `lib/mentor-profiel/helpers.ts` → `leesMentorProfiel`, `patchMentorProfiel`
  (JSONB merge). Nergens aangeroepen in de levende app.

## Bouwstappen

### 1. Lezen in de Mentor-prompt (klein)

- `app/api/coach/route.ts`: na het ophalen van `profile` + `whyProfile` ook
  `leesMentorProfiel(user.id)` aanroepen en meegeven aan
  `bouwCoachSysteemPrompt`.
- `lib/prompts/coach-systeem-prompt.ts`: een compact blok "WIE IS
  ${naam}" toevoegen met de aanwezige profiel-velden (alleen niet-lege
  velden tonen). Stem-voorbeelden als korte citaten, niche/passies/ideale
  klant/producten als één regel elk, drie verhalen samengevat (niet
  voluit, kosten).
- Ook `profile.core_dtt` (doel_per_maand, uren_per_week, termijn_maanden)
  toevoegen aan het context-blok, zodat de Mentor het Core-doel kent. Dit
  lost meteen de dag-1-stap-belofte op.
- **Compact houden** met het oog op tokens: max ~600-900 tokens voor het
  hele profiel-blok, desnoods stem-voorbeelden tot de 3 meest recente.

### 2. Makkelijke capture, zonder invul-werk (middel)

Alleen de velden die we uit bestaande acties kunnen vullen:

- **Stem-voorbeelden** uit `eigen_zinnen`: bij het opslaan van een eigen zin
  (webshop-uitnodigingszin, edification-zin) die tekst óók als
  `stemVoorbeelden` naar het profiel patchen. Append, dedupe, cap op een
  klein aantal (bv. laatste 5).
- **Niche** (dag 13) en **producten** (dag 3): de stappen waar de member dit
  nu al benoemt een opslag-actie geven die `patchMentorProfiel` aanroept
  (`nicheZaadje`, `eigenProducten`). Voorkeur: via de bestaande
  `inlineActie`/embed-structuur, niet via de chat-parser (dat is Fase 2).

### 3. Randvoorwaarden

- RLS `mentor_profielen`: controleren dat het user-only is (member ziet/
  bewerkt eigen profiel, sponsor niet). Zie `sponsor-zicht-verificatie`.
- Claim-vrij blijft via bestaande prompt-regels + compliance-check.
- Profiel compact (kosten). Geen ruwe dumps.

## Buiten scope (Fase 2+)

- Conversationele opslag via `[PROFIEL]`-signaal in de chat.
- FORM / drie verhalen / ideale klant / talent / doel automatisch vangen.
- Reels-/posts-op-maat-flow.
- "Wat weet de Mentor over mij"-pagina (member ziet/bewerkt profiel).
- Cross-gesprek-geheugen, prospect-kaart-notities.

## Effect dat Raoul ziet na Fase 1

Vraag de Mentor om een post of uitnodiging, en hij gebruikt jouw woorden en
jouw niche. De DTT is bekend bij de Mentor. De rest van het systeem blijft
gelijk. Daarna pas, als het bevalt, Fase 2 (onthouden).

## Te raken bestanden (verwacht)

- `app/api/coach/route.ts` (lezen profiel, meegeven)
- `lib/prompts/coach-systeem-prompt.ts` (profiel-blok + DTT)
- de eigen-zin-opslag (component/route die naar `eigen_zinnen` schrijft) →
  ook patchen naar `stemVoorbeelden`
- dag 3 + dag 13 opslag-actie (`lib/playbook/core-dagen-v9.ts` +
  bijhorende embed/inlineActie) → `patchMentorProfiel`
- check RLS-migratie `mentor_profielen`
