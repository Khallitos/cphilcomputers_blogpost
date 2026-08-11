import RSS from "rss";
import { getAllPosts } from "@/lib/mdx";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const feed = new RSS({
    title: `${SITE.name} · Blog`,
    description:
      "Notes on AI automation, infrastructure, networking, datacenters, and security, by Carlos Philips.",
    site_url: SITE.url,
    feed_url: `${SITE.url}/rss.xml`,
    language: "en",
  });

  for (const post of getAllPosts()) {
    feed.item({
      title: post.title,
      description: post.description,
      url: `${SITE.url}/blog/${post.slug}`,
      guid: `${SITE.url}/blog/${post.slug}`,
      date: post.date,
      categories: post.tags,
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
