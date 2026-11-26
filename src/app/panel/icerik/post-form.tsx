"use client";

import { useActionState, useState } from "react";
import { PanelBox } from "@/app/panel/_components/panel-box";
import type { PostKind } from "@/lib/posts";
import { savePost, type PostField, type PostFormState } from "./actions";

export type PostValues = {
  id?: string;
  kind: PostKind;
  title: string;
  summary: string;
  body: string;
  url: string;
  repo_url: string;
  event_slug: string;
  tags: string;
  cover_url: string | null;
  published: boolean;
};

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

const URL_LABEL: Record<PostKind, string> = {
  duyuru: "Bağlantı (isteğe bağlı, ör. form ya da gönderi)",
  proje: "Demo / canlı adres (isteğe bağlı)",
  kaynak: "Kaynak bağlantısı (slayt, video, doküman)",
};

export function PostForm({
  post,
  events,
}: {
  post: PostValues;
  events: { slug: string; title: string; date: string }[];
}) {
  const [state, action, pending] = useActionState<PostFormState, FormData>(savePost, {
    status: "idle",
  });
  const [summary, setSummary] = useState(post.summary);
  const [preview, setPreview] = useState<string | null>(null);
  const err = (f: PostField) => state.errors?.[f];
  const cover = preview ?? post.cover_url;

  return (
    <form action={action} className="space-y-6" noValidate>
      {post.id && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="kind" value={post.kind} />
      <PanelBox title="İçerik" meta={pending ? "kaydediliyor…" : undefined}>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <Field label="Başlık" htmlFor="title" error={err("title")}>
              <input
                id="title"
                name="title"
                required
                maxLength={120}
                defaultValue={post.title}
                className={input}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label={`Kısa özet · ${summary.length}/400`}
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
              label="Metin (isteğe bağlı; paragrafları boş satırla ayır)"
              htmlFor="body"
              error={err("body")}
            >
              <textarea
                id="body"
                name="body"
                rows={post.kind === "duyuru" ? 8 : 4}
                maxLength={8000}
                defaultValue={post.body}
                className={`${input} resize-y`}
              />
            </Field>
          </div>
          <Field label={URL_LABEL[post.kind]} htmlFor="url" error={err("url")}>
            <input
              id="url"
              name="url"
              type="url"
              placeholder="https://"
              defaultValue={post.url}
              className={input}
            />
          </Field>
          {post.kind !== "duyuru" && (
            <Field
              label="Kod (GitHub vb., isteğe bağlı)"
              htmlFor="repo_url"
              error={err("repo_url")}
            >
              <input
                id="repo_url"
                name="repo_url"
                type="url"
                placeholder="https://github.com/…"
                defaultValue={post.repo_url}
                className={input}
              />
            </Field>
          )}
          <Field
            label="İlgili etkinlik (isteğe bağlı)"
            htmlFor="event_slug"
            error={err("event_slug")}
          >
            <select
              id="event_slug"
              name="event_slug"
              defaultValue={post.event_slug}
              className={input}
            >
              <option value="">—</option>
              {events.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.date} · {e.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Etiketler (virgülle)" htmlFor="tags" error={err("tags")}>
            <input id="tags" name="tags" defaultValue={post.tags} className={input} />
          </Field>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="h-20 w-auto rounded-lg border-2 border-border-strong object-cover"
              />
            )}
            <Field
              label="Görsel (isteğe bağlı · JPG, PNG, WebP · en çok 5 MB)"
              htmlFor="cover"
              error={err("cover")}
            >
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
            {post.cover_url && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="remove_cover" /> Görseli kaldır
              </label>
            )}
          </div>
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={post.published}
              className="size-4"
            />
            Sitede yayınla (işaretli değilse taslak)
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
