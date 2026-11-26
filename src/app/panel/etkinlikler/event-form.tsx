"use client";

import { useActionState, useState } from "react";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { saveEvent, type EventField, type EventFormState } from "./actions";

export type EventValues = {
  id?: string;
  slug?: string;
  title: string;
  /** Türkiye saatiyle YYYY-MM-DD, HH:MM */
  date: string;
  start: string;
  end: string;
  format: "in-person" | "online";
  venue: string;
  summary: string;
  description: string;
  tags: string;
  cover_url: string | null;
  published: boolean;
};

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

/** Panelden etkinlik ekleme / düzenleme. Taslak kaydedilip sonra yayınlanabilir. */
export function EventForm({ event }: { event: EventValues }) {
  const [state, action, pending] = useActionState<EventFormState, FormData>(saveEvent, {
    status: "idle",
  });
  const [format, setFormat] = useState(event.format);
  const [summary, setSummary] = useState(event.summary);
  const [preview, setPreview] = useState<string | null>(null);
  const err = (f: EventField) => state.errors?.[f];
  const cover = preview ?? event.cover_url;

  return (
    <form action={action} className="space-y-6" noValidate>
      {event.id && <input type="hidden" name="id" value={event.id} />}
      {event.slug && <input type="hidden" name="slug" value={event.slug} />}

      <PanelBox title="Etkinlik bilgileri" meta={pending ? "kaydediliyor…" : undefined}>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <Field label="Başlık" htmlFor="title" error={err("title")}>
              <input
                id="title"
                name="title"
                required
                maxLength={120}
                defaultValue={event.title}
                className={input}
              />
            </Field>
          </div>
          <Field label="Tarih" htmlFor="date" error={err("date")}>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={event.date}
              className={input}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Başlangıç" htmlFor="start" error={err("start")}>
              <input
                id="start"
                name="start"
                type="time"
                required
                defaultValue={event.start}
                className={input}
              />
            </Field>
            <Field label="Bitiş" htmlFor="end" error={err("end")}>
              <input
                id="end"
                name="end"
                type="time"
                required
                defaultValue={event.end}
                className={input}
              />
            </Field>
          </div>
          <fieldset className="space-y-1.5">
            <legend className="mb-1.5 block font-mono text-xs text-fg-subtle">Biçim</legend>
            <div className="flex gap-4 text-sm">
              {(["in-person", "online"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                  />
                  {f === "online" ? "Online" : "Yüz yüze"}
                </label>
              ))}
            </div>
          </fieldset>
          {format === "in-person" && (
            <Field label="Yer" htmlFor="venue" error={err("venue")}>
              <input
                id="venue"
                name="venue"
                maxLength={200}
                defaultValue={event.venue}
                placeholder="ör. Mühendislik Fakültesi, Konferans Salonu"
                className={input}
              />
            </Field>
          )}
          <div className="sm:col-span-2">
            <Field
              label={`Kısa özet (listelerde görünür) · ${summary.length}/400`}
              htmlFor="summary"
              error={err("summary")}
            >
              <textarea
                id="summary"
                name="summary"
                rows={2}
                maxLength={400}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={`${input} resize-y`}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Açıklama (paragrafları boş satırla ayır)"
              htmlFor="description"
              error={err("description")}
            >
              <textarea
                id="description"
                name="description"
                rows={8}
                maxLength={5000}
                defaultValue={event.description}
                className={`${input} resize-y`}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Etiketler (virgülle, ör. Workshop / hands-on session, Networking)"
              htmlFor="tags"
              error={err("tags")}
            >
              <input id="tags" name="tags" defaultValue={event.tags} className={input} />
            </Field>
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            {cover && (
              // Seçilen dosyanın önizlemesi (blob: adresi next/image'e verilemez)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="h-24 w-auto shrink-0 rounded-lg border-2 border-border-strong object-cover"
              />
            )}
            <Field label="Afiş (JPG, PNG, WebP · en çok 5 MB)" htmlFor="cover" error={err("cover")}>
              <input
                id="cover"
                name="cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPreview(file ? URL.createObjectURL(file) : null);
                }}
                className="text-sm"
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={event.published}
              className="size-4"
            />
            Sitede yayınla (işaretli değilse taslak olarak sadece panelde görünür)
          </label>
        </div>
      </PanelBox>

      {state.message && (
        <p
          role="alert"
          className="rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border-2 border-border-strong bg-green px-5 py-2.5 text-sm font-medium text-ink-black disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block font-mono text-xs text-fg-subtle">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-ink">{error}</p>}
    </div>
  );
}
