// File: lib/reset-check/mails.ts
//
// 5-mail-vervolgsequence voor de Reset-check. Elke mail draagt één
// verse tip (niet uit de freebie-uitslag) als ruggengraat, met een
// koopmotief als ondertoon:
//
//   dag 1: beslis 's ochtends        → erkenning (wilskracht-mythe)
//   dag 2: verander nog niks, meet   → social proof (Reset-ritueel)
//   dag 3: tijdelijk streng > beetje → zekerheid (zo werkt de Reset echt)
//   dag 4: je avond begint 's ochtends → future self
//   dag 5: maandag-moeheid + draai   → eerlijke urgentie, daarna rust
//
// Feiten-anker (lib/lifeplus/pakketten.ts): de Holistic Reset is een
// STRIKT traject van 65 dagen in 4 fasen (laaddagen → 21d strikt →
// 21d stabilisatie → 21d LOGI 80/20). De mails beschrijven 'm globaal,
// protocol-details horen in het gesprek.
//
// Mini-ELEVA: elke mail bevat een blok met de persoonlijke omgeving-
// link. Vol introductie-blok zolang de lead nog niet binnen is geweest,
// daarna een korte verwijzing. De cron levert miniElevaUrl +
// alInMiniEleva aan; is er geen actieve uitnodiging dan valt het blok
// stilletjes weg.
//
// Stem: Raoul. Geen em-dashes, claim-vrij, geen tijds- of
// gezondheidsbeloftes.

import type { GenericMailInput, GenericMailTemplate } from "@/lib/freebie-bots/mail-template-types";
import type { Antwoorden } from "./types";
import { berekenThemaScores } from "./score";
import { THEMA_LABELS } from "./vragen";
import { NU_PER_THEMA, HEEN_PER_THEMA } from "./content";

// ============================================================
// HTML-bouwstenen, mail-veilig (inline styles, één kolom)
// ============================================================

const GOUD = "#b8923a";
const DONKER = "#1d1d1f";
const GRIJS = "#6b6b6e";

function omhulsel(binnenkant: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html lang="nl">
<body style="margin:0;padding:0;background:#f5f3ee;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Georgia,'Times New Roman',serif;color:${DONKER};font-size:16px;line-height:1.65;">
    <p style="margin:0 0 24px;letter-spacing:3px;text-transform:uppercase;font-size:11px;color:${GOUD};font-family:Arial,sans-serif;font-weight:bold;">ELEVA · Reset-check</p>
    ${binnenkant}
    <hr style="border:none;border-top:1px solid #e3ddd0;margin:32px 0 16px;" />
    <p style="font-size:12px;color:${GRIJS};font-family:Arial,sans-serif;line-height:1.5;">
      Je ontvangt deze mails omdat je de Reset-check deed en koos voor de extra tips.
      Liever niet meer? <a href="${unsubscribeUrl}" style="color:${GRIJS};">Meld je hier met één klik af</a>, helemaal prima.
    </p>
  </div>
</body>
</html>`;
}

function kop(tekst: string): string {
  return `<h1 style="font-size:22px;line-height:1.35;margin:0 0 20px;font-weight:bold;">${tekst}</h1>`;
}

function p(tekst: string): string {
  return `<p style="margin:0 0 16px;">${tekst}</p>`;
}

function tipKader(tekst: string): string {
  return `<p style="margin:0 0 16px;padding:14px 18px;background:#faf7f0;border-left:3px solid ${GOUD};font-weight:bold;">${tekst}</p>`;
}

function groet(memberVoornaam: string): string {
  return `<p style="margin:24px 0 0;">Groetjes,<br/><strong>${memberVoornaam}</strong></p>`;
}

function knop(url: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${url}" style="display:inline-block;background:${GOUD};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:8px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</a></p>`;
}

/**
 * Gepersonaliseerd future-self-blok voor mail 4: het hoogste thema uit
 * de check terugspiegelen met de nu/heen-frases die de lead ook in de
 * uitslag zag. Hun eigen verlangen, in hun eigen check-taal.
 * Faalt veilig: bij onparseerbare antwoorden een generieke zin.
 */
function futureSelfBlok(antwoorden: unknown): string {
  try {
    const a = antwoorden as Antwoorden;
    if (a && typeof a === "object" && a.scores && a.profiel) {
      const scores = berekenThemaScores(a);
      const hoogste = [...scores].sort((x, y) => y.pct - x.pct)[0];
      if (hoogste && hoogste.pct >= 33) {
        const label = THEMA_LABELS[hoogste.thema]?.toLowerCase() ?? hoogste.thema;
        const nu = NU_PER_THEMA[hoogste.thema];
        const heen = HEEN_PER_THEMA[hoogste.thema];
        if (nu && heen) {
          return p(
            `Even terug naar jouw check. Je sterkste signaal zat op ${label}. Waar je nu staat: <strong>${nu}</strong>. En waar je naartoe wilt: <strong>${heen}</strong>. Dat verschil overbrug je niet met tips, dat schreef ik je al. Wel met een aanpak waarin alles voor je is uitgedacht, en waar je je over een paar maanden dankbaar voor bent.`,
          );
        }
      }
    }
  } catch {
    // val door naar generiek
  }
  return p(
    `In de check gaf je aan waar je naartoe wilt. Hoe je je over een paar maanden voelt, wordt bepaald door wat je déze weken beslist.`,
  );
}

/**
 * Het mini-ELEVA-blok, adaptief:
 * - nog niet binnen geweest → vol introductie-blok (varieert per dag)
 * - al wel binnen geweest   → korte verwijzing (varieert per dag)
 * - geen actieve uitnodiging → niets (geen kapotte beloftes)
 */
function miniElevaBlok(input: GenericMailInput, dag: number): string {
  if (!input.miniElevaUrl) return "";
  // De omgeving-URL kan al query-params hebben (de aanvraag-link), dus
  // bron netjes met ? of & aanhaken.
  const scheiding = input.miniElevaUrl.includes("?") ? "&" : "?";
  const url = `${input.miniElevaUrl}${scheiding}bron=mail-d${dag}`;

  if (input.alInMiniEleva) {
    const kort: Record<number, string> = {
      1: `Je bent al even in je eigen omgeving geweest, leuk! Die blijft gewoon voor je openstaan. Vragen stellen kan daar altijd.`,
      2: `Loop gerust nog eens binnen in je omgeving. De verhalen van mensen die je voorgingen staan er ook.`,
      3: `Je omgeving staat nog steeds voor je klaar. De Mentor daar kan al je vragen aan, dag en nacht.`,
      4: `Nog vragen na deze tip? Je weet je omgeving te vinden, alles mag daar gevraagd worden.`,
      5: `Je omgeving blijft nog even voor je openstaan, ook na deze laatste mail.`,
    };
    return (
      p(kort[dag] ?? kort[5]) +
      knop(url, "Open je omgeving")
    );
  }

  const vol: Record<number, string> = {
    1: `Trouwens: ik heb een eigen omgeving voor je klaargezet. Daar vind je verhalen van mensen die je voorgingen, eerlijke antwoorden op de meestgestelde vragen, en je kunt er alles vragen wat je wilt. Kijk gerust rond, helemaal vrijblijvend.`,
    2: `In je eigen omgeving vind je trouwens ook de verhalen van mensen die je voorgingen. Echte ervaringen, geen marketing. Kijk gerust rond wanneer het jou uitkomt.`,
    3: `Loop je rond met vragen? In je eigen omgeving vind je verhalen van mensen die je voorgingen en eerlijke antwoorden op de meestgestelde vragen. En je kunt er alles vragen wat je wilt. Helemaal vrijblijvend, als het niets voor je is, is dat ook prima.`,
    4: `Wil je eerst nog rustig rondkijken voor je iets beslist? Je eigen omgeving staat voor je klaar, met verhalen, antwoorden en een Mentor die al je vragen aankan.`,
    5: `Je eigen omgeving blijft nog even voor je openstaan, ook na deze laatste mail. Rondkijken kan altijd, op jouw tempo.`,
  };
  return (
    p(vol[dag] ?? vol[1]) +
    knop(url, "Kijk rustig rond in mijn omgeving")
  );
}

// ============================================================
// De 5 mails
// ============================================================

const mail1: GenericMailTemplate = {
  dag: 1,
  onderwerp: "Beloofd is beloofd: je eerste extra tip",
  bouwHtml: (input) =>
    omhulsel(
      kop("Je eerste extra tip") +
        p(`Hoi ${input.leadVoornaam},`) +
        p(
          `Gisteren deed je de Reset-check. Goed dat je dat moment voor jezelf nam, de meeste mensen stellen dat eindeloos uit.`,
        ) +
        p(
          `Ik beloofde je nog een paar tips die niet in je uitslag stonden. Hier is de eerste, en het is meteen degene die bij de meeste mensen het hardste binnenkomt.`,
        ) +
        tipKader(`Je avondeten wordt bepaald door het moment waarop je het beslist.`) +
        p(
          `Om 17:30 beslist niet jij wat je eet. Dan beslist je vermoeide hoofd, en dat kiest altijd voor snel en makkelijk. Dat is geen zwakte hoor, zo werkt een brein na een volle dag gewoon.`,
        ) +
        p(
          `Doe dit: beslis je avondeten 's ochtends, als je hoofd nog fris is. Eén minuut, meer is het niet. 's Avonds hoef je alleen nog uit te voeren wat de uitgeruste versie van jou al had bedacht.`,
        ) +
        p(
          `Probeer het morgen eens. En lukt het? Stuur me gerust een berichtje, ik lees alles zelf.`,
        ) +
        p(
          `Kleine spoiler alvast: dit ene principe, één keer beslissen in plaats van de hele dag onderhandelen met jezelf, is precies waar de Holistic Reset op gebouwd is. Daarover later deze week meer.`,
        ) +
        miniElevaBlok(input, 1) +
        groet(input.memberVoornaam) +
        p(
          `<span style="font-size:14px;color:${GRIJS};">PS: De komende dagen krijg je er nog vier, stuk voor stuk dingen die niet in je uitslag stonden.</span>`,
        ),
      input.unsubscribeUrl,
    ),
};

const mail2: GenericMailTemplate = {
  dag: 2,
  onderwerp: "Verander nog niks",
  bouwHtml: (input) =>
    omhulsel(
      kop("Verander nog niks") +
        p(`Hoi ${input.leadVoornaam},`) +
        p(`Tip twee, en deze is anders dan je verwacht.`) +
        tipKader(`Verander deze week nog helemaal niks. Leg alleen vast wat er nu gebeurt.`) +
        p(
          `Schrijf een week lang op wat je eet en wanneer. Geen oordeel, geen aanpassingen, gewoon noteren. Desnoods met foto's in je telefoon.`,
        ) +
        p(
          `Waarom? Omdat veranderen zonder te weten wat je verandert, gokken is. Iedereen die bij ons aan een traject begint, start met meten. En bijna iedereen zegt achteraf hetzelfde: het eerste echte inzicht kwam niet van een tip, maar van het zien van hun eigen patroon. Niet wát ze aten verraste hen, maar wannéér en waaróm.`,
        ) +
        p(
          `Een week kijken zonder ingrijpen. Het klinkt als niks doen. Het is het eerlijkste begin dat er is.`,
        ) +
        p(
          `En nu ik het toch over meten heb. De mensen die het traject deden en met meten begonnen, vertellen ons achteraf vaak hetzelfde: dat de cijfers na een paar weken een ander verhaal vertelden. Kleding die anders zit, een middag die niet meer inzakt, rustiger wakker worden. Ieder lichaam reageert anders, dus beloftes doe ik je niet. Maar hun verhalen mag je gewoon lezen, die staan in je omgeving.`,
        ) +
        miniElevaBlok(input, 2) +
        groet(input.memberVoornaam),
      input.unsubscribeUrl,
    ),
};

const mail3: GenericMailTemplate = {
  dag: 3,
  onderwerp: "Tijdelijk streng is makkelijker dan voor altijd een beetje",
  bouwHtml: (input) =>
    omhulsel(
      kop("Tijdelijk streng is makkelijker dan voor altijd een beetje") +
        p(`Hoi ${input.leadVoornaam},`) +
        p(`Tip drie is een waarheid die bijna niemand gelooft tot ze 'm ervaren.`) +
        tipKader(`"Een beetje minderen" is het zwaarste dieet dat er bestaat.`) +
        p(
          `Wie een beetje mindert, onderhandelt de hele dag met zichzelf. Mag dit wel, mag dit niet, is één koekje erg, het is tenslotte vrijdag. Honderd kleine beslissingen per dag, en elke beslissing kost kracht.`,
        ) +
        p(
          `Een duidelijk kader met een begin en een eind werkt anders. Even helemaal duidelijk, mét een einddatum. Dan valt er niks te onderhandelen, en juist dat geeft rust.`,
        ) +
        p(
          `Zo is de Holistic Reset ook gebouwd. Geen vaag "let een beetje op": vier duidelijke fasen over 65 dagen. Eerst een korte aanloop, dan drie weken écht duidelijk, dan stap voor stap weer opbouwen, en de laatste drie weken leer je het 80/20-ritme dat je daarna zelf vasthoudt. Je weet elke dag precies waar je aan toe bent.`,
        ) +
        p(
          `En misschien wel het belangrijkste: je doet het niet alleen. We stemmen 'm vooraf samen op jou af, en je hebt het hele traject iemand naast je die het zelf heeft gedaan. Elke fase, elke vraag. Je zit nergens aan vast door erover te praten.`,
        ) +
        miniElevaBlok(input, 3) +
        groet(input.memberVoornaam),
      input.unsubscribeUrl,
    ),
};

const mail4: GenericMailTemplate = {
  dag: 4,
  onderwerp: "Je avond begint 's ochtends",
  bouwHtml: (input) =>
    omhulsel(
      kop("Je avond begint 's ochtends") +
        p(`Hoi ${input.leadVoornaam},`) +
        p(
          `Tip vier is mijn favoriet, omdat 'ie laat zien hoeveel er al vastligt vóór je er erg in hebt.`,
        ) +
        tipKader(`Slecht inslapen los je niet 's avonds op. Je interne klok wordt 's ochtends gezet.`) +
        p(
          `Vijf minuten daglicht, binnen een half uur na het opstaan. Gewoon even buiten, het balkon telt ook. Je lichaam weet dan: dít is het begin van de dag. En het rekent vanaf dat moment zelf uit wanneer de avond hoort te vallen.`,
        ) +
        p(
          `Wat je 's ochtends doet, bepaalt hoe je avond voelt. En eerlijk? Zo werkt het met meer dingen.`,
        ) +
        futureSelfBlok(input.antwoorden) +
        p(
          `Wil je eens kijken wat de Reset in jouw situatie zou betekenen? Stuur me een berichtje, dan stemmen we 'm samen op jou af. En weet je eigenlijk al genoeg en wil je gewoon starten? Zeg het me, dan zet ik alles voor je klaar.`,
        ) +
        miniElevaBlok(input, 4) +
        groet(input.memberVoornaam),
      input.unsubscribeUrl,
    ),
};

const mail5: GenericMailTemplate = {
  dag: 5,
  onderwerp: "De laatste tip (en daarna iets eerlijks)",
  bouwHtml: (input) =>
    omhulsel(
      kop("De laatste tip, en daarna iets eerlijks") +
        p(`Hoi ${input.leadVoornaam},`) +
        p(`De laatste van de vijf.`) +
        tipKader(`Je maandag-moeheid komt niet van maandag.`) +
        p(
          `Wie doordeweeks om 6:45 opstaat en zondag om 9:30, geeft zijn lichaam elk weekend een mini-jetlag. Die voel je niet op zondag. Die voel je op maandag en dinsdag. Sta elke dag binnen een uur van dezelfde tijd op, ook in het weekend. Saai? Misschien. Maar je ritme vindt zichzelf verrassend snel terug.`,
        ) +
        p(`En nu iets eerlijks.`) +
        p(
          `Dit was tip vijf. Maar tips waren nooit jouw probleem. Je wist er al genoeg toen je de check deed. De mensen die het traject doen weten niet méér dan jij. Ze hebben één ding anders gedaan: één keer beslissen, zodat ze het niet elke dag opnieuw hoeven te doen.`,
        ) +
        p(
          `Over drie maanden ben je hoe dan ook drie maanden verder. De enige vraag is of je dan op dezelfde plek staat, of ergens anders.`,
        ) +
        p(
          `Dit is mijn laatste mail in deze reeks, hierna laat ik je met rust. De deur blijft gewoon open. Wil je het gesprek? Stuur me een berichtje, dan kijken we samen of de Reset bij jou past. En is het antwoord nee, of nu even niet? Ook helemaal prima 🥰`,
        ) +
        miniElevaBlok(input, 5) +
        groet(input.memberVoornaam),
      input.unsubscribeUrl,
    ),
};

const ALLE_MAILS: GenericMailTemplate[] = [mail1, mail2, mail3, mail4, mail5];

export function resetCheckTemplateVoorDag(
  dag: number,
): GenericMailTemplate | null {
  return ALLE_MAILS.find((m) => m.dag === dag) ?? null;
}
