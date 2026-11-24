import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/team/avatar";
import { requirePanelUser } from "@/lib/panel/auth";
import { setActive } from "../actions";
import { MemberForm, type MemberValues } from "../member-form";

export const metadata = { title: "Üye" };

const SELECT = "id,slug,name,role,team_id,department,year,photo_url,bio,links,sort_order,active";

/** Panelde kişi sayfası: üstte profil özeti, altında düzenleme formu. ?id= ya da ?slug= ile açılır. */
export default async function MemberPage({ searchParams }: PageProps<"/panel/ekip/duzenle">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const id = one(params.id);
  const slug = one(params.slug);
  const { supabase } = await requirePanelUser("/panel/ekip");

  let query = supabase.from("team_members").select(SELECT);
  if (/^[0-9a-f-]{36}$/.test(id)) query = query.eq("id", id);
  else if (/^[a-z0-9-]{1,80}$/.test(slug)) query = query.eq("slug", slug);
  else notFound();

  const [{ data: teams }, { data }] = await Promise.all([
    supabase.from("teams").select("id,name").order("sort_order"),
    query.maybeSingle(),
  ]);
  if (!data) notFound();
  const member = data as MemberValues & { id: string; slug: string };
  const team = teams?.find((t) => t.id === member.team_id);

  return (
    <div className="space-y-6">
      <Link href="/panel/ekip" className="inline-block text-sm text-fg-muted hover:text-fg">
        ← Ekip
      </Link>

      <header className="flex flex-wrap items-center gap-5">
        <Avatar name={member.name} photoUrl={member.photo_url} size={88} />
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{member.name}</h1>
          <p className="text-fg-muted">
            {member.role}
            {team ? ` · ${team.name}` : ""}
          </p>
          <p className="text-sm">
            <span
              className={`inline-block rounded-full px-2 py-0.5 ${member.active ? "bg-green-soft" : "bg-silver-soft"}`}
            >
              {member.active ? "sitede görünüyor" : "pasif · sitede görünmüyor"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {member.active && (
            <a
              href={`/ekip/${member.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-border px-3 py-1.5 hover:bg-surface-2"
            >
              Sitede gör ↗
            </a>
          )}
          <form action={setActive}>
            <input type="hidden" name="id" value={member.id} />
            <input type="hidden" name="active" value={member.active ? "false" : "true"} />
            <input type="hidden" name="donus" value="kisi" />
            <button
              type="submit"
              className="rounded-full border-2 border-border px-3 py-1.5 hover:bg-surface-2"
            >
              {member.active ? "Pasife al" : "Tekrar aktif yap"}
            </button>
          </form>
        </div>
      </header>

      {params.kaydedildi && (
        <p
          role="status"
          className="rounded-xl border-2 border-green-ink bg-green-soft px-4 py-3 text-sm"
        >
          ✓ Kaydedildi. Sitede birkaç saniye içinde görünür.
        </p>
      )}

      <MemberForm teams={teams ?? []} member={member} />
    </div>
  );
}
