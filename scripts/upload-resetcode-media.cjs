// Plaatst de Resetcode-PDF's uit Raouls Downloads-map op de juiste
// media-plekken van de klantomgeving (bucket pagina-media + rijen in
// pagina_blokken, namespace resetcode-klant). Idempotent: bestaat er in
// een positie al een blok met dezelfde titel, dan wordt die overgeslagen.
//
// Gebruik: node scripts/upload-resetcode-media.cjs [--bron <map>]

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

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

const BRON =
  process.argv.includes("--bron")
    ? process.argv[process.argv.indexOf("--bron") + 1]
    : "C:/Users/raoul/Downloads";

const NAMESPACE = "resetcode-klant";

// bestand → plek(ken). paginaId = programma-slug, positie = station-docs.
const PLAATSING = [
  { bestand: "extra benodigdheden.pdf", programma: "darm", positie: "start-docs", titel: "Benodigdheden en boodschappenlijstje" },
  { bestand: "meet en weegschema.pdf", programma: "darm", positie: "start-docs", titel: "Meet- en weegschema" },
  { bestand: "darmen in balans.pdf", programma: "darm", positie: "zestien-dagen-docs", titel: "Darmen in Balans programmaboekje + innameschema" },
  { bestand: "recepten darmen in balans.pdf", programma: "darm", positie: "zestien-dagen-docs", titel: "Receptenboekje 16-daagse darmkuur" },
  { bestand: "Lifeplus groene smoothies v2.pdf", programma: "darm", positie: "zestien-dagen-docs", titel: "Groene smoothies" },

  { bestand: "holistic reset.pdf", programma: "reset", positie: "voorbereiding-docs", titel: "Resetboekje (3.0)" },
  { bestand: "extra benodigdheden.pdf", programma: "reset", positie: "voorbereiding-docs", titel: "Benodigdheden en boodschappenlijstje" },
  { bestand: "meet en weegschema.pdf", programma: "reset", positie: "voorbereiding-docs", titel: "Meet- en weegschema" },
  { bestand: "laadtips.pdf", programma: "reset", positie: "voorbereiding-docs", titel: "Laadtips (alvast voor fase 1)" },
  { bestand: "laadtips.pdf", programma: "reset", positie: "laaddagen-docs", titel: "Laadtips" },
  { bestand: "laaddagen tips.pdf", programma: "reset", positie: "laaddagen-docs", titel: "Laaddagen-tips (extra)" },
  { bestand: "recepten fase 2 en 3.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Recepten fase 2 en 3" },
  { bestand: "Kuur_Vegetarier met recepten_20170409.pdf · versie 1.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Vegetarisch: weekmenu en recepten fase 2" },
  { bestand: "vegan.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Vegan: weekmenu fase 2" },
  { bestand: "Meest gestelde vragen tijdens reset -1-.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Meest gestelde vragen tijdens de reset" },
  { bestand: "Gezondheidsreset met sporten.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Reset en sporten" },
  { bestand: "Lifeplus groene smoothies v2.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Groene smoothies" },
  { bestand: "BE lijn Producten.pdf", programma: "reset", positie: "omschakeling-docs", titel: "BE-lijn producten (bij sporten)" },
  { bestand: "DBB smoothies.pdf", programma: "reset", positie: "omschakeling-docs", titel: "Shake-recepten (bij sporten)" },
  { bestand: "recepten fase 3.pdf", programma: "reset", positie: "stabilisatie-docs", titel: "Recepten fase 3 (receptenboek)" },
  { bestand: "recepten fase 2 en 3.pdf", programma: "reset", positie: "stabilisatie-docs", titel: "Recepten fase 2 en 3" },
  { bestand: "uitleg haverzemelen.pdf", programma: "reset", positie: "stabilisatie-docs", titel: "Uitleg haverzemelen" },
  { bestand: "recepten haverzemelen.pdf", programma: "reset", positie: "stabilisatie-docs", titel: "Haverkuur-recepten" },

  { bestand: "DBB smoothies.pdf", programma: "producten", positie: "start-docs", titel: "Shake-recepten (Daily BioBasics)" },
  { bestand: "Lifeplus groene smoothies v2.pdf", programma: "producten", positie: "start-docs", titel: "Groene smoothies" },
  { bestand: "BE lijn Producten.pdf", programma: "producten", positie: "start-docs", titel: "BE-lijn producten (sport)" },
];

async function main() {
  const url = leesEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = leesEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase env ontbreekt");
  const supabase = createClient(url, key);

  let geplaatst = 0, overgeslagen = 0, fouten = 0;

  for (const plek of PLAATSING) {
    const label = `${plek.programma}/${plek.positie} ← ${plek.bestand}`;
    const pad = path.join(BRON, plek.bestand);
    if (!fs.existsSync(pad)) {
      console.error(`ONTBREEKT: ${pad}`);
      fouten++;
      continue;
    }

    // Idempotent: zelfde titel al in deze positie? Overslaan.
    const { data: bestaand } = await supabase
      .from("pagina_blokken")
      .select("id, inhoud")
      .eq("pagina_namespace", NAMESPACE)
      .eq("pagina_id", plek.programma)
      .eq("positie", plek.positie);
    if ((bestaand ?? []).some((b) => b.inhoud && b.inhoud.titel === plek.titel)) {
      console.log(`overslaan (bestaat al): ${label}`);
      overgeslagen++;
      continue;
    }

    const buffer = fs.readFileSync(pad);
    const storagePad = `${NAMESPACE}/${plek.programma}/${crypto.randomUUID()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("pagina-media")
      .upload(storagePad, buffer, { contentType: "application/pdf", upsert: false });
    if (upErr) {
      console.error(`UPLOAD MISLUKT: ${label} → ${upErr.message}`);
      fouten++;
      continue;
    }

    const { data: hoogste } = await supabase
      .from("pagina_blokken")
      .select("volgorde")
      .eq("pagina_namespace", NAMESPACE)
      .eq("pagina_id", plek.programma)
      .eq("positie", plek.positie)
      .order("volgorde", { ascending: false })
      .limit(1);
    const volgorde = hoogste && hoogste.length ? hoogste[0].volgorde + 1 : 0;

    const { error: insErr } = await supabase.from("pagina_blokken").insert({
      pagina_namespace: NAMESPACE,
      pagina_id: plek.programma,
      positie: plek.positie,
      volgorde,
      type: "pdf",
      inhoud: { titel: plek.titel, bestandsnaam: plek.bestand },
      storage_pad: storagePad,
    });
    if (insErr) {
      console.error(`INSERT MISLUKT: ${label} → ${insErr.message}`);
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
