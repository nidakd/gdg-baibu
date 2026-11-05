import Image from "next/image";
import { initials } from "@/lib/format";

type AvatarProps = {
  name: string;
  photoUrl: string | null;
  size: number;
  /** Ekranın üst kısmında görünen avatarlar için hemen yükle */
  priority?: boolean;
  /** Genişliği kapsayıcıdan alır (size sadece görsel çözünürlüğü belirler) */
  fluid?: boolean;
  className?: string;
};

export function Avatar({ name, photoUrl, size, priority, fluid, className = "" }: AvatarProps) {
  const base = `shrink-0 overflow-hidden rounded-full bg-surface-2 border-2 border-border-strong ${className}`;
  const box = fluid ? { width: "100%", height: "100%" } : { width: size, height: size };
  if (!photoUrl) {
    return (
      <span
        aria-hidden
        className={`${base} flex items-center justify-center font-mono font-medium`}
        style={{ ...box, fontSize: size / 3 }}
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <Image
      src={photoUrl}
      alt={name}
      width={size}
      height={size}
      priority={priority}
      className={`${base} object-cover`}
      style={box}
    />
  );
}
