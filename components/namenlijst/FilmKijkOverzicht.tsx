import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PROSPECT_FILM_BESCHRIJVINGEN } from "@/lib/films/embed";

// ============================================================
// FilmKijkOverzicht, op de prospect-kaart.
//
// Toont per verzonden film:
//   - Welke film
//   - Verstuurd-datum
//   - Status: nog niet gestart / aan het kijken X% / afgekeken op DATUM
// Member ziet hier in 1 oogopslag waar de prospect staat met de
// gestuurde films, inclusief real-time kijkpercentage.
// ============================================================

type Rij = {
  id: string;
  film_slug: string;
  created_at: string;
  gestart_op: string | null;
  afgekeken_op: string | null;
  kijkpercentage: number;
};

type Props = {
  views: Rij[];
};

function statusLabel(rij: Rij): { tekst: string; kleur: string } {
  if (rij.afgekeken_op) {
    return {
      tekst: `✓ Afgekeken op ${format(new Date(rij.afgekeken_op), "d MMM HH:mm", { locale: nl })}`,
      kleur: "text-emerald-400",
    };
  }
  if (rij.kijkpercentage > 0) {
    return {
      tekst: `▶️ Aan het kijken: ${rij.kijkpercentage}%`,
      kleur: "text-cm-gold",
    };
  }
  if (rij.gestart_op) {
    return {
      tekst: "▶️ Gestart, nog geen kijktijd geregistreerd",
      kleur: "text-cm-gold",
    };
  }
  return { tekst: "⏳ Nog niet gestart", kleur: "text-cm-white opacity-50" };
}

export function FilmKijkOverzicht({ views }: Props) {
  if (views.length === 0) return null;

  return (
    <div className="card space-y-2.5">
      <h3 className="text-cm-gold font-semibold text-sm flex items-center gap-2">
        🎬 Verzonden films
      </h3>
      <ul className="space-y-2">
        {views.map((rij) => {
          const meta = PROSPECT_FILM_BESCHRIJVINGEN[rij.film_slug];
          const titel = meta?.suggestieTitel ?? rij.film_slug;
          const status = statusLabel(rij);
          return (
            <li
              key={rij.id}
              className="flex items-start gap-3 rounded-md border border-cm-border bg-cm-surface px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-cm-white text-sm font-medium truncate">
                  {titel}
                </p>
                <p className="text-cm-white opacity-50 text-[11px] mt-0.5">
                  Verstuurd op{" "}
                  {format(new Date(rij.created_at), "d MMM yyyy", { locale: nl })}
                </p>
                <p className={`text-xs mt-1 ${status.kleur}`}>{status.tekst}</p>
                {rij.kijkpercentage > 0 && !rij.afgekeken_op && (
                  <div className="mt-1.5 h-1 w-full bg-cm-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cm-gold transition-all"
                      style={{ width: `${rij.kijkpercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
