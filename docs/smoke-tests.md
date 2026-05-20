# Smoke-test checklist

Korte handmatige checklist voor de vier kritieke pilot-flows. Doel: regressies vangen vóór ze een pilot-lid raken.

Wekelijks doorlopen, of altijd na een wijziging in middleware, onboarding, modus-switch of /setup.

Vink af, noteer datum + tester, deel met Claude bij elke afwijking.

---

## Flow 1: Nieuwe Sprint-signup naar dag 1

- [ ] /registreer met nieuw e-mailadres, telefoon ingevuld, account aangemaakt
- [ ] Redirect naar /welkom-keuze, drie tegels zichtbaar (Sprint, Core, Pro)
- [ ] Klik Sprint, beland op /onboarding stap 1
- [ ] Stap 1: app-geïnstalleerd afvinken werkt
- [ ] Stap 2: push aanzetten werkt
- [ ] Stap 3: WHY-coach geeft tekst terug met de verplichte zin "online extra inkomsten...zonder investeringen en zonder risico"
- [ ] Stap 3: 5 namen handmatig toevoegen werkt, vCard-import-route is NIET zichtbaar hier
- [ ] Stap 4: tempo-keuze 2/4/6 uur, één klikken, opslag werkt
- [ ] Redirect naar /vandaag dag 1
- [ ] Topbar zegt "Sprint" en dag 1 wordt getoond
- [ ] Geen "Welkom terug"-banner zichtbaar

## Flow 2: Nieuwe Core-signup naar dag 1

- [ ] /registreer met nieuw e-mailadres
- [ ] Redirect naar /welkom-keuze
- [ ] Klik Core (webshop-strategie), beland op /welkom-core of /onboarding (afhankelijk van flow-stand)
- [ ] DTT-formulier (Doel-Tijd-Termijn) inkomen + tijd + termijn invullen, opslaan werkt
- [ ] Redirect naar /vandaag dag 1 Core
- [ ] Topbar zegt "Core" en dag 1 wordt getoond
- [ ] Geen "Welkom terug"-banner zichtbaar
- [ ] Statistieken-pagina toont Core-getallen, niet Sprint-getallen

## Flow 3: Modus-switch Sprint naar Core (of omgekeerd)

- [ ] Inloggen als Sprint-account op dag ≥ 3
- [ ] Naar /instellingen, klik "modus-test"
- [ ] Switch naar Core
- [ ] Banner "Wil je deze modus oppakken?" verschijnt op /vandaag
- [ ] Klik "Oppakken"
- [ ] Dag-teller toont Core-dag 1 (of waar Core-startdatum stond)
- [ ] Geen redirect-loop, geen zwart scherm
- [ ] Topbar toont nu "Core"
- [ ] Statistieken-pagina herkent de switch (Core-getallen)
- [ ] Switch terug naar Sprint, dag-teller staat weer correct op Sprint-dag

## Flow 4: /setup item afvinken (cross-modus)

- [ ] /setup pagina zegt "Administratieve stappen", geen "Eenmalige"
- [ ] Klik "Webshop aanmaken" → /setup/webshop-aangemaakt opent
- [ ] Film-blok zichtbaar of nette fallback
- [ ] Klik "Afvinken" of "Snel afvinken" op /setup
- [ ] Item is groen gemarkeerd
- [ ] Aantal-open-teller op /setup decrementeert
- [ ] SetupPopup op /vandaag toont juiste aantal of verdwijnt bij 0

---

## Bij een afwijking

1. Screenshot of korte beschrijving
2. Welke flow, welke stap (bv. "Flow 3 stap 4")
3. Wat je deed vs. wat er gebeurde
4. Deel met Claude, met de zin "smoke-test afwijking"

Claude rolt waar mogelijk terug naar de git-tag `v-pilot-werkend-2026-05-20` als de regressie écht groot is en pakt 'm vandaar opnieuw.
