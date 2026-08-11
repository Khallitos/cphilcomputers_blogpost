import { pageMetadata } from "@/lib/seo";
import BalloonGame from "@/components/ui/BalloonGame";

export const metadata = pageMetadata({
  title: "Playground",
  description:
    "A collection of playful interactive experiments by Carlos Philips: balloon games and other small web toys.",
  path: "/playground",
});

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Playground</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Aim, fire, and pop the balloons to learn my hobbies.
      </p>

      <div className="mt-12">
        <BalloonGame />
      </div>

      <p className="mt-12 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-6 text-sm leading-relaxed text-muted">
        More experiments coming; this page is where I tinker and ship
        whatever I&apos;m learning next.
      </p>
    </div>
  );
}
