import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { POST_KINDS, type PostKind } from "@/lib/posts";
import { deletePost } from "../actions";
import { eventOptions } from "../events";
import { PostForm } from "../post-form";

export const metadata = { title: "İçerik" };

export default async function EditPost({ searchParams }: PageProps<"/panel/icerik/duzenle">) {
  const { id, kaydedildi } = await searchParams;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase, user } = await requirePanelUser("/panel/icerik");
  const { data: p } = await supabase
    .from("posts")
    .select("id,kind,title,summary,body,url,repo_url,event_slug,tags,cover_url,published")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();
  const kind = p.kind as PostKind;
  const meta = POST_KINDS[kind];

  return (
    <div className="space-y-6">
      <Link
        href={`/panel/icerik?tur=${kind}`}
        className="inline-block text-sm text-fg-muted hover:text-fg"
      >
        ← {meta.plural}
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{p.title}</h1>
          <p className="text-sm">
            <span
              className={`inline-block rounded-full px-2 py-0.5 ${p.published ? "bg-green-soft" : "bg-silver-soft"}`}
            >
              {meta.label} · {p.published ? "sitede yayında" : "taslak"}
            </span>
          </p>
        </div>
        {p.published && (
          <a
            href={meta.path}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-border px-3 py-1.5 text-sm hover:bg-surface-2"
          >
            Sitede gör ↗
          </a>
        )}
      </header>
      {kaydedildi && (
        <p role="status" className="rounded-xl bg-green-soft px-4 py-3 text-sm">
          Kaydedildi.
        </p>
      )}
      <PostForm
        events={await eventOptions()}
        post={{
          id: p.id,
          kind,
          title: p.title,
          summary: p.summary ?? "",
          body: p.body ?? "",
          url: p.url ?? "",
          repo_url: p.repo_url ?? "",
          event_slug: p.event_slug ?? "",
          tags: (p.tags as string[]).join(", "),
          cover_url: p.cover_url,
          published: p.published,
        }}
      />
      {user.role === "admin" && (
        <form action={deletePost} className="border-t-2 border-border pt-6">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="kind" value={kind} />
          <button type="submit" className="text-sm text-red-ink underline">
            Sil
          </button>
        </form>
      )}
    </div>
  );
}
