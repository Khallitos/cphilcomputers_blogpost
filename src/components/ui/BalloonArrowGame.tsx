"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Constants & pure helpers                                            */
/* ------------------------------------------------------------------ */

const VB_W = 800;
const VB_H = 600;
// Cannon-style pivot: the bow stays fixed on the left and only the
// launch ANGLE changes (up/down aim).
const BOW_X = 64;
const BOW_Y = 320;
const AIM_MIN = -15; // degrees (down)
const AIM_MAX = 55; // degrees (up)
const DEFAULT_ANGLE = 20;
const AIM_LINE_LEN = 84;
const LAUNCH_SPEED = 7; // px per 16.67 ms frame
const GRAVITY = 0.09; // px per frame^2 (at 60 fps)
const MISS_MARGIN = 60; // off-screen margin before the arrow disappears
const HIT_TOLERANCE = 8; // extra radius for forgiving distance collisions

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

// Squared hit radii, precomputed once (distance-based collision, no sqrt).
const HIT_R2: readonly number[] = BALLOONS.map(
  (b) => (b.radius + HIT_TOLERANCE) * (b.radius + HIT_TOLERANCE),
);

const balloonY = (b: Balloon, tick: number) =>
  b.baseY + Math.sin(tick * b.speed + b.phase) * b.amplitude;

const balloonX = (b: Balloon, tick: number) =>
  b.x + Math.sin(tick * b.driftSpeed + b.driftPhase) * b.driftAmplitude;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const toDeg = (rad: number) => (rad * 180) / Math.PI;

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

function closeAudio() {
  stopMusic();
  if (audioCtx) {
    try {
      void audioCtx.close();
    } catch {
      /* noop */
    }
    audioCtx = null;
  }
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
/* Confetti particles (imperative SVG elements, reused per frame)      */
/* ------------------------------------------------------------------ */

type Particle = {
  el: SVGGraphicsElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  round: boolean;
  life: number;
  maxLife: number;
};

const SVG_NS = "http://www.w3.org/2000/svg";

function spawnConfetti(
  pool: React.MutableRefObject<Particle[]>,
  pid: React.MutableRefObject<number>,
  container: SVGGElement | null,
  x: number,
  y: number,
  color: string,
) {
  if (!container) return;
  const colors = [color, "var(--accent)", "var(--secondary)", "#e6edf3"];
  for (let i = 0; i < 16; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4.5;
    const size = 3 + Math.random() * 4;
    const round = Math.random() > 0.5;
    const el = document.createElementNS(SVG_NS, round ? "circle" : "rect");
    if (round) {
      el.setAttribute("r", String(size / 2));
      el.setAttribute("cx", String(x));
      el.setAttribute("cy", String(y));
    } else {
      el.setAttribute("width", String(size));
      el.setAttribute("height", String(size * 0.66));
      el.setAttribute("x", String(x - size / 2));
      el.setAttribute("y", String(y - size / 3));
    }
    el.setAttribute("fill", colors[i % colors.length]);
    el.setAttribute("opacity", "1");
    container.appendChild(el);
    pool.current.push({
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      size,
      round,
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

  // React state only for things that change on discrete events (input,
  // pops). Everything animated per frame lives in refs below.
  const [angle, setAngle] = useState(DEFAULT_ANGLE);
  const [popped, setPopped] = useState<number[]>([]);
  const [liveMsg, setLiveMsg] = useState("");
  const [musicMuted, setMusicMuted] = useState(false);

  const tickRef = useRef(0);
  const angleRef = useRef(DEFAULT_ANGLE);
  const reducedMotionRef = useRef(false);
  const musicMutedRef = useRef(false);
  const arrowRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(
    null,
  );
  // In-place popped flags (indexed by balloon id) for the hot loop.
  const poppedFlagsRef = useRef<boolean[]>(BALLOONS.map(() => false));
  const particlesRef = useRef<Particle[]>([]);
  const pidRef = useRef(0);

  // SVG element refs mutated directly each frame (no React re-renders).
  const balloonElsRef = useRef<(SVGGElement | null)[]>([]);
  const arrowElRef = useRef<SVGGElement | null>(null);
  const particleGRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const allPopped = popped.length === BALLOONS.length;

  /* ------------------------- main game loop ------------------------ */

  useEffect(() => {
    let raf = 0;
    let running = true;
    let last = performance.now();

    const step = (dt: number) => {
      const s = dt / 16.667; // normalize to 60 fps
      const rm = reducedMotionRef.current;

      tickRef.current += s;
      const tickVal = tickRef.current;

      // Balloons bob in place — direct transform writes, no renders.
      if (!rm) {
        for (let i = 0; i < BALLOONS.length; i += 1) {
          if (poppedFlagsRef.current[i]) continue;
          const el = balloonElsRef.current[i];
          if (!el) continue;
          const b = BALLOONS[i];
          el.setAttribute(
            "transform",
            `translate(${balloonX(b, tickVal)} ${balloonY(b, tickVal)})`,
          );
        }
      }

      // Cannonball arrow: parabolic arc under gravity, distance-based
      // collision against every balloon center on every frame.
      const arrow = arrowRef.current;
      if (arrow) {
        arrow.vy += GRAVITY * s;
        arrow.x += arrow.vx * s;
        arrow.y += arrow.vy * s;
        const el = arrowElRef.current;
        if (el) {
          el.setAttribute(
            "transform",
            `translate(${arrow.x} ${arrow.y}) rotate(${toDeg(
              Math.atan2(-arrow.vy, arrow.vx),
            )})`,
          );
        }

        let hit = false;
        for (let i = 0; i < BALLOONS.length; i += 1) {
          if (poppedFlagsRef.current[i]) continue;
          const b = BALLOONS[i];
          const bx = rm ? b.x : balloonX(b, tickVal);
          const by = rm ? b.baseY : balloonY(b, tickVal);
          const dx = arrow.x - bx;
          const dy = arrow.y - by;
          if (dx * dx + dy * dy <= HIT_R2[i]) {
            poppedFlagsRef.current[i] = true;
            setPopped((prev) => [...prev, i]);
            arrowRef.current = null;
            if (el) el.style.display = "none";
            playPop();
            spawnConfetti(particlesRef, pidRef, particleGRef.current, bx, by, b.color);
            setLiveMsg(`Balloon popped; secret revealed: ${b.secret}`);
            hit = true;
            break;
          }
        }

        // Missed everything: keep flying until it drops off-screen.
        if (
          !hit &&
          (arrow.y > VB_H + MISS_MARGIN || arrow.x > VB_W + MISS_MARGIN)
        ) {
          arrowRef.current = null;
          if (el) el.style.display = "none";
        }
      }

      // Confetti physics — mutate in place, compact dead particles,
      // remove their DOM nodes. No allocations per frame.
      const parts = particlesRef.current;
      if (parts.length > 0) {
        let write = 0;
        for (let i = 0; i < parts.length; i += 1) {
          const p = parts[i];
          p.life -= dt;
          if (p.life <= 0) {
            if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
            continue;
          }
          p.x += p.vx * s;
          p.y += p.vy * s;
          p.vy += (rm ? 0 : 0.09) * s;
          const opacity = Math.max(0, p.life / p.maxLife);
          if (p.round) {
            p.el.setAttribute("cx", String(p.x));
            p.el.setAttribute("cy", String(p.y));
          } else {
            p.el.setAttribute("x", String(p.x - p.size / 2));
            p.el.setAttribute("y", String(p.y - p.size / 3));
            p.el.setAttribute("transform", `rotate(${p.vy * 3} ${p.x} ${p.y})`);
          }
          p.el.setAttribute("opacity", String(opacity));
          parts[write] = p;
          write += 1;
        }
        parts.length = write;
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(50, now - last);
      last = now;
      step(dt);
    };

    // Pause the loop entirely when the tab is hidden; resume on visible.
    const onVisibilityChange = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopMusic();
      closeAudio();
    };
  }, []);

  /* --------------------------- input ------------------------------- */

  const toViewBox = (clientX: number, clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const scale = Math.max(rect.width / VB_W, rect.height / VB_H);
    const offsetX = (rect.width - VB_W * scale) / 2;
    const offsetY = (rect.height - VB_H * scale) / 2;
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  };

  const aimAt = (clientX: number, clientY: number, el: HTMLElement) => {
    if (allPopped) return;
    const { x, y } = toViewBox(clientX, clientY, el);
    const next = clamp(toDeg(Math.atan2(BOW_Y - y, x - BOW_X)), AIM_MIN, AIM_MAX);
    angleRef.current = next;
    setAngle(next);
  };

  const fire = () => {
    if (arrowRef.current || poppedFlagsRef.current.every(Boolean)) return;
    ensureAudio();
    const rad = (angleRef.current * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    arrowRef.current = {
      x: BOW_X + 8 * c,
      y: BOW_Y - 8 * s,
      vx: LAUNCH_SPEED * c,
      vy: -LAUNCH_SPEED * s,
    };
    if (arrowElRef.current) arrowElRef.current.style.display = "";
  };

  const replay = () => {
    poppedFlagsRef.current = BALLOONS.map(() => false);
    setPopped([]);
    arrowRef.current = null;
    if (arrowElRef.current) arrowElRef.current.style.display = "none";
    const g = particleGRef.current;
    if (g) {
      while (g.firstChild) g.removeChild(g.firstChild);
    }
    particlesRef.current = [];
    angleRef.current = DEFAULT_ANGLE;
    setAngle(DEFAULT_ANGLE);
    setLiveMsg("Game reset. Pop all three balloons.");
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
    aimAt(e.clientX, e.clientY, e.currentTarget);
    fire();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || e.pointerType === "touch") {
      aimAt(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    startMusic(musicMutedRef.current);
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = clamp(angleRef.current + 3, AIM_MIN, AIM_MAX);
      angleRef.current = next;
      setAngle(next);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = clamp(angleRef.current - 3, AIM_MIN, AIM_MAX);
      angleRef.current = next;
      setAngle(next);
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      fire();
    }
  };

  /* --------------------------- render ------------------------------ */

  const rad = (angle * Math.PI) / 180;
  const aimX = BOW_X + Math.cos(rad) * AIM_LINE_LEN;
  const aimY = BOW_Y - Math.sin(rad) * AIM_LINE_LEN;

  return (
    <div>
      <div
        role="application"
        aria-label="Balloon pop game. Aim the launch angle with the up and down arrows, drag, or mouse; press space or click to fire."
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
          {/* Dotted aim line: short line rotated to the current launch angle. */}
          <line
            x1={BOW_X + 6}
            y1={BOW_Y}
            x2={aimX}
            y2={aimY}
            stroke="var(--muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeDasharray="2 7"
          />

          {/* Balloons (unpopped only) — transforms updated per frame via refs. */}
          {BALLOONS.filter((b) => !popped.includes(b.id)).map((b) => (
            <g
              key={b.id}
              ref={(el) => {
                balloonElsRef.current[b.id] = el;
              }}
              transform={`translate(${b.x} ${b.baseY})`}
            >
              {/* string */}
              <path
                d={`M 0 ${b.radius * 1.05} q 6 12 0 22`}
                stroke={b.color}
                strokeWidth={1.5}
                fill="none"
              />
              {/* body */}
              <ellipse
                cx={0}
                cy={0}
                rx={b.radius}
                ry={b.radius * 1.15}
                fill={b.color}
                fillOpacity={0.85}
                stroke={b.color}
                strokeWidth={1.5}
              />
              {/* highlight */}
              <ellipse
                cx={-b.radius * 0.35}
                cy={-b.radius * 0.45}
                rx={b.radius * 0.28}
                ry={b.radius * 0.2}
                fill="#ffffff"
                fillOpacity={0.3}
              />
              {/* knot */}
              <path
                d={`M -6 ${b.radius * 1.05} l 6 7 l 6 -7 z`}
                fill={b.color}
              />
            </g>
          ))}

          {/* Confetti container — children created/destroyed imperatively. */}
          <g ref={particleGRef} />

          {/* Flying arrow — tip at origin, rotated to its velocity vector. */}
          <g ref={arrowElRef} style={{ display: "none" }} transform="translate(0 0) rotate(0)">
            <line
              x1={-44}
              y1={0}
              x2={-26}
              y2={0}
              stroke="var(--accent)"
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
            <line
              x1={-26}
              y1={0}
              x2={-6}
              y2={0}
              stroke="var(--foreground)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <path d="M 0 0 l -9 -4 v 8 z" fill="var(--accent)" />
          </g>

          {/* Bow (fixed at left edge) — whole group rotates to the aim angle. */}
          <g transform={`rotate(${-angle} ${BOW_X} ${BOW_Y})`}>
            <path
              d={`M ${BOW_X} ${BOW_Y - 46} Q ${BOW_X - 24} ${BOW_Y} ${BOW_X} ${BOW_Y + 46}`}
              stroke="var(--secondary)"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
            <line
              x1={BOW_X}
              y1={BOW_Y - 46}
              x2={BOW_X}
              y2={BOW_Y + 46}
              stroke="var(--muted)"
              strokeWidth={1.5}
            />
            {/* Nocked arrow when idle. */}
            <g>
              <line
                x1={BOW_X + 2}
                y1={BOW_Y}
                x2={BOW_X + 28}
                y2={BOW_Y}
                stroke="var(--foreground)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={`M ${BOW_X + 28} ${BOW_Y} l -8 -3.5 v 7 z`}
                fill="var(--accent)"
              />
            </g>
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
          ↑↓ / drag to aim angle · Space / click to fire
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
                <p className="text-sm font-medium text-foreground">
                  {b.secret}
                </p>
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
