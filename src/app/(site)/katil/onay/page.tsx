import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmForm } from "./confirm-form";

export const metadata: Metadata = {
  title: "E-posta adresini doğrula",
  robots: { index: false, follow: false },
};

export default function ConfirmPage({ searchParams }: PageProps<"/katil/onay">) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6 md:py-20">
      <p className="font-mono text-sm text-fg-subtle">{"// git commit --verify"}</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">E-posta adresini doğrula</h1>
      <Suspense>
        <WithToken searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function WithToken({ searchParams }: Pick<PageProps<"/katil/onay">, "searchParams">) {
  const { t } = await searchParams;
  return <ConfirmForm token={typeof t === "string" ? t : ""} />;
}
