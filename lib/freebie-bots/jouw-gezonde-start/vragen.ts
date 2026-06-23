// Doel-vraag + afval-wens voor "Jouw gezonde start", plus de claimvrije
// tekstfragmenten per doel waarmee de verhalende uitkomst zich vormt.

export type DoelId =
  | "energie"
  | "afvallen"
  | "slapen"
  | "rust"
  | "fitter"
  | "helderder"
  | "sporten"
  | "libido"
  | "huid"
  | "anders";

export const DOEL_OPTIES: { id: DoelId; label: string }[] = [
  { id: "energie", label: "Meer energie" },
  { id: "afvallen", label: "Afvallen" },
  { id: "slapen", label: "Beter slapen" },
  { id: "rust", label: "Meer innerlijke rust en balans" },
  { id: "fitter", label: "Fitter en sterker" },
  { id: "helderder", label: "Helderder kunnen denken" },
  { id: "sporten", label: "Meer zin om te sporten" },
  { id: "libido", label: "Meer libido" },
  { id: "huid", label: "Je huid verbeteren" },
  { id: "anders", label: "Iets anders" },
];

// Hoeveel iemand wil afvallen → routeert het advies (tot ~3 kg kan met een
// darm-programma, 5 kg of meer → de Reset is dan de weg).
export type AfvalId = "tot2" | "drie_vijf" | "vijf_tien" | "tien_plus";

export const AFVAL_OPTIES: { id: AfvalId; label: string }[] = [
  { id: "tot2", label: "Tot een paar kilo" },
  { id: "drie_vijf", label: "Zo'n 3 tot 5 kilo" },
  { id: "vijf_tien", label: "5 tot 10 kilo" },
  { id: "tien_plus", label: "Meer dan 10 kilo" },
];

export function afvalVraagtReset(afval?: AfvalId | null): boolean {
  return afval === "vijf_tien" || afval === "tien_plus";
}

// Claimvrij "waar je naar verlangt" per doel (gevoel, geen belofte).
export const DOEL_VERLANGEN: Record<DoelId, string> = {
  energie: "weer energie die de hele dag meegaat",
  afvallen: "je lichaam lichter voelen, je kleding die losser gaat zitten",
  slapen: "rustiger slapen en frisser wakker worden",
  rust: "meer rust in je hoofd, een gevoel dat het minder vol zit",
  fitter: "fitter en sterker in je lijf staan",
  helderder: "helderder en scherper kunnen denken",
  sporten: "weer veerkracht en zin om te bewegen",
  libido: "je weer meer in balans en in je vuur voelen",
  huid: "een huid die frisser oogt en straalt",
  anders: "je weer meer jezelf voelen",
};

// Claimvrij "wat veel mensen ervaren" per doel (social proof, geen claim).
export const DOEL_ASPIRATIE: Record<DoelId, string> = {
  energie: "energieker en alerter door de dag",
  afvallen: "lichter en strakker in hun lijf",
  slapen: "dieper slapen en met meer rust wakker worden",
  rust: "rustiger vanbinnen, met meer ruimte in hun hoofd",
  fitter: "sterker en veerkrachtiger",
  helderder: "helderder en scherper",
  sporten: "meer zin en gemak om te bewegen",
  libido: "meer in balans en weer meer zichzelf",
  huid: "frisser, met een huid die meer straalt",
  anders: "lichter en meer in balans",
};

// Investerings-bereidheid → bepaalt mede of een lead warm, lauw of koud is
// (zelfde idee als de reset-check). Eerlijk antwoord stuurt de opvolging.
export type InvesteringId = "nee" | "misschien" | "altijd";

export const INVESTERING_OPTIES: { id: InvesteringId; label: string }[] = [
  { id: "nee", label: "Nee, op dit moment nog niet" },
  { id: "misschien", label: "Misschien, het hangt er een beetje van af" },
  { id: "altijd", label: "Ja, dat doe ik sowieso al voor mezelf 🌱" },
];

export const INVESTERING_LABEL: Record<InvesteringId, string> = {
  nee: "nu nog niet",
  misschien: "misschien, hangt ervan af",
  altijd: "ja, doet dat al voor zichzelf",
};
