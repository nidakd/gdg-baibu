// Sayfanın ne kadarının okunduğunu gösteren, ekranın en üstüne yapışık ince çubuk.
// Header sayfayla birlikte yukarı kayıp gider; aşağıda sadece bu çubuk kalır.
// Tamamen CSS: scroll'a bağlı animasyon (animation-timeline) desteklenmiyorsa gizli kalır.

export function ScrollProgress() {
  return (
    <div
      aria-hidden
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-1"
      style={{
        background:
          "linear-gradient(90deg, var(--brand-blue) 0 25%, var(--brand-red) 25% 50%, var(--brand-yellow) 50% 75%, var(--brand-green) 75%)",
      }}
    />
  );
}
