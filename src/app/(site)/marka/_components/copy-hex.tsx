"use client";

import { useState } from "react";

/** Renk kodunu tıklayınca panoya kopyalar; kısa bir "kopyalandı" geri bildirimi verir. */
export function CopyHex({ hex, className = "" }: { hex: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Pano izni yoksa kod zaten ekranda okunuyor
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`cursor-copy font-mono text-xs underline-offset-2 hover:underline ${className}`}
      aria-label={`${hex} kodunu kopyala`}
    >
      <span aria-live="polite">{copied ? "kopyalandı ✓" : hex}</span>
    </button>
  );
}
