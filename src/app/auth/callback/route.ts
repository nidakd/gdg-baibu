// E-postadaki giriş bağlantısı buraya döner: bağlantı oturuma çevrilir, panele geçilir.
//
// İki biçim kabul edilir:
// - token_hash (e-posta şablonu {{ .TokenHash }} ekler): hangi tarayıcıda/cihazda açılırsa açılsın çalışır.
// - code (Supabase'in varsayılan şablonu, PKCE): sadece bağlantının istendiği tarayıcıda çalışır,
//   çünkü doğrulama anahtarı o tarayıcının çerezinde durur. Eski e-postalar için duruyor.

import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/panel/auth";
import { serverClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["email", "magiclink", "signup"];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("sonra"));

  const supabase = await serverClient();
  let error: { code?: string; message: string } | null = null;
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = { message: "bağlantıda kod yok" };
  }
  if (!error) return NextResponse.redirect(new URL(next, origin));

  // Neden düştüğü loglarda görünsün (kod/e-posta yazılmaz)
  console.error("[giriş] bağlantı oturuma çevrilemedi:", error.code ?? error.message);
  return NextResponse.redirect(new URL("/giris?hata=baglanti", origin));
}
