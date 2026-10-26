import type { ReactNode } from "react";

// Bölüm geçişi: eğik duran, sonsuz kayan bir şerit. Kelimelerle ya da hazır öğelerle (ör. logolar).

const defaultWords = ["BUILD", "LEARN", "SHIP", "#GDGOnCampus", "AİBÜ"];

type MarqueeRibbonProps = {
  words?: string[];
  /** Kelimeler yerine kayacak hazır öğeler */
  items?: ReactNode[];
  /** Şeridin zemin ve yazı rengi */
  colorClass?: string;
  /** Eğim yönü */
  tilt?: "left" | "right";
  /** Bir turun süresi (saniye); büyük sayı = yavaş */
  duration?: number;
  className?: string;
};

export function MarqueeRibbon({
  words = defaultWords,
  items,
  colorClass = "bg-yellow-halftone text-ink-black",
  tilt = "left",
  duration = 28,
  className = "",
}: MarqueeRibbonProps) {
  const content: ReactNode[] =
    items ??
    words.map((word) => (
      <span key={word} className="font-mono text-lg font-bold tracking-wider sm:text-xl">
        {word}
      </span>
    ));
  // Kısa listeler de ekranı doldursun diye öğeler en az ~15 olana kadar tekrarlanır
  const row = Array.from({ length: Math.ceil(15 / content.length) }, () => content).flat();

  return (
    <div
      aria-hidden
      className={`relative z-10 ${tilt === "left" ? "-rotate-2" : "rotate-2"} ${className}`}
    >
      <div
        className={`overflow-hidden border-y-[3px] border-ink-black py-3 shadow-sticker ${colorClass}`}
      >
        <div className="flex w-max animate-marquee" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {row.map((node, i) => (
                <span key={`${copy}-${i}`} className="flex items-center gap-6 pr-6">
                  {node}
                  <span className="font-mono text-lg font-bold opacity-60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
