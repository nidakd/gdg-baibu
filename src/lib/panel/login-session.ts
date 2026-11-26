// Bekleyen girişi bu tarayıcıda oturuma çevirir (sadece sunucu; server action değil,
// tarayıcıdan doğrudan çağrılamaz). Kullananlar: giris/actions.ts ve giris/onay/actions.ts.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { cookies } from "next/headers";
import { safeNext } from "@/lib/panel/auth";
import { serverClient } from "@/lib/supabase/server";
import { PENDING_COOKIE } from "./login-requests";

export type PollResult = { status: "waiting" | "done" | "gone"; next?: string };
type CookieStore = Awaited<ReturnType<typeof cookies>>;

/** Anahtarı bir kez kullanılmış say (yarışta ikinci istek boş döner), sonra bu tarayıcıda oturum aç. */
export async function signInHere(
  admin: SupabaseClient,
  store: CookieStore,
  id: string,
  tokenHash: string,
  next: string,
): Promise<PollResult> {
  const { data: claimed } = await admin
    .from("login_requests")
    .update({ used_at: new Date().toISOString() })
    .eq("id", id)
    .is("used_at", null)
    .select("id");
  if (!claimed?.length) return finish(store, "gone");

  const supabase = await serverClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error) {
    console.error("[giriş] oturum açılamadı:", error.code ?? error.status);
    return finish(store, "gone");
  }
  return finish(store, "done", safeNext(next));
}

export function finish(
  store: CookieStore,
  status: PollResult["status"],
  next?: string,
): PollResult {
  store.delete(PENDING_COOKIE);
  return { status, next };
}
