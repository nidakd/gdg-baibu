# GDG on Campus AİBÜ

Bolu Abant İzzet Baysal Üniversitesi Google Developer Group topluluğunun web sitesi ve yönetim paneli: biz kimiz, ne yapıyoruz, ekibimiz ve etkinliklerimiz.

```text
$ gdg init --campus aibu
✓ build  ✓ learn  ✓ ship
```

- Etkinlikler, kayıt ve QR ile yoklama
- Üyelik başvuruları
- Proje vitrini ve atölye kaynakları
- Duyurular
- Core team için yönetici paneli

Plan ve yol haritası: [docs/PLAN.md](docs/PLAN.md) · Marka kuralları: [docs/BRAND.md](docs/BRAND.md)

## Teknolojiler

Next.js · TypeScript · Tailwind CSS · GSAP / Framer Motion · Supabase · Vercel

## Geliştirme

Node.js 20.9 veya üzeri gerekir.

```bash
npm install
npm run dev
```

Site http://localhost:3000 adresinde açılır.

| Komut                 | Ne yapar                                             |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Geliştirme sunucusu                                  |
| `npm run build`       | Üretim derlemesi                                     |
| `npm run check`       | Lint, tip kontrolü ve format kontrolü                |
| `npm run format`      | Kodu Prettier ile biçimlendirir                      |
| `npm run sync:events` | Etkinlikleri GDG Community sayfasından yeniden çeker |

## Klasör yapısı

```text
content/              Başlangıç içeriği (JSON)
  site.json           Topluluk adı, tanıtım, sosyal linkler
  team.json           Ekipler ve core team üyeleri
  events.json         Etkinlikler (npm run sync:events ile üretilir)
docs/                 Plan ve marka kuralları
public/brand/         Logo dosyaları
scripts/              Yardımcı scriptler (içerik senkronu)
src/
  app/                Sayfalar ve route'lar; favicon ve ikonlar
  components/
    brand/            Logo ve logodan türetilen dekoratif şekiller
    events/           Etkinlik kartları
    layout/           Header, footer gibi sayfa iskeleti parçaları
    sections/         Birden fazla sayfada kullanılan bölümler (rakamlar, odak alanları)
    team/             Avatar ve üye kartları
    ui/               Genel arayüz parçaları (buton, kart, terminal, etiket)
  lib/                Veri okuma ve yardımcı fonksiyonlar
  styles/             Global CSS, tema token'ları, fontlar
```

Kurallar:

- `src/app/` içinde sadece route dosyaları (`page.tsx`, `layout.tsx`, ...) ve Next.js'in
  beklediği özel dosyalar durur; bileşenler `src/components/` altına gider.
- Bir bileşen tek bir sayfaya aitse o sayfanın klasöründe `_components/` altında durabilir.
- Görseller `public/` altında konusuna göre klasörlenir (`brand/`, `events/`, `team/`).
