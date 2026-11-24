import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelNav } from "./_components/panel-nav";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false },
};

// Panel sayfaları çerez okur (oturum); hepsi bu Suspense'in içinde akar.
export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
      <Suspense fallback={<div className="h-12 animate-pulse rounded-full bg-surface" />}>
        <PanelNav />
      </Suspense>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-surface" />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
