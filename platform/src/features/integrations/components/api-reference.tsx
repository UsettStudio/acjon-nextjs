import { useTranslations } from "next-intl";

const ENDPOINTS = [
  { method: "GET", path: "/v1/projects", scope: "projects:read", key: "projects" },
  { method: "GET", path: "/v1/projects/{id}/units", scope: "units:read", key: "units" },
  { method: "PATCH", path: "/v1/projects/{id}/units/{enhet}", scope: "units:write", key: "updateUnit" },
  { method: "GET", path: "/v1/leads", scope: "leads:read", key: "leads" },
  { method: "GET", path: "/public/v1/selectors/{id}", scope: null, key: "publicSelector" },
  { method: "GET", path: "/public/v1/projects/{id}/units", scope: null, key: "publicUnits" },
] as const;

/** Kort oversikt over API-et. Full beskrivelse står i docs/api.md i repoet. */
export function ApiReference({ baseUrl }: { baseUrl: string }) {
  const t = useTranslations("integrations.reference");
  return (
    <div className="grid gap-4 text-sm">
      <p>
        {t("auth")} <code className="rounded bg-muted px-1 py-0.5 text-xs">Authorization: Bearer bpk_…</code>
      </p>
      <ul className="grid gap-2">
        {ENDPOINTS.map((endpoint) => (
          <li key={endpoint.path} className="grid gap-0.5">
            <code className="text-xs break-all">
              {endpoint.method} {baseUrl}
              {endpoint.path}
            </code>
            <span className="text-muted-foreground">
              {t(`endpoints.${endpoint.key}`)} {endpoint.scope ? t("scope", { scope: endpoint.scope }) : t("open")}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground">{t("webhooksSignature")}</p>
    </div>
  );
}
