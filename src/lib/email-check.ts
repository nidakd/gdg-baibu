// E-posta adresinin gerçek olma ihtimalini gönderim yapmadan kontrol eder:
// biçim, sık yazım hataları, tek kullanımlık servisler ve alan adının e-posta alıp alamadığı (MX).
// Adresin sahibinin gerçekten o kişi olduğunu sadece onay bağlantısı kanıtlar (katil/actions.ts).

import { resolve4, resolve6, resolveMx } from "node:dns/promises";
import { EMAIL } from "./form-guard";

/** Geçici / tek kullanımlık e-posta servisleri (en yaygınları) */
const DISPOSABLE = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mailbox.com",
  "anonbox.net",
  "burnermail.io",
  "byom.de",
  "discard.email",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemail.net",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "harakirimail.com",
  "inboxkitten.com",
  "incognitomail.org",
  "mail-temp.com",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailinator.net",
  "mailnesia.com",
  "mailpoof.com",
  "mailsac.com",
  "mailtemp.net",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "mytemp.email",
  "nada.email",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "temp-mail.io",
  "temp-mail.org",
  "tempail.com",
  "tempmail.com",
  "tempmail.dev",
  "tempmail.net",
  "tempmail.plus",
  "tempmailo.com",
  "tempr.email",
  "throwam.com",
  "throwawaymail.com",
  "tmail.ws",
  "tmpmail.net",
  "tmpmail.org",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "wegwerfmail.de",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

/** Sık yapılan yazım hataları → doğrusu */
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.com.tr": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
  "iclod.com": "icloud.com",
  "protonmail.co": "protonmail.com",
  "proton.com": "proton.me",
};

// Alan adı sonuçları bellekte tutulur (sunucu örneği başına)
const mxCache = new Map<string, { ok: boolean; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

const withTimeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);

/** Alan adı e-posta alabiliyor mu? DNS'e ulaşılamazsa (zaman aşımı vb.) iyi niyetle true. */
async function domainAcceptsMail(domain: string): Promise<boolean> {
  const cached = mxCache.get(domain);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.ok;
  let ok = true;
  try {
    const mx = await withTimeout(resolveMx(domain), 3000);
    // "Null MX" (RFC 7505): alan adı e-posta almadığını açıkça söylüyor
    ok = mx.some((r) => r.exchange && r.exchange !== ".");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      // MX yoksa e-posta alan adının kendisine gider (RFC 5321); o da yoksa adres olamaz
      const [a, aaaa] = await Promise.allSettled([
        withTimeout(resolve4(domain), 3000),
        withTimeout(resolve6(domain), 3000),
      ]);
      ok = a.status === "fulfilled" || aaaa.status === "fulfilled";
    }
  }
  mxCache.set(domain, { ok, at: Date.now() });
  return ok;
}

/** E-posta için hata cümlesi ya da null. */
export async function checkEmail(raw: string): Promise<string | null> {
  const email = raw.trim();
  if (!EMAIL.test(email) || email.length > 200) return "Bu e-posta adresi olmadı.";
  const domain = email.split("@")[1].toLowerCase();
  if (TYPOS[domain]) return `Yazım hatası olabilir: @${TYPOS[domain]} mi demek istedin?`;
  if (DISPOSABLE.has(domain))
    return "Geçici e-posta adresleri kabul edilmiyor, sürekli kullandığın adresini yaz.";
  if (!(await domainAcceptsMail(domain)))
    return `@${domain} e-posta alabilen bir adres değil, kontrol eder misin?`;
  return null;
}
