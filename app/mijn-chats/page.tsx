"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

// ============================================================
// /mijn-chats
//
// WhatsApp-stijl chat-overzicht met TWEE soorten gesprekken in één
// lijst:
//   - 'eigen'   = chats met je eigen prospects (mini-ELEVA)
//   - 'sponsor' = 3-weg-groepschats waarbij jij sponsor bent van een
//                 member-prospect-paar onder jou
//
// Visueel onderscheid:
//   - Eigen chats: standaard avatar van prospect
//   - Sponsor-chats: 3-weg-icoon + label "3-weg met [member] + [prospect]"
//
// Client-component (was server) zodat we polling kunnen doen voor
// live updates van ongelezen-tellers.
// ============================================================

type ChatItem = {
  prospectId: string;
  prospectNaam: string;
  prospectVoornaam: string;
  rol: "eigen" | "sponsor";
  memberNaam: string | null;
  memberVoornaam: string | null;
  ongelezenAantal: number;
  laatsteBericht: string | null;
  laatsteBerichtRol: string | null;
  laatsteBerichtType: string | null;
  laatsteBerichtTijd: string | null;
  heeftActieveInvitatie: boolean;
  klikUrl: string;
};

const POLL_INTERVAL_MS = 15000;

export default function MijnChatsPagina() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [totaalOngelezen, setTotaalOngelezen] = useState(0);
  const [laden, setLaden] = useState(true);
  const [foutTekst, setFoutTekst] = useState<string | null>(null);

  useEffect(() => {
    let levend = true;
    async function haal() {
      try {
        const res = await fetch("/api/mini-eleva/mijn-chats");
        if (!res.ok) {
          if (levend) {
            setFoutTekst("Kon chats niet laden");
            setLaden(false);
          }
          return;
        }
        const data = await res.json();
        if (!levend) return;
        setItems(data.items ?? []);
        setTotaalOngelezen(data.totaalOngelezen ?? 0);
        setFoutTekst(null);
      } catch {
        if (levend) setFoutTekst("Verbindingsfout");
      } finally {
        if (levend) setLaden(false);
      }
    }
    haal();
    const t = setInterval(haal, POLL_INTERVAL_MS);
    return () => {
      levend = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="space-y-5 pt-6">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Mini-ELEVA
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          Mijn chats
        </h1>
        <p className="text-cm-white/60 text-sm mt-1">
          Eigen prospect-chats en 3-weg-groepschats waar je sponsor bent op
          één plek. Nieuwe berichten staan bovenaan en lichten goud op.
        </p>
      </div>

      {totaalOngelezen > 0 && (
        <div className="card border-l-4 border-cm-gold flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <p className="text-cm-gold text-sm font-semibold">
            {totaalOngelezen} ongelezen bericht
            {totaalOngelezen === 1 ? "" : "en"}
          </p>
        </div>
      )}

      {foutTekst && (
        <div className="card text-center text-cm-white/60 text-sm">
          {foutTekst}. Vraag de founder om de SQL-migraties (mini_eleva.sql,
          fase6c, fase6d, fase6e, fase6f) te draaien als 't aan ontbrekende
          tabellen ligt.
        </div>
      )}

      {laden && !foutTekst && items.length === 0 && (
        <div className="card text-center text-cm-white/40 text-sm italic">
          Laden...
        </div>
      )}

      {!laden && items.length === 0 && !foutTekst && (
        <div className="card text-center text-cm-white/60 text-sm">
          Nog geen mini-ELEVA-chats. Maak een uitnodiging aan vanaf een
          prospect-kaart, of word sponsor van een chat van een member onder
          je.
        </div>
      )}

      <div className="space-y-2">
        {items.map((c) => (
          <ChatTegel key={`${c.rol}-${c.prospectId}`} chat={c} />
        ))}
      </div>
    </div>
  );
}

function ChatTegel({ chat }: { chat: ChatItem }) {
  const ongelezen = chat.ongelezenAantal > 0;
  const isSponsor = chat.rol === "sponsor";
  const eigenRolNaam = isSponsor ? "sponsor" : "member";
  const laatsteRolLabel =
    chat.laatsteBerichtRol === eigenRolNaam
      ? "Jij"
      : chat.laatsteBerichtRol === "prospect"
        ? chat.prospectVoornaam
        : chat.laatsteBerichtRol === "member"
          ? (chat.memberVoornaam ?? "Member")
          : chat.laatsteBerichtRol === "sponsor"
            ? "Sponsor"
            : "";

  return (
    <Link
      href={chat.klikUrl}
      className={`card flex items-center gap-3 hover:border-cm-gold-dim transition-colors ${
        !chat.heeftActieveInvitatie ? "opacity-70" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`relative w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
          ongelezen
            ? "bg-cm-gold text-black"
            : "bg-cm-surface-2 text-cm-white"
        }`}
      >
        {chat.prospectVoornaam
          .split(" ")
          .map((s) => s[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
        {/* Sponsor-badge rechtsonder bij avatar zodat je in één
            oogopslag ziet dat het 3-weg is */}
        {isSponsor && (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cm-surface flex items-center justify-center text-[10px] border border-cm-gold/40"
            title="3-weg-groepschat"
          >
            🤝
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3
              className={`font-semibold text-sm truncate ${
                ongelezen ? "text-cm-gold" : "text-cm-white"
              }`}
            >
              {chat.prospectNaam}
            </h3>
            {isSponsor && (
              <span
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cm-gold/15 text-cm-gold/90 shrink-0"
                title={
                  chat.memberVoornaam
                    ? `Member: ${chat.memberVoornaam}`
                    : "3-weg-groep"
                }
              >
                3-weg
              </span>
            )}
          </div>
          {chat.laatsteBerichtTijd && (
            <span
              className={`text-[10px] shrink-0 ${
                ongelezen ? "text-cm-gold" : "text-cm-white/50"
              }`}
            >
              {formatDistanceToNow(parseISO(chat.laatsteBerichtTijd), {
                locale: nl,
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs leading-snug truncate ${
              ongelezen ? "text-cm-white font-medium" : "text-cm-white/60"
            }`}
          >
            {chat.laatsteBericht ? (
              <>
                <span className="text-cm-white/40">{laatsteRolLabel}:</span>{" "}
                {chat.laatsteBericht}
              </>
            ) : (
              <span className="italic text-cm-white/40">
                {isSponsor
                  ? `3-weg-groep met ${chat.memberVoornaam ?? "member"}, nog geen berichten`
                  : "Nog geen berichten"}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {!chat.heeftActieveInvitatie && (
              <span className="text-[9px] uppercase tracking-wider text-cm-white/40">
                verlopen
              </span>
            )}
            {ongelezen && (
              <span className="bg-cm-gold text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {chat.ongelezenAantal > 9 ? "9+" : chat.ongelezenAantal}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
