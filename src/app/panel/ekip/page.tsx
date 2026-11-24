import Link from "next/link";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { Avatar } from "@/components/team/avatar";
import { requirePanelUser } from "@/lib/panel/auth";

export const metadata = { title: "Ekip" };

type Row = {
  id: string;
  name: string;
  role: string;
  team_id: string;
  photo_url: string | null;
  bio: string | null;
  active: boolean;
};

/** Ekiplere göre üye listesi; satıra tıklayınca kişinin panel sayfası açılır. */
export default async function PanelTeam() {
  const { supabase } = await requirePanelUser("/panel/ekip");
  const [{ data: teams }, { data: members }] = await Promise.all([
    supabase.from("teams").select("id,name").order("sort_order"),
    supabase
      .from("team_members")
      .select("id,name,role,team_id,photo_url,bio,active")
      .order("sort_order"),
  ]);
  const rows = (members ?? []) as Row[];
  const active = rows.filter((r) => r.active).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Ekip</h1>
          <p className="text-fg-muted">
            {active} aktif{rows.length > active ? `, ${rows.length - active} pasif` : ""} üye
          </p>
        </div>
        <Link
          href="/panel/ekip/yeni"
          className="rounded-full border-2 border-border-strong bg-green px-4 py-2 text-sm font-medium text-ink-black"
        >
          + Yeni üye
        </Link>
      </header>

      {(teams ?? []).map((team) => {
        const list = rows.filter((r) => r.team_id === team.id);
        return (
          <PanelBox key={team.id} title={team.name} meta={`${list.length} kişi`}>
            <ul className="divide-y-2 divide-border">
              {list.length === 0 && (
                <li className="px-5 py-3 text-sm text-fg-muted">Bu ekipte üye yok.</li>
              )}
              {list.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/panel/ekip/duzenle?id=${m.id}`}
                    className={`flex items-center gap-4 px-5 py-3 hover:bg-surface-2 ${m.active ? "" : "opacity-60"}`}
                  >
                    <Avatar name={m.name} photoUrl={m.photo_url} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{m.name}</span>
                      <span className="block text-sm text-fg-muted">
                        {m.role}
                        {!m.active && " · pasif"}
                        {(!m.photo_url || !m.bio) && " · eksik profil"}
                      </span>
                    </span>
                    <span aria-hidden className="text-fg-subtle">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PanelBox>
        );
      })}
    </div>
  );
}
