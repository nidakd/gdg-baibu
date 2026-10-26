import type { Tone } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFocusAreas } from "@/lib/insights";

const dots: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  lilac: "bg-lilac",
  silver: "bg-silver",
};

export function FocusAreas() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {getFocusAreas().map((area) => (
        <li key={area.id}>
          <Card className="flex h-full flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <span
                aria-hidden
                className={`h-4 w-10 rounded-full border-2 border-ink-black ${dots[area.tone]}`}
              />
              <span className="font-mono text-xs text-fg-subtle">{area.count} etkinlik</span>
            </div>
            <h3 className="text-xl font-bold">{area.title}</h3>
            <p className="text-fg-muted">{area.description}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
