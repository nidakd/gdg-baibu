import type { Tone } from "@/components/ui/button";

// GDG simgesi (dört hap), renkleri değiştirilebilir SVG olarak.
// Varsayılan renkler resmî simgeninki; `tone` verilirse rehberdeki tek renk sürümler gibi
// o rengin çekirdek ve pastel tonlarıyla iki tonlu çizilir.

type Colors = { topLeft: string; bottomLeft: string; topRight: string; bottomRight: string };

const official: Colors = {
  topLeft: "var(--brand-red)",
  bottomLeft: "var(--brand-blue)",
  topRight: "var(--brand-green)",
  bottomRight: "var(--brand-yellow)",
};

function twoTone(tone: Tone): Colors {
  const core = `var(--brand-${tone})`;
  const light = `var(--brand-${tone}-pastel)`;
  return { topLeft: core, bottomLeft: light, topRight: light, bottomRight: core };
}

type GdgMarkProps = {
  tone?: Tone;
  /** Hapların dış çizgisi */
  outline?: string;
  className?: string;
};

export function GdgMark({ tone, outline = "var(--brand-black)", className = "" }: GdgMarkProps) {
  const c = tone ? twoTone(tone) : official;
  // Her hap kalın, uçları yuvarlak bir çizgi; önce dış çizgi, sonra dolgu.
  // Çizim sırası resmî simgedeki üst üste binmeyi korur (alt sol hap üstte, üst sağ hap üstte).
  const pills: [string, [number, number, number, number]][] = [
    [c.topLeft, [205, 180, 95, 256]],
    [c.bottomLeft, [205, 332, 95, 256]],
    [c.bottomRight, [307, 332, 417, 256]],
    [c.topRight, [307, 180, 417, 256]],
  ];
  return (
    <svg aria-hidden viewBox="40 120 432 272" className={className}>
      {pills.map(([color, [x1, y1, x2, y2]]) => (
        <g key={`${x1}-${y1}`} strokeLinecap="round">
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={outline} strokeWidth={104} />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={84} />
        </g>
      ))}
    </svg>
  );
}
