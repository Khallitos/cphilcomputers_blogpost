import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CommandPaletteWrapper from "@/components/layout/CommandPaletteWrapper";
import { SITE } from "@/lib/site";

const OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "Carlos Philips: Data Center & Network Engineer · Full-Stack Developer · AI Automation",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: "%s · Carlos Philips",
  },
  description:
    "Personal site and blog of Carlos Philips: Data Center & Network Engineer, Full-Stack Developer, and AI Automation.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: SITE.name,
    description:
      "Personal site and blog of Carlos Philips: Data Center & Network Engineer, Full-Stack Developer, and AI Automation.",
    images: [OG_IMAGE],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description:
      "Personal site and blog of Carlos Philips: Data Center & Network Engineer, Full-Stack Developer, and AI Automation.",
    images: [OG_IMAGE.url],
  },
};

// Sets the theme before first paint to avoid a flash of the wrong theme.
// Standard pattern: only touch the attribute when the visitor has a stored
// preference; otherwise the server default (dark) already on the tag stays.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  url: SITE.url,
  jobTitle: "IT Infrastructure Engineer & Full-Stack Developer",
  sameAs: [
    "https://github.com/Khallitos",
    "https://www.linkedin.com/in/carlos-philips-66774216a/",
    "https://instagram.com/carl_philzz",
    "https://www.youtube.com/@AfroFusionBuzz",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <Nav />
        {/* Offset the content column for the fixed desktop sidebar */}
        <div className="flex min-h-full flex-1 flex-col lg:pl-64">
          <main id="main" className="flex-1 pt-16 lg:pt-0">
            {children}
          </main>
          <Footer />
        </div>
        <CommandPaletteWrapper />
      </body>
    </html>
  );
}
