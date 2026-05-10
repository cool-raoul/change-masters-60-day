#!/usr/bin/env node
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, serviceKey);

console.log("Buckets opvragen...");
const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
console.log("Buckets:", buckets?.map((b) => b.name) ?? "(geen toegang)", bErr?.message ?? "");

console.log("\nFiles in mini-eleva-voice (top-level):");
const { data: top, error: e1 } = await supabase.storage
  .from("mini-eleva-voice")
  .list("", { limit: 5 });
console.log(top, e1?.message ?? "");
