// Başvurunun ortak parçaları: veritabanı satırı, doğrulama anahtarı özeti ve kulübe giden bildirim.
// Sadece sunucuda kullanılır (katil/actions.ts ve katil/onay/actions.ts).

import { createHash } from "node:crypto";
import { getSite, getWorkingTeams } from "@/lib/content";
import { escapeHtml, sendMail } from "@/lib/form-guard";
import { YEAR_LABELS } from "./fields";

export type Application = {
  name: string;
  email: string;
  department: string | null;
  year: string | null;
  teams: string[];
  message: string | null;
  github: string | null;
};

/** Doğrulama bağlantısının geçerlilik süresi */
export const VERIFY_TTL_DAYS = 7;
export const VERIFY_TTL_MS = VERIFY_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Bağlantıdaki anahtar saklanmaz; SHA-256 özeti saklanır */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const toRow = (a: Application) => ({
  name: a.name,
  email: a.email,
  department: a.department || null,
  year: a.year || null,
  teams: a.teams,
  message: a.message || null,
  github: a.github,
  consent: true,
});

/** Başvuruyu kulüp adresine e-postayla bildirir. */
export async function notifyClub(a: Application): Promise<boolean> {
  const teams = await getWorkingTeams();
  const teamNames = new Map(teams.map((t) => [t.id, t.name]));
  const chosen = a.teams.map((t) => teamNames.get(t) ?? t).join(", ");
  const rows: [string, string][] = [
    ["Ad", a.name],
    ["E-posta", a.email],
    ["Bölüm", a.department || "—"],
    ["Sınıf", (a.year && YEAR_LABELS[a.year]) || "—"],
    ["Ekip(ler)", chosen],
    ...(a.github ? ([["GitHub", a.github]] as [string, string][]) : []),
  ];
  return sendMail({
    to: getSite().email,
    replyTo: a.email,
    subject: `[Başvuru] ${a.name} · ${chosen}`,
    html: `
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${escapeHtml(v)}</b></td></tr>`).join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(a.message || "(mesaj yok)")}</p>
    <p style="font-family:sans-serif;font-size:12px;color:#999">Sitedeki katılım formundan gönderildi; panelde Başvurular'da da var. Başvurana teşekkür e-postası gitti; adresini doğrularsa panelde "✓ onaylı" görünür. Yanıtla dersen doğrudan ${escapeHtml(a.email)} adresine gider.</p>`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${a.message ?? ""}`,
  });
}
