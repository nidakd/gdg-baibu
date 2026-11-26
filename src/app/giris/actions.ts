"use server";

// Şifresiz giriş: e-postaya tek kullanımlık bağlantı. Kimin panelde olduğu söylenmez
// (her durumda aynı cevap); yetki panel_users tablosundan gelir, Supabase hesabından değil.

import type { SupabaseClient } from "@supabase/supabase-js";
import { checkBotId } from "botid/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { escapeHtml } from "@/lib/form-guard";
import { hasGmail, sendGmail } from "@/lib/gmail";
import { safeNext } from "@/lib/panel/auth";
import { adminClient } from "@/lib/supabase/admin";
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
  const callback = `${origin}/auth/callback?sonra=${encodeURIComponent(next)}`;

  // Asıl yol: bağlantıyı biz üretip kulüp Gmail'inden gönderiyoruz. Bağlantı token_hash taşır,
  // her tarayıcıda/cihazda açılır; Supabase'in saatlik e-posta sınırına ve şablonuna bağlı değil.
  const admin = adminClient();
  if (admin && hasGmail) {
    // Cevaptan sonra çalışır: yanıt süresinden e-postanın panelde olup olmadığı anlaşılmasın
    after(() => sendViaGmail(admin, email, callback));
    return { status: "sent", email };
  }

  // Yedek (gizli anahtar ya da Gmail ayarı olmayan ortamlar): Supabase'in kendi e-postası.
  // Bu bağlantı PKCE'dir: sadece istendiği tarayıcıda açılırsa giriş yapar.
  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // İlk girişte Supabase hesabı açılır; yetki yine de sadece panel_users'taki e-postalara
      // (panel_users'ta olmayan biri giriş yapsa bile RLS hiçbir şey göstermez ve yazdırmaz)
      shouldCreateUser: true,
      emailRedirectTo: callback,
    },
  });
  // Supabase'in kendi e-posta servisi saatte birkaç e-postayla sınırlı: bunu açıkça söyle
  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    return {
      status: "error",
      message:
        "Kısa sürede çok fazla giriş bağlantısı istendi. Yaklaşık bir saat sonra tekrar dene; daha önce gelen bağlantı hâlâ geçerliyse onu kullanabilirsin.",
      email,
    };
  }
  // Diğer hatalarda aynı cevap: kimin panelde olduğu anlaşılmasın (hata sadece loglanır, e-posta yazılmaz)
  if (error) console.error("[giriş] bağlantı gönderilemedi:", error.code ?? error.status);
  return { status: "sent", email };
}

/**
 * Sadece panel_users'taki adreslere bağlantı gider; diğerlerine sessizce hiçbir şey gönderilmez
 * (cevap yine aynı) ve Supabase hesabı da açılmaz. Panele yeni eklenen birinin henüz hesabı
 * yoksa ilk girişte açılır.
 */
async function sendViaGmail(admin: SupabaseClient, email: string, callback: string) {
  const { data: member } = await admin
    .from("panel_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (!member) return;

  const generate = () => admin.auth.admin.generateLink({ type: "magiclink", email });
  let { data, error } = await generate();
  if (error) {
    const created = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (created.error) {
      console.error("[giriş] hesap açılamadı:", created.error.code ?? created.error.status);
      return;
    }
    ({ data, error } = await generate());
  }
  const hash = data?.properties?.hashed_token;
  if (error || !hash) {
    console.error("[giriş] bağlantı üretilemedi:", error?.code ?? error?.status ?? "boş");
    return;
  }

  const link = `${callback}&token_hash=${encodeURIComponent(hash)}&type=email`;
  const ok = await sendGmail({
    to: email,
    subject: "Panel giriş bağlantın · GDG on Campus AİBÜ",
    html: `
    <div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#202124">
      <p>Merhaba,</p>
      <p>GDG on Campus AİBÜ paneline girmek için aşağıdaki düğmeye bas. Bağlantı tek kullanımlık ve 1 saat geçerli; istediğin cihazda açabilirsin.</p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#4285f4;color:#fff;padding:9px 16px;border-radius:999px;text-decoration:none;font-size:14px">Panele giriş yap</a></p>
      <p style="font-size:13px;color:#5f6368">Bu isteği sen yapmadıysan e-postayı yok say; bağlantıya tıklanmadıkça kimse giriş yapamaz.</p>
    </div>`,
    text: `GDG on Campus AİBÜ paneline girmek için bu bağlantıyı aç (tek kullanımlık, 1 saat geçerli):\n${link}\n\nBu isteği sen yapmadıysan e-postayı yok say.`,
  });
  if (!ok) console.error("[giriş] giriş e-postası gönderilemedi");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
