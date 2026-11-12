import { z } from "zod";

import { normalizeDnsName } from "@/features/domains/dns";

/**
 * Vercel Domains API. Når domenet legges til i Vercel-prosjektet, ruter Vercel
 * trafikken til appen og utsteder HTTPS-sertifikatet selv så snart DNS peker
 * riktig. Brukes bare når VERCEL_API_TOKEN og VERCEL_PROJECT_ID er satt.
 */

const API = "https://api.vercel.com";

const challengeSchema = z.object({ type: z.string(), domain: z.string(), value: z.string() });

const projectDomainSchema = z.object({
  name: z.string(),
  apexName: z.string().nullish(),
  verified: z.boolean(),
  verification: z.array(challengeSchema).nullish(),
});

const configSchema = z.object({
  misconfigured: z.boolean(),
  recommendedIPv4: z.array(z.object({ rank: z.number().optional(), value: z.array(z.string()) })).nullish(),
  recommendedCNAME: z.array(z.object({ rank: z.number().optional(), value: z.string() })).nullish(),
});

const errorSchema = z.object({ error: z.object({ code: z.string().optional(), message: z.string().optional() }) });

export type VercelChallenge = { type: string; name: string; value: string };

export type VercelDomain = {
  name: string;
  apexName: string | null;
  verified: boolean;
  /** TXT-poster Vercel krever når domenet er i bruk på en annen Vercel-konto. */
  challenges: VercelChallenge[];
};

export type VercelDomainConfig = {
  /** true når DNS ikke peker til Vercel ennå. */
  misconfigured: boolean;
  cname: string | null;
  aRecords: string[];
};

export class VercelApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "VercelApiError";
  }
}

function toDomain(data: z.infer<typeof projectDomainSchema>): VercelDomain {
  return {
    name: data.name,
    apexName: data.apexName ?? null,
    verified: data.verified,
    challenges: (data.verification ?? []).map((challenge) => ({
      type: challenge.type.toUpperCase(),
      name: normalizeDnsName(challenge.domain),
      value: challenge.value,
    })),
  };
}

export type VercelClientOptions = {
  token: string;
  projectId: string;
  teamId?: string;
  fetchImpl?: typeof fetch;
};

export class VercelDomainsClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: VercelClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private url(path: string, params: Record<string, string> = {}): URL {
    const url = new URL(path, API);
    if (this.options.teamId) {
      url.searchParams.set("teamId", this.options.teamId);
    }
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url;
  }

  private async request(method: string, url: URL, body?: unknown): Promise<{ status: number; data: unknown }> {
    const response = await this.fetchImpl(url, {
      method,
      headers: {
        authorization: `Bearer ${this.options.token}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const parsed = errorSchema.safeParse(data);
      throw new VercelApiError(
        response.status,
        parsed.success ? (parsed.data.error.code ?? "unknown") : "unknown",
        parsed.success ? (parsed.data.error.message ?? `Vercel svarte ${response.status}`) : `Vercel svarte ${response.status}`,
      );
    }
    return { status: response.status, data };
  }

  private projectPath(suffix: string, version: "v9" | "v10"): string {
    return `/${version}/projects/${encodeURIComponent(this.options.projectId)}/domains${suffix}`;
  }

  /** Domenet slik det er lagt til i prosjektet, eller null hvis det ikke er lagt til. */
  async getDomain(hostname: string): Promise<VercelDomain | null> {
    try {
      const { data } = await this.request("GET", this.url(this.projectPath(`/${encodeURIComponent(hostname)}`, "v9")));
      return toDomain(projectDomainSchema.parse(data));
    } catch (error) {
      if (error instanceof VercelApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /** Legger domenet til i prosjektet. Er det lagt til fra før, brukes det som finnes. */
  async addDomain(hostname: string): Promise<VercelDomain> {
    try {
      const { data } = await this.request("POST", this.url(this.projectPath("", "v10")), { name: hostname });
      return toDomain(projectDomainSchema.parse(data));
    } catch (error) {
      if (error instanceof VercelApiError && error.status === 409) {
        const existing = await this.getDomain(hostname);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  /** Ber Vercel sjekke TXT-posten på nytt. Svarer med domenet slik det er etterpå. */
  async verifyDomain(hostname: string): Promise<VercelDomain> {
    try {
      const { data } = await this.request("POST", this.url(this.projectPath(`/${encodeURIComponent(hostname)}/verify`, "v9")));
      return toDomain(projectDomainSchema.parse(data));
    } catch (error) {
      // Ikke bekreftet ennå (for eksempel mangler TXT-posten): svar med tilstanden som den er.
      if (error instanceof VercelApiError && error.status === 400) {
        const existing = await this.getDomain(hostname);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async removeDomain(hostname: string): Promise<void> {
    try {
      await this.request("DELETE", this.url(this.projectPath(`/${encodeURIComponent(hostname)}`, "v9")));
    } catch (error) {
      if (error instanceof VercelApiError && error.status === 404) {
        return;
      }
      throw error;
    }
  }

  /** Om DNS peker til Vercel, og hvilke verdier Vercel anbefaler for dette prosjektet. */
  async getConfig(hostname: string): Promise<VercelDomainConfig> {
    const { data } = await this.request(
      "GET",
      this.url(`/v6/domains/${encodeURIComponent(hostname)}/config`, { projectIdOrName: this.options.projectId }),
    );
    const config = configSchema.parse(data);
    const byRank = <T extends { rank?: number }>(items: T[] | null | undefined) =>
      [...(items ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    const cname = byRank(config.recommendedCNAME)[0]?.value;
    return {
      misconfigured: config.misconfigured,
      cname: cname ? normalizeDnsName(cname) : null,
      aRecords: byRank(config.recommendedIPv4)[0]?.value ?? [],
    };
  }
}
