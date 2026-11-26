// Paylaşım (Open Graph / Twitter) için ortak ayarlar.
// Next.js metadata'yı üst düzey anahtar bazında birleştirir: bir sayfa `openGraph` verirse
// kökteki `openGraph` tamamen yerine geçer (app/opengraph-image görseli de dahil). Bu yüzden sayfalar
// `openGraph(...)` ile kurar; görsel verilmezse sitenin genel paylaşım görseli eklenir.

import type { Metadata } from "next";
import { getSite } from "./content";

const site = getSite();

/** Yayındaki adres. Önizleme dağıtımlarında da paylaşım linkleri yayındaki siteye gitsin. */
export const SITE_URL = site.url;

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export function openGraph(
  page: { title?: string; description?: string; path?: string } & Partial<OpenGraph> = {},
): OpenGraph {
  const { title, description, path, ...rest } = page;
  return {
    type: "website",
    locale: "tr_TR",
    siteName: site.shortName,
    title: title ? `${title} · ${site.shortName}` : site.shortName,
    description,
    url: path ?? "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.shortName }],
    ...rest,
  } as OpenGraph;
}
