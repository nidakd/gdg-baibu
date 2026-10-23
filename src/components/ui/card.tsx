import type { ReactNode } from "react";
import type { Tone } from "./button";

const tones: Record<Tone | "plain", string> = {
  blue: "bg-blue-soft",
  green: "bg-green-soft",
  yellow: "bg-yellow-soft",
  red: "bg-red-soft",
  plain: "bg-surface",
};

type CardProps = {
  tone?: Tone | "plain";
  className?: string;
  children: ReactNode;
};

/** Siyah çerçeveli, sert gölgeli "çıkartma" kart. */
export function Card({ tone = "plain", className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-card border-2 border-border-strong shadow-sticker ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
