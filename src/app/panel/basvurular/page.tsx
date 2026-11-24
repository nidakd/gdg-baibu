import Link from "next/link";
import { YEAR_LABELS } from "@/app/(site)/katil/fields";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { getTeams } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { updateApplication } from "./actions";
import { STATUSES } from "./statuses";

export const metadata = { title: "Başvurular" };

type Row = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  year: string | null;
  teams: string[];
  message: string | null;
  github: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export default async function Applications({ searchParams }: PageProps<"/panel/basvurular">) {
  const { supabase } = await requirePanelUser("/panel/basvurular");
  const { durum } = await searchParams;
  const filter = typeof durum === "string" && durum in STATUSES ? durum : null;
  let query = supabase
    .from("applications")
    .select("id,name,email,department,year,teams,message,github,status,notes,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter) query = query.eq("status", filter);
  const [{ data }, teams] = await Promise.all([query, getTeams()]);
  const teamName = new Map(teams.map((t) => [t.id, t.name]));
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Başvurular</h1>
        <p className="text-fg-muted">
          /katil formundan gelenler. Her başvuru kulüp e-postasına da gidiyor; yanıtı oradan yaz,
          durumu burada işaretle.
        </p>
      </header>

      <nav aria-label="Duruma göre" className="flex flex-wrap gap-2 font-mono text-sm">
        <FilterLink href="/panel/basvurular" active={!filter}>
          hepsi
        </FilterLink>
        {Object.entries(STATUSES).map(([key, s]) => (
          <FilterLink key={key} href={`/panel/basvurular?durum=${key}`} active={filter === key}>
            {s.label}
          </FilterLink>
        ))}
      </nav>

      {rows.length === 0 && <p className="text-fg-muted">Bu listede başvuru yok.</p>}
      <ul className="space-y-4">
        {rows.map((a) => (
          <li key={a.id}>
            <PanelBox
              title={a.name}
              meta={`${STATUSES[a.status]?.label ?? a.status} · ${formatDate(a.created_at)}`}
              titleAs="h2"
            >
              <div className="grid gap-5 p-5 md:grid-cols-[1fr_18rem]">
                <div className="space-y-2 text-sm">
                  <a href={`mailto:${a.email}`} className="font-mono underline">
                    {a.email}
                  </a>
                  <p className="text-fg-muted">
                    {[a.department, a.year ? YEAR_LABELS[a.year] : null]
                      .filter(Boolean)
                      .join(" · ") || "bölüm / sınıf yok"}
                  </p>
                  <p>
                    <span className="text-fg-subtle">ekip: </span>
                    {a.teams.map((t) => teamName.get(t) ?? t).join(", ")}
                  </p>
                  {a.github && (
                    <p>
                      <span className="text-fg-subtle">GitHub: </span>
                      <a href={a.github} target="_blank" rel="noreferrer" className="underline">
                        {a.github.replace("https://", "")} ↗
                      </a>
                    </p>
                  )}
                  {a.message && <p className="text-base whitespace-pre-wrap">{a.message}</p>}
                </div>
                <form action={updateApplication} className="space-y-2">
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="filtre" value={filter ?? ""} />
                  <label className="block font-mono text-xs text-fg-subtle" htmlFor={`s-${a.id}`}>
                    durum
                  </label>
                  <select
                    id={`s-${a.id}`}
                    name="status"
                    defaultValue={a.status}
                    className="w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2"
                  >
                    {Object.entries(STATUSES).map(([key, s]) => (
                      <option key={key} value={key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <label className="block font-mono text-xs text-fg-subtle" htmlFor={`n-${a.id}`}>
                    not (sadece panelde)
                  </label>
                  <textarea
                    id={`n-${a.id}`}
                    name="notes"
                    rows={3}
                    maxLength={2000}
                    defaultValue={a.notes ?? ""}
                    className="w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-full border-2 border-border-strong bg-green px-4 py-1.5 text-sm font-medium text-ink-black"
                  >
                    Kaydet
                  </button>
                </form>
              </div>
            </PanelBox>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border-2 border-border-strong px-3 py-1 ${active ? "bg-blue-soft" : "hover:bg-surface-2"}`}
    >
      {children}
    </Link>
  );
}
