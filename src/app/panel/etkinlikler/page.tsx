import Link from "next/link";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { type Event, getEvents, SITE_EVENT_COLUMNS, siteEventToEvent } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import {
  Delta,
  Kpi,
  Meter,
  type MonthBar,
  MonthlyChart,
  RankedList,
  Spark,
  venueName,
  WeekdayChart,
} from "./charts";
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

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

/** Türkiye saatiyle (UTC+3) tarih parçaları */
const trDate = (iso: string) => new Date(Date.parse(iso) + 3 * 60 * 60 * 1000);
const monthKey = (iso: string) => trDate(iso).toISOString().slice(0, 7);

/** Son 12 ay (bu ay dahil) için geçmiş / yaklaşan sayıları */
function lastMonths(events: Event[], now: string): MonthBar[] {
  const d = trDate(now);
  const out: MonthBar[] = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    const key = m.toISOString().slice(0, 7);
    const these = events.filter((e) => monthKey(e.startsAt) === key);
    out.push({
      key,
      label: `${MONTHS[m.getUTCMonth()]} ${m.getUTCFullYear()}`,
      past: these.filter((e) => e.startsAt < now).length,
      upcoming: these.filter((e) => e.startsAt >= now).length,
      current: i === 0,
    });
  }
  return out;
}

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

  const published = all.filter((e) => !draftIds.has(e.id));
  const thisTerm = past.filter((e) => termYear(e.startsAt) === currentTerm).length;
  // Geçen dönemin aynı noktasına kadar (bir yıl önceki bugün)
  const yearAgo = new Date(Date.parse(now) - 365 * 24 * 60 * 60 * 1000).toISOString();
  const lastTermSoFar = past.filter(
    (e) => termYear(e.startsAt) === currentTerm - 1 && e.startsAt < yearAgo,
  ).length;
  const upcomingCount = published.filter((e) => e.startsAt >= now).length;
  const inPerson = past.filter((e) => e.format === "in-person").length;
  const coordinated = past.filter((e) => byEvent.get(e.id)?.length).length;

  const termsAsc = terms.slice().reverse();
  const perTerm = termsAsc.map((t) => past.filter((e) => termYear(e.startsAt) === t).length);
  const months = lastMonths(published, now);
  const weekdays = DAYS.map((label, i) => ({
    label,
    count: past.filter((e) => (trDate(e.startsAt).getUTCDay() + 6) % 7 === i).length,
  }));
  const tags = top(
    past.flatMap((e) => e.tags),
    6,
  );
  const venues = top(
    past.filter((e) => e.format === "in-person" && e.venue).map((e) => venueName(e.venue!)),
    6,
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Toplam etkinlik" value={past.length} sub={`${termsAsc.length} dönem`}>
            <Spark values={perTerm} labels={termsAsc.map(termLabel)} />
          </Kpi>
          <Kpi
            label={`Bu dönem · ${termLabel(currentTerm)}`}
            value={
              <span className="flex items-center gap-3">
                {thisTerm}
                <Delta now={thisTerm} before={lastTermSoFar} />
              </span>
            }
            sub={`Geçen yıl bu zamana kadar ${lastTermSoFar}${upcomingCount ? ` · ${upcomingCount} yaklaşan` : ""}`}
          />
          <Kpi
            label="Yüz yüze"
            value={past.length ? `%${Math.round((inPerson / past.length) * 100)}` : "—"}
            sub={`${inPerson} yüz yüze · ${past.length - inPerson} online`}
          >
            <Meter value={inPerson} total={past.length} />
          </Kpi>
          <Kpi
            label="Koordinatör atanmış"
            value={
              <>
                {coordinated}
                <span className="text-xl text-fg-subtle">/{past.length}</span>
              </>
            }
            sub="Aşağıdaki listeden ata"
          >
            <Meter value={coordinated} total={past.length} />
          </Kpi>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <MonthlyChart months={months} />
          <WeekdayChart days={weekdays} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <RankedList title="Türler" subtitle="Etiketlere göre" rows={tags} total={past.length} />
          <RankedList
            title="Salonlar"
            subtitle="Yüz yüze etkinlikler"
            rows={venues}
            total={inPerson}
          />
          <RankedList
            title="Koordinatörler"
            subtitle="Yürüttüğü etkinlik"
            rows={coordinators}
            total={Math.max(1, coordinated)}
            avatars
            empty="Henüz koordinatör atanmadı; aşağıdaki listede etkinliğin yanından ata."
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
