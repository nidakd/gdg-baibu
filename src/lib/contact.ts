"use server";

// İletişim formu: alanları doğrular, mesajı Resend ile topluluk e-postasına yollar.
// Ortam değişkenleri (.env.local ve Vercel): RESEND_API_KEY, isteğe bağlı CONTACT_FROM.
// Kendi alan adı olmadan Resend sadece hesabın kendi adresine gönderebilir; bu yüzden
// Resend hesabı gdgoncampusaibu@gmail.com ile açılmalı.

import { checkBotId } from "botid/server";
import { getSite } from "./content";
import { checkEmail } from "./email-check";
import { CONTACT_MESSAGE, type ContactState } from "./contact-state";
import { escapeHtml, looksLikeBot, multiLine, oneLine, rateLimited, sendMail } from "./form-guard";
import { adminClient } from "./supabase/admin";
import { publicClient } from "./supabase/public";
import { checkMessage, checkName } from "./text-guard";

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
  // Bot tuzakları: görünmez alan doldurulmuşsa ya da form çok hızlı gönderildiyse
  // başarılı gibi davran, e-posta yollama
  if (looksLikeBot(formData)) return { status: "ok" };

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
  else {
    const nameError = checkName(values.name);
    if (nameError) errors.name = nameError;
  }
  const emailError = await checkEmail(values.email);
  if (emailError) errors.email = emailError;
  const messageError = checkMessage(values.message, CONTACT_MESSAGE);
  if (messageError) errors.message = messageError;

  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  if (await rateLimited("iletisim")) {
    return {
      status: "error",
      message: "Kısa sürede çok mesaj geldi. Biraz sonra tekrar dene ya da doğrudan e-posta at.",
      values,
    };
  }

  // Panelde görünsün diye veritabanına da yazılır; yazılamazsa e-posta yine gider
  const db = adminClient() ?? publicClient();
  if (db) {
    const { error } = await db.from("contact_messages").insert(values);
    if (error) console.error("[iletişim] veritabanına yazılamadı", error.code);
  }

  const rows: [string, string][] = [
    ["Ad", values.name],
    ["E-posta", values.email],
  ];
  const html = `
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${escapeHtml(v)}</b></td></tr>`).join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(values.message)}</p>
    <p style="font-family:sans-serif;font-size:12px;color:#999">Sitedeki iletişim formundan gönderildi. Yanıtla dersen doğrudan ${escapeHtml(values.email)} adresine gider.</p>`;

  const sent = await sendMail({
    to: getSite().email,
    replyTo: values.email,
    subject: `[Site] ${values.name} yazdı`,
    html,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${values.message}`,
  });
  if (!sent) {
    return {
      status: "error",
      message: `Mesaj gönderilemedi. Biraz sonra tekrar dene ya da ${getSite().email} adresine yaz.`,
      values,
    };
  }

  return { status: "ok" };
}
