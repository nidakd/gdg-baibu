// Dalgalı bantların kenar eğrisi. Hem SVG çizimi (WaveBand) hem de bu eğriyi izleyen
// hareket (WaveRide) aynı veriden üretilir, böylece ikisi hep birebir uyuşur.

export const WAVE_WIDTH = 1440;
export const WAVE_HEIGHT = 64;

const start: [number, number] = [0, 32];
/** Kübik Bézier parçaları: [c1x, c1y, c2x, c2y, x, y] */
const curves: [number, number, number, number, number, number][] = [
  [180, 64, 360, 0, 540, 24],
  [720, 48, 900, 64, 1080, 36],
  [1260, 8, 1350, 16, 1440, 28],
];

/** Bandın üst kenarı: eğri + alttaki dolgu kapanışı. */
export const WAVE_PATH = `M${start.join(",")} ${curves
  .map((c) => `C${c[0]},${c[1]} ${c[2]},${c[3]} ${c[4]},${c[5]}`)
  .join(" ")} L${WAVE_WIDTH},${WAVE_HEIGHT} L0,${WAVE_HEIGHT} Z`;

// Eğri üzerinde örneklenmiş noktalar (x her parçada artan; aradaki değerler doğrusal ara değerle)
const samples: { x: number; y: number }[] = [];
{
  let [x0, y0] = start;
  for (const [c1x, c1y, c2x, c2y, x3, y3] of curves) {
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const u = 1 - t;
      samples.push({
        x: u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x3,
        y: u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y3,
      });
    }
    [x0, y0] = [x3, y3];
  }
}

/** Üst kenar eğrisinin x noktasındaki yüksekliği (viewBox birimi, 0..WAVE_HEIGHT). */
export function waveY(x: number): number {
  const cx = Math.min(WAVE_WIDTH, Math.max(0, x));
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].x <= cx) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const k = b.x === a.x ? 0 : (cx - a.x) / (b.x - a.x);
  return a.y + (b.y - a.y) * k;
}
