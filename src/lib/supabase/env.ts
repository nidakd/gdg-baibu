// Supabase bağlantı bilgisi. Yayınlanabilir anahtar tarayıcıya da gider; yetkiler RLS ile korunur.
// Değişkenler yoksa (ör. yerelde .env.local eksik) site team.json'dan çalışmaya devam eder.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
