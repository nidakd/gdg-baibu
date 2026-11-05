"use client";

import { useEffect, useRef } from "react";

// Bölüm geçişi olarak koşan, oynanabilir küçük bir dinozor oyunu.
// Kendi başına "demo" modunda koşar ve engellerin üstünden atlar; tıklayınca oyun başlar.
// Engeller logodaki hap şekillerinden: marka renklerinde, siyah çerçeveli.

const PX = 3; // sprite piksel boyutu
const BODY = [
  "...........xxxxxxx..",
  "..........xx.xxxxxx.",
  "..........xxxxxxxxx.",
  "..........xxxxxxxxx.",
  "..........xxxxx.....",
  "..........xxxxxxx...",
  "x........xxxxx......",
  "x.......xxxxxx......",
  "xx.....xxxxxxxxx....",
  "xxx...xxxxxxx..x....",
  "xxxxxxxxxxxxx.......",
  ".xxxxxxxxxxxx.......",
  "..xxxxxxxxxx........",
  "...xxxxxxxx.........",
  "....xxxxxx..........",
];
const LEGS = [
  ["....xxx.xx..........", "....xx...x..........", "....x....xx........."],
  ["....xx..xxx.........", "....x....xx.........", "....xx.............."],
];
const DINO_W = BODY[0].length * PX;
const DINO_H = (BODY.length + 3) * PX;

const HEIGHT = 180;
const GROUND = 158;
const DINO_X = 36;
const GRAVITY = 2400;
const JUMP = 720;
const COLORS = ["--brand-blue", "--brand-red", "--brand-yellow", "--brand-green"];

type Obstacle = { x: number; w: number; h: number; color: string };
type Mode = "demo" | "play" | "over";

export function DinoRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const font = getComputedStyle(canvas).fontFamily;
    let palette = readPalette();
    let width = 0;

    let mode: Mode = "demo";
    let y = 0; // zeminden yükseklik
    let vy = 0;
    let speed = 380;
    let distance = 0;
    let nextGap = 420;
    let obstacles: Obstacle[] = [];
    const clouds = [
      { x: 120, y: 34 },
      { x: 520, y: 22 },
      { x: 900, y: 48 },
    ];
    let hi = readHi();
    let overAt = 0;
    let last = 0;
    let raf = 0;
    let visible = true;

    function readPalette() {
      return {
        fg: css.getPropertyValue("--fg").trim() || "#1e1e1e",
        subtle: css.getPropertyValue("--fg-subtle").trim() || "#5f5f5f",
        ink: css.getPropertyValue("--brand-black").trim() || "#1e1e1e",
        colors: COLORS.map((c) => css.getPropertyValue(c).trim()),
      };
    }

    function readHi() {
      try {
        return Number(localStorage.getItem("dino-hi")) || 0;
      } catch {
        return 0;
      }
    }

    function saveHi(value: number) {
      try {
        localStorage.setItem("dino-hi", String(value));
      } catch {
        // tarayıcı depolamaya izin vermiyorsa sadece bu oturumda tutulur
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas!.clientWidth;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(HEIGHT * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    }

    function reset(next: Mode) {
      mode = next;
      y = 0;
      vy = 0;
      speed = 380;
      distance = 0;
      nextGap = 420;
      obstacles = [];
    }

    function jump() {
      if (y === 0) vy = JUMP;
    }

    function spawn() {
      const h = 34 + Math.random() * 30;
      obstacles.push({
        x: width + 20,
        w: 20 + Math.random() * 8,
        h,
        color: palette.colors[Math.floor(Math.random() * palette.colors.length)],
      });
      nextGap = (360 + Math.random() * 420) * (speed / 380);
    }

    function update(dt: number) {
      if (mode === "over") {
        if (performance.now() - overAt > 4000) reset("demo");
        return;
      }
      speed = Math.min(760, speed + dt * 8);
      distance += speed * dt;

      // demo modunda yaklaşan engelin üstünden kendi atlar
      if (mode === "demo") {
        const ahead = obstacles.find((o) => o.x + o.w > DINO_X);
        if (ahead && ahead.x - (DINO_X + DINO_W) < speed * 0.2 + 8) jump();
      }

      vy -= GRAVITY * dt;
      y = Math.max(0, y + vy * dt);
      if (y === 0) vy = Math.max(0, vy);

      for (const o of obstacles) o.x -= speed * dt;
      obstacles = obstacles.filter((o) => o.x + o.w > -10);
      const lastObstacle = obstacles[obstacles.length - 1];
      if (!lastObstacle || width + 20 - lastObstacle.x > nextGap) spawn();

      for (const c of clouds) {
        c.x -= speed * 0.15 * dt;
        if (c.x < -80) c.x = width + Math.random() * 200;
      }

      // çarpışma: sprite'ın kenar boşluklarını hesaba katan küçültülmüş kutu
      const dinoTop = GROUND - y - DINO_H;
      for (const o of obstacles) {
        const hitX = o.x < DINO_X + DINO_W - 10 && o.x + o.w > DINO_X + 8;
        const hitY = dinoTop + DINO_H - 6 > GROUND - o.h;
        if (hitX && hitY && mode === "play") {
          mode = "over";
          overAt = performance.now();
          const score = Math.floor(distance / 40);
          if (score > hi) {
            hi = score;
            saveHi(hi);
          }
        }
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, HEIGHT);

      // bulutlar
      ctx!.strokeStyle = palette.subtle;
      ctx!.lineWidth = 2;
      for (const c of clouds) pill(c.x, c.y, 54, 14, null);

      // zemin: kesik çizgi
      ctx!.strokeStyle = palette.fg;
      ctx!.lineWidth = 2;
      ctx!.setLineDash([14, 8]);
      ctx!.lineDashOffset = distance % 22;
      ctx!.beginPath();
      ctx!.moveTo(0, GROUND + 0.5);
      ctx!.lineTo(width, GROUND + 0.5);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // engeller
      ctx!.lineWidth = 3;
      ctx!.strokeStyle = palette.ink;
      for (const o of obstacles) pill(o.x, GROUND - o.h, o.w, o.h, o.color);

      // dinozor
      ctx!.fillStyle = palette.fg;
      const top = GROUND - y - DINO_H;
      const legs = y > 0 || mode === "over" ? LEGS[0] : LEGS[Math.floor(t / 110) % 2];
      [...BODY, ...legs].forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          if (row[c] === "x") ctx!.fillRect(DINO_X + c * PX, top + r * PX, PX, PX);
        }
      });

      // skor
      ctx!.fillStyle = palette.subtle;
      ctx!.font = `500 13px ${font}`;
      ctx!.textAlign = "right";
      const score = String(Math.floor(distance / 40)).padStart(5, "0");
      const label = mode === "demo" ? "DEMO" : score;
      ctx!.fillText(`HI ${String(hi).padStart(5, "0")}  ${label}`, width - 8, 20);

      if (mode === "over") {
        ctx!.fillStyle = palette.fg;
        ctx!.textAlign = "center";
        ctx!.font = `700 18px ${font}`;
        ctx!.fillText("GAME OVER", width / 2, 64);
        ctx!.font = `500 13px ${font}`;
        ctx!.fillStyle = palette.subtle;
        ctx!.fillText("tekrar oynamak için tıkla", width / 2, 88);
      }
    }

    function pill(x: number, yTop: number, w: number, h: number, fill: string | null) {
      const r = Math.min(w, h) / 2;
      ctx!.beginPath();
      ctx!.roundRect(x, yTop, w, h, r);
      if (fill) {
        ctx!.fillStyle = fill;
        ctx!.fill();
      }
      ctx!.stroke();
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      update(dt);
      draw(now);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduced || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function act() {
      if (reduced) return;
      if (mode === "demo") reset("play");
      else if (mode === "over") {
        reset("play");
        return;
      }
      jump();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        act();
      }
    };
    const onTheme = () => {
      palette = readPalette();
      draw(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden || !visible ? stop() : start());
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");

    canvas.addEventListener("pointerdown", act);
    canvas.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onTheme);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", act);
      canvas.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onTheme);
    };
  }, []);

  return (
    <figure className="w-full">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label="Dinozor oyunu. Oynamak için tıkla, zıplamak için boşluk tuşuna bas."
        className="block h-[180px] w-full cursor-pointer touch-manipulation font-mono"
      />
      <figcaption className="mt-2 text-center font-mono text-xs text-fg-subtle">
        {"// t-rex.run — oynamak için tıkla, zıplamak için boşluk"}
      </figcaption>
    </figure>
  );
}
