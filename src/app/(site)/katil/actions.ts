"use server";

// Core team başvurusu: doğrular, veritabanına yazar (panelde görünür) ve kulüp adresine e-posta atar.

import { randomBytes } from "node:crypto";
import { checkBotId } from "botid/server";
import { getSite, getWorkingTeams } from "@/lib/content";
import { checkEmail } from "@/lib/email-check";
import { escapeHtml, looksLikeBot, multiLine, oneLine, rateLimited } from "@/lib/form-guard";
import { sendGmail } from "@/lib/gmail";
import { SITE_URL } from "@/lib/seo";
import { adminClient } from "@/lib/supabase/admin";
import { publicClient } from "@/lib/supabase/public";
import { checkDepartment, checkMessage, checkName } from "@/lib/text-guard";
import { GITHUB_TEAM, MESSAGE_RULES, normalizeGithub, YEAR_LABELS } from "./fields";
import { type Application, hashToken, notifyClub, toRow, VERIFY_TTL_MS } from "./notify";

export type JoinField =
  "name" | "email" | "department" | "year" | "teams" | "github" | "message" | "consent";

export type JoinState = {
  status: "idle" | "ok" | "error";
  message?: string;
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

  const admin = adminClient();
  if (admin) {
    // Aynı adrese kısa sürede çok başvuru (ve e-posta) gitmesin
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .ilike("email", values.email)
      .gte("created_at", since);
    if ((count ?? 0) >= 3)
      return {
        status: "error",
        message: "Bu adresle bugün birkaç başvuru yapıldı. Sana döneceğiz, biraz bekle.",
        values,
      };
  }

  // Gizli anahtar varsa sunucu yazar ve doğrulama anahtarını ekler; yoksa yayınlanabilir anahtarla
  const token = admin ? randomBytes(32).toString("base64url") : null;
  const db = admin ?? publicClient();
  let stored = false;
  if (db) {
    const row = token
      ? {
          ...toRow(app),
          verify_token_hash: hashToken(token),
          verify_expires_at: new Date(Date.now() + VERIFY_TTL_MS).toISOString(),
        }
      : toRow(app);
    const { error } = await db.from("applications").insert(row);
    if (error) console.error("[katıl] veritabanına yazılamadı", error.code);
    else stored = true;
  }
  // Kulübe hemen bildirilir; doğrulama başvuruyu bekletmez
  const sent = await notifyClub(app);
  // Biri tuttuysa başvuru kaybolmadı
  if (!stored && !sent) return fail;

  // Başvurana teşekkür e-postası (altında isteğe bağlı adres doğrulama). Gitmese de başvuru alındı.
  const firstName = values.name.split(" ")[0];
  const chosen = values.teams.map((t) => teamNames.get(t) ?? t).join(", ");
  const club = getSite().email;
  const link = stored && token ? `${siteOrigin()}/katil/onay?t=${token}` : null;
  await sendGmail({
    to: values.email,
    subject: "Başvurunu aldık · GDG on Campus AİBÜ",
    html: `
    <div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#202124">
      <p>Merhaba ${escapeHtml(firstName)},</p>
      <p>GDG on Campus AİBÜ core team başvurunu aldık, teşekkürler! 🎉</p>
      <p>Başvurun ekibimiz tarafından değerlendiriliyor. Birkaç gün içinde bu adres üzerinden sana döneceğiz.</p>
      <p style="font-size:14px;color:#5f6368">Başvurduğun ekip(ler): ${escapeHtml(chosen)}</p>
      ${
        link
          ? `<p style="font-size:14px">Sana ulaşabileceğimizden emin olmak için adresini doğrularsan seviniriz:</p>
      <p><a href="${link}" style="display:inline-block;background:#34a853;color:#fff;padding:9px 16px;border-radius:999px;text-decoration:none;font-size:14px">E-posta adresimi doğrula</a></p>`
          : ""
      }
      <p style="font-size:13px;color:#5f6368">Sorun olursa ${escapeHtml(club)} adresine yazabilirsin. Bu başvuruyu sen yapmadıysan bu e-postayı yok say.</p>
    </div>`,
    text: `Merhaba ${firstName},\n\nGDG on Campus AİBÜ core team başvurunu aldık, teşekkürler!\n\nBaşvurun ekibimiz tarafından değerlendiriliyor. Birkaç gün içinde bu adres üzerinden sana döneceğiz.\n\nBaşvurduğun ekip(ler): ${chosen}\n${link ? `\nAdresini doğrulamak için: ${link}\n` : ""}\nSorun olursa ${club} adresine yazabilirsin. Bu başvuruyu sen yapmadıysan bu e-postayı yok say.`,
  });
  return { status: "ok" };
}

/** Bağlantıların gideceği adres: preview'da o dalın adresi, yayında sitenin adresi */
function siteOrigin(): string {
  const branch = process.env.VERCEL_BRANCH_URL;
  return process.env.VERCEL_ENV === "preview" && branch ? `https://${branch}` : SITE_URL;
}
