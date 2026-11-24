// Üye formunun sabitleri (form ve sunucu işlemi ortak kullanır).

export const LINK_KEYS = ["linkedin", "github", "instagram", "website", "gdgCommunity"] as const;

export const LINK_LABELS: Record<(typeof LINK_KEYS)[number], string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  instagram: "Instagram",
  website: "Web sitesi",
  gdgCommunity: "GDG Community",
};

export const YEARS = ["1", "2", "3", "4", "5", "6", "mezun"];
export const ROLES = ["Organizer", "Co-Organizer", "Team Mentor", "Koordinatör", "Ekip Üyesi"];

/** Tanıtım yazısı için önerilen ve en çok uzunluk */
export const BIO_HINT = 400;
export const BIO_MAX = 1200;
