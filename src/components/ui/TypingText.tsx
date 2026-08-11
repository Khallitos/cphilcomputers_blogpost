"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type TypingTextProps = {
  text: string;
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
};

const subscribeToReducedMotion = (onChange: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Types `text` out character by character. */
function Typewriter({
  text,
  speed,
}: {
  text: string;
  speed: number;
}) {
  // Start with the full text so SSR renders it (good for LCP/SEO).
  // After hydration the interval replays the typing animation.
  const [typed, setTyped] = useState(text);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return <span aria-hidden="true">{typed}</span>;
}

/**
 * Types `text` out with a blinking cursor. Honors `prefers-reduced-motion`
 * by rendering the full text statically (no cursor). Screen readers get the
 * full text via an sr-only span.
 */
export default function TypingText({
  text,
  className,
  speed = 80,
}: TypingTextProps) {
  const reduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => false,
  );

  return (
    <span className={className}>
      {reduced ? (
        <span aria-hidden="true">{text}</span>
      ) : (
        <Typewriter text={text} speed={speed} />
      )}
      {!reduced && (
        <span
          aria-hidden="true"
          className="ml-1 inline-block animate-[blink_1s_step-end_infinite] text-accent"
        >
          ▍
        </span>
      )}
      <span className="sr-only">{text}</span>
    </span>
  );
}
