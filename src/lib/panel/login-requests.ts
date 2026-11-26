// Cihazlar arası giriş yardımcıları (sadece sunucu). Akış:
// 1. /giris'te bağlantı istenir → bu tarayıcıya bekleyen-giriş çerezi, e-postaya onay bağlantısı.
// 2. E-postadaki bağlantı hangi cihazda açılırsa açılsın /giris/onay sadece onay verir
//    (başka cihazdaysa iki ekrandaki sayı eşleşmeli).
// 3. Bekleyen tarayıcı birkaç saniyede bir sorar; onay gelince oturum o tarayıcıda açılır.

import { createHash, randomBytes, randomInt } from "node:crypto";

export const PENDING_COOKIE = "giris_bekleyen";
export const REQUEST_TTL_MS = 15 * 60 * 1000;
/** Aynı tarayıcıdan "yeniden gönder" en erken bu kadar sonra */
export const RESEND_AFTER_MS = 60 * 1000;
/** Aynı adrese: dakikada 1, saatte 5 e-posta (fazlası sessizce gönderilmez) */
export const LIMIT_PER_MINUTE = 1;
export const LIMIT_PER_HOUR = 5;
/** Başarılı girişler "Son girişler" için bu kadar saklanır; diğer istekler bir gün */
export const KEEP_LOGINS_DAYS = 90;

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newSecret = () => randomBytes(32).toString("base64url");
export const newCode = () => String(randomInt(10, 100));

export type Pending = {
  id: string;
  secret: string;
  /** Ekranda gösterilen eşleştirme sayısı */
  code: string;
  /** İsteğin zamanı (ms); geri sayım ve yeniden gönder için */
  at: number;
  email: string;
  next: string;
};

/**
 * Çerez: id.anahtar.sayı.zaman.e-posta.sonra (son ikisi base64url). Sayı ve e-posta çerezde durur,
 * çünkü panelde olmayan adresler için veritabanında satır yok; sayfa yenilense de ekran aynı kalır.
 */
export function encodePending(p: Pending): string {
  const b = (s: string) => Buffer.from(s).toString("base64url");
  return [p.id, p.secret, p.code, p.at, b(p.email), b(p.next)].join(".");
}

/** Bozuk ya da eski biçimli çerezse null */
export function parsePending(value: string | undefined): Pending | null {
  const m = value?.match(
    /^([0-9a-f-]{36})\.([A-Za-z0-9_-]{20,})\.([0-9]{2})\.([0-9]{13})\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/,
  );
  if (!m) return null;
  const s = (x: string) => Buffer.from(x, "base64url").toString();
  return { id: m[1], secret: m[2], code: m[3], at: Number(m[4]), email: s(m[5]), next: s(m[6]) };
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
