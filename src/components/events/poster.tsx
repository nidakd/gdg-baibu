import Image from "next/image";

type PosterProps = {
  src: string;
  /** Afişin en/boy oranı (events.json'daki coverAspect) */
  aspect: number | null;
  /** Kutunun en/boy oranı: kare 1, 4:3 için 4/3 */
  box?: number;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Afişi kutuyu boşluk bırakmadan dolduracak şekilde yerleştirir (kutu relative olmalı).
 * Dikey afişte başlık görünsün diye üst kısım korunur; kutudan çok daha yatay afiş
 * kırpılmasın diye sığdırılır, arkası kendi bulanık kopyasıyla dolar.
 */
export function Poster({
  src,
  aspect,
  box = 1,
  alt,
  sizes,
  priority,
  className = "",
}: PosterProps) {
  const ratio = (aspect ?? box) / box;

  if (ratio > 1.3) {
    return (
      <>
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="scale-125 object-cover opacity-70 blur-xl"
        />
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-contain ${className}`}
        />
      </>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${ratio < 0.9 ? "object-top" : ""} ${className}`}
    />
  );
}
