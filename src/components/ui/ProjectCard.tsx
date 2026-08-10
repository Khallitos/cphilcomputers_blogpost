import Link from "next/link";
import type { Project } from "@/lib/site";

export default function ProjectCard({ project }: { project: Project }) {
  const external = project.href?.startsWith("http") ?? false;

  const card = (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {project.name}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-muted">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted"
          >
            {tech}
          </span>
        ))}
      </div>
      {project.href && (
        <span className="text-sm font-medium text-accent">Visit site →</span>
      )}
    </article>
  );

  if (!project.href) return card;

  return external ? (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      {card}
    </a>
  ) : (
    <Link href={project.href} className="block h-full">
      {card}
    </Link>
  );
}
