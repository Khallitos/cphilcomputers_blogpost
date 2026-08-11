import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/mdx";
import { SITE } from "@/lib/site";
import { mdxComponents } from "./mdx-components";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE.url}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      siteName: SITE.name,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-default.png"],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            url: `${SITE.url}/blog/${post.slug}`,
            author: { "@type": "Person", name: SITE.name, url: SITE.url },
          }),
        }}
      />
      <Link
        href="/blog"
        className="text-sm font-medium text-accent transition-colors hover:text-secondary"
      >
        ← All posts
      </Link>

      <header className="mt-6">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <time dateTime={post.date} className="font-mono text-muted">
            {formatPostDate(post.date)}
          </time>
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="mt-8">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
        />
      </div>

      <footer className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        {newer ? (
          <Link
            href={`/blog/${newer.slug}`}
            className="group max-w-xs text-sm transition-colors hover:text-accent"
          >
            <span className="block font-mono text-xs text-muted">Newer</span>
            <span className="mt-0.5 block font-medium group-hover:underline">
              {newer.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {older ? (
          <Link
            href={`/blog/${older.slug}`}
            className="group max-w-xs text-right text-sm transition-colors hover:text-accent"
          >
            <span className="block font-mono text-xs text-muted">Older</span>
            <span className="mt-0.5 block font-medium group-hover:underline">
              {older.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </article>
  );
}
