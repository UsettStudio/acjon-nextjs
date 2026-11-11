import { describe, expect, it } from "vitest";

import { emailLayout, escapeHtml } from "@/lib/email/html";

describe("e-post", () => {
  it("escaper HTML i tekst fra brukere", () => {
    expect(escapeHtml(`<script>"Ola" & 'Kari'</script>`)).toBe(
      "&lt;script&gt;&quot;Ola&quot; &amp; &#39;Kari&#39;&lt;/script&gt;",
    );
  });

  it("escaper organisasjonsnavn og lenker i layouten", () => {
    const html = emailLayout({
      heading: "Invitasjon til <b>Fjordbygg</b>",
      paragraphs: ["Hei"],
      cta: { label: "Godta", url: "https://app.example.test/invite/a?b=1&c=2" },
      footer: [],
    });
    expect(html).toContain("Invitasjon til &lt;b&gt;Fjordbygg&lt;/b&gt;");
    expect(html).toContain('href="https://app.example.test/invite/a?b=1&amp;c=2"');
  });
});
