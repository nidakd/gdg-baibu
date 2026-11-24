// Sitedeki formların ortak koruması (iletişim, katılım): girdi temizleme, bot tuzakları, hız sınırı.
// Asıl bot koruması Vercel BotID (instrumentation-client.ts); bunlar ek fren.

import { headers } from "next/headers";

/** Kullanıcı girdisi e-postaya HTML olarak giriyor: etiket ve tırnaklar kaçırılır */
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Tek satırlık alanlar (konu satırına da girebilir): satır sonu ve kontrol karakterleri atılır */
export const oneLine = (s: string) =>
  s
    .replace(/[\p{Cc}\p{Cf}\u2028\u2029]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Çok satırlı metin: satır sonları kalır, diğer görünmez kontrol karakterleri atılır */
export const multiLine = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\p{Cc}\p{Cf}]/gu, (c) => (c === "\n" || c === "\t" ? c : ""))
    .trim();

/** Virgül, boşluk, köşeli parantez gibi birden çok alıcıya yol açabilecek karakterlere izin yok */
export const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/** Formu bu süreden hızlı gönderen büyük ihtimalle bot */
const MIN_FILL_MS = 3000;

/** Görünmez alan doldurulmuşsa ya da form çok hızlı gönderildiyse true (bota başarılı gibi davranılır). */
export function looksLikeBot(form: FormData): boolean {
  const startedAt = Number(String(form.get("startedAt") ?? ""));
  return (
    Boolean(String(form.get("website") ?? "").trim()) ||
    !startedAt ||
    Date.now() - startedAt < MIN_FILL_MS
  );
}

// Sade bir sayaç: sunucu örneği başına tutulur, yeniden başlayınca sıfırlanır.
const hits = new Map<string, number[]>();

/** Aynı IP'den aynı forma `max` gönderimden fazlası `windowMs` içinde reddedilir. */
export async function rateLimited(
  form: string,
  max = 3,
  windowMs = 10 * 60 * 1000,
): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "bilinmiyor";
  const key = `${form}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Bellek şişmesin: eski kayıtları ara ara temizle
  if (hits.size > 5000)
    for (const [k, v] of hits) if (now - v[v.length - 1] > windowMs) hits.delete(k);
  return false;
}

/** Resend ile kulüp adresine e-posta. Anahtar yoksa geliştirmede konsola yazar. */
export async function sendMail(mail: {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[e-posta] RESEND_API_KEY yok, konsola yazıldı:", mail.subject);
      return true;
    }
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Boş bırakılmış değişken de varsayılana düşsün
        from: process.env.CONTACT_FROM || "GDG on Campus AİBÜ Website <onboarding@resend.dev>",
        to: [mail.to],
        reply_to: mail.replyTo,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    // Yanıt gövdesi loglanmaz: içinde gönderilen veri olabilir
    if (!res.ok) throw new Error(`Resend ${res.status}`);
    return true;
  } catch (err) {
    console.error("[e-posta] gönderilemedi", err);
    return false;
  }
}
