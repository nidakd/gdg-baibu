import type { ReactNode } from "react";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { Avatar } from "@/components/team/avatar";

type Tone = "blue" | "green" | "yellow" | "red";

const BAR: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
};
const DOT: Record<Tone, string> = {
  blue: "bg-blue-soft text-blue-ink",
  green: "bg-green-soft text-green-ink",
  yellow: "bg-yellow-soft text-yellow-ink",
  red: "bg-red-soft text-red-ink",
};

/** Dönemlere göre etkinlik sayısı: sütunlar; içinde bulunulan dönem yeşil. */
export function TermColumns({
  rows,
  current,
}: {
  rows: readonly { label: string; count: number; current: boolean }[];
  current: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <PanelBox title="dönemlere göre" titleAs="h3" meta={<Legend tone="green">{current}</Legend>}>
      <div className="flex h-56 items-end gap-3 px-5 pt-6 pb-4 sm:gap-6">
        {rows.map((r) => (
          <div
            key={r.label}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="font-mono text-sm font-bold tabular-nums">{r.count}</span>
            <div
              className={`w-full max-w-20 rounded-t-xl border-2 border-b-0 border-border-strong transition-[filter] group-hover:brightness-110 ${r.current ? "bg-green" : "bg-blue"}`}
              style={{ height: `${Math.max(4, (r.count / max) * 100)}%` }}
              title={`${r.label}: ${r.count} etkinlik`}
            />
            <span
              className={`font-mono text-xs ${r.current ? "font-bold text-green-ink" : "text-fg-subtle"}`}
            >
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </PanelBox>
  );
}

/** Sıralı çubuklar: etiket, sayı, toplam içindeki payı. */
export function RankedBars({
  title,
  rows,
  tone,
  total,
  empty = "Veri yok.",
  avatars,
}: {
  title: string;
  rows: readonly (readonly [string, number])[];
  tone: Tone;
  /** Pay hesabı için (verilmezse pay gösterilmez) */
  total?: number;
  empty?: ReactNode;
  /** Satır başında baş harfli avatar (kişi listeleri) */
  avatars?: boolean;
}) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <PanelBox title={title} titleAs="h3" meta={total ? `${total} etkinlik` : undefined}>
      {rows.length === 0 ? (
        <div className="p-5 text-sm text-fg-muted">{empty}</div>
      ) : (
        <ol className="space-y-1 p-3">
          {rows.map(([label, n], i) => (
            <li
              key={label}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-surface-2"
            >
              {avatars ? (
                <Avatar name={label} photoUrl={null} size={28} />
              ) : (
                <span
                  className={`grid size-6 place-items-center rounded-full font-mono text-xs font-bold ${DOT[tone]}`}
                >
                  {i + 1}
                </span>
              )}
              <span className="truncate" title={label}>
                {label}
              </span>
              <span className="font-mono tabular-nums">
                {n}
                {total ? (
                  <span className="ml-1.5 text-xs text-fg-subtle">
                    %{Math.round((n / total) * 100)}
                  </span>
                ) : null}
              </span>
              <span className="col-span-2 col-start-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span
                  className={`block h-full rounded-full ${BAR[tone]}`}
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </PanelBox>
  );
}

function Legend({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className={`size-2.5 rounded-full ${BAR[tone]}`} /> bu dönem · {children}
    </span>
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
