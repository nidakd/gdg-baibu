import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Window } from "@/components/ui/window";
import { getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { getVisits } from "@/lib/panel/analytics";
import { requirePanelUser } from "@/lib/panel/auth";

export const metadata = { title: "Özet" };

/** Eğitim dönemi eylülde başlar: 2026-11 → 2026-09-01, 2026-03 → 2025-09-01. */
function termStart(now = new Date()): string {
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-09-01`;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export default async function PanelHome() {
  const { supabase, user } = await requirePanelUser("/panel");
  const site = getSite();
  const since30 = daysAgo(30);
  const [{ upcoming, past }, visits, messages, recent, members, applications] = await Promise.all([
    getEventTimeline(),
    getVisits(),
    supabase
      .from("contact_messages")
      .select("id,name,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since30),
    supabase.from("team_members").select("active,photo_url,bio"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "yeni"),
  ]);
  const thisTerm = past.filter((e) => e.startsAt >= termStart()).length;
  const next = upcoming[0];
  const active = (members.data ?? []).filter((m) => m.active);
  const missing = active.filter((m) => !m.photo_url || !m.bio).length;

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="font-mono text-sm text-fg-subtle">{"// whoami"}</p>
        <h1 className="text-4xl font-bold tracking-tight">
          Merhaba {user.name?.split(" ")[0] ?? ""} 👋
        </h1>
      </header>

      <section aria-labelledby="topluluk" className="space-y-4">
        <h2 id="topluluk" className="font-mono text-sm text-fg-subtle">
          topluluk ve etkinlikler · GDG Community senkronu {formatDate(site.stats.statsUpdatedAt)}
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="topluluk üyesi"
            value={site.stats.communityMembers}
            tone="blue"
            size="md"
          />
          <StatTile label="etkinlik (toplam)" value={past.length} tone="green" size="md" />
          <StatTile label="bu dönem" value={thisTerm} tone="yellow" size="md" />
          <StatTile label="core team" value={active.length} tone="red" size="md" />
        </dl>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-1 p-5">
            <p className="font-mono text-xs text-fg-subtle">sıradaki etkinlik</p>
            {next ? (
              <>
                <Link
                  href={`/etkinlikler/${next.slug}`}
                  className="text-lg font-bold hover:underline"
                >
                  {next.title}
                </Link>
                <p className="text-fg-muted">
                  {formatDate(next.startsAt)}
                  {next.venue ? ` · ${next.venue}` : ""}
                </p>
              </>
            ) : (
              <p className="text-fg-muted">
                Planlanmış etkinlik yok. GDG Community&apos;ye eklenince burada görünür.
              </p>
            )}
          </Card>
          <Card className="space-y-1 p-5">
            <p className="font-mono text-xs text-fg-subtle">ekip profilleri</p>
            <p className="text-lg font-bold">
              {missing === 0 ? "Hepsi tamam" : `${missing} profilde fotoğraf ya da tanıtım eksik`}
            </p>
            <Link href="/panel/ekip" className="text-fg-muted underline hover:no-underline">
              Ekibi düzenle →
            </Link>
          </Card>
          <Card tone={applications.count ? "blue" : "plain"} className="space-y-1 p-5">
            <p className="font-mono text-xs text-fg-subtle">core team başvuruları</p>
            <p className="text-lg font-bold">
              {applications.count ? `${applications.count} yeni başvuru` : "Bekleyen başvuru yok"}
            </p>
            <Link
              href="/panel/basvurular?durum=yeni"
              className="text-fg-muted underline hover:no-underline"
            >
              Başvurulara bak →
            </Link>
          </Card>
        </div>
      </section>

      <section aria-labelledby="ziyaret" className="space-y-4">
        <h2 id="ziyaret" className="font-mono text-sm text-fg-subtle">
          site ziyaretleri · Vercel Web Analytics
        </h2>
        {visits.status === "ok" ? (
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <dl className="grid grid-cols-2 gap-3">
              <StatTile
                label="son 7 gün"
                value={visits.visits.last7 ?? "—"}
                tone="lilac"
                size="md"
              />
              <StatTile
                label="son 30 gün"
                value={visits.visits.last30 ?? "—"}
                tone="silver"
                size="md"
              />
            </dl>
            <Window title="en çok bakılan sayfalar" tone="lilac" meta="30 gün">
              <ol className="divide-y-2 divide-border font-mono text-sm">
                {visits.visits.topPages.length === 0 && (
                  <li className="px-5 py-3 text-fg-muted">veri yok</li>
                )}
                {visits.visits.topPages.map((p) => (
                  <li key={p.path} className="flex justify-between gap-4 px-5 py-2.5">
                    <span className="truncate">{p.path}</span>
                    <span className="text-fg-subtle">{p.count}</span>
                  </li>
                ))}
              </ol>
            </Window>
          </div>
        ) : (
          <Card className="p-5 text-fg-muted">
            {visits.status === "no-token"
              ? "Ziyaret sayıları için Vercel okuma anahtarı (VERCEL_ANALYTICS_TOKEN) eklenince burada görünecek."
              : "Ziyaret sayıları şu an alınamadı."}{" "}
            Şimdilik:{" "}
            <a
              href="https://vercel.com/nidakds-projects/gdgoncampusaibu/analytics"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Vercel Analytics ↗
            </a>
          </Card>
        )}
      </section>

      <section aria-labelledby="mesaj" className="space-y-4">
        <h2 id="mesaj" className="font-mono text-sm text-fg-subtle">
          iletişim formu · toplam {messages.count ?? 0}, son 30 günde {recent.count ?? 0}
        </h2>
        <Window title="~/panel/mesajlar" tone="yellow" meta="son 5">
          <ul className="divide-y-2 divide-border text-sm">
            {(messages.data ?? []).length === 0 && (
              <li className="px-5 py-3 text-fg-muted">Henüz mesaj yok.</li>
            )}
            {(messages.data ?? []).map((m) => (
              <li key={m.id} className="flex justify-between gap-4 px-5 py-2.5">
                <span className="truncate font-medium">{m.name}</span>
                <span className="shrink-0 font-mono text-xs text-fg-subtle">
                  {formatDate(m.created_at)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t-2 border-border px-5 py-2.5 text-sm">
            <Link href="/panel/mesajlar" className="underline hover:no-underline">
              Tüm mesajlar →
            </Link>
          </div>
        </Window>
      </section>
    </div>
  );
}
