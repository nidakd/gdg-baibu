import type { ReactNode } from "react";
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

const wave =
  "M0,32 C180,64 360,0 540,24 C720,48 900,64 1080,36 C1260,8 1350,16 1440,28 L1440,64 L0,64 Z";

export function WaveBand({ tone, children }: { tone: Tone; children: ReactNode }) {
  const fill = fills[tone];
  return (
    <div className="relative">
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
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={`block h-10 w-full sm:h-16 ${flip ? "rotate-180" : ""}`}
    >
      <path d={wave} fill={fill} />
    </svg>
  );
}
