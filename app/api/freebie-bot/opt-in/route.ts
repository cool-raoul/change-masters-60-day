// File: app/api/freebie-bot/opt-in/route.ts
//
// POST /api/freebie-bot/opt-in
// Body: {
//   token: string,
//   leadNaam: string,
//   leadEmail: string,
//   antwoorden: TweedeLenteAntwoorden,
//   spiegelTekst: string,
//   contactGewenst: boolean
// }
// Response: { ok: true } of { error }
//
// 1. Token valideren
// 2. Freebie-row voor 'tweede-lente' ophalen (slug), on-the-fly aanmaken
//    als die nog niet bestaat (pilot, voorkomt blokkade tot Gaby content)
// 3. Opt-in rij maken in freebie_opt_ins (met bot_antwoorden + spiegel_tekst)
// 4. Klantomgeving-rij maken in klantomgeving_klanten (bron='freebie-opt-in')
// 5. Bij contactGewenst: push-notificatie naar member sturen

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import type { TweedeLenteAntwoorden } from "@/lib/freebie-bots/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    // Backwards compat: oude clients sturen leadNaam (één veld).
    // Nieuwe clients sturen leadVoornaam + leadAchternaam apart.
    const leadVoornaam = body.leadVoornaam as string | undefined;
    const leadAchternaam = body.leadAchternaam as string | undefined;
    const leadNaamLegacy = body.leadNaam as string | undefined;
    const leadNaam =
      leadVoornaam && leadAchternaam
        ? `${leadVoornaam.trim()} ${leadAchternaam.trim()}`
        : leadNaamLegacy?.trim();
    const leadEmail = body.leadEmail as string | undefined;
    const leadTelefoon = body.leadTelefoon as string | null | undefined;
    const antwoorden = body.antwoorden as TweedeLenteAntwoorden | undefined;
    const spiegelTekst = body.spiegelTekst as string | undefined;
    const contactGewenst = body.contactGewenst === true;

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!leadNaam || !leadEmail) {
      return NextResponse.json(
        { error: "Naam en e-mail zijn verplicht" },
        { status: 400 },
      );
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) {
      return NextResponse.json(
        { error: "E-mailadres lijkt niet geldig" },
        { status: 400 },
      );
    }
    if (!antwoorden) {
      return NextResponse.json(
        { error: "Antwoorden ontbreken" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Token-row + member ophalen
    const { data: tokenRow } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();
    if (!tokenRow) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    // Freebie-row ophalen op slug. We mappen 'tweede-lente' bot naar
    // de freebie met diezelfde slug (moet door SQL-import bestaan).
    let freebieRij: { id: string } | null = null;
    const { data: bestaandeFreebie } = await supabase
      .from("freebies")
      .select("id")
      .eq("slug", "tweede-lente")
      .maybeSingle();
    freebieRij = (bestaandeFreebie as { id: string } | null) ?? null;

    if (!freebieRij) {
      // Freebie-row bestaat nog niet in DB. Voor pilot: rij on-the-fly
      // aanmaken zodat opt-ins niet blokkeren tijdens Gaby's tekst-werk.
      const { data: nieuweFreebie, error: freebieErr } = await supabase
        .from("freebies")
        .insert({
          slug: "tweede-lente",
          titel: "Tweede Lente",
          ondertitel: "Een korte spiegel voor jouw fase",
          vorm: "test",
          onderwerp: "overgang",
          beschrijving:
            "Bot-pilot voor freebie-toolkit. Vijf-minuten-spiegel + opt-in voor 5-mail-reeks.",
          actief: true,
        })
        .select("id")
        .single();
      if (freebieErr || !nieuweFreebie) {
        return NextResponse.json(
          { error: "Freebie-rij aanmaken mislukt" },
          { status: 500 },
        );
      }
      freebieRij = nieuweFreebie as { id: string };
    }

    // Opt-in rij invoegen
    const { data: optIn, error: optInErr } = await supabase
      .from("freebie_opt_ins")
      .insert({
        freebie_id: freebieRij.id,
        member_id: tokenRow.member_id,
        lead_naam: leadNaam,
        lead_email: leadEmail,
        bron_kanaal: "tweede-lente-bot",
        status: "nieuw",
        bot_antwoorden: antwoorden,
        spiegel_tekst: spiegelTekst ?? null,
      })
      .select("id")
      .single();

    if (optInErr || !optIn) {
      console.error("opt-in insert fout:", optInErr);
      return NextResponse.json(
        { error: "Opt-in opslag mislukt" },
        { status: 500 },
      );
    }

    // Prospect-rij maken in de namenlijst van de member. Klantomgeving
    // bewust NIET, want dat is voor klanten die al iets besteld hebben.
    // Freebie-leads zijn prospects (warm via bot).
    //
    // bron='social': prospects.bron heeft een check-constraint die alleen
    // warm/social/doorverwijzing/koud accepteert. Tweede Lente komt via
    // social-trigger-woord, dus 'social' is natuurlijk. De specifieke bot
    // staat duidelijk bovenaan in de notities zodat het direct herkenbaar
    // is in /namenlijst.
    const datum = new Date().toLocaleDateString("nl-NL");
    const notitieRegels = [
      `🌷 VIA TWEEDE LENTE BOT (${datum})`,
      `Fase: ${antwoorden.fase}`,
      `Valt op: ${antwoorden.watValtOp.join(", ")}`,
      `Eet-ritme: ${antwoorden.eetRitme}`,
      `Beweging: ${antwoorden.beweging}`,
      `Rust: ${antwoorden.rust}`,
      `Deelt met: ${antwoorden.deel}`,
      `Zoekt: ${antwoorden.zoek}`,
      contactGewenst ? "⚡ VRAAGT PERSOONLIJK CONTACT" : "Mailreeks-opt-in",
      "",
      "Spiegel die ze zag:",
      spiegelTekst ?? "(geen)",
    ].join("\n");

    // Check eerst of er al een prospect-rij bestaat voor deze member +
    // email-combinatie. Zo ja: aanvullen ipv dubbele kaart maken.
    const { data: bestaande } = await supabase
      .from("prospects")
      .select("id, volledige_naam, notities, ingezette_tools, telefoon, prioriteit, gearchiveerd")
      .eq("user_id", tokenRow.member_id)
      .ilike("email", leadEmail)
      .maybeSingle();

    // Tool-tag: 'Freebie: Tweede Lente'. Backwards compat: oude
    // 'Tweede Lente bot' wordt automatisch vervangen.
    const NIEUWE_TAG = "Freebie: Tweede Lente";
    const OUDE_TAG = "Tweede Lente bot";
    const huidigeTools = (bestaande?.ingezette_tools ?? []) as string[];
    const opgeschoond = huidigeTools.filter((t) => t !== OUDE_TAG);
    const nieuweTools = opgeschoond.includes(NIEUWE_TAG)
      ? opgeschoond
      : [...opgeschoond, NIEUWE_TAG];

    if (bestaande) {
      // Update bestaande prospect: notitie aanvullen, tool-tag toevoegen,
      // telefoon zetten als die ontbrak, prioriteit omhoog bij contact.
      const aangevuldeNotitie =
        (bestaande.notities ? `${bestaande.notities}\n\n` : "") + notitieRegels;
      const nieuwePrioriteit =
        contactGewenst && bestaande.prioriteit !== "hoog"
          ? "hoog"
          : bestaande.prioriteit;
      const updateData: Record<string, unknown> = {
        notities: aangevuldeNotitie,
        ingezette_tools: nieuweTools,
        prioriteit: nieuwePrioriteit,
        gearchiveerd: false,
        updated_at: new Date().toISOString(),
      };
      if (leadTelefoon && !bestaande.telefoon) {
        updateData.telefoon = leadTelefoon;
      }
      // Naam updaten als de vrouw nu een andere (of vollediger) naam
      // doorgeeft. Vorige naam bewaren we niet apart, wel zichtbaar
      // bovenaan in notitie als 'eerder bekend als'.
      const oudeNaam = (bestaande.volledige_naam ?? "").trim();
      const nieuweNaam = leadNaam.trim();
      if (nieuweNaam && oudeNaam && nieuweNaam.toLowerCase() !== oudeNaam.toLowerCase()) {
        updateData.volledige_naam = nieuweNaam;
        // Plaats 'eerder bekend als'-notitie bovenaan de aangevulde tekst
        updateData.notities = `(Eerder ingevuld als: ${oudeNaam})\n\n${aangevuldeNotitie}`;
      }
      const { error: updateErr } = await supabase
        .from("prospects")
        .update(updateData)
        .eq("id", bestaande.id);
      if (updateErr) {
        console.error("Prospect-update mislukt:", updateErr);
      }
    } else {
      // Nieuwe prospect-rij
      const { error: prospectErr } = await supabase
        .from("prospects")
        .insert({
          user_id: tokenRow.member_id,
          volledige_naam: leadNaam,
          email: leadEmail,
          telefoon: leadTelefoon || null,
          bron: "social",
          pipeline_fase: "prospect",
          prioriteit: contactGewenst ? "hoog" : "normaal",
          notities: notitieRegels,
          ingezette_tools: nieuweTools,
        });

      if (prospectErr) {
        console.error("Prospect-rij niet aangemaakt:", prospectErr);
      }
    }

    // Push-notificatie naar member bij ELKE opt-in (niet alleen bij
    // contactGewenst), met andere tekst. Member wil weten dat er een
    // lead binnenkwam ook als die alleen voor mailreeks koos.
    // sendPushToUser-signature: (userId, { title, body, url?, tag? }).
    try {
      const titel = contactGewenst
        ? `${leadNaam} vraagt persoonlijk contact`
        : `${leadNaam} schreef zich in via Tweede Lente`;
      const omschrijving = contactGewenst
        ? "Wil een vrijblijvend gesprekje van een kwartier. Open haar prospect-kaart in namenlijst."
        : "Nieuwe prospect via de bot. Komt automatisch in je namenlijst.";
      await sendPushToUser(tokenRow.member_id, {
        title: titel,
        body: omschrijving,
        url: "/namenlijst",
        tag: "tweede-lente-opt-in",
      });
    } catch (pushErr) {
      console.warn("Push-notificatie mislukt:", pushErr);
    }

    return NextResponse.json({ ok: true, optInId: optIn.id });
  } catch (e) {
    console.error("freebie-bot/opt-in exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
