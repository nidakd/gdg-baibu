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

Plan ve yol haritası: [docs/PLAN.md](docs/PLAN.md)

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

## İçerik

Başlangıç içeriği `content/` klasöründe: `site.json` (topluluk bilgileri), `team.json` (ekip),
`events.json` (etkinlikler).
