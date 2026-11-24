import { PanelBox } from "@/app/panel/_components/panel-box";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";

export const metadata = { title: "Mesajlar" };

/** İletişim formundan gelen mesajlar (e-postaya da gidiyor). En yeni 100 mesaj. */
export default async function Messages() {
  const { supabase } = await requirePanelUser("/panel/mesajlar");
  const { data, count } = await supabase
    .from("contact_messages")
    .select("id,name,email,message,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mesajlar</h1>
        <p className="text-fg-muted">
          İletişim formundan gelenler ({count ?? 0}). Her mesaj ayrıca kulüp e-postasına gidiyor;
          yanıtı oradan yaz.
        </p>
      </header>
      {(data ?? []).length === 0 && <p className="text-fg-muted">Henüz mesaj yok.</p>}
      <ul className="space-y-4">
        {(data ?? []).map((m) => (
          <li key={m.id}>
            <PanelBox title={m.name} meta={formatDate(m.created_at)} titleAs="h2">
              <div className="space-y-3 p-5">
                <a href={`mailto:${m.email}`} className="font-mono text-sm underline">
                  {m.email}
                </a>
                <p className="whitespace-pre-wrap">{m.message}</p>
              </div>
            </PanelBox>
          </li>
        ))}
      </ul>
    </div>
  );
}
