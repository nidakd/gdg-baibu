import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/content";
import { formatDate, releaseTag } from "@/lib/format";
import { Tag } from "@/components/ui/tag";

/** Etkinliği bir sürüm notu gibi gösteren kart. */
export function ReleaseCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/etkinlikler/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border-2 border-border-strong bg-surface shadow-sticker transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker-lg"
    >
      {event.coverUrl && (
        <div className="relative aspect-square border-b-2 border-border-strong bg-surface-2">
          <Image
            src={event.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-mono text-xs text-fg-subtle">
          <span className="text-green-ink">{releaseTag(event.startsAt)}</span> ·{" "}
          {formatDate(event.startsAt)}
        </p>
        <h3 className="text-lg font-bold group-hover:underline">{event.title}</h3>
        {event.venue && <p className="text-sm text-fg-muted">{event.venue}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          <Tag>{event.format === "online" ? "online" : "yüz yüze"}</Tag>
          {event.tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}
