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
