// Etkinlik arşivinden türetilen özetler: rakamlar, etkinlik serileri ve kilometre taşları.
// Elle sayı yazmak yerine hepsi content/events.json'dan hesaplanır.

import type { Tone } from "@/components/ui/button";
import milestonesJson from "../../content/milestones.json";
import { getEvents, getMembers, getSite, type Event, type Member } from "./content";
import { getEventTimeline } from "./events";

export type Stat = { value: number; label: string; tone: Tone };

/** Rakam kartları; yaklaşan etkinlikler sayılmaz (etkinlikler sayfasıyla aynı sayı). */
export async function getStats(): Promise<Stat[]> {
  const { past: events } = await getEventTimeline();
  const workshops = events.filter((e) => e.tags.includes("Workshop / hands-on session"));
  return [
    { value: getSite().stats.communityMembers, label: "topluluk üyesi", tone: "blue" },
    { value: events.length, label: "etkinlik", tone: "green" },
    { value: workshops.length, label: "uygulamalı atölye", tone: "yellow" },
    { value: (await getMembers()).length, label: "core team üyesi", tone: "red" },
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
export async function getDepartments(): Promise<Department[]> {
  const groups = new Map<string, Member[]>();
  for (const m of await getMembers()) {
    if (!m.department) continue;
    groups.set(m.department, [...(groups.get(m.department) ?? []), m]);
  }
  return [...groups.entries()]
    .map(([name, members]) => ({ name, members }))
    .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name, "tr"));
}

export type Milestone = {
  date: string;
  type: "init" | "feat" | "release";
  title: string;
  detail: string;
  /** Bağlı etkinliğin adresi (/etkinlikler/<slug>) */
  href: string | null;
};

/** content/milestones.json, en yeniden eskiye; etkinlik bağlantısı kırıksa derleme hata verir. */
export function getMilestones(): Milestone[] {
  const slugs = new Set(getEvents().map((e) => e.slug));
  return milestonesJson
    .map((m) => {
      const event = "event" in m ? m.event : undefined;
      if (event && !slugs.has(event)) {
        throw new Error(`milestones.json: "${m.title}" için etkinlik bulunamadı (${event})`);
      }
      return {
        date: m.date,
        type: m.type as Milestone["type"],
        title: m.title,
        detail: m.detail,
        href: event ? `/etkinlikler/${event}` : null,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
