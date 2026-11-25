"use server";

// Core team başvurusu: doğrular, veritabanına yazar (panelde görünür) ve kulüp adresine e-posta atar.

import { randomBytes } from "node:crypto";
import { checkBotId } from "botid/server";
import { getSite, getWorkingTeams } from "@/lib/content";
import { checkEmail } from "@/lib/email-check";
import { escapeHtml, looksLikeBot, multiLine, oneLine, rateLimited } from "@/lib/form-guard";
import { hasGmail, sendGmail } from "@/lib/gmail";
import { SITE_URL } from "@/lib/seo";
import { adminClient } from "@/lib/supabase/admin";
import { publicClient } from "@/lib/supabase/public";
import { checkDepartment, checkMessage, checkName } from "@/lib/text-guard";
import { GITHUB_TEAM, MESSAGE_RULES, normalizeGithub, YEAR_LABELS } from "./fields";
import { type Application, hashToken, notifyClub, toRow, VERIFY_TTL_MS } from "./notify";

export type JoinField =
  "name" | "email" | "department" | "year" | "teams" | "github" | "message" | "consent";

export type JoinState = {
  /** verify: kaydedildi, onay bağlantısı e-postayla gitti */
  status: "idle" | "ok" | "verify" | "error";
  message?: string;
  /** verify durumunda bağlantının gittiği adres */
  email?: string;
  errors?: Partial<Record<JoinField, string>>;
  values?: {
    name?: string;
    email?: string;
    department?: string;
    year?: string;
    message?: string;
    github?: string;
    teams?: string[];
  };
};

export async function sendApplication(_prev: JoinState, form: FormData): Promise<JoinState> {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const values = {
    name: oneLine(str("name")),
    email: str("email").trim(),
    department: oneLine(str("department")),
    year: str("year"),
    message: multiLine(str("message")),
    github: str("github").trim(),
    teams: form.getAll("teams").filter((t): t is string => typeof t === "string"),
  };
  const consent = form.get("consent") === "on";

  if (looksLikeBot(form)) return { status: "ok" };

  const { isBot } = await checkBotId();
  if (isBot)
    return {
      status: "error",
      message: "Gönderim doğrulanamadı. Sayfayı yenileyip tekrar dene.",
      values,
    };

  const teams = await getWorkingTeams();
  const teamNames = new Map(teams.map((t) => [t.id, t.name]));
  const errors: JoinState["errors"] = {};
  const nameError = checkName(values.name, { fullName: true });
  if (nameError) errors.name = nameError;
  const emailError = await checkEmail(values.email);
  if (emailError) errors.email = emailError;
  const deptError = checkDepartment(values.department);
  if (deptError) errors.department = deptError;
  if (values.year && !(values.year in YEAR_LABELS)) errors.year = "Sınıfını seç.";
  if (values.teams.length === 0 || values.teams.some((t) => !teamNames.has(t)))
    errors.teams = "En az bir ekip seç.";
  // GitHub sadece Yazılım ve Teknik Ekibi seçiliyse sorulur; isteğe bağlı
  const wantsGithub = values.teams.includes(GITHUB_TEAM);
  const github = wantsGithub && values.github ? normalizeGithub(values.github) : null;
  if (wantsGithub && values.github && !github)
    errors.github = "GitHub kullanıcı adın ya da profil linkin olmalı (ör. github.com/kullanici).";
  // Mesaj isteğe bağlı; yazıldıysa anlamlı olmalı
  const messageError = values.message && checkMessage(values.message, MESSAGE_RULES);
  if (messageError) errors.message = messageError;
  if (!consent) errors.consent = "Başvurunu değerlendirebilmemiz için onay gerekiyor.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  if (await rateLimited("katil", 2, 60 * 60 * 1000))
    return {
      status: "error",
      message: "Kısa sürede birden çok başvuru geldi. Biraz sonra tekrar dene.",
      values,
    };

  const app: Application = {
    name: values.name,
    email: values.email,
    department: values.department,
    year: values.year || null,
    teams: values.teams,
    message: values.message || null,
    github,
  };
  const fail = {
    status: "error",
    message: `Başvuru gönderilemedi. Biraz sonra tekrar dene ya da ${getSite().email} adresine yaz.`,
    values,
  } as const;

  // E-posta onayı: satır gizli anahtarla yazılır, başvurana tek kullanımlık bağlantı gider.
  // Kulübe bildirim bağlantıya tıklanınca gider (onay/actions.ts).
  const admin = adminClient();
  if (admin && (hasGmail || process.env.NODE_ENV === "development")) {
    // Aynı adrese kısa sürede çok onay e-postası gitmesin (başkasının adresini doldurma)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .ilike("email", values.email)
      .gte("created_at", since);
    if ((count ?? 0) >= 3)
      return {
        status: "error",
        message: "Bu adresle bugün birkaç başvuru yapıldı. E-postandaki onay bağlantısına bak.",
        values,
      };

    const token = randomBytes(32).toString("base64url");
    const { data, error } = await admin
      .from("applications")
      .insert({
        ...toRow(app),
        verify_token_hash: hashToken(token),
        verify_expires_at: new Date(Date.now() + VERIFY_TTL_MS).toISOString(),
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[katıl] veritabanına yazılamadı", error?.code);
      return (await notifyClub(app, "kapali")) ? { status: "ok" } : fail;
    }

    const link = `${SITE_URL}/katil/onay?t=${token}`;
    const firstName = values.name.split(" ")[0];
    const mailed = await sendGmail({
      to: values.email,
      subject: "Başvurunu onayla · GDG on Campus AİBÜ",
      html: `
    <div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#202124">
      <p>Merhaba ${escapeHtml(firstName)},</p>
      <p>GDG on Campus AİBÜ core team başvurun bize ulaştı. Bu adresin sana ait olduğunu doğrulamak için aşağıdaki bağlantıya tıkla ve açılan sayfada <b>Onayla</b>'ya bas:</p>
      <p><a href="${link}" style="display:inline-block;background:#34a853;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Başvurumu onayla</a></p>
      <p style="font-size:13px;color:#5f6368">Bağlantı 48 saat geçerli. Onaylamazsan başvurun değerlendirmeye alınmaz.<br>Bu başvuruyu sen yapmadıysan bu e-postayı yok say.</p>
    </div>`,
      text: `Merhaba ${firstName},\n\nGDG on Campus AİBÜ core team başvurun bize ulaştı. Adresini doğrulamak için bu bağlantıyı aç ve Onayla'ya bas:\n${link}\n\nBağlantı 48 saat geçerli. Bu başvuruyu sen yapmadıysan bu e-postayı yok say.`,
    });
    if (mailed) return { status: "verify", email: values.email };
    // Onay e-postası gitmediyse başvuru kaybolmasın: kulübe onaysız olarak bildirilir
    return (await notifyClub(app, "gonderilemedi")) ? { status: "ok" } : fail;
  }

  // Onay kapalıyken (Gmail ya da gizli anahtar ayarlı değil) eski yol: kaydet + kulübe bildir
  const db = publicClient();
  let stored = false;
  if (db) {
    const { error } = await db.from("applications").insert(toRow(app));
    if (error) console.error("[katıl] veritabanına yazılamadı", error.code);
    else stored = true;
  }
  const sent = await notifyClub(app, "kapali");
  // Biri tuttuysa başvuru kaybolmadı
  return stored || sent ? { status: "ok" } : fail;
}
