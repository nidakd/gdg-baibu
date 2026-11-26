"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { SETTINGS_CACHE_TAG, SITE_OVERRIDES_KEY, type SiteOverrides } from "@/lib/settings";

const LINKS = ["instagram", "linkedin", "whatsapp", "linktree"] as const;
const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/** Hakkımızda metni ve sosyal bağlantılar. Boş bırakılan alan site.json'daki varsayılana döner. */
export async function saveSiteSettings(form: FormData) {
  const { supabase, user } = await requirePanelUser("/panel/ayarlar");
  if (user.role !== "admin") redirect("/panel/ayarlar?hata=yetki");

  const one = (k: string, max: number) =>
    field(form, k).replace(/\s+/g, " ").slice(0, max) || undefined;
  const paragraphs = field(form, "paragraphs")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim().slice(0, 800))
    .filter(Boolean)
    .slice(0, 5);
  const links: NonNullable<SiteOverrides["links"]> = {};
  for (const k of LINKS) {
    const v = field(form, `link_${k}`);
    if (!v) continue;
    try {
      if (new URL(v).protocol !== "https:") throw new Error();
      links[k] = v.slice(0, 300);
    } catch {
      redirect(`/panel/ayarlar?hata=link`);
    }
  }
  const value: SiteOverrides = {
    about: {
      ...(one("about_title", 120) && { title: one("about_title", 120) }),
      ...(one("about_intro", 400) && { intro: one("about_intro", 400) }),
      ...(paragraphs.length && { paragraphs }),
    },
    links,
  };
  const { error } = await supabase.from("site_settings").upsert({
    key: SITE_OVERRIDES_KEY,
    value,
    updated_at: new Date().toISOString(),
    updated_by: user.email,
  });
  if (error) console.error("[panel] site ayarları kaydedilemedi", error.code);
  updateTag(SETTINGS_CACHE_TAG);
  redirect(`/panel/ayarlar?${error ? "hata=kayit" : "kaydedildi=1"}`);
}
