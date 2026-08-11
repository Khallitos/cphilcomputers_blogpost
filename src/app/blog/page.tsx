import { pageMetadata } from "@/lib/seo";
import BlogArchive from "./BlogArchive";
import { getAllPosts, getAllTags, formatPostDate } from "@/lib/mdx";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Notes on AI automation, infrastructure, networking, datacenters, and security, by Carlos Philips.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.description,
    date: formatPostDate(post.date),
    tags: post.tags,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Practical notes on AI automation, infrastructure, networking, and
        security, written from the trenches.
      </p>

      <BlogArchive posts={posts} tags={getAllTags()} />
    </div>
  );
}
