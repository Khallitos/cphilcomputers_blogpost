import dynamic from "next/dynamic";
import type { Metadata } from "next";

const BalloonArrowGame = dynamic(
  () => import("@/components/ui/BalloonArrowGame"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[460px] w-full animate-pulse rounded-2xl border border-border bg-surface sm:h-[600px]"
      />
    ),
  },
);

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Playground</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Aim, fire, pop — three balloons, three secrets about me.
      </p>

      <div className="mt-12">
        <BalloonArrowGame />
      </div>

      <p className="mt-12 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-6 text-sm leading-relaxed text-muted">
        More experiments coming — this page is where I tinker and ship
        whatever I&apos;m learning next.
      </p>
    </div>
  );
}
