"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// VCardUploader (eigenlijk: ContactenImporteur) — inline-embed voor
// /vandaag dag 1 'telefoon-import'.
//
// Drie routes, in volgorde van gemak:
//   1. ⭐ NATIVE TELEFOON-PICKER (Android Chrome): één knop, je krijgt
//      het systeem-adresboek, vinkt aan, klaar. Geen bestand, geen export.
//   2. ✋ HANDMATIG: 5 velden voor naam + telefoon, gewoon typen.
//      Werkt overal — desktop, iPhone, Android.
//   3. 📂 VCARD-UPLOAD: voor wie de telefoon-export al heeft gedaan,
//      met stap-voor-stap uitleg per platform (iPhone vs Android).
//
// Welke routes je ziet hangt af van je apparaat:
//   - Android Chrome → route 1 prominent, 2 + 3 als alternatief
//   - iPhone / desktop → route 2 prominent, 3 als alternatief
//
// Geen wegnavigeren — alles blijft in de dag-flow.
// ============================================================

type Contact = { naam: string; telefoon: string | null };

type Props = {
  /** Wordt aangeroepen zodra de import succesvol is — vinkt de taak af. */
  opVoltooid: () => void;
  /** Of de huidige stap al voltooid was — dan tonen we een geslaagd-status. */
  alVoltooid: boolean;
};

// ------------------------------------------------------------
// vCard-parser (gebruikt door route 3)
// ------------------------------------------------------------
function parseVCard(tekst: string): Contact[] {
  const blokken = tekst.split(/BEGIN:VCARD/i).slice(1);
  const contacten: Contact[] = [];
  for (const blok of blokken) {
    const eind = blok.indexOf("END:VCARD");
    const inhoud = eind >= 0 ? blok.slice(0, eind) : blok;
    const ontvouwen = inhoud.replace(/\r?\n[ \t]/g, "");
    const regels = ontvouwen.split(/\r?\n/);
    let naam = "";
    let telefoon: string | null = null;
    for (const regel of regels) {
      const fnMatch = regel.match(/^FN(?:;[^:]+)?:(.+)$/i);
      if (fnMatch && !naam) naam = fnMatch[1].trim();
      const telMatch = regel.match(/^TEL(?:;[^:]+)?:(.+)$/i);
      if (telMatch && !telefoon)
        telefoon = telMatch[1].trim().replace(/\s+/g, "");
      const nMatch = regel.match(/^N(?:;[^:]+)?:(.+)$/i);
      if (nMatch && !naam) {
        const delen = nMatch[1].split(";").map((s) => s.trim()).filter(Boolean);
        const voor = delen[1] || "";
        const achter = delen[0] || "";
        naam = `${voor} ${achter}`.trim();
      }
    }
    if (naam) contacten.push({ naam, telefoon });
  }
  const gezien = new Set<string>();
  return contacten.filter((c) => {
    const k = `${c.naam.toLowerCase()}|${c.telefoon ?? ""}`;
    if (gezien.has(k)) return false;
    gezien.add(k);
    return true;
  });
}

// ------------------------------------------------------------
// Contact Picker API typing — niet in TS lib by default
// ------------------------------------------------------------
type NavigatorContacts = {
  select: (
    props: string[],
    opts?: { multiple?: boolean },
  ) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
};

function pakContactsAPI(): NavigatorContacts | null {
  if (typeof navigator === "undefined") return null;
  const c = (navigator as Navigator & { contacts?: NavigatorContacts })
    .contacts;
  if (!c || typeof c.select !== "function") return null;
  return c;
}

// ------------------------------------------------------------
// Hoofdcomponent
// ------------------------------------------------------------
export function VCardUploader({ opVoltooid, alVoltooid }: Props) {
  const [klaar, setKlaar] = useState(alVoltooid);
  const [bezig, setBezig] = useState(false);
  const [actieveTab, setActieveTab] = useState<"native" | "handmatig" | "vcard">(
    "handmatig",
  );
  const [hasContactsAPI, setHasContactsAPI] = useState(false);

  // VCard preview state (route 3)
  const [vcardVoorbeeld, setVcardVoorbeeld] = useState<Contact[]>([]);
  const [vcardGeselecteerd, setVcardGeselecteerd] = useState<Set<number>>(
    new Set(),
  );
  const [vcardZoek, setVcardZoek] = useState("");
  const vcardInputRef = useRef<HTMLInputElement>(null);
  const [vcardTelefoonHelp, setVcardTelefoonHelp] = useState<"iphone" | "android" | null>(null);

  // Handmatige invoer state (route 2)
  const [handmatig, setHandmatig] = useState<Contact[]>(
    Array.from({ length: 5 }, () => ({ naam: "", telefoon: "" })),
  );

  useEffect(() => {
    const beschikbaar = pakContactsAPI() !== null;
    setHasContactsAPI(beschikbaar);
    setActieveTab(beschikbaar ? "native" : "handmatig");
  }, []);

  // ----------------------------------------------------------
  // Centrale insert-functie (gebruikt door alle drie de routes)
  // ----------------------------------------------------------
  async function insertContacten(contacten: Contact[]): Promise<boolean> {
    if (contacten.length === 0) {
      toast.error("Geen contacten om toe te voegen");
      return false;
    }
    setBezig(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niet ingelogd");
        return false;
      }

      const { data: bestaand } = await supabase
        .from("prospects")
        .select("volledige_naam, telefoon")
        .eq("user_id", user.id);
      const reedsAanwezig = new Set(
        ((bestaand as Array<{ volledige_naam: string; telefoon: string | null }>) || []).map(
          (p) => `${p.volledige_naam.toLowerCase()}|${p.telefoon ?? ""}`,
        ),
      );

      const nieuw = contacten
        .filter((c) => c.naam.trim().length > 0)
        .filter((c) => !reedsAanwezig.has(`${c.naam.toLowerCase()}|${c.telefoon ?? ""}`))
        .map((c) => ({
          user_id: user.id,
          volledige_naam: c.naam.trim().slice(0, 200),
          telefoon: c.telefoon?.trim().slice(0, 50) || null,
          pipeline_fase: "prospect" as const,
          actief: true,
          gearchiveerd: false,
        }));

      if (nieuw.length === 0) {
        toast.success("Deze contacten stonden al op je namenlijst");
        setKlaar(true);
        opVoltooid();
        return true;
      }

      const batchGrootte = 100;
      let toegevoegd = 0;
      for (let i = 0; i < nieuw.length; i += batchGrootte) {
        const batch = nieuw.slice(i, i + batchGrootte);
        const { error } = await supabase.from("prospects").insert(batch);
        if (error) {
          toast.error(`Import mislukt bij ${toegevoegd}/${nieuw.length}`);
          return false;
        }
        toegevoegd += batch.length;
      }

      toast.success(
        `🎉 ${toegevoegd} nieuw${toegevoegd === 1 ? " contact" : "e contacten"} toegevoegd aan je namenlijst`,
      );
      setKlaar(true);
      opVoltooid();
      return true;
    } catch {
      toast.error("Onbekende fout — probeer opnieuw");
      return false;
    } finally {
      setBezig(false);
    }
  }

  // ----------------------------------------------------------
  // Route 1: Native Contact Picker
  // ----------------------------------------------------------
  async function pakUitTelefoon() {
    const api = pakContactsAPI();
    if (!api) {
      toast.error("Je browser ondersteunt dit niet — kies een andere route");
      return;
    }
    try {
      const resultaat = await api.select(["name", "tel"], { multiple: true });
      if (!resultaat || resultaat.length === 0) return;
      const contacten: Contact[] = resultaat
        .map((r) => ({
          naam: (r.name && r.name[0]) || "",
          telefoon: (r.tel && r.tel[0]) || null,
        }))
        .filter((c) => c.naam.trim().length > 0);
      if (contacten.length === 0) {
        toast.error("Geen contacten geselecteerd");
        return;
      }
      await insertContacten(contacten);
    } catch {
      // User cancelled or denied permission — geen toast nodig
    }
  }

  // ----------------------------------------------------------
  // Route 2: Handmatig
  // ----------------------------------------------------------
  function updateHandmatig(idx: number, veld: "naam" | "telefoon", waarde: string) {
    setHandmatig((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [veld]: waarde } : c)),
    );
  }

  function voegRijToe() {
    setHandmatig((prev) => [...prev, { naam: "", telefoon: "" }]);
  }

  async function bewaarHandmatig() {
    const ingevuld = handmatig.filter((c) => c.naam.trim().length > 0);
    if (ingevuld.length === 0) {
      toast.error("Vul minimaal 1 naam in");
      return;
    }
    await insertContacten(ingevuld);
  }

  // ----------------------------------------------------------
  // Route 3: vCard upload
  // ----------------------------------------------------------
  async function leesVCardBestand(bestand: File) {
    if (!bestand.name.toLowerCase().endsWith(".vcf")) {
      toast.error("Kies een .vcf-bestand");
      return;
    }
    try {
      const tekst = await bestand.text();
      const contacten = parseVCard(tekst);
      if (contacten.length === 0) {
        toast.error("Geen contacten gevonden in dit bestand");
        return;
      }

      // Filter al-aanwezige contacten — alleen 'nieuwe' tonen voor
      // selectie. Zo kun je later gewoon hetzelfde bestand opnieuw
      // gebruiken om de volgende batch toe te voegen.
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let bestaandeKeys = new Set<string>();
      if (user) {
        const { data: bestaand } = await supabase
          .from("prospects")
          .select("volledige_naam, telefoon")
          .eq("user_id", user.id);
        bestaandeKeys = new Set(
          (
            (bestaand as Array<{ volledige_naam: string; telefoon: string | null }>) ||
            []
          ).map((p) => `${p.volledige_naam.toLowerCase()}|${p.telefoon ?? ""}`),
        );
      }

      const nieuw = contacten.filter(
        (c) =>
          !bestaandeKeys.has(`${c.naam.toLowerCase()}|${c.telefoon ?? ""}`),
      );

      const alAanwezig = contacten.length - nieuw.length;

      if (nieuw.length === 0) {
        toast.success("Al je contacten staan al op je lijst — niks nieuws");
        return;
      }

      setVcardVoorbeeld(nieuw);
      setVcardGeselecteerd(new Set()); // begin met niets aangevinkt
      setVcardZoek("");

      if (alAanwezig > 0) {
        toast.success(
          `${nieuw.length} nieuwe contacten gevonden (${alAanwezig} stonden er al). Vink aan wat je vandaag wilt toevoegen.`,
        );
      } else {
        toast.success(
          `${nieuw.length} contact${nieuw.length === 1 ? "" : "en"} gevonden. Vink aan wat je vandaag wilt toevoegen.`,
        );
      }
    } catch {
      toast.error("Kon het bestand niet lezen");
    }
  }

  // Helper: gefilterde lijst op basis van zoekterm
  const vcardZichtbaar = vcardVoorbeeld
    .map((c, idx) => ({ contact: c, idx }))
    .filter(({ contact }) => {
      if (!vcardZoek.trim()) return true;
      const q = vcardZoek.toLowerCase();
      return (
        contact.naam.toLowerCase().includes(q) ||
        (contact.telefoon ?? "").includes(q)
      );
    });

  function selecteerEersteN(n: number) {
    const nieuwSet = new Set<number>();
    for (let i = 0; i < Math.min(n, vcardVoorbeeld.length); i++) {
      nieuwSet.add(i);
    }
    setVcardGeselecteerd(nieuwSet);
  }

  function selecteerAlleZichtbaar() {
    const nieuwSet = new Set(vcardGeselecteerd);
    for (const { idx } of vcardZichtbaar) {
      nieuwSet.add(idx);
    }
    setVcardGeselecteerd(nieuwSet);
  }

  function deselecteerAlles() {
    setVcardGeselecteerd(new Set());
  }

  function toggleSelectie(idx: number) {
    setVcardGeselecteerd((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  }

  async function importeerGeselecteerd() {
    const lijst = Array.from(vcardGeselecteerd)
      .map((i) => vcardVoorbeeld[i])
      .filter((c): c is Contact => !!c);
    if (lijst.length === 0) {
      toast.error("Vink eerst de namen aan die je wilt toevoegen");
      return;
    }
    const ok = await insertContacten(lijst);
    if (ok) {
      // Reset preview — als 'ie wil meer toevoegen, kan opnieuw uploaden
      setVcardVoorbeeld([]);
      setVcardGeselecteerd(new Set());
      setVcardZoek("");
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  if (klaar) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
          ✓ Contacten staan op je namenlijst
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          Top — je voorraadkast is gevuld. Op naar de volgende stap.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-4">
      <div className="space-y-1.5">
        <h4 className="text-cm-gold font-semibold text-sm">
          📇 Welkom in je voorraadkast
        </h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          Dit is jouw plek om mensen toe te voegen die in je leven voorkomen.
          Geen belkostlijst, geen verkooplijst — gewoon mensen die jij kent.
          Dit doen we vandaag al, omdat het zóveel rust geeft de komende weken
          om niet elke dag te hoeven nadenken: <em>"aan wie zou ik vandaag iets
          kunnen laten zien?"</em>. Je hebt 'n lijst, je kijkt erop, klaar.
        </p>
        <p className="text-cm-white opacity-60 text-[11px] leading-relaxed pt-1">
          Geen druk om alles vandaag te doen. Kies de manier die je het lekkerst
          vindt en voeg gewoon toe wie er nu in je opkomt. Op andere dagen kun
          je hier altijd weer terecht om meer mensen erbij te zetten.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cm-border">
        {hasContactsAPI && (
          <button
            type="button"
            onClick={() => setActieveTab("native")}
            className={`px-3 py-2 text-xs font-semibold transition-colors ${
              actieveTab === "native"
                ? "text-cm-gold border-b-2 border-cm-gold"
                : "text-cm-white opacity-60 hover:opacity-100"
            }`}
          >
            📱 Uit mijn telefoon
          </button>
        )}
        <button
          type="button"
          onClick={() => setActieveTab("handmatig")}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            actieveTab === "handmatig"
              ? "text-cm-gold border-b-2 border-cm-gold"
              : "text-cm-white opacity-60 hover:opacity-100"
          }`}
        >
          ✋ Zelf typen
        </button>
        <button
          type="button"
          onClick={() => setActieveTab("vcard")}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            actieveTab === "vcard"
              ? "text-cm-gold border-b-2 border-cm-gold"
              : "text-cm-white opacity-60 hover:opacity-100"
          }`}
        >
          📂 vCard-bestand
        </button>
      </div>

      {/* ========== ROUTE 1: NATIVE PICKER ========== */}
      {actieveTab === "native" && hasContactsAPI && (
        <div className="space-y-3 pt-1">
          <p className="text-cm-white text-xs leading-relaxed">
            Druk op de knop hieronder. Je telefoon laat dan je adresboek zien
            en je tikt simpelweg de mensen aan die je wilt toevoegen. Geen
            export, geen bestand — gewoon één klik.
          </p>
          <button
            type="button"
            onClick={pakUitTelefoon}
            disabled={bezig}
            className="btn-gold w-full py-4 text-base font-bold disabled:opacity-50"
          >
            {bezig ? "Bezig..." : "📱 Kies contacten uit mijn telefoon"}
          </button>
          <p className="text-cm-white opacity-50 text-[11px]">
            ℹ️ Je telefoon vraagt eerst om toestemming. Wij zien alleen wat jij
            zelf aanvinkt — niets meer.
          </p>
        </div>
      )}

      {/* ========== ROUTE 2: HANDMATIG ========== */}
      {actieveTab === "handmatig" && (
        <div className="space-y-3 pt-1">
          <p className="text-cm-white text-xs leading-relaxed">
            Vul gewoon de namen in van mensen die in je hoofd opkomen — familie,
            vrienden, oud-collega's, sport-maatjes. Telefoonnummer is handig maar
            niet verplicht. Geen filter: alles op de lijst.
          </p>

          <div className="space-y-2">
            {handmatig.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={c.naam}
                  onChange={(e) => updateHandmatig(i, "naam", e.target.value)}
                  placeholder={`Naam ${i + 1}`}
                  className="textarea-cm flex-1 text-sm py-2 px-3"
                />
                <input
                  type="tel"
                  value={c.telefoon ?? ""}
                  onChange={(e) =>
                    updateHandmatig(i, "telefoon", e.target.value)
                  }
                  placeholder="Tel (optioneel)"
                  className="textarea-cm w-32 text-sm py-2 px-3"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={voegRijToe}
              className="text-cm-gold text-xs hover:underline"
            >
              + Nog een rij erbij
            </button>
            <span className="flex-1" />
            <span className="text-cm-white opacity-50 text-xs">
              {handmatig.filter((c) => c.naam.trim()).length} ingevuld
            </span>
          </div>

          <button
            type="button"
            onClick={bewaarHandmatig}
            disabled={bezig}
            className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50"
          >
            {bezig ? "Bewaren..." : "✓ Bewaar deze namen op mijn lijst"}
          </button>
        </div>
      )}

      {/* ========== ROUTE 3: VCARD ========== */}
      {actieveTab === "vcard" && (
        <div className="space-y-3 pt-1">
          <p className="text-cm-white text-xs leading-relaxed">
            Heb je al een vCard-bestand (.vcf) op je computer staan? Sleep 'm
            hierin of klik op kies. Nog niet? Lees onderaan hoe je 'm op je
            telefoon maakt.
          </p>

          <input
            ref={vcardInputRef}
            type="file"
            accept=".vcf,text/vcard,text/x-vcard"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void leesVCardBestand(f);
            }}
            className="block w-full text-xs text-cm-white file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cm-gold file:text-cm-black hover:file:opacity-90 file:cursor-pointer"
          />

          {vcardVoorbeeld.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-cm-border">
              <div className="space-y-1">
                <p className="text-cm-white text-sm font-semibold">
                  {vcardVoorbeeld.length} contact
                  {vcardVoorbeeld.length === 1 ? "" : "en"} klaar om toe te voegen
                </p>
                <p className="text-cm-white opacity-70 text-xs leading-relaxed">
                  Heb je veel namen? Geen zorgen — vink alleen aan wie je{" "}
                  <strong>vandaag</strong> wilt toevoegen. Op een andere dag
                  kun je dit bestand gewoon opnieuw uploaden, dan zie je de
                  rest weer.
                </p>
              </div>

              {/* Zoekveld */}
              <input
                type="search"
                value={vcardZoek}
                onChange={(e) => setVcardZoek(e.target.value)}
                placeholder="🔍 Zoek op naam of nummer..."
                className="textarea-cm w-full text-sm py-2 px-3"
              />

              {/* Quick-selecteer-knoppen */}
              <div className="flex flex-wrap gap-1.5">
                {vcardVoorbeeld.length >= 50 && (
                  <button
                    type="button"
                    onClick={() => selecteerEersteN(50)}
                    className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white hover:border-cm-gold-dim"
                  >
                    Eerste 50
                  </button>
                )}
                {vcardVoorbeeld.length >= 100 && (
                  <button
                    type="button"
                    onClick={() => selecteerEersteN(100)}
                    className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white hover:border-cm-gold-dim"
                  >
                    Eerste 100
                  </button>
                )}
                <button
                  type="button"
                  onClick={selecteerAlleZichtbaar}
                  className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white hover:border-cm-gold-dim"
                >
                  {vcardZoek
                    ? `Vink alles aan (${vcardZichtbaar.length})`
                    : `Vink alles aan`}
                </button>
                {vcardGeselecteerd.size > 0 && (
                  <button
                    type="button"
                    onClick={deselecteerAlles}
                    className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white opacity-60 hover:opacity-100"
                  >
                    Niks
                  </button>
                )}
              </div>

              {/* Lijst met checkboxes */}
              <div className="max-h-72 overflow-y-auto rounded border border-cm-border bg-cm-bg/40">
                {vcardZichtbaar.length === 0 ? (
                  <p className="text-cm-white opacity-50 text-xs italic px-3 py-4 text-center">
                    Geen treffers voor "{vcardZoek}"
                  </p>
                ) : (
                  <ul className="divide-y divide-cm-border">
                    {vcardZichtbaar.map(({ contact, idx }) => (
                      <li key={idx}>
                        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-cm-gold/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={vcardGeselecteerd.has(idx)}
                            onChange={() => toggleSelectie(idx)}
                            className="flex-shrink-0 accent-cm-gold w-4 h-4"
                          />
                          <span className="flex-1 text-sm text-cm-white truncate">
                            {contact.naam}
                          </span>
                          {contact.telefoon && (
                            <span className="text-cm-white opacity-50 text-[10px] whitespace-nowrap">
                              {contact.telefoon}
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={importeerGeselecteerd}
                disabled={bezig || vcardGeselecteerd.size === 0}
                className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-30"
              >
                {bezig
                  ? "Importeren..."
                  : vcardGeselecteerd.size === 0
                    ? "Vink eerst namen aan"
                    : `✓ Voeg ${vcardGeselecteerd.size} contact${vcardGeselecteerd.size === 1 ? "" : "en"} toe aan mijn lijst`}
              </button>
            </div>
          )}

          {/* Stap-voor-stap-uitleg per platform */}
          <div className="pt-3 border-t border-cm-border space-y-2">
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Hoe maak je een vCard-bestand?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setVcardTelefoonHelp(
                    vcardTelefoonHelp === "iphone" ? null : "iphone",
                  )
                }
                className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                  vcardTelefoonHelp === "iphone"
                    ? "bg-cm-gold text-cm-black"
                    : "border border-cm-border text-cm-white hover:border-cm-gold-dim"
                }`}
              >
                🍎 iPhone
              </button>
              <button
                type="button"
                onClick={() =>
                  setVcardTelefoonHelp(
                    vcardTelefoonHelp === "android" ? null : "android",
                  )
                }
                className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                  vcardTelefoonHelp === "android"
                    ? "bg-cm-gold text-cm-black"
                    : "border border-cm-border text-cm-white hover:border-cm-gold-dim"
                }`}
              >
                🤖 Android
              </button>
            </div>

            {vcardTelefoonHelp === "iphone" && (
              <ol className="space-y-2 text-xs text-cm-white leading-relaxed list-decimal pl-5">
                <li>
                  Pak je iPhone en open <strong>Safari</strong>. Ga naar{" "}
                  <strong>iCloud.com</strong> en log in met je Apple ID.
                </li>
                <li>
                  Tik onderin op <strong>Contacten</strong>.
                </li>
                <li>
                  Tik bovenin op <strong>Selecteer</strong> en daarna op{" "}
                  <strong>Selecteer alles</strong>.
                </li>
                <li>
                  Tik op het deel-icoontje (vierkantje met pijltje omhoog) en
                  kies <strong>Exporteer vCard</strong>.
                </li>
                <li>
                  Het bestand wordt gedownload — kies <strong>Bewaar in Bestanden</strong>{" "}
                  of mail het naar jezelf.
                </li>
                <li>
                  Open het bestand op je computer en sleep het in het vakje
                  hierboven.
                </li>
                <li className="text-cm-gold">
                  💡 <strong>Te omslachtig?</strong> Doe deze stap dan op je
                  telefoon zelf — open ELEVA op je telefoon, dan kun je het
                  bestand direct kiezen uit Bestanden.
                </li>
              </ol>
            )}

            {vcardTelefoonHelp === "android" && (
              <ol className="space-y-2 text-xs text-cm-white leading-relaxed list-decimal pl-5">
                <li>
                  Open op je Android-telefoon de <strong>Contacten</strong>-app.
                </li>
                <li>
                  Tik linksboven op de drie streepjes (het menu).
                </li>
                <li>
                  Tik op <strong>Instellingen</strong> en daarna op{" "}
                  <strong>Exporteren</strong>.
                </li>
                <li>
                  Kies waar het bestand opgeslagen mag worden (bijv. je{" "}
                  <strong>Downloads</strong>-map).
                </li>
                <li>
                  Stuur het bestand naar jezelf via Gmail, WhatsApp of Drive,
                  open je computer en download het daar.
                </li>
                <li>
                  Sleep het in het vakje hierboven.
                </li>
                <li className="text-cm-gold">
                  💡 <strong>Sneller:</strong> de optie "📱 Uit mijn telefoon"
                  bovenaan werkt op Android Chrome zonder bestand. Probeer die!
                </li>
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
