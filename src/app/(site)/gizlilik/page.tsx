import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getSite } from "@/lib/content";
import { openGraph } from "@/lib/seo";

// KVKK (6698 sayılı Kanun) md. 10 aydınlatma metni. İçerik değişince UPDATED tarihini güncelle.
// Saklama süreleri burada yazıldığı gibi uygulanmalı (panelden ya da zamanlanmış silme ile).

const UPDATED = "26 Kasım 2026";

const description =
  "GDG on Campus AİBÜ sitesindeki formlarda hangi kişisel verilerin, hangi amaçla toplandığı, ne kadar saklandığı ve haklarınız.";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK aydınlatma metni",
  description,
  openGraph: openGraph({ title: "Gizlilik", description, path: "/gizlilik" }),
};

const records = [
  {
    what: "İletişim formu",
    data: "Ad, e-posta adresi, mesaj",
    why: "Mesajınıza yanıt vermek",
    basis: "Bir talebin karşılanması için gerekli olması ve meşru menfaat (md. 5/2-c, f)",
    keep: "1 yıl",
  },
  {
    what: "Aramıza katıl başvurusu",
    data: "Ad, e-posta, bölüm, sınıf, ilgilenilen ekipler, GitHub (isteğe bağlı), kendinizle ilgili yazdıklarınız",
    why: "Başvuruyu değerlendirmek, size dönmek, e-posta adresini doğrulamak",
    basis: "Açık rızanız (md. 5/1) — formdaki onay kutusu",
    keep: "Başvurunun yapıldığı eğitim-öğretim dönemi sonuna kadar; kabul edilirseniz ekipte olduğunuz süre",
  },
  {
    what: "Yönetim paneli girişi (yalnız ekip)",
    data: "E-posta, giriş zamanı, tarayıcı ve cihaz türü",
    why: "Panel güvenliği, yetkisiz girişleri fark etmek",
    basis: "Meşru menfaat (md. 5/2-f)",
    keep: "90 gün",
  },
  {
    what: "Site ziyareti",
    data: "Sayfa, ülke, cihaz ve tarayıcı türü (anonim, çerezsiz); bot korumasının tarayıcı sinyalleri",
    why: "Hangi sayfaların okunduğunu görmek, formları spam'den korumak",
    basis: "Meşru menfaat (md. 5/2-f)",
    keep: "Hizmet sağlayıcının süresi (en fazla 1 yıl)",
  },
];

const processors = [
  {
    name: "Vercel",
    role: "sitenin barındırılması, anonim ziyaret istatistiği, bot koruması",
    where: "ABD",
  },
  {
    name: "Supabase",
    role: "form kayıtları ve ekip verisinin tutulduğu veritabanı",
    where: "Almanya (Frankfurt)",
  },
  {
    name: "Google (Gmail)",
    role: "kulüp e-posta kutusu; bildirim ve doğrulama e-postaları",
    where: "ABD ve AB",
  },
  {
    name: "Resend",
    role: "iletişim formu mesajlarının kulüp e-postasına iletilmesi",
    where: "ABD",
  },
];

export default function PrivacyPage() {
  const site = getSite();
  return (
    <article className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 md:py-20">
      <header className="space-y-4">
        <p className="font-mono text-sm text-fg-subtle">{`// gizlilik · son güncelleme ${UPDATED}`}</p>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Gizlilik ve KVKK aydınlatma metni
        </h1>
        <p className="text-lg text-fg-muted">
          Kısaca: sadece formlara kendi yazdıklarınızı topluyoruz, reklam ya da takip çerezi
          kullanmıyoruz, verilerinizi satmıyor ve pazarlama için kimseyle paylaşmıyoruz. Ayrıntılar
          aşağıda.
        </p>
      </header>

      <Block title="Veri sorumlusu">
        <p>
          Bu site {site.name} ({site.shortName}) öğrenci topluluğunundur. 6698 sayılı Kişisel
          Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu, topluluğun yönetim ekibidir.
          İletişim: <Mail email={site.email} />.
        </p>
        <p>
          {site.shortName}, Google Developer Groups programının bir parçasıdır ama bu sitede
          toplanan veriler GDG programına ya da üniversite yönetimine aktarılmaz.
        </p>
      </Block>

      <Block title="Hangi veriler, ne için, ne kadar süre?">
        <div className="space-y-4">
          {records.map((r) => (
            <div
              key={r.what}
              className="space-y-2 rounded-2xl border-2 border-border bg-surface p-5"
            >
              <h3 className="font-bold">{r.what}</h3>
              <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[9rem_1fr]">
                <Row term="Veriler">{r.data}</Row>
                <Row term="Amaç">{r.why}</Row>
                <Row term="Hukuki sebep">{r.basis}</Row>
                <Row term="Saklama">{r.keep}</Row>
              </dl>
            </div>
          ))}
        </div>
        <p>
          Süre dolunca kayıtlar silinir. Öğrenci numarası, T.C. kimlik numarası, telefon ya da özel
          nitelikli kişisel veri (sağlık, din, siyasi görüş vb.) istemiyoruz; lütfen mesajlarınıza
          da yazmayın.
        </p>
      </Block>

      <Block title="Toplama yöntemi">
        <p>
          Veriler bu sitedeki formlara sizin yazmanızla, elektronik ortamda toplanır. Ziyaret
          istatistiği çerez kullanmadan, kimliğinizi belirlemeyecek şekilde tutulur.
        </p>
      </Block>

      <Block title="Kimler erişir, nereye aktarılır?">
        <p>
          Form kayıtlarını yalnızca yönetim panelindeki ekip üyeleri görür. Site, aşağıdaki hizmet
          sağlayıcıları kullanır; veriler bu sağlayıcıların sunucularında, onların güvenlik
          önlemleri altında işlenir:
        </p>
        <ul className="space-y-2">
          {processors.map((p) => (
            <li key={p.name} className="text-fg-muted">
              <span className="font-bold text-fg">{p.name}</span> — {p.role} ({p.where})
            </li>
          ))}
        </ul>
        <p>
          Bu sağlayıcıların bir kısmı yurt dışındadır. Yurt dışına aktarım KVKK md. 9 kapsamında,
          başvuru formunda açık rızanıza, diğer durumlarda sağlayıcıların standart sözleşme
          taahhütlerine dayanır.
        </p>
      </Block>

      <Block title="Haklarınız (KVKK md. 11)">
        <p>Kişisel verilerinizle ilgili olarak:</p>
        <ul className="list-disc space-y-1 pl-5 text-fg-muted">
          <li>işlenip işlenmediğini ve hangi verilerin işlendiğini öğrenme,</li>
          <li>işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>aktarıldığı üçüncü kişileri bilme,</li>
          <li>eksik ya da yanlışsa düzeltilmesini, gerekmiyorsa silinmesini isteme,</li>
          <li>düzeltme ve silmenin aktarılan kişilere bildirilmesini isteme,</li>
          <li>otomatik analiz sonucu aleyhinize bir sonuca itiraz etme,</li>
          <li>kanuna aykırı işleme nedeniyle zarara uğradıysanız tazminat isteme</li>
        </ul>
        <p>
          haklarına sahipsiniz. Açık rızanızı istediğiniz zaman geri alabilirsiniz. Talebinizi{" "}
          <Mail email={site.email} /> adresine, kayıtta kullandığınız e-posta adresinden yazmanız
          yeterli; en geç 30 gün içinde ücretsiz yanıt veririz. Yanıtımızdan memnun kalmazsanız
          Kişisel Verileri Koruma Kurulu&apos;na başvurabilirsiniz.
        </p>
      </Block>

      <p className="font-mono text-xs text-fg-subtle">
        Bu metin değişirse güncel hâli bu sayfada yayımlanır. ·{" "}
        <Link href="/" className="underline">
          ana sayfaya dön
        </Link>
      </p>
    </article>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 leading-relaxed">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-mono text-xs text-fg-subtle sm:pt-0.5">{term}</dt>
      <dd className="text-fg-muted">{children}</dd>
    </>
  );
}

function Mail({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="font-medium underline">
      {email}
    </a>
  );
}
