# Context-kleursysteem (visuele wegwijzing)

Datum: 2026-06-26 · Status: ontwerp goedgekeurd, voorbeelden eerst (Raoul beslist door zien)

## Doel
Mensen weten nu niet goed WAAR ze in het systeem zitten, want alles gebruikt
dezelfde donkere `.card`-stijl. Per context een eigen signatuurkleur, als
wegwijzing, in lijn met anti-overwhelm. Niet meer dan één extra kleur per scherm.

## Beslissingen (met Raoul)
- **Gecombineerd**: secties hebben een signatuurkleur én de bijbehorende
  elementen (dag-tegel ↔ Vandaag, klantenkaart ↔ Klanten) dragen die mee.
- **Sterkte = gemiddeld**: donkere kaart met een gekleurde **kopbalk + icoon**
  bovenaan. Kaart-body blijft rustig.
- **Gold blijft voor acties/merk**; de contextkleur is puur wegwijzing. Zo
  vechten ze niet.
- **Werkt boven op de modus-kleuren** (Core grijs / Sprint zwart / Pro plum):
  de band is een gekleurde strook over die basis. Eerst aanzetten in Core.

## Palet (5 contexten, uitbreidbaar)
| Context | Kleur | Icoon |
|---|---|---|
| Vandaag (dagelijkse flow + dag-tegels) | groen (emerald) | 🌱 |
| Klanten / Namenlijst (klantenkaart) | blauw (sky) | 👥 |
| Leren (Academy, Lessen, Scripts, Mijn zinnen) | paars (violet) | 📚 |
| Herinneringen / opvolgen | koraal/roze (rose) | 🔔 |
| Mentor / chats | blijft goud (cm-gold) | 🤖 |

Kleuren liggen niet vast: omruilen = één regel in de config.

## Bouwstenen
1. `lib/ui/context-kleuren.ts` — één bron van waarheid: per context naam,
   icoon en kleur-classes (band-bg, band-tekst, zachte tint, rand).
2. `components/ui/ContextKaart.tsx` — donkere kaart met gekleurde kopbalk +
   icoon + label. De kern.
3. `components/ui/ContextHeader.tsx` — dunne "je bent hier"-balk bovenaan een
   scherm (latere stap).

## Rollout
- **Stap 1 (nu, voorbeelden):** dag-tegels in /vandaag → groen; klantenkaart
  /namenlijst/[id] → blauw. Raoul bekijkt + reageert op kleur/sterkte.
- **Stap 2:** "je bent hier"-balk op de hoofdschermen + actief menu-item in de
  sectiekleur.
- **Stap 3:** Leren + Herinneringen.
- Daarna vanzelf in Sprint/Pro (modus-onafhankelijk).
