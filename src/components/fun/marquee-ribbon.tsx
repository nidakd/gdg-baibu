// Bölüm geçişi: eğik duran, sonsuz kayan bir şerit.

const words = ["BUILD", "LEARN", "SHIP", "#GDGOnCampus", "AİBÜ"];

export function MarqueeRibbon({ className = "" }: { className?: string }) {
  const row = [...words, ...words, ...words];
  return (
    <div aria-hidden className={`relative z-10 -rotate-2 ${className}`}>
      <div className="overflow-hidden border-y-[3px] border-ink-black bg-yellow-halftone py-3 text-ink-black shadow-sticker">
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
