import type { Metadata } from "next";
import SkillBadge from "@/components/ui/SkillBadge";
import TimelineItem from "@/components/ui/TimelineItem";
import { EDUCATION, EXPERIENCE } from "@/data/cv";
import { SKILL_GROUPS } from "@/data/skills";

export const metadata: Metadata = {
  title: "Experience",
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Experience</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Where I&apos;ve kept critical systems running — data centers, banking,
        and oil &amp; gas, newest first.
      </p>

      {/* Work timeline */}
      <ol className="mt-12">
        {EXPERIENCE.map((item) => (
          <TimelineItem key={`${item.company}-${item.role}`} item={item} />
        ))}
      </ol>

      {/* Education */}
      <section aria-labelledby="education" className="mt-20">
        <h2
          id="education"
          className="text-2xl font-semibold tracking-tight"
        >
          Education
        </h2>
        <ul className="mt-6 space-y-4">
          {EDUCATION.map((entry) => (
            <li
              key={entry.degree}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <p className="font-semibold text-foreground">{entry.degree}</p>
              <p className="mt-1 text-sm text-muted">
                {entry.school} · {entry.period}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Skills */}
      <section aria-labelledby="skills" className="mt-20 pb-8">
        <h2 id="skills" className="text-2xl font-semibold tracking-tight">
          Skills
        </h2>
        <div className="mt-8 space-y-8">
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
      </section>
    </div>
  );
}
