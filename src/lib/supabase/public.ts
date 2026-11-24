// Oturumsuz, herkese açık okumalar için istemci (önbelleğe alınan site verisi).
// Çerez okumaz; sadece RLS'in herkese açtığı satırları görür.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "./env";

let client: SupabaseClient | null = null;

export function publicClient(): SupabaseClient | null {
  if (!hasSupabase) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
