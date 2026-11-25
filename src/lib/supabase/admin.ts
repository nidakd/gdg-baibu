// Sadece sunucuda: Supabase gizli anahtarıyla (RLS'i aşar) form kayıtlarını yazar.
// Anahtar Supabase → Project Settings → API Keys → Secret keys; Vercel'de SUPABASE_SECRET_KEY.
// Asla NEXT_PUBLIC_ ile başlamamalı, tarayıcıya gitmemeli.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

const SECRET = process.env.SUPABASE_SECRET_KEY ?? "";
export const hasSecretKey = Boolean(SUPABASE_URL && SECRET);

let client: SupabaseClient | null = null;

export function adminClient(): SupabaseClient | null {
  if (!hasSecretKey) return null;
  client ??= createClient(SUPABASE_URL, SECRET, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
