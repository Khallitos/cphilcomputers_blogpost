"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const mountedRef = useRef(false);

  // On mount: adopt the stored preference (the pre-paint script already set
  // the attribute, so only the icon state needs to catch up; deferred to
  // avoid a synchronous render cascade).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const t: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", t);
    const id = window.setTimeout(() => setTheme(t), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Keep <html> and storage in sync with state after mount.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
