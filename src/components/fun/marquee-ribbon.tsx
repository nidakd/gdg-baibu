// Bölüm geçişi: eğik duran, sonsuz kayan bir şerit.

const defaultWords = ["BUILD", "LEARN", "SHIP", "#GDGOnCampus", "AİBÜ"];

type MarqueeRibbonProps = {
  words?: string[];
  /** Şeridin zemin rengi (halftone tonlar önerilir) */
  colorClass?: string;
  /** Eğim yönü */
  tilt?: "left" | "right";
  className?: string;
};

export function MarqueeRibbon({
  words = defaultWords,
  colorClass = "bg-yellow-halftone",
  tilt = "left",
  className = "",
}: MarqueeRibbonProps) {
  // Kısa listeler de ekranı doldursun diye kelimeler en az ~15 olana kadar tekrarlanır
  const row = Array.from({ length: Math.ceil(15 / words.length) }, () => words).flat();
  return (
    <div
      aria-hidden
      className={`relative z-10 ${tilt === "left" ? "-rotate-2" : "rotate-2"} ${className}`}
    >
      <div
        className={`overflow-hidden border-y-[3px] border-ink-black py-3 text-ink-black shadow-sticker ${colorClass}`}
      >
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {row.map((word, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="flex items-center gap-6 pr-6 font-mono text-lg font-bold tracking-wider sm:text-xl"
                >
                  {word}
                  <span className="text-ink-black/60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
