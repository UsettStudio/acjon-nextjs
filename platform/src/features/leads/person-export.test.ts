import { describe, expect, it } from "vitest";

import { CURRENT_CONSENT_VERSION } from "@/features/leads/consent";
import { buildPersonExport, PERSON_EXPORT_FORMAT, recipientHost, type PersonLead } from "@/features/leads/person-export";

const lead: PersonLead = {
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: "2026-11-12T10:00:00.000Z",
  projectName: "Fjordparken",
  unitNumber: "A-302",
  pageTitle: "Forside",
  name: "Kari Hansen",
  email: "kari@example.com",
  phone: "+47 900 00 000",
  message: "Kan jeg se leiligheten?",
  status: "contacted",
  source: "site",
  utm: { utm_source: "nyhetsbrev" },
  consentContact: true,
  consentSimilar: false,
  consentVersion: CURRENT_CONSENT_VERSION,
  consentedAt: "2026-11-12T10:00:00.000Z",
  internalNote: "Ringt opp 13.11.",
};

describe("buildPersonExport", () => {
  const result = buildPersonExport({
    email: "kari@example.com",
    organizationName: "Demo Bolig AS",
    locale: "nb",
    generatedAt: "2026-11-14T09:00:00.000Z",
    leads: [lead, { ...lead, id: "22222222-2222-4222-8222-222222222222", consentVersion: "ukjent-versjon" }],
    deliveries: [{ createdAt: "2026-11-12T10:00:01.000Z", deliveredAt: "2026-11-12T10:00:02.000Z", status: "delivered", recipient: "crm.example.com" }],
  });

  it("har format, behandlingsansvarlig og personen", () => {
    expect(result.format).toBe(PERSON_EXPORT_FORMAT);
    expect(result.controller).toBe("Demo Bolig AS");
    expect(result.person).toEqual({ email: "kari@example.com" });
    expect(result.generated_at).toBe("2026-11-14T09:00:00.000Z");
  });

  it("tar med alt som er lagret, også internt notat og UTM", () => {
    const [first] = result.leads;
    expect(first).toMatchObject({
      project: "Fjordparken",
      unit: "A-302",
      page: "Forside",
      name: "Kari Hansen",
      phone: "+47 900 00 000",
      message: "Kan jeg se leiligheten?",
      status: "contacted",
      internal_note: "Ringt opp 13.11.",
      utm: { utm_source: "nyhetsbrev" },
    });
  });

  it("viser samtykketeksten personen godtok, med navnene fylt inn", () => {
    const consent = result.leads[0]?.consent;
    expect(consent?.contact).toBe(true);
    expect(consent?.similar_projects).toBe(false);
    expect(consent?.text_version).toBe(CURRENT_CONSENT_VERSION);
    expect(consent?.texts?.contact).toContain("Demo Bolig AS");
    expect(consent?.texts?.contact).toContain("Fjordparken");
  });

  it("gir ingen tekst for en ukjent versjon, i stedet for en annen versjon", () => {
    expect(result.leads[1]?.consent.texts).toBeNull();
    expect(result.leads[1]?.consent.text_version).toBe("ukjent-versjon");
  });

  it("viser hvilke systemer kopier er sendt til", () => {
    expect(result.webhook_deliveries).toEqual([
      { created_at: "2026-11-12T10:00:01.000Z", delivered_at: "2026-11-12T10:00:02.000Z", status: "delivered", recipient: "crm.example.com" },
    ]);
  });
});

describe("recipientHost", () => {
  it("gir vertsnavnet, og adressen selv hvis den ikke kan leses", () => {
    expect(recipientHost("https://crm.example.com/hooks/boliger?token=hemmelig")).toBe("crm.example.com");
    expect(recipientHost("ikke en adresse")).toBe("ikke en adresse");
  });
});
