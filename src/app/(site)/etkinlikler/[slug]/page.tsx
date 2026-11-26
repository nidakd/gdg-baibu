import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getEventBySlug, getEvents } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { openGraph } from "@/lib/seo";
import { EventDetail } from "./_components/event-detail";

export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/etkinlikler/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const description =
    event.tr?.summary ?? event.summary ?? `${formatDate(event.startsAt)} · ${event.venue ?? ""}`;
  return {
    title: event.title,
    description,
    openGraph: openGraph({
      title: event.title,
      description,
      path: `/etkinlikler/${event.slug}`,
      // Afiş yoksa sitenin genel paylaşım görseli kullanılır
      ...(event.coverUrl && { images: [{ url: event.coverUrl, alt: `${event.title} afişi` }] }),
    }),
  };
}

export default function EventPage({ params }: PageProps<"/etkinlikler/[slug]">) {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 md:py-20">
      <Link href="/etkinlikler" className="font-mono text-sm text-fg-muted hover:text-fg">
        ← cd ../etkinlikler
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <EventDetail params={params} />
      </Suspense>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[22rem_1fr]">
      <div className="aspect-square animate-pulse rounded-card border-2 border-border bg-surface" />
      <div className="space-y-4">
        <div className="h-12 w-3/4 animate-pulse rounded-xl bg-surface" />
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}
