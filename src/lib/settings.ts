// Panelden değişen site ayarları (public.site_settings). Okunamazsa varsayılanlar kullanılır.

import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "./supabase/public";

export const SETTINGS_CACHE_TAG = "ayarlar";

export type Settings = {
  /** /katil başvuru alıyor mu */
  applicationsOpen: boolean;
  /** Kapalıyken /katil'de görünen not */
  applicationsClosedNote: string;
};

export const DEFAULT_SETTINGS: Settings = {
  applicationsOpen: true,
  applicationsClosedNote:
    "Şu an core team başvurusu almıyoruz. Yeni dönem başvuruları açılınca Instagram'dan duyuracağız.",
};

/** Ayar anahtarları (veritabanındaki key) */
export const SETTING_KEYS: Record<keyof Settings, string> = {
  applicationsOpen: "applications_open",
  applicationsClosedNote: "applications_closed_note",
};

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_CACHE_TAG);
  cacheLife("hours");
  const db = publicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db.from("site_settings").select("key,value");
  if (error) {
    console.error("[ayarlar] okunamadı", error.code);
    return DEFAULT_SETTINGS;
  }
  const byKey = new Map((data ?? []).map((r) => [r.key as string, r.value as unknown]));
  const out = { ...DEFAULT_SETTINGS } as Record<keyof Settings, unknown>;
  for (const [name, key] of Object.entries(SETTING_KEYS) as [keyof Settings, string][]) {
    const v = byKey.get(key);
    if (v !== undefined && typeof v === typeof DEFAULT_SETTINGS[name]) out[name] = v;
  }
  return out as Settings;
}
