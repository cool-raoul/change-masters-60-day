// File: lib/freebie-bots/token.ts
//
// Genereert een 16-char hex tracking-token (hergebruik patroon van
// productadvies-test: a-z + 0-9). Botsing-kans bij 16 chars en 36^16
// possibilities: verwaarloosbaar voor pilot-schaal.

const TOKEN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_LENGTE = 16;

export function genereerBotToken(): string {
  let result = "";
  for (let i = 0; i < TOKEN_LENGTE; i++) {
    result += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return result;
}
