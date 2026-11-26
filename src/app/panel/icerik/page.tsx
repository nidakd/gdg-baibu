import Link from "next/link";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { POST_KINDS, type PostKind } from "@/lib/posts";

export const metadata = { title: "İçerik" };

type Row = { id: string; kind: PostKind; title: string; published: boolean; published_at: string };

/** Duyurular, projeler ve kaynaklar; türe göre süzülür. */
export default async function Content({ searchParams }: PageProps<"/panel/icerik">) {
  const { supabase } = await requirePanelUser("/panel/icerik");
  const { tur } = await searchParams;
  const kind = typeof tur === "string" && tur in POST_KINDS ? (tur as PostKind) : "duyuru";
  const { data } = await supabase
    .from("posts")
    .select("id,kind,title,published,published_at")
    .eq("kind", kind)
    .order("published_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  const meta = POST_KINDS[kind];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">İçerik</h1>
          <p className="max-w-prose text-fg-muted">
            Duyurular, projeler ve kaynaklar. Bir bölümde yayında içerik olunca sitede sayfası
            footer menüsünde görünür ({meta.path}).
          </p>
        </div>
        <Link
          href={`/panel/icerik/yeni?tur=${kind}`}
          className="rounded-full border-2 border-border-strong bg-green px-4 py-2 text-sm font-medium text-ink-black"
        >
          + Yeni {meta.label.toLocaleLowerCase("tr")}
        </Link>
      </header>
      <nav aria-label="Türe göre" className="flex flex-wrap gap-2 font-mono text-sm">
        {(Object.keys(POST_KINDS) as PostKind[]).map((k) => (
          <Link
            key={k}
            href={`/panel/icerik?tur=${k}`}
            aria-current={k === kind ? "page" : undefined}
            className={`rounded-full border-2 px-3 py-1 ${k === kind ? "border-border-strong bg-blue-soft" : "border-border hover:bg-surface"}`}
          >
            {POST_KINDS[k].plural.toLocaleLowerCase("tr")}
          </Link>
        ))}
      </nav>
      <PanelBox title={`~/panel/icerik/${kind}`} meta={`${rows.length} kayıt`}>
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-fg-muted">
            Henüz {meta.label.toLocaleLowerCase("tr")} yok.
          </p>
        ) : (
          <ul className="divide-y-2 divide-border">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <Link
                  href={`/panel/icerik/duzenle?id=${r.id}`}
                  className="font-medium hover:underline"
                >
                  {r.title}
                </Link>
                <span className="text-sm text-fg-subtle">
                  {formatDate(r.published_at)} ·{" "}
                  <span className={r.published ? "text-green-ink" : ""}>
                    {r.published ? "yayında" : "taslak"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </PanelBox>
    </div>
  );
}
