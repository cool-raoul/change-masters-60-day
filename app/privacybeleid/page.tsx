// Publieke privacybeleid-pagina. Gelinkt vanuit de freebies (gegevens-stap)
// zodat we AVG-transparant zijn richting prospects die via bv. de podcast
// binnenkomen. Statische, leesbare pagina (geen app-chrome).

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid · ELEVA",
  description:
    "Hoe we omgaan met je gegevens als je een check of freebie invult.",
};

export const dynamic = "force-static";

const BIJGEWERKT = "24 juni 2026";

export default function Privacybeleid() {
  return (
    <main className="min-h-screen bg-[#f7f1e4] text-[#2a2616] px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-extrabold">Privacybeleid</h1>
          <p className="text-sm text-[#8a7f5e]">Laatst bijgewerkt: {BIJGEWERKT}</p>
        </header>

        <p className="leading-relaxed">
          Fijn dat je hier bent. Als je een check of freebie invult, laat je een
          paar gegevens bij ons achter. Hieronder leggen we eerlijk en in gewone
          taal uit welke dat zijn, waarom we ze vragen, en wat je rechten zijn.
        </p>

        <Sectie titel="Wie is verantwoordelijk?">
          <p>
            De persoon die jou de link naar deze check heeft gestuurd (de
            afzender, een zelfstandig ondernemer) is verantwoordelijk voor je
            gegevens en is je eerste aanspreekpunt. De techniek erachter wordt
            geleverd door ELEVA, dat de gegevens namens de afzender verwerkt en
            veilig bewaart.
          </p>
        </Sectie>

        <Sectie titel="Welke gegevens verzamelen we?">
          <ul className="list-disc pl-5 space-y-1">
            <li>Je naam en e-mailadres.</li>
            <li>
              Je telefoonnummer, alleen als je daar zelf voor kiest omdat je
              persoonlijk contact wilt.
            </li>
            <li>
              Je antwoorden op de check (in samengevatte vorm), zodat we je een
              passend, persoonlijk advies kunnen geven.
            </li>
            <li>
              Eventueel je Instagram- of Facebooknaam, als je die zelf invult.
            </li>
          </ul>
        </Sectie>

        <Sectie titel="Waarom vragen we dit?">
          <p>
            We gebruiken je gegevens om je je persoonlijke uitkomst te sturen, om
            (als je dat wilt) persoonlijk met je mee te kijken, en om je af en toe
            relevante tips te sturen. De grondslag hiervoor is je toestemming: je
            vult de gegevens zelf in om je uitkomst te ontvangen. Je geeft die
            toestemming vrijwillig en kunt 'm altijd weer intrekken.
          </p>
        </Sectie>

        <Sectie titel="Hoe lang bewaren we het?">
          <p>
            We bewaren je gegevens niet langer dan nodig. Je antwoorden op de
            check bewaren we kort, om ons gesprek voor te bereiden, en
            verwijderen we daarna, uiterlijk na 30 dagen of zodra we elkaar
            gesproken hebben. Je contactgegevens bewaren we zolang we contact met
            je hebben over dit onderwerp, en verwijderen we op jouw verzoek.
          </p>
        </Sectie>

        <Sectie titel="Delen we het met anderen?">
          <p>
            Nee. We verkopen je gegevens niet en delen ze niet met derden voor
            hun marketing. We werken wel met betrouwbare leveranciers die ons
            helpen de dienst te laten werken (zoals hosting en het versturen van
            e-mail). Zij verwerken je gegevens uitsluitend in onze opdracht en
            onder een verwerkersovereenkomst, en mogen ze nergens anders voor
            gebruiken.
          </p>
        </Sectie>

        <Sectie titel="E-mails en afmelden">
          <p>
            Als we je e-mails sturen, kun je je op elk moment afmelden via de
            afmeldlink onderaan elke mail. Dan stoppen de berichten meteen.
          </p>
        </Sectie>

        <Sectie titel="Jouw rechten">
          <p>
            Je hebt het recht om je gegevens in te zien, te laten corrigeren of
            te laten verwijderen, om bezwaar te maken tegen het gebruik ervan, en
            om je toestemming in te trekken. Laat het ons weten, dan regelen we
            het.
          </p>
        </Sectie>

        <Sectie titel="Beveiliging">
          <p>
            We gaan zorgvuldig met je gegevens om en bewaren ze in een beveiligde
            omgeving, met toegang alleen voor wie dat echt nodig heeft.
          </p>
        </Sectie>

        <Sectie titel="Contact">
          <p>
            Wil je je gegevens inzien, aanpassen of laten verwijderen, of heb je
            een vraag? Neem contact op met de persoon die je deze link heeft
            gestuurd. Voor vragen over het platform kun je terecht bij ELEVA via{" "}
            <a
              href="https://my-eleva.com"
              className="underline text-[#8a6d1f] hover:text-[#5a4710]"
            >
              my-eleva.com
            </a>
            .
          </p>
        </Sectie>
      </div>
    </main>
  );
}

function Sectie({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-[#3a3526]">{titel}</h2>
      <div className="leading-relaxed text-[#3a3526]">{children}</div>
    </section>
  );
}
