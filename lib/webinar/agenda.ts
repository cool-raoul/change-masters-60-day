// ============================================================
// "Zet in mijn agenda" voor een gekozen kijkmoment.
//
// Drie routes, want mensen gebruiken van alles:
//   Google Agenda  → kant-en-klare link
//   Outlook (web)  → kant-en-klare link
//   Apple + de rest → .ics-bestand, en dáár zetten we ook echt een
//                     herinnering in (VALARM). Google en Outlook laten
//                     via een link geen herinnering toe; die gebruiken
//                     de standaardinstelling van de agenda zelf.
// ============================================================

/** 20260731T183000Z, het formaat dat agenda's willen. */
export function agendaTijd(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eindTijd(startIso: string, duurMinuten: number): string {
  return agendaTijd(
    new Date(Date.parse(startIso) + duurMinuten * 60_000).toISOString(),
  );
}

export function googleAgendaUrl(opts: {
  titel: string;
  startIso: string;
  duurMinuten: number;
  kijkUrl: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.titel,
    dates: `${agendaTijd(opts.startIso)}/${eindTijd(opts.startIso, opts.duurMinuten)}`,
    details: `Je kijkmoment. Open deze link om te kijken: ${opts.kijkUrl}`,
    location: opts.kijkUrl,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookAgendaUrl(opts: {
  titel: string;
  startIso: string;
  duurMinuten: number;
  kijkUrl: string;
}): string {
  const eind = new Date(
    Date.parse(opts.startIso) + opts.duurMinuten * 60_000,
  ).toISOString();
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: opts.titel,
    startdt: opts.startIso,
    enddt: eind,
    body: `Je kijkmoment. Open deze link om te kijken: ${opts.kijkUrl}`,
    location: opts.kijkUrl,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Het .ics-bestand, inclusief een herinnering 30 minuten vooraf. Werkt
 * in Apple Agenda, Outlook-desktop, Thunderbird en zo ongeveer alles
 * wat agenda's kan openen.
 */
export function bouwIcs(opts: {
  titel: string;
  startIso: string;
  duurMinuten: number;
  kijkUrl: string;
  uid: string;
}): string {
  // Regels afbreken op 75 tekens is netjes volgens de standaard, maar
  // elke agenda die wij tegenkomen leest lange regels prima. Wel
  // escapen we komma's en puntkomma's, anders breekt de parsing.
  const esc = (t: string) =>
    t.replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");
  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ELEVA//Webinar//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@my-eleva.com`,
    `DTSTAMP:${agendaTijd(new Date().toISOString())}`,
    `DTSTART:${agendaTijd(opts.startIso)}`,
    `DTEND:${eindTijd(opts.startIso, opts.duurMinuten)}`,
    `SUMMARY:${esc(opts.titel)}`,
    `DESCRIPTION:${esc(`Je kijkmoment. Open deze link om te kijken: ${opts.kijkUrl}`)}`,
    `URL:${opts.kijkUrl}`,
    `LOCATION:${esc(opts.kijkUrl)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`Over 30 minuten: ${opts.titel}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return regels.join("\r\n");
}
