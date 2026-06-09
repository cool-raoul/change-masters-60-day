// File: scripts/upload-showcase-screenshots.mjs
//
// Upload de gegenereerde public/showcase/*.png bestanden naar
// de pagina-media Supabase bucket en maak pagina_blokken-rijen
// aan voor de juiste posities op /ontdek-eleva.
//
// Run: node scripts/upload-showcase-screenshots.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Mapping: bestand → (positie, titel)
const SCREENSHOTS = [
  {
    bestand: "60-day-run.png",
    positie: "screenshot-sprint",
    titel: "Sprint, 60 Day Run one-pager",
    alt: "ELEVA Sprint, 60 Day Run one-pager met grid van pijlers en mechaniek",
  },
  {
    bestand: "reset-check.png",
    positie: "screenshot-freebies",
    titel: "Holistic Reset-check freebie",
    alt: "Freebie-bot Holistic Reset-check, welkom-pagina met kop, tags en CTA",
  },
  {
    bestand: "leiderschap.png",
    positie: "screenshot-leiderschap",
    titel: "Leiderschap dat opstaat (placeholder)",
    alt: "Visie-feature leiderschap, gradient-card met goud en paars",
  },
  {
    bestand: "klant-zorg.png",
    positie: "screenshot-klant-zorg",
    titel: "Klant-begeleiding (placeholder)",
    alt: "Klant-begeleiding feature met pillen voor stappenplan, klant-Mentor en klantbehoud",
  },
  {
    bestand: "social-media.png",
    positie: "screenshot-social-media",
    titel: "Social Media-ondersteuning (placeholder)",
    alt: "Social Media-feature met quote over claim-vrij denken",
  },
  {
    bestand: "push.png",
    positie: "screenshot-push",
    titel: "Push-meldingen (placeholder)",
    alt: "Telefoon-mockup met vier ELEVA-push-meldingen: nieuwe lead, video kijken, follow-up, team-mijlpaal",
  },
  { bestand: "core.png", positie: "screenshot-core", titel: "Core (placeholder)", alt: "Core dag-tracker met 21-dagen-progress" },
  { bestand: "pro.png", positie: "screenshot-pro", titel: "Pro (placeholder)", alt: "Pro 15-stappen-leerpad" },
  { bestand: "onboarding.png", positie: "screenshot-onboarding", titel: "Onboarding (placeholder)", alt: "Onboarding welkom met 3 modus-keuzes" },
  { bestand: "dmo.png", positie: "screenshot-dmo", titel: "DMO (placeholder)", alt: "DMO 5 bewegingen check-list" },
  { bestand: "mentor.png", positie: "screenshot-mentor", titel: "Mentor (placeholder)", alt: "Mentor chat-interface" },
  { bestand: "namenlijst.png", positie: "screenshot-namenlijst", titel: "Namenlijst (placeholder)", alt: "Pipeline kanban-view" },
  { bestand: "mini-eleva.png", positie: "screenshot-mini-eleva", titel: "Mini-ELEVA (placeholder)", alt: "Welkom met video en 3-way chat" },
  { bestand: "film-tracking.png", positie: "screenshot-film-tracking", titel: "Film-tracking (placeholder)", alt: "Video player met activity feed" },
  { bestand: "scripts.png", positie: "screenshot-scripts", titel: "Scripts (placeholder)", alt: "Script-stack voor 3 fases" },
  { bestand: "academy.png", positie: "screenshot-academy", titel: "Academy (placeholder)", alt: "Audio-player Academy" },
  { bestand: "voice.png", positie: "screenshot-voice", titel: "Voice (placeholder)", alt: "Voice-recording UI" },
  { bestand: "stats.png", positie: "screenshot-stats", titel: "Stats (placeholder)", alt: "Funnel-overzicht" },
  { bestand: "team.png", positie: "screenshot-team", titel: "Team (placeholder)", alt: "TeamBoom visualisatie" },
];

const NAMESPACE = "ontdek-eleva";
const PAGINA_ID = "publiek";

async function upload(item) {
  const lokaal = resolve(ROOT, "public", "showcase", item.bestand);
  let buf;
  try {
    buf = await readFile(lokaal);
  } catch {
    console.log(`⏭  ${item.bestand} niet gevonden, skip`);
    return;
  }

  const storagePad = `${NAMESPACE}/${PAGINA_ID}/${item.bestand}`;

  // Verwijder bestaande pagina_blokken-rij voor deze positie (idempotent)
  await supabase
    .from("pagina_blokken")
    .delete()
    .eq("pagina_namespace", NAMESPACE)
    .eq("pagina_id", PAGINA_ID)
    .eq("positie", item.positie);

  // Upload (overschrijven indien al aanwezig)
  const { error: upErr } = await supabase.storage
    .from("pagina-media")
    .upload(storagePad, buf, {
      contentType: "image/png",
      upsert: true,
    });

  if (upErr) {
    console.error(`❌ Upload faalde voor ${item.bestand}:`, upErr.message);
    return;
  }

  // Insert pagina_blokken-rij
  const { error: insErr } = await supabase.from("pagina_blokken").insert({
    pagina_namespace: NAMESPACE,
    pagina_id: PAGINA_ID,
    positie: item.positie,
    type: "afbeelding",
    inhoud: {
      titel: item.titel,
      alt: item.alt,
    },
    storage_pad: storagePad,
    volgorde: 0,
  });

  if (insErr) {
    console.error(`❌ Blok insert faalde voor ${item.positie}:`, insErr.message);
    return;
  }

  console.log(`✅ ${item.bestand} → ${item.positie}`);
}

for (const item of SCREENSHOTS) {
  await upload(item);
}

console.log("\nKlaar. Open /ontdek-eleva om resultaat te zien.");
