/**
 * Godtar bare interne stier som «/abc». Hindrer åpne omdirigeringer via
 * ?next=https://angriper.no eller //angriper.no.
 */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\u007f\\]/.test(value)) {
    return fallback;
  }
  try {
    const url = new URL(value, "http://intern.invalid");
    if (url.origin !== "http://intern.invalid") {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
