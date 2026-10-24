import type { ReactNode, SVGProps } from "react";

// GDG on Campus marka rehberindeki çizgi şekilleri: ince siyah kontur, pastel / halftone dolgu.
// Hepsi dekoratiftir (aria-hidden); kontur rengi currentColor, yani temaya uyar.

type ShapeProps = SVGProps<SVGSVGElement> & { className?: string };

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function Svg({ viewBox, className, children, ...rest }: ShapeProps & { viewBox: string }) {
  return (
    <svg aria-hidden viewBox={viewBox} fill="none" className={className} {...rest}>
      {children}
    </svg>
  );
}

export function Arrow(props: ShapeProps) {
  return (
    <Svg viewBox="0 0 120 40" {...props}>
      <path d="M2 20H112M94 4l18 16-18 16" {...stroke} />
    </Svg>
  );
}

export function Slashes({ fill = "var(--brand-yellow-pastel)", ...props }: ShapeProps) {
  return (
    <Svg viewBox="0 0 120 110" {...props}>
      <path d="M34 4h22L24 106H2z" fill={fill} {...stroke} />
      <path d="M86 4h22L76 106H54z" fill={fill} {...stroke} />
    </Svg>
  );
}

export function Asterisk(props: ShapeProps) {
  return (
    <Svg viewBox="0 0 60 60" {...props}>
      <path d="M30 4v52M4 30h52M11.6 11.6l36.8 36.8M48.4 11.6 11.6 48.4" {...stroke} />
    </Svg>
  );
}

/** Kalın yarım halka. */
export function Arc({ fill = "var(--brand-yellow)", ...props }: ShapeProps) {
  return (
    <Svg viewBox="0 0 70 120" {...props}>
      <path d="M4 4a56 56 0 0 1 0 112V88a28 28 0 0 0 0-56z" fill={fill} {...stroke} />
    </Svg>
  );
}

export function Circles({ fill = "var(--brand-yellow-halftone)", ...props }: ShapeProps) {
  return (
    <Svg viewBox="0 0 150 52" {...props}>
      {[26, 75, 124].map((cx) => (
        <circle key={cx} cx={cx} cy="26" r="23" fill={fill} {...stroke} />
      ))}
    </Svg>
  );
}

export function Globe({ fill = "var(--brand-blue-pastel)", ...props }: ShapeProps) {
  return (
    <Svg viewBox="0 0 80 80" {...props}>
      <circle cx="40" cy="40" r="36" fill={fill} {...stroke} />
      <ellipse cx="40" cy="40" rx="16" ry="36" {...stroke} />
      <path d="M4 40h72M10 22h60M10 58h60M40 4v72" {...stroke} />
    </Svg>
  );
}

/** "{ On Campus }" gibi süslü parantez içinde etiket. */
export function Braces({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-light ${className}`}>
      <span aria-hidden className="text-[1.6em] leading-none">
        {"{"}
      </span>
      {children}
      <span aria-hidden className="text-[1.6em] leading-none">
        {"}"}
      </span>
    </span>
  );
}
