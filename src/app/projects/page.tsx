import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Selected projects by Carlos Philips: from a multi-tenant SaaS platform to QR restaurant menus and more.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        A mix of production systems, security research, and experiments,
        from bank check-scanner operations to AI tools.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {project.name}
                </h2>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {project.year}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {project.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm font-medium">
              {project.links?.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent transition-colors hover:text-secondary"
                >
                  Live ↗
                </a>
              )}
              {project.links?.repo && (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent transition-colors hover:text-secondary"
                >
                  Repo ↗
                </a>
              )}
              <Link
                href={`/projects/${project.slug}`}
                className="text-foreground transition-colors hover:text-accent"
              >
                Details →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
