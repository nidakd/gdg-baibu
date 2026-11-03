import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Window } from "@/components/ui/window";
import { getEvents, getMembers, getSite } from "@/lib/content";
import { formatMonth } from "@/lib/format";
import { getMilestones, type Milestone } from "@/lib/insights";

const types: Record<Milestone["type"], string> = {
  init: "bg-red",
  feat: "bg-blue",
  release: "bg-yellow",
};

/** Sahte ama sabit commit kısaltması: başlıktan türetilen 7 haneli onaltılık sayı. */
function shortHash(text: string): string {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

/** Topluluğun hikâyesi `git log --graph` çıktısı gibi: en üstte bugünkü durum (HEAD). */
export function Milestones() {
  const milestones = getMilestones();
  const head = `${getSite().stats.communityMembers} üye · ${getEvents().length} etkinlik · ${getMembers().length} kişilik core team`;

  return (
    <Window title="git log --graph" tone="yellow" meta={`${milestones.length} commit`}>
      <ol className="relative py-3 font-mono text-sm">
        <span aria-hidden className="absolute top-6 bottom-6 left-[1.6rem] w-0.5 bg-border" />
        <span
          aria-hidden
          className="timeline-line absolute top-6 bottom-6 left-[1.6rem] w-0.5 bg-fg"
        />

        <li className="relative py-3 pr-4 pl-14">
          <span
            aria-hidden
            className="absolute top-4 left-[1.05rem] size-5 rounded-full border-2 border-ink-black bg-green"
          />
          <p className="text-xs">
            <span className="text-syntax-number">{shortHash("HEAD")}</span>{" "}
            <span className="rounded-full border-2 border-ink-black bg-green px-2 font-bold text-ink-black">
              HEAD → main
            </span>
          </p>
          <p className="mt-1 font-sans text-base font-bold">Bugün</p>
          <p className="font-sans text-fg-muted">{head}</p>
        </li>

        {milestones.map((m, i) => {
          const body = (
            <>
              <span
                aria-hidden
                className={`reveal-pop absolute top-4 left-[1.15rem] size-4 rounded-full border-2 border-ink-black ${types[m.type]}`}
              />
              <span className="block text-xs text-fg-subtle">
                <span className="text-syntax-number">{shortHash(m.title)}</span> ·{" "}
                {formatMonth(m.date)}
              </span>
              <span className="mt-0.5 block font-sans text-base">
                <span className="font-mono text-sm text-syntax-keyword">{m.type}:</span>{" "}
                <span className="font-bold group-hover:underline">{m.title}</span>
              </span>
              <span className="block font-sans text-fg-muted">{m.detail}</span>
            </>
          );
          return (
            <li key={m.date + m.title}>
              <Reveal delay={Math.min(i, 6) * 60}>
                {m.href ? (
                  <Link
                    href={m.href}
                    className="group relative block py-3 pr-4 pl-14 transition hover:bg-surface-2"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="relative py-3 pr-4 pl-14">{body}</div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Window>
  );
}
