import { describe, expect, it, vi } from "vitest";

import { DnsLookupError, dnsLookup, parseTxtData } from "@/features/domains/dns";
import { hostnameProblem, isApexDomain, normalizeHostname } from "@/features/domains/hostname";
import { evaluateDomain, parseDomainError, parseDomainRecords } from "@/features/domains/records";
import { VercelDomainsClient, type VercelApiError } from "@/features/domains/vercel";
import { primaryRedirect } from "@/lib/primary-host";

const settings = { txtPrefix: "_excip", cnameTarget: "cname.vercel-dns.com", aRecord: "76.76.21.21" };
const token = "0123456789abcdef0123456789abcdef";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("normalizeHostname", () => {
  it("fjerner protokoll, sti, port og punktum til slutt", () => {
    expect(normalizeHostname(" https://WWW.Fjordparken.no/boliger?x=1 ")).toBe("www.fjordparken.no");
    expect(normalizeHostname("fjordparken.no.")).toBe("fjordparken.no");
    expect(normalizeHostname("www.fjordparken.no:443")).toBe("www.fjordparken.no");
  });

  it("gjør om norske bokstaver til punycode", () => {
    expect(normalizeHostname("www.fjordutsikt-æøå.no")).toMatch(/^www\.xn--fjordutsikt--.+\.no$/);
  });

  it("avviser tomme og ugyldige verdier", () => {
    expect(normalizeHostname("")).toBeNull();
    expect(normalizeHostname("ola@fjordparken.no")).toBeNull();
    expect(normalizeHostname("min side.no")).toBeNull();
  });
});

describe("hostnameProblem", () => {
  const check = (hostname: string) => hostnameProblem(hostname, "boligplattform.no", "https://app.boligplattform.no");

  it("godtar vanlige domener og underdomener", () => {
    expect(check("www.fjordparken.no")).toBeNull();
    expect(check("fjordparken.no")).toBeNull();
    expect(check("boliger.utbygger.no")).toBeNull();
  });

  it("avviser plattformens egne adresser og Vercel", () => {
    expect(check("boligplattform.no")).toBe("hostnamePlatform");
    expect(check("fjordparken.boligplattform.no")).toBe("hostnamePlatform");
    expect(check("app.boligplattform.no")).toBe("hostnamePlatform");
    expect(check("prosjekt.vercel.app")).toBe("hostnamePlatform");
  });

  it("avviser vertsnavn som ikke kan brukes på internett", () => {
    expect(check("localhost")).toBe("hostnameInvalid");
    expect(check("server.local")).toBe("hostnameInvalid");
    expect(check("10.0.0.1")).toBe("hostnameInvalid");
    expect(check("-feil.no")).toBe("hostnameInvalid");
    expect(check(`${"a".repeat(64)}.no`)).toBe("hostnameInvalid");
  });
});

describe("isApexDomain", () => {
  it("bruker rotdomenet fra Vercel når det finnes", () => {
    expect(isApexDomain("fjordparken.no")).toBe(true);
    expect(isApexDomain("www.fjordparken.no")).toBe(false);
    expect(isApexDomain("fjordparken.co.uk", "fjordparken.co.uk")).toBe(true);
  });
});

describe("DNS over HTTPS", () => {
  it("setter sammen TXT-verdier som er delt i flere strenger", () => {
    expect(parseTxtData('"abc" "def"')).toBe("abcdef");
    expect(parseTxtData('"med \\"sitat\\""')).toBe('med "sitat"');
    expect(parseTxtData("uten-anførsel")).toBe("uten-anførsel");
  });

  it("henter bare postene av typen det spørres etter", async () => {
    const fetchImpl = vi.fn(async (url: URL | RequestInfo) => {
      const parsed = new URL(String(url));
      expect(parsed.searchParams.get("name")).toBe("www.fjordparken.no");
      expect(parsed.searchParams.get("type")).toBe("A");
      return jsonResponse({
        Status: 0,
        Answer: [
          { name: "www.fjordparken.no.", type: 5, data: "cname.vercel-dns.com." },
          { name: "cname.vercel-dns.com.", type: 1, data: "76.76.21.21" },
        ],
      });
    });
    await expect(dnsLookup("https://dns.example/dns-query", "www.fjordparken.no", "A", fetchImpl as typeof fetch)).resolves.toEqual([
      "76.76.21.21",
    ]);
  });

  it("gir tom liste når navnet ikke finnes, og feil når resolveren feiler", async () => {
    const nxdomain = vi.fn(async () => jsonResponse({ Status: 3 }));
    await expect(dnsLookup("https://dns.example/dns-query", "x.no", "TXT", nxdomain as typeof fetch)).resolves.toEqual([]);
    const servfail = vi.fn(async () => jsonResponse({ Status: 2 }));
    await expect(dnsLookup("https://dns.example/dns-query", "x.no", "TXT", servfail as typeof fetch)).rejects.toBeInstanceOf(
      DnsLookupError,
    );
    const down = vi.fn(async () => new Response("nede", { status: 502 }));
    await expect(dnsLookup("https://dns.example/dns-query", "x.no", "TXT", down as typeof fetch)).rejects.toBeInstanceOf(
      DnsLookupError,
    );
  });
});

describe("evaluateDomain", () => {
  const empty = { txt: [], cname: [], a: [] };

  it("viser TXT og CNAME for et underdomene, og venter til TXT-posten finnes", () => {
    const result = evaluateDomain("www.fjordparken.no", token, settings, empty, null);
    expect(result.status).toBe("pending");
    expect(result.error).toBe("txt_missing");
    expect(result.records).toEqual([
      { type: "TXT", name: "_excip.www.fjordparken.no", value: token, purpose: "ownership", ok: false },
      { type: "CNAME", name: "www.fjordparken.no", value: "cname.vercel-dns.com", purpose: "routing", ok: false },
    ]);
  });

  it("bruker A-post for rotdomenet", () => {
    const result = evaluateDomain("fjordparken.no", token, settings, empty, null);
    expect(result.records[1]).toMatchObject({ type: "A", name: "fjordparken.no", value: "76.76.21.21" });
  });

  it("er bekreftet når TXT-posten og pekeren er riktige", () => {
    const viaCname = evaluateDomain("www.fjordparken.no", token, settings, { txt: [token], cname: ["cname.vercel-dns.com"], a: [] }, null);
    expect(viaCname).toMatchObject({ status: "verified", error: null });
    expect(viaCname.records.every((record) => record.ok)).toBe(true);
    const viaA = evaluateDomain("fjordparken.no", token, settings, { txt: ["annen", token], cname: [], a: ["76.76.21.21"] }, null);
    expect(viaA.status).toBe("verified");
  });

  it("melder fra når eierskapet er vist, men domenet peker et annet sted", () => {
    const result = evaluateDomain("www.fjordparken.no", token, settings, { txt: [token], cname: ["annen.host.no"], a: ["1.2.3.4"] }, null);
    expect(result).toMatchObject({ status: "misconfigured", error: "dns_not_pointing" });
  });

  it("bruker Vercel sin vurdering og anbefalte verdier når kontoen er koblet til", () => {
    const vercel = {
      domain: { name: "www.fjordparken.no", apexName: "fjordparken.no", verified: true, challenges: [] },
      config: { misconfigured: false, cname: "abc123.vercel-dns-017.com", aRecords: ["216.198.79.1"] },
      failed: false,
    };
    const result = evaluateDomain("www.fjordparken.no", token, settings, { txt: [token], cname: [], a: [] }, vercel);
    expect(result.status).toBe("verified");
    expect(result.records[1]).toMatchObject({ type: "CNAME", value: "abc123.vercel-dns-017.com", ok: true });
  });

  it("venter på Vercel når domenet er i bruk på en annen Vercel-konto", () => {
    const vercel = {
      domain: {
        name: "www.fjordparken.no",
        apexName: "fjordparken.no",
        verified: false,
        challenges: [{ type: "TXT", name: "_vercel.fjordparken.no", value: "vc-domain-verify=www.fjordparken.no,abc" }],
      },
      config: { misconfigured: false, cname: null, aRecords: [] },
      failed: false,
    };
    const result = evaluateDomain("www.fjordparken.no", token, settings, { txt: [token], cname: [], a: [] }, vercel);
    expect(result).toMatchObject({ status: "pending", error: "vercel_verification" });
    expect(result.records.at(-1)).toMatchObject({ type: "TXT", name: "_vercel.fjordparken.no", purpose: "vercel" });
  });

  it("gir feil når Vercel ikke svarer", () => {
    const result = evaluateDomain("www.fjordparken.no", token, settings, empty, { domain: null, config: null, failed: true });
    expect(result).toMatchObject({ status: "error", error: "vercel_unavailable" });
  });
});

describe("lagrede domenedata", () => {
  it("tåler ukjente feil og ugyldige poster", () => {
    expect(parseDomainError("hostname_taken")).toBe("hostname_taken");
    expect(parseDomainError("noe annet")).toBeNull();
    expect(parseDomainRecords([{ type: "MX" }])).toEqual([]);
    expect(parseDomainRecords(null)).toEqual([]);
  });
});

describe("VercelDomainsClient", () => {
  it("legger til domenet i prosjektet med team-id", async () => {
    const fetchImpl = vi.fn(async (url: URL | RequestInfo, init?: RequestInit) => {
      const parsed = new URL(String(url));
      expect(parsed.pathname).toBe("/v10/projects/prj_1/domains");
      expect(parsed.searchParams.get("teamId")).toBe("team_1");
      expect(init?.method).toBe("POST");
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer hemmelig");
      expect(JSON.parse(String(init?.body))).toEqual({ name: "www.fjordparken.no" });
      return jsonResponse({ name: "www.fjordparken.no", apexName: "fjordparken.no", verified: true });
    });
    const client = new VercelDomainsClient({ token: "hemmelig", projectId: "prj_1", teamId: "team_1", fetchImpl: fetchImpl as typeof fetch });
    await expect(client.addDomain("www.fjordparken.no")).resolves.toEqual({
      name: "www.fjordparken.no",
      apexName: "fjordparken.no",
      verified: true,
      challenges: [],
    });
  });

  it("bruker domenet som finnes når det allerede er lagt til", async () => {
    const fetchImpl = vi.fn(async (_url: URL | RequestInfo, init?: RequestInit) =>
      init?.method === "POST"
        ? jsonResponse({ error: { code: "domain_already_in_use", message: "I bruk" } }, 409)
        : jsonResponse({ name: "www.fjordparken.no", verified: false, verification: [{ type: "TXT", domain: "_vercel.fjordparken.no.", value: "vc" }] }),
    );
    const client = new VercelDomainsClient({ token: "t", projectId: "prj_1", fetchImpl: fetchImpl as typeof fetch });
    const domain = await client.addDomain("www.fjordparken.no");
    expect(domain.verified).toBe(false);
    expect(domain.challenges).toEqual([{ type: "TXT", name: "_vercel.fjordparken.no", value: "vc" }]);
  });

  it("leser anbefalte DNS-verdier og feilkoder", async () => {
    const config = vi.fn(async () =>
      jsonResponse({
        misconfigured: true,
        recommendedCNAME: [{ rank: 2, value: "b.vercel-dns.com." }, { rank: 1, value: "a.vercel-dns-017.com." }],
        recommendedIPv4: [{ rank: 1, value: ["216.198.79.1"] }],
      }),
    );
    const client = new VercelDomainsClient({ token: "t", projectId: "prj_1", fetchImpl: config as typeof fetch });
    await expect(client.getConfig("www.fjordparken.no")).resolves.toEqual({
      misconfigured: true,
      cname: "a.vercel-dns-017.com",
      aRecords: ["216.198.79.1"],
    });

    const missing = vi.fn(async () => jsonResponse({ error: { code: "not_found", message: "Finnes ikke" } }, 404));
    const notFound = new VercelDomainsClient({ token: "t", projectId: "prj_1", fetchImpl: missing as typeof fetch });
    await expect(notFound.getDomain("x.no")).resolves.toBeNull();
    await expect(notFound.removeDomain("x.no")).resolves.toBeUndefined();

    const forbidden = vi.fn(async () => jsonResponse({ error: { code: "forbidden", message: "Nei" } }, 403));
    const denied = new VercelDomainsClient({ token: "t", projectId: "prj_1", fetchImpl: forbidden as typeof fetch });
    await expect(denied.getConfig("x.no")).rejects.toMatchObject({ status: 403, code: "forbidden" } satisfies Partial<VercelApiError>);
  });
});

describe("primaryRedirect", () => {
  it("sender videre til primærdomenet med sti og spørring", () => {
    expect(primaryRedirect("fjordparken", "www.fjordparken.no", "/bolig/a-101", "?filter=3")?.toString()).toBe(
      "https://www.fjordparken.no/bolig/a-101?filter=3",
    );
    expect(primaryRedirect("fjordparken.no", "www.fjordparken.no", "/", "")?.toString()).toBe("https://www.fjordparken.no/");
  });

  it("gjør ingenting på primærdomenet eller uten primærdomene", () => {
    expect(primaryRedirect("www.fjordparken.no", "www.fjordparken.no", "/", "")).toBeNull();
    expect(primaryRedirect("fjordparken", null, "/", "")).toBeNull();
  });
});
