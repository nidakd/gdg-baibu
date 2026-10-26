import type { ReactNode } from "react";
import { WaveRide } from "@/components/motion/wave-ride";

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
  /**
   * "ribbon": eğik, çerçeveli, gölgeli şerit (bölüm geçişi).
   * "band": eğimsiz, çerçevesiz; kenarları silinerek kaybolur (ör. dalgalı bant içinde).
   */
  variant?: "ribbon" | "band";
  /** Öğeler kayarken bir dalganın üstünde yukarı aşağı oynar (bant modunda önerilir) */
  wave?: boolean;
  /** Bir turun süresi (saniye); büyük sayı = yavaş */
  duration?: number;
  className?: string;
};

export function MarqueeRibbon({
  words = defaultWords,
  items,
  colorClass = "bg-yellow-halftone text-ink-black",
  tilt = "left",
  variant = "ribbon",
  wave = false,
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
      className={`relative z-10 ${variant === "ribbon" ? (tilt === "left" ? "-rotate-2" : "rotate-2") : ""} ${className}`}
    >
      <div
        className={
          variant === "ribbon"
            ? `overflow-hidden border-y-[3px] border-ink-black py-3 shadow-sticker ${colorClass}`
            : `overflow-hidden ${wave ? "py-8" : "py-3"} ${colorClass}`
        }
        style={
          variant === "band"
            ? {
                maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
              }
            : undefined
        }
      >
        <Track wave={wave}>
          <div className="flex w-max animate-marquee" style={{ animationDuration: `${duration}s` }}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {row.map((node, i) => (
                  <span key={`${copy}-${i}`} className="flex items-center gap-6 pr-6">
                    <span data-wave-item className="block">
                      {node}
                    </span>
                    <span data-wave-item className="block font-mono text-lg font-bold opacity-60">
                      ✦
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Track>
      </div>
    </div>
  );
}

function Track({ wave, children }: { wave: boolean; children: ReactNode }) {
  return wave ? <WaveRide>{children}</WaveRide> : <>{children}</>;
}
