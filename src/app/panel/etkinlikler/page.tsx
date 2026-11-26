import Link from "next/link";
import { PanelBox } from "@/app/panel/_components/panel-box";
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

const DAY = 24 * 60 * 60 * 1000;
const dayDiff = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / DAY);
function daysUntil(iso: string, now: string) {
  const d = dayDiff(iso, now);
  return d <= 0 ? "bugün" : d === 1 ? "yarın" : `${d} gün sonra`;
}
function daysAgo(iso: string, now: string) {
  const d = dayDiff(now, iso);
  return d <= 0 ? "bugün" : d === 1 ? "dün" : `${d} gün önce`;
}

/** Bir bakışta: sitenin kart dilinde küçük kart; bağlantı varsa tıklanır. */
function Glance({
  label,
  value,
  note,
  tone,
  href,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="block font-mono text-xs text-fg-subtle">{`// ${label}`}</span>
      <span className="mt-1 block text-2xl font-bold tracking-tight">{value}</span>
      <span className="mt-1 block truncate text-sm text-fg-muted" title={note}>
        {note}
      </span>
    </>
  );
  const box = `block rounded-card border-2 border-border-strong px-4 py-3 shadow-sticker-sm dark:bg-surface ${tone}`;
  return href ? (
    <Link
      href={href}
      className={`${box} hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker`}
    >
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

/** Etkinlik analizi ve listesi; her etkinliğe core team'den koordinatör atanır. */
export default async function Events({ searchParams }: PageProps<"/panel/etkinlikler">) {
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const { donem, eksik } = await searchParams;
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
  const needsCoordinator = (e: Event) =>
    !draftIds.has(e.id) &&
    !byEvent.get(e.id)?.length &&
    (e.startsAt >= now || termYear(e.startsAt) === currentTerm);
  const missingOnly = eksik === "1";
  const list = missingOnly
    ? all.filter(needsCoordinator)
    : selected
      ? all.filter((e) => termYear(e.startsAt) === selected)
      : all;

  const published = all.filter((e) => !draftIds.has(e.id));
  const thisTerm = past.filter((e) => termYear(e.startsAt) === currentTerm).length;
  // Geçen yılın aynı gününe kadar geçen dönemde yapılanlar
  const yearAgo = new Date(Date.parse(now) - 365 * DAY).toISOString();
  const lastYearSoFar = past.filter(
    (e) => termYear(e.startsAt) === currentTerm - 1 && e.startsAt < yearAgo,
  ).length;
  const next = published
    .filter((e) => e.startsAt >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const lastEvent = past.find((e) => !draftIds.has(e.id));
  const missing = all.filter(needsCoordinator).length;

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
          {"// bir bakışta"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Glance
            label="sıradaki"
            tone="bg-yellow-soft"
            href={next ? `/panel/etkinlikler/kayit?e=${next.slug}` : "/panel/etkinlikler/yeni"}
            value={next ? daysUntil(next.startsAt, now) : "yok"}
            note={
              next
                ? `${next.title} · ${regCount.get(next.slug) ?? 0} kayıt`
                : "Yaklaşan etkinlik yok, ekle →"
            }
          />
          <Glance
            label={`bu dönem · ${termLabel(currentTerm)}`}
            tone="bg-green-soft"
            href={`/panel/etkinlikler?donem=${currentTerm}`}
            value={`${thisTerm} etkinlik`}
            note={`Geçen yıl bu zamana kadar ${lastYearSoFar}`}
          />
          <Glance
            label="son etkinlik"
            tone="bg-blue-soft"
            value={lastEvent ? daysAgo(lastEvent.startsAt, now) : "—"}
            note={lastEvent?.title ?? ""}
          />
          <Glance
            label="koordinatörü eksik"
            tone={missing ? "bg-red-soft" : "bg-silver-soft"}
            href={missing ? "/panel/etkinlikler?eksik=1#liste" : undefined}
            value={missing ? `${missing} etkinlik` : "hepsi tamam"}
            note={missing ? "Bu dönem ve yaklaşanlar · göster →" : "Bu dönemin hepsine atanmış"}
          />
        </div>
      </section>

      <section aria-labelledby="liste" className="space-y-4">
        <h2 id="liste" className="font-mono text-sm text-fg-subtle">
          {"// liste"}
        </h2>
        <nav aria-label="Döneme göre" className="flex flex-wrap gap-2 font-mono text-sm">
          <FilterLink href="/panel/etkinlikler" active={!selected && !missingOnly}>
            hepsi
          </FilterLink>
          {terms.map((t) => (
            <FilterLink
              key={t}
              href={`/panel/etkinlikler?donem=${t}`}
              active={!missingOnly && selected === t}
            >
              {termLabel(t)}
            </FilterLink>
          ))}
          <FilterLink href="/panel/etkinlikler?eksik=1" active={missingOnly}>
            koordinatörü eksik
          </FilterLink>
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
            <Link href={`/panel/etkinlikler/fotograflar?e=${e.slug}`} className="underline">
              Fotoğraflar
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
