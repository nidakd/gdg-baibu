"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { SETTING_KEYS, SETTINGS_CACHE_TAG } from "@/lib/settings";
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

/** Başvuru dönemini aç / kapa ve kapalıyken görünen notu kaydet. */
export async function saveApplicationPeriod(form: FormData) {
  const { supabase, user } = await requirePanelUser("/panel/basvurular");
  const open = form.get("open") === "on";
  const note = String(form.get("note") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
  const now = new Date().toISOString();
  const { error } = await supabase.from("site_settings").upsert([
    { key: SETTING_KEYS.applicationsOpen, value: open, updated_at: now, updated_by: user.email },
    ...(note
      ? [
          {
            key: SETTING_KEYS.applicationsClosedNote,
            value: note,
            updated_at: now,
            updated_by: user.email,
          },
        ]
      : []),
  ]);
  if (error) console.error("[panel] başvuru dönemi kaydedilemedi", error.code);
  updateTag(SETTINGS_CACHE_TAG);
  redirect(`/panel/basvurular?donem=${error ? "hata" : "kaydedildi"}`);
}
