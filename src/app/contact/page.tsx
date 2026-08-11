import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with Carlos Philips: questions, ideas, or just to say hi.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Questions, ideas, or just want to say hi? Drop a message; I read
        everything and usually reply within a couple of days.
      </p>

      <ContactForm />

      <p className="mt-10 text-sm text-muted">
        Prefer email? Write directly to{" "}
        <a
          href="mailto:carlphil9924@gmail.com"
          className="text-accent transition-colors hover:text-secondary"
        >
          carlphil9924@gmail.com
        </a>
        . Legal info:{" "}
        <Link
          href="/impressum"
          className="text-accent transition-colors hover:text-secondary"
        >
          Impressum
        </Link>{" "}
        ·{" "}
        <Link
          href="/datenschutz"
          className="text-accent transition-colors hover:text-secondary"
        >
          Datenschutz
        </Link>
      </p>
    </div>
  );
}
