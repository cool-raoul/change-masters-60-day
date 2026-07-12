// Plaatst de YouTube-uitlegvideo's van De Resetcode op de juiste
// video-plekken in de klantomgeving (pagina_blokken, type video,
// namespace resetcode-klant). Mapping gecontroleerd tegen de
// transcripties in docs/resetcode/ (09 t/m 16). Idempotent op titel.
//
// Gebruik: node scripts/plaats-resetcode-videos.cjs

const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function leesEnv(key) {
  if (process.env[key]) return process.env[key];
  const txt = fs.readFileSync(".env.local", "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      return v;
    }
  }
  return undefined;
}

const NAMESPACE = "resetcode-klant";

// Aangeleverd door Raoul, 12 juli 2026. Afgestemd op de transcripties:
// opstart = transcript 09 (welkom + schema-uitleg, dus ook bij Jouw start),
// tips = 10, dag 10 = 11, twee vragen = 12, fase 1-4 = 13-16.
const VIDEOS = [
  { programma: "darm", positie: "start-video", titel: "Welkom & opstart Darmen in Balans", url: "https://www.youtube.com/watch?v=DwbxNLZY4aI" },
  { programma: "darm", positie: "zestien-dagen-video", titel: "Opstart-video (deel 1)", url: "https://www.youtube.com/watch?v=DwbxNLZY4aI" },
  { programma: "darm", positie: "zestien-dagen-video", titel: "Tips & tricks", url: "https://www.youtube.com/watch?v=wHGJgPW2qNA" },
  { programma: "darm", positie: "zestien-dagen-video", titel: "Dag 10-video (kijk rond dag 10)", url: "https://www.youtube.com/watch?v=LWry7B31uz4" },
  { programma: "reset", positie: "voorbereiding-video", titel: "De twee belangrijke vragen", url: "https://www.youtube.com/watch?v=FU6-31fsJg4" },
  { programma: "reset", positie: "laaddagen-video", titel: "Fase 1: de laaddagen", url: "https://www.youtube.com/watch?v=4sQtZM88dIo" },
  { programma: "reset", positie: "omschakeling-video", titel: "Fase 2: de omschakeling", url: "https://www.youtube.com/watch?v=hm7af1GqlaQ" },
  { programma: "reset", positie: "stabilisatie-video", titel: "Fase 3: de stabilisatie", url: "https://www.youtube.com/watch?v=APLwrjN_wjI" },
  { programma: "reset", positie: "logisch-leven-video", titel: "Fase 4: Logisch Leven", url: "https://www.youtube.com/watch?v=3QtnpBqr7dU" },
];

async function main() {
  const url = leesEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = leesEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase env ontbreekt");
  const supabase = createClient(url, key);

  let geplaatst = 0, overgeslagen = 0, fouten = 0;
  for (const v of VIDEOS) {
    const label = `${v.programma}/${v.positie} ← ${v.titel}`;
    const { data: bestaand } = await supabase
      .from("pagina_blokken")
      .select("id, inhoud")
      .eq("pagina_namespace", NAMESPACE)
      .eq("pagina_id", v.programma)
      .eq("positie", v.positie);
    if ((bestaand ?? []).some((b) => b.inhoud && b.inhoud.titel === v.titel)) {
      console.log(`overslaan (bestaat al): ${label}`);
      overgeslagen++;
      continue;
    }
    const { data: hoogste } = await supabase
      .from("pagina_blokken")
      .select("volgorde")
      .eq("pagina_namespace", NAMESPACE)
      .eq("pagina_id", v.programma)
      .eq("positie", v.positie)
      .order("volgorde", { ascending: false })
      .limit(1);
    const volgorde = hoogste && hoogste.length ? hoogste[0].volgorde + 1 : 0;
    const { error } = await supabase.from("pagina_blokken").insert({
      pagina_namespace: NAMESPACE,
      pagina_id: v.programma,
      positie: v.positie,
      volgorde,
      type: "video",
      inhoud: { url: v.url, titel: v.titel, bron: "youtube" },
      storage_pad: null,
    });
    if (error) {
      console.error(`MISLUKT: ${label} → ${error.message}`);
      fouten++;
      continue;
    }
    console.log(`geplaatst: ${label}`);
    geplaatst++;
  }
  console.log(`\nKlaar: ${geplaatst} geplaatst, ${overgeslagen} overgeslagen, ${fouten} fouten.`);
  if (fouten > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
