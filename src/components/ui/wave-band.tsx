import type { ReactNode } from "react";
import { WAVE_HEIGHT, WAVE_PATH, WAVE_WIDTH } from "@/lib/wave";
import type { Tone } from "./button";

// Bölümü düz çizgi yerine dalgalı kenarlarla ayıran renkli bant.

const fills: Record<Tone, string> = {
  blue: "var(--blue-soft)",
  green: "var(--green-soft)",
  yellow: "var(--yellow-soft)",
  red: "var(--red-soft)",
  lilac: "var(--lilac-soft)",
  silver: "var(--silver-soft)",
};

export function WaveBand({ tone, children }: { tone: Tone; children: ReactNode }) {
  const fill = fills[tone];
  return (
    <div data-wave-band className="relative">
      <WaveEdge fill={fill} />
      <div style={{ background: fill }}>{children}</div>
      <WaveEdge fill={fill} flip />
    </div>
  );
}

/** Tek başına dalgalı kenar; flip ile alt kenar olur. */
export function WaveEdge({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}
      preserveAspectRatio="none"
      className={`block h-10 w-full sm:h-16 ${flip ? "rotate-180" : ""}`}
    >
      <path d={WAVE_PATH} fill={fill} />
    </svg>
  );
}
