// Etkinlik arşivinden türetilen özetler: rakamlar ve etkinlik serileri.
// Elle sayı yazmak yerine hepsi content/events.json'dan hesaplanır.

import type { Tone } from "@/components/ui/button";
import { getEvents, getMembers, getSite, type Event, type Member } from "./content";

export type Stat = { value: number; label: string; tone: Tone };

export function getStats(): Stat[] {
  const events = getEvents();
  const workshops = events.filter((e) => e.tags.includes("Workshop / hands-on session"));
  return [
    { value: getSite().stats.communityMembers, label: "topluluk üyesi", tone: "blue" },
    { value: events.length, label: "etkinlik", tone: "green" },
    { value: workshops.length, label: "uygulamalı atölye", tone: "yellow" },
    { value: getMembers().length, label: "core team üyesi", tone: "red" },
  ];
}

export type Series = {
  id: string;
  title: string;
  events: Event[];
  first: string;
  last: string;
};

const seriesPatterns: { id: string; title: string; pattern: RegExp }[] = [
  { id: "sahur-jam", title: "Sahur Jam", pattern: /sahur jam/i },
  { id: "campusfest", title: "CampusFest", pattern: /campusfest/i },
  { id: "zirve", title: "Zirve", pattern: /z[iİ]rve/i },
  { id: "cyberfirst", title: "CYBERFIRST", pattern: /cyberfirst/i },
  { id: "expertiz", title: "EXPERT'IZ", pattern: /expert'iz/i },
  { id: "ai-bu", title: "AI-BU", pattern: /ai-bu/i },
  { id: "stajin-sifreleri", title: "Stajın Şifreleri", pattern: /stajın şifreleri/i },
  { id: "coffee-talk", title: "Coffee Talk", pattern: /coffee talk/i },
];

/** Etkinliğin ait olduğu seri, varsa. */
export function getSeriesOf(event: Event): Series | undefined {
  return getSeries().find((s) => s.events.some((e) => e.id === event.id));
}

/** Birden fazla oturumu olan etkinlik serileri, en kalabalıktan başlayarak. */
export function getSeries(): Series[] {
  const events = getEvents();
  return seriesPatterns
    .map(({ id, title, pattern }) => {
      const matched = events.filter((e) => pattern.test(e.title));
      const dates = matched.map((e) => e.startsAt).sort();
      return { id, title, events: matched, first: dates[0], last: dates[dates.length - 1] };
    })
    .filter((s) => s.events.length > 1)
    .sort((a, b) => b.events.length - a.events.length);
}

/** Yıllara göre etkinlik sayısı, eskiden yeniye. */
export function getEventsPerYear(): { year: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of getEvents()) {
    const year = e.startsAt.slice(0, 4);
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }));
}

export type Department = { name: string; members: Member[] };

/** Core team'in bölümlere göre dağılımı, en kalabalık bölümden başlayarak. */
export function getDepartments(): Department[] {
  const groups = new Map<string, Member[]>();
  for (const m of getMembers()) {
    if (!m.department) continue;
    groups.set(m.department, [...(groups.get(m.department) ?? []), m]);
  }
  return [...groups.entries()]
    .map(([name, members]) => ({ name, members }))
    .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name, "tr"));
}
