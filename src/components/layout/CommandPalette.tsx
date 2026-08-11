"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "./nav-links";

const TOGGLE_EVENT = "command-palette:toggle";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_LINKS;
    return NAV_LINKS.filter(
      (link) =>
        link.label.toLowerCase().includes(q) || link.href.includes(q),
    );
  }, [query]);

  const clampedIndex = Math.min(activeIndex, items.length - 1);

  // Anchor items scroll in place on the home page; anything else (or any
  // anchor reached from another page) falls back to router navigation, and
  // Next.js scrolls to the hash after the route loads.
  const go = useCallback(
    (href: string) => {
      setOpen(false);
      const [, hash] = href.split("#");
      if (pathname === "/" && hash) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      router.push(href);
    },
    [pathname, router],
  );

  // Ctrl+K / Cmd+K toggle (also usable from Nav's hint button via custom event).
  // Query/index are reset whenever the palette is (re)opened.
  useEffect(() => {
    const openPalette = () => {
      setOpen(true);
      setQuery("");
      setActiveIndex(0);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) {
          setOpen(false);
        } else {
          openPalette();
        }
      }
    };
    const onToggle = () => {
      if (openRef.current) {
        setOpen(false);
      } else {
        openPalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(TOGGLE_EVENT, onToggle);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(TOGGLE_EVENT, onToggle);
    };
  }, []);

  // Focus the input whenever the palette opens.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Keyboard navigation while open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          Math.max(0, Math.min(i + 1, items.length - 1)),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const item = items[clampedIndex];
        if (item) {
          go(item.href);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, items, clampedIndex, go]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[15vh]"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4 shrink-0 text-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type to filter pages…"
            aria-label="Filter pages"
            className="w-full bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted"
          />
          <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-xs text-muted">
            Esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2" role="listbox">
          {items.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">No results</li>
          ) : (
            items.map((item, index) => {
              const isActive = index === clampedIndex;
              return (
                <li key={item.href} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(item.href)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-foreground hover:bg-surface"
                    }`}
                  >
                    <span className="text-muted">/</span>
                    {item.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
