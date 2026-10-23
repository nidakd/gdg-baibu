// Logodaki dört hap şeklinden türetilmiş dekoratif arka plan öğeleri.
// Logonun kendisi değildir; logo yerine kullanılmaz.

const pills = [
  { x: 54, y: 8, r: -35, fill: "var(--brand-red)", w: 150 },
  { x: 50, y: 74, r: 35, fill: "var(--brand-blue)", w: 190 },
  { x: 84, y: 4, r: 35, fill: "var(--brand-green)", w: 200 },
  { x: 88, y: 78, r: -35, fill: "var(--brand-yellow)", w: 140 },
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
