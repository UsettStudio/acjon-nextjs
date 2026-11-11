/**
 * Roller og rettigheter. Speiler reglene i databasen (supabase/migrations,
 * app.roles_* og RLS-policyene). Databasen er den endelige sperren; dette
 * brukes for å vise riktig grensesnitt og gi gode feilmeldinger før et kall.
 */

export const MEMBER_ROLES = ["owner", "admin", "editor", "agent"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && (MEMBER_ROLES as readonly string[]).includes(value);
}

/** Samme grupper som app.roles_admin(), app.roles_content(), app.roles_sales() og app.roles_leads(). */
export const ROLE_GROUPS = {
  admin: ["owner", "admin"],
  content: ["owner", "admin", "editor"],
  sales: ["owner", "admin", "editor", "agent"],
  leads: ["owner", "admin", "agent"],
} as const satisfies Record<string, readonly MemberRole[]>;

export type Capability =
  | "organization.update"
  | "organization.billing"
  | "members.manage"
  | "domains.manage"
  | "integrations.manage"
  | "audit.read"
  | "projects.create"
  | "projects.delete"
  | "projects.viewAll"
  | "content.edit"
  | "units.sales"
  | "leads.read"
  | "leads.delete";

const CAPABILITIES: Record<Capability, readonly MemberRole[]> = {
  "organization.update": ROLE_GROUPS.admin,
  "organization.billing": ["owner"],
  "members.manage": ROLE_GROUPS.admin,
  "domains.manage": ROLE_GROUPS.admin,
  "integrations.manage": ROLE_GROUPS.admin,
  "audit.read": ROLE_GROUPS.admin,
  "projects.create": ROLE_GROUPS.admin,
  "projects.delete": ROLE_GROUPS.admin,
  "projects.viewAll": ROLE_GROUPS.admin,
  // Redaktør og megler har disse rettighetene bare i prosjekter de er tildelt.
  "content.edit": ROLE_GROUPS.content,
  "units.sales": ROLE_GROUPS.sales,
  "leads.read": ROLE_GROUPS.leads,
  "leads.delete": ROLE_GROUPS.admin,
};

export function can(role: MemberRole | null | undefined, capability: Capability): boolean {
  return role != null && CAPABILITIES[capability].includes(role);
}

/** Redaktør og megler ser bare prosjektene de er tildelt i project_members. */
export function isProjectScopedRole(role: MemberRole): boolean {
  return role === "editor" || role === "agent";
}

/** Roller en bruker kan gi andre. Eier kan gi alle; administrator alle unntatt eier. */
export function assignableRoles(actor: MemberRole): MemberRole[] {
  if (actor === "owner") {
    return [...MEMBER_ROLES];
  }
  if (actor === "admin") {
    return ["admin", "editor", "agent"];
  }
  return [];
}

/** Om en bruker kan endre rolle på eller fjerne et annet medlem. */
export function canManageMember(actor: MemberRole, target: MemberRole): boolean {
  if (actor === "owner") {
    return true;
  }
  if (actor === "admin") {
    return target !== "owner";
  }
  return false;
}
