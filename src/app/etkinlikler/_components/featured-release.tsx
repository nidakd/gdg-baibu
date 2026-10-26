import Image from "next/image";
import Link from "next/link";
import { Circles, Slashes } from "@/components/brand/brand-shapes";
import { Tag } from "@/components/ui/tag";
import type { Event } from "@/lib/content";
import { formatDate, releaseTag } from "@/lib/format";

/** Başlık alanının sağında öne çıkan en son etkinlik: "son sürüm". */
export function FeaturedRelease({ event }: { event: Event }) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <Slashes
        aria-hidden
        className="absolute -top-8 -right-2 h-20 w-auto text-ink-black sm:-right-6"
      />
      <Circles
        aria-hidden
        className="absolute -bottom-6 -left-3 h-10 w-auto text-ink-black sm:-left-8"
      />

      <Link
        href={`/etkinlikler/${event.slug}`}
        className="group relative block overflow-hidden rounded-card border-2 border-border-strong bg-surface shadow-sticker-lg transition hover:-translate-x-0.5 hover:-translate-y-0.5"
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
          <div className="relative aspect-[4/3] bg-surface-2">
            <Image
              src={event.coverUrl}
              alt={`${event.title} afişi`}
              fill
              priority
              sizes="24rem"
              className="object-cover transition duration-500 group-hover:scale-105"
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
