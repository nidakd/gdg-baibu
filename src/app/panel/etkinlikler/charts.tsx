import type { ReactNode } from "react";
import { Avatar } from "@/components/team/avatar";

// Panel etkinlik istatistikleri. Tek renk ailesi (mavi): büyüklük her yerde aynı renkle okunur,
// vurgu (içinde bulunulan dönem/ay) koyu tonla; sayılar metin renginde. Her işaretin üzerine
// gelince ayrıntı balonu çıkar.

const card = "rounded-2xl border-2 border-border bg-surface";

/** Küçük ölçü kartı: etiket, büyük sayı, altında yardımcı satır ve isteğe bağlı mini grafik. */
export function Kpi({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`${card} flex flex-col gap-3 p-5`}>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="text-4xl font-bold tracking-tight tabular-nums">{value}</p>
      {children}
      {sub && <p className="mt-auto text-xs text-fg-subtle">{sub}</p>}
    </div>
  );
}

/** Önceki döneme göre değişim rozeti */
export function Delta({ now, before }: { now: number; before: number }) {
  if (!before && !now) return null;
  const diff = now - before;
  const up = diff >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs ${up ? "bg-green-soft text-green-ink" : "bg-red-soft text-red-ink"}`}
    >
      {up ? "↑" : "↓"} {Math.abs(diff)}
    </span>
  );
}

/** Mini sütunlar (dönem başına); sonuncusu koyu */
export function Spark({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-10 items-end gap-1.5" aria-hidden>
      {values.map((v, i) => (
        <span
          key={labels[i]}
          title={`${labels[i]}: ${v}`}
          className={`flex-1 rounded-t-[4px] ${i === values.length - 1 ? "bg-blue" : "bg-blue/35"}`}
          style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

/** Oran çubuğu: dolu kısım + kalan */
export function Meter({ value, total }: { value: number; total: number }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
      <div className="h-full rounded-full bg-blue" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Üzerine gelince çıkan balon (işaretin kendisi grubun içinde) */
function Tip({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg border-2 border-border-strong bg-bg px-2.5 py-1.5 text-xs whitespace-nowrap opacity-0 shadow-sticker-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {children}
    </span>
  );
}

export type MonthBar = {
  key: string;
  label: string;
  past: number;
  upcoming: number;
  current: boolean;
};

/** Son 12 ay: geçmiş etkinlikler dolu, yaklaşanlar açık ton; ızgara çizgileri sessiz. */
export function MonthlyChart({ months }: { months: MonthBar[] }) {
  const max = Math.max(1, ...months.map((m) => m.past + m.upcoming));
  const top = Math.ceil(max / 2) * 2;
  const total = months.reduce((s, m) => s + m.past + m.upcoming, 0);
  return (
    <section className={`${card} p-5`}>
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-bold">Aylık etkinlik</h3>
          <p className="text-sm text-fg-muted">Son 12 ayda {total} etkinlik</p>
        </div>
        <div className="flex gap-4 text-xs text-fg-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-blue" /> yapıldı
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-blue/35" /> yaklaşan
          </span>
        </div>
      </header>
      <div className="relative h-48">
        {/* Izgara: üst, orta, taban */}
        {[1, 0.5, 0].map((f) => (
          <div
            key={f}
            className="absolute inset-x-0 border-t border-border"
            style={{ bottom: `${f * 100}%` }}
          >
            <span className="absolute -top-2.5 -left-0.5 bg-surface pr-1 font-mono text-[10px] text-fg-subtle">
              {Math.round(top * f)}
            </span>
          </div>
        ))}
        <div className="absolute inset-0 left-6 flex items-end gap-1.5 sm:gap-2.5">
          {months.map((m) => {
            const h = ((m.past + m.upcoming) / top) * 100;
            return (
              <div
                key={m.key}
                tabIndex={0}
                className="group relative flex h-full flex-1 flex-col justify-end outline-none"
              >
                <Tip>
                  <strong>{m.label}</strong> · {m.past} yapıldı
                  {m.upcoming ? ` · ${m.upcoming} yaklaşan` : ""}
                </Tip>
                {h > 0 && (
                  <div
                    className="flex flex-col overflow-hidden rounded-t-[4px] transition-[filter] group-hover:brightness-110"
                    style={{ height: `${h}%` }}
                  >
                    {m.upcoming > 0 && <div className="bg-blue/35" style={{ flex: m.upcoming }} />}
                    {m.upcoming > 0 && m.past > 0 && <div className="h-0.5 bg-surface" />}
                    {m.past > 0 && <div className="bg-blue" style={{ flex: m.past }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 ml-6 flex gap-1.5 sm:gap-2.5">
        {months.map((m) => (
          <span
            key={m.key}
            className={`flex-1 text-center font-mono text-[10px] ${m.current ? "font-bold text-fg" : "text-fg-subtle"}`}
          >
            {m.label.slice(0, 3)}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Haftanın günleri: hangi gün etkinlik yapılıyor */
const SHORT_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function WeekdayChart({ days }: { days: { label: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  return (
    <section className={`${card} p-5`}>
      <header className="mb-5">
        <h3 className="font-bold">Günler</h3>
        <p className="text-sm text-fg-muted">En çok {best.label.toLocaleLowerCase("tr")}</p>
      </header>
      <ul className="space-y-2.5">
        {days.map((d, i) => (
          <li
            key={d.label}
            className="grid grid-cols-[2.5rem_1fr_1.5rem] items-center gap-3 text-sm"
          >
            <span className="font-mono text-xs text-fg-muted">{SHORT_DAYS[i]}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <span
                className={`block h-full rounded-full ${d === best ? "bg-blue" : "bg-blue/45"}`}
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-xs tabular-nums">{d.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sıralı liste: etiket, sayı ve pay; ince çubuk. */
export function RankedList({
  title,
  subtitle,
  rows,
  total,
  avatars,
  empty = "Veri yok.",
}: {
  title: string;
  subtitle?: string;
  rows: readonly (readonly [string, number])[];
  total: number;
  avatars?: boolean;
  empty?: ReactNode;
}) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className={`${card} p-5`}>
      <header className="mb-4">
        <h3 className="font-bold">{title}</h3>
        {subtitle && <p className="text-sm text-fg-muted">{subtitle}</p>}
      </header>
      {rows.length === 0 ? (
        <div className="text-sm text-fg-muted">{empty}</div>
      ) : (
        <ol className="-mx-2 space-y-0.5">
          {rows.map(([label, n]) => (
            <li
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-2"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {avatars && <Avatar name={label} photoUrl={null} size={24} />}
                <span className="truncate" title={label}>
                  {label}
                </span>
              </span>
              <span className="font-mono text-xs tabular-nums">
                {n}{" "}
                <span className="text-fg-subtle">
                  · %{Math.round((n / Math.max(1, total)) * 100)}
                </span>
              </span>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-blue"
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** GDG Community'de aynı salon farklı yazılmış; tek ada indirger. */
const CAMPUS = ["bolu abant izzet baysal üniversitesi", "abant izzet baysal üniversitesi", "aibü"];

export function venueName(raw: string): string {
  const v = raw.replace(/\s+/g, " ").trim();
  const low = v.toLocaleLowerCase("tr");
  if (low.includes("kongre mer")) return "AİBÜ Kongre Merkezi";
  const prefix = CAMPUS.find((c) => low.startsWith(c));
  if (!prefix) return v;
  const rest = v.slice(prefix.length).trim();
  return rest ? `AİBÜ · ${rest}` : "AİBÜ kampüsü";
}
