import Link from "next/link";

const dots = ["bg-blue", "bg-red", "bg-yellow", "bg-green"];

export function Brand() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 font-medium">
      <span aria-hidden className="flex gap-1">
        {dots.map((color) => (
          <span
            key={color}
            className={`size-2 rounded-full ${color} transition-transform group-hover:-translate-y-0.5`}
          />
        ))}
      </span>
      <span>
        GDG on Campus <span className="text-fg-muted">AİBÜ</span>
      </span>
    </Link>
  );
}
