"use server";

// Core team başvurusu: doğrular, veritabanına yazar (panelde görünür) ve kulüp adresine e-posta atar.

import { checkBotId } from "botid/server";
import { getSite, getWorkingTeams } from "@/lib/content";
import {
  EMAIL,
  escapeHtml,
  looksLikeBot,
  multiLine,
  oneLine,
  rateLimited,
  sendMail,
} from "@/lib/form-guard";
import { publicClient } from "@/lib/supabase/public";
import { checkDepartment, checkMessage, checkName } from "@/lib/text-guard";
import { GITHUB_TEAM, MESSAGE_RULES, normalizeGithub, YEAR_LABELS } from "./fields";

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
  if (!EMAIL.test(values.email) || values.email.length > 200)
    errors.email = "Bu e-posta adresi olmadı.";
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

  const db = publicClient();
  let stored = false;
  if (db) {
    const { error } = await db.from("applications").insert({
      name: values.name,
      email: values.email,
      department: values.department || null,
      year: values.year || null,
      teams: values.teams,
      message: values.message || null,
      github,
      consent: true,
    });
    if (error) console.error("[katıl] veritabanına yazılamadı", error.code);
    else stored = true;
  }

  const chosen = values.teams.map((t) => teamNames.get(t) ?? t).join(", ");
  const rows: [string, string][] = [
    ["Ad", values.name],
    ["E-posta", values.email],
    ["Bölüm", values.department || "—"],
    ["Sınıf", YEAR_LABELS[values.year] ?? "—"],
    ["Ekip(ler)", chosen],
    ...(github ? ([["GitHub", github]] as [string, string][]) : []),
  ];
  const sent = await sendMail({
    to: getSite().email,
    replyTo: values.email,
    subject: `[Başvuru] ${values.name} · ${chosen}`,
    html: `
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${escapeHtml(v)}</b></td></tr>`).join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(values.message || "(mesaj yok)")}</p>
    <p style="font-family:sans-serif;font-size:12px;color:#999">Sitedeki katılım formundan gönderildi; panelde Başvurular'da da var. Yanıtla dersen doğrudan ${escapeHtml(values.email)} adresine gider.</p>`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${values.message}`,
  });

  // Biri tuttuysa başvuru kaybolmadı
  if (!stored && !sent)
    return {
      status: "error",
      message: `Başvuru gönderilemedi. Biraz sonra tekrar dene ya da ${getSite().email} adresine yaz.`,
      values,
    };
  return { status: "ok" };
}
