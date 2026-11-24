// Vercel Web Analytics'ten ziyaret sayıları (panel özeti).
// VERCEL_ANALYTICS_TOKEN: Vercel → Account Settings → Tokens'tan, sadece bu takıma erişen salt okunur anahtar.
// Anahtar yoksa ya da API cevap vermezse kart "veri yok" der; panel çalışmaya devam eder.

const API = "https://api.vercel.com/v1/query/web-analytics/visits";
// Sitenin Vercel projesi (Nida'nın hesabı). Gizli bilgi değil, sadece adres.
const TEAM_ID = "team_fmAdFcU8kmS64IZ95r8QBIip";
const PROJECT = process.env.VERCEL_PROJECT_ID || "gdgoncampusaibu";

export type Visits = {
  last7: number | null;
  last30: number | null;
  topPages: { path: string; count: number }[];
};

export type VisitsResult = { status: "ok"; visits: Visits } | { status: "no-token" | "error" };

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

async function get(path: string, params: Record<string, string>) {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const qs = new URLSearchParams({ projectId: PROJECT, teamId: TEAM_ID, ...params });
  const res = await fetch(`${API}/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Vercel Analytics ${res.status}`);
  return (await res.json()) as unknown;
}

/** Cevabın içinden ilk sayıyı bulur ({ data: [{ count }] }, { count } ya da { total } biçimleri). */
function firstNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (Array.isArray(value)) {
    for (const v of value) {
      const n = firstNumber(v);
      if (n !== null) return n;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const key of ["count", "total", "value", "pageviews", "visits", "data"]) {
      if (key in o) {
        const n = firstNumber(o[key]);
        if (n !== null) return n;
      }
    }
  }
  return null;
}

export async function getVisits(): Promise<VisitsResult> {
  if (!process.env.VERCEL_ANALYTICS_TOKEN) return { status: "no-token" };
  try {
    const now = new Date().toISOString();
    const [c7, c30, pages] = await Promise.all([
      get("count", { since: daysAgo(7), until: now }),
      get("count", { since: daysAgo(30), until: now }),
      get("aggregate", { since: daysAgo(30), until: now, by: "requestPath", limit: "5" }).catch(
        () => null,
      ),
    ]);
    const rows = (pages as { data?: Record<string, unknown>[] } | null)?.data ?? [];
    const topPages = rows.flatMap((r) => {
      const path = typeof r.requestPath === "string" ? r.requestPath : null;
      const count = firstNumber(r);
      return path && count !== null ? [{ path, count }] : [];
    });
    return { status: "ok", visits: { last7: firstNumber(c7), last30: firstNumber(c30), topPages } };
  } catch (err) {
    console.error("[panel] ziyaret sayıları alınamadı", err);
    return { status: "error" };
  }
}
