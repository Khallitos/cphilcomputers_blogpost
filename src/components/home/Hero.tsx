import TypingText from "@/components/ui/TypingText";
import { SITE } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 pb-24 pt-28 text-center"
    >
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        <TypingText text={SITE.name} />
      </h1>
      <p className="max-w-2xl text-lg text-muted sm:text-xl">{SITE.roleLine}</p>
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        Five-plus years deploying critical systems across industrial, banking,
        and enterprise environments — with a zero-incident record on
        mission-critical work. Currently an MSc Enterprise &amp; IT Security
        candidate, and a full-stack developer who automates everything he can.
      </p>
    </section>
  );
}
