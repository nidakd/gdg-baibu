"use server";

// E-postadaki onay bağlantısı. Aynı tarayıcıdaysa doğrudan giriş yapılır; başka cihazdaysa
// ekrandaki sayı eşleşirse onay verilir ve oturum bekleyen tarayıcıda açılır.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parsePending, PENDING_COOKIE, sha256 } from "@/lib/panel/login-requests";
import { signInHere } from "@/lib/panel/login-session";
import { adminClient } from "@/lib/supabase/admin";

export type ApproveState = { status: "idle" | "approved" | "mismatch" | "gone" };

export async function approveLogin(_prev: ApproveState, form: FormData): Promise<ApproveState> {
  const id = String(form.get("i") ?? "");
  const key = String(form.get("k") ?? "");
  const choice = String(form.get("sayi") ?? "");
  const admin = adminClient();
  if (!admin || !/^[0-9a-f-]{36}$/.test(id) || !key) return { status: "gone" };

  const { data: row } = await admin
    .from("login_requests")
    .select("browser_hash,approve_hash,token_hash,code,next_path,expires_at,approved_at,used_at")
    .eq("id", id)
    .maybeSingle();
  if (
    !row ||
    row.approve_hash !== sha256(key) ||
    row.used_at ||
    row.approved_at ||
    new Date(row.expires_at).getTime() < Date.now()
  )
    return { status: "gone" };

  // Bağlantı, girişin istendiği tarayıcıda açıldıysa sayıya gerek yok: burada giriş yap
  const store = await cookies();
  const pending = parsePending(store.get(PENDING_COOKIE)?.value);
  if (pending?.id === id && sha256(pending.secret) === row.browser_hash) {
    // "Son girişler" başarılı girişi approved_at + used_at ile tanır
    await admin
      .from("login_requests")
      .update({ approved_at: new Date().toISOString() })
      .eq("id", id)
      .is("approved_at", null);
    const result = await signInHere(admin, store, id, row.token_hash, row.next_path);
    if (result.status === "done" && result.next) redirect(result.next);
    return { status: "gone" };
  }

  // Yanlış sayı: başkasının isteği olabilir, istek iptal
  if (choice !== row.code) {
    await admin.from("login_requests").update({ used_at: new Date().toISOString() }).eq("id", id);
    return { status: "mismatch" };
  }
  const { data: approved } = await admin
    .from("login_requests")
    .update({ approved_at: new Date().toISOString() })
    .eq("id", id)
    .is("approved_at", null)
    .is("used_at", null)
    .select("id");
  return { status: approved?.length ? "approved" : "gone" };
}
