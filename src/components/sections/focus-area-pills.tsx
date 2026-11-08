import Link from "next/link";
import type { Tone } from "@/components/ui/button";
import { focusAreas } from "@/lib/focus-areas";

const dots: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  lilac: "bg-lilac",
  silver: "bg-silver",
};

/**
 * Ana sayfada odak alanlarının kısa hali: tek satır hap, her biri arşivi o alana göre süzülmüş açar.
 * Açıklamalı kartlar (FocusAreas) Hakkımızda'da.
 */
export function FocusAreaPills() {
  return (
    <ul className="flex flex-wrap gap-3">
      {focusAreas.map((area) => (
        <li key={area.id}>
          <Link
            href={`/etkinlikler?alan=${area.id}#arsiv`}
            title={area.description}
            className="inline-flex items-center gap-2.5 rounded-full border-2 border-border-strong bg-surface px-4 py-2 font-medium shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker"
          >
            <span
              aria-hidden
              className={`h-3 w-7 rounded-full border-2 border-ink-black ${dots[area.tone]}`}
            />
            {area.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
