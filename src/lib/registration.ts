// Etkinlik başına kayıt ayarı: gdg = GDG Community linki, site = sitedeki form, kapali.
// Ayar yoksa GDG Community'den gelen etkinlik "gdg", panelden eklenen "site" sayılır.

import { cacheLife, cacheTag } from "next/cache";
import type { Event } from "./content";
import { publicClient } from "./supabase/public";

export const REGISTRATION_CACHE_TAG = "kayit";

export type RegistrationMode = "gdg" | "site" | "kapali";
export const REGISTRATION_MODES: Record<RegistrationMode, string> = {
  gdg: "GDG Community",
  site: "Sitede form",
  kapali: "Kayıt kapalı",
};

export type Registration = {
  mode: RegistrationMode;
  capacity: number | null;
  /** İptal edilmemiş kayıt sayısı (sadece "site" için okunur) */
  count: number;
};

export const defaultMode = (event: Pick<Event, "sourceUrl">): RegistrationMode =>
  event.sourceUrl ? "gdg" : "site";

/** Sayfada gösterilecek kayıt durumu. Kayıt ya da ayar değişince etiketle yenilenir. */
export async function getRegistration(
  event: Pick<Event, "slug" | "sourceUrl">,
): Promise<Registration> {
  "use cache";
  cacheTag(REGISTRATION_CACHE_TAG);
  cacheLife("minutes");
  const fallback: Registration = { mode: defaultMode(event), capacity: null, count: 0 };
  const db = publicClient();
  if (!db) return fallback;
  const { data } = await db
    .from("event_registration_settings")
    .select("mode,capacity")
    .eq("event_slug", event.slug)
    .maybeSingle();
  const mode = (data?.mode as RegistrationMode | undefined) ?? fallback.mode;
  if (mode !== "site") return { mode, capacity: data?.capacity ?? null, count: 0 };
  const { data: count } = await db.rpc("registration_count", { slug: event.slug });
  return { mode, capacity: data?.capacity ?? null, count: typeof count === "number" ? count : 0 };
}

export const isFull = (r: Registration) => r.capacity !== null && r.count >= r.capacity;
