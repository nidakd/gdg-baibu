import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { getEvents } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getPosts, paragraphs, POST_KINDS, type Post, type PostKind } from "@/lib/posts";

const COMMENTS: Record<PostKind, string> = {
  duyuru: "// git log --oneline",
  proje: "// ls ~/projeler",
  kaynak: "// cat kaynaklar.md",
};

/** Duyurular / projeler / kaynaklar sayfalarının ortak düzeni. */
export async function PostsPage({ kind }: { kind: PostKind }) {
  const meta = POST_KINDS[kind];
  const [posts, events] = await Promise.all([getPosts(kind), getEvents()]);
  const eventTitle = new Map(events.map((e) => [e.slug, e.title]));
  return (
    <div className="mx-auto max-w-content space-y-10 px-4 py-12 sm:px-6 md:py-20">
      <header className="max-w-2xl space-y-4">
        <p className="font-mono text-sm text-fg-subtle">{COMMENTS[kind]}</p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">{meta.plural}</h1>
        <p className="text-lg text-fg-muted">{meta.description}</p>
      </header>
      {posts.length === 0 ? (
        <p className="text-fg-muted">Henüz bir şey eklenmedi, yakında burada.</p>
      ) : (
        <ul className={kind === "duyuru" ? "max-w-3xl space-y-6" : "grid gap-6 md:grid-cols-2"}>
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                eventTitle={p.eventSlug ? eventTitle.get(p.eventSlug) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostCard({ post: p, eventTitle }: { post: Post; eventTitle?: string }) {
  const body = paragraphs(p.body);
  return (
    <Card className="h-full space-y-4 p-6">
      {p.coverUrl && (
        // Panelden yüklenen görsel; boyutu bilinmediği için düz img
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.coverUrl}
          alt=""
          className="aspect-video w-full rounded-xl border-2 border-border object-cover"
        />
      )}
      <div className="space-y-2">
        <p className="font-mono text-xs text-fg-subtle">{formatDate(p.publishedAt)}</p>
        <h2 className="text-2xl font-bold tracking-tight">{p.title}</h2>
        {p.summary && <p className="text-fg-muted">{p.summary}</p>}
      </div>
      {body.length > 0 && (
        <div className="prose-gdg space-y-3">
          {body.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      )}
      {p.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {p.url && (
          <a href={p.url} target="_blank" rel="noreferrer" className="font-medium underline">
            {p.kind === "proje" ? "Demo" : p.kind === "kaynak" ? "Kaynağa git" : "Bağlantı"} ↗
          </a>
        )}
        {p.repoUrl && (
          <a href={p.repoUrl} target="_blank" rel="noreferrer" className="font-medium underline">
            Kod ↗
          </a>
        )}
        {p.eventSlug && eventTitle && (
          <Link href={`/etkinlikler/${p.eventSlug}`} className="font-medium underline">
            Etkinlik: {eventTitle}
          </Link>
        )}
      </div>
    </Card>
  );
}
