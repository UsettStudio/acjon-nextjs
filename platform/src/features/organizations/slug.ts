/**
 * Adresser (slug) for organisasjoner. Samme regler som i databasen:
 * små bokstaver, tall og bindestrek, høyst 63 tegn, og ikke et reservert ord.
 */

/** Speiler app.is_reserved_org_slug() i migrasjon 0008. */
export const RESERVED_ORG_SLUGS: ReadonlySet<string> = new Set([
  "login",
  "signup",
  "logout",
  "forgot-password",
  "reset-password",
  "auth",
  "invite",
  "onboarding",
  "account",
  "platform",
  "api",
  "embed",
  "sites",
  "settings",
  "admin",
  "app",
  "www",
  "help",
  "support",
  "static",
  "assets",
  "media",
  "public",
  "new",
]);

export const ORG_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const ORG_SLUG_MAX_LENGTH = 63;

export function isValidOrgSlug(value: string): boolean {
  return value.length <= ORG_SLUG_MAX_LENGTH && ORG_SLUG_PATTERN.test(value) && !RESERVED_ORG_SLUGS.has(value);
}

/** «Fjordbygg Øst AS» → «fjordbygg-ost-as». Speiler app.slugify() i databasen. */
export function slugify(value: string, maxLength = ORG_SLUG_MAX_LENGTH): string {
  const transliterated = value
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ß", "ss")
    .replace(/[øåäöüéèêëáàâíìîóòôúùûýñç]/g, (char) => {
      const map: Record<string, string> = {
        ø: "o", å: "a", ä: "a", ö: "o", ü: "u", é: "e", è: "e", ê: "e", ë: "e", á: "a", à: "a",
        â: "a", í: "i", ì: "i", î: "i", ó: "o", ò: "o", ô: "o", ú: "u", ù: "u", û: "u", ý: "y",
        ñ: "n", ç: "c",
      };
      return map[char] ?? char;
    });
  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}
