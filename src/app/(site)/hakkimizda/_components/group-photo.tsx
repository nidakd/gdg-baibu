import Image from "next/image";
import Link from "next/link";
import { getPhotos } from "@/lib/content";
import { formatDateLong } from "@/lib/format";

// Hakkımızda'da rakamların altında toplu fotoğraf: "biz kimiz" sorusunun bir de yüzü olsun.
// Kare content/photos.json'dan; src değişirse burayı güncelle.
const SRC = "/kareler/2026-10-01-info-session-19aeee45.jpg";

export function GroupPhoto() {
  const photo = getPhotos().find((p) => p.src === SRC);
  if (!photo) return null;
  return (
    <figure className="mx-auto max-w-4xl rotate-[-0.6deg] rounded-card border-[3px] border-border-strong bg-surface p-2.5 shadow-sticker-lg">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[0.8rem]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 960px) 56rem, 100vw"
          className="object-cover object-[50%_60%]"
        />
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2 pt-3 pb-1 font-mono text-xs">
        <Link href={`/etkinlikler/${photo.event.slug}`} className="font-bold hover:underline">
          {photo.event.title}
        </Link>
        <span className="text-fg-subtle">
          {formatDateLong(photo.event.startsAt)} · yeni dönemin ilk buluşması
        </span>
      </figcaption>
    </figure>
  );
}
