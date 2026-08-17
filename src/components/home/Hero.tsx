import TypingText from "@/components/ui/TypingText";
import { SITE } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 px-6 pb-24 pt-28"
    >
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Hi there! I&apos;m <span className="text-accent">Carlos Philips</span>.
      </h1>
      <p className="text-xl text-foreground sm:text-2xl">
        <TypingText text={SITE.roleLine} />
      </p>
      <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        IT infrastructure engineer, full-stack developer and AI-automation
        specialist.
      </p>
      <div className="mt-2 flex flex-wrap gap-4">
        <a
          href="/resume.pdf"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-secondary"
        >
          Download CV (English)
        </a>
        <a
          href="/Carlos_Philips_CV_DE.pdf"
          className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          Download CV (Deutsch)
        </a>
        <a
          href="#contact"
          className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
