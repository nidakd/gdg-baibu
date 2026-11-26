"use client";

// Tarayıcıda, giriş yapan panel kullanıcısının oturumuyla (çerezden) çalışan istemci.
// Büyük dosyaları sunucu sınırına (4.4 MB) takılmadan doğrudan Storage'a yüklemek için.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | null = null;

export function browserClient(): SupabaseClient {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
