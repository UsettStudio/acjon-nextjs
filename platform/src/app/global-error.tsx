"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Vises bare hvis selve rotlayouten feiler. Da er heller ikke oversettelsene
// tilgjengelige, så teksten står direkte her.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="nb">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1rem", textAlign: "center" }}>
        <h1>Noe gikk galt</h1>
        <p>En uventet feil oppstod. Last inn siden på nytt, eller kom tilbake senere.</p>
      </body>
    </html>
  );
}
