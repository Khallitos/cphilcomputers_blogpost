import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/mdx";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/about", "/blog", "/projects", "/experience", "/certifications", "/automation", "/playground", "/contact"].map(
    (route) => ({
      url: `${SITE.url}${route}`,
      lastModified: new Date(),
    }),
  );

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticRoutes, ...postRoutes];
}
