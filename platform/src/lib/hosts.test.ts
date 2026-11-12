import { describe, expect, it } from "vitest";

import { classifyHost } from "@/lib/hosts";

describe("vertsnavn", () => {
  const production = (host: string) => classifyHost(host, "https://app.boligplattform.no", "boligplattform.no");
  const local = (host: string) => classifyHost(host, "http://localhost:3000", "localhost:3000");

  it("kjenner igjen admin", () => {
    expect(production("app.boligplattform.no")).toEqual({ kind: "app" });
    expect(production("boligplattform.no")).toEqual({ kind: "app" });
    expect(production("www.boligplattform.no")).toEqual({ kind: "app" });
    expect(production("plattform-git-main.vercel.app")).toEqual({ kind: "app" });
    expect(local("localhost:3000")).toEqual({ kind: "app" });
    expect(local("127.0.0.1:3000")).toEqual({ kind: "app" });
  });

  it("finner prosjektsider på underdomene", () => {
    expect(production("fjordparken.boligplattform.no")).toEqual({ kind: "site", key: "fjordparken" });
    expect(production("FJORDPARKEN.boligplattform.no")).toEqual({ kind: "site", key: "fjordparken" });
    expect(local("fjordparken.localhost:3000")).toEqual({ kind: "site", key: "fjordparken" });
  });

  it("reserverte og nestede underdomener går til admin", () => {
    expect(production("api.boligplattform.no")).toEqual({ kind: "app" });
    expect(production("a.b.boligplattform.no")).toEqual({ kind: "app" });
  });

  it("andre vertsnavn er egne domener", () => {
    expect(production("www.fjordparken.no")).toEqual({ kind: "site", key: "www.fjordparken.no" });
    expect(production("fjordparken.no:443")).toEqual({ kind: "site", key: "fjordparken.no" });
  });
});
