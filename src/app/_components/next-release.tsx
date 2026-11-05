import Link from "next/link";
import { Poster } from "@/components/events/poster";
import { ButtonLink } from "@/components/ui/button";
import type { Event } from "@/lib/content";
import { formatDateLong, formatTimeRange, releaseTag } from "@/lib/format";

/** Ana sayfada yaklaşan etkinlik: afiş, tarih, yer ve kayıt butonu. */
export function NextRelease({ event }: { event: Event }) {
  return (
    <div className="grid overflow-hidden rounded-card border-[3px] border-ink-black bg-yellow text-ink-black shadow-sticker-lg md:grid-cols-[18rem_1fr]">
      {event.coverUrl && (
        <Link
          href={`/etkinlikler/${event.slug}`}
          className="relative block aspect-square overflow-hidden border-b-[3px] border-ink-black bg-surface-2 md:border-r-[3px] md:border-b-0"
        >
          <Poster
            src={event.coverUrl}
            aspect={event.coverAspect}
            alt={`${event.title} afişi`}
            sizes="(min-width: 768px) 18rem, 100vw"
          />
        </Link>
      )}
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <p className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span className="rounded-full border-2 border-ink-black bg-off-white px-2.5 py-0.5 text-xs">
            sıradaki sürüm
          </span>
          {releaseTag(event.startsAt)}
        </p>
        <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h3>
        <dl className="grid gap-1 font-mono text-sm">
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 opacity-70">tarih</dt>
            <dd>{formatDateLong(event.startsAt)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 opacity-70">saat</dt>
            <dd>{formatTimeRange(event.startsAt, event.endsAt)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 opacity-70">yer</dt>
            <dd>{event.format === "online" ? "Online" : (event.venue ?? "—")}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <ButtonLink href={event.sourceUrl} tone="blue">
            Kayıt ol
          </ButtonLink>
          <ButtonLink href={`/etkinlikler/${event.slug}`} tone="plain">
            Detaylar
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
