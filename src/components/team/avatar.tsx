import Image from "next/image";
import { initials } from "@/lib/format";

type AvatarProps = {
  name: string;
  photoUrl: string | null;
  size: number;
  className?: string;
};

export function Avatar({ name, photoUrl, size, className = "" }: AvatarProps) {
  const base = `shrink-0 overflow-hidden rounded-full border-2 border-border-strong bg-surface-2 ${className}`;
  if (!photoUrl) {
    return (
      <span
        aria-hidden
        className={`${base} flex items-center justify-center font-mono font-medium`}
        style={{ width: size, height: size, fontSize: size / 3 }}
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
      className={`${base} object-cover`}
      style={{ width: size, height: size }}
    />
  );
}
