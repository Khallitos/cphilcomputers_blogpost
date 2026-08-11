import Link from "next/link";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/Khallitos" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/carlos-philips-66774216a/",
  },
  { label: "Instagram", href: "https://instagram.com/carl_philzz" },
  { label: "YouTube", href: "https://www.youtube.com/@AfroFusionBuzz" },
  { label: "Email", href: "mailto:carlphil9924@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">Carlos Philips</p>
          <p className="mt-1 text-sm text-muted">
            © {new Date().getFullYear()} Carlos Philips
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        >
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              {social.label}
            </a>
          ))}
          <Link
            href="/impressum"
            className="text-muted transition-colors hover:text-accent"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="text-muted transition-colors hover:text-accent"
          >
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
