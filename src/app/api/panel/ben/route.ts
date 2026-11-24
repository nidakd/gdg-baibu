// Tarayıcıdaki oturum bir panel kullanıcısına mı ait? Sitedeki "Panelde düzenle" butonu sorar.
// Sadece evet/hayır döner; e-posta ya da rol bilgisi vermez.

import { NextResponse } from "next/server";
import { getPanelSession } from "@/lib/panel/auth";
import { hasSupabase } from "@/lib/supabase/env";

export async function GET() {
  let editor = false;
  if (hasSupabase) {
    const { user } = await getPanelSession();
    editor = Boolean(user);
  }
  return NextResponse.json({ editor }, { headers: { "Cache-Control": "private, no-store" } });
}
