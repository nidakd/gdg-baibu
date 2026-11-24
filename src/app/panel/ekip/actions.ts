"use server";

// Ekip üyesi ekleme / düzenleme / pasife alma. Yazma giriş yapan kişinin yetkisiyle yapılır;
// RLS panel_users'ta olmayan herkesi reddeder. Kaydedince sitedeki ekip önbelleği yenilenir.

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { TEAM_CACHE_TAG } from "@/lib/content";
import { requirePanelUser } from "@/lib/panel/auth";
import { slugify } from "@/lib/slug";
import { BIO_MAX, LINK_KEYS, YEARS } from "./fields";

export type MemberField =
  "name" | "role" | "team_id" | "department" | "year" | "bio" | "sort_order" | "photo" | "links";

export type MemberFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<MemberField, string>>;
};

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_PHOTO = 4 * 1024 * 1024;

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const isHttps = (u: string) => {
  try {
    return new URL(u).protocol === "https:";
  } catch {
    return false;
  }
};

export async function saveMember(_prev: MemberFormState, form: FormData): Promise<MemberFormState> {
  const id = text(form, "id") || null;
  const { supabase } = await requirePanelUser("/panel/ekip");

  const name = text(form, "name").replace(/\s+/g, " ");
  const role = text(form, "role");
  const team_id = text(form, "team_id");
  const department = text(form, "department") || null;
  const year = text(form, "year") || null;
  const bio = text(form, "bio").replace(/\r\n?/g, "\n") || null;
  const sort_order = Number(text(form, "sort_order") || "100");
  const active = form.get("active") === "on";

  const errors: MemberFormState["errors"] = {};
  if (name.length < 2 || name.length > 100) errors.name = "Ad 2–100 karakter olmalı.";
  if (!role || role.length > 60) errors.role = "Görev boş olamaz (en çok 60 karakter).";
  if (!team_id) errors.team_id = "Bir ekip seç.";
  if (department && department.length > 120) errors.department = "Bölüm adı çok uzun.";
  if (year && !YEARS.includes(year)) errors.year = "Geçersiz sınıf.";
  if (bio && bio.length > BIO_MAX) errors.bio = `Tanıtım en çok ${BIO_MAX} karakter.`;
  if (!Number.isInteger(sort_order) || sort_order < 0 || sort_order > 999)
    errors.sort_order = "Sıra 0–999 arası bir sayı olmalı.";

  const links: Record<string, string> = {};
  for (const key of LINK_KEYS) {
    const url = text(form, `link_${key}`);
    if (!url) continue;
    if (!isHttps(url) || url.length > 300) errors.links = "Bağlantılar https:// ile başlamalı.";
    else links[key] = url;
  }

  const photo = form.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto && (!PHOTO_TYPES[photo.type] || photo.size > MAX_PHOTO))
    errors.photo = "Fotoğraf JPG, PNG ya da WebP olmalı, en çok 4 MB.";

  if (Object.keys(errors).length) return { status: "error", errors };

  // Adres (slug) ilk kayıtta addan üretilir, sonra değişmez: paylaşılmış linkler kırılmasın
  let slug = text(form, "slug");
  if (!id) {
    slug = slugify(name);
    if (!slug) return { status: "error", errors: { name: "Addan adres üretilemedi." } };
    const { data: taken } = await supabase
      .from("team_members")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (taken) return { status: "error", errors: { name: "Bu adla bir üye zaten var." } };
  }

  let photo_url: string | undefined;
  if (hasPhoto) {
    const path = `${slug}-${Date.now()}.${PHOTO_TYPES[photo.type]}`;
    const { error } = await supabase.storage
      .from("ekip")
      .upload(path, photo, { contentType: photo.type, cacheControl: "31536000" });
    if (error) {
      console.error("[panel] fotoğraf yüklenemedi", error.message);
      return { status: "error", errors: { photo: "Fotoğraf yüklenemedi, tekrar dene." } };
    }
    photo_url = supabase.storage.from("ekip").getPublicUrl(path).data.publicUrl;
  }

  const row = {
    name,
    role,
    team_id,
    department,
    year,
    bio,
    links,
    sort_order,
    active,
    ...(photo_url && { photo_url }),
  };
  const { data: saved, error } = id
    ? await supabase.from("team_members").update(row).eq("id", id).select("id").single()
    : await supabase
        .from("team_members")
        .insert({ ...row, slug })
        .select("id")
        .single();
  if (error || !saved) {
    console.error("[panel] üye kaydedilemedi", error?.code, error?.message);
    return { status: "error", message: "Kaydedilemedi. Yetkin olmayabilir ya da bir alan hatalı." };
  }

  updateTag(TEAM_CACHE_TAG);
  // Kişinin panel sayfasında kalınır (siteye çıkılmaz)
  redirect(`/panel/ekip/duzenle?id=${saved.id}&kaydedildi=1`);
}

/** Pasife al / geri al: silmek yerine (eski üyeler kayıtta kalsın). */
export async function setActive(form: FormData) {
  const id = text(form, "id");
  if (!/^[0-9a-f-]{36}$/.test(id)) redirect("/panel/ekip");
  const active = form.get("active") === "true";
  const { supabase } = await requirePanelUser("/panel/ekip");
  const { error } = await supabase.from("team_members").update({ active }).eq("id", id);
  if (error) console.error("[panel] durum değiştirilemedi", error.code);
  updateTag(TEAM_CACHE_TAG);
  // Listeden mi kişi sayfasından mı gelindiyse oraya dönülür
  redirect(form.get("donus") === "kisi" ? `/panel/ekip/duzenle?id=${id}` : "/panel/ekip");
}
