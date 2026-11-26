"use server";

// Etkinlik kaydı (sitede form açık etkinlikler): doğrular, gizli anahtarla yazar, onay e-postası atar.

import { checkBotId } from "botid/server";
import { updateTag } from "next/cache";
import { getEventBySlug, getSite } from "@/lib/content";
import { checkEmail } from "@/lib/email-check";
import { escapeHtml, looksLikeBot, oneLine, rateLimited } from "@/lib/form-guard";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { sendGmail } from "@/lib/gmail";
import { getRegistration, isFull, REGISTRATION_CACHE_TAG } from "@/lib/registration";
import { adminClient } from "@/lib/supabase/admin";
import { checkDepartment, checkName } from "@/lib/text-guard";

export type RegisterField = "name" | "email" | "department" | "consent";
export type RegisterState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<RegisterField, string>>;
  values?: { name?: string; email?: string; department?: string };
};

export async function registerForEvent(
  _prev: RegisterState,
  form: FormData,
): Promise<RegisterState> {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const slug = str("slug");
  const values = {
    name: oneLine(str("name")),
    email: str("email").trim(),
    department: oneLine(str("department")),
  };

  if (looksLikeBot(form)) return { status: "ok" };
  const { isBot } = await checkBotId();
  if (isBot)
    return {
      status: "error",
      message: "Gönderim doğrulanamadı. Sayfayı yenileyip tekrar dene.",
      values,
    };

  const event = await getEventBySlug(slug);
  if (!event || Date.parse(event.endsAt) < Date.now())
    return { status: "error", message: "Bu etkinliğe kayıt alınmıyor.", values };
  const reg = await getRegistration(event);
  if (reg.mode !== "site")
    return { status: "error", message: "Bu etkinliğe sitede kayıt alınmıyor.", values };
  if (isFull(reg))
    return { status: "error", message: "Kontenjan doldu, kayıt alınamıyor.", values };

  const errors: RegisterState["errors"] = {};
  const nameError = checkName(values.name, { fullName: true });
  if (nameError) errors.name = nameError;
  const emailError = await checkEmail(values.email);
  if (emailError) errors.email = emailError;
  const deptError = values.department && checkDepartment(values.department);
  if (deptError) errors.department = deptError;
  if (form.get("consent") !== "on") errors.consent = "Kaydını alabilmemiz için onay gerekiyor.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  if (await rateLimited("kayit", 5, 60 * 60 * 1000))
    return {
      status: "error",
      message: "Kısa sürede çok kayıt geldi. Biraz sonra tekrar dene.",
      values,
    };

  const db = adminClient();
  if (!db)
    return {
      status: "error",
      message: `Kayıt şu an alınamıyor. ${getSite().email} adresine yazabilirsin.`,
      values,
    };
  const { error } = await db.from("registrations").insert({
    event_slug: event.slug,
    name: values.name,
    email: values.email,
    department: values.department || null,
  });
  if (error?.code === "23505")
    return { status: "error", errors: { email: "Bu e-postayla zaten kayıtlısın." }, values };
  if (error) {
    console.error("[kayıt] veritabanına yazılamadı", error.code);
    return { status: "error", message: "Kayıt alınamadı, biraz sonra tekrar dene.", values };
  }
  updateTag(REGISTRATION_CACHE_TAG);

  const firstName = values.name.split(" ")[0];
  const when = `${formatDateLong(event.startsAt)}, ${formatTimeRange(event.startsAt, event.endsAt)}`;
  const where = event.format === "online" ? "Online" : (event.venue ?? "");
  const club = getSite().email;
  await sendGmail({
    to: values.email,
    subject: `Kaydın alındı: ${event.title} · GDG on Campus AİBÜ`,
    html: `
    <div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#202124">
      <p>Merhaba ${escapeHtml(firstName)},</p>
      <p><strong>${escapeHtml(event.title)}</strong> etkinliğine kaydını aldık. 🎉</p>
      <p style="font-size:14px">🗓 ${escapeHtml(when)}<br>📍 ${escapeHtml(where)}</p>
      <p style="font-size:13px;color:#5f6368">Gelemeyeceksen ${escapeHtml(club)} adresine yazman yeterli; yerini başkasına açarız. Bu kaydı sen yapmadıysan bu e-postayı yok say.</p>
    </div>`,
    text: `Merhaba ${firstName},\n\n${event.title} etkinliğine kaydını aldık.\n\n${when}\n${where}\n\nGelemeyeceksen ${club} adresine yazman yeterli. Bu kaydı sen yapmadıysan bu e-postayı yok say.`,
  });
  return { status: "ok" };
}
