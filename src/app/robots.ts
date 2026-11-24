import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Panel ve giriş sayfaları aramada çıkmasın
    rules: { userAgent: "*", allow: "/", disallow: ["/panel", "/giris", "/auth"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
