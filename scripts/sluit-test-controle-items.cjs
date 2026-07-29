// Eenmalige opruim-actie (Raoul, 29 juli 2026): de open waakhond-
// controle-items in resetcode_kennis komen vrijwel allemaal uit
// testsessies (22-25 juli) en de oorzaken zijn inmiddels gefixt
// (merknaam-filter, fase-regels, menu-eindcheck). Raoul wil ze niet
// stuk voor stuk hoeven doornemen.
//
// Sluit (status 'afgewezen'): open items met bron='controle' die NIET
// bij een echte klant-link horen (test-links beginnen met "reis";
// items zonder link komen uit de member-coach-testronde).
// Blijft open: alles van echte klanten (zoals de gelatine-vraag van
// een echte klant, 20 juli) en echte teamvragen (bron='klant').
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function leesEnv(key) {
  const txt = fs.readFileSync(".env.local", "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim().replace(/^["']|["']$/g, "");
  }
}

(async () => {
  const sb = createClient(
    leesEnv("NEXT_PUBLIC_SUPABASE_URL"),
    leesEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data: items } = await sb
    .from("resetcode_kennis")
    .select("id, vraag, bron, link_id")
    .eq("status", "open");
  const { data: links } = await sb
    .from("resetcode_klant_links")
    .select("id, token");
  const linkMap = {};
  for (const l of links ?? []) linkMap[l.id] = l;

  const sluiten = [];
  const bewaard = [];
  for (const i of items ?? []) {
    const l = i.link_id ? linkMap[i.link_id] : null;
    const echteKlant = l && !l.token.startsWith("reis");
    if (i.bron === "controle" && !echteKlant) sluiten.push(i.id);
    else bewaard.push(`${i.bron}: ${i.vraag.slice(0, 90)}`);
  }
  console.log("Te sluiten:", sluiten.length, "| Blijft open:", bewaard.length);
  for (const v of bewaard) console.log("  OPEN >", v);

  if (sluiten.length) {
    const { error } = await sb
      .from("resetcode_kennis")
      .update({ status: "afgewezen" })
      .in("id", sluiten);
    if (error) {
      console.error("FOUT:", error.message);
      process.exit(1);
    }
    console.log("Afgesloten:", sluiten.length, "test-controle-items");
  }

  const { count } = await sb
    .from("resetcode_kennis")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  console.log("Open na opruimen:", count);
})();
