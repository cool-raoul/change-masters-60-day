// File: lib/freebie-bots/token.ts
//
// Genereert een 16-char tracking-token (a-z + 0-9) met een cryptografisch
// veilige bron (globalThis.crypto, werkt in Node 18+ en edge). Botsing-kans
// bij 16 chars en 36^16 possibilities: verwaarloosbaar voor pilot-schaal.

const TOKEN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_LENGTE = 16;

export function genereerBotToken(): string {
  // Rejection sampling voorkomt modulo-bias: bytes boven het grootste
  // veelvoud van 36 (= 252) verwerpen we en vullen we opnieuw aan.
  const maxBruikbaar = 256 - (256 % TOKEN_CHARS.length);
  const buffer = new Uint8Array(TOKEN_LENGTE * 2);
  let result = "";
  while (result.length < TOKEN_LENGTE) {
    globalThis.crypto.getRandomValues(buffer);
    for (let i = 0; i < buffer.length && result.length < TOKEN_LENGTE; i++) {
      const byte = buffer[i];
      if (byte >= maxBruikbaar) continue;
      result += TOKEN_CHARS[byte % TOKEN_CHARS.length];
    }
  }
  return result;
}
