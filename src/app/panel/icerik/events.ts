import { getEvents } from "@/lib/content";

/** İçeriğe bağlanabilecek etkinlikler (seçim listesi) */
export async function eventOptions() {
  return (await getEvents()).map((e) => ({
    slug: e.slug,
    title: e.title,
    date: e.startsAt.slice(0, 10),
  }));
}
