// Odak alanları ve hangi GDG Community etiketlerini kapsadıkları.
// Veri içermez; hem sunucuda hem tarayıcıda (etkinlik filtresi) kullanılabilir.

import type { Tone } from "@/components/ui/button";

export type FocusAreaDef = {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  tags: string[];
};

export const focusAreas: FocusAreaDef[] = [
  {
    id: "ai",
    title: "Yapay zekâ ve Gemini",
    description: "Build with AI atölyeleri, Gemini ve AI Studio ile uygulama geliştirme.",
    tone: "blue",
    tags: ["AI", "AI - Gemini", "Build with AI"],
  },
  {
    id: "career",
    title: "Kariyer",
    description: "Staj, sektör ve kariyer buluşmaları; deneyimli isimlerle söyleşiler.",
    tone: "green",
    tags: ["Career Development"],
  },
  {
    id: "workshop",
    title: "Atölyeler",
    description:
      "Python, Arduino, Git gibi konularda elini klavyeye koyduğun uygulamalı oturumlar.",
    tone: "yellow",
    tags: ["Workshop / hands-on session"],
  },
  {
    id: "build",
    title: "Hackathon ve jam",
    description: "Fikirden prototipe: takım kurup kısa sürede bir şey üretmek.",
    tone: "red",
    tags: ["Hackathon"],
  },
  {
    id: "platforms",
    title: "Mobil, web ve bulut",
    description: "Flutter, Firebase, Android, web ve Google Cloud üzerine teknik içerikler.",
    tone: "blue",
    tags: ["Android", "Flutter", "Firebase", "Web", "Google Cloud"],
  },
  {
    id: "community",
    title: "Topluluk",
    description: "Coffee Talk, oyun ve film geceleri, stantlar: tanışmak için bahaneler.",
    tone: "green",
    tags: ["Community Building", "Networking"],
  },
];

export function inArea(tags: string[], area: FocusAreaDef): boolean {
  return tags.some((t) => area.tags.includes(t));
}

/** Etkinliğin rengini belirleyen ilk eşleşen odak alanı. */
export function primaryArea(tags: string[]): FocusAreaDef | undefined {
  // Sıra önemli: neredeyse her etkinlikte olan "Topluluk" en sonda
  return focusAreas.find((a) => inArea(tags, a));
}
