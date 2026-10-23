import Image from "next/image";
import Link from "next/link";
import logoDark from "../../../public/brand/gdg-on-campus-aibu-horizontal-dark.png";
import logoLight from "../../../public/brand/gdg-on-campus-aibu-horizontal-light.png";

// Topluluğa özel resmî yatay logo. Açık temada açık, koyu temada koyu sürüm görünür.
const alt = "Google Developer Group on Campus Abant İzzet Baysal University";

export function Logo({ className = "h-7 sm:h-8" }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${alt} ana sayfa`} className="inline-flex shrink-0">
      <Image src={logoLight} alt={alt} priority className={`w-auto dark:hidden ${className}`} />
      <Image
        src={logoDark}
        alt={alt}
        priority
        className={`hidden w-auto dark:block ${className}`}
      />
    </Link>
  );
}
