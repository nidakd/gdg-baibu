# Marka Kuralları

Kaynak: [GDG On Campus Brand Guide](https://docs.google.com/presentation/d/1zAom30Vz9fQV2yyJP6BkC_Iogu1NWAiJSRI50RABTIo/edit).
Bu dosya sitede uyguladığımız kısmın özetidir.

## İsimlendirme

| Kullanım    | Doğru                                                            |
| ----------- | ---------------------------------------------------------------- |
| Tam ad      | Google Developer Group on Campus Abant İzzet Baysal University   |
| Kısa ad     | GDG on Campus Abant İzzet Baysal University / GDG on Campus AİBÜ |
| Organizatör | GDG on Campus Organizer                                          |
| Hashtag     | `#GDGOnCampus`                                                   |
| Kaçınılacak | Tek başına "GDG" (şehir GDG'leriyle karışır)                     |

## Fontlar

- **Google Sans**: ana yazı tipi. Başlıklarda kalın + normal karışımı, paragraflarda normal.
- **Google Sans Mono** (sitede Google Fonts'taki adıyla Google Sans Code): kısa satırlar,
  isimler, küçük ek bilgiler; "kod gibi" his için.

## Renkler

| Rol      | Mavi      | Yeşil     | Sarı      | Kırmızı   |
| -------- | --------- | --------- | --------- | --------- |
| Çekirdek | `#4285f4` | `#34a853` | `#f9ab00` | `#ea4335` |
| Halftone | `#57caff` | `#5cdb6d` | `#ffd427` | `#ff7daf` |
| Pastel   | `#c3ecf6` | `#ccf6c5` | `#ffe7a5` | `#f8d8d8` |

Gri tonlar: Off White `#f0f0f0`, Black 02 `#1e1e1e`.

### Sitede nasıl kullanıyoruz

Token'lar `src/styles/globals.css` içinde.

- Çekirdek renkler dolgu, şekil ve büyük başlıklar içindir (`bg-blue`, `bg-green`, ...).
  Küçük metinde açık zeminde okunmazlar.
- Küçük renkli metin için `*-ink` token'ları kullanılır (`text-blue-ink`). Açık temada aynı
  rengin koyu tonu, koyu temada halftone tonu; her ikisi de WCAG AA kontrastını geçer.
- Pasteller yumuşak yüzeyler ve rozetler içindir (`bg-blue-soft`); koyu temada koyu karşılıkları
  otomatik gelir.
- Renkli butonlarda yazı rengi beyaz değil `#1e1e1e` olmalı: beyaz yazı çekirdek renklerin
  hiçbirinde yeterli kontrast vermez.
- Açık tema zemini Off White, koyu tema zemini Black 02.

## Logolar

| Dosya                                               | Kullanım                                   |
| --------------------------------------------------- | ------------------------------------------ |
| `public/brand/gdg-on-campus-aibu-horizontal-*.png`  | Yatay logo: light, dark ve tek renk (blue) |
| `public/brand/gdg-on-campus-aibu-stacked-light.png` | Dikey logo, dar alanlar için               |
| `public/brand/gdg-mark.png`                         | Sadece simge                               |
| `src/app/icon.png`, `favicon.ico`, `apple-icon.png` | Tarayıcı ve telefon ikonları               |

Logolar topluluğun Drive klasöründeki resmî çizimlerden alındı. Header'daki logo
(`src/components/brand/logo.tsx`) açık temada `light`, koyu temada `dark` sürümü gösterir.

Yatay logo tercih edilir; yer darsa dikey (stacked) logo kullanılabilir.
