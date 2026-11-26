"use server";

// Etkinlik fotoğrafları: dosya tarayıcıdan doğrudan Storage'a yüklenir (uploader.tsx); burada
// sadece kaydı yazılır, düzenlenir ve silinir. Yetkiyi RLS de denetler.

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { PHOTOS_CACHE_TAG } from "@/lib/content";
import { requirePanelUser } from "@/lib/panel/auth";
import { SUPABASE_URL } from "@/lib/supabase/env";

const SLUG = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$/;
const UUID = /^[0-9a-f-]{36}$/;

export type UploadedPhoto = { path: string; alt: string; width: number; height: number };

/** Yüklenen dosyaların kaydı. Yol, etkinliğin klasöründe olmalı. */
export async function addEventPhotos(slug: string, photos: UploadedPhoto[]): Promise<boolean> {
  if (!SLUG.test(slug)) return false;
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const rows = photos.slice(0, 40).flatMap((p) => {
    const ok =
      p.path.startsWith(`${slug}/`) &&
      /^[a-z0-9-]+\.webp$/.test(p.path.slice(slug.length + 1)) &&
      Number.isInteger(p.width) &&
      Number.isInteger(p.height) &&
      p.width > 0 &&
      p.height > 0;
    if (!ok) return [];
    const alt = p.alt.replace(/\s+/g, " ").trim().slice(0, 200);
    return [
      {
        event_slug: slug,
        path: p.path,
        url: `${SUPABASE_URL}/storage/v1/object/public/kareler/${p.path}`,
        alt: alt.length >= 3 ? alt : "Etkinlikten bir kare",
        width: p.width,
        height: p.height,
      },
    ];
  });
  if (!rows.length) return false;
  const { error } = await supabase.from("event_photos").insert(rows);
  if (error) console.error("[panel] fotoğraf kaydedilemedi", error.code);
  updateTag(PHOTOS_CACHE_TAG);
  return !error;
}

export async function updateEventPhoto(form: FormData) {
  const id = String(form.get("id") ?? "");
  const slug = String(form.get("slug") ?? "");
  if (!UUID.test(id) || !SLUG.test(slug)) redirect("/panel/etkinlikler");
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  if (form.get("delete") === "true") {
    const { data } = await supabase.from("event_photos").select("path").eq("id", id).maybeSingle();
    const { error } = await supabase.from("event_photos").delete().eq("id", id);
    if (!error && data?.path) await supabase.storage.from("kareler").remove([data.path]);
    if (error) console.error("[panel] fotoğraf silinemedi", error.code);
  } else {
    const alt = String(form.get("alt") ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
    const sort_order = Number(form.get("sort_order") ?? 100);
    const { error } = await supabase
      .from("event_photos")
      .update({
        ...(alt.length >= 3 && { alt }),
        on_home: form.get("on_home") === "on",
        ...(Number.isInteger(sort_order) && sort_order >= 0 && sort_order <= 999 && { sort_order }),
      })
      .eq("id", id);
    if (error) console.error("[panel] fotoğraf güncellenemedi", error.code);
  }
  updateTag(PHOTOS_CACHE_TAG);
  redirect(`/panel/etkinlikler/fotograflar?e=${slug}`);
}
