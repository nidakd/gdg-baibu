import Link from "next/link";
import { requirePanelUser } from "@/lib/panel/auth";
import { POST_KINDS, type PostKind } from "@/lib/posts";
import { eventOptions } from "../events";
import { PostForm } from "../post-form";

export const metadata = { title: "Yeni içerik" };

export default async function NewPost({ searchParams }: PageProps<"/panel/icerik/yeni">) {
  await requirePanelUser("/panel/icerik");
  const { tur } = await searchParams;
  const kind = typeof tur === "string" && tur in POST_KINDS ? (tur as PostKind) : "duyuru";
  return (
    <div className="space-y-6">
      <Link
        href={`/panel/icerik?tur=${kind}`}
        className="inline-block text-sm text-fg-muted hover:text-fg"
      >
        ← {POST_KINDS[kind].plural}
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">
        Yeni {POST_KINDS[kind].label.toLocaleLowerCase("tr")}
      </h1>
      <PostForm
        events={await eventOptions()}
        post={{
          kind,
          title: "",
          summary: "",
          body: "",
          url: "",
          repo_url: "",
          event_slug: "",
          tags: "",
          cover_url: null,
          published: false,
        }}
      />
    </div>
  );
}
