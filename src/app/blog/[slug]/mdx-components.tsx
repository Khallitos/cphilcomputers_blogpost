import type { MDXComponents } from "mdx/types";

/**
 * MDX component styling — shared by all blog post pages. Code blocks get a
 * simple surface panel; inline code gets a subtle chip. Fenced blocks are
 * syntax-highlighted via rehype-highlight (hljs classes) before rendering.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 {...props} className="mt-12 text-2xl font-semibold tracking-tight" />
  ),
  h3: (props) => (
    <h3 {...props} className="mt-8 text-xl font-semibold tracking-tight" />
  ),
  p: (props) => <p {...props} className="mt-4 leading-relaxed" />,
  a: (props) => (
    <a
      {...props}
      className="text-accent underline-offset-4 transition-colors hover:text-secondary"
    />
  ),
  ul: (props) => (
    <ul {...props} className="mt-4 list-disc space-y-1.5 pl-6 leading-relaxed" />
  ),
  ol: (props) => (
    <ol {...props} className="mt-4 list-decimal space-y-1.5 pl-6 leading-relaxed" />
  ),
  li: (props) => <li {...props} className="leading-relaxed" />,
  strong: (props) => <strong {...props} className="font-semibold text-foreground" />,
  blockquote: (props) => (
    <blockquote
      {...props}
      className="mt-4 border-l-2 border-accent pl-4 italic text-muted"
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
  pre: (props) => (
    <pre
      {...props}
      className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-relaxed text-foreground"
    />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-accent"
        {...props}
      >
        {children}
      </code>
    );
  },
};
