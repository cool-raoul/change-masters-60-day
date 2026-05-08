# Mini-ELEVA, Concept + Design Memo

| | |
|---|---|
| **Datum** | 6 mei 2026 |
| **Fase** | Brainstorm afgerond, ontwerp-concept vastgelegd |
| **Roadmap-positie** | Fase 6 (na Sprint/Core/Pro) |
| **Auteur-overleg** | Raoul (founder) + Claude Opus 4.7 |
| **Status** | Concept, nog niet gebouwd, nog niet geïmplementeerd |

---

## 1. Waarom dit memo bestaat

We hebben op 6 mei 2026 een uitgebreide brainstorm gevoerd over hoe Mini-ELEVA eruit moet zien. Mini-ELEVA is gepland voor Fase 6 in de roadmap, dus nog enkele weken weg. Deze memo legt vast wat we besloten zodat we straks niet opnieuw hoeven te bedenken. Wat er hieronder staat is **akkoord van Raoul tijdens de brainstorm**, tenzij expliciet anders genoteerd in "Open vragen".

---

## 2. Probleemstelling

Het klassieke 3-weg-gesprek heeft drie functies tegelijk:

| Functie | Wie kan dit doen? |
|---|---|
| **1. Coaching van de member** | ELEVA-mentor (AI) neemt dit grotendeels over |
| **2. Derden-validatie voor de prospect** | Mens nodig (live, video, ambassadeur, of via systeem) |
| **3. Closing van de prospect** | Mens nodig (sponsor-vaardigheid) |

Traditionele uitvoering (WhatsApp-groep + sponsor-call per prospect):
- Duur in tijd voor sponsors
- Versnipperd voor members (10 WhatsApp-groepen tegelijk)
- Geen training-on-the-job-effect want sponsor doet alles
- Werkt niet schaalbaar

Resultaat: **member en sponsor verzanden in 1-op-1-werk**, eerste-succesjes duren te lang, sponsors raken uitgeput.

---

## 3. De oplossing: Mini-ELEVA als 3-weg-omgeving

In plaats van WhatsApp-groep + sponsor-call krijgt de prospect **72 uur eigen mini-versie van ELEVA**. Daarbinnen:
- AI-mentor 24/7 (specifiek getraind voor prospects, niet voor members)
- 3-persoons-chat met tekst én spraak (member + sponsor + prospect)
- Filmpjes, succesverhalen, productinfo, business-info
- DTT-flow (Doel-Tijd-Termijn) als voorbereiding op closing
- Eindstap: prospect drukt "ik wil starten" → close-call met sponsor

**Belangrijk:** dit vervangt het klassieke 3-weg-gesprek voor business-prospects. Voor product-prospects nog te brainstormen (zie Open vragen).

---

## 4. Architectuur op hoofdlijnen

### 4.1 Sub-app binnen ELEVA
- Eigen route-prefix: `/m/[invitation-token]` (mini)
- Eigen layout (geen sidebar van member-app, eigen prospect-vriendelijke navigatie)
- Eigen tab-structuur: Welkom · Verhalen · Producten · Mentor · Chat

### 4.2 Authenticatie zonder account
- Member klikt "stuur mini-ELEVA-uitnodiging" op prospect-pagina
- Systeem genereert unieke `invitation_token` met expiratie 72u
- Member ontvangt deelbare link, stuurt door (WhatsApp/SMS/email)
- Prospect klikt link → magic-auth via token → in de mini-ELEVA
- Geen wachtwoord, geen account-aanmaak, lage drempel

### 4.3 Database-uitbreiding (concept)

```sql
CREATE TABLE prospect_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id),
  member_user_id UUID REFERENCES profiles(id),
  sponsor_user_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  laatste_activiteit_op TIMESTAMPTZ,
  status TEXT CHECK (status IN ('actief', 'verlopen', 'ja_starter', 'nee_dichtgeklapt'))
);

CREATE TABLE mini_eleva_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES prospect_invitations(id),
  rol TEXT CHECK (rol IN ('member', 'sponsor', 'prospect', 'ai_mentor')),
  type TEXT CHECK (type IN ('tekst', 'spraak')),
  content TEXT,  -- tekst of audio-URL
  duur_seconden INT,  -- alleen bij spraak
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mini_eleva_activiteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES prospect_invitations(id),
  module TEXT,  -- bv. 'welkom_member', 'verhalen', 'mentor_chat'
  detail TEXT,  -- bv. 'video bekeken', 'verhaal x geopend'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.4 Twee verschillende AI-mentor-personages
| | Member-mentor (bestaat) | Prospect-mentor (nieuw) |
|---|---|---|
| Doelgroep | Member zelf | Externe prospect |
| Toon | "Hier is een DM die je kunt sturen" | "Hier is wat ik weet over Lifeplus" |
| Regels | Member-regels (3-weg-flow uitleg, [STUUR]-tags, etc.) | Prospect-regels (geen pitch, geen druk) |
| Kennis | Lifeplus + Worre/Brookes basis | Zelfde basis, andere stem |

Implementatie: aparte system-prompt-builder. Zelfde kennisbank-fundament. Eigen API-route `/api/mini-eleva/mentor`.

---

## 5. De 8 modules in de mini-ELEVA

| # | Module | Inhoud | Bron |
|---|---|---|---|
| 1 | Welkom-video member | 30-60 sec persoonlijk opgenomen door uitnodigende member, per prospect uniek | Member upload via prospect-pagina |
| 2 | Welkom-video sponsor | 1-2 min, eenmalig opgenomen door sponsor, herbruikbaar over alle prospects | Sponsor upload eenmalig |
| 3 | ELEVA-in-3-minuten | Founder-bewerkbare uitleg-video over wat ELEVA voor prospects doet | Founder upload |
| 4 | Succesverhalen-bibliotheek | Filmpjes/quotes van members, gefilterd op interesse-thema (afvallen, energie, business) | Founder + members uploaden |
| 5 | Doel-Tijd-Termijn flow | Interactieve mini-quiz: doel + tijd + termijn → realistisch plaatje, voorbereidt op closing | Bouw-werk |
| 6 | AI-mentor (prospect-versie) | 24/7 chatbar voor vragen, met scope-regels (zie sectie 6) | Bouw-werk |
| 7 | Product- en programma-info | Doorzoekbare catalogus van Lifeplus-producten en programma's, gekoppeld aan AI-mentor | Bouw-werk + content |
| 8 | 3-weg-chat met spraak | Tekst- en spraakberichten tussen member, sponsor en prospect, in één chatvenster | Bouw-werk |

---

## 6. Scope van de prospect-mentor (kleurensysteem)

**🟢 Mag uitgebreid antwoorden:**
- Wat zit er in product X (ingredients, hoeveelheden)
- Algemene gezondheid + leefstijl-vragen (slaap, beweging, voeding)
- Hoe werkt ELEVA / hoe werkt het verdienmodel (uitleg, structuur, percentages)
- Holistic Reset, Darmen in Balans en andere programma-pakketten
- Lifeplus filosofie en geschiedenis

**🟡 Mag, maar met disclaimer of in EU-veilige formuleringen:**
- Wat doet product X (ondersteunt, draagt bij aan, niet "geneest")
- Welk product past bij mijn klacht (met arts-disclaimer + geen dosering)
- Persoonlijke twijfel ("ik denk niet dat ik dit kan"), empathisch + doorvragen, niet drukkend
- Wat ga IK persoonlijk verdienen (uitleg met disclaimer "afhankelijk van inzet en netwerk", geen beloftes)

**🔴 Niet beantwoorden, doorverwijzen naar mens:**
- Medische vragen ("mag dit naast mijn schildkliermedicatie?") → arts + sponsor-overleg
- Specifieke ROI-beloftes ("ik beloof je €X in 6 maanden") → sponsor met persoonlijke kennis

**Gedrag bij rood:** "Daarvoor verwijs ik je echt naar [arts / sponsor]. Hier is hoe je dat snel kunt regelen."

---

## 7. Sponsor-betrokkenheid: mix B + C

Brainstorm-uitkomst: niet "sponsor zit standaard in de chat", niet "alleen op aanvraag", maar mix:

- **B (op signaal):** AI-mentor of het systeem ziet dat de prospect klaar is (DTT-flow doorlopen, herhaalde concrete vragen over starten, of expliciet "ik wil meer weten") → automatische suggestie aan member: "haal nu sponsor erbij?"
- **C (op aanvraag):** member of AI kan altijd met één tap sponsor toevoegen aan de 3-weg-chat. Sponsor krijgt notificatie "je bent toegevoegd aan een mini-ELEVA-chat van [member] met prospect [naam]".

Sponsor regie: kan invallen wanneer relevant, hoeft niet 24/7 alert te zijn. Wel SLA: reageer binnen 4-8 uur tijdens werkdagen.

---

## 8. 72-uur snelkookpan (Worre-momentum)

Reden: "iemand gaat echt niet 14 dagen lang die mini-ELEVA aan de slag" (Raoul). Anders praat de prospect met andere mensen, dingen gebeuren onderweg, momentum gaat verloren.

| Tijd | Wat gebeurt |
|---|---|
| Uur 0 | Member stuurt link, prospect opent mini-ELEVA |
| Uur 0-12 | Welkom-video's bekijken, AI-mentor verkennen, eerste vragen stellen |
| Uur 12-48 | Verhalen, producten, business-content verkennen op eigen tempo |
| Uur 48-60 | DTT-flow doorlopen, AI suggereert sponsor er bij te halen |
| Uur 60-72 | Sponsor in chat, eventueel close-call ingepland, beslissingsmoment |
| Uur 72 | Mini-ELEVA verloopt. Status wordt: ja_starter / nee_dichtgeklapt / verloop_zonder_actie |

Bij 72-uur-verloop:
- Prospect ziet vriendelijk slot-bericht: "je toegang is voorbij. Wil je nog spreken? Vraag [member] om je opnieuw uit te nodigen."
- Member ziet status in zijn dashboard: "deze prospect is verlopen zonder actie" + 1-tap-knop "stuur opnieuw uit?"

---

## 9. Cross-cutting elementen die hier raken

Deze items komen ook voor in andere fases (Core/Pro/Sprint), niet uniek aan mini-ELEVA, maar ze raken het wel:

### Lifeplus-events / webinars
Mini-ELEVA toont eerstvolgende relevante Lifeplus-event op het welkomscherm. Prospect kan met 1 tap direct uitgenodigd worden voor de Zoom-meeting. Bezoek aan event vergroot belief en helpt de close.

### ELEVA-trainingen + Q&A
Niet direct in mini-ELEVA, wel in member-app. Member-Q&A-antwoorden voeden ook de prospect-mentor (zie 9.3).

### Mentor-zelflerend
Dit is een grote: elke top-leader-Q&A-antwoord wordt automatisch toegevoegd aan **beide** mentor-kennisbanken (member + prospect). Mentor wordt elke maand sterker. Implementatie: bestaande `coach_voorbeelden` tabel uitbreiden met `bestemming TEXT` (member / prospect / beide).

---

## 10. Implementatie in fases (concept)

Niet één grote release, maar drie sub-fases:

### Fase 6a: Mini-ELEVA fundament (1-2 weken werk)
- Database-uitbreiding (invitations + activiteit + chats tabellen)
- Magic-auth via invitation-token
- Lege mini-ELEVA-shell (route, layout, navigatie)
- Module 1 (welkom-video member upload)
- Module 2 (welkom-video sponsor upload)

**Resultaat:** member kan testprospect uitnodigen, prospect komt in lege mini-ELEVA met alleen welkomstvideo's.

### Fase 6b: Mini-ELEVA chat + AI-mentor (1-2 weken werk)
- 3-persoons-chat met tekst en spraak
- Sponsor-betrokkenheid B+C mix
- Prospect-AI-mentor met scope-regels (8 categorieën)
- Notificaties naar member en sponsor

**Resultaat:** echte 3-weg-communicatie binnen mini-ELEVA. Mentor beantwoordt prospect-vragen.

### Fase 6c: Mini-ELEVA content-modules (1-2 weken werk)
- Module 3 (ELEVA-in-3-minuten)
- Module 4 (succesverhalen-bibliotheek)
- Module 5 (DTT-flow)
- Module 7 (productcatalogus)
- Inschrijf-flow voor prospects die "ja" zeggen

**Resultaat:** complete mini-ELEVA, klaar voor echte prospects.

---

## 11. Open vragen (voor later, voor we Fase 6 starten)

1. **Mini-ELEVA voor product-prospects:** business-flow is helder, product-flow nog te brainstormen. Heeft een product-prospect dezelfde modules nodig, of een afgeslankte versie? Wel/geen DTT-flow? Wel/geen business-info?
2. **Privacy in chat:** ziet member alle chat tussen sponsor en prospect? Voorstel: ja, transparant. Maar bevestigen.
3. **Verlengbaar?** Kan member de 72u verlengen als prospect nog actief is maar tijd nodig heeft? Voorstel: ja, met 1 tap, +72u.
4. **Mobile-first:** prospects gebruiken vermoedelijk mobiel. Dedicated mobiele weergave nodig of werkt responsive?
5. **Push-notificaties:** voor prospect bij nieuwe berichten, of alleen email?
6. **Prospect-uitnodigingen kettingen:** kan een prospect zelf weer mensen uitnodigen voor mini-ELEVA? Voorstel: nee (viral risico, drukte voor members).
7. **Inschrijf-flow na "ja":** wat gebeurt er precies als prospect op "ik wil starten" drukt? Direct naar Lifeplus webshop? Of naar een ELEVA-onboarding-flow eerst?
8. **Sponsor-dashboard:** sponsor heeft vermoedelijk meerdere mini-ELEVA's tegelijk lopen. Hij heeft een dashboard nodig "al mijn open prospects". Hoe ziet dat eruit?
9. **Kosten:** prospect-mentor draait op AI (gpt-4o-mini of -4o). Dat is een operationele kost per prospect. Hoe begroten? Hoe opnemen in business-model? (Kostenmodel-discussie staat al op de roadmap.)
10. **Data-eigenaarschap na "nee":** als prospect "nee" zegt of niet reageert, wat blijft er bewaard? Wat wordt gewist?

---

## 12. Niet in scope (expliciet)

Voor mini-ELEVA Fase 6 doen we **niet**:

- Voice clones van sponsor (te creepy, niet "mens-eerst" filosofie)
- Live-cijfers/data uit ELEVA-netwerk (Wild 3 uit brainstorm, kan in versie 2)
- ELEVA-ambassadeurspool (Wild 4 uit brainstorm, kan in versie 2)
- Maandelijkse ELEVA-cirkel (Wild 5 uit brainstorm, hoort meer bij Lifeplus-events)
- Prospect-mentor met telefonische stem (Wild 2 uit brainstorm, complex en duur, voor later)

---

## 13. Brainstorm-context (voor het geheugen)

Belangrijkste keuzes die we vandaag hebben gemaakt:

- **Niet "verlengde 3-weg via WhatsApp"**, wel "eigen mini-ELEVA-omgeving"
- **72 uur** in plaats van 14 dagen (Worre-momentum)
- **Twee AI-mentor-personages** (member-mentor blijft, prospect-mentor erbij)
- **Sponsor B+C mix** (op signaal + op aanvraag)
- **Spraak in chat** (warm, persoonlijk, past bij Wispr-werkstijl van Raoul)
- **Drie functies van 3-weg gescheiden**: AI doet coaching, mini-ELEVA doet validatie, sponsor doet closing
- **Mentor-zelflerend** via Q&A-antwoorden (cross-cutting feature, raakt ook member-mentor)

Wat we **niet** kozen:
- Wild 2 (prospect kan AI bellen)
- Wild 3 (live-cijfers)
- Wild 4 (ambassadeurspool)
- Wild 5 (maandelijkse ELEVA-cirkel)

Geen van die ideeën is "fout", ze passen alleen niet voor versie 1.

---

## 14. Volgende actie wanneer Fase 6 aan de beurt is

1. Lees deze memo opnieuw met Raoul
2. Beantwoord de 10 open vragen (sectie 11)
3. Schrijf een uitgewerkt implementation-plan via `superpowers:writing-plans` skill
4. Bouw Fase 6a, 6b, 6c stap voor stap met checkpoints
5. Test met 1 echte prospect voor brede uitrol

**Tot die tijd:** geen code voor mini-ELEVA. Eerst Sprint/Core/Pro afmaken.

---

*Einde memo. Bij vragen of nieuwe inzichten over mini-ELEVA: voeg toe aan dit document, datum erbij.*
