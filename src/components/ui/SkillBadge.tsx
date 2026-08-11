import { SKILL_LOGO } from "@/lib/skill-logos";

export default function SkillBadge({ skill }: { skill: string }) {
  const logo = SKILL_LOGO[skill];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          loading="lazy"
          className="h-3.5 w-3.5 rounded-sm"
        />
      )}
      {skill}
    </span>
  );
}
