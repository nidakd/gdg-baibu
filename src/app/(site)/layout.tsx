import { SiteShell } from "@/components/layout/site-shell";

// Sitenin herkese açık sayfaları. Panel ve giriş sayfası bu grubun dışında, kendi sade yerleşimleriyle.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
