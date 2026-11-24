"use server";

// Şifresiz giriş: e-postaya tek kullanımlık bağlantı. Kimin panelde olduğu söylenmez
// (her durumda aynı cevap); yetki panel_users tablosundan gelir, Supabase hesabından değil.

import { checkBotId } from "botid/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/panel/auth";
import { hasSupabase } from "@/lib/supabase/env";
import { serverClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export async function sendLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = safeNext(String(formData.get("sonra") ?? ""));
  if (!EMAIL.test(email) || email.length > 200)
    return { status: "error", message: "Geçerli bir e-posta yaz.", email };
  if (!hasSupabase) return { status: "error", message: "Panel bu ortamda kurulu değil.", email };

  const { isBot } = await checkBotId();
  if (isBot) return { status: "error", message: "İstek doğrulanamadı, sayfayı yenile.", email };

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // İlk girişte Supabase hesabı açılır; yetki yine de sadece panel_users'taki e-postalara
      // (panel_users'ta olmayan biri giriş yapsa bile RLS hiçbir şey göstermez ve yazdırmaz)
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?sonra=${encodeURIComponent(next)}`,
    },
  });
  // Hesap yoksa da aynı cevap: kimin panelde olduğu anlaşılmasın (hata sadece loglanır, e-posta yazılmaz)
  if (error) console.error("[giriş] bağlantı gönderilemedi:", error.code ?? error.status);
  return { status: "sent", email };
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
