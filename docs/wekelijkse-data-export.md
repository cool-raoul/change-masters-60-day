# Wekelijkse data-export (gratis backup-routine)

Geen Supabase Pro nodig. Drie klikken, één bestand per week op je harde schijf. Dat is je echte vangnet zolang we op het Free-plan zitten.

Doe deze routine bij voorkeur zondagavond of maandagochtend, met een vaste herinnering.

---

## De drie klikken

1. Open https://app.supabase.com en kies het ELEVA-project
2. Linker-balk: **Database** → **Backups**
3. Bij de meest recente daily backup, klik **Download** (of "Restore" als je weet wat je doet)

Resultaat: een `.sql` of `.gz` bestand dat alle data en schema van die dag bevat.

## Waar bewaar je het

Maak een vaste map op je harde schijf, bijvoorbeeld:

```
C:\Users\raoul\OneDrive\Bureaublad\ELEVA-backups\
```

Bestandsnaam-formaat: `eleva-backup-YYYY-MM-DD.sql.gz`. OneDrive synct 'm automatisch naar je cloud, dus je hebt 'm op meerdere plekken.

**Bewaar minimaal de laatste 4 weken**, daarna mag je oudere weggooien.

## Wat als er écht iets stuk gaat

1. Geef Claude de exacte foutmelding en datum
2. Claude pakt de meest recente werkende backup-file van jou
3. Via Supabase dashboard → SQL Editor kun je een restore uitvoeren op een nieuw project, of selectieve tabellen herstellen
4. We rollen daarna de app via `git reset --hard v-pilot-werkend-<datum>` terug

## Wanneer overwegen we Pro alsnog

- Bij meer dan 30 actieve pilot-leden (data wordt te belangrijk om alleen weekly te dekken)
- Bij commerciële uitrol naar leden buiten het kern-pilot-team
- Bij financiering, sponsoring of een budget waarin €25/m geen pijnpunt meer is

Tot die tijd: dit document is je veiligheidsnet.
