import type { Metadata } from "next";
import { SITE } from "./site";

const OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "Carlos Philips: System Administrator · Full-Stack Developer · AI Automation",
};

/**
 * Shared per-page metadata: title (layout template appends "· Carlos Philips"),
 * description, canonical, openGraph and twitter card.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = `${opts.title} · ${SITE.name}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: `${SITE.url}${opts.path}` },
    openGraph: {
      type: opts.type ?? "website",
      siteName: SITE.name,
      url: `${SITE.url}${opts.path}`,
      title: fullTitle,
      description: opts.description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description,
      images: [OG_IMAGE.url],
    },
  };
}
