import { siteConfig } from "./siteConfig";

/**
 * Sosiale medier, avledet fra siteConfig.socials.
 * Lenkene redigeres i siteConfig – ikke her.
 */

export type SocialKey = keyof typeof siteConfig.socials;

export type SocialLink = {
    key: SocialKey;
    label: string;
    url: string;
};

const labels: Record<SocialKey, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    x: "X (Twitter)",
};

// Rekkefølgen her er rekkefølgen ikonene vises i.
const order: SocialKey[] = ["facebook", "instagram", "linkedin", "x"];

/** Bare kontoene som faktisk har en lenke. */
export const socialLinks: SocialLink[] = order
    .map((key) => ({ key, label: labels[key], url: siteConfig.socials[key].trim() }))
    .filter((s) => s.url.startsWith("http"));

/** Alle profillenker til sameAs i strukturert data, uten duplikater. */
export const profileUrls: string[] = Array.from(
    new Set([...socialLinks.map((s) => s.url), ...siteConfig.sameAs])
);
