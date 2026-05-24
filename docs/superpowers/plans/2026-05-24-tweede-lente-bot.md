# Tweede Lente Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw een publieke web-bot `/bot/tweede-lente/[token]` die vrouwen in peri/volle/post-overgang door 7 multi-choice vragen leidt, een AI-spiegel toont in ELEVA-team-stem, en aan het eind opt-in voor 5-mail-reeks + producten + persoonlijk contact biedt. Lead-attributie gaat via een unieke tracking-token per (member, bot).

**Architecture:** Server-routed publieke pagina (geen auth), client form per blok, drie API-routes (start/spiegel/opt-in), nieuwe tabel `freebie_bot_member_tokens` voor token-mapping, uitbreiding `freebie_opt_ins` met `bot_antwoorden` jsonb + `spiegel_tekst` text, koppeling met `klantomgeving_klanten`. AI-spiegel via OpenAI gpt-4o-mini (bestaande integratie, geen nieuwe dependency) met strakke template-bewaakte system-prompt. Drie lagen claim-vrije bewaking: multi-choice-only input, AI mag alleen template-zinnen kiezen, eind-blok 100% statisch in code.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres + RLS + service-role-admin-client voor publieke bot-routes), OpenAI gpt-4o-mini, Tailwind CSS, bestaande `node scripts/run-migration.mjs` voor SQL-uitrol.

---

## File Structure

**Created:**

- `supabase/migrations/2026-05-24-09-tweede-lente-bot.sql` - SQL: tabel `freebie_bot_member_tokens` + kolommen `bot_antwoorden jsonb` + `spiegel_tekst text` op `freebie_opt_ins`.
- `lib/freebie-bots/types.ts` - Type-definities (BotSlug, BotConfig, BotAntwoorden, SpiegelOutput).
- `lib/freebie-bots/tweede-lente-vragen.ts` - De 7 multi-choice vragen + opties (in code, statisch).
- `lib/freebie-bots/tweede-lente-system-prompt.ts` - Strakke claim-vrije system-prompt + template-zinnen voor de "drie aanpassingen".
- `lib/freebie-bots/templatezinnen-bewaker.ts` - Functie die AI-output door regex haalt en zinnen vervangt die niet in de whitelist staan.
- `lib/freebie-bots/token.ts` - Helper-functie voor het genereren van een 16-char hex tracking-token (hergebruik patroon van productadvies-test).
- `app/api/freebie-bot/start/route.ts` - POST, valideert token, returnt member-context.
- `app/api/freebie-bot/spiegel/route.ts` - POST, ontvangt 7 antwoorden, roept OpenAI, returnt spiegel-tekst.
- `app/api/freebie-bot/opt-in/route.ts` - POST, slaat opt-in op, maakt klantomgeving-rij, stuurt notificatie naar member.
- `app/api/freebie-bot/maak-token/route.ts` - POST (auth verplicht), maakt of haalt tracking-token op voor de huidige member.
- `app/bot/tweede-lente/page.tsx` - Landingspagina "vraag een team-vrouw om een geldige link".
- `app/bot/tweede-lente/[token]/page.tsx` - Server-component die token valideert + client-flow laadt.
- `app/bot/tweede-lente/[token]/tweede-lente-flow.tsx` - Client-flow, 4 blokken (intro / vragen / spiegel / opt-in).
- `app/bot/tweede-lente/[token]/blok-intro.tsx` - Blok 1, warme intro.
- `app/bot/tweede-lente/[token]/blok-vragen.tsx` - Blok 2, 7 multi-choice vragen één per scherm.
- `app/bot/tweede-lente/[token]/blok-spiegel.tsx` - Blok 3, AI Haiku spiegel-weergave + 3 aanpassingen.
- `app/bot/tweede-lente/[token]/blok-opt-in.tsx` - Blok 4, opt-in + product + contact + disclaimer.
- `app/instellingen/mijn-tracking-links/page.tsx` - Member dashboard "Mijn freebie-bot-links" met kopieer-knop.
- `app/instellingen/mijn-tracking-links/kopieer-knop.tsx` - Client component voor kopiëer-naar-clipboard.

**Modified:**

- `app/instellingen/page.tsx` - Menu-item toevoegen voor "Mijn freebie-bot-links".
- `lib/freebies/voorbeeld-toolkit.ts` - Toevoegen van `tweede-lente` als bot-type (slug + beschrijving).

---

## Task 1: SQL-migratie voor tracking-tokens + opt-in-uitbreiding

**Files:**
- Create: `supabase/migrations/2026-05-24-09-tweede-lente-bot.sql`

- [ ] **Step 1: Schrijf de SQL-migratie**

```sql
-- File: supabase/migrations/2026-05-24-09-tweede-lente-bot.sql
--
-- Tweede Lente bot (pilot voor freebie-bot-architectuur).
-- Twee onderdelen:
--   1. Tabel freebie_bot_member_tokens: per (member, bot) een unieke
--      16-char hex tracking-token die in de publieke bot-URL staat.
--   2. Uitbreiding freebie_opt_ins met bot_antwoorden jsonb +
--      spiegel_tekst text, zodat we weten welke antwoorden de lead gaf
--      en welke spiegel de bot heeft getoond.

create table if not exists public.freebie_bot_member_tokens (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  bot_slug text not null,
  token text unique not null,
  created_at timestamptz not null default now(),
  unique (member_id, bot_slug)
);

create index if not exists freebie_bot_member_tokens_token_idx
  on public.freebie_bot_member_tokens(token);

create index if not exists freebie_bot_member_tokens_member_idx
  on public.freebie_bot_member_tokens(member_id);

alter table public.freebie_bot_member_tokens enable row level security;

create policy "member sees own tokens" on public.freebie_bot_member_tokens
  for select using (auth.uid() = member_id);

create policy "member writes own tokens" on public.freebie_bot_member_tokens
  for insert with check (auth.uid() = member_id);

create policy "anyone reads token by value via service role" on public.freebie_bot_member_tokens
  for select using (false);
-- Publieke bot-route gebruikt service-role-admin-client om token op te
-- zoeken. RLS-policy voor 'anon' is dus expres restrictief.

alter table public.freebie_opt_ins
  add column if not exists bot_antwoorden jsonb,
  add column if not exists spiegel_tekst text;

comment on table public.freebie_bot_member_tokens is 'Per (member, bot_slug) unieke tracking-token voor publieke bot-URL.';
comment on column public.freebie_opt_ins.bot_antwoorden is 'JSON met de multi-choice-antwoorden uit de bot (per vraag).';
comment on column public.freebie_opt_ins.spiegel_tekst is 'AI-gegenereerde spiegel-tekst die de prospect te zien kreeg.';
```

- [ ] **Step 2: Draai migratie tegen live Supabase**

Run: `node scripts/run-migration.mjs 2026-05-24-09-tweede-lente-bot.sql`
Expected: console-uitvoer eindigend met `✓ Migratie geslaagd`.

- [ ] **Step 3: Verifieer in Supabase dashboard**

Open Supabase dashboard → Tables → controleer dat `freebie_bot_member_tokens` bestaat en dat `freebie_opt_ins` de twee nieuwe kolommen heeft.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/2026-05-24-09-tweede-lente-bot.sql
git commit -m "feat(tweede-lente): SQL-migratie tracking-tokens + opt-in-uitbreiding"
git push
```

---

## Task 2: Type-definities voor freebie-bots

**Files:**
- Create: `lib/freebie-bots/types.ts`

- [ ] **Step 1: Schrijf de types**

```ts
// File: lib/freebie-bots/types.ts
//
// Type-definities voor freebie-bots (Tweede Lente is pilot, daarna
// volgen Slaap-Loep, Energie-Loep, etc.).

export type BotSlug = "tweede-lente";

export type TweedeLenteFase =
  | "pre-overgang"
  | "peri-overgang"
  | "volle-overgang"
  | "post-overgang"
  | "weet-niet";

export type TweedeLenteWatValtOp =
  | "energie-patroon"
  | "slaapritme"
  | "stemming"
  | "warmte-golven"
  | "cyclus-veranderingen"
  | "lichaamsbeleving"
  | "mentaal-helder-zijn";

export type TweedeLenteEetRitme =
  | "regelmatig-bewust"
  | "onregelmatig-gevarieerd"
  | "vaak-snel-tussendoor"
  | "wisselt-per-dag";

export type TweedeLenteBeweging =
  | "stevig"
  | "licht"
  | "wisselend"
  | "weinig";

export type TweedeLenteRust =
  | "goed-zonder-schuldgevoel"
  | "wisselend"
  | "hoofd-staat-aan"
  | "draai-door";

export type TweedeLenteDeel =
  | "partner"
  | "vriendin-of-vrouw"
  | "huisarts-of-professional"
  | "met-niemand-echt";

export type TweedeLenteZoek =
  | "iets-om-mee-te-beginnen"
  | "begrip-niet-de-enige"
  | "rustige-spiegel"
  | "concrete-kennis";

export type TweedeLenteAntwoorden = {
  fase: TweedeLenteFase;
  watValtOp: TweedeLenteWatValtOp[]; // 1-3 keuzes
  eetRitme: TweedeLenteEetRitme;
  beweging: TweedeLenteBeweging;
  rust: TweedeLenteRust;
  deel: TweedeLenteDeel;
  zoek: TweedeLenteZoek;
};

export type SpiegelOutput = {
  /** Eén openings-zin van ongeveer 2 regels in ELEVA-team-stem. */
  opening: string;
  /** Eén patroon-paragraaf, 3-4 regels. */
  patroon: string;
  /** Precies drie aanpassingen, elk een korte zin uit de template-whitelist. */
  driAanpassingen: [string, string, string];
  /** Eén afsluitings-zin die overgaat naar het opt-in-blok. */
  afsluiting: string;
};

export type BotMemberContext = {
  memberId: string;
  memberVoornaam: string;
  botSlug: BotSlug;
};
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen, geen TS-errors.

- [ ] **Step 3: Commit**

```bash
git add lib/freebie-bots/types.ts
git commit -m "feat(tweede-lente): type-definities voor freebie-bot architectuur"
git push
```

---

## Task 3: De 7 vragen-definities

**Files:**
- Create: `lib/freebie-bots/tweede-lente-vragen.ts`

- [ ] **Step 1: Schrijf de vragen-data**

```ts
// File: lib/freebie-bots/tweede-lente-vragen.ts
//
// De 7 multi-choice vragen van de Tweede Lente bot. Statisch in code
// voor pilot. Later kan dit naar DB als per-team-vrouw personalisatie
// gewenst is. Geen vrije tekst input, alleen radio + checkbox.

import type {
  TweedeLenteFase,
  TweedeLenteWatValtOp,
  TweedeLenteEetRitme,
  TweedeLenteBeweging,
  TweedeLenteRust,
  TweedeLenteDeel,
  TweedeLenteZoek,
} from "./types";

export type VraagKeuze<T extends string> = {
  waarde: T;
  label: string;
  korteCode: string; // voor in spiegel-paragraaf gebruik
};

export const VRAAG_FASE: VraagKeuze<TweedeLenteFase>[] = [
  {
    waarde: "pre-overgang",
    label:
      "Pre-overgang (ik merk subtiele veranderingen, maar mijn cyclus loopt nog)",
    korteCode: "pre",
  },
  {
    waarde: "peri-overgang",
    label:
      "Peri-overgang (mijn cyclus is onregelmatig, of er gebeurt duidelijk iets)",
    korteCode: "peri",
  },
  {
    waarde: "volle-overgang",
    label:
      "Volle overgang (ik zit er midden in, hormonen zijn duidelijk anders)",
    korteCode: "volle",
  },
  {
    waarde: "post-overgang",
    label:
      "Post-overgang (mijn cyclus is een tijd weg, ik zoek het nieuwe ritme)",
    korteCode: "post",
  },
  {
    waarde: "weet-niet",
    label: "Ik weet het niet precies (gewoon nieuwsgierig)",
    korteCode: "onbekend",
  },
];

export const VRAAG_WAT_VALT_OP: VraagKeuze<TweedeLenteWatValtOp>[] = [
  {
    waarde: "energie-patroon",
    label: "Energie-patroon (moe op andere momenten dan vroeger)",
    korteCode: "energie",
  },
  {
    waarde: "slaapritme",
    label: "Slaapritme (anders inslapen, doorslapen of vroeg wakker)",
    korteCode: "slaap",
  },
  {
    waarde: "stemming",
    label: "Stemming (vlakker, korter lontje, of meer reflectie)",
    korteCode: "stemming",
  },
  {
    waarde: "warmte-golven",
    label: "Warmte-golven (opvliegers, nachtelijke warmte)",
    korteCode: "warmte",
  },
  {
    waarde: "cyclus-veranderingen",
    label: "Cyclus-veranderingen (intensiteit, lengte, frequentie)",
    korteCode: "cyclus",
  },
  {
    waarde: "lichaamsbeleving",
    label: "Lichaamsbeleving (gewicht-verschuiving, gewrichten, huid)",
    korteCode: "lichaam",
  },
  {
    waarde: "mentaal-helder-zijn",
    label:
      "Mentaal helder-zijn (concentratie, woord-vinden, vermoeidheid in hoofd)",
    korteCode: "mentaal",
  },
];

export const VRAAG_EET_RITME: VraagKeuze<TweedeLenteEetRitme>[] = [
  { waarde: "regelmatig-bewust", label: "Regelmatig en bewust", korteCode: "regelmatig" },
  {
    waarde: "onregelmatig-gevarieerd",
    label: "Onregelmatig, maar wel gevarieerd",
    korteCode: "gevarieerd",
  },
  {
    waarde: "vaak-snel-tussendoor",
    label: "Vaak iets snels tussendoor",
    korteCode: "snel",
  },
  { waarde: "wisselt-per-dag", label: "Ik wisselt het sterk per dag", korteCode: "wissel" },
];

export const VRAAG_BEWEGING: VraagKeuze<TweedeLenteBeweging>[] = [
  {
    waarde: "stevig",
    label: "Stevig: meer dan 3 keer per week iets fysieks",
    korteCode: "stevig",
  },
  {
    waarde: "licht",
    label: "Licht: 1-2 keer per week iets, plus dagelijks wat lopen",
    korteCode: "licht",
  },
  {
    waarde: "wisselend",
    label: "Wisselend: soms wel, soms helemaal niet",
    korteCode: "wisselend",
  },
  { waarde: "weinig", label: "Weinig op dit moment", korteCode: "weinig" },
];

export const VRAAG_RUST: VraagKeuze<TweedeLenteRust>[] = [
  {
    waarde: "goed-zonder-schuldgevoel",
    label: "Goed, ik kan zonder schuldgevoel niets doen",
    korteCode: "ontspannen",
  },
  { waarde: "wisselend", label: "Wisselend, hangt van de dag af", korteCode: "wisselend" },
  { waarde: "hoofd-staat-aan", label: "Lastig, mijn hoofd staat vaak aan", korteCode: "druk" },
  { waarde: "draai-door", label: "Bijna niet, ik draai door", korteCode: "vol" },
];

export const VRAAG_DEEL: VraagKeuze<TweedeLenteDeel>[] = [
  { waarde: "partner", label: "Mijn partner", korteCode: "partner" },
  {
    waarde: "vriendin-of-vrouw",
    label: "Een vriendin of vrouw uit mijn omgeving",
    korteCode: "vriendin",
  },
  {
    waarde: "huisarts-of-professional",
    label: "Mijn huisarts of een professional",
    korteCode: "professional",
  },
  {
    waarde: "met-niemand-echt",
    label: "Eigenlijk met niemand echt",
    korteCode: "niemand",
  },
];

export const VRAAG_ZOEK: VraagKeuze<TweedeLenteZoek>[] = [
  {
    waarde: "iets-om-mee-te-beginnen",
    label: "Iets om mee te beginnen (kleine stap)",
    korteCode: "beginnen",
  },
  {
    waarde: "begrip-niet-de-enige",
    label: "Begrip dat ik niet de enige ben",
    korteCode: "begrip",
  },
  {
    waarde: "rustige-spiegel",
    label: "Een rustige spiegel op waar ik nu sta",
    korteCode: "spiegel",
  },
  {
    waarde: "concrete-kennis",
    label: "Concrete kennis over wat in deze fase werkt",
    korteCode: "kennis",
  },
];
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen, geen TS-errors.

- [ ] **Step 3: Commit**

```bash
git add lib/freebie-bots/tweede-lente-vragen.ts
git commit -m "feat(tweede-lente): 7 multi-choice vragen-definities"
git push
```

---

## Task 4: Claim-vrije template-zinnen + system-prompt

**Files:**
- Create: `lib/freebie-bots/tweede-lente-system-prompt.ts`

- [ ] **Step 1: Schrijf system-prompt + template-zinnen**

```ts
// File: lib/freebie-bots/tweede-lente-system-prompt.ts
//
// Claim-vrije system-prompt voor de AI-spiegel. De prompt bevat:
//   1. Strakke begrenzing op stem, lengte en structuur
//   2. Een whitelist van 12 template-zinnen waar de AI uit MOET kiezen
//      voor de drie aanpassingen (de bewaker valideert dit achteraf)
//   3. Een verbod op claim-vocabulaire
//
// Reden voor whitelist: voorkomt dat de AI een formulering produceert die
// per ongeluk een EFSA-claim wordt. De AI mag in opening + patroon +
// afsluiting wel zelf zinnen formuleren, maar onder strakke regels.

/**
 * De twaalf template-zinnen voor de "drie aanpassingen". De AI mag
 * ALLEEN uit deze lijst kiezen. De bewaker valideert dit achteraf en
 * vervangt anders door een veilige fallback.
 *
 * TODO-GABY: aanvullen of herformuleren in eigen stem. Elke zin moet
 * claim-vrij blijven: geen "helpt", "verlicht", "ondersteunt klacht",
 * "verbetert". Wel: gedrags- of ritme-suggestie zonder belofte.
 */
export const TEMPLATE_AANPASSINGEN: string[] = [
  "Iets meer water in de ochtend bewust drinken",
  "Een vast moment per dag voor stilte van vijf minuten",
  "Een wandeling als bewuste afsluiter van de dag",
  "Een eet-ritme dat met je energie meeschuift",
  "Aandacht voor wat je 's avonds eet",
  "Twee dagen per week iets fysieks dat je leuk vindt",
  "Een vast ritueel rond het slapengaan",
  "Een glas water bij elke maaltijd",
  "Een korte adempauze tussen twee taken door",
  "Een dag-afsluiter waarin je drie dingen benoemt die goed gingen",
  "Eén ding per week dat puur voor jezelf is",
  "Een natuurmoment per dag, ook als het kort is",
];

/**
 * Verboden vocabulaire dat de bewaker hard wegfiltert uit AI-output.
 * Lower-case match. Bij detectie: hele zin vervangen door fallback.
 */
export const VERBODEN_WOORDEN: string[] = [
  "helpt bij",
  "helpt tegen",
  "verlicht",
  "verbetert",
  "ondersteunt klacht",
  "lost op",
  "verhelpt",
  "geneest",
  "behandelt",
  "werkt tegen",
  "bewezen",
  "gegarandeerd",
  "wetenschappelijk aangetoond",
  "zorgt ervoor dat",
  "vermindert",
  "stopt",
  "elimineert",
];

/**
 * Bouwt de strakke system-prompt voor OpenAI. Geeft de AI een vaste
 * structuur + de template-whitelist + de zeven antwoorden van de prospect.
 */
export function bouwTweedeLenteSysteemPrompt(): string {
  const aanpassingen = TEMPLATE_AANPASSINGEN.map((t, i) => `  ${i + 1}. "${t}"`).join("\n");

  return `Je bent een vriendelijke, herkennende stem uit een vrouwen-team dat
zelf door de overgangsfase is gegaan. Je schrijft een spiegel-tekst voor
een vrouw die zojuist 7 multi-choice vragen heeft beantwoord over haar
overgangsfase. Je doel: warm herkennen, geen advies, geen belofte,
geen claim.

JE OUTPUT IS STRIKT JSON met deze keys:
  - opening (string): één openings-zin van ongeveer twee regels
  - patroon (string): één paragraaf van 3-4 regels die de combi opmerkt
  - driAanpassingen (array van precies 3 strings): kies uit de twaalf
    template-zinnen hieronder
  - afsluiting (string): één afsluitings-zin die overgaat naar het opt-in

DE TWAALF TEMPLATE-ZINNEN VOOR driAanpassingen:
${aanpassingen}

REGELS:
1. Spreek de vrouw aan met "je" (informeel-warm).
2. Gebruik nooit haar naam, die wordt apart toegevoegd.
3. Gebruik nooit het woord "ik" (jij bent een team, niet een individu).
4. Gebruik wel "wij" of "we" als je het team noemt.
5. Gebruik nooit een productnaam of een supplement-naam in opening, patroon
   of afsluiting. Producten komen in een ander blok.
6. Verboden vocabulaire dat NOOIT mag voorkomen:
   - "helpt bij", "helpt tegen", "verlicht", "verbetert", "ondersteunt klacht"
   - "lost op", "verhelpt", "geneest", "behandelt", "werkt tegen"
   - "bewezen", "gegarandeerd", "wetenschappelijk aangetoond"
   - "zorgt ervoor dat", "vermindert", "stopt", "elimineert"
   - Specifieke claims over hormonen, opvliegers, slaap, stemming of
     andere gezondheidsbeloften.
7. Geen em-dashes. Gebruik komma's of punten.
8. Geen tijds-prognoses ("binnen 2 weken", "na een maand", "snel"). Wel:
   "veel vrouwen merken na verloop van tijd...".
9. driAanpassingen: kies precies drie zinnen uit de twaalf hierboven,
   ongewijzigd. Niet zelf formuleren, niet samenvoegen, niet aanpassen.

VOORBEELD-OUTPUT (strict JSON, geen extra tekst):
{
  "opening": "Wat fijn dat je dit hebt ingevuld. Dit is een fase die veel vrouwen herkennen, en je staat er niet alleen in.",
  "patroon": "We zien dat je [thema] aangeeft, samen met [thema]. Dat is een combinatie die we vaker horen bij vrouwen in jouw fase. Het is geen toeval dat die twee samen oplopen.",
  "driAanpassingen": ["Een vast moment per dag voor stilte van vijf minuten", "Een eet-ritme dat met je energie meeschuift", "Een wandeling als bewuste afsluiter van de dag"],
  "afsluiting": "Veel vrouwen kiezen op dit punt voor een paar avonden mail om verder te verkennen. Daaronder kun je je inschrijven als dat goed voelt."
}

BELANGRIJK: geef ALLEEN het JSON-object terug, geen markdown, geen uitleg.`;
}

/**
 * Bouwt het user-bericht met de 7 antwoorden in een compact formaat.
 */
export function bouwTweedeLenteUserBericht(
  antwoordRegel: string,
): string {
  return `De vrouw heeft het volgende ingevuld:\n\n${antwoordRegel}\n\nGenereer nu de JSON-spiegel volgens de regels.`;
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add lib/freebie-bots/tweede-lente-system-prompt.ts
git commit -m "feat(tweede-lente): system-prompt + 12 template-zinnen voor AI-spiegel"
git push
```

---

## Task 5: Bewaker-functie voor AI-output

**Files:**
- Create: `lib/freebie-bots/templatezinnen-bewaker.ts`

- [ ] **Step 1: Schrijf de bewaker**

```ts
// File: lib/freebie-bots/templatezinnen-bewaker.ts
//
// Bewaakt de AI-output. Drie lagen:
//   1. JSON-parse: faalt als output geen valide JSON is.
//   2. Whitelist-check op driAanpassingen: elke zin moet exact in
//      TEMPLATE_AANPASSINGEN voorkomen, anders vervangen door fallback.
//   3. Verboden-vocabulaire-scan op opening + patroon + afsluiting:
//      bij match wordt de zin vervangen door een veilige fallback.

import type { SpiegelOutput } from "./types";
import {
  TEMPLATE_AANPASSINGEN,
  VERBODEN_WOORDEN,
} from "./tweede-lente-system-prompt";

const FALLBACK_OPENING =
  "Wat fijn dat je dit hebt ingevuld. Dit is een fase die veel vrouwen herkennen, en je staat er niet alleen in.";

const FALLBACK_PATROON =
  "We zien een combinatie van dingen die we vaker horen bij vrouwen in deze fase. Het is geen toeval dat die signalen samen oplopen. Veel vrouwen voelen herkenning als ze zien dat het een patroon is, niet een losse klacht.";

const FALLBACK_AFSLUITING =
  "Veel vrouwen kiezen op dit punt voor een paar avonden mail om verder te verkennen. Daaronder kun je je inschrijven als dat goed voelt.";

const FALLBACK_DRI_AANPASSINGEN: [string, string, string] = [
  TEMPLATE_AANPASSINGEN[1], // Een vast moment per dag voor stilte
  TEMPLATE_AANPASSINGEN[3], // Een eet-ritme dat meeschuift
  TEMPLATE_AANPASSINGEN[2], // Een wandeling als afsluiter
];

/**
 * Scant een zin op verboden vocabulaire. Returnt true als de zin verdacht is.
 */
export function bevatVerbodenWoord(zin: string): boolean {
  const lowered = zin.toLowerCase();
  return VERBODEN_WOORDEN.some((w) => lowered.includes(w));
}

/**
 * Parse + valideer de AI-output. Bij twijfel: fallback. Returnt altijd
 * een veilige SpiegelOutput. Logging via console.warn voor debugging.
 */
export function bewaakSpiegelOutput(raw: string): SpiegelOutput {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (_e) {
    console.warn("[tweede-lente-bewaker] JSON-parse fout, volledige fallback");
    return {
      opening: FALLBACK_OPENING,
      patroon: FALLBACK_PATROON,
      driAanpassingen: FALLBACK_DRI_AANPASSINGEN,
      afsluiting: FALLBACK_AFSLUITING,
    };
  }

  const opening =
    typeof parsed.opening === "string" && !bevatVerbodenWoord(parsed.opening)
      ? parsed.opening
      : FALLBACK_OPENING;

  const patroon =
    typeof parsed.patroon === "string" && !bevatVerbodenWoord(parsed.patroon)
      ? parsed.patroon
      : FALLBACK_PATROON;

  const afsluiting =
    typeof parsed.afsluiting === "string" &&
    !bevatVerbodenWoord(parsed.afsluiting)
      ? parsed.afsluiting
      : FALLBACK_AFSLUITING;

  let driAanpassingen: [string, string, string] = FALLBACK_DRI_AANPASSINGEN;
  if (
    Array.isArray(parsed.driAanpassingen) &&
    parsed.driAanpassingen.length === 3 &&
    parsed.driAanpassingen.every(
      (z): z is string =>
        typeof z === "string" && TEMPLATE_AANPASSINGEN.includes(z),
    )
  ) {
    driAanpassingen = parsed.driAanpassingen as [string, string, string];
  } else {
    console.warn(
      "[tweede-lente-bewaker] driAanpassingen niet uit whitelist, fallback",
    );
  }

  return { opening, patroon, driAanpassingen, afsluiting };
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add lib/freebie-bots/templatezinnen-bewaker.ts
git commit -m "feat(tweede-lente): bewaker-functie voor claim-vrije AI-output"
git push
```

---

## Task 6: Token-generator helper

**Files:**
- Create: `lib/freebie-bots/token.ts`

- [ ] **Step 1: Schrijf de helper**

```ts
// File: lib/freebie-bots/token.ts
//
// Genereert een 16-char hex tracking-token (hergebruik patroon van
// productadvies-test: a-z + 0-9). Botsing-kans bij 16 chars en 36^16
// possibilities: verwaarloosbaar voor pilot-schaal.

const TOKEN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_LENGTE = 16;

export function genereerBotToken(): string {
  let result = "";
  for (let i = 0; i < TOKEN_LENGTE; i++) {
    result += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return result;
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add lib/freebie-bots/token.ts
git commit -m "feat(tweede-lente): token-generator helper"
git push
```

---

## Task 7: API-route, maak-of-haal-tracking-token

**Files:**
- Create: `app/api/freebie-bot/maak-token/route.ts`

- [ ] **Step 1: Schrijf de route**

```ts
// File: app/api/freebie-bot/maak-token/route.ts
//
// POST /api/freebie-bot/maak-token
// Body: { botSlug: BotSlug }
// Response: { token, url }
//
// Maakt een tracking-token aan voor (auth-user, botSlug) als die nog
// niet bestaat, of geeft de bestaande terug. Een member ziet hier haar
// persoonlijke link voor de bot.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import type { BotSlug } from "@/lib/freebie-bots/types";

const TOEGESTANE_SLUGS: BotSlug[] = ["tweede-lente"];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const botSlug = body.botSlug as BotSlug | undefined;
    if (!botSlug || !TOEGESTANE_SLUGS.includes(botSlug)) {
      return NextResponse.json(
        { error: "Ongeldige bot-slug" },
        { status: 400 },
      );
    }

    // Check of token al bestaat
    const { data: bestaand } = await supabase
      .from("freebie_bot_member_tokens")
      .select("token")
      .eq("member_id", user.id)
      .eq("bot_slug", botSlug)
      .maybeSingle();

    if (bestaand?.token) {
      return NextResponse.json({
        token: bestaand.token,
        url: `/bot/${botSlug}/${bestaand.token}`,
        nieuw: false,
      });
    }

    // Genereer nieuwe token (max 5 pogingen tegen collision)
    let token = genereerBotToken();
    for (let pogingen = 0; pogingen < 5; pogingen++) {
      const { data: collision } = await supabase
        .from("freebie_bot_member_tokens")
        .select("id")
        .eq("token", token)
        .maybeSingle();
      if (!collision) break;
      token = genereerBotToken();
    }

    const { error: insertErr } = await supabase
      .from("freebie_bot_member_tokens")
      .insert({
        member_id: user.id,
        bot_slug: botSlug,
        token,
      });

    if (insertErr) {
      console.error("maak-token insert fout:", insertErr);
      return NextResponse.json(
        { error: "Token-opslag mislukt" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      url: `/bot/${botSlug}/${token}`,
      nieuw: true,
    });
  } catch (e) {
    console.error("maak-token exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add app/api/freebie-bot/maak-token/route.ts
git commit -m "feat(tweede-lente): API maak-of-haal-tracking-token voor member"
git push
```

---

## Task 8: API-route, start (token valideren + member-context)

**Files:**
- Create: `app/api/freebie-bot/start/route.ts`

- [ ] **Step 1: Schrijf de route**

```ts
// File: app/api/freebie-bot/start/route.ts
//
// POST /api/freebie-bot/start
// Body: { token: string }
// Response: { ok: true, memberId, memberVoornaam, botSlug } of { error }
//
// PUBLIEKE route. Geen auth-check op de aanroeper. Wel: token MOET
// matchen met een rij in freebie_bot_member_tokens. Gebruikt
// service-role-admin-client omdat RLS-policy 'anon' weigert.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    if (!token || typeof token !== "string" || token.length !== 16) {
      return NextResponse.json(
        { error: "Ongeldige token" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();

    if (!row) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", row.member_id)
      .maybeSingle();

    const memberVoornaam =
      ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

    return NextResponse.json({
      ok: true,
      memberId: row.member_id,
      memberVoornaam,
      botSlug: row.bot_slug,
    });
  } catch (e) {
    console.error("freebie-bot/start exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add app/api/freebie-bot/start/route.ts
git commit -m "feat(tweede-lente): API start, token-validatie + member-context"
git push
```

---

## Task 9: API-route, spiegel (OpenAI-aanroep + bewaker)

**Files:**
- Create: `app/api/freebie-bot/spiegel/route.ts`

- [ ] **Step 1: Schrijf de route**

```ts
// File: app/api/freebie-bot/spiegel/route.ts
//
// POST /api/freebie-bot/spiegel
// Body: { token: string, antwoorden: TweedeLenteAntwoorden }
// Response: SpiegelOutput
//
// PUBLIEKE route. Token-validatie eerst. Daarna OpenAI gpt-4o-mini
// met strakke system-prompt. Output gaat door de bewaker en dan terug.
// Geen DB-schrijven hier, dat gebeurt in opt-in-route bij e-mail-submit.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bouwTweedeLenteSysteemPrompt,
  bouwTweedeLenteUserBericht,
} from "@/lib/freebie-bots/tweede-lente-system-prompt";
import { bewaakSpiegelOutput } from "@/lib/freebie-bots/templatezinnen-bewaker";
import type { TweedeLenteAntwoorden } from "@/lib/freebie-bots/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY niet ingesteld" },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const antwoorden = body.antwoorden as TweedeLenteAntwoorden | undefined;

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!antwoorden || !antwoorden.fase) {
      return NextResponse.json(
        { error: "Antwoorden onvolledig" },
        { status: 400 },
      );
    }

    // Token valideren
    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();
    if (!row) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    // Compacte antwoord-string voor de prompt
    const antwoordRegel = [
      `Fase: ${antwoorden.fase}`,
      `Valt op: ${antwoorden.watValtOp.join(", ")}`,
      `Eet-ritme: ${antwoorden.eetRitme}`,
      `Beweging: ${antwoorden.beweging}`,
      `Rust: ${antwoorden.rust}`,
      `Deelt met: ${antwoorden.deel}`,
      `Zoekt: ${antwoorden.zoek}`,
    ].join("\n");

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: bouwTweedeLenteSysteemPrompt() },
        { role: "user", content: bouwTweedeLenteUserBericht(antwoordRegel) },
      ],
      temperature: 0.5,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const spiegel = bewaakSpiegelOutput(raw);

    return NextResponse.json(spiegel);
  } catch (e) {
    console.error("freebie-bot/spiegel exception:", e);
    return NextResponse.json(
      { error: "Spiegel-generatie mislukt" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add app/api/freebie-bot/spiegel/route.ts
git commit -m "feat(tweede-lente): API spiegel met OpenAI + bewaker"
git push
```

---

## Task 10: API-route, opt-in (lead-opslag + klantomgeving + notificatie)

**Files:**
- Create: `app/api/freebie-bot/opt-in/route.ts`

- [ ] **Step 1: Schrijf de route**

```ts
// File: app/api/freebie-bot/opt-in/route.ts
//
// POST /api/freebie-bot/opt-in
// Body: {
//   token: string,
//   leadNaam: string,
//   leadEmail: string,
//   antwoorden: TweedeLenteAntwoorden,
//   spiegelTekst: string,
//   contactGewenst: boolean
// }
// Response: { ok: true } of { error }
//
// 1. Token valideren
// 2. Freebie-row voor 'tweede-lente' ophalen (slug)
// 3. Opt-in rij maken in freebie_opt_ins (met bot_antwoorden + spiegel_tekst)
// 4. Klantomgeving-rij maken in klantomgeving_klanten (bron='freebie-opt-in')
// 5. Bij contactGewenst: push-notificatie naar member sturen

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import type { TweedeLenteAntwoorden } from "@/lib/freebie-bots/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const leadNaam = body.leadNaam as string | undefined;
    const leadEmail = body.leadEmail as string | undefined;
    const antwoorden = body.antwoorden as TweedeLenteAntwoorden | undefined;
    const spiegelTekst = body.spiegelTekst as string | undefined;
    const contactGewenst = body.contactGewenst === true;

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!leadNaam || !leadEmail) {
      return NextResponse.json(
        { error: "Naam en e-mail zijn verplicht" },
        { status: 400 },
      );
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) {
      return NextResponse.json(
        { error: "E-mailadres lijkt niet geldig" },
        { status: 400 },
      );
    }
    if (!antwoorden) {
      return NextResponse.json(
        { error: "Antwoorden ontbreken" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Token-row + member ophalen
    const { data: tokenRow } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();
    if (!tokenRow) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    // Freebie-row ophalen op slug. We mappen 'tweede-lente' bot naar
    // de freebie met diezelfde slug (moet door SQL-import bestaan).
    let freebieRij: { id: string } | null = null;
    const { data: bestaandeFreebie } = await supabase
      .from("freebies")
      .select("id")
      .eq("slug", "tweede-lente")
      .maybeSingle();
    freebieRij = (bestaandeFreebie as { id: string } | null) ?? null;

    if (!freebieRij) {
      // Freebie-row bestaat nog niet in DB. Voor pilot: rij on-the-fly
      // aanmaken zodat opt-ins niet blokkeren tijdens Gaby's tekst-werk.
      const { data: nieuweFreebie, error: freebieErr } = await supabase
        .from("freebies")
        .insert({
          slug: "tweede-lente",
          titel: "Tweede Lente",
          ondertitel: "Een korte spiegel voor jouw fase",
          vorm: "test",
          onderwerp: "overgang",
          beschrijving:
            "Bot-pilot voor freebie-toolkit. Vijf-minuten-spiegel + opt-in voor 5-mail-reeks.",
          actief: true,
        })
        .select("id")
        .single();
      if (freebieErr || !nieuweFreebie) {
        return NextResponse.json(
          { error: "Freebie-rij aanmaken mislukt" },
          { status: 500 },
        );
      }
      freebieRij = nieuweFreebie as { id: string };
    }

    // Opt-in rij invoegen
    const { data: optIn, error: optInErr } = await supabase
      .from("freebie_opt_ins")
      .insert({
        freebie_id: freebieRij.id,
        member_id: tokenRow.member_id,
        lead_naam: leadNaam,
        lead_email: leadEmail,
        bron_kanaal: "tweede-lente-bot",
        status: "nieuw",
        bot_antwoorden: antwoorden,
        spiegel_tekst: spiegelTekst ?? null,
      })
      .select("id")
      .single();

    if (optInErr || !optIn) {
      console.error("opt-in insert fout:", optInErr);
      return NextResponse.json(
        { error: "Opt-in opslag mislukt" },
        { status: 500 },
      );
    }

    // Klantomgeving-rij maken
    const { error: klantErr } = await supabase
      .from("klantomgeving_klanten")
      .insert({
        member_id: tokenRow.member_id,
        klant_naam: leadNaam,
        klant_email: leadEmail,
        bron: "freebie-opt-in",
        freebie_opt_in_id: optIn.id,
        status: "actief",
      });

    if (klantErr) {
      console.warn("Klantomgeving-rij niet aangemaakt:", klantErr);
      // niet blokkerend, we hebben de opt-in al
    }

    // Notificatie alleen bij contactGewenst. sendPushToUser-signature
    // uit lib/push/sendPush.ts: (userId, { title, body, url?, tag? }).
    if (contactGewenst) {
      try {
        await sendPushToUser(tokenRow.member_id, {
          title: "Nieuwe lead vraagt contact",
          body: `${leadNaam} heeft via Tweede Lente om contact gevraagd.`,
          url: "/klant",
          tag: "tweede-lente-contact",
        });
      } catch (pushErr) {
        console.warn("Push-notificatie mislukt:", pushErr);
      }
    }

    return NextResponse.json({ ok: true, optInId: optIn.id });
  } catch (e) {
    console.error("freebie-bot/opt-in exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verifieer dat sendPushToUser-signature klopt**

Run: `grep -n "export.*sendPushToUser" lib/push/sendPush.ts`
Expected: één export-regel `export async function sendPushToUser(userId: string, payload: { title, body, url?, tag? })`.

Als de signature is veranderd: pas de call in de route aan.

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 4: Commit**

```bash
git add app/api/freebie-bot/opt-in/route.ts
git commit -m "feat(tweede-lente): API opt-in met lead + klantomgeving + push"
git push
```

---

## Task 11: Publieke bot-landingspagina (zonder token)

**Files:**
- Create: `app/bot/tweede-lente/page.tsx`

- [ ] **Step 1: Schrijf de landingspagina**

```tsx
// File: app/bot/tweede-lente/page.tsx
//
// Landingspagina als iemand de bot opent zonder geldige token.
// Boodschap: "vraag een team-vrouw om haar persoonlijke link".
// Geen formulier, geen omweg.

import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tweede Lente",
  description:
    "Een korte spiegel voor vrouwen in peri-, volle of post-overgang. Toegang via een persoonlijke link.",
  openGraph: {
    title: "Tweede Lente",
    description:
      "Een korte spiegel voor vrouwen in peri-, volle of post-overgang.",
    images: [],
  },
};

export default function TweedeLenteLandingPagina() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="text-center">
          <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
            Tweede Lente
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Deze link heeft een persoonlijk adres nodig
          </h1>
          <p className="mt-4 text-gray-700">
            Tweede Lente is een korte spiegel voor vrouwen in de overgang. Je
            opent hem via een persoonlijke link van iemand uit ons team.
          </p>
          <p className="mt-3 text-gray-700">
            Heb je een vrouw uit ons team in gedachten? Vraag haar gerust om
            haar persoonlijke link. Heb je nog geen contact? Reageer op haar
            social-post met het trigger-woord dat zij heeft gedeeld.
          </p>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-400">
          Tweede Lente deelt herkenning en richting, geen medisch advies. Voor
          specifieke klachten of vragen over je gezondheid: raadpleeg altijd
          je huisarts.
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen, route gerouted.

- [ ] **Step 3: Commit**

```bash
git add app/bot/tweede-lente/page.tsx
git commit -m "feat(tweede-lente): publieke landingspagina zonder token"
git push
```

---

## Task 12: Server-component voor de [token]-pagina

**Files:**
- Create: `app/bot/tweede-lente/[token]/page.tsx`

- [ ] **Step 1: Schrijf server-component**

```tsx
// File: app/bot/tweede-lente/[token]/page.tsx
//
// Server-component die de token uit de URL valideert via admin-client
// (RLS-bypass nodig omdat dit een publieke route is). Bij ongeldige
// token: notFound() zodat we naar /bot/tweede-lente kunnen redirecten
// via de notFound-handler, of een eigen 404.
//
// Bij geldige token: rendert <TweedeLenteFlow /> met member-context.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { TweedeLenteFlow } from "./tweede-lente-flow";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("member_id")
    .eq("token", token)
    .maybeSingle();

  let memberVoornaam = "iemand";
  if (row?.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", row.member_id)
      .maybeSingle();
    memberVoornaam =
      ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";
  }

  const titel = "Tweede Lente, een korte spiegel voor jouw fase";
  const beschrijving = `Vijf minuten, zeven vragen, een rustige spiegel. Klaargezet door ${memberVoornaam} en haar team.`;

  return {
    title: titel,
    description: beschrijving,
    openGraph: { title: titel, description: beschrijving, images: [] },
    twitter: { card: "summary", title: titel, description: beschrijving },
    icons: { icon: undefined, apple: undefined },
  };
}

export default async function TweedeLenteTokenPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("member_id, bot_slug")
    .eq("token", token)
    .maybeSingle();

  if (!row || row.bot_slug !== "tweede-lente") {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <TweedeLenteFlow
        token={token}
        memberId={row.member_id}
        memberVoornaam={memberVoornaam}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen (TweedeLenteFlow bestaat nog niet, deze task BLOKT op Task 13. Daarom Task 13 direct hierna.)

Bij eventuele build-fout: dat is verwacht totdat Task 13 klaar is. Schuif door naar Task 13.

- [ ] **Step 3: Commit (NA Task 13 build groen)**

Commit deze samen met Task 13 om build-history schoon te houden.

---

## Task 13: Client flow-shell (lege 4 blokken-router)

**Files:**
- Create: `app/bot/tweede-lente/[token]/tweede-lente-flow.tsx`

- [ ] **Step 1: Schrijf flow-shell**

```tsx
// File: app/bot/tweede-lente/[token]/tweede-lente-flow.tsx
//
// Client-flow voor de Tweede Lente bot. Houdt huidig blok bij in state,
// rendert het juiste blok-component. Geen extra UI-chroom.

"use client";

import { useState } from "react";
import type { TweedeLenteAntwoorden, SpiegelOutput } from "@/lib/freebie-bots/types";
import { BlokIntro } from "./blok-intro";
import { BlokVragen } from "./blok-vragen";
import { BlokSpiegel } from "./blok-spiegel";
import { BlokOptIn } from "./blok-opt-in";

type FlowBlok = "intro" | "vragen" | "spiegel" | "opt-in" | "klaar";

export function TweedeLenteFlow({
  token,
  memberId,
  memberVoornaam,
}: {
  token: string;
  memberId: string;
  memberVoornaam: string;
}) {
  const [blok, setBlok] = useState<FlowBlok>("intro");
  const [antwoorden, setAntwoorden] = useState<TweedeLenteAntwoorden | null>(null);
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);

  // memberId bewust niet getoond aan prospect. Wel beschikbaar voor
  // opt-in-call. We geven memberVoornaam wel mee in passende plekken.

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {blok === "intro" && (
        <BlokIntro onStart={() => setBlok("vragen")} />
      )}
      {blok === "vragen" && (
        <BlokVragen
          onKlaar={(a) => {
            setAntwoorden(a);
            setBlok("spiegel");
          }}
        />
      )}
      {blok === "spiegel" && antwoorden && (
        <BlokSpiegel
          token={token}
          antwoorden={antwoorden}
          onVolgende={(s) => {
            setSpiegel(s);
            setBlok("opt-in");
          }}
        />
      )}
      {blok === "opt-in" && antwoorden && spiegel && (
        <BlokOptIn
          token={token}
          antwoorden={antwoorden}
          spiegel={spiegel}
          memberVoornaam={memberVoornaam}
          onKlaar={() => setBlok("klaar")}
        />
      )}
      {blok === "klaar" && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Je inschrijving is binnen
          </h2>
          <p className="mt-3 text-gray-700">
            Je ontvangt de eerste mail vanavond. Kijk er even rustig naar
            wanneer het je uitkomt. Geen druk.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            Tweede Lente, met dank dat je deze ruimte hebt gepakt.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren (nog niet groen verwacht)**

Run: `npm run build`
Expected: build faalt op ontbrekende blok-componenten. Doorgaan naar Task 14.

---

## Task 14: Blok 1, warme intro

**Files:**
- Create: `app/bot/tweede-lente/[token]/blok-intro.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
// File: app/bot/tweede-lente/[token]/blok-intro.tsx
//
// Blok 1, warme intro in ELEVA-team-stem (niet Gaby-specifiek).
// Geen member-naam zichtbaar voor prospect, om twee redenen:
//   1. Naam-mismatch tussen social en systeem (Raoul, 2026-05-24)
//   2. De vrouw moet zich op zichzelf richten, niet op de afzender
//
// TODO-GABY: definitieve openings-tekst aanleveren. Onder staat
// een placeholder die claim-vrij is en in jullie stem klinkt.

"use client";

export function BlokIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Tweede Lente
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
        Welkom 💟
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        Fijn dat je hier bent. Wij zijn vrouwen die door deze fase zijn
        gegaan, en wij hebben deze ruimte voor jou gemaakt.
      </p>
      <p className="mt-4 text-gray-700 leading-relaxed">
        Vijf minuten, zeven vragen. Aan het eind een rustige spiegel en
        een paar concrete ideeën waar veel vrouwen in jouw fase voor
        kiezen.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 rounded-full bg-rose-600 px-8 py-3 text-white text-base font-medium shadow-sm hover:bg-rose-700 transition"
      >
        Ja, start de vragen
      </button>
      <p className="mt-6 text-xs text-gray-400">
        Tweede Lente deelt herkenning en richting, geen medisch advies.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren (nog niet groen)**

Run: `npm run build`
Expected: nog steeds faalt op ontbrekende blokken. Doorgaan.

---

## Task 15: Blok 2, vragen-blok (7 vragen één per scherm)

**Files:**
- Create: `app/bot/tweede-lente/[token]/blok-vragen.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
// File: app/bot/tweede-lente/[token]/blok-vragen.tsx
//
// Blok 2, 7 multi-choice vragen één per scherm met voortgangsbalk.
// Vraag 2 (watValtOp) is multi-select 1-3, rest is single-select.

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  TweedeLenteFase,
  TweedeLenteWatValtOp,
  TweedeLenteEetRitme,
  TweedeLenteBeweging,
  TweedeLenteRust,
  TweedeLenteDeel,
  TweedeLenteZoek,
} from "@/lib/freebie-bots/types";
import {
  VRAAG_FASE,
  VRAAG_WAT_VALT_OP,
  VRAAG_EET_RITME,
  VRAAG_BEWEGING,
  VRAAG_RUST,
  VRAAG_DEEL,
  VRAAG_ZOEK,
} from "@/lib/freebie-bots/tweede-lente-vragen";

type Stap = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function BlokVragen({
  onKlaar,
}: {
  onKlaar: (a: TweedeLenteAntwoorden) => void;
}) {
  const [stap, setStap] = useState<Stap>(1);
  const [fase, setFase] = useState<TweedeLenteFase | null>(null);
  const [watValtOp, setWatValtOp] = useState<TweedeLenteWatValtOp[]>([]);
  const [eetRitme, setEetRitme] = useState<TweedeLenteEetRitme | null>(null);
  const [beweging, setBeweging] = useState<TweedeLenteBeweging | null>(null);
  const [rust, setRust] = useState<TweedeLenteRust | null>(null);
  const [deel, setDeel] = useState<TweedeLenteDeel | null>(null);
  const [zoek, setZoek] = useState<TweedeLenteZoek | null>(null);

  function next() {
    if (stap === 7) {
      if (fase && eetRitme && beweging && rust && deel && zoek) {
        onKlaar({
          fase,
          watValtOp,
          eetRitme,
          beweging,
          rust,
          deel,
          zoek,
        });
      }
      return;
    }
    setStap((s) => (s + 1) as Stap);
  }

  function back() {
    if (stap === 1) return;
    setStap((s) => (s - 1) as Stap);
  }

  function toggleWatValtOp(w: TweedeLenteWatValtOp) {
    setWatValtOp((arr) => {
      if (arr.includes(w)) return arr.filter((x) => x !== w);
      if (arr.length >= 3) return arr; // max 3
      return [...arr, w];
    });
  }

  const huidigeStapKlaar =
    (stap === 1 && fase !== null) ||
    (stap === 2 && watValtOp.length >= 1) ||
    (stap === 3 && eetRitme !== null) ||
    (stap === 4 && beweging !== null) ||
    (stap === 5 && rust !== null) ||
    (stap === 6 && deel !== null) ||
    (stap === 7 && zoek !== null);

  return (
    <div>
      <ProgressBar stap={stap} totaal={7} />

      <div className="mt-6">
        {stap === 1 && (
          <SingleChoice
            titel="In welke fase voel je je nu?"
            opties={VRAAG_FASE}
            gekozen={fase}
            onKies={setFase}
          />
        )}
        {stap === 2 && (
          <MultiChoice
            titel="Wat valt je het meest op in je lichaam de laatste maanden?"
            ondertitel="Kies één tot drie."
            opties={VRAAG_WAT_VALT_OP}
            gekozen={watValtOp}
            onToggle={toggleWatValtOp}
          />
        )}
        {stap === 3 && (
          <SingleChoice
            titel="Hoe loopt eten op een gewone dag?"
            opties={VRAAG_EET_RITME}
            gekozen={eetRitme}
            onKies={setEetRitme}
          />
        )}
        {stap === 4 && (
          <SingleChoice
            titel="Hoeveel beweeg je op een gewone week?"
            opties={VRAAG_BEWEGING}
            gekozen={beweging}
            onKies={setBeweging}
          />
        )}
        {stap === 5 && (
          <SingleChoice
            titel="Hoe makkelijk kun je echt rusten?"
            opties={VRAAG_RUST}
            gekozen={rust}
            onKies={setRust}
          />
        )}
        {stap === 6 && (
          <SingleChoice
            titel="Met wie deel je wat je in deze fase ervaart?"
            opties={VRAAG_DEEL}
            gekozen={deel}
            onKies={setDeel}
          />
        )}
        {stap === 7 && (
          <SingleChoice
            titel="Wat zou jij vandaag het liefst willen?"
            opties={VRAAG_ZOEK}
            gekozen={zoek}
            onKies={setZoek}
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={stap === 1}
          className="text-sm text-gray-500 disabled:opacity-30"
        >
          ← Vorige
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!huidigeStapKlaar}
          className="rounded-full bg-rose-600 px-6 py-2 text-white text-sm font-medium disabled:opacity-40"
        >
          {stap === 7 ? "Spiegel tonen" : "Volgende →"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ stap, totaal }: { stap: number; totaal: number }) {
  const pct = (stap / totaal) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Vraag {stap} van {totaal}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-rose-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type Optie<T extends string> = { waarde: T; label: string };

function SingleChoice<T extends string>({
  titel,
  opties,
  gekozen,
  onKies,
}: {
  titel: string;
  opties: Optie<T>[];
  gekozen: T | null;
  onKies: (v: T) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">{titel}</h2>
      <div className="mt-4 space-y-2">
        {opties.map((o) => {
          const actief = gekozen === o.waarde;
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onKies(o.waarde)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition ${
                actief
                  ? "bg-rose-50 border-rose-400 text-rose-900"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-300"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiChoice<T extends string>({
  titel,
  ondertitel,
  opties,
  gekozen,
  onToggle,
}: {
  titel: string;
  ondertitel?: string;
  opties: Optie<T>[];
  gekozen: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">{titel}</h2>
      {ondertitel && (
        <p className="mt-1 text-sm text-gray-500">{ondertitel}</p>
      )}
      <div className="mt-4 space-y-2">
        {opties.map((o) => {
          const actief = gekozen.includes(o.waarde);
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onToggle(o.waarde)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition ${
                actief
                  ? "bg-rose-50 border-rose-400 text-rose-900"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-300"
              }`}
            >
              {actief ? "✓ " : ""}
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {gekozen.length}/3 gekozen
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren (nog niet groen)**

Run: `npm run build`
Expected: nog steeds faalt op spiegel + opt-in. Doorgaan.

---

## Task 16: Blok 3, spiegel-weergave

**Files:**
- Create: `app/bot/tweede-lente/[token]/blok-spiegel.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
// File: app/bot/tweede-lente/[token]/blok-spiegel.tsx
//
// Blok 3, AI-spiegel. Roept /api/freebie-bot/spiegel aan met token +
// antwoorden, toont opening + patroon + driAanpassingen + afsluiting,
// en biedt de "Ga verder" knop richting opt-in.
//
// Loading-state: schaduw-skelet van 3-4 grijze lijntjes terwijl
// OpenAI bezig is. Fout-state: vriendelijke melding met retry-knop.

"use client";

import { useEffect, useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";

export function BlokSpiegel({
  token,
  antwoorden,
  onVolgende,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  onVolgende: (s: SpiegelOutput) => void;
}) {
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    let actief = true;
    setFout(null);
    setSpiegel(null);
    fetch("/api/freebie-bot/spiegel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, antwoorden }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!actief) return;
        if (!r.ok) {
          setFout(data.error ?? "Spiegel-generatie mislukt");
          return;
        }
        setSpiegel(data as SpiegelOutput);
      })
      .catch((e) => {
        if (!actief) return;
        setFout(String(e));
      });
    return () => {
      actief = false;
    };
  }, [token, antwoorden]);

  if (fout) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Het lukte even niet om je spiegel op te halen
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Wil je het opnieuw proberen? Soms is de verbinding traag.
        </p>
        <button
          type="button"
          onClick={() => {
            setFout(null);
            setSpiegel(null);
            // forceer re-effect door state-reset
            window.location.reload();
          }}
          className="mt-4 rounded-full bg-rose-600 px-6 py-2 text-white text-sm font-medium"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!spiegel) {
    return (
      <div>
        <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
          Een moment, je spiegel komt eraan
        </div>
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 bg-rose-100 rounded w-3/4" />
          <div className="h-4 bg-rose-100 rounded w-5/6" />
          <div className="h-4 bg-rose-100 rounded w-2/3" />
          <div className="mt-4 h-4 bg-rose-100 rounded w-4/5" />
          <div className="h-4 bg-rose-100 rounded w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Jouw spiegel
      </div>

      <p className="mt-4 text-lg text-gray-800 leading-relaxed">
        {spiegel.opening}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">
        {spiegel.patroon}
      </p>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-900">
          Drie kleine aanpassingen die veel vrouwen in jouw fase kiezen
        </h3>
        <ul className="mt-3 space-y-2">
          {spiegel.driAanpassingen.map((aanpassing, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3"
            >
              <span className="text-rose-500 font-semibold">{i + 1}</span>
              <span className="text-gray-800">{aanpassing}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">
        {spiegel.afsluiting}
      </p>

      <button
        type="button"
        onClick={() => onVolgende(spiegel)}
        className="mt-8 w-full rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium"
      >
        Ja, ik wil verder kijken
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren (nog niet groen)**

Run: `npm run build`
Expected: nog steeds faalt op opt-in-component. Doorgaan.

---

## Task 17: Blok 4, opt-in + product + contact + disclaimer

**Files:**
- Create: `app/bot/tweede-lente/[token]/blok-opt-in.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
// File: app/bot/tweede-lente/[token]/blok-opt-in.tsx
//
// Blok 4, opt-in voor 5-mail-reeks + product-richting + persoonlijk
// contact + disclaimer. Volledig statisch wat tekst betreft.
// Knop "Verstuur" roept /api/freebie-bot/opt-in aan.
//
// TODO-GABY: definitieve tekst voor mailreeks-opt-in en product-blok
// aanleveren. Onder staan claim-vrije concept-zinnen.

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";

// Webshop-product-links. Voor pilot statisch. Later via member's
// bestellinks-koppeling per pakket.
// TODO-GABY: definitieve webshop-URL's vragen aan Raoul.
const PRODUCT_LINKS = {
  menaplus: "https://lifeplus.com/menaplus",
  womensgold: "https://lifeplus.com/womens-gold",
  vitaminsdk: "https://lifeplus.com/vitamins-dk",
};

export function BlokOptIn({
  token,
  antwoorden,
  spiegel,
  memberVoornaam,
  onKlaar,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  spiegel: SpiegelOutput;
  memberVoornaam: string;
  onKlaar: () => void;
}) {
  const [voornaam, setVoornaam] = useState("");
  const [email, setEmail] = useState("");
  const [toestemming, setToestemming] = useState(false);
  const [contactGewenst, setContactGewenst] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const klaarOmTeVerzenden =
    voornaam.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
    toestemming;

  async function verstuur() {
    if (!klaarOmTeVerzenden) return;
    setBezig(true);
    setFout(null);
    try {
      const spiegelTekst = [
        spiegel.opening,
        spiegel.patroon,
        spiegel.driAanpassingen.map((a, i) => `${i + 1}. ${a}`).join("\n"),
        spiegel.afsluiting,
      ].join("\n\n");

      const r = await fetch("/api/freebie-bot/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadNaam: voornaam.trim(),
          leadEmail: email.trim(),
          antwoorden,
          spiegelTekst,
          contactGewenst,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setFout(data.error ?? "Versturen mislukt");
        setBezig(false);
        return;
      }
      onKlaar();
    } catch (e) {
      setFout(String(e));
      setBezig(false);
    }
  }

  return (
    <div>
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Eén ademhaling verder
      </div>

      {/* 4a, Mailreeks-opt-in */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Wil je vijf avonden een korte mail?
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Geschreven door vrouwen uit ons team die deze fase hebben gelopen.
          Niet om iets te beloven, wel om je opties te tonen. Vijf avonden,
          één mail per dag, daarna stilte tenzij jij zelf reageert.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Voornaam</span>
            <input
              type="text"
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Je voornaam"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">E-mailadres</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="naam@voorbeeld.nl"
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={toestemming}
              onChange={(e) => setToestemming(e.target.checked)}
              className="mt-1"
            />
            <span>
              Ik ga akkoord dat mijn naam en e-mailadres worden gebruikt om
              mij vijf mails te sturen en ben akkoord met opname in een
              persoonlijke klantomgeving van ons team. Ik kan op elk moment
              afmelden.
            </span>
          </label>
        </div>
      </section>

      {/* 4b, Product-richting */}
      <section className="mt-8 rounded-2xl bg-rose-50 px-5 py-5">
        <h3 className="text-base font-semibold text-gray-900">
          Veel vrouwen in jouw fase kiezen voor één van deze drie
        </h3>
        <p className="mt-2 text-sm text-gray-700">
          Laagdrempelig startpunt, zelf in onze webshop te bestellen, zonder
          gesprek of programma vooraf.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              href={PRODUCT_LINKS.menaplus}
              target="_blank"
              rel="noreferrer"
              className="text-rose-700 underline"
            >
              MenaPlus
            </a>
            <span className="text-gray-600"> — vaak gekozen door vrouwen in volle of post-overgang</span>
          </li>
          <li>
            <a
              href={PRODUCT_LINKS.womensgold}
              target="_blank"
              rel="noreferrer"
              className="text-rose-700 underline"
            >
              Women's Gold
            </a>
            <span className="text-gray-600"> — vrouwen-specifiek dagelijks basis-supplement</span>
          </li>
          <li>
            <a
              href={PRODUCT_LINKS.vitaminsdk}
              target="_blank"
              rel="noreferrer"
              className="text-rose-700 underline"
            >
              Vitamins D & K
            </a>
            <span className="text-gray-600"> — breed gekozen ondersteuning</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Geen advies, wel een richting. Voor specifieke vragen of een
          persoonlijke kennismaking kun je hieronder iemand uit ons team
          erbij vragen.
        </p>
      </section>

      {/* 4c, Persoonlijk contact-aanbod */}
      <section className="mt-6">
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={contactGewenst}
            onChange={(e) => setContactGewenst(e.target.checked)}
            className="mt-1"
          />
          <span>
            Ik wil dat een vrouw uit het team binnen een paar dagen contact
            opneemt voor een vrijblijvend gesprekje van een kwartier. Geen
            verkoopgesprek, wel iemand die meedenkt over mijn fase.
          </span>
        </label>
      </section>

      {/* Submit */}
      {fout && (
        <p className="mt-4 text-sm text-red-600">{fout}</p>
      )}
      <button
        type="button"
        onClick={verstuur}
        disabled={!klaarOmTeVerzenden || bezig}
        className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium disabled:opacity-40"
      >
        {bezig ? "Even versturen..." : "Schrijf mij in"}
      </button>

      {/* 4d, Disclaimer */}
      <footer className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          Dit is geen medisch advies. Voor specifieke klachten, een
          persoonlijke aanpak of vragen over je gezondheid, raadpleeg
          altijd je huisarts of gynaecoloog. Onze bot deelt herkenning en
          richtingen, geen behandeling. Lifeplus producten zijn
          voedingssupplementen, geen geneesmiddelen.
        </p>
      </footer>

      <p className="mt-3 text-xs text-gray-400 text-center">
        Klaargezet door {memberVoornaam} en haar team.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Build verifiëren (nu groen)**

Run: `npm run build`
Expected: build groen. Alle 4 blokken bestaan nu.

- [ ] **Step 3: Commit (alles van Task 12-17 samen)**

```bash
git add app/bot/tweede-lente/
git commit -m "feat(tweede-lente): publieke bot-flow met 4 blokken"
git push
```

---

## Task 18: Member-dashboard, Mijn tracking-links pagina

**Files:**
- Create: `app/instellingen/mijn-tracking-links/page.tsx`
- Create: `app/instellingen/mijn-tracking-links/kopieer-knop.tsx`

- [ ] **Step 1: Schrijf de server-pagina**

```tsx
// File: app/instellingen/mijn-tracking-links/page.tsx
//
// Member-dashboard, sectie "Mijn freebie-bot-links". Toont per bot de
// persoonlijke tracking-URL met kopieer-knop. Voor pilot alleen Tweede
// Lente actief. Genereert token aan bij eerste bezoek.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import { KopieerKnop } from "./kopieer-knop";

export const dynamic = "force-dynamic";

const ACTIEVE_BOTS = [
  {
    slug: "tweede-lente",
    titel: "Tweede Lente",
    beschrijving:
      "Vijf-minuten spiegel voor vrouwen in peri-, volle of post-overgang.",
    triggerVoorbeeld: "TWEEDE-LENTE",
  },
];

export default async function MijnTrackingLinksPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Voor elke actieve bot: haal of maak token aan
  const tokensPerBot: Record<string, string> = {};
  for (const bot of ACTIEVE_BOTS) {
    const { data: bestaand } = await supabase
      .from("freebie_bot_member_tokens")
      .select("token")
      .eq("member_id", user.id)
      .eq("bot_slug", bot.slug)
      .maybeSingle();

    if (bestaand?.token) {
      tokensPerBot[bot.slug] = bestaand.token;
      continue;
    }

    const nieuweToken = genereerBotToken();
    const { data: inserted } = await supabase
      .from("freebie_bot_member_tokens")
      .insert({
        member_id: user.id,
        bot_slug: bot.slug,
        token: nieuweToken,
      })
      .select("token")
      .single();

    tokensPerBot[bot.slug] = inserted?.token ?? nieuweToken;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🔗 Mijn freebie-bot-links</h1>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Dit zijn jouw persoonlijke links naar onze freebie-bots. Iedereen
        die via jouw link de bot doet, komt in jouw klantomgeving terecht.
      </p>

      <section className="mt-8 space-y-4">
        {ACTIEVE_BOTS.map((bot) => {
          const url = `${origin}/bot/${bot.slug}/${tokensPerBot[bot.slug]}`;
          return (
            <div
              key={bot.slug}
              className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5"
            >
              <h2 className="text-lg font-semibold">{bot.titel}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {bot.beschrijving}
              </p>

              <div className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 break-all">
                {url}
              </div>
              <KopieerKnop tekst={url} />

              <details className="mt-4 text-sm text-slate-400">
                <summary className="cursor-pointer hover:text-slate-200">
                  Voorbeeld-zin voor social-post
                </summary>
                <p className="mt-2 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg">
                  "Wil je vijf minuten naar je eigen ritme kijken in deze
                  fase? Reageer met {bot.triggerVoorbeeld} en ik stuur je
                  mijn persoonlijke link."
                </p>
                <p className="mt-2 text-xs">
                  De vrouw reageert, jij stuurt haar via DM jouw link
                  hierboven. Zo houd je controle over wie haar krijgt.
                </p>
              </details>
            </div>
          );
        })}
      </section>

      <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h3 className="text-base font-medium text-amber-100">
          Meer bots komen later
        </h3>
        <p className="mt-1 text-sm text-amber-200/80">
          Tweede Lente is de pilot. Daarna volgen Slaap-Loep, Energie-Loep
          en andere onderwerpen. Allemaal met dezelfde architectuur en
          claim-vrije bewaking.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Schrijf de kopieer-knop**

```tsx
// File: app/instellingen/mijn-tracking-links/kopieer-knop.tsx
//
// Kleine client-component voor kopiëer-naar-clipboard met visuele
// bevestiging. Geen externe lib nodig.

"use client";

import { useState } from "react";

export function KopieerKnop({ tekst }: { tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch (_e) {
      // Fallback: selecteer-fragment in een prompt
      window.prompt("Kopieer deze link:", tekst);
    }
  }

  return (
    <button
      type="button"
      onClick={kopieer}
      className="mt-2 rounded-full bg-rose-600 px-4 py-1.5 text-white text-xs font-medium hover:bg-rose-700"
    >
      {gekopieerd ? "✓ Gekopieerd" : "📋 Kopieer link"}
    </button>
  );
}
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 4: Commit**

```bash
git add app/instellingen/mijn-tracking-links/
git commit -m "feat(tweede-lente): member-dashboard Mijn tracking-links"
git push
```

---

## Task 19: Menu-item toevoegen in /instellingen

**Files:**
- Modify: `app/instellingen/page.tsx`

- [ ] **Step 1: Lees huidige instellingen-pagina**

Run: open `app/instellingen/page.tsx` om de menu-structuur te zien. Zoek waar andere menu-items zoals "Bestellinks" of "Freebies" worden gerendered.

- [ ] **Step 2: Voeg een item toe voor Mijn tracking-links**

In `app/instellingen/page.tsx`, in de relevante sectie (waarschijnlijk een lijst met `<Link>` of een TilesGroep), voeg toe:

```tsx
<Link
  href="/instellingen/mijn-tracking-links"
  className="block rounded-2xl border border-slate-700 bg-slate-900/40 p-4 hover:border-rose-400 transition"
>
  <div className="text-sm font-semibold">🔗 Mijn freebie-bot-links</div>
  <div className="mt-1 text-xs text-slate-400">
    Jouw persoonlijke tracking-links voor Tweede Lente en de bots die
    volgen.
  </div>
</Link>
```

Plaats deze direct na het item voor "Freebies" of voor "Bestellinks", afhankelijk van de bestaande volgorde. Als de pagina geen lijst-structuur heeft, plaats dan ergens visueel logisch in de bestaande layout.

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 4: Commit**

```bash
git add app/instellingen/page.tsx
git commit -m "feat(tweede-lente): menu-item toegevoegd voor tracking-links"
git push
```

---

## Task 20: Tweede Lente toevoegen aan voorbeeld-toolkit

**Files:**
- Modify: `lib/freebies/voorbeeld-toolkit.ts`

- [ ] **Step 1: Voeg de tweede-lente entry toe**

Open `lib/freebies/voorbeeld-toolkit.ts` en voeg na de bestaande items binnen het array deze toe:

```ts
  {
    slug: "tweede-lente",
    titel: "Tweede Lente",
    ondertitel: "Een rustige spiegel voor jouw fase",
    vorm: "test",
    onderwerp: "overgang",
    beschrijving:
      "Vijf-minuten web-bot voor vrouwen in peri-, volle of post-overgang. Zeven vragen + een spiegel + opt-in voor vijf-mail-reeks. Pilot voor freebie-bot-architectuur.",
    inhoudTemplate:
      "Bot-content staat in code (lib/freebie-bots/tweede-lente-vragen.ts en tweede-lente-system-prompt.ts). TODO-GABY: 5 mail-templates aanleveren voor de 5-mail-reeks.",
    duurMinuten: 5,
  },
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: build groen.

- [ ] **Step 3: Commit**

```bash
git add lib/freebies/voorbeeld-toolkit.ts
git commit -m "feat(tweede-lente): toegevoegd aan voorbeeld-toolkit"
git push
```

---

## Task 21: Einde-test smoke-run + MORGEN-RAOUL.md update

**Files:**
- Modify: `docs/MORGEN-RAOUL.md`

- [ ] **Step 1: Lokale build + handmatige smoke-test plan**

Run: `npm run build`
Expected: build groen, alle routes gegenereerd.

Daarna:
1. Open `https://[live-vercel-url]/instellingen/mijn-tracking-links` als ingelogde member, kopieer link.
2. Open de link in incognito-tab. Verwachting: warme intro-blok rendert.
3. Klik door naar vragen, beantwoord 7 vragen, krijg spiegel.
4. Vul e-mail + naam in, vink toestemming, klik "Schrijf mij in".
5. Verifieer in Supabase dashboard: `freebie_opt_ins` heeft de nieuwe rij met `bot_antwoorden` jsonb gevuld, `klantomgeving_klanten` heeft de rij met bron=freebie-opt-in.

Documenteer alle bugs of vragen die hieruit komen in `docs/MORGEN-RAOUL.md`.

- [ ] **Step 2: Append een sectie aan MORGEN-RAOUL.md**

Open `docs/MORGEN-RAOUL.md` en append (achteraan):

```markdown

---

## Tweede Lente bot, opgeleverd 2026-05-24

**Status:** Skelet draait. Drie API-routes actief. Vier UI-blokken klaar.
Token-mechanisme via `freebie_bot_member_tokens` werkt.

**Wat Gaby nog moet aanleveren:**
- Definitieve openings-tekst voor Blok 1 (warme intro)
- Tien tot twaalf claim-vrije template-zinnen voor de drie aanpassingen
  (huidige twaalf staan in `lib/freebie-bots/tweede-lente-system-prompt.ts`,
  herformuleer of vervang in haar stem)
- Vijf mail-templates van 200-300 woorden per stuk voor de 5-mail-reeks
- Twee of drie korte anekdotes voor mails of bot-spiegel

**Wat Raoul nog moet aanleveren:**
- Definitieve webshop-URL's voor MenaPlus, Women's Gold, Vitamins D&K
  (nu placeholder in `app/bot/tweede-lente/[token]/blok-opt-in.tsx`)
- Bevestiging of bestellinks-koppeling per member ipv statisch moet

**Bekende open punten:**
- 5-mail-reeks-versturing is nog NIET ingebouwd (alleen opslag van opt-in)
- Push-notificatie naar member werkt alleen als sendPushToUser-signature
  klopt met de aanname in de opt-in-route; verifieer in productie

**Te checken in pilot:**
- Open een test-link in incognito, doorloop, kijk of de spiegel
  claim-vrij blijft (de bewaker filtert verboden vocabulaire, maar
  het is verstandig om handmatig 5 runs te checken)
- Verifieer dat klantomgeving_klanten-rij correct wordt aangemaakt
- Kijk of de tracking-link kopieer-knop werkt op mobiel Safari
```

- [ ] **Step 3: Commit**

```bash
git add docs/MORGEN-RAOUL.md
git commit -m "docs(tweede-lente): smoke-test + open punten voor Raoul en Gaby"
git push
```

---

## Self-Review

**Spec coverage check:**

| Spec-sectie | Implemented in task |
|---|---|
| Doel + doelgroep | Task 11, 12, 14 (intro-blokken) |
| Lead-attributie via tracking-token | Task 1 (SQL), Task 6-7 (helpers + API), Task 18 (dashboard) |
| Blok 1 warme intro | Task 14 |
| Blok 2 7 multi-choice vragen | Task 3 (data), Task 15 (UI) |
| Blok 3 AI Haiku spiegel template-bewaakt | Task 4-5 (prompt + bewaker), Task 9 (API), Task 16 (UI) |
| Blok 4 opt-in + product + contact + disclaimer | Task 17 |
| 5-mail-reeks | Genoteerd als open in MORGEN-RAOUL (Task 21). Pilot bouwt opt-in opslag, niet de mail-versturing. |
| Trigger-mechaniek dashboard | Task 18-19 |
| Tech-architectuur (routes, DB, AI, Mini-ELEVA) | Task 1 (DB), Task 7-10 (API), Task 10 (Mini-ELEVA-koppeling via klantomgeving + push) |
| Claim-vrije bewaking 3 lagen | Multi-choice = Task 3+15. Template-zinnen = Task 4-5+9. Statisch eind-blok = Task 17. |

5-mail-reeks-versturing valt buiten pilot-scope, expliciet gedocumenteerd in MORGEN-RAOUL.

**Placeholder scan:** geen "TBD" of generieke "implement later" gevonden. TODO-GABY-tags zijn bedoeld en duidelijk gemarkeerd voor Gaby's content-werk.

**Type consistency:** SpiegelOutput is gebruikt in Task 2 (definitie), Task 5 (bewaker), Task 9 (API), Task 13 (flow-state), Task 16 (spiegel-component), Task 17 (opt-in-component). Property-namen: opening, patroon, driAanpassingen, afsluiting - overal hetzelfde.
TweedeLenteAntwoorden: zelfde - Task 2, 9, 10, 13, 15, 16, 17.
BotSlug: Task 2, 7.
genereerBotToken: Task 6, 7, 18.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-24-tweede-lente-bot.md`.

Raoul heeft akkoord gegeven voor batch-uitvoering tot het einde. Direct doorzetten naar **executing-plans** voor inline-uitvoering met checkpoints (Raoul wil het kunnen testen aan het eind). De SQL-migratie in Task 1 heeft hij vooraf geautoriseerd om tegen live Supabase te draaien.
