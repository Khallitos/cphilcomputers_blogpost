"use client";

import { useMemo, useState } from "react";
import PostCard from "@/components/ui/PostCard";

export type ArchivePost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
};

/**
 * Client-side blog archive: tag filter chips + title search, plain JS only.
 */
export default function BlogArchive({
  posts,
  tags,
}: {
  posts: ArchivePost[];
  tags: string[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      const matchesQuery = !q || post.title.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [posts, activeTag, query]);

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4">
        <label className="sr-only" htmlFor="blog-search">
          Search posts by title
        </label>
        <input
          id="blog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search posts by title…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
              activeTag === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent/50 hover:text-foreground"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              aria-pressed={activeTag === tag}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                activeTag === tag
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-8 grid gap-4">
          {filtered.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
              {post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-muted">
          No posts match{activeTag ? ` the “${activeTag}” tag` : ""}
          {query.trim() ? ` and “${query.trim()}”` : ""}. Try a different filter.
        </p>
      )}
    </div>
  );
}
