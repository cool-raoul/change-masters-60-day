// File: app/api/freebie-bot/intekening-vooraf/route.ts
//
// POST /api/freebie-bot/intekening-vooraf
// Body: { token, leadVoornaam, leadAchternaam, leadEmail, toestemming }
// Response: { ok: true } of { error }
//
// Wordt aangeroepen direct nadat de vrouw naam + e-mail + akkoord
// invult VOORDAT ze de 7 vragen doet. Maakt de prospect alvast aan
// in de namenlijst van de member, zodat ook vrouwen die de
// vragenlijst NIET afmaken zichtbaar zijn.
//
// 1. Token valideren
// 2. Freebie-row ophalen of aanmaken
// 3. Opt-in-rij aanmaken met status='intekening' (geen bot_antwoorden nog)
// 4. Prospect aanmaken (of bestaande aanvullen) met tag
//    'Freebie: <Bot-titel>' en notitie 'INTEKENING'
// 5. Push-notificatie naar member: 'X heeft net ingetekend, vragenlijst
//    nog niet ingevuld'

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { getBotConfig } from "@/lib/freebie-bots/registry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const leadVoornaam = (body.leadVoornaam as string | undefined)?.trim();
    const leadAchternaam = (body.leadAchternaam as string | undefined)?.trim();
    const leadEmail = (body.leadEmail as string | undefined)?.trim();
    const toestemming = body.toestemming === true;
    // Optionele herkomst-context uit URL-parameters (ManyChat,
    // Instagram, Facebook). Wordt opgeslagen op prospect-rij zodat
    // member ook zonder telefoon contact kan opnemen.
    const herkomstInstagram = (body.herkomstInstagram as string | undefined)?.trim() || null;
    const herkomstFacebook = (body.herkomstFacebook as string | undefined)?.trim() || null;
    const herkomstBron = (body.herkomstBron as string | undefined)?.trim() || null;

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!leadVoornaam || !leadAchternaam) {
      return NextResponse.json(
        { error: "Voornaam en achternaam zijn verplicht" },
        { status: 400 },
      );
    }
    if (!leadEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) {
      return NextResponse.json(
        { error: "E-mailadres ongeldig" },
        { status: 400 },
      );
    }
    if (!toestemming) {
      return NextResponse.json(
        { error: "Toestemming is verplicht" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Token validatie
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

    // Freebie-rij ophalen of aanmaken op basis van bot-slug uit token
    const botSlug = (tokenRow.bot_slug ?? "energie-en-focus") as string;
    const botConfig = getBotConfig(botSlug);
    const botTitel =
      botConfig?.titel ??
      botSlug
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");

    let freebieRij: { id: string } | null = null;
    const { data: bestaandeFreebie } = await supabase
      .from("freebies")
      .select("id")
      .eq("slug", botSlug)
      .maybeSingle();
    freebieRij = (bestaandeFreebie as { id: string } | null) ?? null;
    if (!freebieRij) {
      const { data: nieuweFreebie } = await supabase
        .from("freebies")
        .insert({
          slug: botSlug,
          titel: botTitel,
          ondertitel: botConfig?.ondertitel ?? "Bot-pilot freebie",
          vorm: "test",
          onderwerp: botSlug,
          beschrijving: botConfig?.beschrijving ?? `Bot-pilot (${botSlug}).`,
          actief: true,
        })
        .select("id")
        .single();
      if (!nieuweFreebie) {
        return NextResponse.json(
          { error: "Freebie-rij aanmaken mislukt" },
          { status: 500 },
        );
      }
      freebieRij = nieuweFreebie as { id: string };
    }

    const leadNaam = `${leadVoornaam} ${leadAchternaam}`;
    const datum = new Date().toLocaleDateString("nl-NL");
    const tijd = new Date().toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Check of er al een opt-in is voor deze (member, email, freebie)
    // combinatie. Zo ja: hergebruik die. Zo nee: nieuw.
    const { data: bestaandeOptIn } = await supabase
      .from("freebie_opt_ins")
      .select("id, status")
      .eq("member_id", tokenRow.member_id)
      .eq("freebie_id", freebieRij.id)
      .ilike("lead_email", leadEmail)
      .maybeSingle();

    let optInId: string;
    if (bestaandeOptIn) {
      optInId = bestaandeOptIn.id;
      // Status terug naar intekening (in geval ze opnieuw start)
      await supabase
        .from("freebie_opt_ins")
        .update({ lead_naam: leadNaam, status: "nieuw" })
        .eq("id", optInId);
    } else {
      const { data: nieuw, error: optInErr } = await supabase
        .from("freebie_opt_ins")
        .insert({
          freebie_id: freebieRij.id,
          member_id: tokenRow.member_id,
          lead_naam: leadNaam,
          lead_email: leadEmail,
          bron_kanaal: `${botSlug}-bot`,
          status: "nieuw",
        })
        .select("id")
        .single();
      if (optInErr || !nieuw) {
        console.error("intekening opt-in insert fout:", optInErr);
        return NextResponse.json(
          { error: "Intekening-opslag mislukt" },
          { status: 500 },
        );
      }
      optInId = nieuw.id;
    }

    // Bouw herkomst-regels (optioneel) voor in notitie
    const herkomstRegels: string[] = [];
    if (herkomstBron) herkomstRegels.push(`Via: ${herkomstBron}`);
    if (herkomstInstagram)
      herkomstRegels.push(`Instagram: @${herkomstInstagram}`);
    if (herkomstFacebook)
      herkomstRegels.push(`Facebook: ${herkomstFacebook}`);

    // Prospect aanmaken of aanvullen (zelfde logica als opt-in-route)
    const intekeningNotitie = [
      `🌷 INTEKENING ${botTitel.toUpperCase()} (${datum} ${tijd})`,
      ...herkomstRegels,
      `Net ingetekend, vragenlijst nog niet ingevuld.`,
      `Member kan even afwachten of de bot wordt afgemaakt.`,
    ].join("\n");

    const NIEUWE_TAG = `Freebie: ${botTitel}`;

    const { data: bestaandeProspect } = await supabase
      .from("prospects")
      .select("id, volledige_naam, notities, ingezette_tools, prioriteit, gearchiveerd, instagram, facebook")
      .eq("user_id", tokenRow.member_id)
      .ilike("email", leadEmail)
      .maybeSingle();

    if (bestaandeProspect) {
      const huidigeTools = (bestaandeProspect.ingezette_tools ?? []) as string[];
      const opgeschoond = huidigeTools.filter((t) => t !== "Tweede Lente bot");
      const nieuweTools = opgeschoond.includes(NIEUWE_TAG)
        ? opgeschoond
        : [...opgeschoond, NIEUWE_TAG];

      const aangevuldeNotitie =
        (bestaandeProspect.notities ? `${bestaandeProspect.notities}\n\n` : "") +
        intekeningNotitie;

      const updateData: Record<string, unknown> = {
        notities: aangevuldeNotitie,
        ingezette_tools: nieuweTools,
        gearchiveerd: false,
        updated_at: new Date().toISOString(),
      };
      // Naam update als anders
      const oudeNaam = (bestaandeProspect.volledige_naam ?? "").trim();
      if (leadNaam && oudeNaam && leadNaam.toLowerCase() !== oudeNaam.toLowerCase()) {
        updateData.volledige_naam = leadNaam;
      }
      // Vul Instagram/Facebook aan als die ontbraken
      if (herkomstInstagram && !bestaandeProspect.instagram) {
        updateData.instagram = `https://instagram.com/${herkomstInstagram}`;
      }
      if (herkomstFacebook && !bestaandeProspect.facebook) {
        updateData.facebook = herkomstFacebook.startsWith("http")
          ? herkomstFacebook
          : `https://facebook.com/${herkomstFacebook}`;
      }
      await supabase.from("prospects").update(updateData).eq("id", bestaandeProspect.id);
    } else {
      await supabase.from("prospects").insert({
        user_id: tokenRow.member_id,
        volledige_naam: leadNaam,
        email: leadEmail,
        bron: "social",
        pipeline_fase: "prospect",
        prioriteit: "normaal",
        notities: intekeningNotitie,
        ingezette_tools: [NIEUWE_TAG],
        instagram: herkomstInstagram
          ? `https://instagram.com/${herkomstInstagram}`
          : null,
        facebook: herkomstFacebook
          ? herkomstFacebook.startsWith("http")
            ? herkomstFacebook
            : `https://facebook.com/${herkomstFacebook}`
          : null,
      });
    }

    // Push naar member
    try {
      await sendPushToUser(tokenRow.member_id, {
        title: `${leadNaam} is ingetekend op ${botTitel}`,
        body: "Vragenlijst nog niet ingevuld. Komt vanzelf bij voltooien, of blijft hangen op deze stap.",
        url: "/namenlijst",
        tag: `${botSlug}-intekening`,
      });
    } catch (pushErr) {
      console.warn("Push intekening mislukt:", pushErr);
    }

    return NextResponse.json({ ok: true, optInId });
  } catch (e) {
    console.error("intekening-vooraf exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
