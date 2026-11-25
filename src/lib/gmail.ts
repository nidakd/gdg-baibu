// Başvuranlara giden e-postalar (onay bağlantısı) kulüp Gmail'inden SMTP ile gider.
// Resend alan adı olmadan sadece kulübün kendi adresine gönderebildiği için bu yol seçildi.
// Ortam değişkenleri: GMAIL_USER (ör. gdgoncampusaibu@gmail.com) ve GMAIL_APP_PASSWORD
// (Google hesabı → Güvenlik → 2 Adımlı Doğrulama açık → Uygulama şifreleri). Günlük sınır ~500.

import nodemailer, { type Transporter } from "nodemailer";

const USER = process.env.GMAIL_USER ?? "";
const PASS = (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, "");
export const hasGmail = Boolean(USER && PASS);

let transport: Transporter | null = null;

/** Gönderildiyse true. Ayar yoksa geliştirmede konsola yazar (bağlantı dahil), yayında false. */
export async function sendGmail(mail: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  if (!hasGmail) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[gmail] ayar yok, konsola yazıldı → ${mail.to}\n${mail.text}`);
      return true;
    }
    return false;
  }
  transport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: USER, pass: PASS },
  });
  try {
    await transport.sendMail({
      from: { name: "GDG on Campus AİBÜ", address: USER },
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    return true;
  } catch (err) {
    // Hata nesnesi alıcı adresini içerebilir; sadece kodu yaz
    console.error("[gmail] gönderilemedi", (err as { code?: string }).code ?? "bilinmiyor");
    return false;
  }
}
