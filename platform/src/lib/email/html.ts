/** Escaper tekst før den settes inn i HTML i e-post. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Enkel, robust e-postlayout som fungerer i de vanligste e-postklientene. */
export function emailLayout({ heading, paragraphs, cta, footer }: {
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
  footer: string[];
}): string {
  const p = (text: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#1f2933">${escapeHtml(text)}</p>`;
  const small = (text: string) => `<p style="margin:0 0 8px;font-size:13px;line-height:20px;color:#52606d">${escapeHtml(text)}</p>`;
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#1f3a5f;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html lang="nb"><body style="margin:0;padding:24px;background:#f5f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td>
<h1 style="margin:0 0 16px;font-size:22px;line-height:30px;color:#1f2933">${escapeHtml(heading)}</h1>
${paragraphs.map(p).join("")}
${button}
${footer.map(small).join("")}
</td></tr></table></td></tr></table></body></html>`;
}
