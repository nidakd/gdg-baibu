import Link from "next/link";
import type { Tone } from "@/components/ui/button";
import type { Event } from "@/lib/content";
import { focusAreas, inArea } from "@/lib/focus-areas";

const fill: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  lilac: "bg-lilac",
  silver: "bg-silver",
};
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0", "-rotate-[1.5deg]"];

/**
 * Ana sayfada odak alanları: logodaki hapların büyük, renkli hali. Her hap alanın adı ve etkinlik
 * sayısıyla arşivi o alana göre süzülmüş açar. Açıklamalı kartlar Hakkımızda'da.
 */
export function FocusBigPills({ events }: { events: Event[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
      {focusAreas.map((area, i) => {
        const count = events.filter((e) => inArea(e.tags, area)).length;
        return (
          <li key={area.id} className={`transition duration-300 hover:rotate-0 ${TILT[i]}`}>
            <Link
              href={`/etkinlikler?alan=${area.id}#arsiv`}
              title={area.description}
              className={`group flex h-full min-h-28 items-center justify-between gap-4 rounded-full border-[3px] border-ink-black px-8 py-5 text-ink-black shadow-sticker transition hover:-translate-y-1 hover:shadow-sticker-lg ${fill[area.tone]}`}
            >
              <span>
                <span className="block text-xl leading-tight font-bold sm:text-2xl">{area.title}</span>
                <span className="font-mono text-xs">{count} etkinlik</span>
              </span>
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink-black bg-white text-lg transition group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
