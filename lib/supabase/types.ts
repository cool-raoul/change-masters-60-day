export type PipelineFase =
  | "lead"
  | "uitgenodigd"
  | "presentatie"
  | "followup"
  | "klant"
  | "partner";

export type ContactType =
  | "dm"
  | "bel"
  | "presentatie"
  | "followup"
  | "notitie";

export type HerinneringType =
  | "followup"
  | "product_herbestelling"
  | "custom";

export type GebruikersRol = "leider" | "lid";

export type Taal = "nl" | "en" | "fr" | "es" | "de" | "pt";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: GebruikersRol;
  run_startdatum: string;
  onboarding_klaar: boolean;
  invited_by: string | null;
  taal: Taal;
  created_at: string;
}

export interface WhyProfile {
  id: string;
  user_id: string;
  wie_ben_jij: string | null;
  huidige_situatie: string | null;
  waarom_gestart: string | null;
  financieel_doel_maand: number | null;
  financieel_doel_termijn: number | null;
  beschikbare_uren: number | null;
  korte_termijn_doel: string | null;
  lange_termijn_doel: string | null;
  levensverandering: string | null;
  toekomstvisie: string | null;
  toekomstgevoel: string | null;
  gesprek_transcript: ChatBericht[] | null;
  why_samenvatting: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  user_id: string;
  volledige_naam: string;
  telefoon: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  notities: string | null;
  pipeline_fase: PipelineFase;
  bron: string | null;
  prioriteit: "hoog" | "normaal" | "laag";
  laatste_contact: string | null;
  volgende_actie_datum: string | null;
  volgende_actie_notitie: string | null;
  gearchiveerd: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactLog {
  id: string;
  prospect_id: string;
  user_id: string;
  contact_type: ContactType;
  notities: string | null;
  fase_voor: PipelineFase | null;
  fase_na: PipelineFase | null;
  script_gebruikt: string | null;
  created_at: string;
}

export interface ProductBestelling {
  id: string;
  prospect_id: string;
  user_id: string;
  besteldatum: string;
  product_omschrijving: string | null;
  tweede_bestelling_reminder_datum: string;
  reminder_verstuurd: boolean;
  notities: string | null;
  created_at: string;
}

export interface Herinnering {
  id: string;
  user_id: string;
  prospect_id: string | null;
  herinnering_type: HerinneringType;
  titel: string;
  beschrijving: string | null;
  vervaldatum: string;
  verlooptijd: string;
  voltooid: boolean;
  created_at: string;
  prospect?: Prospect;
}

export interface DagelijkseStat {
  id: string;
  user_id: string;
  stat_datum: string;
  contacten_gemaakt: number;
  uitnodigingen: number;
  followups: number;
  presentaties: number;
  nieuwe_partners: number;
  nieuwe_klanten: number;
}

export interface Script {
  id: string;
  titel: string;
  categorie: "uitnodiging" | "bezwaar" | "followup" | "sluiting" | "presentatie";
  pipeline_fase: PipelineFase | null;
  inhoud: string;
  tags: string[];
  sort_order: number;
  is_active: boolean;
}

export interface ChatBericht {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AiGesprek {
  id: string;
  user_id: string;
  prospect_id: string | null;
  titel: string | null;
  berichten: ChatBericht[];
  created_at: string;
  updated_at: string;
  prospect?: Prospect;
}

export const PIPELINE_FASEN: { fase: PipelineFase; label: string; kleur: string; tekstkleur: string }[] = [
  { fase: "lead", label: "Lead", kleur: "#3A3A3A", tekstkleur: "#999999" },
  { fase: "uitgenodigd", label: "Uitgenodigd", kleur: "#1A2A3A", tekstkleur: "#4A9EDB" },
  { fase: "presentatie", label: "Presentatie", kleur: "#2A1A3A", tekstkleur: "#9A6ADB" },
  { fase: "followup", label: "Follow-up", kleur: "#2A2A1A", tekstkleur: "#C9A84C" },
  { fase: "klant", label: "Klant", kleur: "#1A2A1A", tekstkleur: "#4ACB6A" },
  { fase: "partner", label: "Partner", kleur: "#1A2A1A", tekstkleur: "#C9A84C" },
];

export const RUN_START_DATUM = new Date("2026-04-12");
