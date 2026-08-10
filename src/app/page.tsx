import Link from "next/link";
import Hero from "@/components/home/Hero";
import PostCard from "@/components/ui/PostCard";
import type { Post } from "@/components/ui/PostCard";
import ProjectCard from "@/components/ui/ProjectCard";
import { getAllPosts, formatPostDate } from "@/lib/mdx";
import { FEATURED_PROJECTS } from "@/lib/site";

export default function Home() {
  const posts: Post[] = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.description,
    date: formatPostDate(post.date),
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6">
      <Hero />

      <section aria-labelledby="featured-projects" className="pb-20">
        <h2
          id="featured-projects"
          className="text-2xl font-semibold tracking-tight"
        >
          Featured Projects
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROJECTS.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </section>

      <section aria-labelledby="latest-posts" className="pb-20">
        <h2
          id="latest-posts"
          className="text-2xl font-semibold tracking-tight"
        >
          Latest Posts
        </h2>
        <div className="mt-6">
          {posts.length > 0 ? (
            <ul className="grid gap-4">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <PostCard />
          )}
        </div>
      </section>

      <section aria-label="Playground teaser" className="pb-28">
        <Link
          href="/playground"
          className="group inline-flex items-center gap-2 text-accent transition-colors hover:text-secondary"
        >
          <span className="font-medium">Pop a few balloons</span>
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </section>
    </div>
  );
}
