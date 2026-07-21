// ============================================================
// pagina-blokken server-helpers
//
// Haalt blokken op per pagina (namespace + id) en groepeert ze
// per positie. Genereert signed URLs voor upload-types.
// Faalt stilletjes als tabel ontbreekt → lege Map.
// ============================================================

export type BlokType = "video" | "afbeelding" | "pdf" | "audio" | "quote";

export type VideoInhoud = {
  url: string;
  titel?: string;
  bron: "vimeo" | "youtube";
};

export type AfbeeldingInhoud = {
  titel?: string;
  alt: string;
  breedte?: number;
  hoogte?: number;
};

export type PdfInhoud = {
  titel: string;
  beschrijving?: string;
  bestandsnaam: string;
};

export type AudioInhoud = {
  titel?: string;
  duur_seconden?: number;
};

export type QuoteInhoud = {
  tekst: string;
  bron?: string;
};

export type Blok = {
  id: string;
  pagina_namespace: string;
  pagina_id: string;
  positie: string;
  volgorde: number;
  type: BlokType;
  inhoud:
    | VideoInhoud
    | AfbeeldingInhoud
    | PdfInhoud
    | AudioInhoud
    | QuoteInhoud;
  storage_pad: string | null;
  /** Server-gegenereerd: signed URL voor afbeelding/pdf/audio */
  bestand_url?: string;
};

export type BlokkenPerPositie = Map<string, Blok[]>;

/**
 * Haal alle blokken voor een pagina op, gegroepeerd per positie.
 * Genereert signed URLs voor afbeelding/pdf-types.
 *
 * Loosely getypeerd zodat zowel server-client (createClient) als
 * admin-client (createAdminClient) kunnen worden doorgegeven.
 */
export async function haalPaginaBlokken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  paginaNamespace: string,
  paginaId: string,
): Promise<BlokkenPerPositie> {
  const result: BlokkenPerPositie = new Map();
  try {
    const { data, error } = await supabase
      .from("pagina_blokken")
      .select(
        "id, pagina_namespace, pagina_id, positie, volgorde, type, inhoud, storage_pad",
      )
      .eq("pagina_namespace", paginaNamespace)
      .eq("pagina_id", paginaId)
      .order("volgorde", { ascending: true });
    if (error || !data) return result;

    // Upload-types (afbeelding/pdf/audio) krijgen een ALTIJD-VERSE
    // proxy-URL in plaats van een signed URL van 1 uur: een klant-tab
    // die dagen openstaat hield anders dode document-knoppen over
    // (bug 21 juli). De route geeft per klik een verse signed URL.
    for (const blok of data as Blok[]) {
      if (
        blok.storage_pad &&
        (blok.type === "afbeelding" ||
          blok.type === "pdf" ||
          blok.type === "audio")
      ) {
        blok.bestand_url = `/api/cms/bestand?pad=${encodeURIComponent(blok.storage_pad)}`;
      }

      let lijst = result.get(blok.positie);
      if (!lijst) {
        lijst = [];
        result.set(blok.positie, lijst);
      }
      lijst.push(blok);
    }
  } catch {
    // tabel ontbreekt of network-fout, lege map terug
  }
  return result;
}

/**
 * Comfort-helper: pak één positie eruit als plain Array. Lege array
 * als de positie niet bestond.
 */
export function blokkenOpPositie(
  blokken: BlokkenPerPositie,
  positie: string,
): Blok[] {
  return blokken.get(positie) ?? [];
}

/**
 * Vimeo-ID extractor uit verschillende URL-formaten.
 * Returns null als geen Vimeo-URL.
 */
export function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * YouTube-ID extractor uit verschillende URL-formaten.
 * Returns null als geen YouTube-URL.
 */
export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/,
  );
  return match ? match[1] : null;
}

/**
 * Converteert een BlokkenPerPositie-Map naar een plain Record voor
 * serialisatie van Server Component → Client Component (Maps gaan
 * niet over die grens).
 */
export function blokkenAlsRecord(
  blokken: BlokkenPerPositie,
): Record<string, Blok[]> {
  const obj: Record<string, Blok[]> = {};
  Array.from(blokken.entries()).forEach(([positie, lijst]) => {
    obj[positie] = lijst;
  });
  return obj;
}
