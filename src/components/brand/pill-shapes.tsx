// Logodaki dört hap şeklinden türetilmiş dekoratif arka plan öğeleri.
// Logonun kendisi değildir; logo yerine kullanılmaz.

const pills = [
  { x: 8, y: 14, r: -35, fill: "var(--brand-red)", w: 150 },
  { x: 2, y: 34, r: 35, fill: "var(--brand-blue)", w: 190 },
  { x: 74, y: 8, r: 35, fill: "var(--brand-green)", w: 200 },
  { x: 82, y: 30, r: -35, fill: "var(--brand-yellow)", w: 140 },
];

export function PillShapes({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {pills.map((p) => (
        <span
          key={p.fill}
          className="absolute h-14 rounded-full border-[3px] border-ink-black opacity-90 sm:h-16"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.w,
            background: p.fill,
            transform: `rotate(${p.r}deg)`,
          }}
        />
      ))}
    </div>
  );
}
