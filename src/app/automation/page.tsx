import { pageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = pageMetadata({
  title: "Automation Lab",
  description:
    "Hands-on automation experiments by Carlos Philips — AI agents, infrastructure automation and self-hosted tools.",
  path: "/automation",
});

type AutomationCard = {
  title: string;
  icon: ReactNode;
  body: string[];
  href: string;
};

type PipelineStep = {
  step: string;
  label: string;
  sub?: string;
};

/** Publish pipeline: trigger → draft → checks → commit → deploy. */
export const PIPELINE: PipelineStep[] = [
  { step: "01", label: "Trigger", sub: "Telegram message" },
  { step: "02", label: "Agent drafts", sub: "content" },
  { step: "03", label: "Run checks", sub: "lint / build / test" },
  { step: "04", label: "Commit & push" },
  { step: "05", label: "Auto-deploy" },
];

export const CARDS: AutomationCard[] = [
  {
    title: "AI Agent Orchestration",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <circle cx="5" cy="12" r="2.2" />
        <circle cx="19" cy="5" r="2.2" />
        <circle cx="19" cy="19" r="2.2" />
        <path d="M7.2 11.1 16.8 5.9M7.2 12.9l9.6 5.2" />
      </svg>
    ),
    body: [
      "Autonomous agents that draft content, run checks, and deploy — coordinated by an orchestrator that keeps each step honest.",
      "Instead of one long prompt, a team of specialised agents builds, verifies, and ships while I review the pull request.",
    ],
    href: "/blog/running-my-blog-with-ai-agents",
  },
  {
    title: "n8n",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="15" y="15" width="6" height="6" rx="1.5" />
        <path d="M9 6h3a3 3 0 0 1 3 3v6" />
      </svg>
    ),
    body: [
      "Visual workflow automation for everything that repeats — my publish pipeline is a chain of small, testable steps.",
      "Trigger → draft → commit → deploy: one webhook starts the whole run and each step only fires when the last one passes.",
    ],
    href: "/blog/running-my-blog-with-ai-agents",
  },
  {
    title: "Power Automate",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
      </svg>
    ),
    body: [
      "Microsoft 365 flows that grease the daily grind — approval chains, onboarding automation, and the paperwork nobody wants to redo.",
      "A new starter gets accounts, docs, and equipment assigned by one flow, with every approval tracked in the audit trail.",
    ],
    href: "/blog/running-my-blog-with-ai-agents",
  },
];

export default function AutomationPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Automation Lab</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        The machines I build to do the boring parts — so I can do the
        interesting ones.
      </p>

      {/* Publish pipeline workflow diagram */}
      <section aria-labelledby="publish-pipeline" className="mt-12">
        <h2
          id="publish-pipeline"
          className="text-xl font-semibold tracking-tight"
        >
          Publish pipeline
        </h2>
        <div className="mt-6 rounded-xl border border-border bg-surface/40 p-6">
          <svg
            viewBox="0 0 1000 130"
            role="img"
            aria-labelledby="publish-pipeline-title"
            className="h-auto w-full"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <title id="publish-pipeline-title">
              Publish pipeline workflow: Telegram trigger, an agent drafts
              content, checks run (lint, build, test), commit and push, then
              auto-deploy
            </title>
            <defs>
              <marker
                id="pipeline-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" className="fill-accent" />
              </marker>
            </defs>

            {PIPELINE.map((item, index) => {
              const boxX = 20 + index * 200;
              return (
                <g key={item.step}>
                  <rect
                    x={boxX}
                    y={35}
                    width="160"
                    height="60"
                    rx="12"
                    className="fill-surface stroke-border"
                    strokeWidth="1.5"
                  />
                  <text
                    x={boxX + 14}
                    y={52}
                    className="fill-accent"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
                  >
                    {item.step}
                  </text>
                  <text
                    x={boxX + 80}
                    y={item.sub ? 63 : 66}
                    textAnchor="middle"
                    className="fill-foreground font-semibold"
                    style={{ fontSize: 14 }}
                  >
                    {item.label}
                  </text>
                  {item.sub && (
                    <text
                      x={boxX + 80}
                      y={80}
                      textAnchor="middle"
                      className="fill-muted"
                      style={{ fontSize: 11 }}
                    >
                      {item.sub}
                    </text>
                  )}
                  {index < PIPELINE.length - 1 && (
                    <line
                      x1={boxX + 166}
                      y1={65}
                      x2={boxX + 194}
                      y2={65}
                      strokeWidth={2}
                      className="stroke-accent"
                      markerEnd="url(#pipeline-arrow)"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="flex flex-col rounded-xl border border-border bg-surface p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
              {card.icon}
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              {card.title}
            </h2>
            <div className="mt-2 space-y-2">
              {card.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <a
              href={card.href}
              className="mt-auto pt-5 text-sm font-medium text-accent transition-colors hover:text-secondary"
            >
              Read more →
            </a>
          </article>
        ))}
      </div>

      <p className="mt-12 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-6 text-sm leading-relaxed text-muted">
        Automation is how I multiply my time — the workflows above run my
        day-to-day.
      </p>
    </div>
  );
}
