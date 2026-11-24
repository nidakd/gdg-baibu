// Katılım formunun sabitleri (form, sunucu işlemi ve panel ortak kullanır).

export const YEAR_LABELS: Record<string, string> = {
  hazirlik: "Hazırlık",
  "1": "1. sınıf",
  "2": "2. sınıf",
  "3": "3. sınıf",
  "4": "4. sınıf",
  "5": "5. sınıf",
  "6": "6. sınıf",
  "yuksek-lisans": "Yüksek lisans",
  mezun: "Mezun",
};

/** GitHub sorulan ekip */
export const GITHUB_TEAM = "software";

/** "kullanici", "@kullanici", "github.com/kullanici" ya da tam link → https://github.com/kullanici; geçersizse null */
export function normalizeGithub(input: string): string | null {
  const v = input
    .trim()
    .replace(/^@/, "")
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "")
    .replace(/\/+$/, "");
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(v) ? `https://github.com/${v}` : null;
}
