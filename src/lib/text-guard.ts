// Formlardaki serbest metin alanlarının kuralları (ad, bölüm, mesaj). Sunucu tarafında çalışır;
// hata varsa kullanıcıya gösterilecek cümleyi, yoksa null döner.

/** Ad soyadda izin verilenler: harf (her alfabe), birleşik işaretler, boşluk, kesme, tire, nokta */
const NAME_CHARS = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
/** Bölüm adı: harf, rakam, boşluk ve birkaç noktalama (ör. "Bilgisayar Müh. (İng.)", "Fizik & Kimya") */
const DEPT_CHARS = /^[\p{L}\p{M}][\p{L}\p{M}\p{N} .,'’&()/-]*$/u;
const VOWELS = /[aeıioöuüâîûéèáíóúyAEIİOÖUÜÂÎÛÉÈÁÍÓÚY]/gu;
const LETTERS = /\p{L}/gu;
const URLS = /\b(?:https?:\/\/|www\.)\S+/giu;

const count = (s: string, re: RegExp) => s.match(re)?.length ?? 0;

/**
 * Klavyeye rastgele basılmış gibi duran metin: aynı parçanın üst üste tekrarı ("ldldldld"),
 * boşluksuz çok uzun kelime, sesli harfi hiç ya da neredeyse hiç olmayan yazı.
 * Linkler ve e-postalar sayılmaz.
 */
export function looksLikeGibberish(text: string): boolean {
  const s = text.replace(URLS, " ").replace(/\S+@\S+/g, " ");
  // Aynı parça art arda tekrar: 1-2 harf 4+ kez ("hahaha" serbest), 3-8 harf 3+ kez ("asdasdasd")
  if (/(\p{L}{1,2})\1{3,}/iu.test(s) || /(\p{L}{3,8})\1{2,}/iu.test(s)) return true;
  // Türkçede de İngilizcede de 25 harften uzun kelime neredeyse yok
  if (s.split(/\s+/).some((w) => count(w, LETTERS) > 25)) return true;
  const letters = count(s, LETTERS);
  if (letters >= 4) {
    const ratio = count(s, VOWELS) / letters;
    // Normal yazıda sesli harf oranı ~%35-45; Latin dışı alfabelerde bu ölçü işe yaramaz
    const latin = count(s, /[A-Za-zÇĞİÖŞÜçğıöşü]/g) / letters > 0.8;
    if (latin && ratio < 0.2) return true;
  }
  return false;
}

/** "Ad Soyad" kontrolü. `fullName` açıksa en az iki kelime ister. */
export function checkName(raw: string, { fullName = false } = {}): string | null {
  const name = raw.trim();
  if (name.length < 2) return fullName ? "Adını ve soyadını yaz." : "Adını yaz.";
  if (name.length > 80) return "Ad 80 karakteri geçmesin.";
  if (!NAME_CHARS.test(name)) return "Adda sadece harf, boşluk, kesme ve tire olabilir.";
  const words = name.split(" ").filter((w) => count(w, LETTERS) > 0);
  if (fullName && words.length < 2) return "Adını ve soyadını birlikte yaz.";
  if (words.length > 6) return "Bu bir ad soyad gibi durmuyor.";
  if (looksLikeGibberish(name) || words.some((w) => count(w, LETTERS) > 20))
    return "Bu bir ad soyad gibi durmuyor.";
  return null;
}

/** Bölüm adı (zorunlu). */
export function checkDepartment(raw: string): string | null {
  const dept = raw.trim();
  if (count(dept, LETTERS) < 2) return "Bölümünü yaz (ör. Bilgisayar Mühendisliği).";
  if (dept.length > 120) return "Bölüm adı çok uzun.";
  if (!DEPT_CHARS.test(dept)) return "Bölüm adında harf, rakam ve birkaç noktalama olabilir.";
  if (looksLikeGibberish(dept)) return "Bu bir bölüm adı gibi durmuyor.";
  return null;
}

/** Serbest mesaj: uzunluk, kelime sayısı, link sayısı, büyük harf ve anlamsız yazı kontrolü. */
export function checkMessage(
  text: string,
  {
    min,
    max,
    minWords,
    maxLinks,
  }: { min: number; max: number; minWords: number; maxLinks: number },
): string | null {
  if (text.length < min) return `Biraz daha anlat, en az ${min} karakter.`;
  if (text.length > max) return `Mesaj ${max} karakteri geçmesin.`;
  const words = text.split(/\s+/).filter((w) => count(w, LETTERS) > 0);
  if (words.length < minWords) return `Birkaç cümleyle anlat, en az ${minWords} kelime.`;
  if (count(text, URLS) > maxLinks) return `En fazla ${maxLinks} link ekleyebilirsin.`;
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (letters.length > 20 && letters === letters.toLocaleUpperCase("tr"))
    return "Hepsi büyük harf olmasın, normal yazarsan daha rahat okuruz.";
  if (looksLikeGibberish(text))
    return "Bu metin rastgele yazılmış gibi duruyor, kendi cümlelerinle yaz.";
  return null;
}
