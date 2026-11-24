import type { Tone } from "@/components/ui/button";

/** Başvuru durum akışı: yeni → görüşüldü → kabul / red */
export const STATUSES: Record<string, { label: string; tone: Tone }> = {
  yeni: { label: "yeni", tone: "blue" },
  gorusuldu: { label: "görüşüldü", tone: "yellow" },
  kabul: { label: "kabul", tone: "green" },
  red: { label: "red", tone: "silver" },
};
