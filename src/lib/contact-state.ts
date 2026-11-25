// İletişim formunun durum tipi. Hem form (tarayıcı) hem sunucu tarafı kullanır.

/** Mesaj kuralları (sunucu kontrol eder, form sayacı da kullanır) */
export const CONTACT_MESSAGE = { min: 10, max: 3000, minWords: 2, maxLinks: 3 };

export type ContactField = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "ok" | "error";
  /** Genel hata (gönderilemedi vb.) */
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  /** Hata olunca form boşalmasın diye geri gönderilen değerler */
  values?: Partial<Record<ContactField, string>>;
};
