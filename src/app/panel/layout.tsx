import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelFeedback } from "./_components/panel-feedback";
import { PanelSidebar } from "./_components/panel-sidebar";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false },
};

// Panel sitenin çerçevesi olmadan, kendi sade yerleşiminde: solda menü, sağda içerik.
// Sayfalar çerez okur (oturum); hepsi Suspense içinde akar.
export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <div className="panel-ui min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <Suspense>
        <PanelFeedback />
      </Suspense>
      <Suspense fallback={<div className="h-14 bg-surface-2 lg:h-dvh" />}>
        <PanelSidebar />
      </Suspense>
      <main id="icerik" className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-surface" />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
