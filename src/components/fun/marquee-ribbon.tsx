import Image from "next/image";
import mark from "../../../public/brand/gdg-mark.png";

// Bölüm geçişi: eğik duran, sonsuz kayan bir şerit. Kelimelerle ya da GDG simgeleriyle.

const defaultWords = ["BUILD", "LEARN", "SHIP", "#GDGOnCampus", "AİBÜ"];

type MarqueeRibbonProps = {
  words?: string[];
  /** Kelimeler yerine GDG simgeleri kayar */
  logos?: boolean;
  /** Şeridin zemin rengi (halftone tonlar önerilir) */
  colorClass?: string;
  /** Eğim yönü */
  tilt?: "left" | "right";
  /** Bir turun süresi (saniye); büyük sayı = yavaş */
  duration?: number;
  className?: string;
};

export function MarqueeRibbon({
  words = defaultWords,
  logos = false,
  colorClass = "bg-yellow-halftone",
  tilt = "left",
  duration = 28,
  className = "",
}: MarqueeRibbonProps) {
  // Kısa listeler de ekranı doldursun diye öğeler en az ~15 olana kadar tekrarlanır
  const items = logos ? Array.from({ length: 16 }, () => "") : words;
  const row = Array.from({ length: Math.ceil(15 / items.length) }, () => items).flat();

  return (
    <div
      aria-hidden
      className={`relative z-10 ${tilt === "left" ? "-rotate-2" : "rotate-2"} ${className}`}
    >
      <div
        className={`overflow-hidden border-y-[3px] border-ink-black py-3 text-ink-black shadow-sticker ${colorClass}`}
      >
        <div className="flex w-max animate-marquee" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {row.map((word, i) =>
                logos ? (
                  <span key={`${copy}-${i}`} className="flex items-center gap-8 pr-8">
                    <Image src={mark} alt="" className="h-7 w-auto sm:h-8" />
                    <span className="font-mono text-sm font-bold tracking-wider text-ink-black/60">
                      ✦
                    </span>
                  </span>
                ) : (
                  <span
                    key={`${copy}-${i}`}
                    className="flex items-center gap-6 pr-6 font-mono text-lg font-bold tracking-wider sm:text-xl"
                  >
                    {word}
                    <span className="text-ink-black/60">✦</span>
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
