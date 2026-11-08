import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

// Telefonda "ana ekrana ekle" için ad, renk ve simge.
export default function manifest(): MetadataRoute.Manifest {
  const site = getSite();
  return {
    name: site.name,
    short_name: "GDG AİBÜ",
    description: `${site.university} Google Developer Group topluluğu.`,
    start_url: "/",
    display: "standalone",
    lang: "tr",
    background_color: "#f0f0f0",
    theme_color: "#1e1e1e",
    icons: [
      { src: "/icon.png", type: "image/png", sizes: "512x512" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
