// File: lib/mail/resend.ts
//
// Stub voor Resend-mail-integratie. Wordt gebruikt door de cron-route
// /api/cron/freebie-mails om de 5-mail-sequence van freebie-bots te
// versturen.
//
// STUB-GEDRAG: als RESEND_API_KEY niet is ingesteld, logt deze functie
// alleen naar console en returnt een dry-run-resultaat. Dat houdt het
// systeem testbaar zonder echt mails te versturen.
//
// Activeren in productie:
//   1. Maak Resend-account aan op resend.com
//   2. Verifieer een 'from'-domein (bv. mail.my-eleva.com)
//   3. Voeg RESEND_API_KEY toe aan Vercel env vars
//   4. Voeg RESEND_FROM (bv. 'team@mail.my-eleva.com') toe
//   5. Zet feature-flag freebie_mails_actief op true voor pilot-leden
//   6. Cron-route /api/cron/freebie-mails wordt door Vercel ingeschakeld

export type MailResultaat = {
  ok: boolean;
  /** Resend message-id bij succes, anders null. */
  messageId: string | null;
  /** Foutmelding bij ok=false. */
  fout: string | null;
  /** True als er geen echte mail is verstuurd (dry-run). */
  dryRun: boolean;
};

export type MailRequest = {
  naar: string;
  onderwerp: string;
  html: string;
  /** Optioneel: reply-to-adres, bijvoorbeeld member's eigen e-mail. */
  replyTo?: string;
  /**
   * Optioneel: de Resend-API-key van het teamlid zelf (profiles.resend_api_key).
   * Zo wordt elke freebie-mail verstuurd vanuit het eigen Resend-account van de
   * member, net als de e-mail-herinneringen. Valt terug op de globale env-key
   * als 'ie niet is meegegeven.
   */
  apiKey?: string;
  /** Optioneel: from-adres. Valt terug op RESEND_FROM of de default. */
  van?: string;
};

const VAN_DEFAULT = "ELEVA <onboarding@resend.dev>";

/**
 * Verstuur een mail via Resend. Bij ontbrekende API-key: dry-run.
 */
export async function verstuurMail(req: MailRequest): Promise<MailResultaat> {
  const apiKey = req.apiKey ?? process.env.RESEND_API_KEY;
  const van = req.van ?? process.env.RESEND_FROM ?? VAN_DEFAULT;

  if (!apiKey) {
    console.log("[resend dry-run]", {
      naar: req.naar,
      onderwerp: req.onderwerp,
      lengte: req.html.length,
    });
    return {
      ok: true,
      messageId: null,
      fout: null,
      dryRun: true,
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: van,
        to: [req.naar],
        subject: req.onderwerp,
        html: req.html,
        reply_to: req.replyTo,
      }),
    });

    if (!response.ok) {
      const tekst = await response.text();
      return {
        ok: false,
        messageId: null,
        fout: `Resend HTTP ${response.status}: ${tekst}`,
        dryRun: false,
      };
    }

    const data = (await response.json()) as { id?: string };
    return {
      ok: true,
      messageId: data.id ?? null,
      fout: null,
      dryRun: false,
    };
  } catch (e) {
    return {
      ok: false,
      messageId: null,
      fout: e instanceof Error ? e.message : "Onbekende fout",
      dryRun: false,
    };
  }
}
