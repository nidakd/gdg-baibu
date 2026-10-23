const TZ = "Europe/Istanbul";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: TZ });

/** "17 Ekim 2026" */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** "Ekim 2026" */
export function formatMonth(iso: string): string {
  return monthFmt.format(new Date(iso));
}

/** Etkinliği sürüm etiketi gibi gösterir: "v2026.10" */
export function releaseTag(iso: string): string {
  return `v${iso.slice(0, 4)}.${iso.slice(5, 7)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr"))
    .join("");
}
