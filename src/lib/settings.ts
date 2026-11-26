// Panelden değişen site ayarları (public.site_settings). Okunamazsa varsayılanlar kullanılır.

import { cacheLife, cacheTag } from "next/cache";
import { getSite, type Site } from "./content";
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

/** Panelden değişebilen site bilgileri (site_settings, key "site"); boş alanlar site.json'dan gelir. */
export type SiteOverrides = {
  about?: Partial<Site["about"]>;
  links?: Partial<Pick<Site["links"], "instagram" | "linkedin" | "whatsapp" | "linktree">>;
  instagramFollowers?: number;
};
export const SITE_OVERRIDES_KEY = "site";

export async function getSiteOverrides(): Promise<SiteOverrides> {
  "use cache";
  cacheTag(SETTINGS_CACHE_TAG);
  cacheLife("hours");
  const db = publicClient();
  if (!db) return {};
  const { data } = await db
    .from("site_settings")
    .select("value")
    .eq("key", SITE_OVERRIDES_KEY)
    .maybeSingle();
  return (data?.value as SiteOverrides | undefined) ?? {};
}

/** site.json + panelden yapılan değişiklikler */
export async function getSiteLive(): Promise<Site> {
  const site = getSite();
  const o = await getSiteOverrides();
  return {
    ...site,
    about: { ...site.about, ...o.about },
    links: { ...site.links, ...o.links },
    stats: {
      ...site.stats,
      ...(typeof o.instagramFollowers === "number" && {
        instagramFollowers: o.instagramFollowers,
      }),
    },
  };
}
