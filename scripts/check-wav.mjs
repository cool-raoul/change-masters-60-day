#!/usr/bin/env node
// Check de WAV-header + bestandsgrootte van een Supabase Storage spraakbericht.
// Gebruik: node scripts/check-wav.mjs <path-in-storage>
// Bv: node scripts/check-wav.mjs "d9234f2d-27ae-44a0-a501-3f3ad71e45f7/member/1778404097951.wav"

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const path = process.argv[2];
if (!path) {
  console.error("Geef een audio_path mee als argument.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We hebben de service-role key nodig om Storage admin te benaderen.
// Voor nu: we kunnen ook gewoon de signed URL ophalen via REST + ANON key
// en dan downloaden. Als 'r geen service-role is, fallback.
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !serviceKey) {
  console.error("Supabase URL of key ontbreekt in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { data: signed, error } = await supabase.storage
  .from("mini-eleva-voice")
  .createSignedUrl(path, 60);

if (error || !signed) {
  console.error("Kon geen signed URL maken:", error?.message);
  process.exit(1);
}

console.log("Signed URL gemaakt, downloaden...");
const res = await fetch(signed.signedUrl);
if (!res.ok) {
  console.error("Download faalde:", res.status, res.statusText);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
console.log(`\n📦 Bestandsgrootte: ${buf.length} bytes (${(buf.length / 1024).toFixed(1)} KB)`);

// Parse WAV-header
if (buf.length < 44) {
  console.error("Bestand te klein voor WAV-header");
  process.exit(1);
}

const riff = buf.slice(0, 4).toString("ascii");
const riffSize = buf.readUInt32LE(4);
const wave = buf.slice(8, 12).toString("ascii");
const fmt = buf.slice(12, 16).toString("ascii");
const fmtSize = buf.readUInt32LE(16);
const audioFormat = buf.readUInt16LE(20);
const numChannels = buf.readUInt16LE(22);
const sampleRate = buf.readUInt32LE(24);
const byteRate = buf.readUInt32LE(28);
const blockAlign = buf.readUInt16LE(32);
const bitsPerSample = buf.readUInt16LE(34);
const dataMarker = buf.slice(36, 40).toString("ascii");
const dataSize = buf.readUInt32LE(40);

console.log("\n🎵 WAV-header:");
console.log(`  RIFF marker:       "${riff}"  (verwacht: "RIFF")`);
console.log(`  RIFF chunk size:   ${riffSize.toLocaleString()} bytes  (verwacht: ${(buf.length - 8).toLocaleString()})`);
console.log(`  WAVE marker:       "${wave}"  (verwacht: "WAVE")`);
console.log(`  fmt  marker:       "${fmt}"  (verwacht: "fmt ")`);
console.log(`  fmt size:          ${fmtSize}  (verwacht: 16 voor PCM)`);
console.log(`  Audio format:      ${audioFormat}  (1 = PCM)`);
console.log(`  Channels:          ${numChannels}`);
console.log(`  Sample rate:       ${sampleRate} Hz`);
console.log(`  Byte rate:         ${byteRate.toLocaleString()} bytes/sec`);
console.log(`  Block align:       ${blockAlign}`);
console.log(`  Bits per sample:   ${bitsPerSample}`);
console.log(`  data marker:       "${dataMarker}"  (verwacht: "data")`);
console.log(`  data size:         ${dataSize.toLocaleString()} bytes`);

const verwachteDataSize = buf.length - 44;
const headerKlopt = riff === "RIFF" && wave === "WAVE" && fmt === "fmt " && dataMarker === "data";
const sizeKlopt = dataSize === verwachteDataSize;
const duurUitDataSize = dataSize / byteRate;
const duurUitFileSize = (buf.length - 44) / byteRate;

console.log("\n⏱ Duur-berekeningen:");
console.log(`  Volgens header data-size:  ${duurUitDataSize.toFixed(2)} sec`);
console.log(`  Volgens werkelijke bytes:  ${duurUitFileSize.toFixed(2)} sec`);

console.log("\n🔍 Verdict:");
console.log(`  Header-structuur klopt:    ${headerKlopt ? "✓" : "✗"}`);
console.log(`  data-size = werkelijk:     ${sizeKlopt ? "✓" : "✗  (header zegt " + dataSize + " maar werkelijk is " + verwachteDataSize + ")"}`);
if (Math.abs(duurUitDataSize - duurUitFileSize) > 0.5) {
  console.log("  ⚠ MISMATCH tussen header-duur en werkelijke duur — dat verklaart playback-cutoff.");
} else if (duurUitDataSize < 6 && duurUitFileSize < 6) {
  console.log("  ⚠ Bestand bevat ECHT maar ~5 sec audio. De recording-pipeline kapt af.");
} else if (sizeKlopt) {
  console.log(`  ✓ Bestand zelf is ${duurUitFileSize.toFixed(0)}s — als playback bij 5s stopt, ligt 't bij <audio> of HTTP-serving.`);
}
