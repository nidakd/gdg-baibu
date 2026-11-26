import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { getEvents, SITE_EVENT_COLUMNS, siteEventToEvent } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { updateEventPhoto } from "./actions";
import { PhotoUploader } from "./uploader";

export const metadata = { title: "Etkinlik fotoğrafları" };

type Row = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
  on_home: boolean;
};

/** Bir etkinliğin fotoğrafları: yükle, açıklama yaz, ana sayfada göster, sırala, sil. */
export default async function EventPhotos({
  searchParams,
}: PageProps<"/panel/etkinlikler/fotograflar">) {
  const { e: slug } = await searchParams;
  if (typeof slug !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$/.test(slug)) notFound();
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const { data: draft } = await supabase
    .from("site_events")
    .select(SITE_EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  const event = draft ? siteEventToEvent(draft) : (await getEvents()).find((x) => x.slug === slug);
  if (!event) notFound();
  const { data } = await supabase
    .from("event_photos")
    .select("id,url,alt,width,height,sort_order,on_home")
    .eq("event_slug", slug)
    .order("sort_order")
    .order("created_at");
  const photos = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <Link href="/panel/etkinlikler" className="inline-block text-sm text-fg-muted hover:text-fg">
        ← Etkinlikler
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-fg-muted">{formatDate(event.startsAt)} · fotoğraflar</p>
      </header>

      <PanelBox title="Fotoğraf yükle">
        <PhotoUploader slug={slug} title={event.title} />
      </PanelBox>

      <PanelBox title="Galeri" meta={`${photos.length} fotoğraf`}>
        {photos.length === 0 ? (
          <p className="p-5 text-sm text-fg-muted">Henüz fotoğraf yok.</p>
        ) : (
          <ul className="divide-y-2 divide-border">
            {photos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <Image
                  src={p.url}
                  alt=""
                  width={160}
                  height={Math.round((160 * p.height) / p.width)}
                  className="h-auto w-40 shrink-0 rounded-lg border-2 border-border object-cover"
                />
                <form action={updateEventPhoto} className="min-w-0 flex-1 space-y-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <label className="block space-y-1">
                    <span className="block font-mono text-xs text-fg-subtle">
                      Açıklama (ekran okuyucular için, ne görünüyor?)
                    </span>
                    <input
                      name="alt"
                      defaultValue={p.alt}
                      maxLength={200}
                      className="w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="on_home" defaultChecked={p.on_home} /> Ana sayfa
                      şeridinde göster
                    </label>
                    <label className="flex items-center gap-2">
                      Sıra
                      <input
                        name="sort_order"
                        type="number"
                        min={0}
                        max={999}
                        defaultValue={p.sort_order}
                        className="w-20 rounded-lg border-2 border-border bg-surface px-2 py-1"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-full border-2 border-border px-3 py-1 hover:bg-surface-2"
                    >
                      Kaydet
                    </button>
                    <button
                      type="submit"
                      name="delete"
                      value="true"
                      className="text-red-ink underline"
                    >
                      Sil
                    </button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        )}
      </PanelBox>
    </div>
  );
}
