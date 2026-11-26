"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { EVENTS_CACHE_TAG, getEvents } from "@/lib/content";
import { requirePanelUser } from "@/lib/panel/auth";
import { REGISTRATION_CACHE_TAG } from "@/lib/registration";
import { slugify } from "@/lib/slug";

const UUID = /^[0-9a-f-]{36}$/;

/**
 * Bir etkinliğin koordinatörlerini verilen listeyle değiştirir (panel kullanıcıları; RLS ayrıca
 * kontrol eder). Sayfayı yeniden çizdirmez: seçim ekranda anında görünür, kayıt arkada gider.
 */
export async function saveCoordinators(eventId: string, memberIds: string[]): Promise<boolean> {
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const known =
    (await getEvents()).some((e) => e.id === eventId) ||
    (UUID.test(eventId) &&
      (await supabase.from("site_events").select("id").eq("id", eventId).maybeSingle()).data);
  if (!known) return false;
  const chosen = [...new Set(memberIds.filter((id) => UUID.test(id)))].slice(0, 10);

  const del = await supabase.from("event_coordinators").delete().eq("event_id", eventId);
  if (del.error) {
    console.error("[panel] koordinatörler silinemedi", del.error.code);
    return false;
  }
  if (!chosen.length) return true;
  const ins = await supabase
    .from("event_coordinators")
    .insert(chosen.map((member_id) => ({ event_id: eventId, member_id })));
  if (ins.error) console.error("[panel] koordinatörler kaydedilemedi", ins.error.code);
  return !ins.error;
}

// ───────────── panelden eklenen etkinlikler ─────────────

export type EventField =
  "title" | "date" | "start" | "end" | "venue" | "summary" | "description" | "tags" | "cover";
export type EventFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<EventField, string>>;
};

const COVER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_COVER = 5 * 1024 * 1024;
const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/** Türkiye saati (+03:00, yaz saati yok): "2026-12-01" + "18:00" → ISO */
const trTime = (date: string, time: string) => `${date}T${time}:00+03:00`;

export async function saveEvent(_prev: EventFormState, form: FormData): Promise<EventFormState> {
  const id = field(form, "id") || null;
  const { supabase } = await requirePanelUser("/panel/etkinlikler");

  const title = field(form, "title").replace(/\s+/g, " ");
  const date = field(form, "date");
  const start = field(form, "start");
  const end = field(form, "end");
  const format = form.get("format") === "online" ? "online" : "in-person";
  const venue = field(form, "venue") || null;
  const summary = field(form, "summary").replace(/\s+/g, " ") || null;
  const description = field(form, "description").replace(/\r\n?/g, "\n") || null;
  const tags = [
    ...new Set(
      field(form, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ].slice(0, 8);
  const published = form.get("published") === "on";

  const errors: EventFormState["errors"] = {};
  if (title.length < 2 || title.length > 120) errors.title = "Başlık 2–120 karakter olmalı.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Tarih seç.";
  if (!/^\d{2}:\d{2}$/.test(start)) errors.start = "Başlangıç saatini seç.";
  if (!/^\d{2}:\d{2}$/.test(end)) errors.end = "Bitiş saatini seç.";
  else if (start && end <= start) errors.end = "Bitiş başlangıçtan sonra olmalı.";
  if (format === "in-person" && !venue) errors.venue = "Yüz yüze etkinlikte yer yaz.";
  if (venue && venue.length > 200) errors.venue = "Yer en çok 200 karakter.";
  if (summary && summary.length > 400) errors.summary = "Kısa özet en çok 400 karakter.";
  if (description && description.length > 5000)
    errors.description = "Açıklama en çok 5000 karakter.";
  if (tags.some((t) => t.length > 40)) errors.tags = "Etiketler kısa olsun (en çok 40 karakter).";
  const cover = form.get("cover");
  const hasCover = cover instanceof File && cover.size > 0;
  if (hasCover && (!COVER_TYPES[cover.type] || cover.size > MAX_COVER))
    errors.cover = "Afiş JPG, PNG ya da WebP olmalı, en çok 5 MB.";
  if (Object.keys(errors).length) return { status: "error", errors };

  // Adres ilk kayıtta tarih + başlıktan üretilir, sonra değişmez (paylaşılan linkler kırılmasın)
  let slug = field(form, "slug");
  if (!id) {
    const base = slugify(title);
    if (!base) return { status: "error", errors: { title: "Başlıktan adres üretilemedi." } };
    slug = `${date}-${base}`.slice(0, 80).replace(/-+$/, "");
    const gdgTaken = (await getEvents()).some((e) => e.slug === slug);
    const { data: taken } = await supabase
      .from("site_events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (gdgTaken || taken)
      return { status: "error", errors: { title: "Bu tarihte bu adla bir etkinlik zaten var." } };
  }

  let cover_url: string | undefined;
  if (hasCover) {
    const path = `${slug}-${Date.now()}.${COVER_TYPES[cover.type]}`;
    const { error } = await supabase.storage
      .from("etkinlik")
      .upload(path, cover, { contentType: cover.type, cacheControl: "31536000" });
    if (error) {
      console.error("[panel] afiş yüklenemedi", error.message);
      return { status: "error", errors: { cover: "Afiş yüklenemedi, tekrar dene." } };
    }
    cover_url = supabase.storage.from("etkinlik").getPublicUrl(path).data.publicUrl;
  }

  const row = {
    title,
    starts_at: trTime(date, start),
    ends_at: trTime(date, end),
    format,
    venue: format === "online" ? null : venue,
    summary,
    description,
    tags,
    published,
    updated_at: new Date().toISOString(),
    ...(cover_url && { cover_url }),
  };
  const { data: saved, error } = id
    ? await supabase.from("site_events").update(row).eq("id", id).select("id").single()
    : await supabase
        .from("site_events")
        .insert({ ...row, slug })
        .select("id")
        .single();
  if (error || !saved) {
    console.error("[panel] etkinlik kaydedilemedi", error?.code, error?.message);
    return { status: "error", message: "Kaydedilemedi. Yetkin olmayabilir ya da bir alan hatalı." };
  }
  updateTag(EVENTS_CACHE_TAG);
  redirect(`/panel/etkinlikler/duzenle?id=${saved.id}&kaydedildi=1`);
}

/** Sadece admin; RLS de aynı kuralı uygular. Kayıtlar silinmez, panelde görünmeye devam eder. */
export async function deleteEvent(form: FormData) {
  const id = field(form, "id");
  if (!UUID.test(id)) redirect("/panel/etkinlikler");
  const { supabase, user } = await requirePanelUser("/panel/etkinlikler");
  if (user.role !== "admin") redirect(`/panel/etkinlikler/duzenle?id=${id}`);
  const { error } = await supabase.from("site_events").delete().eq("id", id);
  if (error) console.error("[panel] etkinlik silinemedi", error.code);
  updateTag(EVENTS_CACHE_TAG);
  redirect("/panel/etkinlikler");
}

// ───────────── kayıt ayarı ve kayıtlar ─────────────

const SLUG = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$/;

export async function saveRegistrationSettings(form: FormData) {
  const slug = field(form, "slug");
  if (!SLUG.test(slug)) redirect("/panel/etkinlikler");
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const mode = field(form, "mode");
  const cap = field(form, "capacity");
  const capacity = cap ? Number(cap) : null;
  const ok =
    ["gdg", "site", "kapali"].includes(mode) &&
    (capacity === null || (Number.isInteger(capacity) && capacity >= 1 && capacity <= 5000));
  if (ok) {
    const { error } = await supabase.from("event_registration_settings").upsert({
      event_slug: slug,
      mode,
      capacity,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("[panel] kayıt ayarı kaydedilemedi", error.code);
    updateTag(REGISTRATION_CACHE_TAG);
  }
  redirect(`/panel/etkinlikler/kayit?e=${slug}${ok ? "&kaydedildi=1" : "&hata=1"}`);
}

/** İptal / geri al: kayıt silinmez, kontenjandan düşer. */
export async function toggleRegistration(form: FormData) {
  const id = field(form, "id");
  const slug = field(form, "slug");
  if (!UUID.test(id) || !SLUG.test(slug)) redirect("/panel/etkinlikler");
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const cancelled_at = form.get("cancel") === "true" ? new Date().toISOString() : null;
  const { error } = await supabase.from("registrations").update({ cancelled_at }).eq("id", id);
  if (error) console.error("[panel] kayıt güncellenemedi", error.code);
  updateTag(REGISTRATION_CACHE_TAG);
  redirect(`/panel/etkinlikler/kayit?e=${slug}`);
}
