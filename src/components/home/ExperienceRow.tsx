import type { Experience } from "@/data/cv";

/**
 * One experience entry in brittanychiang.com style: role @ company on the
 * left/top, period on the right, bullets below, tech tags last. Plain
 * semantic DOM; keyboard- and screen-reader-accessible.
 */
export default function ExperienceRow({ item }: { item: Experience }) {
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          <span className="text-accent">{item.role}</span>
          <span className="text-muted"> @ {item.company}</span>
        </h3>
        <p className="font-mono text-xs text-muted">{item.period}</p>
      </div>
      <ul className="mt-4 space-y-2">
        {item.bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-3 text-sm leading-relaxed text-foreground/80"
          >
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent">
              ▹
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <li
            key={tag}
            className="rounded border border-accent/30 bg-accent/5 px-2.5 py-0.5 font-mono text-xs text-accent"
          >
            {tag}
          </li>
        ))}
      </ul>
    </li>
  );
}
