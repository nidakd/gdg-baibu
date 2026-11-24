"use server";

import { redirect } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { STATUSES } from "./statuses";

/** Başvurunun durumunu ve notunu kaydeder (panel kullanıcıları; RLS ayrıca kontrol eder). */
export async function updateApplication(form: FormData) {
  const { supabase } = await requirePanelUser("/panel/basvurular");
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  const notes =
    String(form.get("notes") ?? "")
      .trim()
      .slice(0, 2000) || null;
  const filter = String(form.get("filtre") ?? "");
  if (/^[0-9a-f-]{36}$/.test(id) && status in STATUSES) {
    const { error } = await supabase.from("applications").update({ status, notes }).eq("id", id);
    if (error) console.error("[panel] başvuru güncellenemedi", error.code);
  }
  redirect(`/panel/basvurular${filter in STATUSES ? `?durum=${filter}` : ""}`);
}
