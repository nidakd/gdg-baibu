import { ButtonLink } from "@/components/ui/button";

const JOIN_STEPS = [
  { cmd: "git clone", text: "WhatsApp grubuna katıl, duyuruları ilk sen gör." },
  { cmd: "npm install", text: "Bir etkinliğe gel, ekiple tanış." },
  { cmd: "deploy", text: "Core team başvurusunu doldur, bir ekibe katıl." },
];

const NOTES = [
  { bg: "bg-yellow-pastel", pos: "lg:-rotate-3 lg:translate-x-0" },
  { bg: "bg-blue-pastel", pos: "lg:rotate-2 lg:translate-x-16" },
  { bg: "bg-red-pastel", pos: "lg:-rotate-1 lg:translate-x-6" },
];

/**
 * "Deploy yourself": dış kutu yok; solda büyük başlık ve butonlar, sağda üç adım yapışkan not
 * gibi, üstlerinde bant parçası, hafif eğik ve basamak basamak.
 */
export function JoinNotes({ whatsapp, form }: { whatsapp: string; form: string }) {
  return (
    <section className="mx-auto grid max-w-content items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-6">
        <p className="font-mono text-sm text-fg-subtle">{"// 05 — deploy yourself"}</p>
        <h2 className="text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl">
          Deneyim şart değil.{" "}
          <span className="inline-block -rotate-2 rounded-2xl border-[3px] border-ink-black bg-green-pastel px-3 text-ink-black shadow-sticker">
            Merak yeter.
          </span>
        </h2>
        <p className="max-w-md text-lg text-fg-muted">
          Hangi bölümden olduğun, ne kadar bildiğin fark etmez. Üç adımda aramızdasın.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={whatsapp} tone="green">
            WhatsApp grubu
          </ButtonLink>
          <ButtonLink href={form} tone="blue">
            Core team başvurusu
          </ButtonLink>
        </div>
      </div>
      <ol className="space-y-5">
        {JOIN_STEPS.map((s, i) => (
          <li
            key={s.cmd}
            className={`relative max-w-sm rounded-md border-2 border-ink-black p-5 pt-7 text-ink-black shadow-sticker transition duration-300 hover:rotate-0 ${NOTES[i].bg} ${NOTES[i].pos}`}
          >
            {/* bant parçası */}
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-white/60 shadow-sm backdrop-blur-sm"
            />
            <span className="block font-mono text-sm font-bold">
              {i + 1}. $ {s.cmd}
            </span>
            <span className="mt-1.5 block text-lg">{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
