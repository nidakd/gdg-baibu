const TZ = "Europe/Istanbul";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const longDateFmt = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const timeFmt = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: TZ });

/** "17 Ekim 2026" */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** "17 Ekim 2026 Cumartesi" */
export function formatDateLong(iso: string): string {
  return longDateFmt.format(new Date(iso));
}

/** "12:00–16:00"; farklı günlere yayılıyorsa bitiş tarihini de yazar. */
export function formatTimeRange(startIso: string, endIso: string): string {
  const start = timeFmt.format(new Date(startIso));
  const end = timeFmt.format(new Date(endIso));
  return startIso.slice(0, 10) === endIso.slice(0, 10)
    ? `${start}–${end}`
    : `${start} – ${formatDate(endIso)} ${end}`;
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
