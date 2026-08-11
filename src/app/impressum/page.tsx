import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum (Angaben gemäß § 5 TMG) für das private Angebot von Carlos Philips.",
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Impressum</h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Angaben gemäß § 5 TMG
        </h2>
        <address className="mt-4 not-italic leading-relaxed text-muted">
          Carlos Philips
          <br />
          Offenburg
          <br />
          Deutschland
        </address>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Kontakt</h2>
        <p className="mt-4 leading-relaxed text-muted">
          E-Mail:{" "}
          <a
            href="mailto:carlphil9924@gmail.com"
            className="text-accent transition-colors hover:text-secondary"
          >
            carlphil9924@gmail.com
          </a>
          <br />
          Telefon:{" "}
          <a
            href="tel:+4917632558189"
            className="text-accent transition-colors hover:text-secondary"
          >
            +49 176 3255 8189
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Verantwortlich für den Inhalt (gemäß § 55 Abs. 2 RStV)
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          Carlos Philips
          <br />
          (Anschrift wie oben)
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Hinweis</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Bei dieser Website handelt es sich um ein privates, nicht-kommerzielles
          Angebot. Alle Inhalte werden ohne Gewähr zur Verfügung gestellt. Trotz
          sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die
          Inhalte externer Links; für den Inhalt der verlinkten Seiten sind
          ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>
    </div>
  );
}
