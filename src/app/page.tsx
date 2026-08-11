import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import ExperienceRow from "@/components/home/ExperienceRow";
import ProjectCard from "@/components/ui/ProjectCard";
import SkillBadge from "@/components/ui/SkillBadge";
import PostCard from "@/components/ui/PostCard";
import { EDUCATION, EXPERIENCE } from "@/data/cv";
import { SKILL_GROUPS } from "@/data/skills";
import { getAllProjects } from "@/lib/projects";
import { getAllPosts, formatPostDate } from "@/lib/mdx";
import { getCertifications } from "@/app/certifications/page";
import { CARDS, PIPELINE } from "@/app/automation/page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE.name },
  description:
    "Personal site and blog of Carlos Philips: System Administrator, Full-Stack Developer, and AI Automation.",
};

const LANGUAGES = [
  { name: "English", level: "Native" },
  { name: "Twi", level: "Native" },
  { name: "German", level: "B1, actively improving" },
];

function SectionHeading({ index, title }: { index?: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      {index && <span className="font-mono text-sm text-accent">{index}.</span>}
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function MoreLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <p className="mt-10">
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="group inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-secondary"
      >
        <span>{children}</span>
        <span
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </a>
    </p>
  );
}

export default async function Home() {
  const projects = await getAllProjects();
  const certifications = await getCertifications();
  const posts = getAllPosts()
    .slice(0, 3)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.description,
      date: formatPostDate(post.date),
    }));

  return (
    <div>
      <Hero />

      {/* About */}
      <section id="about" aria-labelledby="about-heading" className="px-6">
        <div className="mx-auto w-full max-w-4xl py-24">
          <SectionHeading index="01" title="About" />
          <div className="mt-10 flex flex-col items-center gap-10 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <Image
                src="/images/carlos-hero.webp"
                alt="Carlos Philips"
                width={852}
                height={852}
                priority
                className="w-56 rounded-2xl border-2 border-accent/40 object-cover shadow-xl shadow-black/40 sm:w-64"
              />
              <Image
                src="/images/carlos-avatar.webp"
                alt=""
                width={512}
                height={512}
                className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full border-4 border-background object-cover"
              />
            </div>
            <div className="space-y-4 text-base leading-relaxed text-foreground/90">
              <p>
                I&apos;m a system administrator and IT infrastructure engineer
                with five-plus years keeping critical systems running across
                banking and FinTech, oil and gas, and software development. My
                work sits where security and reliability meet: dependable
                infrastructure you can trust, hardened end to end.
              </p>
              <p>
                The through-line of my career is zero-error delivery on
                mission-critical systems. I&apos;ve kept a national
                check-clearing network alive across more than a hundred bank
                workstations, modernized endpoint and identity management with
                Microsoft Intune and Entra ID for hundreds of users, and
                secured the systems behind oil and gas operations, all while
                enforcing the same discipline that earned a zero-incident
                record.
              </p>
              <p>
                Today I&apos;m deepening that with an MSc in Enterprise and IT
                Security, because the systems I build have to be safe as well
                as stable. When I&apos;m not hardening infrastructure,
                I&apos;m building full-stack applications, or popping balloons
                on this very site.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {LANGUAGES.map((language) => (
              <div
                key={language.name}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="font-semibold text-foreground">
                  {language.name}
                </p>
                <p className="mt-1 text-sm text-muted">{language.level}</p>
              </div>
            ))}
          </div>

          <Link
            href="/playground"
            className="group mt-12 flex flex-col gap-2 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-6 transition-colors hover:border-accent/70 hover:bg-accent/10"
          >
            <span className="text-lg font-semibold text-accent">
              🎈 Three balloons hide three things about me.
            </span>
            <span className="text-sm text-muted group-hover:text-foreground">
              Go pop them.
            </span>
          </Link>
        </div>
      </section>

      {/* Experience */}
      <section
        id="experience"
        aria-labelledby="experience-heading"
        className="px-6"
      >
        <div className="mx-auto w-full max-w-4xl py-24">
          <SectionHeading index="02" title="Experience" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            Where I&apos;ve kept critical systems running: data centers,
            banking, and oil &amp; gas, newest first.
          </p>

          <ol className="mt-12 space-y-12">
            {EXPERIENCE.map((item) => (
              <ExperienceRow
                key={`${item.company}-${item.role}`}
                item={item}
              />
            ))}
          </ol>

          <MoreLink href="/resume.pdf" external>
            View Full Résumé
          </MoreLink>

          <div className="mt-20">
            <h3 className="text-xl font-semibold tracking-tight">Education</h3>
            <ul className="mt-6 space-y-4">
              {EDUCATION.map((entry) => (
                <li
                  key={entry.degree}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <p className="font-semibold text-foreground">
                    {entry.degree}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {entry.school} · {entry.period}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="px-6"
      >
        <div className="mx-auto w-full max-w-4xl py-24">
          <SectionHeading index="03" title="Projects" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            A mix of production systems, security research, and experiments,
            from bank check-scanner operations to AI tools.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          <MoreLink href="/projects">View Full Project Archive</MoreLink>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" aria-labelledby="skills-heading" className="px-6">
        <div className="mx-auto w-full max-w-3xl py-24">
          <SectionHeading index="04" title="Skills" />
          <div className="mt-12 space-y-8">
            {SKILL_GROUPS.map((group) => (
              <div key={group.group}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {group.group}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section
        id="certifications"
        aria-labelledby="certifications-heading"
        className="px-6"
      >
        <div className="mx-auto w-full max-w-3xl py-24">
          <SectionHeading index="05" title="Certifications" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            Courses and mastery awards that back up the work.
          </p>

          <ul className="mt-12 space-y-4">
            {certifications.map((cert) => (
              <li
                key={`${cert.issuer}-${cert.name}`}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {cert.issuer}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
                      {cert.name}
                    </h3>
                  </div>
                  {cert.badgeImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cert.badgeImage}
                      alt={`${cert.name} badge`}
                      className="h-16 w-16 rounded-lg object-contain"
                    />
                  )}
                </div>
                {cert.date && (
                  <p className="mt-2 font-mono text-xs text-muted">
                    {cert.date}
                  </p>
                )}
                {cert.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {cert.description}
                  </p>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-medium text-accent transition-colors hover:text-secondary"
                  >
                    View credential ↗
                  </a>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-12 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-6 text-sm leading-relaxed text-muted">
            More certifications incoming as I progress through my MSc.
          </p>
        </div>
      </section>

      {/* Automation */}
      <section
        id="automation"
        aria-labelledby="automation-heading"
        className="px-6"
      >
        <div className="mx-auto w-full max-w-3xl py-24">
          <SectionHeading index="06" title="Automation Lab" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            The machines I build to do the boring parts, so I can do the
            interesting ones.
          </p>

          <div className="mt-12">
            <h3 className="text-xl font-semibold tracking-tight">
              Publish pipeline
            </h3>
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
                  content, checks run (lint, build, test), commit and push,
                  then auto-deploy
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
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {CARDS.map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {card.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  {card.title}
                </h3>
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
            Automation is how I multiply my time; the workflows above run my
            day-to-day.
          </p>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" aria-labelledby="blog-heading" className="px-6">
        <div className="mx-auto w-full max-w-4xl py-24">
          <SectionHeading title="Blog" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            Notes from the trenches: AI automation, infrastructure,
            networking, and security.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          <MoreLink href="/blog">View all posts</MoreLink>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" aria-labelledby="contact-heading" className="px-6">
        <div className="mx-auto w-full max-w-3xl py-24 pb-32">
          <SectionHeading index="07" title="Get in touch" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            I&apos;m open to IT support, developer, and AI automation roles.
            Whether you have a question, an idea, or just want to say hi, my
            inbox is always open.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="mailto:carlphil9924@gmail.com"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-secondary"
            >
              Say hello
            </a>
            <Link
              href="/contact"
              className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Contact form
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {SITE.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  {...(social.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-sm font-medium text-muted transition-colors hover:text-accent"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
