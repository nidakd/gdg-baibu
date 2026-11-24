import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false },
};

// Hiçbir rotaya uymayan adresler: kök yerleşimde site çerçevesi yok, burada eklenir.
export default function NotFound() {
  return (
    <SiteShell names={false}>
      <NotFoundContent />
    </SiteShell>
  );
}
