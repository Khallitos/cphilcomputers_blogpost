import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzerklärung für cphilcomputers.com: keine Cookies, kein Tracking, DSGVO-konform.",
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Datenschutzerklärung</h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Überblick</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Der Schutz deiner Daten ist mir wichtig. Diese Website ist ein
          privates, nicht-kommerzielles Angebot und setzt bewusst auf
          Datensparsamkeit: Es werden keine Cookies gesetzt und kein
          nutzerübergreifendes Tracking eingesetzt.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Verantwortlicher
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          Carlos Philips, Offenburg, Deutschland
          <br />
          E-Mail:{" "}
          <a
            href="mailto:carlphil9924@gmail.com"
            className="text-accent transition-colors hover:text-secondary"
          >
            carlphil9924@gmail.com
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Hosting und Server-Logs
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          Diese Website wird bei Vercel gehostet und über Cloudflare
          ausgeliefert. Beim Aufruf der Seiten werden technisch notwendige
          Server-Logs erfasst (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite,
          User-Agent). Diese Daten werden ausschließlich zur Auslieferung der
          Inhalte und zur Abwehr von Angriffen verarbeitet und nicht zu
          Profilbildungszwecken verwendet.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Kontaktformular
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          Wenn du mir über das Kontaktformular schreibst, werden dein Name,
          deine E-Mail-Adresse und deine Nachricht ausschließlich zur Beantwortung
          deiner Anfrage verwendet. Die Daten werden nicht langfristig
          gespeichert und nicht an Dritte weitergegeben. Für den Versand der
          Nachricht kann der Dienst Resend (resend.com) als E-Mail-Anbieter
          eingesetzt werden.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Für eine grobe, datenschutzfreundliche Auswertung der Besucherzahlen
          wird Cloudflare Analytics (cookieless) eingesetzt. Dabei werden keine
          Cookies gesetzt und keine personenbezogenen Daten gespeichert.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Deine Rechte (DSGVO)
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          Du hast jederzeit das Recht auf Auskunft über die zu deiner Person
          gespeicherten Daten sowie auf Berichtigung, Löschung und
          Einschränkung der Verarbeitung. Außerdem hast du das Recht, dich bei
          einer Datenschutz-Aufsichtsbehörde zu beschweren. Für alle Anfragen
          genügt eine E-Mail an{" "}
          <a
            href="mailto:carlphil9924@gmail.com"
            className="text-accent transition-colors hover:text-secondary"
          >
            carlphil9924@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
