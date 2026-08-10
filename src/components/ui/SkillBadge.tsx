export default function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent">
      {skill}
    </span>
  );
}
