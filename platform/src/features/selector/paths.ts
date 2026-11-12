/** Adresser til den publiserte boligvelgeren. Kan brukes både på serveren og i nettleseren. */

export function selectorPublicPath(selectorId: string): string {
  return `/embed/selector/${selectorId}`;
}

export function selectorPreviewPath(selectorId: string): string {
  return `${selectorPublicPath(selectorId)}/preview`;
}

export function selectorUnitPath(selectorId: string, unitSlug: string): string {
  return `${selectorPublicPath(selectorId)}/bolig/${encodeURIComponent(unitSlug)}`;
}
