import type { MetadataRoute } from "next";
import { getEvents, getMembers } from "@/lib/content";
import { getPostKindsWithContent, POST_KINDS } from "@/lib/posts";
import { SITE_URL } from "@/lib/seo";

// Sayfalar + her etkinlik ve her üye profili. Etkinliklerin tarihi "son değişiklik" olarak geçer.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${SITE_URL}${path}`;
  const events = await getEvents();
  return [
    { url: url("/"), lastModified: events[0]?.startsAt, priority: 1 },
    { url: url("/etkinlikler"), lastModified: events[0]?.startsAt, priority: 0.8 },
    { url: url("/hakkimizda"), priority: 0.7 },
    { url: url("/ekip"), priority: 0.7 },
    { url: url("/katil"), priority: 0.6 },
    { url: url("/marka"), priority: 0.3 },
    { url: url("/gizlilik"), priority: 0.2 },
    ...(await getPostKindsWithContent()).map((k) => ({
      url: url(POST_KINDS[k].path),
      priority: 0.5,
    })),
    ...events.map((e) => ({
      url: url(`/etkinlikler/${e.slug}`),
      lastModified: e.startsAt,
      priority: 0.5,
    })),
    ...(await getMembers()).map((m) => ({ url: url(`/ekip/${m.slug}`), priority: 0.4 })),
  ];
}
