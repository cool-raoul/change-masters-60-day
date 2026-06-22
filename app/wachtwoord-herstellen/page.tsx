"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";

// Stap 2 van wachtwoord-herstel: de gebruiker komt hier via de link uit de
// herstel-mail. De Supabase browser-client verwerkt de recovery-token in de
// URL en vestigt een tijdelijke sessie (PASSWORD_RECOVERY-event). Daarna mag
// de gebruiker een nieuw wachtwoord instellen.
export default function WachtwoordHerstellenPagina() {
  const { v } = useTaal();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [klaar, setKlaar] = useState(false);
  const [controleren, setControleren] = useState(true);
  const [ww1, setWw1] = useState("");
  const [ww2, setWw2] = useState("");
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    let actief = true;

    // Mogelijk is de sessie al gevestigd tegen de tijd dat dit draait.
    supabase.auth.getSession().then(({ data }) => {
      if (!actief) return;
      if (data.session) {
        setKlaar(true);
        setControleren(false);
      }
    });

    // Anders vangen we het recovery-event op zodra de client de URL verwerkt.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!actief) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setKlaar(true);
        setControleren(false);
      }
    });

    // Na een paar seconden zonder sessie: link ongeldig of verlopen.
    const t = setTimeout(() => {
      if (actief) setControleren(false);
    }, 3500);

    return () => {
      actief = false;
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [supabase]);

  async function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    if (ww1.length < 8) {
      toast.error(v("herstel.fout_kort"));
      return;
    }
    if (ww1 !== ww2) {
      toast.error(v("herstel.fout_ongelijk"));
      return;
    }
    setLaden(true);
    const { error } = await supabase.auth.updateUser({ password: ww1 });
    setLaden(false);
    if (error) {
      toast.error(v("herstel.fout_opslaan"));
      return;
    }
    toast.success(v("herstel.nieuw_gelukt"));
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cm-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-16 w-16 mx-auto mb-3" />
          <h1 className="text-4xl eleva-brand mb-3">ELEVA</h1>
        </div>

        <div className="card border-gold-subtle glow-gold-soft">
          <h2 className="font-serif-warm text-xl text-cm-white mb-6">
            {v("herstel.nieuw_titel")}
          </h2>

          {controleren ? (
            <p className="text-cm-white/70 text-sm">{v("herstel.controleren")}</p>
          ) : klaar ? (
            <form onSubmit={handleOpslaan} className="space-y-4">
              <div>
                <label className="block text-sm text-cm-white mb-1.5">
                  {v("herstel.nieuw_label")}
                </label>
                <input
                  type="password"
                  value={ww1}
                  onChange={(e) => setWw1(e.target.value)}
                  placeholder="••••••••"
                  className="input-cm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-cm-white mb-1.5">
                  {v("herstel.nieuw_bevestig")}
                </label>
                <input
                  type="password"
                  value={ww2}
                  onChange={(e) => setWw2(e.target.value)}
                  placeholder="••••••••"
                  className="input-cm"
                  required
                />
              </div>
              <button type="submit" disabled={laden} className="btn-gold w-full mt-6">
                {laden ? v("herstel.nieuw_knop_laden") : v("herstel.nieuw_knop")}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <p className="text-cm-white/80 text-sm leading-relaxed">
                {v("herstel.link_ongeldig")}
              </p>
              <Link
                href="/wachtwoord-vergeten"
                className="btn-gold w-full block text-center"
              >
                {v("herstel.vraag_titel")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
