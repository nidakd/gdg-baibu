"use server";

// İletişim formu: alanları doğrular, mesajı Resend ile topluluk e-postasına yollar.
// Ortam değişkenleri (.env.local ve Vercel): RESEND_API_KEY, isteğe bağlı CONTACT_FROM.
// Kendi alan adı olmadan Resend sadece hesabın kendi adresine gönderebilir; bu yüzden
// Resend hesabı gdgoncampusaibu@gmail.com ile açılmalı.

import { checkBotId } from "botid/server";
import { headers } from "next/headers";
import { getSite } from "./content";
import { publicClient } from "./supabase/public";
import type { ContactState } from "./contact-state";

const LIMITS = { name: 100, email: 200, message: 3000 };
/** Formu bu süreden hızlı gönderen büyük ihtimalle bot */
const MIN_FILL_MS = 3000;
/** Aynı IP'den 10 dakikada en fazla bu kadar mesaj */
const RATE = { max: 3, windowMs: 10 * 60 * 1000 };
// Asıl bot koruması Vercel BotID (instrumentation-client.ts). Bu sayaç ek bir fren:
// sunucu örneği başına tutulur, yeniden başlayınca sıfırlanır.
const hits = new Map<string, number[]>();

// Kullanıcı girdisi e-postaya HTML olarak giriyor: etiket ve tırnaklar kaçırılır
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
// Tek satırlık alanlar (ad, konu satırına da giriyor): satır sonu ve kontrol karakterleri atılır
const oneLine = (s: string) =>
  s
    .replace(/[\p{Cc}\p{Cf}\u2028\u2029]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
// Mesaj: satır sonları kalır, diğer görünmez kontrol karakterleri atılır
const multiLine = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\p{Cc}\p{Cf}]/gu, (c) => (c === "\n" || c === "\t" ? c : ""))
    .trim();
// Virgül, boşluk, köşeli parantez gibi birden çok alıcıya yol açabilecek karakterlere izin yok
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  if (recent.length >= RATE.max) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Bellek şişmesin: eski kayıtları ara ara temizle
  if (hits.size > 5000)
    for (const [k, v] of hits) if (now - v[v.length - 1] > RATE.windowMs) hits.delete(k);
  return false;
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = (name: string) => {
    const v = formData.get(name);
    return typeof v === "string" ? v : "";
  };
  const values = {
    name: oneLine(raw("name")),
    email: raw("email").trim(),
    message: multiLine(raw("message")),
  };
  const field = (name: string) => raw(name).trim();

  // Bot tuzakları: görünmez alan doldurulmuşsa ya da form çok hızlı gönderildiyse
  // başarılı gibi davran, e-posta yollama
  const startedAt = Number(field("startedAt"));
  if (field("website") || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "ok" };
  }

  // Vercel BotID: otomasyon araçlarını ayıklar (geliştirmede her zaman insan sayılır)
  const { isBot } = await checkBotId();
  if (isBot) {
    return {
      status: "error",
      message: `Gönderim doğrulanamadı. Sayfayı yenileyip tekrar dene ya da ${getSite().email} adresine yaz.`,
      values,
    };
  }

  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = "Kime cevap yazacağız? Adını yaz.";
  else if (values.name.length > LIMITS.name) errors.name = "Ad çok uzun.";
  if (!EMAIL.test(values.email) || values.email.length > LIMITS.email)
    errors.email = "Bu e-posta adresi olmadı, sana buradan döneceğiz.";
  if (values.message.length < 10) errors.message = "Biraz daha anlat, en az 10 karakter.";
  else if (values.message.length > LIMITS.message)
    errors.message = "Mesaj 3000 karakteri geçmesin.";

  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "bilinmiyor";
  if (rateLimited(ip)) {
    return {
      status: "error",
      message: "Kısa sürede çok mesaj geldi. Biraz sonra tekrar dene ya da doğrudan e-posta at.",
      values,
    };
  }

  // Panelde görünsün diye veritabanına da yazılır; yazılamazsa e-posta yine gider
  const db = publicClient();
  if (db) {
    const { error } = await db.from("contact_messages").insert(values);
    if (error) console.error("[iletişim] veritabanına yazılamadı", error.code);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[iletişim] RESEND_API_KEY yok, e-posta yerine konsola yazıldı:", values);
      return { status: "ok" };
    }
    return {
      status: "error",
      message: `Form şu an çalışmıyor. Bize doğrudan ${getSite().email} adresinden yazabilirsin.`,
      values,
    };
  }

  const rows: [string, string][] = [
    ["Ad", values.name],
    ["E-posta", values.email],
  ];
  const html = `
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${escape(v)}</b></td></tr>`).join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escape(values.message)}</p>
    <p style="font-family:sans-serif;font-size:12px;color:#999">Sitedeki iletişim formundan gönderildi. Yanıtla dersen doğrudan ${escape(values.email)} adresine gider.</p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Boş bırakılmış değişken de varsayılana düşsün
        from: process.env.CONTACT_FROM || "GDG on Campus AİBÜ Website <onboarding@resend.dev>",
        to: [getSite().email],
        reply_to: values.email,
        subject: `[Site] ${values.name} yazdı`,
        html,
        text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${values.message}`,
      }),
    });
    // Yanıt gövdesi loglanmaz: içinde gönderilen veri olabilir
    if (!res.ok) throw new Error(`Resend ${res.status}`);
  } catch (err) {
    console.error("[iletişim] gönderilemedi", err);
    return {
      status: "error",
      message: `Mesaj gönderilemedi. Biraz sonra tekrar dene ya da ${getSite().email} adresine yaz.`,
      values,
    };
  }

  return { status: "ok" };
}
