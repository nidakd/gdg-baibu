import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { deleteEvent } from "../actions";
import { EventForm } from "../event-form";

export const metadata = { title: "Etkinlik" };

/** ISO → Türkiye saatiyle tarih ve saat */
const trParts = (iso: string) => {
  const local = new Date(Date.parse(iso) + 3 * 60 * 60 * 1000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
};

export default async function EditEvent({ searchParams }: PageProps<"/panel/etkinlikler/duzenle">) {
  const { id, kaydedildi } = await searchParams;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase, user } = await requirePanelUser("/panel/etkinlikler");
  const { data: e } = await supabase
    .from("site_events")
    .select(
      "id,slug,title,starts_at,ends_at,format,venue,summary,description,cover_url,tags,published",
    )
    .eq("id", id)
    .maybeSingle();
  if (!e) notFound();
  const start = trParts(e.starts_at);
  const end = trParts(e.ends_at);

  return (
    <div className="space-y-6">
      <Link href="/panel/etkinlikler" className="inline-block text-sm text-fg-muted hover:text-fg">
        ← Etkinlikler
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{e.title}</h1>
          <p className="text-sm">
            <span
              className={`inline-block rounded-full px-2 py-0.5 ${e.published ? "bg-green-soft" : "bg-silver-soft"}`}
            >
              {e.published ? "sitede yayında" : "taslak · sitede görünmüyor"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={`/panel/etkinlikler/kayit?e=${e.slug}`}
            className="rounded-full border-2 border-border px-3 py-1.5 hover:bg-surface-2"
          >
            Kayıt ve katılımcılar
          </Link>
          {e.published && (
            <a
              href={`/etkinlikler/${e.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-border px-3 py-1.5 hover:bg-surface-2"
            >
              Sitede gör ↗
            </a>
          )}
        </div>
      </header>
      {kaydedildi && (
        <p role="status" className="rounded-xl bg-green-soft px-4 py-3 text-sm">
          Kaydedildi.
        </p>
      )}
      <EventForm
        event={{
          id: e.id,
          slug: e.slug,
          title: e.title,
          date: start.date,
          start: start.time,
          end: end.time,
          format: e.format,
          venue: e.venue ?? "",
          summary: e.summary ?? "",
          description: e.description ?? "",
          tags: (e.tags as string[]).join(", "),
          cover_url: e.cover_url,
          published: e.published,
        }}
      />
      {user.role === "admin" && (
        <form action={deleteEvent} className="border-t-2 border-border pt-6">
          <input type="hidden" name="id" value={e.id} />
          <button type="submit" className="text-sm text-red-ink underline">
            Etkinliği sil (kayıtlar panelde kalır)
          </button>
        </form>
      )}
    </div>
  );
}
