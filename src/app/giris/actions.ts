"use server";

// Şifresiz giriş. Kimin panelde olduğu söylenmez (her durumda aynı cevap); yetki panel_users
// tablosundan gelir, Supabase hesabından değil.
//
// Asıl yol (gizli anahtar + Gmail varsa): cihazlar arası giriş, bkz. lib/panel/login-requests.ts.
// Oturum bağlantının istendiği tarayıcıda açılır; e-postadaki bağlantı sadece onay verir.
// Yedek yol: Supabase'in kendi e-postası (PKCE; sadece istendiği tarayıcıda açılırsa çalışır).

import type { SupabaseClient } from "@supabase/supabase-js";
import { checkBotId } from "botid/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { escapeHtml } from "@/lib/form-guard";
import { hasGmail, sendGmail } from "@/lib/gmail";
import { safeNext } from "@/lib/panel/auth";
import {
  codeChoices,
  describeDevice,
  newCode,
  newSecret,
  parsePending,
  PENDING_COOKIE,
  REQUEST_TTL_MS,
  sha256,
} from "@/lib/panel/login-requests";
import { adminClient } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { finish, type PollResult, signInHere } from "@/lib/panel/login-session";
import { serverClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "sent" | "waiting" | "error";
  message?: string;
  email?: string;
  /** Bekleyen girişte iki ekranda eşleşecek sayı */
  code?: string;
};

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

  const admin = adminClient();
  if (admin && hasGmail) {
    // Üye olsun olmasın aynı cevap ve aynı çerez; satır ve e-posta yanıttan sonra, sadece üyeye
    const id = crypto.randomUUID();
    const browserSecret = newSecret();
    const code = newCode();
    const store = await cookies();
    store.set(PENDING_COOKIE, `${id}.${browserSecret}`, {
      httpOnly: true,
      secure: origin.startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: REQUEST_TTL_MS / 1000,
    });
    const device = describeDevice(h.get("user-agent"));
    after(() => createRequest(admin, { id, email, browserSecret, code, device, next, origin }));
    return { status: "waiting", email, code };
  }

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // İlk girişte Supabase hesabı açılır; yetki yine de sadece panel_users'taki e-postalara
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?sonra=${encodeURIComponent(next)}`,
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

type NewRequest = {
  id: string;
  email: string;
  browserSecret: string;
  code: string;
  device: string;
  next: string;
  origin: string;
};

/** Sadece panel_users'taki adrese: Supabase giriş anahtarı üretilir, satır yazılır, onay e-postası gider. */
async function createRequest(admin: SupabaseClient, r: NewRequest) {
  const { data: member } = await admin
    .from("panel_users")
    .select("email")
    .eq("email", r.email)
    .maybeSingle();
  if (!member) return;

  // Panele yeni eklenen birinin henüz Supabase hesabı yoksa ilk girişte açılır
  const generate = () => admin.auth.admin.generateLink({ type: "magiclink", email: r.email });
  let { data, error } = await generate();
  if (error) {
    const created = await admin.auth.admin.createUser({ email: r.email, email_confirm: true });
    if (created.error) {
      console.error("[giriş] hesap açılamadı:", created.error.code ?? created.error.status);
      return;
    }
    ({ data, error } = await generate());
  }
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error("[giriş] anahtar üretilemedi:", error?.code ?? error?.status ?? "boş");
    return;
  }

  // Eski istekler birikmesin (bir günden eski olanlar)
  await admin
    .from("login_requests")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const approveSecret = newSecret();
  const { error: insertError } = await admin.from("login_requests").insert({
    id: r.id,
    email: r.email,
    browser_hash: sha256(r.browserSecret),
    approve_hash: sha256(approveSecret),
    token_hash: tokenHash,
    code: r.code,
    device: r.device,
    next_path: r.next,
  });
  if (insertError) {
    console.error("[giriş] istek kaydedilemedi:", insertError.code);
    return;
  }

  const link = `${r.origin}/giris/onay?i=${r.id}&k=${approveSecret}`;
  const choices = codeChoices(r.code);
  const ok = await sendGmail({
    to: r.email,
    subject: "Panel girişini onayla · GDG on Campus AİBÜ",
    html: `
    <div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#202124">
      <p>Merhaba,</p>
      <p><b>${escapeHtml(r.device)}</b> üzerinden GDG on Campus AİBÜ paneline giriş istendi. Onaylarsan giriş, bağlantıyı istediğin tarayıcıda açılır; bu e-postayı telefonda açman sorun değil.</p>
      <p>Onaylamak için giriş istediğin sayfada gördüğün sayıya dokun:</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>${choices
        .map(
          (c) =>
            `<td style="padding-right:10px"><a href="${escapeHtml(`${link}&s=${c}`)}" style="display:inline-block;min-width:56px;text-align:center;border:2px solid #202124;border-radius:12px;padding:10px 0;font-family:monospace;font-size:24px;font-weight:bold;color:#202124;text-decoration:none">${c}</a></td>`,
        )
        .join("")}</tr></table>
      <p style="font-size:13px;color:#5f6368">Bağlantı 15 dakika geçerli. Bu isteği sen yapmadıysan e-postayı yok say; onay vermedikçe kimse giriş yapamaz.</p>
    </div>`,
    text: `${r.device} üzerinden GDG on Campus AİBÜ paneline giriş istendi. Giriş istediğin sayfadaki sayının bağlantısını aç (15 dakika geçerli):\n${choices.map((c) => `${c}: ${link}&s=${c}`).join("\n")}\n\nBu isteği sen yapmadıysan e-postayı yok say.`,
  });
  if (!ok) console.error("[giriş] onay e-postası gönderilemedi");
}

export type { PollResult } from "@/lib/panel/login-session";

/** Bekleyen tarayıcı sorar: onay geldiyse oturum burada açılır. */
export async function checkLogin(): Promise<PollResult> {
  const admin = adminClient();
  const store = await cookies();
  const pending = parsePending(store.get(PENDING_COOKIE)?.value);
  if (!admin || !pending) return { status: "gone" };

  const { data: row } = await admin
    .from("login_requests")
    .select("browser_hash,token_hash,next_path,expires_at,approved_at,used_at")
    .eq("id", pending.id)
    .maybeSingle();
  // Satır henüz yoksa (e-posta yolda) ya da hiç olmayacaksa (üye değil): beklemeye devam;
  // çerez 15 dakikada kendiliğinden düşer
  if (!row) return { status: "waiting" };
  if (row.browser_hash !== sha256(pending.secret) || row.used_at) return finish(store, "gone");
  if (new Date(row.expires_at).getTime() < Date.now()) return finish(store, "gone");
  if (!row.approved_at) return { status: "waiting" };

  return signInHere(admin, store, pending.id, row.token_hash, row.next_path);
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
