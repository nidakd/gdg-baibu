import Link from "next/link";
import type { ReactNode } from "react";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { requirePanelUser } from "@/lib/panel/auth";

export const metadata = { title: "Panel rehberi" };

/** Ekip için kısa kullanım rehberi. Bölümler kenar menüsüyle aynı sırada. */
export default async function Guide() {
  const { user } = await requirePanelUser("/panel/rehber");
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel rehberi</h1>
        <p className="text-fg-muted">
          Sitedeki her şey kod bilmeden buradan değişir. Kaydettiğin şey sitede birkaç saniye içinde
          görünür. Sen <strong>{user.role === "admin" ? "admin" : "editör"}</strong> olarak girdin.
        </p>
      </header>

      <Topic title="Giriş ve roller">
        <p>
          Şifre yok: giriş sayfasına e-postanı yaz, gelen e-postadaki bağlantıyı aç (telefonda da
          olur), iki ekranda aynı sayıyı seç. Giriş, bağlantıyı istediğin tarayıcıda açılır.
        </p>
        <p>
          <strong>Editör</strong>: ekip, etkinlik, fotoğraf, içerik, başvuru ve mesajlarla çalışır.{" "}
          <strong>Admin</strong>: ayrıca siler, site ayarlarını ve kullanıcıları yönetir, değişiklik
          geçmişini ve girişleri görür.
        </p>
      </Topic>

      <Topic title="Ekip" href="/panel/ekip">
        <p>
          Üye ekle, düzenle, fotoğraf yükle (kare, en çok 4 MB). Ayrılan üyeyi silme,{" "}
          <em>pasife al</em>: sitede görünmez ama kaydı kalır. Tanıtım yazısı ~400 karakteri
          geçmesin. Sıra küçükten büyüğe dizilir.
        </p>
      </Topic>

      <Topic title="Etkinlikler" href="/panel/etkinlikler">
        <p>
          GDG Community&apos;deki etkinlikler her pazartesi kendiliğinden gelir; onları orada
          düzenle. Orada olmayan etkinlik (atölye, iç toplantı) için <em>+ Yeni etkinlik</em>:
          taslak kaydet, hazır olunca <em>Sitede yayınla</em>yı işaretle.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Kayıt</strong>: kayıt nerede alınsın? GDG Community (varsayılan; GDG programı
            katılımı oradan sayar), sitede form ya da kapalı. Kontenjan dolunca form kapanır.
            Katılımcı listesi, iptal ve CSV (Excel) burada.
          </li>
          <li>
            <strong>Fotoğraflar</strong>: birden çok seç, kendiliğinden küçülür. Her kareye ne
            göründüğünü kısaca yaz; en iyi 1–2 kareyi <em>ana sayfa şeridinde göster</em>. Yüzü net
            görünenlerin iznini al.
          </li>
          <li>
            <strong>Koordinatör</strong>: etkinliği kimin yürüttüğü; sadece panelde görünür.
          </li>
        </ul>
      </Topic>

      <Topic title="Başvurular" href="/panel/basvurular">
        <p>
          /katil formundan gelenler; her biri kulüp e-postasına da düşer. Yanıtı e-postadan yaz,
          durumu burada işaretle (yeni → görüşüldü → kabul / red) ve not ekle. Üstteki{" "}
          <em>Başvuru dönemi</em> kutusundan formu kapatıp açabilirsin.
        </p>
      </Topic>

      <Topic title="Mesajlar" href="/panel/mesajlar">
        <p>İletişim formundan gelenler. Yanıt kulüp e-postasından verilir.</p>
      </Topic>

      <Topic title="İçerik" href="/panel/icerik">
        <p>
          Duyurular, projeler ve kaynaklar (atölye slaytı, kayıt, örnek kod). Bir türde yayında
          içerik olunca o sayfa sitenin alt menüsünde görünür. Kaynağı ilgili etkinliğe
          bağlayabilirsin.
        </p>
      </Topic>

      {user.role === "admin" && (
        <>
          <Topic title="Site ayarları" href="/panel/ayarlar">
            <p>
              Tanıtım metni ve sosyal bağlantılar. Bir alanı boşaltırsan varsayılana döner. Topluluk
              üye sayısı GDG Community&apos;den kendiliğinden güncellenir.
            </p>
          </Topic>
          <Topic title="Kullanıcılar, geçmiş, girişler" href="/panel/kullanicilar">
            <p>
              Panele kişi ekle (davet e-postası gider), rol değiştir, erişimi kaldır. Değişiklik
              geçmişinde kimin neyi ne zaman değiştirdiği, Son girişler&apos;de giriş denemeleri (90
              gün) görünür.
            </p>
          </Topic>
          <Topic title="Yedek">
            <p>
              Veritabanı her pazar GitHub Actions&apos;ta şifreli yedeklenir (&quot;Veritabanı
              yedeği&quot;, 90 gün). Açmak için yedek parolası gerekir; parola Nida&apos;da.
              Fotoğraf dosyaları yedekte yok, Supabase Storage&apos;da duruyor.
            </p>
          </Topic>
        </>
      )}

      <Topic title="Kişisel veriler">
        <p>
          Başvuru, kayıt ve mesajlardaki bilgileri sadece amacı için kullan, panelden dışarı
          (WhatsApp grubu, ekran görüntüsü) taşıma. Kuralların tamamı sitenin{" "}
          <a href="/gizlilik" target="_blank" className="underline">
            gizlilik sayfasında
          </a>
          .
        </p>
      </Topic>
    </div>
  );
}

function Topic({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  return (
    <PanelBox
      title={title}
      meta={
        href && (
          <Link href={href} className="underline">
            aç →
          </Link>
        )
      }
    >
      <div className="space-y-3 p-5 leading-relaxed">{children}</div>
    </PanelBox>
  );
}
