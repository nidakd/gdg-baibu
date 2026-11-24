import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false },
};

// Site sayfalarının içinden notFound(): çerçeve (site) yerleşiminden gelir.
export default function SiteNotFound() {
  return <NotFoundContent />;
}
