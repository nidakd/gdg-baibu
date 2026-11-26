import type { Metadata } from "next";
import { PostsPage } from "@/components/posts/posts-page";
import { POST_KINDS } from "@/lib/posts";
import { openGraph } from "@/lib/seo";

const { plural: title, description, path } = POST_KINDS.duyuru;

export const metadata: Metadata = {
  title,
  description,
  openGraph: openGraph({ title, description, path }),
};

export default function Page() {
  return <PostsPage kind="duyuru" />;
}
