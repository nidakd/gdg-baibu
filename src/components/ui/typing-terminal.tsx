"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { Cursor, Terminal } from "./terminal";

export type TerminalLine = { kind: "command" | "ok" | "info"; text: string };

const prefix: Record<TerminalLine["kind"], { mark: string; className: string }> = {
  command: { mark: "$", className: "text-green-ink" },
  ok: { mark: "✓", className: "text-green-ink" },
  info: { mark: "→", className: "text-blue-ink" },
};

/** Komutları harf harf yazan, çıktıları satır satır basan terminal. */
export function TypingTerminal({ lines }: { lines: TerminalLine[] }) {
  // typed: tamamlanan satır sayısı, chars: yazılmakta olan komutun harf sayısı
  const [typed, setTyped] = useState(0);
  const [chars, setChars] = useState(0);
  const reduced = useReducedMotion();
  const shown = reduced ? lines.length : typed;

  useEffect(() => {
    if (reduced || shown >= lines.length) return;
    const line = lines[shown];
    if (line.kind === "command" && chars < line.text.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 45 + Math.random() * 60);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => {
        setTyped((s) => s + 1);
        setChars(0);
      },
      line.kind === "command" ? 350 : 220,
    );
    return () => clearTimeout(t);
  }, [reduced, shown, chars, lines]);

  const typing = shown < lines.length ? lines[shown] : null;

  return (
    <Terminal>
      {/* Ekran okuyucular animasyonu değil, tam metni okur */}
      <div className="sr-only">
        {lines.map((l) => (
          <p key={l.text}>{l.text}</p>
        ))}
      </div>
      <div aria-hidden className="min-h-44">
        {lines.slice(0, shown).map((line) => (
          <Line key={line.text} line={line} />
        ))}
        {typing?.kind === "command" && (
          <p>
            <span className={prefix.command.className}>$</span> {typing.text.slice(0, chars)}
            <Cursor />
          </p>
        )}
        {!typing && (
          <p>
            <span className={prefix.command.className}>$</span> <Cursor />
          </p>
        )}
      </div>
    </Terminal>
  );
}

function Line({ line }: { line: TerminalLine }) {
  const p = prefix[line.kind];
  return (
    <p>
      <span className={p.className}>{p.mark}</span>{" "}
      {line.kind === "command" ? line.text : <span>{line.text}</span>}
    </p>
  );
}
