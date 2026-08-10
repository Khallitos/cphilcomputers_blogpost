import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

type Params = { slug: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.name };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <Link
        href="/projects"
        className="text-sm font-medium text-muted transition-colors hover:text-accent"
      >
        ← Projects
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
        {project.featured && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            Featured
          </span>
        )}
      </div>
      <p className="mt-2 font-mono text-sm text-muted">{project.year}</p>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/90">
        {project.tagline}
      </p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {project.description}
      </p>

      <section aria-labelledby="stack" className="mt-12">
        <h2
          id="stack"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Stack
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border px-3 py-1 font-mono text-sm text-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {project.links && (project.links.live || project.links.repo) && (
        <section aria-labelledby="links" className="mt-12">
          <h2
            id="links"
            className="text-sm font-semibold uppercase tracking-wide text-muted"
          >
            Links
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent/70 hover:bg-accent/15"
              >
                Live site ↗
              </a>
            )}
            {project.links.repo && (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                Repository ↗
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
