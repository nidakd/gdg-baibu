// GDG Community (Bevy) sayfasındaki geçmiş ve yaklaşan etkinlikleri content/events.json'a,
// topluluk üye sayısını content/site.json'a yazar.
// Kullanım: npm run sync:events

import { readFile, writeFile } from "node:fs/promises";

const CHAPTER_ID = 2743;
const BASE = "https://gdg.community.dev";
const OUT = new URL("../content/events.json", import.meta.url);
const SITE = new URL("../content/site.json", import.meta.url);

async function getJson(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function slugify(text) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function toEvent(e) {
  const date = e.start_date.slice(0, 10);
  return {
    id: String(e.id),
    slug: `${date}-${slugify(e.title)}`,
    title: e.title.trim(),
    startsAt: e.start_date,
    endsAt: e.end_date,
    format: e.audience_type === "VIRTUAL" ? "online" : "in-person",
    venue: e.venue_name || null,
    summary: e.description_short?.trim() || null,
    descriptionHtml: e.description || null,
    coverUrl: e.picture?.url || null,
    tags: (e.tags || []).map((t) => (typeof t === "string" ? t : t.name)),
    speakers: (e.speakers || []).map((s) => ({
      name: `${s.first_name} ${s.last_name}`.trim(),
      title: s.title || null,
      company: s.company || null,
      photoUrl: s.picture?.thumbnail_url || null,
    })),
    photos: (e.event_wrapup_photos || []).map((p) => p.picture?.url || p.url).filter(Boolean),
    sourceUrl: e.url,
  };
}

const lists = await Promise.all(
  ["Completed", "Live"].map((status) =>
    getJson(`/api/chapter/${CHAPTER_ID}/event/?status=${status}&page_size=500`),
  ),
);
const ids = lists.flatMap((l) => l.results.map((r) => r.id));
const details = await Promise.all(ids.map((id) => getJson(`/api/event/${id}/`)));
const events = details.map(toEvent).sort((a, b) => b.startsAt.localeCompare(a.startsAt));

await writeFile(OUT, JSON.stringify(events, null, 2) + "\n");
console.log(`${events.length} etkinlik yazıldı → content/events.json`);

// Üye sayısı: bölüm arama sonucundaki member_count (bölüm API'si giriş istiyor)
const search = await getJson(`/api/search/chapter/?q=${encodeURIComponent("Abant Izzet Baysal")}`);
const chapter = search.results.find((c) => c.id === CHAPTER_ID);
if (!chapter) throw new Error(`Bölüm ${CHAPTER_ID} aramada bulunamadı`);
const site = JSON.parse(await readFile(SITE, "utf8"));
site.stats.communityMembers = chapter.member_count;
site.stats.statsUpdatedAt = new Date().toISOString().slice(0, 10);
await writeFile(SITE, JSON.stringify(site, null, 2) + "\n");
console.log(`${chapter.member_count} topluluk üyesi yazıldı → content/site.json`);
