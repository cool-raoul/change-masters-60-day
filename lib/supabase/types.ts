export type PipelineFase =
  | "prospect"
  | "uitgenodigd"
  | "one_pager"
  | "presentatie"
  | "followup"
  | "not_yet"
  | "shopper"
  | "member";

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
  // Gebundelde dagelijkse herinneringspush — live-pushes staan hier los van.
  dagelijkse_push_uur?: number; // 0-23, default 7
  tijdzone?: string; // IANA tz, default "Europe/Amsterdam"
  dagelijkse_push_aan?: boolean; // default true
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
  beroep: string | null;
  ingezette_tools: string[];
  notities: string | null;
  pipeline_fase: PipelineFase;
  pipeline_volgorde: number;
  bron: string | null;
  prioriteit: "hoog" | "normaal" | "laag";
  laatste_contact: string | null;
  volgende_actie_datum: string | null;
  volgende_actie_notitie: string | null;
  gearchiveerd: boolean;
  actief: boolean;
  gekoppelde_user_id: string | null;
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

export type VideoCategorie = "training" | "motivatie" | "testimoniaal" | "systeem";

export interface Video {
  id: string;
  titel: string;
  beschrijving: string | null;
  categorie: VideoCategorie;
  thumbnail_url: string | null;
  youtube_url: string | null;
  vimeo_url: string | null;
  supabase_storage_path: string | null;
  beschikbaar_vanaf: string | null;
  beschikbaar_tot: string | null;
  duratie_seconden: number | null;
  leider_id: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoView {
  id: string;
  video_id: string;
  viewer_id: string;
  seconds_watched: number;
  max_seconds_reached: number;
  watched_percentage: number;
  is_completed: boolean;
  first_viewed_at: string;
  last_viewed_at: string;
  video?: Video;
}

export interface VideoCoManager {
  id: string;
  leider_id: string;
  manager_id: string;
  kan_uploaden: boolean;
  kan_bewerken: boolean;
  kan_verwijderen: boolean;
  kan_publiceren: boolean;
  toegevoegd_op: string;
}

export interface OnboardingVoortgang {
  id: string;
  user_id: string;
  stap_1_welkom: boolean;
  stap_2_run: boolean;
  stap_3_namen: boolean;
  stap_4_script: boolean;
  stap_5_doelen: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberBestellink {
  id: string;
  user_id: string;
  /**
   * Stable key voor pakket-lookup. Pre-defined keys staan in pakketten.ts:
   *   - {categorie}-{niveau} (18 stuks, bijv. "energie-focus-essential")
   *   - reset-darmen-basis, reset-darmen-plus, reset-60day-opstart,
   *     reset-holistic-m12, reset-holistic-m3
   * Custom keys zijn vrij te kiezen door de member als is_custom = true.
   */
  pakket_key: string;
  /** Korte naam van het pakket zoals member 't onthoudt. */
  label: string;
  /** Lifeplus webshop-URL met gevuld winkelwagentje. */
  url: string;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductadviesTestStatus = "verstuurd" | "ingevuld" | "verlopen";

export interface ProductadviesTest {
  id: string;
  /** Geheime token in de URL voor de prospect. */
  token: string;
  member_id: string;
  prospect_id: string | null;
  /** "ja" / "nee" / "weet_niet" — antwoord op trigger-vraag 60 Day Run. */
  trigger_60day: string | null;
  /** "vrouw" / "man" / "zeg-niet" — voor productkeuze, geen profilering. */
  geslacht: string | null;
  /**
   * Berekende uitslag (privacy-by-design: GEEN individuele scores per categorie,
   * alleen het eindadvies + opstart-suggestie).
   */
  uitslag: {
    categorie: string;
    categorieLabel: string;
    niveau: string;
    pakket_key: string;
    opstartSuggestie: "geen" | "darmen-in-balans" | "holistic-reset";
    fallback: boolean;
  } | null;
  avg_akkoord: boolean;
  status: ProductadviesTestStatus;
  ingevuld_op: string | null;
  created_at: string;
  updated_at: string;
}

export const PIPELINE_FASEN: { fase: PipelineFase; label: string; kleur: string; tekstkleur: string }[] = [
  { fase: "prospect", label: "Prospect", kleur: "#3A3A3A", tekstkleur: "#CCCCCC" },
  { fase: "uitgenodigd", label: "Uitgenodigd", kleur: "#1A2A3A", tekstkleur: "#4A9EDB" },
  { fase: "one_pager", label: "One Pager", kleur: "#1A1A3A", tekstkleur: "#7A6ADB" },
  { fase: "presentatie", label: "Presentatie", kleur: "#2A1A3A", tekstkleur: "#9A6ADB" },
  { fase: "followup", label: "Follow up", kleur: "#2A2A1A", tekstkleur: "#C9A84C" },
  { fase: "member", label: "Member", kleur: "#2A2A0A", tekstkleur: "#E8C96B" },
  { fase: "shopper", label: "Shopper", kleur: "#1A2A1A", tekstkleur: "#4ACB6A" },
  { fase: "not_yet", label: "Not Yet", kleur: "#2A1A1A", tekstkleur: "#DB6A6A" },
];

export const RUN_START_DATUM = new Date("2026-04-12");
