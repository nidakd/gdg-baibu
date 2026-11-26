import { PanelBox } from "@/app/panel/_components/panel-box";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { KEEP_LOGINS_DAYS } from "@/lib/panel/login-requests";
import { adminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Son girişler" };

type Row = {
  id: string;
  email: string;
  device: string | null;
  created_at: string;
  expires_at: string;
  approved_at: string | null;
  used_at: string | null;
};

const timeFmt = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

/** Sunucuda istek anında bir kez değerlendirilir */
const isPast = (at: string) => new Date(at).getTime() < Date.now();

function outcome(r: Row): { label: string; tone: string } {
  if (r.approved_at && r.used_at) return { label: "Giriş yapıldı", tone: "text-green-ink" };
  if (r.approved_at) return { label: "Onaylandı, tarayıcı bekleniyor", tone: "text-fg-muted" };
  if (r.used_at) return { label: "İptal (sayı eşleşmedi)", tone: "text-red-ink" };
  if (isPast(r.expires_at)) return { label: "Süresi doldu", tone: "text-fg-subtle" };
  return { label: "Onay bekliyor", tone: "text-fg-muted" };
}

/** Panel giriş istekleri. Sadece admin; tabloyu gizli anahtarla okur (RLS'te politika yok). */
export default async function Logins() {
  const { user } = await requirePanelUser("/panel/girisler");
  const admin = adminClient();
  if (user.role !== "admin" || !admin)
    return (
      <p className="text-fg-muted">
        {user.role !== "admin"
          ? "Bu sayfayı sadece adminler görebilir."
          : "Bu ortamda kurulu değil."}
      </p>
    );

  const { data } = await admin
    .from("login_requests")
    .select("id,email,device,created_at,expires_at,approved_at,used_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Son girişler</h1>
        <p className="text-fg-muted">
          Panele giriş istekleri. Başarılı girişler {KEEP_LOGINS_DAYS} gün, diğer istekler bir gün
          saklanır. Tanımadığın bir cihaz görürsen haber ver.
        </p>
      </header>
      {rows.length === 0 && <p className="text-fg-muted">Henüz giriş yok.</p>}
      {rows.length > 0 && (
        <PanelBox title="~/panel/girisler" meta={`${rows.length} kayıt`}>
          <ul className="divide-y-2 divide-border">
            {rows.map((r) => {
              const o = outcome(r);
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.email}</p>
                    <p className="text-sm text-fg-muted">
                      {r.device ?? "Bilinmeyen cihaz"} · {formatDate(r.created_at)}{" "}
                      {timeFmt.format(new Date(r.created_at))}
                    </p>
                  </div>
                  <p className={`text-sm font-medium ${o.tone}`}>{o.label}</p>
                </li>
              );
            })}
          </ul>
        </PanelBox>
      )}
    </div>
  );
}
