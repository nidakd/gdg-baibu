import Link from "next/link";
import { Poster } from "@/components/events/poster";
import { Tag } from "@/components/ui/tag";
import type { Event } from "@/lib/content";
import { formatDate, releaseTag } from "@/lib/format";

/** Başlık alanının sağında öne çıkan en son etkinlik: "son sürüm". */
export function FeaturedRelease({ event }: { event: Event }) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <Link
        href={`/etkinlikler/${event.slug}`}
        className="group relative block overflow-hidden rounded-card border-2 border-border-strong bg-surface shadow-sticker transition hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between border-b-2 border-border-strong bg-blue-soft px-4 py-2.5 font-mono text-xs">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 rounded-full border border-ink-black bg-green-halftone"
            />
            son sürüm
          </span>
          <span className="text-green-ink">{releaseTag(event.startsAt)}</span>
        </div>
        {event.coverUrl && (
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
            <Poster
              src={event.coverUrl}
              aspect={event.coverAspect}
              box={4 / 3}
              alt={`${event.title} afişi`}
              priority
              sizes="24rem"
              className="transition duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="space-y-2 p-5">
          <p className="font-mono text-xs text-fg-subtle">{formatDate(event.startsAt)}</p>
          <p className="text-xl font-bold group-hover:underline">{event.title}</p>
          <div className="flex flex-wrap gap-1.5">
            <Tag>{event.format === "online" ? "online" : "yüz yüze"}</Tag>
            {event.venue && <Tag>{event.venue}</Tag>}
          </div>
        </div>
      </Link>
    </div>
  );
}
