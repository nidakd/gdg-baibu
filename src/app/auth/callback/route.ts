// E-postadaki giriş bağlantısı buraya döner: kod oturuma çevrilir, panele geçilir.

import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/panel/auth";
import { serverClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("sonra"));
  if (code) {
    const supabase = await serverClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/giris?hata=baglanti", origin));
}
