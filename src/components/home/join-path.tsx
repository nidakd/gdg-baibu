import { ButtonLink } from "@/components/ui/button";
import { WaveBand } from "@/components/ui/wave-band";

const STEPS = [
  { cmd: "git clone", text: "WhatsApp grubuna katıl, duyuruları ilk sen gör.", dot: "bg-yellow" },
  { cmd: "npm install", text: "Bir etkinliğe gel, ekiple tanış.", dot: "bg-blue" },
  { cmd: "deploy", text: "Core team başvurusunu doldur, bir ekibe katıl.", dot: "bg-red" },
];

/**
 * "Deploy yourself": kenardan kenara yeşil dalgalı bant (Son etkinlikler'deki mavi bantla eş),
 * üç adım kesikli bir yolla birbirine bağlı.
 */
export function JoinPath({ whatsapp, form }: { whatsapp: string; form: string }) {
  return (
    <WaveBand tone="green">
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
        <p className="font-mono text-sm text-fg-subtle">{"// 05 — deploy yourself"}</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Deneyim şart değil. Merak yeter.
        </h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Adımları birleştiren yol: masaüstünde yatay, telefonda dikey */}
          <span
            aria-hidden
            className="absolute top-8 bottom-8 left-8 w-0 border-l-[3px] border-dashed border-fg/40 md:top-8 md:right-[16%] md:bottom-auto md:left-[16%] md:w-auto md:border-t-[3px] md:border-l-0"
          />
          {STEPS.map((s, i) => (
            <li
              key={s.cmd}
              className="relative flex gap-5 md:flex-col md:items-center md:text-center"
            >
              <span
                className={`grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-ink-black font-mono text-2xl font-bold text-ink-black shadow-sticker ${s.dot}`}
              >
                {i + 1}
              </span>
              <span className="space-y-1.5 pt-2 md:pt-0">
                <span className="block font-mono text-sm font-bold">$ {s.cmd}</span>
                <span className="block max-w-xs text-lg">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3 md:justify-center">
          <ButtonLink href={whatsapp} tone="green">
            WhatsApp grubu
          </ButtonLink>
          <ButtonLink href={form} tone="blue">
            Core team başvurusu
          </ButtonLink>
        </div>
      </div>
    </WaveBand>
  );
}
