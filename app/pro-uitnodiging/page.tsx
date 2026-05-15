import type { Metadata } from "next";

// ============================================================
// /pro-uitnodiging
//
// Publiek deelbare one-pager voor professionele ondernemers
// (coaches, therapeuten, beauty-pro's, personal trainers, studio's,
// salons) die we willen uitnodigen om naast hun praktijk een extra
// inkomstenlaag op te bouwen via een eigen gratis webshop + ELEVA.
//
// Bedoeld om als link te versturen via WhatsApp of e-mail. GEEN
// login nodig (zie publicRoutes in lib/supabase/middleware.ts).
//
// Inhoud + stijl identiek aan public/onepagers/pro-uitnodiging.html
// maar gebracht in ELEVA's eigen donkere brand-stijl (Tailwind +
// cm-tokens). De HTML-versie blijft bestaan voor mensen die liever
// een print-PDF willen.
// ============================================================

export const metadata: Metadata = {
  title: "Voor ondernemers die voelen dat de wereld verandert · ELEVA",
  description:
    "Een gratis webshop + ELEVA-platform als extra inkomstenlaag onder je bestaande praktijk. Voor coaches, therapeuten en professionals met cliënten.",
};

export default function ProUitnodigingPagina() {
  return (
    <div className="min-h-screen bg-cm-black text-cm-white">
      <div className="max-w-3xl mx-auto px-5 py-10 sm:py-14 space-y-8">
        {/* ─────────────── HOOK ─────────────── */}
        <header className="space-y-4">
          <h1 className="font-serif-warm text-3xl sm:text-4xl text-cm-white leading-tight">
            Voor ondernemers die voelen dat de wereld verandert
          </h1>
          <p className="text-cm-white/80 leading-relaxed">
            Je bent dit vak begonnen vanuit hart en ziel. Omdat je mensen écht
            wilt helpen en van betekenis wilt zijn. Maar de wereld verandert:
            alles wordt duurder, tijd wordt schaarser, en het oude model van{" "}
            <em className="text-cm-white/60">
              "harder werken = meer verdienen"
            </em>{" "}
            werkt voor steeds minder mensen.
          </p>
        </header>

        {/* ─────────────── HERKENNING ─────────────── */}
        <section className="card space-y-3">
          <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
            Misschien herken je dit
          </h3>
          <p className="text-cm-white/70 text-sm">
            Je helpt mensen, je hebt klanten, je levert kwaliteit. En toch:
          </p>
          <ul className="space-y-1.5">
            <li className="flex gap-2 text-cm-white/85 text-sm">
              <span className="text-cm-gold flex-shrink-0">•</span>
              <span>
                <strong className="text-cm-white">Je inkomen is niet schaalbaar</strong>, het blijft gekoppeld aan je tijd
              </span>
            </li>
            {[
              "Je agenda bepaalt je omzet",
              "Als jij niet werkt of op vakantie gaat, stopt je inkomen",
              "Je wilt méér, maar niet nog harder werken",
            ].map((t, i) => (
              <li key={i} className="flex gap-2 text-cm-white/85 text-sm">
                <span className="text-cm-gold flex-shrink-0">•</span>
                <span>{t}</span>
              </li>
            ))}
            <li className="flex gap-2 text-cm-white/85 text-sm">
              <span className="text-cm-gold flex-shrink-0">•</span>
              <span>
                Soms vraag je je af:{" "}
                <em className="text-cm-white">"is dit het nou?"</em>
              </span>
            </li>
          </ul>
        </section>

        {/* ─────────────── ANDERE WEG (NU EERST) ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Je wilt groeien, maar niet zo
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="card">
              <ul className="space-y-1.5 text-sm text-cm-white/85">
                {[
                  "Niet opnieuw beginnen",
                  "Niet alles omgooien",
                  "Niet nóg harder werken",
                  "Niet je prijs hoeven verhogen",
                  "Geen extra grote tijdsinvesteringen",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-cm-gold flex-shrink-0">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card border-l-4 border-cm-gold space-y-2">
              <h3 className="text-cm-gold font-semibold text-sm">
                Wat als het anders kan?
              </h3>
              <p className="text-cm-white/85 text-sm leading-relaxed">
                Slimmer bouwen op wat je al hebt staan. Je huidige business
                behouden, en er een{" "}
                <strong className="text-cm-white">schaalbaar inkomen</strong>{" "}
                naast zetten dat met je meebeweegt, zonder je prijs te hoeven
                verhogen en zonder extra grote tijdsinvesteringen.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────── 3 G's (NA "JE WILT GROEIEN") ─────────────── */}
        <section className="space-y-4">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            De drie G's die het verschil maken
          </h2>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                nr: "1",
                naam: "Gezondheid",
                bullets: [
                  "Holistisch programma",
                  "Reset voor lichaam en geest",
                  "Mensen dichter bij zichzelf",
                  "Fysiek en mentaal sterk",
                ],
              },
              {
                nr: "2",
                naam: "Gezamenlijkheid",
                bullets: [
                  "Warme community van professionals",
                  "Kennis delen, support, trainingen",
                  "Volledig stappenplan ligt klaar",
                  "Samen groeien",
                ],
              },
              {
                nr: "3",
                naam: "Gezonde financiën",
                bullets: [
                  "Schaalbaar inkomen",
                  "Geen voorraad, geen investering",
                  "Geen uurtje-factuurtje",
                  "Beweegt met je mee",
                ],
              },
            ].map((g) => (
              <div key={g.nr} className="card space-y-2">
                <h3 className="text-cm-white font-bold flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cm-gold text-cm-on-gold font-bold">
                    {g.nr}
                  </span>
                  {g.naam}
                </h3>
                <ul className="space-y-1 text-xs text-cm-white/80">
                  {g.bullets.map((b, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-cm-gold flex-shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-gradient-gold text-cm-on-gold px-5 py-4 text-center">
            <p className="font-bold text-base">
              ✨ Als deze drie in balans zijn, ontstaat de vierde G: Geluk.
            </p>
            <p className="text-sm opacity-85 italic mt-1">
              Je voelt het in je lijf. In je vrijheid. In je werk.
            </p>
          </div>
        </section>

        {/* ─────────────── GRATIS WEBSHOP ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Een gratis eigen webshop, alles geregeld
          </h2>
          <p className="text-cm-white/75 text-sm leading-relaxed">
            Je ontvangt gratis een{" "}
            <strong className="text-cm-white">eigen webshop</strong> vol
            hoogwaardige holistische wellness-producten als verlengstuk van
            jouw business. Achter de webshop staat een{" "}
            <strong className="text-cm-white">
              samenwerkend bedrijf dat ruim 35 jaar bestaat, gebaseerd op 80
              jaar kennis en ervaring
            </strong>
            .
          </p>
          <div className="card grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              "Geen voorraad inkopen",
              "Geen verzendingen",
              "Geen retouren regelen",
              "Geen webshop bouwen",
              "Geen administratie of logistiek",
              "Geen investering",
              "Gratis klantenservice voor jou en je cliënten",
              "30 dagen niet-goed-geld-terug garantie",
              "Uitbetaling elke 15e van de maand",
              "Ruim 35 jaar samenwerking, 80 jaar kennis",
            ].map((t, i) => (
              <div key={i} className="flex gap-2 text-sm text-cm-white/85">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────── ALLES DRAAIT DOOR ─────────────── */}
        <section className="card border-l-4 border-cm-gold space-y-2">
          <h3 className="text-cm-gold font-semibold text-sm">
            Alles draait door, ook als jij er niet bent
          </h3>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Je blijft doen waar je goed in bent. Je werkt met je klanten, je
            deelt, je adviseert, je blijft dichtbij jezelf. Alleen nu bouw je
            daarnaast iets op dat{" "}
            <strong className="text-cm-white">niet stopt</strong> zodra je
            agenda vol zit, of als je juist minder wilt werken.
          </p>
        </section>

        {/* ─────────────── SCHAALBAAR EN GELAAGD INKOMEN ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Hoe het schaalbare, gelaagde inkomen ontstaat
          </h2>
          <p className="text-cm-white/75 text-sm">
            Je bouwt in drie lagen, zonder extra uren te draaien. Iedere laag
            werkt naast de vorige.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                titel: "Laag 1, jouw klanten",
                tekst:
                  "Jouw klanten bestellen in jouw eigen webshop. Jij ontvangt percentages over wat zij maandelijks bestellen.",
              },
              {
                titel: "Laag 2, andere professionals",
                tekst:
                  "Jij biedt andere professionals dezelfde optie aan: zij krijgen ook een gratis webshop. Jij krijgt percentages over hun webshop-omzet.",
              },
              {
                titel: "Laag 3, pay-it-forward",
                tekst:
                  "Zij doen op hun beurt hetzelfde voor anderen. Jij ontvangt ook over die verder-via-via-webshops. Zo wordt het inkomen écht gelaagd en schaalbaar.",
              },
            ].map((l, i) => (
              <div
                key={i}
                className="card border-l-4 border-cm-gold space-y-1.5"
              >
                <p className="text-cm-white font-semibold text-sm">
                  {l.titel}
                </p>
                <p className="text-cm-white/75 text-xs leading-relaxed">
                  {l.tekst}
                </p>
              </div>
            ))}
          </div>
          <p className="text-cm-white/55 text-xs italic">
            Geen pyramide, geen druk om te werven. Wel een eerlijk systeem
            waarin jij deelt wat werkt, en de mensen die jij hebt geholpen op
            hun beurt anderen mogen helpen.
          </p>
        </section>

        {/* ─────────────── CATEGORIEËN ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Wat je deelt via de webshop
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "🔥 **Metabolisme** · afvallen · intermittent fasting",
              "⚡ **Energie & focus**",
              "😴 **Stress, burnout-herstel, slaap**",
              "🌸 **Hormonale balans**",
              "💪 **Sport, performance, herstel**",
              "✨ **Huid, beauty en verzorging**",
              "🌿 **Holistische wellness-aanvulling**",
              "**... en meer**",
            ].map((t, i) => {
              const parts = t.split(/\*\*(.+?)\*\*/g);
              return (
                <div
                  key={i}
                  className="flex gap-2 text-sm text-cm-white/85 items-center"
                >
                  <span className="text-cm-gold flex-shrink-0">•</span>
                  <span>
                    {parts.map((p, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-cm-white">
                          {p}
                        </strong>
                      ) : (
                        <span key={j}>{p}</span>
                      ),
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-cm-white/55 text-xs italic">
            Geen push, geen verkoopgevoel, simpelweg delen wat klopt.
          </p>
        </section>

        {/* ─────────────── ELEVA PLATFORM ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            ELEVA, jouw rustige werkplek waar alles samenkomt
          </h2>
          <p className="text-cm-white/75 text-sm">
            Naast de webshop krijg je toegang tot{" "}
            <strong className="text-cm-white">ELEVA</strong>, ons platform
            speciaal voor professionals:
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                emoji: "🤖",
                titel: "De ELEVA Mentor",
                bullets: [
                  "Cliënt vult een korte vragenlijst in",
                  "Mentor geeft claim-vrij advies op maat",
                  "Inclusief leefstijl-pijlers (slaap, beweging, voeding, stress)",
                  "Afstemming in overleg met jouw expertise",
                  "Jij blijft de expert, mentor doet voorwerk",
                ],
              },
              {
                emoji: "✨",
                titel: "Mini-ELEVA voor je cliënt",
                bullets: [
                  "Eigen omgeving om in eigen tempo rond te kijken",
                  "Korte films, mentor-chat, vragenlijst",
                  "Directe lijn met jou",
                  "Voor wie eerst rustig wil verkennen",
                ],
              },
              {
                emoji: "🧑‍⚕️",
                titel: "Eén plek voor al je cliënten",
                bullets: [
                  "Overzicht met fase, notities, voortgang",
                  "Bestelgeschiedenis per cliënt",
                  "Geen losse spreadsheets meer",
                  "Zicht op de volgende natuurlijke stap",
                ],
              },
              {
                emoji: "🎓",
                titel: "15-stappen pad in eigen tempo",
                bullets: [
                  "Geen sprint, geen tijdsdruk",
                  "Geen verplichtingen",
                  "Opzetten en uitbouwen in je eigen tempo",
                  "Stap voor stap je systeem aanleren",
                  "Naast je praktijk, wanneer het past",
                ],
              },
            ].map((f, i) => (
              <div key={i} className="card space-y-2">
                <h3 className="text-cm-white font-semibold text-sm flex items-center gap-2">
                  <span className="text-base">{f.emoji}</span>
                  {f.titel}
                </h3>
                <ul className="space-y-1 text-xs text-cm-white/80">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span className="text-cm-gold flex-shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────── TRAJECT (PLAATJE) ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Hoe ziet het traject eruit?
          </h2>
          <div className="rounded-xl bg-purple-950/30 border border-purple-700/40 p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  nr: "1",
                  titel: "Maand 1",
                  sub: "Kies je categorie",
                  bullets: [
                    "Energy & Focus",
                    "Stress & Herstel",
                    "Hormoonbalans",
                    "Sport & Performance",
                    "Complete / Plus / Essential",
                  ],
                },
                {
                  nr: "2",
                  titel: "Maand 2",
                  sub: "Klanten bestellen maandelijks",
                  bullets: ["Complete / Plus / Essential", "Jij verdient op herhaal"],
                },
                {
                  nr: "3",
                  titel: "Maand 3",
                  sub: "Elke maand aanvullen",
                  bullets: ["Verdiepen in andere producten", "Producttraining mogelijk"],
                },
                {
                  nr: "4+",
                  titel: "Maand 4+",
                  sub: "Verleng jouw traject",
                  bullets: ["6-9 maanden routine", "Plan eventueel een gesprek"],
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-cm-surface/50 rounded-lg p-3 space-y-2 text-center"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-700 text-white font-bold mx-auto flex items-center justify-center">
                    {f.nr}
                  </div>
                  <div>
                    <p className="text-cm-white font-bold text-sm leading-tight">
                      {f.titel}
                    </p>
                    <p className="text-cm-white/60 text-[10px]">{f.sub}</p>
                  </div>
                  <ul className="space-y-0.5 text-[10px] text-cm-white/75 text-left">
                    {f.bullets.map((b, j) => (
                      <li key={j} className="flex gap-1">
                        <span className="text-purple-400 flex-shrink-0">›</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white text-xs font-bold tracking-wider rounded-md grid grid-cols-4 text-center py-1.5">
              <span>MAAND 1 ›</span>
              <span>MAAND 2 ›</span>
              <span>MAAND 3 ›</span>
              <span>MAAND 4+</span>
            </div>
          </div>
        </section>

        {/* ─────────────── WAT ER ONTSTAAT ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Wat er bij jou ontstaat
          </h2>
          <div className="card grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              "Mensen gaan maandelijks bestellen",
              "Extra inkomstenstroom naast je huidige werk",
              "Niet afhankelijk van je uren",
              "Groeit gestaag mee",
            ].map((t, i) => (
              <div key={i} className="flex gap-2 text-sm text-cm-white/85">
                <span className="text-cm-gold flex-shrink-0">•</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────── VOOR WIE ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Voor wie is dit interessant?
          </h2>
          <div className="card space-y-3">
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {[
                "🧘 Coaches en therapeuten",
                "💪 Personal trainers",
                "💄 Beauty-professionals",
                "🏢 Studio's en salons",
                "👥 Professionals met mensen om zich heen",
              ].map((t, i) => (
                <div key={i} className="flex gap-2 text-sm text-cm-white/85">
                  <span className="flex-shrink-0">{t.slice(0, 2)}</span>
                  <span>{t.slice(2).trim()}</span>
                </div>
              ))}
            </div>
            <p className="text-cm-white text-sm font-medium">
              Heb jij mensen met wie je werkt? Dan kun je dit ernaast bouwen.
            </p>
          </div>
        </section>

        {/* ─────────────── WAT JE NODIG HEBT ─────────────── */}
        <section className="space-y-3">
          <h2 className="font-serif-warm text-2xl text-cm-white border-b border-cm-gold/40 pb-2">
            Wat heb je nodig?
          </h2>
          <div className="card space-y-2.5">
            <ul className="space-y-1.5">
              {[
                "Een bewezen systeem ligt klaar",
                "Begeleiding en training inbegrepen",
                "Community die met je meedenkt en meegroeit",
                "Jouw enige investering: maandelijks een productpakket naar keuze voor je eigen gezondheid",
              ].map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-cm-white/85">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-cm-white font-medium text-sm">
              Verder krijg je alles er gratis bij.
            </p>
          </div>
        </section>

        {/* ─────────────── CTA ─────────────── */}
        <section className="rounded-xl bg-cm-surface border-2 border-cm-gold/60 px-6 py-5 space-y-3 shadow-gold-lg">
          <h2 className="font-serif-warm text-2xl text-cm-gold">En nu?</h2>
          <ol className="space-y-2 text-cm-white text-sm leading-relaxed list-decimal list-inside marker:text-cm-gold marker:font-bold">
            <li>
              <strong className="text-cm-white">Bekijk de video</strong>{" "}
              bovenaan voor iets meer uitleg
            </li>
            <li>
              <strong className="text-cm-white">Neem contact op</strong> met
              degene die jou deze pagina stuurde
            </li>
            <li>
              <strong className="text-cm-white">
                Zorg dat al je vragen beantwoord worden
              </strong>
            </li>
          </ol>
        </section>

        {/* ─────────────── DISCLAIMER ─────────────── */}
        <p className="text-cm-white/45 text-[11px] italic leading-relaxed pt-4 border-t border-cm-border">
          Laat je niet misleiden door uitspraken dat dit een manier is om
          makkelijk geld te verdienen. LPE biedt geen enkele garantie wat
          betreft inkomsten en geeft geen concrete prognoses. Je bent zelf
          verantwoordelijk voor de inkomsten die je al dan niet genereert.
          Alle inkomsten zijn het resultaat van de verkoop van producten.
        </p>
      </div>
    </div>
  );
}
