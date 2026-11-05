import { StatTile } from "@/components/ui/stat-tile";
import { getStats } from "@/lib/insights";

export async function StatsGrid() {
  const stats = await getStats();
  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatTile key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
      ))}
    </dl>
  );
}
