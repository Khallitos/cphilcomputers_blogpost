import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "About",
  description:
    "About Carlos Philips: data center & network engineer, full-stack developer and AI automation enthusiast.",
  path: "/about",
});

const LANGUAGES = [
  { name: "English", level: "Native" },
  { name: "Twi", level: "Native" },
  { name: "German", level: "B1, actively improving" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      {/* Hero photo */}
      <div className="relative">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/carlos-hero.webp"
            alt="Carlos Philips"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-cover"
          />
        </div>
        <Image
          src="/images/carlos-avatar.webp"
          alt=""
          width={96}
          height={96}
          className="absolute -bottom-8 left-8 h-24 w-24 rounded-full border-4 border-background object-cover"
        />
      </div>

      <div className="mt-16">
        <h1 className="text-4xl font-bold tracking-tight">Hey, I&apos;m Carlos.</h1>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90">
          <p>
            I&apos;m a system administrator and IT infrastructure engineer with
            five-plus years keeping critical systems running across banking,
            oil and gas, and software development. Trusted for zero-error
            delivery on mission-critical work, from national check-clearing
            networks to Microsoft Intune and Entra ID rollouts and secured
            industrial operations. Now deepening that with an MSc in Enterprise
            and IT Security, while building full-stack apps and AI automation
            on the side.
          </p>
        </div>
      </div>

      {/* Languages */}
      <section aria-labelledby="languages" className="mt-16">
        <h2
          id="languages"
          className="text-2xl font-semibold tracking-tight"
        >
          Languages
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {LANGUAGES.map((language) => (
            <li
              key={language.name}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="font-semibold text-foreground">{language.name}</p>
              <p className="mt-1 text-sm text-muted">{language.level}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Fun facts teaser */}
      <section aria-label="Fun facts" className="mt-16 pb-8">
        <Link
          href="/playground"
          className="group flex flex-col gap-2 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-6 transition-colors hover:border-accent/70 hover:bg-accent/10"
        >
          <span className="text-lg font-semibold text-accent">
            🎈 Three balloons hide three things about me.
          </span>
          <span className="text-sm text-muted group-hover:text-foreground">
            Go pop them.
          </span>
        </Link>
      </section>
    </div>
  );
}
