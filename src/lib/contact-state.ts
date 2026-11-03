// İletişim formunun durum tipi. Hem form (tarayıcı) hem sunucu tarafı kullanır.

export type ContactField = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "ok" | "error";
  /** Genel hata (gönderilemedi vb.) */
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  /** Hata olunca form boşalmasın diye geri gönderilen değerler */
  values?: Partial<Record<ContactField, string>>;
};
