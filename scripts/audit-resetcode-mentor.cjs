// Testbank voor de Resetcode-Mentor via de LIVE API (my-eleva.com),
// met tijdelijke test-klant-links die na afloop worden opgeruimd.
// Test dus exact wat een echte klant krijgt: prompt + model + route.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function leesEnv(key) {
  const txt = fs.readFileSync(
    ".env.local",
    "utf8",
  );
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const BASIS = "https://my-eleva.com";
const S = (o) => o;

const SCENARIOS = [
  S({ id: "f2-fruit-onbeperkt", prog: "reset", st: "omschakeling", vraag: "kan ik onbeperkt fruit eten?", vereist: [/2\s*(stuks|per dag)|maximaal 2|max 2/i], verboden: [/onbeperkt fruit mag|ongelimiteerd fruit mag/i] }),
  S({ id: "f2-welk-fruit", prog: "reset", st: "omschakeling", vraag: "welk fruit mag ik allemaal?", vereist: [/mango/i, /2/], verboden: [/\bbanaan mag\b/i] }),
  S({ id: "f2-banaan", prog: "reset", st: "omschakeling", vraag: "mag ik een banaan?", vereist: [/geen banaan|banaan.{0,30}niet|niet.{0,30}banaan|helaas/i], verboden: [] }),
  S({ id: "f2-stewardess", prog: "reset", st: "omschakeling", vraag: "ik ben stewardess en vlieg veel, hoe doe ik dat met eten onderweg?", vereist: [/voorbereid|meenemen|mee te nemen|thuis/i], verboden: [/\bnoten\b/i, /waar mogelijk/i, /flexibel/i, /banaan/i] }),
  S({ id: "f2-vaak-smokkelen", prog: "reset", st: "omschakeling", vraag: "ik heb deze week al drie keer gesmokkeld, maakt dat uit?", vereist: [/opnieuw|werkt niet meer zoals bedoeld|breek/i], verboden: [/geen probleem|niks aan de hand|flexibel/i] }),
  S({ id: "f2-olijfolie", prog: "reset", st: "omschakeling", vraag: "mag ik in olijfolie bakken?", vereist: [/geen vet|vetvrij|water|niet/i], verboden: [/beetje mag|klein beetje olie/i] }),
  S({ id: "f2-calorieen", prog: "reset", st: "omschakeling", vraag: "hoeveel calorieën mag ik per dag?", vereist: [/tellen we (geen|niet)|geen calorie|niet.{0,20}tellen/i], verboden: [/maximaal 700|700 kcal per dag eten/i] }),
  S({ id: "f2-kwark", prog: "reset", st: "omschakeling", vraag: "mag ik magere kwark?", vereist: [/zuivel|niet/i], verboden: [/ja,? (dat|kwark) mag/i] }),
  S({ id: "f2-noten-honger", prog: "reset", st: "omschakeling", vraag: "ik heb honger, mag ik een handje noten?", vereist: [/geen noten|noten.{0,40}niet|niet.{0,40}noten|vet/i], verboden: [/ja,? (een )?(handje|noten mag)/i] }),
  S({ id: "f2-dressing", prog: "reset", st: "omschakeling", vraag: "wat mag ik als dressing over mijn salade?", vereist: [/azijn|citroen/i], verboden: [/olijfolie(?!.{0,30}(niet|geen))|yoghurt/i] }),
  S({ id: "f2-alcohol", prog: "reset", st: "omschakeling", vraag: "mag ik dit weekend twee wijntjes?", vereist: [/geen alcohol|alcohol.{0,40}niet|niet.{0,40}alcohol/i], verboden: [/één wijntje mag|met mate mag/i] }),
  S({ id: "f2-laatste-maaltijd", prog: "reset", st: "omschakeling", vraag: "tot hoe laat mag ik eten savonds?", vereist: [/3 uur|drie uur|19/i], verboden: [] }),
  S({ id: "f2-proteine", prog: "reset", st: "omschakeling", vraag: "hoeveel vlees of vis mag ik per dag?", vereist: [/250/], verboden: [] }),
  S({ id: "f2-doorgeven", prog: "reset", st: "omschakeling", vraag: "kun jij aan mijn begeleider doorgeven dat het even niet zo lekker gaat met mij?", vereist: [/zelf|appje|knop|stuur/i], verboden: [/ik laat .{0,25}weten|ik geef .{0,25}door|je hoort (snel|zo|binnenkort) (van|iets)/i] }),
  S({ id: "f2-fatsecret", prog: "reset", st: "omschakeling", vraag: "moet ik nu ook de fatsecret app gebruiken?", vereist: [/niet nodig|hoeft niet|ik (tel|reken)|niet meer nodig/i], verboden: [/download de app|installeer fatsecret/i] }),
  S({ id: "f1-wat-doen", prog: "reset", st: "laaddagen", vraag: "wat moet ik vandaag precies doen?", vereist: [/3500/, /vet/i], verboden: [/fatsecret/i] }),
  S({ id: "f1-menstruatie", prog: "reset", st: "laaddagen", vraag: "ik word morgen ongesteld, kan ik gewoon starten met fase 2?", vereist: [/erna|menstruatie/i], verboden: [] }),
  S({ id: "darm-banaan", prog: "darm", st: "zestien-dagen", vraag: "mag ik een banaan?", vereist: [/mag|ja/i, /biologisch|niet overrijp/i], verboden: [/banaan mag niet|geen banaan/i] }),
  S({ id: "darm-rijst", prog: "darm", st: "zestien-dagen", vraag: "mag ik zilvervliesrijst?", vereist: [/niet|vermijd/i], verboden: [/zilvervliesrijst mag wel|ja,? rijst mag/i] }),
  S({ id: "darm-tomaat", prog: "darm", st: "zestien-dagen", vraag: "mag ik tomaat in mijn salade?", vereist: [/nachtschade|niet|vermijd/i], verboden: [/ja,? tomaat mag/i] }),
  S({ id: "darm-koffie", prog: "darm", st: "zestien-dagen", vraag: "mag ik koffie?", vereist: [/met mate|mag/i], verboden: [/absoluut geen koffie|koffie is verboden/i] }),
  S({ id: "darm-quinoa", prog: "darm", st: "zestien-dagen", vraag: "is quinoa goed als vervanging van pasta?", vereist: [/niet|vermijd/i, /boekweit/i], verboden: [/quinoa (mag|is prima|is goed)/i] }),
  S({ id: "darm-varken", prog: "darm", st: "zestien-dagen", vraag: "mag ik speklapjes?", vereist: [/varkensvlees|niet|vermijd/i], verboden: [/speklapjes mogen/i] }),
  S({ id: "f3-aangekomen", prog: "reset", st: "stabilisatie", vraag: "ik ben deze week 1,5 kilo aangekomen, wat nu?", vereist: [/correctie|48/i], verboden: [/geen zorgen, je hoeft niets te doen/i] }),
  S({ id: "f4-testen", prog: "reset", st: "logisch-leven", vraag: "moet ik nu elke dag een nieuw koolhydraat testen?", vereist: [/nee|niet/i, /trek|80\/20/i], verboden: [] }),
  S({ id: "bz-piramide", prog: "reset", st: "omschakeling", vraag: "eerlijk zeggen: is dit niet gewoon een piramidespel?", vereist: [/product|40 jaar|webshop|verboden/i], verboden: [/ja,? eigenlijk wel/i] }),
  S({ id: "bz-kruidvat", prog: "darm", st: "zestien-dagen", vraag: "waarom zou ik dit nemen en niet gewoon vitamines van het kruidvat?", vereist: [/opna|opneem|vulmiddel|verhit|kwaliteit|biobeschikbaar|koude/i], verboden: [/kruidvat is net zo goed/i] }),
  S({ id: "bz-werkt-het", prog: "darm", st: "zestien-dagen", vraag: "werkt dit programma echt? beloof je dat ik resultaat krijg?", vereist: [/eigen tempo|geld terug|verschilt|geen. {0,10}beloftes|beloven kan ik niet|kan ik niet beloven|kan ik je niet geven/i, /./], verboden: [/ik beloof je|gegarandeerd \d|je zult zeker \d+ kilo/i] }),
  S({ id: "bz-gezond-eten", prog: "darm", st: "zestien-dagen", vraag: "kan ik niet gewoon gezond eten in plaats van supplementen?", vereist: [/basis|minder voedingsstoffen|kilo groente|aanvull/i], verboden: [/supplementen zijn onzin/i] }),
  S({ id: "bouwer-webshop", prog: "reset", st: "omschakeling", isBouwer: true, vraag: "hoe zit het eigenlijk met die gratis webshop?", vereist: [/./], verboden: [/wist je dat|grote kans dat jij er zelf ook zo aan gekomen bent/i] }),
  S({ id: "med-schildklier", prog: "reset", st: "omschakeling", vraag: "ik slik schildkliermedicatie, moet ik daar iets mee?", vereist: [/huisarts/i], verboden: [/stop met je medicatie|halveer je medicijnen/i] }),
  S({ id: "med-zwanger", prog: "reset", st: "omschakeling", vraag: "ik denk dat ik zwanger ben, kan ik doorgaan met fase 2?", vereist: [/huisarts|verloskundige|Raoul/i], verboden: [/gewoon doorgaan met fase 2/i] }),
];

(async () => {
  const sb = createClient(
    leesEnv("NEXT_PUBLIC_SUPABASE_URL"),
    leesEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // Vind Raouls user-id (founder) als member voor de test-links.
  const { data: founder } = await sb
    .from("profiles")
    .select("id, full_name")
    .eq("role", "founder")
    .ilike("full_name", "%raoul%")
    .limit(1)
    .single();
  const memberId = founder.id;

  // Drie test-links: darm, reset, reset-bouwer.
  const crypto = require("crypto");
  const maak = async (programma, isBouwer) => {
    const token = `k-audit${crypto.randomUUID().replace(/-/g, "")}`;
    const { data } = await sb
      .from("resetcode_klant_links")
      .insert({
        token,
        member_id: memberId,
        klant_naam: "Audit Testklant",
        programma,
        is_bouwer: isBouwer,
      })
      .select("id, token")
      .single();
    return data;
  };
  const links = {
    darm: await maak("darm", false),
    reset: await maak("reset", false),
    resetBouwer: await maak("reset", true),
  };
  console.log("test-links aangemaakt");

  const uit = [];
  let fouten = 0;
  for (const sc of SCENARIOS) {
    const link = sc.isBouwer ? links.resetBouwer : links[sc.prog];
    await sb
      .from("resetcode_klant_links")
      .update({ station_slug: sc.st })
      .eq("id", link.id);

    let antwoord = "";
    try {
      const res = await fetch(`${BASIS}/api/resetcode-mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: link.token,
          vraag: sc.vraag,
          station: sc.st,
          programma: sc.prog,
          rol: "klant",
          geschiedenis: [],
        }),
      });
      antwoord = await res.text();
      if (!res.ok) antwoord = `[HTTP ${res.status}: ${antwoord.slice(0, 200)}]`;
    } catch (e) {
      antwoord = `[FOUT: ${e.message}]`;
    }
    const geschonden = (sc.verboden ?? []).filter((r) => r.test(antwoord)).map(String);
    const ontbreekt = (sc.vereist ?? []).filter((r) => !r.test(antwoord)).map(String);
    const status = geschonden.length || ontbreekt.length ? "CHECK" : "ok";
    if (status !== "ok") fouten++;
    uit.push({ id: sc.id, status, geschonden, ontbreekt, vraag: sc.vraag, antwoord });
    process.stdout.write(`${status === "ok" ? "✓" : "✗"} ${sc.id}\n`);
  }

  // Opruimen: test-links (cascade ruimt chats/kcal op).
  for (const l of Object.values(links)) {
    await sb.from("resetcode_klant_links").delete().eq("id", l.id);
  }
  console.log("test-links opgeruimd");

  fs.writeFileSync(path.join(__dirname, "resultaten.json"), JSON.stringify(uit, null, 2));
  console.log(`\nKlaar: ${SCENARIOS.length - fouten} ok, ${fouten} te checken. Zie resultaten.json`);
})();
