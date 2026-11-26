// Duyurular, projeler ve kaynaklar (public.posts). Panelden kaydedince POSTS_CACHE_TAG ile yenilenir.

import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "./supabase/public";

export const POSTS_CACHE_TAG = "icerik";

export type PostKind = "duyuru" | "proje" | "kaynak";

export const POST_KINDS: Record<
  PostKind,
  { label: string; plural: string; path: string; description: string }
> = {
  duyuru: {
    label: "Duyuru",
    plural: "Duyurular",
    path: "/duyurular",
    description: "Topluluktan haberler: başvuru dönemleri, yeni ekipler, önemli tarihler.",
  },
  proje: {
    label: "Proje",
    plural: "Projeler",
    path: "/projeler",
    description: "Üyelerimizin atölyelerde, hackathon'larda ve kendi başına geliştirdiği projeler.",
  },
  kaynak: {
    label: "Kaynak",
    plural: "Kaynaklar",
    path: "/kaynaklar",
    description: "Atölye sunumları, örnek kodlar ve kayıtlar: kaçırdığın etkinliği buradan yakala.",
  },
};

export type Post = {
  id: string;
  kind: PostKind;
  title: string;
  summary: string | null;
  body: string | null;
  url: string | null;
  repoUrl: string | null;
  coverUrl: string | null;
  eventSlug: string | null;
  tags: string[];
  publishedAt: string;
};

type PostRow = {
  id: string;
  kind: PostKind;
  title: string;
  summary: string | null;
  body: string | null;
  url: string | null;
  repo_url: string | null;
  cover_url: string | null;
  event_slug: string | null;
  tags: string[];
  published_at: string;
};

export const POST_COLUMNS =
  "id,kind,title,summary,body,url,repo_url,cover_url,event_slug,tags,published_at";

export const toPost = (r: PostRow): Post => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  summary: r.summary,
  body: r.body,
  url: r.url,
  repoUrl: r.repo_url,
  coverUrl: r.cover_url,
  eventSlug: r.event_slug,
  tags: r.tags,
  publishedAt: r.published_at,
});

/** Yayındaki tüm içerik, en yeniden eskiye. */
async function loadPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(POSTS_CACHE_TAG);
  cacheLife("hours");
  const db = publicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("posts")
    .select(POST_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[içerik] okunamadı", error.code);
    return [];
  }
  return (data as PostRow[]).map(toPost);
}

export async function getPosts(kind: PostKind): Promise<Post[]> {
  return (await loadPosts()).filter((p) => p.kind === kind);
}

/** İçeriği olan bölümler (footer'da sadece bunların linki görünür). */
export async function getPostKindsWithContent(): Promise<PostKind[]> {
  const kinds = new Set((await loadPosts()).map((p) => p.kind));
  return (Object.keys(POST_KINDS) as PostKind[]).filter((k) => kinds.has(k));
}

/** Paragraflar boş satırla ayrılır */
export const paragraphs = (text: string | null) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
