import Link from "next/link";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Window } from "@/components/ui/window";
import type { Tone } from "@/components/ui/button";
import { requirePanelUser } from "@/lib/panel/auth";
import { setActive } from "./actions";

export const metadata = { title: "Ekip" };

type Row = {
  id: string;
  slug: string;
  name: string;
  role: string;
  team_id: string;
  photo_url: string | null;
  bio: string | null;
  active: boolean;
  sort_order: number;
};

export default async function PanelTeam({ searchParams }: PageProps<"/panel/ekip">) {
  const { supabase } = await requirePanelUser("/panel/ekip");
  const [{ data: teams }, { data: members }, params] = await Promise.all([
    supabase.from("teams").select("id,name,tone").order("sort_order"),
    supabase
      .from("team_members")
      .select("id,slug,name,role,team_id,photo_url,bio,active,sort_order")
      .order("sort_order"),
    searchParams,
  ]);
  const rows = (members ?? []) as Row[];
  const saved = typeof params.kaydedildi === "string" ? params.kaydedildi : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-sm text-fg-subtle">{"// contributors.json"}</p>
          <h1 className="text-4xl font-bold tracking-tight">Ekip</h1>
          <p className="text-fg-muted">
            {rows.filter((r) => r.active).length} aktif, {rows.filter((r) => !r.active).length}{" "}
            pasif üye. Değişiklikler sitede birkaç saniye içinde görünür.
          </p>
        </div>
        <ButtonLink href="/panel/ekip/yeni" tone="green">
          + Yeni üye
        </ButtonLink>
      </header>

      {saved && (
        <p
          role="status"
          className="rounded-xl border-2 border-green-ink bg-green-soft px-4 py-3 text-sm"
        >
          ✓ {saved} kaydedildi.
        </p>
      )}

      {(teams ?? []).map((team) => {
        const list = rows.filter((r) => r.team_id === team.id);
        return (
          <Window
            key={team.id}
            title={team.name}
            tone={team.tone as Tone}
            meta={`${list.length} kişi`}
            titleAs="h2"
          >
            <ul className="divide-y-2 divide-border">
              {list.length === 0 && (
                <li className="px-5 py-3 text-sm text-fg-muted">Bu ekipte üye yok.</li>
              )}
              {list.map((m) => (
                <li
                  key={m.id}
                  className={`flex flex-wrap items-center gap-4 px-5 py-3 ${m.active ? "" : "opacity-60"}`}
                >
                  <Avatar name={m.name} photoUrl={m.photo_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/panel/ekip/duzenle?id=${m.id}`}
                      className="font-bold hover:underline"
                    >
                      {m.name}
                    </Link>
                    <p className="text-sm text-fg-muted">
                      {m.role}
                      {!m.active && " · pasif"}
                      {(!m.photo_url || !m.bio) && " · eksik profil"}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-fg-subtle">sıra {m.sort_order}</span>
                  <div className="flex gap-2 text-sm">
                    <Link
                      href={`/panel/ekip/duzenle?id=${m.id}`}
                      className="rounded-full border-2 border-border-strong px-3 py-1 hover:bg-surface-2"
                    >
                      düzenle
                    </Link>
                    <form action={setActive}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="active" value={m.active ? "false" : "true"} />
                      <button
                        type="submit"
                        className="rounded-full border-2 border-border-strong px-3 py-1 hover:bg-surface-2"
                      >
                        {m.active ? "pasife al" : "geri al"}
                      </button>
                    </form>
                    {m.active && (
                      <Link
                        href={`/ekip/${m.slug}`}
                        className="rounded-full px-3 py-1 text-fg-subtle hover:underline"
                      >
                        sitede ↗
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Window>
        );
      })}
    </div>
  );
}
