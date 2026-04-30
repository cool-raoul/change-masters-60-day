// ============================================================
// contacten-reservoir.ts — helpers voor het ELEVA-geheugen.
//
// Twee-laags model:
//   • contacten_reservoir: alle ge-uploade contacten (de voorraadkast)
//   • prospects:           de actieve namenlijst (waar je echt mee werkt)
//
// Member uploadt 1× zijn telefoon-adresboek → reservoir. Daarna kiest
// 'ie stapsgewijs welke contacten geactiveerd worden naar prospects.
// Niet-geactiveerde rows blijven in het reservoir voor later.
//
// Dit bestand bundelt alle DB-operaties zodat zowel VCardUploader
// (in de vandaag-flow) als ReservoirKiezer (op /namenlijst) hetzelfde
// gedrag delen — en dedup-logica niet 2× wordt geschreven.
// ============================================================

import { createClient } from "@/lib/supabase/client";

export type ReservoirContact = {
  naam: string;
  telefoon: string | null;
};

export type ReservoirRow = {
  id: string;
  volledige_naam: string;
  telefoon: string | null;
  bron: string;
  geactiveerd: boolean;
  prospect_id: string | null;
  created_at: string;
};

function maakKey(naam: string, telefoon: string | null | undefined): string {
  return `${naam.trim().toLowerCase()}|${(telefoon ?? "").trim()}`;
}

// ============================================================
// 1. Schrijf contacten naar reservoir (dedup binnen reservoir).
//
// Geactiveerd=false. Geen prospects worden aangeraakt. Geeft terug
// hoeveel er nieuw zijn toegevoegd vs. al stonden.
// ============================================================
export async function slaOpInReservoir(
  contacten: ReservoirContact[],
  bron: "vcard" | "contact-picker" | "handmatig",
): Promise<{ toegevoegd: number; alAanwezig: number }> {
  if (contacten.length === 0) return { toegevoegd: 0, alAanwezig: 0 };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  // Haal bestaande reservoir-keys voor deze user → dedup-set.
  const { data: bestaand, error: selectError } = await supabase
    .from("contacten_reservoir")
    .select("volledige_naam, telefoon")
    .eq("user_id", user.id);
  if (selectError) throw selectError;

  const bestaandeKeys = new Set(
    ((bestaand as Array<{ volledige_naam: string; telefoon: string | null }>) || []).map(
      (r) => maakKey(r.volledige_naam, r.telefoon),
    ),
  );

  const teInsert = contacten
    .filter((c) => c.naam.trim().length > 0)
    .filter((c) => !bestaandeKeys.has(maakKey(c.naam, c.telefoon)))
    .map((c) => ({
      user_id: user.id,
      volledige_naam: c.naam.trim().slice(0, 200),
      telefoon: c.telefoon?.trim().slice(0, 50) || null,
      bron,
    }));

  if (teInsert.length === 0) {
    return { toegevoegd: 0, alAanwezig: contacten.length };
  }

  // Insert in batches om payload-grootte beheersbaar te houden.
  const batchGrootte = 100;
  let toegevoegd = 0;
  for (let i = 0; i < teInsert.length; i += batchGrootte) {
    const batch = teInsert.slice(i, i + batchGrootte);
    const { error } = await supabase.from("contacten_reservoir").insert(batch);
    if (error) throw error;
    toegevoegd += batch.length;
  }

  return {
    toegevoegd,
    alAanwezig: contacten.length - toegevoegd,
  };
}

// ============================================================
// 2. Haal niet-geactiveerde reservoir-rows op (voor de kiezer-UI).
//
// Filtert ook rows die al matchen op een actieve prospect — die
// staan misschien geactiveerd=false in reservoir maar zijn praktisch
// gezien al op de namenlijst aanwezig (handmatig getypt bv.).
// ============================================================
export async function haalNietGeactiveerd(): Promise<ReservoirRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from("contacten_reservoir")
    .select("*")
    .eq("user_id", user.id)
    .eq("geactiveerd", false)
    .order("created_at", { ascending: false });

  if (!rows) return [];

  // Verberg rows die al in prospects staan (dezelfde naam+telefoon-key).
  const { data: prospects } = await supabase
    .from("prospects")
    .select("volledige_naam, telefoon")
    .eq("user_id", user.id);
  const prospectKeys = new Set(
    ((prospects as Array<{ volledige_naam: string; telefoon: string | null }>) || []).map(
      (p) => maakKey(p.volledige_naam, p.telefoon),
    ),
  );

  return (rows as ReservoirRow[]).filter(
    (r) => !prospectKeys.has(maakKey(r.volledige_naam, r.telefoon)),
  );
}

// ============================================================
// 3. Activeer geselecteerde reservoir-rows naar prospects.
//
// Maakt nieuwe prospects + zet reservoir.geactiveerd=true + linkt
// prospect_id zodat we de afkomst behouden.
// ============================================================
export async function activeerContacten(
  reservoirIds: string[],
): Promise<{ geactiveerd: number; alActief: number }> {
  if (reservoirIds.length === 0) return { geactiveerd: 0, alActief: 0 };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  // Haal de reservoir-rows op.
  const { data: rows, error: selectError } = await supabase
    .from("contacten_reservoir")
    .select("id, volledige_naam, telefoon")
    .in("id", reservoirIds)
    .eq("user_id", user.id);
  if (selectError) throw selectError;
  if (!rows || rows.length === 0) return { geactiveerd: 0, alActief: 0 };

  // Bestaande prospect-keys ophalen voor dedup.
  const { data: prospects } = await supabase
    .from("prospects")
    .select("volledige_naam, telefoon")
    .eq("user_id", user.id);
  const prospectKeys = new Set(
    ((prospects as Array<{ volledige_naam: string; telefoon: string | null }>) || []).map(
      (p) => maakKey(p.volledige_naam, p.telefoon),
    ),
  );

  // Splits in 'nieuw te maken' vs 'al actief'.
  const typedRows = rows as Array<{ id: string; volledige_naam: string; telefoon: string | null }>;
  const teMaken = typedRows.filter(
    (r) => !prospectKeys.has(maakKey(r.volledige_naam, r.telefoon)),
  );
  const alActief = typedRows.length - teMaken.length;

  // Maak prospects in batches en koppel terug naar reservoir-ids.
  const batchGrootte = 100;
  let geactiveerdTotaal = 0;
  for (let i = 0; i < teMaken.length; i += batchGrootte) {
    const batch = teMaken.slice(i, i + batchGrootte);
    const insertRows = batch.map((r) => ({
      user_id: user.id,
      volledige_naam: r.volledige_naam,
      telefoon: r.telefoon,
      pipeline_fase: "prospect" as const,
      actief: true,
      gearchiveerd: false,
    }));
    const { data: nieuwe, error } = await supabase
      .from("prospects")
      .insert(insertRows)
      .select("id, volledige_naam, telefoon");
    if (error) throw error;

    // Map nieuwe prospect-id terug naar reservoir-id via key, en update.
    const prospectIdPerKey = new Map<string, string>();
    for (const p of (nieuwe as Array<{ id: string; volledige_naam: string; telefoon: string | null }>) || []) {
      prospectIdPerKey.set(maakKey(p.volledige_naam, p.telefoon), p.id);
    }

    const nu = new Date().toISOString();
    const updates = batch
      .map((r) => {
        const pid = prospectIdPerKey.get(maakKey(r.volledige_naam, r.telefoon));
        return pid
          ? { reservoirId: r.id, prospectId: pid }
          : null;
      })
      .filter((u): u is { reservoirId: string; prospectId: string } => !!u);

    // Bulk update reservoir-rows. Supabase heeft geen native bulk-upsert
    // op id-level dus we doen 'm in een loop — voor 100 rows acceptabel.
    for (const u of updates) {
      await supabase
        .from("contacten_reservoir")
        .update({
          geactiveerd: true,
          geactiveerd_op: nu,
          prospect_id: u.prospectId,
        })
        .eq("id", u.reservoirId);
    }

    geactiveerdTotaal += updates.length;
  }

  // Voor rows die NIET nieuw waren (al actief in prospects), markeer
  // ze óók als geactiveerd zodat ze uit de kiezer verdwijnen.
  const reedsActief = typedRows.filter(
    (r) => prospectKeys.has(maakKey(r.volledige_naam, r.telefoon)),
  );
  if (reedsActief.length > 0) {
    const nu = new Date().toISOString();
    await supabase
      .from("contacten_reservoir")
      .update({ geactiveerd: true, geactiveerd_op: nu })
      .in("id", reedsActief.map((r) => r.id));
  }

  return { geactiveerd: geactiveerdTotaal, alActief };
}
