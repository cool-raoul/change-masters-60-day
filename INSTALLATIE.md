# Change Masters — 60 Dagen Run Systeem
## Installatie instructies voor Raoul & Gaby

---

## Wat je nodig hebt (eenmalig installeren)

### Stap 1: Node.js installeren
1. Ga naar **nodejs.org** in je browser
2. Klik op de grote groene **"LTS"** knop om te downloaden
3. Open het gedownloade bestand en klik door de installatie heen
4. Herstart je computer

### Stap 2: Supabase account aanmaken (gratis)
1. Ga naar **supabase.com**
2. Klik op "Start your project" en maak een gratis account
3. Klik op "New project"
4. Naam: `change-masters`
5. Kies een wachtwoord (bewaar dit!) en kies `West EU (Ireland)` als regio
6. Wacht tot het project aangemaakt is (~2 minuten)

### Stap 3: Database aanmaken
1. In je Supabase project → klik op **SQL Editor** in het menu links
2. Klik op **"+ New query"**
3. Ga naar de map `change-masters/lib/supabase/` op je computer
4. Open het bestand `schema.sql` in Kladblok
5. Kopieer alles (Ctrl+A → Ctrl+C)
6. Plak het in de SQL Editor in Supabase
7. Klik op **"Run"** (groene knop)
8. Je ziet "Success" als het goed gaat

### Stap 4: API Keys ophalen
1. In Supabase → **Settings** (tandwiel onderin menu)
2. → **API** in het submenu
3. Kopieer:
   - **Project URL** (begint met `https://...supabase.co`)
   - **anon/public key** (lange tekst)

### Stap 5: Claude API key instellen
1. Ga naar **console.anthropic.com**
2. Klik op "API Keys" in het menu
3. Maak een nieuwe key aan als je die nog niet hebt
4. Kopieer de key (begint met `sk-ant-...`)

### Stap 6: Omgevingsvariabelen instellen
1. Ga naar de map `change-masters` op je computer
2. Open het bestand `.env.local` in Kladblok
3. Vervang de placeholders:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://JOUW-ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Sla op (Ctrl+S)

---

## Het systeem starten

1. Open **Windows Verkenner** en ga naar de map `change-masters`
2. Klik in de adresbalk bovenin, typ `cmd` en druk Enter
3. Er opent een zwart scherm (Terminal)
4. Typ: `npm install` en druk Enter (wacht tot het klaar is, ~2 minuten)
5. Daarna typ: `npm run dev` en druk Enter
6. Wacht tot je ziet: `▲ Next.js ready on http://localhost:3000`
7. Open je browser en ga naar **http://localhost:3000**

Het systeem draait nu op je eigen computer! 🎉

---

## Eerste keer inloggen

1. Ga naar http://localhost:3000/registreer
2. Maak jouw account aan (met de naam "Raoul" of "Gaby")
3. **Belangrijk:** Om jezelf als leider in te stellen, ga naar Supabase:
   - SQL Editor → New query
   - Plak: `UPDATE profiles SET role = 'leider' WHERE email = 'jouw@email.nl';`
   - Vervang het e-mailadres door jouw eigen e-mail
   - Klik Run
4. Na registratie kom je automatisch bij de WHY-coach
5. Voer het gesprek met de AI coach (5-10 minuten)
6. Daarna zie je het dashboard!

---

## Teamleden uitnodigen

1. Log in als leider
2. Ga naar **Team** in het menu
3. Kopieer de uitnodigingslink
4. Stuur deze link naar je teamlid
5. Het teamlid registreert zich via die link

---

## Scripts seeden (één keer doen)

1. Open een terminal in de `change-masters` map (zie boven)
2. Typ: `npm run seed-scripts` (als dit beschikbaar is)
3. Of: kopieer de inhoud van `lib/scripts-data.ts` handmatig via Supabase Table Editor

---

## Het systeem online zetten (later)

Als je het systeem online wilt voor het hele team:
1. Maak een gratis account op **vercel.com**
2. Verbind je GitHub account
3. Upload de `change-masters` map naar GitHub
4. Importeer het project in Vercel
5. Voeg de `.env.local` variabelen toe in Vercel → Settings → Environment Variables

---

## Hulp nodig?

Vraag het aan Claude in de terminal! Claude heeft toegang tot alle bestanden en kan alles uitleggen en aanpassen.
