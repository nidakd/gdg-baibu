import Link from "next/link";
import { redirect } from "next/navigation";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { requirePanelUser } from "@/lib/panel/auth";

export const metadata = { title: "Değişiklik geçmişi" };

type Row = {
  id: number;
  at: string;
  actor: string;
  action: "ekle" | "guncelle" | "sil";
  entity: string;
  label: string | null;
};

const ENTITIES: Record<string, string> = {
  teams: "ekip",
  team_members: "üye",
  site_events: "etkinlik",
  event_registration_settings: "kayıt ayarı",
  event_coordinators: "koordinatör",
  posts: "içerik",
  site_settings: "site ayarı",
  panel_users: "panel kullanıcısı",
  applications: "başvuru",
  registrations: "etkinlik kaydı",
  contact_messages: "mesaj",
};
const ACTIONS = {
  ekle: ["ekledi", "text-green-ink"],
  guncelle: ["güncelledi", "text-blue-ink"],
  sil: ["sildi", "text-red-ink"],
} as const;

const timeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

const PAGE = 100;

/** Panelde yapılan değişiklikler, en yeniden (sadece admin). */
export default async function History({ searchParams }: PageProps<"/panel/gecmis">) {
  const { supabase, user } = await requirePanelUser("/panel/gecmis");
  if (user.role !== "admin") redirect("/panel");
  const { once } = await searchParams;
  const before = typeof once === "string" && /^\d+$/.test(once) ? Number(once) : null;
  let query = supabase
    .from("audit_log")
    .select("id,at,actor,action,entity,label")
    .order("id", { ascending: false })
    .limit(PAGE);
  if (before) query = query.lt("id", before);
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Değişiklik geçmişi</h1>
        <p className="max-w-prose text-fg-muted">
          Panelde kim neyi ne zaman değiştirdi. &quot;sistem&quot;: site ya da otomatik işlem (ör.
          başvuranın e-postasını doğrulaması). Formdan gelen yeni kayıtlar burada görünmez.
        </p>
      </header>
      <PanelBox title="~/panel/gecmis" meta={`${rows.length} kayıt`}>
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-fg-muted">Henüz kayıt yok.</p>
        ) : (
          <ul className="divide-y-2 divide-border text-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 px-5 py-2.5">
                <span className="w-28 shrink-0 font-mono text-xs text-fg-subtle">
                  {timeFmt.format(new Date(r.at))}
                </span>
                <span className="font-medium break-all">{r.actor}</span>
                <span className={ACTIONS[r.action][1]}>{ACTIONS[r.action][0]}</span>
                <span className="text-fg-muted">{ENTITIES[r.entity] ?? r.entity}:</span>
                <span className="min-w-0 break-words">{r.label ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelBox>
      {rows.length === PAGE && (
        <Link
          href={`/panel/gecmis?once=${rows[rows.length - 1].id}`}
          className="inline-block text-sm underline"
        >
          Daha eski →
        </Link>
      )}
    </div>
  );
}
