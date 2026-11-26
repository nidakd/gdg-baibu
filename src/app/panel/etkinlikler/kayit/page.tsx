import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { getEvents, SITE_EVENT_COLUMNS, siteEventToEvent } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { defaultMode, REGISTRATION_MODES, type RegistrationMode } from "@/lib/registration";
import { saveRegistrationSettings, toggleRegistration } from "../actions";

export const metadata = { title: "Kayıtlar" };

type Row = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  created_at: string;
  cancelled_at: string | null;
};

const input =
  "rounded-xl border-2 border-border-strong bg-surface px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

/** Bir etkinliğin kayıt ayarı (GDG Community / sitede form / kapalı, kontenjan) ve kayıt listesi. */
export default async function Registrations({
  searchParams,
}: PageProps<"/panel/etkinlikler/kayit">) {
  const { e: slug, kaydedildi, hata } = await searchParams;
  if (typeof slug !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$/.test(slug)) notFound();
  const { supabase } = await requirePanelUser("/panel/etkinlikler");

  // Taslak panel etkinlikleri de açılabilsin diye önce kendi tablosundan bakılır
  const { data: draft } = await supabase
    .from("site_events")
    .select(SITE_EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  const event = draft ? siteEventToEvent(draft) : (await getEvents()).find((x) => x.slug === slug);
  if (!event) notFound();

  const [{ data: settings }, { data: rows }] = await Promise.all([
    supabase
      .from("event_registration_settings")
      .select("mode,capacity")
      .eq("event_slug", slug)
      .maybeSingle(),
    supabase
      .from("registrations")
      .select("id,name,email,department,created_at,cancelled_at")
      .eq("event_slug", slug)
      .order("created_at"),
  ]);
  const mode = (settings?.mode as RegistrationMode | undefined) ?? defaultMode(event);
  const list = (rows ?? []) as Row[];
  const active = list.filter((r) => !r.cancelled_at);

  return (
    <div className="space-y-6">
      <Link href="/panel/etkinlikler" className="inline-block text-sm text-fg-muted hover:text-fg">
        ← Etkinlikler
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-fg-muted">
          {formatDate(event.startsAt)} ·{" "}
          {event.format === "online" ? "online" : (event.venue ?? "yüz yüze")}
        </p>
      </header>
      {kaydedildi && (
        <p role="status" className="rounded-xl bg-green-soft px-4 py-3 text-sm">
          Kaydedildi.
        </p>
      )}
      {hata && (
        <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm">
          Kontenjan 1–5000 arası bir sayı olmalı.
        </p>
      )}

      <PanelBox title="Kayıt nerede alınsın?">
        <form action={saveRegistrationSettings} className="space-y-4 p-5 sm:p-6">
          <input type="hidden" name="slug" value={slug} />
          <fieldset className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <legend className="sr-only">Kayıt yeri</legend>
            {(Object.keys(REGISTRATION_MODES) as RegistrationMode[]).map((m) =>
              m === "gdg" && !event.sourceUrl ? null : (
                <label key={m} className="flex items-center gap-2">
                  <input type="radio" name="mode" value={m} defaultChecked={mode === m} />
                  {REGISTRATION_MODES[m]}
                </label>
              ),
            )}
          </fieldset>
          <label className="flex flex-wrap items-center gap-3 text-sm">
            Kontenjan (sitede form için, boş = sınırsız)
            <input
              name="capacity"
              type="number"
              min={1}
              max={5000}
              defaultValue={settings?.capacity ?? ""}
              className={`${input} w-28`}
            />
          </label>
          <p className="text-sm text-fg-subtle">
            GDG Community&apos;deki etkinliklerde varsayılan oradaki kayıt sayfasıdır (GDG programı
            katılımı oradan görür). Sitede form seçilirse etkinlik sayfasında form açılır.
          </p>
          <button
            type="submit"
            className="rounded-full border-2 border-border-strong bg-green px-4 py-2 text-sm font-medium text-ink-black"
          >
            Kaydet
          </button>
        </form>
      </PanelBox>

      <PanelBox
        title="Kayıtlar"
        meta={
          <span className="flex items-center gap-3">
            {active.length}
            {settings?.capacity ? ` / ${settings.capacity}` : ""} kişi
            {list.length > 0 && (
              <a href={`/panel/etkinlikler/kayit/csv?e=${slug}`} className="underline">
                CSV indir
              </a>
            )}
          </span>
        }
      >
        {list.length === 0 ? (
          <p className="p-5 text-sm text-fg-muted">Henüz kayıt yok.</p>
        ) : (
          <ul className="divide-y-2 divide-border">
            {list.map((r) => (
              <li
                key={r.id}
                className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 ${r.cancelled_at ? "opacity-50" : ""}`}
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {r.name}
                    {r.cancelled_at && (
                      <span className="ml-2 font-mono text-xs text-red-ink">iptal</span>
                    )}
                  </p>
                  <p className="text-sm break-all text-fg-muted">
                    {r.email}
                    {r.department ? ` · ${r.department}` : ""} · {formatDate(r.created_at)}
                  </p>
                </div>
                <form action={toggleRegistration}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="cancel" value={r.cancelled_at ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded-full border-2 border-border px-3 py-1 text-sm hover:bg-surface-2"
                  >
                    {r.cancelled_at ? "Geri al" : "İptal et"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </PanelBox>
    </div>
  );
}
