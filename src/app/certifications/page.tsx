import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certifications",
};

export type Certification = {
  name: string;
  issuer: string;
  date?: string;
  description?: string;
  credentialUrl?: string;
  badgeImage?: string;
};

const CONTENT_FILE = path.join(process.cwd(), "content", "certifications.json");

async function getCertifications(): Promise<Certification[]> {
  const raw = await fs.readFile(CONTENT_FILE, "utf-8");
  return JSON.parse(raw) as Certification[];
}

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Certifications</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
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
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
                  {cert.name}
                </h2>
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
              <p className="mt-2 font-mono text-xs text-muted">{cert.date}</p>
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
  );
}
