import Image from "next/image";
import Link from "next/link";
import mark from "../../../public/brand/gdg-mark.png";

// Resmî yatay logo düzeni: simge + "Google Developer Group" + "On Campus • Üniversite".
// Metin HTML olarak Google Sans ile çizilir; böylece açık ve koyu temada okunur.
// Tam logo görseli (açık zemin için): public/brand/gdg-on-campus-aibu-lockup.png

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="GDG on Campus Abant İzzet Baysal University ana sayfa"
      className="inline-flex items-center gap-3"
    >
      <Image src={mark} alt="" priority className="h-7 w-auto" />
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-medium tracking-tight">Google Developer Group</span>
          <span className="text-xs">
            <span className="text-blue-ink">On Campus</span>
            <span className="text-blue-ink"> • </span>
            <span>Abant İzzet Baysal University</span>
          </span>
        </span>
      )}
    </Link>
  );
}
