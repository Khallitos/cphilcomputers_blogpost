import { promises as fs } from "fs";
import path from "path";

export type ProjectLinks = {
  live?: string;
  repo?: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  links?: ProjectLinks;
  featured: boolean;
  year: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

/** Reads every project JSON file and sorts featured projects first, then newest. */
export async function getAllProjects(): Promise<Project[]> {
  const files = (await fs.readdir(CONTENT_DIR)).filter((f) =>
    f.endsWith(".json"),
  );

  const projects = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf-8");
      return JSON.parse(raw) as Project;
    }),
  );

  return projects.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.year - a.year;
  });
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug);
}
