"use client";

// Etkinlik sayfasındaki fotoğraflar: kendi oranında sütunlara dizilir, tıklayınca büyür.
// Büyük görünüm yerel <dialog>: Esc kapatır, oklar ve ←/→ tuşları kareler arasında gezer.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/content";

const TILTS = ["-rotate-1", "rotate-1", "rotate-0"];

export function EventGallery({ photos }: { photos: GalleryPhoto[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : photos[open];

  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const step = (d: number) =>
    setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <ul className="columns-2 gap-4 md:columns-3 [&>li]:mb-4">
        {photos.map((p, i) => (
          <li key={p.src} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => show(i)}
              aria-label={`Büyüt: ${p.alt}`}
              className={`group block w-full cursor-zoom-in rounded-xl border-2 border-border-strong bg-surface p-1.5 shadow-sticker-sm transition duration-300 hover:rotate-0 hover:scale-[1.03] focus-visible:rotate-0 ${TILTS[i % TILTS.length]}`}
            >
              <span
                className="relative block overflow-hidden rounded-lg"
                style={{ aspectRatio: p.width && p.height ? p.width / p.height : 4 / 3 }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 14rem, 45vw"
                  className="object-cover"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        // Kartın dışına (arka plana) tıklayınca kapanır
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label="Fotoğraf"
        className="m-auto max-h-none max-w-none bg-transparent p-0 outline-none backdrop:bg-ink-black/80 backdrop:backdrop-blur-sm"
      >
        {current && (
          <figure className="flex flex-col items-center gap-3 p-4">
            <div className="relative h-[min(80vh,56rem)] w-[min(92vw,80rem)]">
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="92vw"
                className="object-contain"
              />
            </div>
            <figcaption className="flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border-2 border-border-strong bg-surface px-2 py-1.5 font-mono text-xs text-fg">
              <LightboxButton label="Önceki fotoğraf" onClick={() => step(-1)}>
                ←
              </LightboxButton>
              <span className="min-w-0 truncate text-center">
                <span className="text-fg-subtle">
                  {open! + 1}/{photos.length}
                </span>{" "}
                {current.alt}
              </span>
              <span className="flex gap-1">
                <LightboxButton label="Sonraki fotoğraf" onClick={() => step(1)}>
                  →
                </LightboxButton>
                <LightboxButton label="Kapat" onClick={() => dialog.current?.close()}>
                  ✕
                </LightboxButton>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}

function LightboxButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-border-strong bg-surface-2 text-base transition hover:bg-yellow hover:text-ink-black"
    >
      {children}
    </button>
  );
}
