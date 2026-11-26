"use server";

// Duyuru / proje / kaynak ekleme, düzenleme, silme (silme sadece admin; RLS de denetler).

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { POST_KINDS, POSTS_CACHE_TAG, type PostKind } from "@/lib/posts";

export type PostField =
  "title" | "summary" | "body" | "url" | "repo_url" | "event_slug" | "tags" | "cover";
export type PostFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<PostField, string>>;
};

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE = 5 * 1024 * 1024;
const UUID = /^[0-9a-f-]{36}$/;
const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const httpsOrNull = (v: string) => {
  if (!v) return null;
  try {
    return new URL(v).protocol === "https:" && v.length <= 500 ? v : undefined;
  } catch {
    return undefined;
  }
};

export async function savePost(_prev: PostFormState, form: FormData): Promise<PostFormState> {
  const id = field(form, "id") || null;
  const kind = field(form, "kind") as PostKind;
  if (!(kind in POST_KINDS)) return { status: "error", message: "Geçersiz tür." };
  const { supabase } = await requirePanelUser("/panel/icerik");

  const title = field(form, "title").replace(/\s+/g, " ");
  const summary = field(form, "summary").replace(/\s+/g, " ") || null;
  const body = field(form, "body").replace(/\r\n?/g, "\n") || null;
  const url = httpsOrNull(field(form, "url"));
  const repo_url = httpsOrNull(field(form, "repo_url"));
  const event_slug = field(form, "event_slug") || null;
  const tags = [
    ...new Set(
      field(form, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ].slice(0, 8);
  const published = form.get("published") === "on";

  const errors: PostFormState["errors"] = {};
  if (title.length < 2 || title.length > 120) errors.title = "Başlık 2–120 karakter olmalı.";
  if (summary && summary.length > 400) errors.summary = "Kısa özet en çok 400 karakter.";
  if (body && body.length > 8000) errors.body = "Metin en çok 8000 karakter.";
  if (url === undefined) errors.url = "Bağlantı https:// ile başlamalı.";
  if (repo_url === undefined) errors.repo_url = "Bağlantı https:// ile başlamalı.";
  if (event_slug && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$/.test(event_slug))
    errors.event_slug = "Etkinlik seç.";
  if (tags.some((t) => t.length > 40)) errors.tags = "Etiketler kısa olsun (en çok 40 karakter).";
  const cover = form.get("cover");
  const hasCover = cover instanceof File && cover.size > 0;
  if (hasCover && (!IMAGE_TYPES[cover.type] || cover.size > MAX_IMAGE))
    errors.cover = "Görsel JPG, PNG ya da WebP olmalı, en çok 5 MB.";
  if (Object.keys(errors).length) return { status: "error", errors };

  let cover_url: string | undefined;
  if (hasCover) {
    const path = `icerik/${kind}-${Date.now()}.${IMAGE_TYPES[cover.type]}`;
    const { error } = await supabase.storage
      .from("etkinlik")
      .upload(path, cover, { contentType: cover.type, cacheControl: "31536000" });
    if (error) {
      console.error("[panel] görsel yüklenemedi", error.message);
      return { status: "error", errors: { cover: "Görsel yüklenemedi, tekrar dene." } };
    }
    cover_url = supabase.storage.from("etkinlik").getPublicUrl(path).data.publicUrl;
  }

  const row = {
    kind,
    title,
    summary,
    body,
    url,
    repo_url,
    event_slug,
    tags,
    published,
    updated_at: new Date().toISOString(),
    ...(cover_url && { cover_url }),
    ...(form.get("remove_cover") === "on" && !cover_url && { cover_url: null }),
  };
  const { data: saved, error } = id
    ? await supabase.from("posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("posts").insert(row).select("id").single();
  if (error || !saved) {
    console.error("[panel] içerik kaydedilemedi", error?.code, error?.message);
    return { status: "error", message: "Kaydedilemedi. Yetkin olmayabilir ya da bir alan hatalı." };
  }
  updateTag(POSTS_CACHE_TAG);
  redirect(`/panel/icerik/duzenle?id=${saved.id}&kaydedildi=1`);
}

export async function deletePost(form: FormData) {
  const id = field(form, "id");
  const kind = field(form, "kind");
  if (!UUID.test(id)) redirect("/panel/icerik");
  const { supabase, user } = await requirePanelUser("/panel/icerik");
  if (user.role !== "admin") redirect(`/panel/icerik/duzenle?id=${id}`);
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) console.error("[panel] içerik silinemedi", error.code);
  updateTag(POSTS_CACHE_TAG);
  redirect(`/panel/icerik${kind in POST_KINDS ? `?tur=${kind}` : ""}`);
}
