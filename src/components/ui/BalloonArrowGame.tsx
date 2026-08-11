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
  /** Radians per frame; different speeds for each balloon. */
  speed: number;
  phase: number;
  amplitude: number;
  /** Gentle horizontal drift so balloons never line up in a column. */
  driftSpeed: number;
  driftPhase: number;
  driftAmplitude: number;
  color: string;
  secret: string;
  /** Optional link shown alongside the secret once revealed. */
  secretLink?: string;
};

// Teal (accent), pink, amber (secondary): three distinct colors.
// Medium difficulty: faster bobbing, bigger amplitudes, desynced phases and
// a gentle horizontal drift keep every balloon on the move.
const BALLOONS: readonly Balloon[] = [
  {
    id: 0,
    x: 470,
    baseY: 170,
    radius: 36,
    speed: 0.0058,
    phase: 0,
    amplitude: 85,
    driftSpeed: 0.0031,
    driftPhase: 0,
    driftAmplitude: 14,
    color: "var(--accent)",
    secret: "✈️ I love travelling",
  },
  {
    id: 1,
    x: 590,
    baseY: 320,
    radius: 38,
    speed: 0.0072,
    phase: 2.1,
    amplitude: 92,
    driftSpeed: 0.0042,
    driftPhase: 1.3,
    driftAmplitude: 16,
    color: "#f472b6",
    secret: "🍰 I love baking",
  },
  {
    id: 2,
    x: 700,
    baseY: 470,
    radius: 36,
    speed: 0.0049,
    phase: 4.2,
    amplitude: 80,
    driftSpeed: 0.0036,
    driftPhase: 2.6,
    driftAmplitude: 13,
    color: "var(--secondary)",
    secret: "🎮 I love video games (Fortnite)",
  },
];

const balloonY = (b: Balloon, tick: number) =>
  b.baseY + Math.sin(tick * b.speed + b.phase) * b.amplitude;

const balloonX = (b: Balloon, tick: number) =>
  b.x + Math.sin(tick * b.driftSpeed + b.driftPhase) * b.driftAmplitude;

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/* ------------------------------------------------------------------ */
/* Audio: lazy AudioContext, short pop (noise burst + pitch drop)     */
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
/* Background music: gentle looping synth arpeggio (Web Audio only)    */
/* ------------------------------------------------------------------ */

const MUSIC_VOLUME = 0.05;
const NOTE_MS = 480;
// C major pentatonic: C4 D4 E4 G4 A4 C5 — nothing dissonant.
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
// Gentle up-down arpeggio (indices into PENTATONIC).
const MUSIC_PATTERN = [0, 2, 4, 5, 4, 2, 3, 1];

let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setTimeout> | null = null;
let musicStep = 0;

function scheduleNextNote() {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const step = musicStep % MUSIC_PATTERN.length;
  musicStep += 1;
  const t = ctx.currentTime;

  // Lead note: soft sine with a slow, natural decay.
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = PENTATONIC[MUSIC_PATTERN[step]];
  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0.0001, t);
  noteGain.gain.exponentialRampToValueAtTime(0.5, t + 0.04);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  osc.connect(noteGain).connect(musicGain);
  osc.start(t);
  osc.stop(t + 1.7);

  // Soft triangle bass every 4 steps (C3) to anchor the arpeggio.
  if (step % 4 === 0) {
    const bass = ctx.createOscillator();
    bass.type = "triangle";
    bass.frequency.value = 130.81;
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0.0001, t);
    bassGain.gain.exponentialRampToValueAtTime(0.3, t + 0.06);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    bass.connect(bassGain).connect(musicGain);
    bass.start(t);
    bass.stop(t + 2.0);
  }

  musicTimer = setTimeout(scheduleNextNote, NOTE_MS);
}

function startMusic(muted: boolean) {
  const ctx = ensureAudio();
  if (!ctx || musicTimer !== null) return;
  const master = ctx.createGain();
  master.gain.value = muted ? 0 : MUSIC_VOLUME;
  master.connect(ctx.destination);
  musicGain = master;
  musicStep = 0;
  scheduleNextNote();
}

function stopMusic() {
  if (musicTimer !== null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
  if (musicGain) {
    try {
      musicGain.disconnect();
    } catch {
      /* noop */
    }
    musicGain = null;
  }
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
  const [musicMuted, setMusicMuted] = useState(false);

  const tickRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const arrowRef = useRef<{ x: number; y: number } | null>(null);
  const arrowProgressRef = useRef(0);
  const poppedRef = useRef<number[]>([]);
  const revealedRef = useRef<string[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pidRef = useRef(0);
  const musicMutedRef = useRef(false);

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
            const bx = reducedMotionRef.current ? b.x : balloonX(b, tickVal);
            if (
              arrowHitsBalloon(
                { x: arrow.x, y: arrow.y },
                { x: bx, y: by, radius: b.radius },
              )
            ) {
              poppedRef.current = [...poppedRef.current, b.id];
              revealedRef.current = [...revealedRef.current, b.secret];
              setPopped(poppedRef.current);
              arrowRef.current = null;
              arrowProgressRef.current = 0;
              setArrow(null);
              playPop();
              spawnConfetti(particlesRef, pidRef, bx, by, b.color);
              setLiveMsg(`Balloon popped; secret revealed: ${b.secret}`);
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
    return () => {
      cancelAnimationFrame(raf);
      stopMusic();
    };
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
    setLiveMsg("Game reset. Pop all three balloons.");
    setTick((t) => t + 1);
  };

  const toggleMusicMute = () => {
    ensureAudio();
    const next = !musicMutedRef.current;
    musicMutedRef.current = next;
    setMusicMuted(next);
    if (musicGain && audioCtx) {
      musicGain.gain.setTargetAtTime(
        next ? 0 : MUSIC_VOLUME,
        audioCtx.currentTime,
        0.04,
      );
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    startMusic(musicMutedRef.current);
    aimAt(e.clientY, e.currentTarget);
    fire();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || e.pointerType === "touch") {
      aimAt(e.clientY, e.currentTarget);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    startMusic(musicMutedRef.current);
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setBowY((y) => clamp(y - 22, BOW_MIN, BOW_MAX));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
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
            const x = reducedMotion ? b.x : balloonX(b, tick);
            return (
              <g key={b.id}>
                {/* string */}
                <path
                  d={`M ${x} ${y + b.radius * 1.05} q 6 12 0 22`}
                  stroke={b.color}
                  strokeWidth={1.5}
                  fill="none"
                />
                {/* body */}
                <ellipse
                  cx={x}
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
                  cx={x - b.radius * 0.35}
                  cy={y - b.radius * 0.45}
                  rx={b.radius * 0.28}
                  ry={b.radius * 0.2}
                  fill="#ffffff"
                  fillOpacity={0.3}
                />
                {/* knot */}
                <path
                  d={`M ${x - 6} ${y + b.radius * 1.05} l 6 7 l 6 -7 z`}
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

        {/* Music mute/unmute toggle. */}
        <button
          type="button"
          onClick={toggleMusicMute}
          aria-label={musicMuted ? "Unmute music" : "Mute music"}
          aria-pressed={musicMuted}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-background/70 text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {musicMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" x2="17" y1="9" y2="15" />
              <line x1="17" x2="23" y1="9" y2="15" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

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
              You popped them all. Now you know the real me 🎉
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              And one more thing...{" "}
              <a
                href="https://www.youtube.com/@AfroFusionBuzz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-red-500 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ▶️ Check out my YouTube channel
                <span aria-hidden="true">↗</span>
              </a>
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
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {b.secret}
                  </p>
                  {b.secretLink && (
                    <a
                      href={b.secretLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-500 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      youtube.com/@AfroFusionBuzz
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  <span aria-hidden="true">❓</span> Balloon {b.id + 1}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
