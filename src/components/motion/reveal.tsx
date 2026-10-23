"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Milisaniye cinsinden gecikme; kart dizilerinde sırayla belirme için */
  delay?: number;
};

/** Görünür alana girince aşağıdan yukarı belirir. Stil: globals.css içindeki [data-reveal]. */
export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal="out"
      style={{ transitionDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </div>
  );
}
