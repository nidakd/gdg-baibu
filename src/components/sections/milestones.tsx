import Link from "next/link";
import { formatMonth } from "@/lib/format";
import { getMilestones, type Milestone } from "@/lib/insights";

const dots: Record<Milestone["type"], string> = {
  init: "bg-red",
  feat: "bg-blue",
  release: "bg-yellow",
};

/** Kilometre taşları tek satırlık yatay çizgide; dar ekranda yana kayar. */
export async function Milestones() {
  const milestones = (await getMilestones()).reverse();
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <ol className="relative flex min-w-max gap-2 lg:min-w-0">
        <span aria-hidden className="absolute top-[2.15rem] right-0 left-0 h-0.5 bg-fg" />
        {milestones.map((m) => {
          const inner = (
            <>
              <span className="block font-mono text-xs text-fg-subtle">{formatMonth(m.date)}</span>
              <span
                aria-hidden
                className={`relative my-2 block size-4 rounded-full border-2 border-ink-black ${dots[m.type]}`}
              />
              <span className="block text-sm leading-snug font-bold group-hover:underline">
                {m.title}
              </span>
            </>
          );
          return (
            <li key={m.date} className="w-32 shrink-0 lg:w-auto lg:flex-1">
              {m.href ? (
                <Link href={m.href} className="group block">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
