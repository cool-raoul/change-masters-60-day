# Core-redesign, design

**Datum:** 2026-05-16
**Status:** ontwerp goedgekeurd door Raoul tijdens brainstorm 16 mei, klaar voor implementatie-plan
**Spec-versie:** v1

---

## 1. Achtergrond

Core is een van ELEVA's drie modi (Sprint / Core / Pro). De huidige Core leeft in `lib/leerpaden/core-stappen.ts` als een 21-stappen-leerpad voor mensen die "in eigen tempo" een webshop willen opbouwen. De inhoud is goed (WHY, lijst, webshop-admin, productkennis, Brookes social-formule, freebies, FFF, duplicatie, 5 types prospects, closing), maar er zijn drie tekorten die de pilot blootlegt:

1. **Eric Worre's "first win" zit niet ingebakken.** De huidige Core laat een member tot dag 6 wachten voor het eerste echte prospect-contact ("deel je webshop met 2 mensen"). De eerste UITNODIG-actie valt pas dag 12. Dat is te laat voor momentum-opbouw.
2. **Pre-post versus 21-dagen-post-vertakking ontbreekt.** De Be-The-Change-kennisbank vraagt op dag 1: "heb je al een eigen product-ervaring?" Geen → pre-post. Ja → 21-dagen-post. Die vertakking bepaalt het content-traject voor dag 7-11 en is nu volledig afwezig.
3. **Geen dagelijkse DMO + pijplijn-aansluiting.** De 21 stappen zijn LEER-stappen. Een member doet z'n leer-stap en weet niet wat z'n DAGELIJKSE ritme is. Sprint heeft elke dag een ABCDE-blok (namen + berichten + uitnodigingen + follow-ups + stories). Core heeft niets vergelijkbaars.

Plus: huidige Core werkt in een apart type-systeem (`LeerpadStap`) dat veel armer is dan Sprint's `Dag`/`ControllableTaak`. Geen inline-embeds, geen `waaromWerktDit`, geen `filmSlug`, geen `uitnodigHelpKnoppen`. Dat sluit Core uit van Sprint's rijkdom (radar, partner-check, sponsor-melding-knoppen).

**Bouwvolgorde**: Sprint is klaar (pilot loopt). Core is nu aan de beurt, daarna Pro (lichtere variant voor professionals).

## 2. Doel

Een Core-traject dat:

- **De goede inhoud van de 21 stappen behoudt**, herordend om Eric Worre's first-win-principe te respecteren
- **Pre-post / 21-post-vertakking** introduceert op dag 1
- **Een DMO-blok per dag** toevoegt zodat een member elke dag concrete dagelijkse acties heeft
- **Pijplijn-aansluiting** garandeert (elke dag iets dat naar `/namenlijst` raakt)
- **DTT-onboarding met dynamisch tempo-advies** introduceert (5 brackets)
- **Cross-modus overlap-detectie** invoert (wat in Sprint of Pro al gedaan is wordt niet dubbel gevraagd)
- **Een lifetime DMO-fase** opent na dag 40 (Core is oneindig, niet eindigend zoals Sprint)
- **Sprint's rijke type-systeem en `/vandaag`-route hergebruikt** (geen aparte routes meer)

## 3. Architectuur

### 3.1 Type-systeem unificatie

Core migreert van `lib/leerpaden/types.ts` naar `lib/playbook/types.ts`. Concreet:

- Nieuwe file `lib/playbook/core-dagen.ts` met dezelfde `Dag[]`-structuur als `lib/playbook/dagen.ts` (Sprint)
- `Dag.fase` kan 1 (skill-opstart, dag 1-21), 2 (verankering, dag 22-40), of 3 (lifetime DMO, dag 41+) zijn
- Alle Sprint-features beschikbaar: `inlineEmbed`, `filmSlug`, `uitnodigHelpKnoppen`, `inlineActie`, `waaromWerktDit`, `dagDoel`
- Oude `LeerpadStap` blijft staan voor Pro tot Pro ook is gemigreerd, daarna deprecated

### 3.2 Route-unificatie

`/vandaag` wordt de universele route voor alle drie modi. De page detecteert `profiles.modus`:
- `sprint` → laadt dag uit `lib/playbook/dagen.ts`
- `core` → laadt dag uit `lib/playbook/core-dagen.ts`
- `pro` → laadt dag uit `lib/playbook/pro-dagen.ts` (later)

Dashboard idem: één `/dashboard` met modus-afhankelijke tegels.

Oude routes `/welkom-core`, `/welkom-core/stap/[nummer]`, `/welkom-pro`, `/welkom-pro/stap/[nummer]` worden gerouteerd via een redirect naar `/vandaag` en uiteindelijk verwijderd.

### 3.3 File-structuur

```
lib/playbook/
  types.ts                 ← bestaande, ongewijzigd
  dagen.ts                 ← bestaande Sprint, ongewijzigd
  core-dagen.ts            ← NIEUW: 40 dagen + lifetime-template
  weekritme.ts             ← bestaande, mogelijk uitbreiden met Core lifetime DMO
  tempo-aware.ts           ← bestaande Sprint, ongewijzigd
  core-tempo-aware.ts      ← NIEUW: tempo-aware versies voor Core dag 1-21
  bereken-dag.ts           ← bestaande, mogelijk uitbreiden voor Core

lib/onboarding/
  voltooiingen.ts          ← NIEUW: cross-modus completion-tracking helper

lib/dtt/
  brackets.ts              ← NIEUW: 5 tempo-brackets + aantallen-tabel
  advies.ts                ← NIEUW: DTT → bracket → dagelijks advies

lib/playbook/
  prepost-keuze.ts         ← NIEUW: vertakking helper voor dag 1 + 7-11
```

## 4. Tijdsstructuur

### 4.1 Drie fasen

| Fase | Dag-range | Karakter |
|---|---|---|
| **1. Skill-opstart** | 1-21 | Leer-stap per dag + DMO-blok ernaast |
| **2. Verankering** | 22-40 | Alleen DMO-blok, geen nieuwe content. Member oefent wat geleerd is. |
| **3. Lifetime DMO** | 41+ oneindig | Zelfde DMO-blok dagelijks. Geen graduation-einde. |

Voortgang-gebaseerd: elke dag dat de member `/vandaag` opent, ziet 'ie "vandaag = dag X" waar X de eerste niet-voltooide dag is. Als 'ie 3 dagen wegblijft, staat 'ie nog op dag X.

### 4.2 Mijlpalen

- **Dag 1**: 24u-fundament (WHY + DTT + sponsor-bericht + 1 eerste contact)
- **Dag 7**: Week 1 klaar, sponsor-call
- **Dag 21**: Skills verankerd, sponsor-call
- **Dag 40**: Graduation opstart-fase, overgang naar lifetime, optionele Pro-upgrade-prompt

### 4.3 Versnellen

Tempo is altijd aanpasbaar via `/instellingen`. Door DTT-tijd te verhogen schuift member naar een hoger advies-bracket. Aantallen per dag in de DMO-blok schuiven mee, content blijft hetzelfde. Geen "dubbel-dag-doen"-mechanisme.

## 5. DTT-onboarding + tempo-brackets

### 5.1 De DTT-vragen (dag 1)

Drie vragen inline op `/vandaag` op dag 1:

1. **Doel**: hoeveel extra inkomen per maand wil je realistisch in 12 maanden? (open antwoord, vrije tekst)
2. **Tijd**: hoeveel uur per week kun je realistisch investeren, naast wat je nu doet? (numeriek)
3. **Termijn**: in hoeveel maanden moet dit er staan zodat het voor jou de moeite waard is? (numeriek)

Opgeslagen in nieuwe kolom `profiles.core_dtt` als JSONB met `{ doel_per_maand, uren_per_week, termijn_maanden }`.

### 5.2 De 5 brackets

Alle aantallen zijn **minimum-richtlijnen**. Member mag altijd meer doen, nooit minder zonder herziening van z'n DTT. Geen tijdsprognoses (zoals "klanten in 30 dagen"), wel werkomvang-categorieën en duidelijke verwachtingen.

| Bracket | Tijd/week | Realistische verwachting | Minimum daily DMO-richtlijn |
|---|---|---|---|
| **Minimaal** | <3u | "Je producten terugverdienen. Inkomsten ongeveer gelijk aan je eigen maandelijkse bestellingen, dus je product wordt voor jou gratis." | Top-20 lijst opbouwen + telefoonlijst invoeren in eigen tempo + 1-2 contacten/week |
| **Rustig** | 3-6u | "Eerste klanten in je eigen netwerk opbouwen, kleine commissies bovenop je eigen bestellingen." | Min 2 contacten/dag, min 2 social-posts/week, freebies meelopen met die posts als intekenplek |
| **Gestaag** | 6-10u | "Eerste members aanbrengen. Builder-rank wordt realistisch." | Min 3 contacten/dag, min 2-3 social-posts/week, freebies meelopen |
| **Serieus** | 10-16u | "Builder-rank opbouwen en eerste duplicatie starten (een andere Builder helpen worden)." | Min 5 contacten/dag, dagelijks social, wekelijks freebie-campagne |
| **Doorpakken** | 16+u | "Meerdere Builders helpen worden, schaalbaar gelaagd inkomen op gang." | Min 7 contacten/dag, dagelijks meerdere social-acties, structureel freebies-flow |

### 5.3 Builder-rank als kern-doel

Voor Core is het bereiken van **Builder-rank** de hoofd-mijlpaal die member bewust naartoe werkt. Reden: Builder = het bouwblok van duplicatie. Op het moment dat je Builder bent kun je een ander persoon helpen óók Builder te worden via hetzelfde systeem. Die anderen helpen dan weer anderen. Dat is hoe een gelaagd schaalbaar inkomen ontstaat (zoals beschreven in de Pro-uitnodiging-onepager).

**UI-effect**: vanaf dag 1 toont Core een rustige progress-balk: *"Op weg naar Builder"*. Vanaf bracket Gestaag (6u+) is dit een actief doel. Bij Minimaal/Rustig wordt 'm getoond maar zonder druk, als zicht op de volgende fase.

**Voor wie is Builder realistisch?**
- **Minimaal/Rustig**: Builder is geen primair doel, wel zichtbaar. Member focust op klanten.
- **Gestaag** (6u+): Builder wordt expliciet een werkbaar doel, mensen worden vanaf dag 16+ (Builder-energie herkennen) actief aangemoedigd richting eigen Builder + eerste duplicaten.
- **Serieus/Doorpakken**: Builder is hét doel. Het systeem stuwt richting Builder + meerdere duplicaten.

### 5.4 Het compensation plan in één oogopslag (Eric Worre's basic-understanding-principe)

Eric Worre's regel voor nieuwe distributors: ze moeten meteen in opstart een **basic understanding** krijgen van het compensation plan, zodat ze weten wat ze moeten doen om hun doel te bereiken. Anders werken ze blind.

**Rank-ladder met exacte rank-vereisten + minimum-vanaf-bedragen per maand:**

Officiële cijfers uit [kennisbank/verdienmodel-commissieplan.md](kennisbank/verdienmodel-commissieplan.md). Drie sleutel-cijfers per rank:
- **AV** (Activiteitsvolume) = eigen IP-bestelling per maand
- **QGV** (Gekwalificeerd Groepsvolume) = IP totaal in eerste 3 levels (jouw + alle daaronder)
- **QL** (Kwalificerende Benen) = members in verschillende lijnen onder jou

| Rank | AV (eigen IP) | QGV (totaal) | QL (members) | Vanaf €/maand |
|---|---:|---:|---:|---:|
| **Believer** | 40 | 500 | 3 | (start-rank, kleine bonus) |
| **Builder** | 40 | 1500 | 3 | (eerste echte bouwsteen) |
| **Bronze** | 100 | 3000 | 3 | €300-600 |
| **Silver** | 100 | 6000 | 6 | vanaf €600 |
| **Gold** | 150 | 9000 | 9 | vanaf €900 |
| **Diamond** | 150 | 15000 | 12 (12 verschillende lijnen) | vanaf €1200 |
| **1★/2★/3★ Diamond** | 150 | 15000-25000 | 12 (+Diamonds in benen) | hogere niveaus |

Alle €-bedragen zijn **minimum-vanaf**, geen plafond. Een Diamond kan ook €4000-5000+ verdienen afhankelijk van hoe diep de duplicatie loopt. Werkelijke inkomsten hangen af van:

- Of je alleen bouwt of met members die zelf weer members zoeken
- Hoeveel eigen webshop-klanten je hebt (Shopper-bestellingen leveren extra commissie)
- Hoe diep de duplicatie loopt onder jouw eerste-laag-members (Leadership-pool vanaf level 4)
- Of je zelf Star-Diamond status haalt (extra Star-Leadership-pool)

Daarom kan iemand op Bronze-rank met diep doorlopende duplicatie soms meer verdienen dan iemand op Gold-rank zonder duplicatie. Het is **geen vaste mapping, wel een richtlijn**.

**Compressie-mechanisme** (belangrijk te begrijpen): members hoeven niet per se in je eerste level te zitten. Als een member geen bestelling plaatst, schuift de member daaronder omhoog voor de QL-telling. Dit maakt het rank-systeem flexibeler dan het lijkt.

**Waar in Core leer je dit?**
- **Dag 1 (DTT)**: nadat member zijn doel-bedrag invult ziet 'ie direct in welke rank-range dat valt. Rustige melding, geen druk.
- **Dag 4 (bestellinks + productadvies-test)**: korte uitleg-blok over hoe commissies werken (eigen webshop + 1e laag + 2e laag + diepere lagen via rank-status). Link naar volledig commission-plan-document.
- **Dag 17 (Builder-energie herkennen)**: link naar deze ranks teruglees-mogelijkheid.

**Helper-functie:**
```typescript
// lib/dtt/rank-vanaf-doel.ts
export function rankVanafDoel(doelPerMaand: number): {
  rank: "builder" | "bronze" | "silver" | "gold" | "diamond";
  label: string;
  toelichting: string;
};
```

### 5.5 Eerlijk advies bij <3u

Bij invoer van <3u toont de UI een onderscheidend, niet-ontmoedigend bericht:

> "Met <3u/week kun je je producten terugverdienen: je inkomsten zullen ongeveer gelijk zijn aan wat je zelf maandelijks bestelt, zodat je product voor jou gratis wordt. Een netwerk opbouwen waarmee je een serieus inkomen genereert is in dit tempo niet realistisch. Overweeg of je 4-6u per week kunt vrijmaken voor 'rustig opbouwen'. Dat is een groot verschil."

Member kan toch <3u kiezen. Geen blokkade.

### 5.6 Tempo-aanpassen

`/instellingen` krijgt een **Tempo-sectie voor Core** (parallel aan Sprint's tempo-sectie). Member kan op elk moment z'n DTT bijwerken. Wijziging is direct van kracht op de aantal-richtlijnen die de DMO-blok toont.

## 6. Pre-post / 21-dagen-post-vertakking

### 6.1 De keuze op dag 1

Naast WHY en DTT krijgt member op dag 1 een derde stap:

> **"Heb je al een product van Lifeplus gebruikt en daar zelf iets van gemerkt?"** (ja / nog niet)

Resultaat opgeslagen in `profiles.core_eigen_resultaat` (boolean).

### 6.2 Twee tracks dag 7-11

**Geen eigen resultaat (PRE-POST-track):**
- Dag 7: Wat is een pre-post + voorbereiding eigen pre-post
- Dag 8: Schrijf en plaats je pre-post + reactie-script klaarzetten
- Dag 9: Bestel zelf een programma (start je eigen 21-dagen ervaring)
- Dag 10: Brookes 3-stappen-formule voor losse social-posts
- Dag 11: Freebies inzetten

**Eigen resultaat (21-DAGEN-POST-track):**
- Dag 7: Wat is een 21-dagen-post + voorbereiding
- Dag 8: Schrijf en plaats je 21-dagen-post + reactie-script klaarzetten
- Dag 9: Brookes 3-stappen-formule
- Dag 10: 3 verhalen (persoonlijk / product / business)
- Dag 11: Lifestyle + Stories-ritme + Reels + Freebies samengevat

Beide tracks landen op dag 12 (eerste klanten via warme markt).

### 6.3 Reactief social-contact activeert

Vanaf dag 7 (= de eerste post staat live) wordt het 3e DMO-onderdeel **reactief social-contact** zichtbaar in de DMO-blok. Tot dag 7 is dat onderdeel verborgen (er valt nog niet op te reageren).

## 7. DMO-blok per dag

Elke dag krijgt onder de leer-stappen een DMO-blok met 6 onderdelen, allemaal aantal-flexibel op basis van DTT-bracket. Member ziet ze als een vaste uitklap-zone (niet-afvinkbaar), niet als aparte stappen-volgorde. Het blok dient als reminder van het dagelijkse ritme.

| # | Onderdeel | Wat | Activeert |
|---|---|---|---|
| 1 | 🛒 **Webshop-actie** | Deelbaar winkelmandje sturen, freebie-link delen, productadvies-test versturen | Dag 4+ (na bestellinks) |
| 2 | 💬 **Actief contact** | Bericht aan warme markt of lauwe markt (opener) | Dag 1+ (Eric Worre first-win) |
| 3 | 💎 **Reactief social-contact** | Reageer op likes/comments, voer DM-gesprek, deel info | Dag 7+ (na eerste post) |
| 4 | 🔄 **Follow-up** | Bestaande prospect/klant volgen | Dag 12+ (na eerste klanten-stap) |
| 5 | 📱 **Social-post** | Lifestyle / waarde / testimonial-post | Dag 7+ |
| 6 | 🎯 **Pijplijn-update** | Spraak-functie: "gesprek gestart met X", "X heeft besteld" | Dag 1+ |

**Plus drie vaste afsluit-stappen aan einde van elke Core-dag** (zoals in Sprint, NIET in DMO-blok om dubbeling te voorkomen):

- 💬 **Sponsor-checkin** (`inlineEmbed: "sponsor-melding"`): 30 sec berichtje
- 🎯 **Momentum-acties** (`inlineEmbed: "momentum-radar"`): end-of-day-check
- 🤝 **Partner-check** (`inlineEmbed: "partner-check"`): voor wie team heeft

Deze drie stappen zijn afvinkbaar (zoals in Sprint), staan altijd onderaan, en verbergen zich automatisch als 't niet relevant is (partner-check zonder team blijft onzichtbaar).

### 7.1 Aantal-richtlijnen per onderdeel × bracket

Voorbeeld voor "Actief contact":

| Bracket | Dagelijks doel |
|---|---|
| Minimaal | 1/week |
| Rustig | 1-2/dag |
| Gestaag | 2-3/dag |
| Serieus | 4-5/dag |
| Doorpakken | 6+/dag |

Vergelijkbare tabellen voor de andere 6 onderdelen. Aantallen zijn richtlijnen, niet harde vinkjes, want Core is "eigen tempo".

### 7.2 Visualisatie

DMO-blok rendert als een uitklappaneel onder de leer-stap. Standaard ingeklapt met header "🎯 Je dagelijkse ritme (5 acties open)". Klik = uitklappen, member ziet de 7 onderdelen met aantal-richtlijnen.

Items zijn afvinkbaar voor wie 't graag wil tracken (geen verplicht-status, alleen voor de tevredenheid van het ritueel). Voor de hele dag-voltooid-status tellen alleen de leer-stappen mee.

## 8. Dag-content (wat blijft + wat verrijkt)

Mapping van bestaande 21 stappen naar nieuwe 21 dagen:

| Nieuwe dag | Bestaande stap | Verandering |
|---|---|---|
| 1 | Stap 1 (WHY) | + DTT-onboarding + pre-post-keuze + sponsor + **1 eerste contact** |
| 2 | Stap 2 (lijst, herzien naar **Top-20 namenlijst**) | + telefoonlijst-import (oneindig aantal prospects) + social-media-contacten toevoegen (zelfde patroon als Sprint) + DMO-blok. Ook bij Minimaal-bracket actief. |
| 3 | Stap 3 (webshop admin) | + DMO-blok |
| 4 | Stap 4 (bestellinks + test) | + DMO-blok, webshop-actie wordt zichtbaar in blok, **+ compensation-plan-uitleg-blok (rank-ladder Builder/Bronze/Silver/Gold/Diamond)** |
| 5 | Stap 5 (productkennis) | + DMO-blok |
| 6 | Stap 6 (natuurlijke webshop-intro) | + DMO-blok |
| 7 | **Vertakking: pre-post OF 21-post deel 1** | (zie sectie 6.2) |
| 8 | **Vertakking deel 2** | |
| 9 | **Vertakking deel 3** | |
| 10 | **Vertakking deel 4** | |
| 11 | **Vertakking deel 5** | |
| 12 | Stap 12 (eerste klanten) | + DMO-blok, follow-up wordt zichtbaar |
| 13 | Stap 13 (FFF) | Cross-modus: overgeslagen als Sprint dag 5 gedaan |
| 14 | Stap 14 (klantcontact/opvolging) | |
| 15 | Stap 15 (hercontact/herhaalbestelling) | |
| 16 | Stap 16 (testimonial-content) | |
| 17 | Stap 17 (Builder-energie herkennen) | |
| 18 | Stap 18 (duplicatie-scripts) | |
| 19 | Stap 19 (closing-vragen) | Cross-modus: overgeslagen als Sprint dag 17 gedaan |
| 20 | Stap 20 (5 types prospects) | Cross-modus: overgeslagen als Sprint dag 16 gedaan |
| 21 | Stap 21 (graduation) | Wijziging: dit is niet meer "einde van Core", wel "einde skill-opstart". Sponsor-call. |

### Dag 22-40 (verankering)

Geen nieuwe content. Member ziet elke dag:
- Korte titel: "🌱 Verankerings-dag X" (bv. "Dag 22, verankering 1 van 19")
- DMO-blok (alle 7 onderdelen actief)
- Soms een tip-bubbel: "Tip: probeer vandaag een testimonial-video" of "Tip: pak iemand uit je not-yet-lijst opnieuw op"
- Dag 30 en dag 40 zijn mijlpalen met sponsor-call

### Dag 41+ (lifetime DMO)

Member ziet dezelfde dagelijkse DMO-blok als dag 22-40, plus een rustige eindkop "🌿 Lifetime DMO, vandaag is dag X sinds je start". Geen einde. Mentor + sponsor + radar + partner-check blijven actief. Eventuele Pro-upgrade-prompt op willekeurige momenten.

## 9. Cross-modus overlap-detectie

### 9.1 Nieuwe tabel

```sql
CREATE TABLE onboarding_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_slug TEXT NOT NULL,
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  modus_waarin TEXT NOT NULL CHECK (modus_waarin IN ('sprint', 'core', 'pro')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, item_slug)
);

CREATE INDEX idx_onboarding_voltooiingen_user ON onboarding_voltooiingen (user_id);
```

RLS: alleen eigen rijen selecteren. Insert via SECURITY DEFINER server-functie.

### 9.2 Gedeelde items

| Item-slug | Sprint | Core | Pro |
|---|---|---|---|
| `why` | dag 1 | dag 1 | dag 1 |
| `dtt` | (commitment_uren) | dag 1 (uitgebreid) | dag 1 |
| `sponsor-koppeling` | dag 1 | dag 1 | dag 1 |
| `top-20-namenlijst` | dag 1 (5-namen-flow) | dag 2 | n.v.t. |
| `webshop-aangemaakt` | dag 3 | dag 3 | dag 1 |
| `kredietformulier` | dag 3 | dag 3 | dag 1 |
| `teams-admin` | dag 3 | dag 3 | dag 1 |
| `bestellinks-gekoppeld` | dag 4 | dag 4 | dag 2 |
| `productadvies-test-gedaan` | dag 4 | dag 4 | dag 2 |
| `fff-geleerd` | dag 5 | dag 13 | n.v.t. |
| `4-stappen-uitnodig-geleerd` | dag 4 | n.v.t. | n.v.t. |
| `5-types-geleerd` | dag 16 | dag 20 | n.v.t. |
| `closing-vragen-geleerd` | dag 17 | dag 19 | n.v.t. |

Niet alle Sprint-skills zitten in Core (Sprint is intensiever). Wel: WHY, sponsor, webshop-admin, bestellinks, FFF, 5-types, closing-vragen zijn gedeeld.

### 9.3 UI-effect

Op dag 1 in Core: bij elke skip-bare stap toont de UI een blauw kaartje:

> "✨ Je hebt je WHY al gemaakt tijdens Sprint op 2026-05-01. Wil je 'm aanpassen of behouden zoals 'ie is?"
>
> [Behouden] [Aanpassen]

Klik "Behouden" → de Core-stap wordt automatisch als voltooid gemarkeerd in de huidige modus. Klik "Aanpassen" → opent de bijbehorende route (bv. `/mijn-why`).

Op dag 13 in Core (FFF): zelfde patroon, want Sprint dag 5 leerde 'm al.

### 9.4 Helper-functie

```typescript
// lib/onboarding/voltooiingen.ts
export async function isReedsVoltooid(
  supabase: SupabaseClient,
  userId: string,
  itemSlug: string,
): Promise<{ voltooid: boolean; modus: string | null; datum: string | null }>;

export async function markeerVoltooid(
  supabase: SupabaseClient,
  userId: string,
  itemSlug: string,
  modusWaarin: "sprint" | "core" | "pro",
  metadata?: Record<string, unknown>,
): Promise<void>;
```

Member-pages roepen deze helpers aan om te bepalen of een stap-renderen of skip-aanbieden.

## 10. Migratie bestaande Core-members

Pilot fase 1 telt 2-4 Core-members maximaal. Voor deze pilot-context:

- Dag-voltooiingen onder oude `/welkom-core/stap/[nummer]`-route worden bewaard (niet migreert), maar de nieuwe `/vandaag` voor Core hanteert opnieuw "dag 1" voor bestaande Core-members vanaf de pilot-deploy
- We zetten een eenmalige migratie in: alle bestaande WHY's krijgen een `onboarding_voltooiingen`-rij met `modus_waarin = 'core'` en `voltooid_op = profile.created_at`. Hetzelfde voor webshop-aangemaakt (best-effort detectie via `profiles.webshop_url` of bestaand bestellinks-record)
- Tekstmelding op nieuwe Core-dag-1 voor bestaande members: "Welkom terug. We hebben Core opnieuw opgezet. Je WHY/webshop staan nog. Vanaf vandaag werkt Core met een dagelijks ritme + DMO-blok."

Geen groot data-migratie-project. Pilot-context dekt 't.

## 11. Out-of-scope (parkeerlijst)

- **Pro-redesign**, komt na Core. Pro krijgt dezelfde architectuur (`Dag`-type, `/vandaag`, DTT, DMO-blok, cross-modus). Inhoud is veel lichter (webshop + klanten + duplicatie naar professionals). Lengte opstart-fase: TBD bij Pro-brainstorm.
- **Nieuwe content voor verankerings-fase (dag 22-40)**, voor pilot: rustige tip-bubbels, geen volle stappen. Later kan dit uitgebreid worden met "verdiepings-modules" als blijkt dat members content willen.
- **Lifetime DMO content-uitbreidingen**, bv. seizoenscampagnes, productlanceringen. Niet voor v1.
- **Welkom-keuze-revisie**, bestaande `/welkom-keuze` blijft zoals 'ie is.
- **Dag-content claim-vrij door-checken**, zit op de [parkeerlijst-mei-2026](memory/parkeerlijst-mei-2026.md) onder "ChatGPT-isms" en "claim-vrij voor niet-productadvies".
- **Lifeplus-naam weghalen uit Core-content**, wordt meegenomen tijdens implementatie van elke dag-tekst, niet als aparte ronde.

## 12. Error handling

- **Member zonder modus**: redirect naar `/welkom-keuze` (bestaande gedrag)
- **Member met `modus=core` maar geen `core_dtt`**: dag 1 toont DTT-vragen voor de leer-stap. Geen toegang tot DMO-blok-richtlijnen tot DTT is ingevuld (fallback naar "Rustig"-bracket).
- **Cross-modus item-slug niet gevonden**: stap rendert normaal, geen skip-aangeboden. Geen fout.
- **Onboarding-voltooiingen-tabel niet bereikbaar**: helper retourneert `voltooid: false`. Member doet stap opnieuw. Niet fataal.

## 13. Testing

Geen test-framework in pilot. Verificatie:

- `npm run build` na elke task in het implementatie-plan
- Smoke-test op productie via Vercel-deploy:
  - Login als Raoul, switch profile-modus naar `core`
  - Open `/vandaag` → dag 1 toont WHY/DTT/pre-post-keuze/sponsor/eerste-contact
  - Vul DTT in → tempo-advies verschijnt
  - Klik "ik heb resultaat" → 21-post-track wordt geselecteerd (verifieer via dag 7-inhoud)
  - Markeer dag 1 voltooid → dag 2 toont lijst-stap + DMO-blok
  - Cross-modus: maak via SQL een `onboarding_voltooiingen`-rij voor `why` in modus `sprint`. Open Core-dag-1 → "WHY al gedaan in Sprint"-kaartje verschijnt.
  - DMO-blok: klik uitklap, controleer 7 onderdelen + aantal-richtlijn klopt voor jouw bracket
  - Tempo wijzigen: `/instellingen` → kies hogere bracket → DMO-richtlijnen wijzigen mee
  - Dag 21 → graduation-bericht naar dag 22 verankerings-fase
  - Dag 41 → lifetime DMO-modus aan

## 14. Implementatie-volgorde

Negen taken in dit plan, te bouwen in volgorde:

1. **DB-migratie**: `onboarding_voltooiingen` tabel + `profiles.core_dtt` JSONB + `profiles.core_eigen_resultaat` boolean
2. **Helpers**: `lib/onboarding/voltooiingen.ts` (read + write functions) + `lib/dtt/brackets.ts` + `lib/dtt/advies.ts`
3. **Core-content-bestand**: `lib/playbook/core-dagen.ts` met de 21 nieuwe dagen + dag 22-40 template + lifetime-template, gebaseerd op de bestaande inhoud uit `lib/leerpaden/core-stappen.ts` maar in Sprint's `Dag`-type
4. **DTT-onboarding-component**: inline-embed `dtt-onboarding` die op dag 1 inline vraagt + adviseert + opslaat
5. **Pre-post-keuze-component**: inline-embed `prepost-keuze` op dag 1 die `core_eigen_resultaat` zet
6. **DMO-blok-component**: `DMOBlok.tsx` met uitklap, 7 onderdelen, dynamische aantal-richtlijnen, conditional zichtbaarheid (reactief social vanaf dag 7)
7. **Cross-modus-overlap-detectie in render**: per dag-stap een check voor item-slug, render skip-kaartje bij voltooid
8. **`/vandaag`-page modus-aware maken**: detecteer `profiles.modus`, route naar correcte content-bron
9. **`/instellingen` Tempo-sectie voor Core**: DTT-wijziging-form + zichtbaar advies, parallel aan Sprint's tempo-sectie

Elke taak heeft eigen build-check. Smoke-test op productie aan eind.

## 15. Beslissingen vastgelegd tijdens brainstorm 16 mei

- **Behouden + verrijken**, niet vanaf nul opnieuw, Raoul, 16 mei
- **40 dagen opstart-fase** (21 skill + 19 verankering), Raoul, 16 mei
- **Core is lifetime**, eindigt niet op dag 40, Raoul, 16 mei
- **DTT met 5 brackets**, eerlijk advies bij <3u, Raoul, 16 mei
- **Tempo altijd aanpasbaar** op `/instellingen`, Raoul, 16 mei
- **Pre-post / 21-post-vertakking op dag 1**, Raoul, 16 mei (uit Be-The-Change-kennisbank)
- **Eric Worre first-win**: eerste contact al op dag 1, Raoul, 16 mei
- **Reactief social-contact als 3e DMO-onderdeel**, activeert vanaf dag 7, Raoul, 16 mei
- **Cross-modus overlap-detectie** via `onboarding_voltooiingen`-tabel, Raoul, 16 mei
- **Sprint's `Dag`-type hergebruiken**, `/vandaag` universele route, voorgesteld, akkoord Raoul
- **Pro is veel lichter dan Core**, eigen webshop + klanten + duplicatie, Raoul, 16 mei
- **Bracket-doelen zonder tijdsprognoses**: tijdsbeloften zoals "klanten in 30 dagen" / "Builder-rank in 3 maanden" weg, vervangen door werkomvang-categorieën en kwalitatieve verwachtingen, Raoul, 16 mei
- **Top-20 namenlijst** als Core-terminologie + telefoonlijst-import + social-media-contacten ook bij Minimaal-bracket, Raoul, 16 mei
- **Minimaal-bracket (<3u)**: producten terugverdienen (inkomsten ongeveer gelijk aan eigen bestellingen), niet "gratis producten", Raoul, 16 mei
- **Builder-rank als kern-doel** voor 6u+ brackets, want Builder = bouwsteen voor duplicatie, Raoul, 16 mei
- **Compensation-plan in opstart** (Eric Worre): rank-ladder Builder/Bronze/Silver/Gold/Diamond met minimum-vanaf-bedragen (€300-600 / €600+ / €900+ / €1200+) zichtbaar bij DTT-onboarding en dag 4, Raoul, 16 mei
- **Aantallen overal vanuit minimaal**: alle DMO-richtlijnen zijn minimum-vlakken, member mag altijd meer, Raoul, 16 mei

Geen open punten meer voor implementatie. Raoul: "behouden + verrijken, als de basis staat schiet ik feedback".
