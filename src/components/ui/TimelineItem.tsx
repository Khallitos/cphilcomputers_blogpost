import type { Experience } from "@/data/cv";

/**
 * One entry in the vertical experience timeline: dot + connector line on the
 * left, role/company/period and bullets on the right. Plain semantic DOM —
 * fully keyboard- and screen-reader-accessible.
 */
export default function TimelineItem({ item }: { item: Experience }) {
  return (
    <li className="group relative pb-12 pl-12 last:pb-0">
      {/* Connector line, hidden on the last item */}
      <span
        aria-hidden="true"
        className="line absolute bottom-0 left-[7px] top-8 w-px bg-border group-last:hidden"
      />
      {/* Dot */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-accent bg-background"
      />
      <div className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">
          {item.period}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {item.role}
        </h3>
        <p className="text-sm text-muted">
          {item.company} · {item.location}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/80">
          {item.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}
