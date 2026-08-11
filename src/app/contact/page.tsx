"use client";

import { useState, type FormEvent } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const inputClasses =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? ""),
    };

    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        form.reset();
        setStatus({ kind: "success" });
      } else {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setStatus({
          kind: "error",
          message: body?.error ?? "Something went wrong — please try again.",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Network error — please check your connection and try again.",
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Questions, ideas, or just want to say hi? Drop a message — I read
        everything and usually reply within a couple of days.
      </p>

      {status.kind === "success" && (
        <div
          role="status"
          className="mt-8 rounded-lg border border-accent/40 bg-surface px-4 py-3 text-sm text-accent"
        >
          Message sent — thanks for reaching out! I&apos;ll get back to you
          soon.
        </div>
      )}

      {status.kind === "error" && (
        <div
          role="alert"
          className="mt-8 rounded-lg border border-red-500/40 bg-surface px-4 py-3 text-sm text-red-400"
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Honeypot — hidden from humans and screen readers; bots fill it in. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            placeholder="Leave this field empty"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Write your message…"
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
