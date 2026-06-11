// File: lib/freebie-bots/mail-template-types.ts
//
// Cross-bot generieke types voor mail-templates. Tweede Lente en
// Tweede Wind gebruiken dezelfde structuur maar verschillende
// antwoorden-types, daarom een generic.

export type GenericMailInput = {
  leadVoornaam: string;
  memberVoornaam: string;
  spiegelTekst: string | null;
  /** Bot-specifieke antwoorden, opaak in cross-bot context. */
  antwoorden: unknown;
  unsubscribeUrl: string;
  /**
   * Deelbare mini-ELEVA-URL van deze lead (zonder query-params), of null
   * als er (nog) geen actieve uitnodiging bestaat. Templates voegen zelf
   * een ?bron=mail-dN stempel toe zodat het bezoek herleidbaar is.
   */
  miniElevaUrl: string | null;
  /**
   * True zodra de lead al minstens één keer in de mini-ELEVA is geweest
   * (activiteit op de uitnodiging). Templates tonen dan een korte
   * verwijzing in plaats van het volledige introductie-blok.
   */
  alInMiniEleva: boolean;
};

export type GenericMailTemplate = {
  dag: 1 | 2 | 3 | 4 | 5;
  onderwerp: string;
  bouwHtml: (input: GenericMailInput) => string;
};

/**
 * Adapter: een bot-specifieke MailTemplate (waarin antwoorden een
 * specifiek type is) presenteren als generic. Type-erasure is veilig
 * omdat de template-functies hun antwoorden alleen typecast-vrij
 * gebruiken via het HTML-bouwen.
 */
export function alsGenericTemplate<TInput extends { antwoorden: unknown }>(
  template: {
    dag: 1 | 2 | 3 | 4 | 5;
    onderwerp: string;
    bouwHtml: (input: TInput) => string;
  },
): GenericMailTemplate {
  return {
    dag: template.dag,
    onderwerp: template.onderwerp,
    bouwHtml: (input: GenericMailInput) =>
      template.bouwHtml(input as unknown as TInput),
  };
}
