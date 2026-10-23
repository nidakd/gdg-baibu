# GDG on Campus AİBÜ — Web Sitesi Planı

> Tema: **Build & Deploy**. Site bir kod editörü / terminal gibi akar; Google'ın dört rengi
> (mavi `#4285F4`, kırmızı `#EA4335`, sarı `#FBBC04`, yeşil `#34A853`) vurgu olarak kullanılır.

## 1. Amaç

Site iki soruya cevap verir: **biz kimiz** ve **ne yapıyoruz**. Bunun yanında topluluğun
günlük işini kolaylaştıran bir araçtır:

- Ziyaretçi ekibi tanır: kim hangi ekipte, ne yapıyor, nasıl ulaşılır.
- Geçmiş etkinliklerden (2024'ten bu yana 67 etkinlik) topluluğun ne ürettiği görünür.
- Etkinlik kaydı ve core team başvurusu şu an Google Forms ile yapılıyor; bunlar siteye taşınır,
  kayıtlar ve başvurular panelden takip edilir, kapıda QR ile yoklama alınır.
- Atölye slaytları, repo linkleri ve üye projeleri tek yerde arşivlenir.
- Duyurular panelden yayınlanır; kod bilgisi gerekmez.

## 2. Tema dili

Her bölüm bir geliştiricinin her gün gördüğü bir şeye benzer; metafor abartılmaz, okunabilirlik önce gelir.

| Bölüm | Görünüm |
| --- | --- |
| Hero | Terminalde yazılan `$ gdg init --campus aibu`, ardından "derlenip" açılan başlık |
| Bölüm başlıkları | `// 01 — biz kimiz` gibi kod yorumları, kenarda satır numaraları |
| Hakkımızda | `README.md` görünümünde topluluk hikâyesi + rakamlar (üye, etkinlik, konuşmacı) |
| Ekip | `team/` klasör ağacı: ekipler klasör, üyeler dosya; tıklayınca profil kartı açılır |
| Etkinlikler | `releases`: her etkinlik bir sürüm notu (`v2026.05 · CYBERFIRST`), etiketler `label` olarak |
| Etkinlik arşivi | Yıllara göre `git log --graph` benzeri zaman çizelgesi |
| Duyurular | Commit mesajı biçiminde kısa başlıklar, tıklayınca detay |
| Katıl | `git clone → npm install → deploy yourself` adımları + form |
| Panel girişi | `sudo login` |

Animasyonlar: yazılan terminal metni, bölüm açılışlarında build progress bar, scroll ile
dolan zaman çizelgesi, syntax highlight renginde hover'lar. `prefers-reduced-motion` açıkken sadeleşir.

## 3. Teknik altyapı

| Katman | Seçim | Neden |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | SEO, sunucu bileşenleri, Vercel ile doğal uyum |
| Stil | Tailwind CSS | Hızlı, tutarlı tasarım token'ları |
| Animasyon | GSAP (ScrollTrigger) + Framer Motion | Scroll ve geçiş animasyonları |
| Veritabanı + Giriş + Dosya | Supabase (Postgres, Auth, Storage, RLS) | Ücretsiz katman yeterli, satır bazlı güvenlik |
| Yayın | Vercel | Her PR'da önizleme linki |
| E-posta | Resend (ileride) | Kayıt onayı, QR bileti gönderimi |

## 4. Sayfalar

**Herkese açık**

- `/` — Ana sayfa: hero, biz kimiz, odak alanları, yaklaşan etkinlik, ekipten kesit, katıl
- `/hakkimizda` — topluluğun hikâyesi, ne yapıyoruz, rakamlar, ekipler ve görevleri
- `/ekip`, `/ekip/[slug]` — tüm core team, ekiplere göre; kişi sayfasında kısa bio, ekip, linkler
- `/etkinlikler`, `/etkinlikler/[slug]` — yaklaşan + arşiv, detay, kayıt formu
- `/biletim/[kod]` — katılımcının QR bileti
- `/projeler`, `/projeler/[slug]`
- `/kaynaklar` — atölye slaytları, repo ve kayıt linkleri
- `/duyurular`, `/duyurular/[slug]`
- `/katil` — core team başvurusu / iletişim formu
- `/giris` — panel girişi

**Yönetici paneli** (`/panel`, sadece yetkili hesaplar)

- Özet: yaklaşan etkinlik, yeni başvuru, son kayıt sayıları
- Etkinlikler: oluştur/düzenle, kontenjan, kayıt listesi, CSV dışa aktarma, GDG Community'den içe aktarma
- Yoklama: telefon kamerasıyla QR okutma ekranı
- Başvurular: durum akışı `yeni → görüşüldü → kabul / red`, not ekleme
- Ekip, projeler, kaynaklar, duyurular: içerik yönetimi
- Kullanıcılar ve roller (sadece `admin`)

## 5. Yetkilendirme

- Hesaplar **sadece admin tarafından** açılır; herkese açık kayıt yok.
- Roller: `admin` (başkan + mentor) ve ileride eklenecek `editor`.
- `editor` içerik düzenler; kullanıcı/rol yönetimi ve silme sadece `admin`'de.
- Kurallar Supabase RLS ile veritabanı seviyesinde uygulanır, sadece arayüzde değil.

## 6. Veri

### Başlangıç içeriği (`content/`)

| Dosya | Kaynak |
| --- | --- |
| `site.json` | Topluluk adı, tanıtım, sosyal linkler (Instagram, Linktree) |
| `team.json` | GDG Community organizatör listesi: 14 kişi, 6 ekip |
| `events.json` | GDG Community API: 67 etkinlik (`node scripts/sync-gdg-community.mjs` ile yenilenir) |

Supabase kurulunca bu dosyalar veritabanına seed olarak aktarılır; sonrasında içerik panelden yönetilir.

### Veritabanı modeli (taslak)

```text
profiles        id (auth.users), full_name, role [admin|editor], created_at
teams           id, slug, name, description, sort_order
team_members    id, slug, full_name, team_id, role, photo_url, bio, links{}, sort_order, active
events          id, slug, title, summary, body, cover_url, starts_at, ends_at, format,
                venue, capacity, registration_open, tags[], source_url, status [draft|published]
event_speakers  id, event_id, name, title, company, photo_url
registrations   id, event_id, full_name, email, student_no?, department?,
                ticket_code (unique), checked_in_at?, created_at
applications    id, kind [core_team|question], full_name, email, student_no?,
                department?, interests[], message, status, notes, created_at
projects        id, slug, title, summary, body, cover_url, repo_url, demo_url, tags[], authors[], status
resources       id, title, kind [slides|repo|video|doc], url, event_id?, tags[]
posts           id, slug, title, excerpt, body, cover_url, published_at, status
```

## 7. Yol haritası

| Adım | İçerik | Çıktı |
| --- | --- | --- |
| 0 | Plan, repo, başlangıç içeriği | Bu doküman + `content/` |
| 1 | Next.js iskeleti, Tailwind, tema token'ları, font, lint | Boş ama çalışan site, Vercel önizleme |
| 2 | Ana sayfa + hakkımızda + ekip sayfaları (JSON içerikle) | Biz kimiz sorusu cevaplanır |
| 3 | Etkinlik listesi, arşiv zaman çizelgesi, etkinlik detayı | 67 etkinlik sitede |
| 4 | Supabase şeması, RLS, seed, giriş, panel iskeleti | `/giris`, `/panel` |
| 5 | Etkinlik kaydı + QR bilet + yoklama | Google Forms yerine site |
| 6 | Core team başvuruları | `/katil` + panelde takip |
| 7 | Projeler, kaynaklar, duyurular, ekip yönetimi | İçerik panelden yönetilir |
| 8 | SEO, Open Graph görselleri, erişilebilirlik, performans | Yayına hazır |
| 9 | Alan adı, yayın | Canlı site |

Her özellik kendi commit'i olarak, her adım ayrı bir branch + PR olarak ilerler.

## 8. Eksik içerik

- [ ] Logo dosyası (SVG tercih)
- [ ] Topluluğun kendi ağzından kısa hikâyesi: ne zaman, kim tarafından, neden kuruldu
- [ ] Ekiplerin tek cümlelik görev tanımları
- [ ] Ekip üyeleri için kısa bio ve isteğe bağlı LinkedIn / GitHub linkleri
- [ ] Etkinlik fotoğrafları (GDG Community'de sadece 2 etkinlikte fotoğraf var)
- [ ] Başkanın e-posta adresi (admin hesabı için)
- [ ] Alan adı tercihi
