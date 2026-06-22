// File: app/api/freebie-bot/opt-in/route.ts
//
// POST /api/freebie-bot/opt-in
// Body: {
//   token: string,
//   leadNaam: string,
//   leadEmail: string,
//   antwoorden: object,
//   spiegelTekst: string | null,
//   contactGewenst: boolean
// }
// Response: { ok: true } of { error }
//
// 1. Token valideren + bot-slug ophalen
// 2. Freebie-rij ophalen / on-the-fly aanmaken voor deze bot-slug
// 3. Opt-in rij maken / aanvullen in freebie_opt_ins
// 4. Prospect aanmaken / aanvullen in namenlijst van de member
// 5. Bij contactGewenst: push-notificatie naar member sturen

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { planMailSequence } from "@/lib/freebie-bots/mail-queue";
import { getBotConfig } from "@/lib/freebie-bots/registry";
import { verstuurMail } from "@/lib/mail/resend";
import { warmNaarOpvolgen } from "@/lib/prospect/warm-naar-opvolgen";

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
    const antwoorden = body.antwoorden as Record<string, unknown> | undefined;
    const spiegelTekst = body.spiegelTekst as string | undefined;
    const contactGewenst = body.contactGewenst === true;
    const herkomstInstagram = (body.herkomstInstagram as string | undefined)?.trim() || null;
    const herkomstFacebook = (body.herkomstFacebook as string | undefined)?.trim() || null;
    const herkomstBron = (body.herkomstBron as string | undefined)?.trim() || null;

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

    // Freebie-row ophalen op basis van de bot-slug uit de token.
    // Wordt on-the-fly aangemaakt als die nog niet bestaat (voor
    // pilot, voorkomt blokkade bij eerste run van een nieuwe bot).
    const botSlug = (tokenRow.bot_slug ?? "energie-en-focus") as string;
    let freebieRij: { id: string } | null = null;
    const { data: bestaandeFreebie } = await supabase
      .from("freebies")
      .select("id")
      .eq("slug", botSlug)
      .maybeSingle();
    freebieRij = (bestaandeFreebie as { id: string } | null) ?? null;

    if (!freebieRij) {
      const { data: nieuweFreebie, error: freebieErr } = await supabase
        .from("freebies")
        .insert({
          slug: botSlug,
          titel: botSlug
            .split("-")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" "),
          ondertitel: "Bot-pilot freebie",
          vorm: "test",
          onderwerp: botSlug,
          beschrijving: `Bot-pilot voor freebie-toolkit (${botSlug}).`,
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

    // Bestaande opt-in (van intekening-vooraf) aanvullen, of nieuwe maken
    // als die er nog niet was (backwards compat met legacy clients).
    const { data: bestaandeOptIn } = await supabase
      .from("freebie_opt_ins")
      .select("id, bot_antwoorden")
      .eq("member_id", tokenRow.member_id)
      .eq("freebie_id", freebieRij.id)
      .ilike("lead_email", leadEmail)
      .maybeSingle();

    let optIn: { id: string };
    if (bestaandeOptIn) {
      const { error: updErr } = await supabase
        .from("freebie_opt_ins")
        .update({
          lead_naam: leadNaam,
          bot_antwoorden: antwoorden,
          spiegel_tekst: spiegelTekst ?? null,
        })
        .eq("id", bestaandeOptIn.id);
      if (updErr) {
        console.error("opt-in update fout:", updErr);
        return NextResponse.json(
          { error: "Opt-in update mislukt" },
          { status: 500 },
        );
      }
      optIn = { id: bestaandeOptIn.id };
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
          bot_antwoorden: antwoorden,
          spiegel_tekst: spiegelTekst ?? null,
        })
        .select("id")
        .single();
      if (optInErr || !nieuw) {
        console.error("opt-in insert fout:", optInErr);
        return NextResponse.json(
          { error: "Opt-in opslag mislukt" },
          { status: 500 },
        );
      }
      optIn = nieuw;
    }

    // Prospect-rij maken in de namenlijst van de member. Klantomgeving
    // bewust NIET, want dat is voor klanten die al iets besteld hebben.
    // Freebie-leads zijn prospects (warm via bot).
    //
    // bron='social': prospects.bron heeft een check-constraint die alleen
    // warm/social/doorverwijzing/koud accepteert. Freebie-bots komen via
    // social-trigger-woord, dus 'social' is natuurlijk. De specifieke bot
    // staat duidelijk bovenaan in de notities zodat het direct herkenbaar
    // is in /namenlijst.
    const datum = new Date().toLocaleDateString("nl-NL");
    const botTitel =
      getBotConfig(botSlug)?.titel ??
      botSlug
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
    // Generic notitie: alle antwoord-velden plat dumpen. Werkt voor
    // alle score-bots zonder code-aanpassing.
    const antwoordRegels = Object.entries(antwoorden).map(([k, v]) => {
      const w = Array.isArray(v) ? v.join(", ") : String(v);
      return `${k}: ${w}`;
    });
    const herkomstRegels: string[] = [];
    if (herkomstBron) herkomstRegels.push(`Via: ${herkomstBron}`);
    if (herkomstInstagram)
      herkomstRegels.push(`Instagram: @${herkomstInstagram}`);
    if (herkomstFacebook)
      herkomstRegels.push(`Facebook: ${herkomstFacebook}`);

    const notitieRegels = [
      `🌷 VIA ${botTitel.toUpperCase()} (${datum})`,
      ...herkomstRegels,
      ...antwoordRegels,
      contactGewenst ? "⚡ VRAAGT PERSOONLIJK CONTACT" : "Mailreeks-opt-in",
      "",
      "Spiegel die ze zag:",
      spiegelTekst ?? "(geen)",
    ].join("\n");

    // Check eerst of er al een prospect-rij bestaat voor deze member +
    // email-combinatie. Zo ja: aanvullen ipv dubbele kaart maken.
    const { data: bestaande } = await supabase
      .from("prospects")
      .select("id, volledige_naam, notities, ingezette_tools, telefoon, prioriteit, gearchiveerd, instagram, facebook")
      .eq("user_id", tokenRow.member_id)
      .ilike("email", leadEmail)
      .maybeSingle();

    // Tool-tags:
    //   'Freebie: <Bot-Titel>' = ingetekend (zet door intekening-vooraf
    //   of door deze route als legacy)
    //   'Vragenlijst ingevuld'  = bot helemaal afgemaakt (alleen door
    //   deze route)
    // Backwards compat: oude 'Tweede Lente bot' wordt vervangen.
    const FREEBIE_TAG = `Freebie: ${botTitel}`;
    const INGEVULD_TAG = "Vragenlijst ingevuld";
    const OUDE_TAG = "Tweede Lente bot";
    const huidigeTools = (bestaande?.ingezette_tools ?? []) as string[];
    const opgeschoond = huidigeTools.filter((t) => t !== OUDE_TAG);
    const metFreebie = opgeschoond.includes(FREEBIE_TAG)
      ? opgeschoond
      : [...opgeschoond, FREEBIE_TAG];
    const nieuweTools = metFreebie.includes(INGEVULD_TAG)
      ? metFreebie
      : [...metFreebie, INGEVULD_TAG];

    // Prospect-id over beide takken heen onthouden, zodat we bij een
    // contact-verzoek de warm-naar-opvolgen-trigger kunnen aanroepen.
    let prospectId: string | null = bestaande?.id ?? null;

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
      // Instagram/Facebook aanvullen vanuit herkomst-context, alleen
      // als die nog leeg waren (oude waarde niet overschrijven)
      if (herkomstInstagram && !bestaande.instagram) {
        updateData.instagram = `https://instagram.com/${herkomstInstagram}`;
      }
      if (herkomstFacebook && !bestaande.facebook) {
        updateData.facebook = herkomstFacebook.startsWith("http")
          ? herkomstFacebook
          : `https://facebook.com/${herkomstFacebook}`;
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
      const { data: nieuweProspect, error: prospectErr } = await supabase
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
          instagram: herkomstInstagram
            ? `https://instagram.com/${herkomstInstagram}`
            : null,
          facebook: herkomstFacebook
            ? herkomstFacebook.startsWith("http")
              ? herkomstFacebook
              : `https://facebook.com/${herkomstFacebook}`
            : null,
        })
        .select("id")
        .single();

      if (prospectErr) {
        console.error("Prospect-rij niet aangemaakt:", prospectErr);
      }
      prospectId = nieuweProspect?.id ?? null;
    }

    // Warm geworden: prospect liet bij de opt-in een contact-intentie achter
    // (telefoon / "ik wil contact") → naar Opvolgen + opvolg-herinnering.
    // Lichte freebies; de zware productadvies-lijst regelt z'n eigen
    // opvolging bij het invullen.
    if (contactGewenst && prospectId) {
      await warmNaarOpvolgen({
        admin: supabase,
        prospectId,
        memberId: tokenRow.member_id,
        reden: `${leadNaam} vraagt persoonlijk contact`,
        beschrijving:
          "Liet contactgegevens achter via een freebie. Tijd om persoonlijk op te volgen.",
      });
    }

    // Mini-ELEVA-uitnodiging wordt hier BEWUST niet automatisch aangemaakt.
    // Een eigen omgeving ontstaat alleen als de prospect die via het mail-
    // proces aanvraagt, of als het teamlid 'm zelf aanmaakt vanuit de
    // prospect-kaart. Zolang er geen uitnodiging is, laat de mail-sequence
    // het omgeving-blok stilletjes weg.

    // Push-notificatie naar member: bot is afgerond (vragenlijst klaar).
    // De eerdere 'intekening'-push is al gestuurd door
    // /api/freebie-bot/intekening-vooraf. Deze melding markeert het
    // moment dat de prospect-kaart compleet is.
    // Eerste volledige vangst = de antwoorden waren er nog niet vóór deze
    // call (bestaandeOptIn zonder bot_antwoorden, of helemaal geen opt-in).
    // Bewust LOSGEKOPPELD van de mail-queue: de uitkomst-mail + push gaan ook
    // uit als de freebie_mail_queue-tabel (nog) niet bestaat of de insert
    // faalt. Eerder hing dit aan planMailSequence.aangemaakt > 0, waardoor een
    // ontbrekende queue-tabel de uitkomst-mail STIL liet wegvallen. Werkt voor
    // alle bots: intekening-vooraf maakt de opt-in zonder antwoorden, dus de
    // opt-in-call (waar de antwoorden binnenkomen) is de eerste vangst.
    const eersteCapture = !(
      bestaandeOptIn as { bot_antwoorden?: unknown } | null
    )?.bot_antwoorden;

    // Plan de 5-mail-vervolgreeks (idempotent; faalt veilig als de
    // queue-tabel ontbreekt). Losgekoppeld van de uitkomst-mail-gate.
    await planMailSequence(supabase, {
      optInId: optIn.id,
      freebieSlug: botSlug,
      memberId: tokenRow.member_id,
      leadNaam,
      leadEmail,
    });

    if (eersteCapture) {
      // Push naar member: de lead is binnen + de vragenlijst is ingevuld.
      // NB: de 'wil persoonlijk contact'-melding doet de aparte route
      // /api/freebie-bot/contact, pas als er een telefoonnummer is
      // achtergelaten. Hier dus de neutrale 'ingevuld'-melding.
      try {
        const titel = contactGewenst
          ? `${leadNaam} vraagt persoonlijk contact`
          : `${leadNaam} heeft ${botTitel} ingevuld`;
        const omschrijving = contactGewenst
          ? "Wil een vrijblijvend gesprekje van een kwartier. Open haar prospect-kaart."
          : "Vragenlijst en overzicht zijn klaar. Open haar prospect-kaart om de antwoorden te zien.";
        await sendPushToUser(tokenRow.member_id, {
          title: titel,
          body: omschrijving,
          url: "/namenlijst",
          tag: `${botSlug}-compleet`,
        });
      } catch (pushErr) {
        console.warn("Push-notificatie mislukt:", pushErr);
      }

      // Direct de PROSPECT-uitkomst mailen (transactioneel), via het gedeelde
      // ELEVA-Resend-account, gepersonaliseerd met de naam van het teamlid als
      // afzender + hun e-mail als reply-to. Zo klopt de belofte "je uitkomst is
      // verstuurd naar je mail".
      //
      // BELANGRIJK: we mailen de PROSPECT-uitkomst (een spiegeling van wat ze op
      // het scherm zag), NOOIT de spiegel-tekst. Die spiegel-tekst is member-intel
      // (heat-score, profiel, medische punten) en blijft alleen in de prospect-
      // kaart van het teamlid staan. De mail wordt per bot opgebouwd via
      // bouwUitkomstMail in de registry; heeft een bot die (nog) niet, dan gaat er
      // bewust geen directe mail uit (dan lekt er ook niks).
      //
      // Faalt veilig: de opt-in is al opgeslagen, en zonder Resend-sleutel valt
      // verstuurMail terug op dry-run (de lead zag de uitkomst al op het scherm).
      const uitkomstBouwer = getBotConfig(botSlug)?.bouwUitkomstMail;
      if (uitkomstBouwer) {
        try {
          const mail = uitkomstBouwer({
            leadVoornaam: leadNaam.split(" ")[0] || "jij",
            antwoorden,
          });
          if (mail) {
            const { data: member } = await supabase
              .from("profiles")
              .select("full_name, notificatie_email, email")
              .eq("id", tokenRow.member_id)
              .maybeSingle();
            const m = member as {
              full_name?: string | null;
              notificatie_email?: string | null;
              email?: string | null;
            } | null;
            const fromEmail =
              process.env.RESEND_FROM_EMAIL ?? "team@mail.my-eleva.com";
            const memberVoornaam =
              (m?.full_name ?? "").split(" ")[0] || "ELEVA";
            await verstuurMail({
              naar: leadEmail,
              onderwerp: mail.onderwerp,
              html: mail.html,
              van: `${memberVoornaam} <${fromEmail}>`,
              replyTo: m?.notificatie_email ?? m?.email ?? undefined,
            });
          }
        } catch (mailErr) {
          console.warn("uitkomst-mail versturen mislukt (niet fataal):", mailErr);
        }
      }
    }

    return NextResponse.json({ ok: true, optInId: optIn.id });
  } catch (e) {
    console.error("freebie-bot/opt-in exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
