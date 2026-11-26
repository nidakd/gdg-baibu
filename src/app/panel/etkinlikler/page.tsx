import Link from "next/link";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { StatTile } from "@/components/ui/stat-tile";
import { type Event, getEvents, SITE_EVENT_COLUMNS, siteEventToEvent } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { CoordinatorPicker } from "./coordinator-picker";

export const metadata = { title: "Etkinlikler" };

type Member = { id: string; name: string; active: boolean };

/** Eğitim dönemi eylülde başlar: 2026-11 → 2026 (2026–27), 2026-03 → 2025 (2025–26). */
const termYear = (iso: string) => {
  const [y, m] = iso.slice(0, 7).split("-").map(Number);
  return m >= 9 ? y : y - 1;
};
const termLabel = (y: number) => `${y}–${String((y + 1) % 100).padStart(2, "0")}`;

/** Sunucuda istek anında bir kez değerlendirilir */
const nowIso = () => new Date().toISOString();

/** En çoktan aza, ilk n */
function top<T extends string>(items: T[], n: number): [T, number][] {
  const counts = new Map<T, number>();
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, n);
}

/** Etkinlik analizi ve listesi; her etkinliğe core team'den koordinatör atanır. */
export default async function Events({ searchParams }: PageProps<"/panel/etkinlikler">) {
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const { donem } = await searchParams;
  const [{ data: memberRows }, { data: links }, { data: drafts }, { data: regs }] =
    await Promise.all([
      supabase.from("team_members").select("id,name,active").order("sort_order"),
      supabase.from("event_coordinators").select("event_id,member_id"),
      supabase.from("site_events").select(SITE_EVENT_COLUMNS).eq("published", false),
      supabase.from("registrations").select("event_slug").is("cancelled_at", null),
    ]);
  const regCount = new Map<string, number>();
  for (const r of regs ?? []) regCount.set(r.event_slug, (regCount.get(r.event_slug) ?? 0) + 1);
  const draftIds = new Set((drafts ?? []).map((d) => d.id));
  const members = (memberRows ?? []) as Member[];
  const memberName = new Map(members.map((m) => [m.id, m.name]));
  const byEvent = new Map<string, string[]>();
  for (const l of links ?? [])
    byEvent.set(l.event_id, [...(byEvent.get(l.event_id) ?? []), l.member_id]);

  const now = nowIso();
  const all = [...(await getEvents()), ...(drafts ?? []).map(siteEventToEvent)].sort((a, b) =>
    b.startsAt.localeCompare(a.startsAt),
  );
  const past = all.filter((e) => e.startsAt < now && !draftIds.has(e.id));
  const currentTerm = termYear(now);
  const terms = [...new Set(all.map((e) => termYear(e.startsAt)))].sort((a, b) => b - a);
  const selected = typeof donem === "string" && /^[0-9]{4}$/.test(donem) ? Number(donem) : null;
  const list = selected ? all.filter((e) => termYear(e.startsAt) === selected) : all;

  const thisTerm = past.filter((e) => termYear(e.startsAt) === currentTerm).length;
  const inPerson = past.filter((e) => e.format === "in-person").length;
  const uncoordinated = past.filter((e) => !byEvent.get(e.id)?.length).length;

  const perTerm = terms
    .slice()
    .reverse()
    .map((t) => [termLabel(t), past.filter((e) => termYear(e.startsAt) === t).length] as const);
  const tags = top(
    past.flatMap((e) => e.tags),
    6,
  );
  const venues = top(
    past.filter((e) => e.format === "in-person" && e.venue).map((e) => e.venue!),
    5,
  );
  const coordinators = top(
    (links ?? []).map((l) => memberName.get(l.member_id) ?? "?"),
    8,
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Etkinlikler</h1>
          <p className="max-w-prose text-fg-muted">
            GDG Community&apos;deki etkinlikler her pazartesi eşitlenir; orada olmayanları buradan
            ekle. Koordinatörler sadece panelde görünür; kayıt ayarı ve katılımcılar
            &quot;Kayıt&quot;ta.
          </p>
        </div>
        <Link
          href="/panel/etkinlikler/yeni"
          className="rounded-full border-2 border-border-strong bg-green px-4 py-2 text-sm font-medium text-ink-black"
        >
          + Yeni etkinlik
        </Link>
      </header>

      <section aria-labelledby="analiz" className="space-y-4">
        <h2 id="analiz" className="font-mono text-sm text-fg-subtle">
          {"// analiz"}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label="etkinlik (toplam)" value={past.length} tone="blue" size="md" />
          <StatTile
            label={`bu dönem (${termLabel(currentTerm)})`}
            value={thisTerm}
            tone="green"
            size="md"
          />
          <StatTile
            label="yüz yüze"
            value={past.length ? `%${Math.round((inPerson / past.length) * 100)}` : "—"}
            tone="yellow"
            size="md"
          />
          <StatTile label="koordinatörü yok" value={uncoordinated} tone="red" size="md" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Bars title="dönemlere göre" rows={perTerm} />
          <Bars title="türler" rows={tags} />
          <Bars title="salonlar" rows={venues} />
          <Bars
            title="koordinatörler"
            rows={coordinators}
            empty="Henüz koordinatör atanmadı; aşağıdaki listeden ata."
          />
        </div>
      </section>

      <section aria-labelledby="liste" className="space-y-4">
        <h2 id="liste" className="font-mono text-sm text-fg-subtle">
          {"// liste"}
        </h2>
        <nav aria-label="Döneme göre" className="flex flex-wrap gap-2 font-mono text-sm">
          <FilterLink href="/panel/etkinlikler" active={!selected}>
            hepsi
          </FilterLink>
          {terms.map((t) => (
            <FilterLink key={t} href={`/panel/etkinlikler?donem=${t}`} active={selected === t}>
              {termLabel(t)}
            </FilterLink>
          ))}
        </nav>
        <PanelBox title="~/panel/etkinlikler" meta={`${list.length} etkinlik`}>
          <ul className="divide-y-2 divide-border">
            {list.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                upcoming={e.startsAt >= now}
                chosen={byEvent.get(e.id) ?? []}
                members={members}
                draft={draftIds.has(e.id)}
                registrations={regCount.get(e.slug) ?? 0}
              />
            ))}
          </ul>
        </PanelBox>
      </section>
    </div>
  );
}

function EventRow({
  event: e,
  upcoming,
  chosen,
  members,
  draft,
  registrations,
}: {
  event: Event;
  upcoming: boolean;
  chosen: string[];
  members: Member[];
  draft: boolean;
  registrations: number;
}) {
  // Seçim listesi: aktif üyeler + (artık aktif olmasa da) zaten atanmış olanlar
  const options = members.filter((m) => m.active || chosen.includes(m.id));
  return (
    <li id={`e-${e.id}`} className="space-y-2 px-5 py-4">
      <CoordinatorPicker
        eventId={e.id}
        options={options.map(({ id, name }) => ({ id, name }))}
        initial={chosen}
      >
        <div className="min-w-0">
          <Link
            href={draft ? `/panel/etkinlikler/duzenle?id=${e.id}` : `/etkinlikler/${e.slug}`}
            target={draft ? undefined : "_blank"}
            className="font-medium hover:underline"
          >
            {e.title}
          </Link>
          <p className="text-sm text-fg-muted">
            {formatDate(e.startsAt)} ·{" "}
            {e.format === "online" ? "çevrimiçi" : (e.venue ?? "yüz yüze")}
            {upcoming && <span className="ml-2 font-mono text-xs text-green-ink">yaklaşan</span>}
            {draft && <span className="ml-2 font-mono text-xs text-fg-subtle">taslak</span>}
            {e.source === "panel" && !draft && (
              <span className="ml-2 font-mono text-xs text-blue-ink">panelden</span>
            )}
          </p>
          <p className="flex flex-wrap gap-3 pt-1 text-sm">
            <Link href={`/panel/etkinlikler/kayit?e=${e.slug}`} className="underline">
              Kayıt{registrations ? ` (${registrations})` : ""}
            </Link>
            {e.source === "panel" && (
              <Link href={`/panel/etkinlikler/duzenle?id=${e.id}`} className="underline">
                Düzenle
              </Link>
            )}
          </p>
        </div>
      </CoordinatorPicker>
    </li>
  );
}

function Bars({
  title,
  rows,
  empty = "Veri yok.",
}: {
  title: string;
  rows: readonly (readonly [string, number])[];
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <PanelBox title={title} titleAs="h3">
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-fg-muted">{empty}</p>
      ) : (
        <ul className="space-y-2 p-5">
          {rows.map(([label, n]) => (
            <li
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm"
            >
              <span className="truncate" title={label}>
                {label}
              </span>
              <span className="font-mono tabular-nums">{n}</span>
              <span className="col-span-2 h-2 rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-blue"
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelBox>
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
