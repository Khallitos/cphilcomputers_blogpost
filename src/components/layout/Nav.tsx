"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import SocialIcons from "../home/SocialIcons";
import { NAV_LINKS } from "./nav-links";

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Page links (Blog, Playground) get the active state; anchor links never do.
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  // Anchor links scroll in place on the home page; on other pages the Link
  // navigates to "/#section" and Next.js scrolls to the hash after loading.
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const [, hash] = href.split("#");
    if (pathname === "/" && hash) {
      const el = document.getElementById(hash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setMenuOpen(false);
      }
    }
  };

  const openPalette = () => {
    window.dispatchEvent(new Event("command-palette:toggle"));
  };

  const linkClass = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${
      active ? "text-accent" : "text-muted hover:text-foreground"
    }`;

  const brand = (
    <Link
      href="/"
      className="shrink-0 text-lg font-bold tracking-tight text-foreground"
    >
      Carlos <span className="text-accent">Philips</span>
    </Link>
  );

  return (
    <>
      {/* Mobile: sticky top bar + hamburger panel */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {brand}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      handleNavClick(e, link.href);
                      setMenuOpen(false);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex justify-center border-t border-border pt-4">
                <SocialIcons className="flex-row gap-5" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop: fixed left sidebar with numbered nav + socials at bottom */}
      <header className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background/80 backdrop-blur lg:flex">
        <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-6 py-8">
          {brand}
          <nav aria-label="Main" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(active)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col items-start gap-6">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={openPalette}
                className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
              >
                <kbd className="rounded bg-surface px-1.5 py-0.5">Ctrl K</kbd>
                <span>Menu</span>
              </button>
            </div>
            <SocialIcons />
          </div>
        </div>
      </header>
    </>
  );
}
