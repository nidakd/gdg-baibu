"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import type { Tone } from "@/components/ui/button";
import { focusAreas, inArea, primaryArea } from "@/lib/focus-areas";
import { formatDate, releaseTag } from "@/lib/format";

export type ArchiveEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  venue: string | null;
  format: "in-person" | "online";
  tags: string[];
  coverUrl: string | null;
};

const dot: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
};

type Format = "all" | "in-person" | "online";

/** Filtrelenebilir, yıllara bölünmüş "git log --graph" görünümlü etkinlik arşivi. */
export function EventArchive({ events }: { events: ArchiveEvent[] }) {
  const [area, setArea] = useState<string>("all");
  const [format, setFormat] = useState<Format>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    const selected = focusAreas.find((a) => a.id === area);
    return events.filter(
      (e) =>
        (!selected || inArea(e.tags, selected)) &&
        (format === "all" || e.format === format) &&
        (!q ||
          e.title.toLocaleLowerCase("tr").includes(q) ||
          e.venue?.toLocaleLowerCase("tr").includes(q)),
    );
  }, [events, area, format, query]);

  const years = useMemo(() => {
    const groups = new Map<string, ArchiveEvent[]>();
    for (const e of filtered) {
      const year = e.startsAt.slice(0, 4);
      groups.set(year, [...(groups.get(year) ?? []), e]);
    }
    return [...groups.entries()];
  }, [filtered]);

  return (
    <div>
      <div className="space-y-4 rounded-card border-2 border-border-strong bg-surface p-4 shadow-sticker-sm sm:p-5">
        <label className="flex items-center gap-3 rounded-xl border-2 border-border bg-bg px-4 py-2.5 font-mono text-sm focus-within:border-border-strong">
          <span aria-hidden className="shrink-0 whitespace-nowrap text-green-ink">
            $ grep
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="etkinlik ya da mekân ara"
            aria-label="Etkinlik ara"
            className="w-full bg-transparent outline-none placeholder:text-fg-subtle"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Odak alanı">
          <Chip active={area === "all"} onClick={() => setArea("all")}>
            Tümü
          </Chip>
          {focusAreas.map((a) => (
            <Chip key={a.id} active={area === a.id} onClick={() => setArea(a.id)} tone={a.tone}>
              {a.title}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Biçim">
          {(
            [
              ["all", "Hepsi"],
              ["in-person", "Yüz yüze"],
              ["online", "Online"],
            ] as const
          ).map(([value, label]) => (
            <Chip key={value} active={format === value} onClick={() => setFormat(value)}>
              {label}
            </Chip>
          ))}
          <span className="ml-auto font-mono text-xs text-fg-subtle" aria-live="polite">
            {filtered.length} / {events.length} etkinlik
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-fg-muted">
          <span className="text-red-ink">0 sonuç.</span> Filtreleri gevşetmeyi dene.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {years.map(([year, items]) => (
            <section key={year} aria-labelledby={`yil-${year}`}>
              <h3
                id={`yil-${year}`}
                className="sticky top-20 z-10 mb-4 flex items-baseline gap-3 bg-bg/80 py-2 backdrop-blur-sm"
              >
                <span className="text-5xl font-bold tracking-tight text-transparent [-webkit-text-stroke:2px_var(--fg)] sm:text-7xl">
                  {year}
                </span>
                <span className="font-mono text-sm text-fg-subtle">{items.length} etkinlik</span>
              </h3>
              <ol className="relative ml-3 border-l-2 border-dashed border-border">
                <span
                  aria-hidden
                  className="timeline-line absolute top-0 -left-[2px] h-full w-[2px] bg-fg"
                />
                {items.map((e, i) => {
                  const tone = primaryArea(e.tags)?.tone ?? "blue";
                  return (
                    <li key={e.id}>
                      <Reveal delay={Math.min(i, 6) * 60} className="relative pl-7">
                        <span
                          aria-hidden
                          className={`reveal-pop absolute top-6 -left-[9px] size-4 rounded-full border-2 border-ink-black ${dot[tone]}`}
                        />
                        <Link
                          href={`/etkinlikler/${e.slug}`}
                          className="group my-2 flex items-center gap-4 rounded-xl p-3 transition hover:bg-surface"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block font-mono text-xs text-fg-subtle">
                              <span className="text-syntax-number">{e.id}</span> ·{" "}
                              {releaseTag(e.startsAt)} · {formatDate(e.startsAt)}
                            </span>
                            <span className="mt-0.5 block font-bold group-hover:underline">
                              {e.title}
                            </span>
                            <span className="block truncate text-sm text-fg-muted">
                              {e.format === "online" ? "Online" : (e.venue ?? "Yüz yüze")}
                            </span>
                          </span>
                          {e.coverUrl && (
                            <Image
                              src={e.coverUrl}
                              alt=""
                              width={64}
                              height={64}
                              className="hidden size-16 shrink-0 rounded-lg border-2 border-border-strong object-cover transition duration-300 group-hover:scale-150 group-hover:rotate-6 group-hover:shadow-sticker sm:block"
                            />
                          )}
                        </Link>
                      </Reveal>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-sm transition ${
        active
          ? "border-ink-black bg-ink-black text-off-white dark:border-off-white dark:bg-off-white dark:text-ink-black"
          : "border-border bg-bg hover:border-border-strong"
      }`}
    >
      {tone && (
        <span
          aria-hidden
          className={`size-2.5 rounded-full border border-ink-black ${dot[tone]}`}
        />
      )}
      {children}
    </button>
  );
}
