"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { arrowHitsBalloon } from "@/lib/collision";

/* ------------------------------------------------------------------ */
/* Constants & pure helpers                                            */
/* ------------------------------------------------------------------ */

const VB_W = 800;
const VB_H = 600;
const BOW_X = 64;
const BOW_MIN = 70;
const BOW_MAX = 530;
const TARGET_X = VB_W + 24; // arrow flies past the right edge
const ARROW_FLIGHT_MS = 750;

type Balloon = {
  id: number;
  x: number;
  baseY: number;
  radius: number;
  /** Radians per frame — different speeds for each balloon. */
  speed: number;
  phase: number;
  amplitude: number;
  color: string;
  secret: string;
};

// Teal (accent), pink, amber (secondary) — three distinct balloon colors.
const BALLOONS: readonly Balloon[] = [
  {
    id: 0,
    x: 470,
    baseY: 170,
    radius: 36,
    speed: 0.0026,
    phase: 0,
    amplitude: 55,
    color: "var(--accent)",
    secret: "✈️ I love travelling",
  },
  {
    id: 1,
    x: 590,
    baseY: 320,
    radius: 38,
    speed: 0.0034,
    phase: 2.1,
    amplitude: 70,
    color: "#f472b6",
    secret: "🍰 I love baking",
  },
  {
    id: 2,
    x: 700,
    baseY: 470,
    radius: 36,
    speed: 0.002,
    phase: 4.2,
    amplitude: 60,
    color: "var(--secondary)",
    secret: "🎮 I love video games (Fortnite)",
  },
];

const balloonY = (b: Balloon, tick: number) =>
  b.baseY + Math.sin(tick * b.speed + b.phase) * b.amplitude;

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/* ------------------------------------------------------------------ */
/* Audio — lazy AudioContext, short pop: noise burst + pitch drop      */
/* ------------------------------------------------------------------ */

let audioCtx: AudioContext | null = null;

function ensureAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playPop() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Short noise burst through a falling bandpass filter.
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1400, t);
  filter.frequency.exponentialRampToValueAtTime(250, t + 0.15);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.45, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.16);

  // Pitch-drop oscillator for the "pop" body.
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.14);
}

/* ------------------------------------------------------------------ */
/* Confetti particles                                                  */
/* ------------------------------------------------------------------ */

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  round: boolean;
  life: number;
  maxLife: number;
};

function spawnConfetti(
  pool: React.MutableRefObject<Particle[]>,
  pid: React.MutableRefObject<number>,
  x: number,
  y: number,
  color: string,
) {
  const colors = [color, "var(--accent)", "var(--secondary)", "#e6edf3"];
  for (let i = 0; i < 16; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4.5;
    pool.current.push({
      id: pid.current,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      color: colors[i % colors.length],
      size: 3 + Math.random() * 4,
      round: Math.random() > 0.5,
      life: 700 + Math.random() * 400,
      maxLife: 1100,
    });
    pid.current += 1;
  }
}

/* ------------------------------------------------------------------ */
/* Reduced-motion hook (same pattern as TypingText)                    */
/* ------------------------------------------------------------------ */

const subscribeToReducedMotion = (onChange: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function BalloonArrowGame() {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => false,
  );

  const [tick, setTick] = useState(0);
  const [bowY, setBowY] = useState(VB_H / 2);
  const [popped, setPopped] = useState<number[]>([]);
  const [liveMsg, setLiveMsg] = useState("");
  const [arrow, setArrow] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const tickRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const arrowRef = useRef<{ x: number; y: number } | null>(null);
  const arrowProgressRef = useRef(0);
  const poppedRef = useRef<number[]>([]);
  const revealedRef = useRef<string[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pidRef = useRef(0);

  // Keep refs in sync for the animation loop (no extra renders).
  useEffect(() => {
    tickRef.current = tick;
    reducedMotionRef.current = reducedMotion;
  }, [tick, reducedMotion]);

  const allPopped = popped.length === BALLOONS.length;

  /* ------------------------- main game loop ------------------------ */

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;

      // Arrow flight + collision.
      const arrow = arrowRef.current;
      if (arrow) {
        arrowProgressRef.current = Math.min(
          1,
          arrowProgressRef.current + dt / ARROW_FLIGHT_MS,
        );
        arrow.x = BOW_X + (TARGET_X - BOW_X) * easeOutCubic(arrowProgressRef.current);

        if (arrowProgressRef.current >= 1) {
          arrowRef.current = null;
          setArrow(null);
        } else {
          const tickVal = tickRef.current;
          let hit = false;
          for (const b of BALLOONS) {
            if (poppedRef.current.includes(b.id)) continue;
            const by = reducedMotionRef.current ? b.baseY : balloonY(b, tickVal);
            if (
              arrowHitsBalloon(
                { x: arrow.x, y: arrow.y },
                { x: b.x, y: by, radius: b.radius },
              )
            ) {
              poppedRef.current = [...poppedRef.current, b.id];
              revealedRef.current = [...revealedRef.current, b.secret];
              setPopped(poppedRef.current);
              arrowRef.current = null;
              arrowProgressRef.current = 0;
              setArrow(null);
              playPop();
              spawnConfetti(particlesRef, pidRef, b.x, by, b.color);
              setLiveMsg(`Balloon popped — secret revealed: ${b.secret}`);
              hit = true;
              break;
            }
          }
          if (!hit) setArrow({ x: arrow.x, y: arrow.y });
        }
      }

      // Confetti physics (gravity; skipped under reduced motion).
      const gravity = reducedMotionRef.current ? 0 : 0.09;
      const aliveParticles = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * (dt / 16.67),
          y: p.y + p.vy * (dt / 16.67),
          vy: p.vy + gravity * (dt / 16.67),
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);
      particlesRef.current = aliveParticles;
      if (aliveParticles.length > 0) {
        setParticles([...aliveParticles]);
      } else {
        // Clear the render copy only when it still has particles.
        setParticles((prev) => (prev.length === 0 ? prev : []));
      }

      const animating =
        Boolean(arrowRef.current) ||
        particlesRef.current.length > 0 ||
        !reducedMotionRef.current;
      if (animating) setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* --------------------------- input ------------------------------- */

  const toViewBoxY = (clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const scale = Math.max(rect.width / VB_W, rect.height / VB_H);
    const offsetY = (rect.height - VB_H * scale) / 2;
    return (clientY - rect.top - offsetY) / scale;
  };

  const aimAt = (clientY: number, el: HTMLElement) => {
    if (allPopped) return;
    setBowY(clamp(toViewBoxY(clientY, el), BOW_MIN, BOW_MAX));
  };

  const fire = () => {
    if (arrowRef.current || allPopped) return;
    ensureAudio();
    const fired = { x: BOW_X + 8, y: bowY };
    arrowRef.current = fired;
    arrowProgressRef.current = 0;
    setArrow(fired);
    setTick((t) => t + 1);
  };

  const replay = () => {
    poppedRef.current = [];
    setPopped([]);
    revealedRef.current = [];
    arrowRef.current = null;
    arrowProgressRef.current = 0;
    particlesRef.current = [];
    setArrow(null);
    setParticles([]);
    setLiveMsg("Game reset — pop all three balloons.");
    setTick((t) => t + 1);
  };

  const skip = () => {
    ensureAudio();
    poppedRef.current = BALLOONS.map((b) => b.id);
    revealedRef.current = BALLOONS.map((b) => b.secret);
    setPopped(poppedRef.current);
    arrowRef.current = null;
    arrowProgressRef.current = 0;
    particlesRef.current = [];
    setArrow(null);
    setParticles([]);
    setLiveMsg(
      "All secrets revealed — travelling, baking, and video games.",
    );
    setTick((t) => t + 1);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ensureAudio();
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    aimAt(e.clientY, e.currentTarget);
    fire();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || e.pointerType === "touch") {
      aimAt(e.clientY, e.currentTarget);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      ensureAudio();
      setBowY((y) => clamp(y - 22, BOW_MIN, BOW_MAX));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      ensureAudio();
      setBowY((y) => clamp(y + 22, BOW_MIN, BOW_MAX));
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      fire();
    }
  };

  /* --------------------------- render ------------------------------ */

  return (
    <div>
      <div
        role="application"
        aria-label="Balloon pop game. Move the bow with the up and down arrows, drag, or mouse; press space or click to fire."
        tabIndex={0}
        className="relative h-[460px] w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-surface outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-[600px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
        >
          {/* Faint dotted aim line from the bow tip. */}
          <line
            x1={BOW_X + 4}
            y1={bowY}
            x2={VB_W}
            y2={bowY}
            stroke="var(--muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeDasharray="2 7"
          />

          {/* Balloons (unpopped only). */}
          {BALLOONS.filter((b) => !popped.includes(b.id)).map((b) => {
            const y = reducedMotion ? b.baseY : balloonY(b, tick);
            return (
              <g key={b.id}>
                {/* string */}
                <path
                  d={`M ${b.x} ${y + b.radius * 1.05} q 6 12 0 22`}
                  stroke={b.color}
                  strokeWidth={1.5}
                  fill="none"
                />
                {/* body */}
                <ellipse
                  cx={b.x}
                  cy={y}
                  rx={b.radius}
                  ry={b.radius * 1.15}
                  fill={b.color}
                  fillOpacity={0.85}
                  stroke={b.color}
                  strokeWidth={1.5}
                />
                {/* highlight */}
                <ellipse
                  cx={b.x - b.radius * 0.35}
                  cy={y - b.radius * 0.45}
                  rx={b.radius * 0.28}
                  ry={b.radius * 0.2}
                  fill="#ffffff"
                  fillOpacity={0.3}
                />
                {/* knot */}
                <path
                  d={`M ${b.x - 6} ${y + b.radius * 1.05} l 6 7 l 6 -7 z`}
                  fill={b.color}
                />
              </g>
            );
          })}

          {/* Confetti burst. */}
          {particles.map((p) =>
            p.round ? (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.size / 2}
                fill={p.color}
                opacity={p.life / p.maxLife}
              />
            ) : (
              <rect
                key={p.id}
                x={p.x - p.size / 2}
                y={p.y - p.size / 3}
                width={p.size}
                height={p.size * 0.66}
                fill={p.color}
                opacity={p.life / p.maxLife}
                transform={`rotate(${p.vy * 3} ${p.x} ${p.y})`}
              />
            ),
          )}

          {/* Flying arrow with a small trail. */}
          {arrow && (
            <g>
              <line
                x1={arrow.x - 42}
                y1={arrow.y}
                x2={arrow.x - 24}
                y2={arrow.y}
                stroke="var(--accent)"
                strokeOpacity={0.35}
                strokeWidth={1.5}
              />
              <line
                x1={arrow.x - 24}
                y1={arrow.y}
                x2={arrow.x}
                y2={arrow.y}
                stroke="var(--foreground)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={`M ${arrow.x} ${arrow.y} l -9 -4 v 8 z`}
                fill="var(--accent)"
              />
            </g>
          )}

          {/* Bow (fixed at left edge, follows aim). */}
          <g>
            <path
              d={`M ${BOW_X} ${bowY - 46} Q ${BOW_X - 24} ${bowY} ${BOW_X} ${bowY + 46}`}
              stroke="var(--secondary)"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
            <line
              x1={BOW_X}
              y1={bowY - 46}
              x2={BOW_X}
              y2={bowY + 46}
              stroke="var(--muted)"
              strokeWidth={1.5}
            />
            {/* Nocked arrow when idle. */}
            {!arrow && (
              <g>
                <line
                  x1={BOW_X + 2}
                  y1={bowY}
                  x2={BOW_X + 28}
                  y2={bowY}
                  stroke="var(--foreground)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${BOW_X + 28} ${bowY} l -8 -3.5 v 7 z`}
                  fill="var(--accent)"
                />
              </g>
            )}
          </g>
        </svg>

        {/* Controls hint. */}
        <div className="pointer-events-none absolute bottom-3 left-4 rounded-md bg-background/70 px-2 py-1 font-mono text-[11px] text-muted">
          ↑↓ / drag to aim · Space / click to fire
        </div>

        {/* Completion overlay. */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm transition-opacity duration-500 motion-reduce:transition-none ${
            allPopped ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="w-full max-w-sm rounded-2xl border border-accent/40 bg-surface p-6 text-center shadow-xl">
            <p className="text-3xl" aria-hidden="true">
              🎉
            </p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
              You popped them all — now you know the real me 🎉
            </p>
            <button
              type="button"
              onClick={replay}
              className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Replay
            </button>
          </div>
        </div>
      </div>

      {/* Screen-reader announcements. */}
      <p aria-live="polite" className="sr-only">
        {liveMsg}
      </p>

      {/* Secret slots. */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BALLOONS.map((b) => {
          const isRevealed = popped.includes(b.id);
          return (
            <div
              key={b.id}
              className={`rounded-xl border p-4 transition-all duration-500 motion-reduce:transition-none ${
                isRevealed
                  ? "translate-y-0 border-accent/50 bg-accent/10 opacity-100"
                  : "translate-y-1 border-dashed border-border bg-background/40 opacity-60"
              }`}
            >
              {isRevealed ? (
                <p className="text-sm font-medium text-foreground">{b.secret}</p>
              ) : (
                <p className="text-sm text-muted">
                  <span aria-hidden="true">❓</span> Balloon {b.id + 1}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={skip}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Skip game &amp; reveal all
        </button>
      </div>
    </div>
  );
}
