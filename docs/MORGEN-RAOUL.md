# Morgen-Raoul, actuele status

> Korte, actuele lijst voor wanneer je terugkomt. Oudere items zijn
> verhuisd naar `docs/MORGEN-RAOUL-archief-2026-05-22-tot-25.md` om
> rommel te voorkomen. Daar staan alle eerdere builds inclusief
> Core V6 + Sprint-fixes + de eerste Tweede Lente bouw.

---

## Nacht-bouw 2026-05-26

### A) Refactor + Tweede Wind (energie + focus) ⭐

Tweede freebie-bot is gebouwd als skelet. Werknaam **Tweede Wind**. Bevestig de definitieve naam morgen, dan eenvoudige rename.

**Architectuur:**

- `lib/freebie-bots/tweede-lente/` (bestaande Tweede Lente, verplaatst)
- `lib/freebie-bots/tweede-wind/` (NIEUW, energie + focus)
- `lib/freebie-bots/registry.ts` (centrale bot-config dispatcher)

**Tweede Wind heeft:**

- 7 multi-choice vragen (energie, focus-brekers, slaap, eet-ritme, beweging, herstel, doel)
- Eigen system-prompt + 12 EFSA-veilige template-zinnen
- Bibliotheek: 12 ankers + 8 nutriënten + 5 basis-tips, gerankt op antwoorden
- 5 mail-templates met TODO-GABY-tags
- Volledige bot-flow op `/bot/tweede-wind/[token]` met sky/blauw thema
- Energie-focus pakketten (essential/plus/complete) in opt-in
- Generieke API-routes via slug-dispatcher (werkt voor beide bots)

**NIET ZICHTBAAR voor pilot-team.** Feature-flag `TWEEDE_WIND_ZICHTBAAR = false` in `/instellingen/mijn-tracking-links` houdt de bot uit het zicht. Tracking-link werkt wel als je 'm direct opent (bv. voor testen).

**Wat Gaby nog moet aanleveren voor Tweede Wind:**

- Definitieve openings-tekst (`tweede-wind/system-prompt.ts`)
- 12 template-zinnen voor de drie aanpassingen
- 5 mail-templates (`tweede-wind/mail-templates.ts`)
- Eventueel anekdotes

**Wat Raoul nog moet aanleveren:**

- Definitieve naam (werknaam "Tweede Wind" bevestigen of vervangen)
- Energie-focus-bestellinks invullen op `/instellingen/bestellinks` (essential/plus/complete)

**Activatie wanneer klaar:**

1. Gaby's content invullen in alle TODO-GABY-tags
2. Open `app/instellingen/mijn-tracking-links/page.tsx`, zet `TWEEDE_WIND_ZICHTBAAR = true`
3. Eventueel rename `tweede-wind` → andere slug (vereist rename in routes + registry + types)

### C) Opruim-werk

- MORGEN-RAOUL.md is geschoond. Oude items in archief-bestand.
- Em-dashes opruimen volgt in volgende commit.

---

## Parkeerlijst (uit eerdere weken)

Niet vergeten, maar geen actieve werkitems:

1. **Definitieve content Tweede Lente** door Gaby (5 mails, openings-tekst, template-zinnen, anekdotes)
2. **5-mail-sequence activeren** (Resend env vars, cron-config, feature-flag aan) zodra Gaby's content klaar is
3. **Pilot-team uitrollen** (Juan, Sandy, Gaby, Jaimie hun bestellinks laten invullen + tracking-links delen)
4. **ManyChat-webhook-integratie** (optioneel later)
5. **Em-dashes / ChatGPT-isms opruimen** in oude Sprint-content
6. **Mentor-kennisbank** (2017 CSV met aandoening-tips, wachtte op claims-grens)
7. **Core V7 bouwen** (design af, plan af, implementatie wacht)

---

## Status freebie-bots architectuur

```
lib/freebie-bots/
  types.ts                      (cross-bot, BotSlug union)
  registry.ts                   (centrale bot-config)
  token.ts                      (genereerBotToken)
  stats.ts                      (cross-bot stats)
  mail-queue.ts                 (planMailSequence)
  mail-template-types.ts        (cross-bot generic types)
  tweede-lente/
    index.ts                    (barrel-export)
    vragen.ts
    system-prompt.ts
    advies.ts
    bewaker.ts
    mail-templates.ts
  tweede-wind/                  (NIEUW)
    index.ts
    vragen.ts
    system-prompt.ts
    advies.ts
    bewaker.ts
    mail-templates.ts

app/bot/
  tweede-lente/                 (compleet, in pilot)
  tweede-wind/                  (NIEUW, achter feature-flag)
```

Toevoegen van een derde bot (bv Slaap-Loep):
1. Nieuwe folder `lib/freebie-bots/<slug>/` met dezelfde files
2. Entry in `BOT_REGISTRY`
3. Nieuwe folder `app/bot/<slug>/` (kopie + aanpas)
4. Entry in `FREEBIE_BOTS` in `/instellingen/mijn-tracking-links`

Pure code-toevoeging, geen schema-wijzigingen of generieke aanpassingen meer nodig dankzij de registry.
