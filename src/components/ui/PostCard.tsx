import Link from "next/link";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

/**
 * Renders a single blog post card. With no `post` prop it renders a
 * "coming soon" empty state for the Latest Posts section.
 */
export default function PostCard({ post }: { post?: Post }) {
  if (!post) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
        <p className="font-medium text-foreground">No posts yet</p>
        <p className="mt-2 text-sm text-muted">
          The first post is on its way — check back soon.
        </p>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50">
      <Link href={`/blog/${post.slug}`} className="block">
        <time dateTime={post.date} className="font-mono text-xs text-muted">
          {post.date}
        </time>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {post.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </Link>
    </article>
  );
}
