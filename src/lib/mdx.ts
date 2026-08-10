import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Post = {
  slug: string;
  title: string;
  /** ISO date string (from frontmatter `date`). */
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
  /** Raw MDX body — only populated by `getPostBySlug`. */
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function readPostFile(fileName: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: fileName.replace(/\.mdx$/, ""),
    title: String(data.title ?? fileName),
    date: toIsoDate(data.date),
    description: String(data.description ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: Boolean(data.draft),
    content: content.trim(),
  };
}

/** All published posts, newest first. */
export function getAllPosts(): Post[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(readPostFile)
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** A single published post (with raw MDX body), or undefined if missing/draft. */
export function getPostBySlug(slug: string): Post | undefined {
  const fileName = `${slug}.mdx`;
  if (!fs.existsSync(path.join(POSTS_DIR, fileName))) return undefined;
  const post = readPostFile(fileName);
  return post.draft ? undefined : post;
}

/** All tags across published posts, sorted alphabetically. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Formats an ISO date as e.g. "August 11, 2026". */
export function formatPostDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
