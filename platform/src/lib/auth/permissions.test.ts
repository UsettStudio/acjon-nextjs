import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assignableRoles,
  can,
  canManageMember,
  isProjectScopedRole,
  MEMBER_ROLES,
  ROLE_GROUPS,
  type Capability,
  type MemberRole,
} from "@/lib/auth/permissions";

/** Leser rollegruppene app.roles_*() fra migrasjonen, så TypeScript og SQL ikke kan gli fra hverandre. */
function sqlRoleGroup(name: string): string[] {
  const sql = readFileSync(path.resolve(__dirname, "../../../supabase/migrations/20261111120200_tilgang.sql"), "utf8");
  const match = new RegExp(`create function app\\.roles_${name}\\(\\)[\\s\\S]*?array\\[([^\\]]+)\\]`).exec(sql);
  if (!match?.[1]) {
    throw new Error(`Fant ikke app.roles_${name}() i migrasjonen`);
  }
  return match[1].split(",").map((role) => role.trim().replaceAll("'", ""));
}

describe("rollegrupper", () => {
  it.each(["admin", "content", "sales", "leads"] as const)("%s er lik app.roles_%s() i databasen", (group) => {
    expect([...ROLE_GROUPS[group]].sort()).toEqual(sqlRoleGroup(group).sort());
  });
});

describe("can", () => {
  const matrix: Record<Capability, MemberRole[]> = {
    "organization.update": ["owner", "admin"],
    "organization.billing": ["owner"],
    "members.manage": ["owner", "admin"],
    "domains.manage": ["owner", "admin"],
    "integrations.manage": ["owner", "admin"],
    "audit.read": ["owner", "admin"],
    "projects.create": ["owner", "admin"],
    "projects.delete": ["owner", "admin"],
    "projects.viewAll": ["owner", "admin"],
    "content.edit": ["owner", "admin", "editor"],
    "units.sales": ["owner", "admin", "editor", "agent"],
    "leads.read": ["owner", "admin", "agent"],
    "leads.delete": ["owner", "admin"],
  };

  it.each(Object.entries(matrix))("%s gis til riktige roller", (capability, allowed) => {
    for (const role of MEMBER_ROLES) {
      expect(can(role, capability as Capability)).toBe(allowed.includes(role));
    }
  });

  it("gir ingen rettigheter uten rolle", () => {
    expect(can(null, "content.edit")).toBe(false);
    expect(can(undefined, "units.sales")).toBe(false);
  });
});

describe("medlemsadministrasjon", () => {
  it("eier kan gi alle roller, administrator alle unntatt eier", () => {
    expect(assignableRoles("owner")).toEqual(["owner", "admin", "editor", "agent"]);
    expect(assignableRoles("admin")).toEqual(["admin", "editor", "agent"]);
    expect(assignableRoles("editor")).toEqual([]);
    expect(assignableRoles("agent")).toEqual([]);
  });

  it("administrator kan ikke endre eiere", () => {
    expect(canManageMember("admin", "owner")).toBe(false);
    expect(canManageMember("admin", "editor")).toBe(true);
    expect(canManageMember("owner", "owner")).toBe(true);
    expect(canManageMember("editor", "agent")).toBe(false);
  });

  it("redaktør og megler er avgrenset til tildelte prosjekter", () => {
    expect(MEMBER_ROLES.filter(isProjectScopedRole)).toEqual(["editor", "agent"]);
  });
});
