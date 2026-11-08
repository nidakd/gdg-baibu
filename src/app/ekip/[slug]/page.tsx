import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMemberBySlug, getMembers } from "@/lib/content";
import { MemberProfile } from "./_components/member-profile";
import { openGraph } from "@/lib/seo";

export function generateStaticParams() {
  return getMembers().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/ekip/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const member = getMemberBySlug(slug);
  if (!member) notFound();
  const description = `${member.name}, ${member.team.name} · ${member.role}`;
  return {
    title: member.name,
    description,
    openGraph: openGraph({ title: member.name, description, path: `/ekip/${member.slug}` }),
  };
}

export default function MemberPage({ params }: PageProps<"/ekip/[slug]">) {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 md:py-20">
      <Link href="/ekip" className="font-mono text-sm text-fg-muted hover:text-fg">
        ← cd ../ekip
      </Link>
      <Suspense fallback={<ProfileSkeleton />}>
        <MemberProfile params={params} />
      </Suspense>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="h-96 animate-pulse rounded-card border-2 border-border bg-surface" />
      <div className="h-48 animate-pulse rounded-card border-2 border-border bg-surface" />
    </div>
  );
}
