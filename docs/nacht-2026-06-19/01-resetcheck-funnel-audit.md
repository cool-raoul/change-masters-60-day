# Ronde 1 — Reset-check funnel doorlichting (nacht 18→19 juni)

Adversariële doorlichting (26 agenten) van alles wat we deze sessie bouwden: de
vangst-bij-e-mail, de contact-trigger, de uitkomst-mail vs. het scherm, de
mini-ELEVA-aanvraag en de domein-centralisatie. Elke bevinding is door een
tweede, skeptische agent geverifieerd. Hieronder alleen de bevindingen die
echt klopten (vals alarm is eruit gefilterd).

---

## ✅ Al veilig gefixt vannacht (gepusht)

1. **Dubbele vangst bij dubbelklik beperkt** — `vangProspect` heeft nu een
   in-flight guard (vuurt niet twee keer tegelijk). [flow.tsx]
2. **Lead niet meer kwijt bij tabblad-sluiten** — de vangst-fetch is nu
   `keepalive: true`, zodat 'ie afrondt ook als de prospect meteen wegklikt.
   [flow.tsx]
3. **mini-ELEVA-aanvraag crasht niet meer bij dubbele kaart** — prospect-lookup
   pakt nu netjes de nieuwste i.p.v. terug te vallen naar de homepage.
   [api/mini-eleva/aanvraag]
4. **Stripe-afrekenen wees naar een fout domein** (`app.eleva.nl`) als
   vangnet — nu via de centrale `SITE_URL` (my-eleva.com). [api/stripe/checkout]
5. **Diagnose-route gebruikte een afwijkende env-var** — nu dezelfde centrale
   bron. [api/diagnose/reset-check-test]
6. **Verouderde comment** boven flow.tsx rechtgetrokken (verwees nog naar
   intekening-vooraf).

---

## ⚠️ Vraagt jouw beslissing — geprioriteerd

### A. Race-veiligheid via DB (samen, want het zijn migraties)
De hele vangst leunt nu op "kijk-dan-schrijf" zonder DB-slot. Bij twee
gelijktijdige requests (dubbelklik, mail-prefetch) kan er dubbel ontstaan. De
client-guard dekt de meest voorkomende gevallen af, maar de robuuste oplossing
is een unieke index. Drie kleine migraties:
- `freebie_opt_ins(member_id, freebie_id, lower(lead_email))` uniek → geen
  dubbele opt-in/prospect-kaart.
- `freebie_mail_queue(opt_in_id, dag)` uniek → geen dubbele mailreeks.
- `prospect_invitations(prospect_id) WHERE status='actief'` uniek → max één
  actieve omgeving per prospect. (Patroon bestaat al in `radar_voltooiingen.sql`.)
Telkens met een `onConflict`-afhandeling in de bijbehorende code. **Geen
launch-blocker, wel netjes voor de pilot.**

### B. Uitkomst-mail + member-push hangen aan de verkeerde "schakelaar" (hoog)
De directe uitkomst-mail én de "lead heeft ingevuld"-push zitten achter
`eersteCapture = (mail-queue-insert gelukt)`. Faalt die insert (migratie loopt
achter, transient DB-fout), dan gaat **geen uitkomst-mail en geen push** uit,
terwijl de UI "je uitkomst is verstuurd" belooft. Nu werkt het in productie
(jij testte een aankomende mail), dus dit is latent — maar fragiel. **Voorstel:**
ontkoppel de transactionele mail/push van de mail-queue-state (bv. een
`uitkomst_mail_verstuurd_op`-kolom op de opt-in, atomisch gezet). Even samen,
want het raakt de live vangst-logica.

### C. Contact-route kan een telefoonnummer stil verliezen (midden)
Laat de prospect een nummer achter terwijl er (door een eerdere hapering) nog
geen prospect-kaart is, dan wordt het nummer nergens opgeslagen — maar de UI
zegt "we bellen je". **Voorstel:** in `api/freebie-bot/contact` een minimale
prospect-kaart aanmaken als die ontbreekt, zodat een hot lead nooit wegvalt.

### D. Prospect-notitie groeit cumulatief (laag)
Klikt iemand heen-en-weer, dan plakt elke vangst de volledige antwoord-dump
opnieuw onder de kaart → lange, rommelige notitie. (Antwoorden zelf blijven
correct, alleen het notitieveld dijt uit.) **Voorstel:** het oude
"🌷 VIA …"-blok vervangen i.p.v. aanvullen.

### E. Claim-vrij: tijdsbeloftes in de uitkomst-content (jouw stem)
In `lib/reset-check/content.ts` staan tijdsframes gekoppeld aan effecten, wat
botst met claimvrij-beginsel 2 (én met wat de bestanden zelf bovenaan beloven:
"geen tijds- of gezondheidsbeloftes"). Dit zit in zowel het scherm als de mail:
- regel 22: "al binnen 7 tot 10 dagen verschil voelen"
- regel 56: "al binnen 4 of 5 dagen … middagdip kleiner"
- regel 78: "rustiger inslapen vanaf week 2" (gekoppeld aan traject-deelnemers)
Dit raakt jouw stem en de claim-grens, dus **dit laat ik aan jou** — ik heb een
voorstel klaar om de tijd los te koppelen van het effect zodra je wilt.

### F. Restrisico's bewust accepteren voor de pilot (laag)
- Het aanvraag-endpoint is publiek op `?optin=<uuid>`. De UUID is niet te
  raden, maar lekt wel in elke mail-URL. Wie 'm bemachtigt kan een omgeving
  openen + een valse "lead is binnen"-melding triggeren. **Geen** prospect-
  privédata, chat of spiegel-tekst lekt. Voor de pilot verdedigbaar; later
  eventueel een apart opt-in-secret + rate-limiting.
- `vangProspect` slikt harde fouten stil (4xx/5xx). Lost grotendeels op zodra B
  is aangepakt; anders een zichtbare terugkoppeling toevoegen.

---

## Niet-bevestigd (vals alarm, ter info)
- "Uitkomst-mail valt weg bij onbruikbare antwoorden" — pad is onbereikbaar
  omdat elke stap hard gegate is op verplichte velden.
- "NEXT_PUBLIC_APP_URL ontbreekt → alles op fallback" — de fallback is correct
  (my-eleva.com); wél aan te raden om de var expliciet in Vercel te zetten voor
  hygiëne, geen codebug.
- Oude vercel.app-URL staat alleen nog in een afgerond plan-doc, niet in code.
