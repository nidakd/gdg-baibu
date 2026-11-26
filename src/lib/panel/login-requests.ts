// Cihazlar arası giriş yardımcıları (sadece sunucu). Akış:
// 1. /giris'te bağlantı istenir → bu tarayıcıya bekleyen-giriş çerezi, e-postaya onay bağlantısı.
// 2. E-postadaki bağlantı hangi cihazda açılırsa açılsın /giris/onay sadece onay verir
//    (başka cihazdaysa iki ekrandaki sayı eşleşmeli).
// 3. Bekleyen tarayıcı birkaç saniyede bir sorar; onay gelince oturum o tarayıcıda açılır.

import { createHash, randomBytes, randomInt } from "node:crypto";

export const PENDING_COOKIE = "giris_bekleyen";
export const REQUEST_TTL_MS = 15 * 60 * 1000;

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newSecret = () => randomBytes(32).toString("base64url");
export const newCode = () => String(randomInt(10, 100));

/** Çerez "id.anahtar" biçiminde; bozuksa null */
export function parsePending(value: string | undefined): { id: string; secret: string } | null {
  const m = value?.match(/^([0-9a-f-]{36})\.([A-Za-z0-9_-]{20,})$/);
  return m ? { id: m[1], secret: m[2] } : null;
}

/** Onay ekranında "Mac · Chrome" gibi kısa bir tanım */
export function describeDevice(ua: string | null): string {
  if (!ua) return "Bilinmeyen cihaz";
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/.test(ua)
          ? "Mac"
          : /Windows/.test(ua)
            ? "Windows"
            : /Linux/.test(ua)
              ? "Linux"
              : "Bilinmeyen sistem";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /CriOS|Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "tarayıcı";
  return `${os} · ${browser}`;
}

/** 0–99 arası, doğru sayıyla birlikte üç farklı seçenek (karışık sırada) */
export function codeChoices(code: string): string[] {
  const set = new Set([code]);
  while (set.size < 3) set.add(String(randomInt(10, 100)));
  return [...set].sort(() => randomInt(0, 3) - 1);
}
