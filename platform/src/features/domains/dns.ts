import { z } from "zod";

/**
 * DNS-oppslag over HTTPS (JSON-formatet til Cloudflare og Google). Brukes til
 * domenesjekken: oppslaget går direkte til en offentlig resolver, så svaret
 * ikke påvirkes av mellomlager i serverens eget nettverk.
 */

export type DnsRecordType = "A" | "AAAA" | "CNAME" | "TXT";

const TYPE_CODES: Record<DnsRecordType, number> = { A: 1, CNAME: 5, TXT: 16, AAAA: 28 };

const dohResponseSchema = z.object({
  Status: z.number(),
  Answer: z
    .array(z.object({ name: z.string(), type: z.number(), data: z.string() }))
    .optional(),
});

export class DnsLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DnsLookupError";
  }
}

/** Én TXT-verdi kan være delt i flere strenger i anførselstegn: «"abc" "def"» → «abcdef». */
export function parseTxtData(data: string): string {
  const parts = [...data.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((match) => (match[1] ?? "").replace(/\\(.)/g, "$1"));
  return parts.length > 0 ? parts.join("") : data;
}

/** Vertsnavn uten punktum til slutt, med små bokstaver. */
export function normalizeDnsName(name: string): string {
  return name.trim().toLowerCase().replace(/\.$/, "");
}

export async function dnsLookup(
  resolverUrl: string,
  name: string,
  type: DnsRecordType,
  fetchImpl: typeof fetch = fetch,
): Promise<string[]> {
  const url = new URL(resolverUrl);
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);
  let response: Response;
  try {
    response = await fetchImpl(url, {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    throw new DnsLookupError(`DNS-oppslaget feilet: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) {
    throw new DnsLookupError(`DNS-oppslaget svarte ${response.status}`);
  }
  const parsed = dohResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    throw new DnsLookupError("Ugyldig svar fra DNS-oppslaget");
  }
  // 0 = funnet, 3 = navnet finnes ikke. Andre koder er feil hos resolveren.
  if (parsed.data.Status === 3) {
    return [];
  }
  if (parsed.data.Status !== 0) {
    throw new DnsLookupError(`DNS-oppslaget svarte med status ${parsed.data.Status}`);
  }
  const code = TYPE_CODES[type];
  return (parsed.data.Answer ?? [])
    .filter((answer) => answer.type === code)
    .map((answer) => (type === "TXT" ? parseTxtData(answer.data) : normalizeDnsName(answer.data)));
}
