// Etkinlik arşivinden türetilen özetler: rakamlar, odak alanları, etkinlik serileri.
// Elle sayı yazmak yerine hepsi content/events.json'dan hesaplanır.

import type { Tone } from "@/components/ui/button";
import { getEvents, getMembers, getSite, type Event } from "./content";

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

export type FocusArea = {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  count: number;
};

const focusAreas: (Omit<FocusArea, "count"> & { tags: string[] })[] = [
  {
    id: "ai",
    title: "Yapay zekâ ve Gemini",
    description: "Build with AI atölyeleri, Gemini ve AI Studio ile uygulama geliştirme.",
    tone: "blue",
    tags: ["AI", "AI - Gemini", "Build with AI"],
  },
  {
    id: "career",
    title: "Kariyer",
    description: "Staj, sektör ve kariyer buluşmaları; deneyimli isimlerle söyleşiler.",
    tone: "green",
    tags: ["Career Development"],
  },
  {
    id: "workshop",
    title: "Atölyeler",
    description:
      "Python, Arduino, Git gibi konularda elini klavyeye koyduğun uygulamalı oturumlar.",
    tone: "yellow",
    tags: ["Workshop / hands-on session"],
  },
  {
    id: "build",
    title: "Hackathon ve jam",
    description: "Fikirden prototipe: takım kurup kısa sürede bir şey üretmek.",
    tone: "red",
    tags: ["Hackathon"],
  },
  {
    id: "platforms",
    title: "Mobil, web ve cloud",
    description: "Flutter, Firebase, Android, web ve Google Cloud üzerine teknik içerikler.",
    tone: "blue",
    tags: ["Android", "Flutter", "Firebase", "Web", "Google Cloud"],
  },
  {
    id: "community",
    title: "Topluluk",
    description: "Coffee Talk, oyun ve film geceleri, stantlar: tanışmak için bahaneler.",
    tone: "green",
    tags: ["Community Building", "Networking"],
  },
];

export function getFocusAreas(): FocusArea[] {
  const events = getEvents();
  return focusAreas.map(({ tags, ...area }) => ({
    ...area,
    count: events.filter((e) => e.tags.some((t) => tags.includes(t))).length,
  }));
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
