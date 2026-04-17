# Lifeplus Commissieplan — Ons commissieplan

**Bron:** officiële Lifeplus commissieplan-afbeeldingen (gedeeld op 2026-04-17 door Raoul)
**Scope:** geldt wereldwijd, *met uitzondering van Italië*.
**Gebruik:** naast Folder 2 → STAP 4 (UITLEG VERDIENMODEL). STAP 4 geeft een vereenvoudigde weergave; dit bestand is de officiële structuur.

---

## Ranks (van laag → hoog)

| Rank | IP AV | QGV | QL | Extra vereisten |
|---|---:|---:|---:|---|
| **Believer** | 40 | 500 | 3 | — |
| **Builder** | 40 | 1.500 | 3 | — |
| **Bronze** | 100 | 3.000 | 3 | — |
| **Silver** | 100 | 6.000 | 6 | — |
| **Gold** | 150 | 9.000 | 9 | — |
| **Diamond** | 150 | 15.000 | 12 | — |
| **1★ Diamond** | 150 | 15.000 | 12 | 1 Diamond + 2 Bronze in verschillende benen |
| **2★ Diamond** | 150 | 20.000 | 12 | 2 Diamond + 1 Bronze in verschillende benen |
| **3★ Diamond** | 150 | 25.000 | 12 | 3 Diamond in verschillende benen |

**Legenda:**
- **IP** — International Points (punten per product)
- **AV** — Activiteitsvolume (eigen volume)
- **QGV** — Gekwalificeerd Groepsvolume
- **QL** — Kwalificerende Benen (legs)
- **Dmd** — Diamond · **Bnz** — Bronze

---

## De 3 Fases (totale commissie-pool)

### FASE 1 — Niveau Commissies (40%)
Niveau 1 t/m 3. Dit is de commissie op bestellingen in je eerste 3 levels. De percentages variëren per scenario (Shopper vs Member vs Member-met-eigen-shop).

**De drie scenario's op Fase 1:**

**A. Shopper-bestelling**
Een Shopper plaatst een bestelling in een willekeurige Shop. De Shop-eigenaar en hun upline ontvangen commissie.
- Shop Niveau: **25%**
- Niveau 2: **10%**
- Niveau 3 (3 QL): **5%**

**B. Member-bestelling (géén eigen shop)**
Member plaatst een bestelling — hij/zij is zelf **niet** in aanmerking voor provisie. De upline ontvangt de volledige provisie.
- Niveau 1: **5%**
- Niveau 2: **25%**
- Niveau 3 (3 QL): **10%**

**C. Member-Shop bestelling (Member met eigen shop)**
- **<150 IP**: Member komt **niet** in aanmerking voor commissie op de eerste 150 IP.
- **>150 IP**: boven 150 IP profiteert de Member van een **verkoopkorting van 20%**; upline ontvangt ook commissie.
  - Niveau 1: **10%**
  - Niveau 2: **5%**
  - Niveau 3 (3 QL): **5%**

### FASE 2 — Leadership Commissies (12%)
Vanaf **Niveau 4** en dieper. Verdeeld over ranks:

| Rank | Leadership-aandeel |
|---|---:|
| Bronze | tot **3%** |
| Silver | tot **6%** |
| Gold | tot **9%** |
| Diamond | tot **12%** |

Hoe hoger je rank, hoe groter het deel van de 12%-pool dat aan jou wordt toegewezen *voordat* het wordt doorgegeven aan uplines.

### FASE 3 — Star-Leadership Commissies (8%)
Vanaf **Niveau 4** en dieper. Alleen voor Star-Diamond ranks:

| Rank | Star-Leadership-aandeel |
|---|---:|
| 1★ Diamond | tot **3%** |
| 2★ Diamond | tot **3%** |
| 3★ Diamond | tot **2%** |

---

## Hoe het werkt in de praktijk — Voorbeeld-upline

Voorbeeld uit officiële documentatie (FASE 2 & 3):

| Naam | Rank | Relatie |
|---|---|---|
| Lara | 3★ Diamond | sponsor van Kai — krijgt 2% (3★ LD) |
| Kai | 2★ Diamond | sponsor van Jose — krijgt 3% (2★ LD) |
| Jose | 1★ Diamond | sponsor van Iris — krijgt 3% (1★ LD) |
| Iris | 2★ Diamond | sponsor van Hugo — 1ᵉ Star-Diamond in upline, krijgt 3% (als 1★ LD) |
| Hugo | Silver | sponsor van Gino — krijgt niets meer op Mia/Sara/Noah (alle 12% is op) |
| Gino | Diamond | sponsor van Finn — krijgt resterende 3% van L (na 3% Bronze + 6% Silver/Gold) |
| Finn | Gold | sponsor van Emma — krijgt 3% Silver + 3% Gold (6% totaal) |
| Emma | Bronze | sponsor van Dion — 1ᵉ Bronze in upline, krijgt 3% |
| Dion | Believer / Cruz etc. (Fase 1) | — |

**Kernregel:** bij FASE 2/3 krijgt de **eerste gekwalificeerde rank** in de upline het rank-deel; daarboven stroomt alleen wat over is.

**Shopper/Member flow onderaan:**
- **Noah** (Shopper, plaatst bestelling in Mia's shop) → Mia + upline krijgen commissie
- **Mia** (Member zonder eigen shop) → upline krijgt volledige provisie
- **Sara** (Member mét eigen shop, 400 IP bestelling) → eerste 150 IP geen commissie voor Sara; boven 150 IP krijgt Sara 20% verkoopkorting, upline deelt in

---

## Implicaties voor ELEVA

- **Rank-tracker**: dashboard kan Dag-X-van-60 koppelen aan rank-progressie (Believer → Builder → Bronze). Builder (1.500 QGV) is het expliciete 60-dagen-doel volgens STAP 5.
- **IP-rekenmachine**: feature-idee — bij elke shopper/member die een lid toevoegt, direct zien wat dit betekent voor rank-voortgang (AV / QGV / QL).
- **3 soorten bestellingen**: terminologie in de app moet consistent zijn — **Shopper / Member / Member-met-shop** (zoals Lifeplus het noemt), niet "klant/prospect/distributeur".
- **"150 IP eigen bestelling"** (STAP 5) komt rechtstreeks uit Fase 1-C: Member-Shop-bestellingen onder 150 IP leveren geen commissie op. Vandaar de vuistregel. Dit is een **harde drempel** voor kwalificatie.
- **Leadership-drempel = Niveau 4**. Fase 2 & 3 activeren pas vanaf level 4. Dit is een belangrijke mentale milestone die niet per se zichtbaar is in de app nu — zou verduidelijkt kunnen worden.
- **Dinsdagavond teamtraining** (uit STAP 5) is logischerwijs waar rank-begrip + plan concreet gemaakt wordt. ELEVA kan daaraan koppelen (herinnering, recap, huiswerk).
