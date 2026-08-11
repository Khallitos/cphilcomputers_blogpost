import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-32 text-center">
      <p className="font-mono text-7xl font-bold text-accent" aria-hidden="true">
        404
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        This page popped like a balloon 🎈
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        Either it never existed, it moved, or it&apos;s floating somewhere it
        shouldn&apos;t be. Head back home, or stretch your aim on the
        playground instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-secondary"
        >
          Back home
        </Link>
        <Link
          href="/playground"
          className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          Pop some balloons
        </Link>
      </div>
    </div>
  );
}
