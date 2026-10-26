import { cacheLife } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { getEvents, type Event } from "./content";

export type EventTimeline = { upcoming: Event[]; past: Event[] };

/**
 * Etkinlikleri şu ana göre ayırır. "Şu an" değiştiği için sonuç saatlik önbelleğe alınır;
 * sayfa statik kalır, yaklaşan etkinlik geçmişe düştüğünde bir saat içinde güncellenir.
 */
export async function getEventTimeline(): Promise<EventTimeline> {
  "use cache";
  cacheLife("hours");
  const now = Date.now();
  const events = getEvents();
  return {
    // yaklaşanlar en yakından başlar, geçmişler en yeniden
    upcoming: events.filter((e) => Date.parse(e.endsAt) >= now).reverse(),
    past: events.filter((e) => Date.parse(e.endsAt) < now),
  };
}

/** Kronolojik komşular: daha eski ve daha yeni etkinlik. */
export function getAdjacentEvents(slug: string): { older?: Event; newer?: Event } {
  const events = getEvents();
  const i = events.findIndex((e) => e.slug === slug);
  if (i === -1) return {};
  return { newer: events[i - 1], older: events[i + 1] };
}

/** GDG Community'den gelen açıklama HTML'ini güvenli bir alt kümeye indirger. */
export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "h3", "h4"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noreferrer" }),
      h1: "h3",
      h2: "h3",
    },
  });
}
