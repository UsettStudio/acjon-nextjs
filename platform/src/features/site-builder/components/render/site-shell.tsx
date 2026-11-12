"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";

import { ConsentManager, ConsentSettingsButton } from "@/features/site-builder/components/render/consent-manager";
import { SiteImage, siteButtonClass } from "@/features/site-builder/components/render/primitives";
import { RichText } from "@/features/site-builder/rich-text";
import {
  SITE_COOKIES_PATH,
  SITE_PRIVACY_PATH,
  pageHref,
  projectAddress,
  resolveLink,
  type NavItem,
  type SiteRenderData,
} from "@/features/site-builder/site";
import { themeStyle } from "@/features/site-builder/theme";
import { hasTracking } from "@/features/site-builder/tracking";
import { cn } from "@/lib/utils";

/** Lenke fra menyen. En blokk-lenke går til blokken på forsiden når besøkeren er på en annen side. */
function navHref(data: SiteRenderData, item: NavItem): { href: string; external: boolean } | null {
  if (item.link.type === "block") {
    const home = data.pages.find((page) => page.isHome);
    const onHome = !data.page || data.page.isHome;
    const prefix = onHome || !home ? "" : (pageHref(data, home.id) ?? "/");
    return { href: `${prefix}#${item.link.block_id}`, external: false };
  }
  return resolveLink(data, item.link);
}

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Om siden er rullet forbi toppen. Menyen over heltebildet blir da fylt. */
function useScrolled(enabled: boolean): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => enabled && window.scrollY > 24,
    () => false,
  );
}

/**
 * Menyen ligger over heltebildet når siden er i designstilen Nordisk og
 * starter med en hero. Teksten er da hvit over bildet (eller i tekstfargen til
 * hovedfargen når heroen ikke har bilde).
 */
function heroOverlay(data: SiteRenderData): { overlay: boolean; onImage: boolean } {
  if (data.theme.style !== "nordic" || !data.page) {
    return { overlay: false, onImage: false };
  }
  const first = data.page.blocks.find((block) => !block.hidden || data.mode === "editor");
  if (first?.type !== "hero") {
    return { overlay: false, onImage: false };
  }
  return { overlay: true, onImage: Boolean(first.props.image_asset_id && data.assets[first.props.image_asset_id]) };
}

export function SiteShell({ data, children, fontClassName }: { data: SiteRenderData; children: ReactNode; fontClassName?: string }) {
  const t = useTranslations("site.shell");
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const nordic = data.theme.style === "nordic";
  const { overlay, onImage } = heroOverlay(data);
  const scrolled = useScrolled(overlay);
  const transparent = overlay && !scrolled && !open;
  const home = data.pages.find((page) => page.isHome);
  const homeHref = home ? (pageHref(data, home.id) ?? "/") : data.basePath || "/";
  const items = data.nav.flatMap((item) => {
    const link = navHref(data, item);
    return link ? [{ ...item, ...link }] : [];
  });
  const contacts = data.footer.show_contacts ? data.project.contacts.filter((contact) => contact.name) : [];
  // Sporing og de genererte personvernsidene finnes bare på den publiserte siden.
  const published = data.mode === "published";
  const tracking = published && hasTracking(data.tracking);
  const divider = { borderColor: "color-mix(in srgb, var(--site-foreground) 12%, transparent)" };

  const navButtonClass = (inverted: boolean) =>
    cn(siteButtonClass(inverted ? "inverted" : "primary"), "px-4 py-2 text-sm nordic:px-5 nordic:py-3 nordic:text-[0.6875rem]");

  return (
    <div
      className={cn("site-root flex min-h-svh flex-col", fontClassName)}
      style={themeStyle(data.theme)}
      data-site-style={data.theme.style}
      lang={data.organization.locale}
    >
      <a
        href="#innhold"
        className="sr-only z-50 rounded-md bg-[var(--site-primary)] px-4 py-2 text-[var(--site-primary-foreground)] focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t("skip")}
      </a>
      {tracking ? <ConsentManager tracking={data.tracking} cookiesHref={SITE_COOKIES_PATH} /> : null}
      <header
        data-overlay={overlay ? (transparent ? "transparent" : "solid") : undefined}
        className={cn(
          "top-0 z-30 w-full",
          overlay ? "fixed inset-x-0 transition-colors duration-300" : "sticky border-b bg-[var(--site-background)]/95 backdrop-blur",
          overlay && transparent && (onImage ? "text-white" : "text-[var(--site-primary-foreground)]"),
          overlay && !transparent && "bg-[var(--site-background)]/95 text-[var(--site-foreground)] shadow-sm backdrop-blur",
        )}
        style={overlay ? undefined : divider}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 nordic:h-20">
          <a href={homeHref} className="flex min-w-0 items-center gap-3 font-semibold nordic:font-normal">
            {data.logo ? (
              <SiteImage asset={data.logo} sizes="10rem" alt={t("logoAlt", { name: data.organization.name })} className="h-9 w-auto max-w-40 object-contain" priority />
            ) : null}
            <span className="site-heading truncate text-lg nordic:text-sm nordic:tracking-[0.28em] nordic:uppercase">{data.project.name}</span>
          </a>
          {items.length > 0 ? (
            <>
              <nav aria-label={t("nav")} className="hidden md:block">
                <ul className="flex items-center gap-1 nordic:gap-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        aria-current={item.link.type === "page" && item.link.page_id === data.page?.id ? "page" : undefined}
                        className={
                          item.button
                            ? cn(navButtonClass(transparent), "ml-2")
                            : cn(
                                "rounded-[var(--site-radius)] px-3 py-2 font-medium hover:bg-black/5 aria-[current=page]:text-[var(--site-primary-text)]",
                                "nordic:px-3 nordic:text-xs nordic:font-normal nordic:tracking-[0.2em] nordic:uppercase nordic:underline-offset-8 nordic:hover:bg-transparent nordic:hover:underline",
                                "nordic:aria-[current=page]:text-current nordic:aria-[current=page]:underline",
                              )
                        }
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <button
                type="button"
                className="rounded-md p-2 md:hidden"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? t("closeMenu") : t("openMenu")}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? <XIcon className="size-6" aria-hidden="true" /> : <MenuIcon className="size-6" aria-hidden="true" />}
              </button>
            </>
          ) : null}
        </div>
        {items.length > 0 && open ? (
          <nav id={menuId} aria-label={t("nav")} className="border-t md:hidden" style={divider}>
            <ul className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      item.button
                        ? cn(navButtonClass(false), "mt-2 w-full py-3")
                        : "block rounded-[var(--site-radius)] px-3 py-3 text-lg font-medium hover:bg-black/5 nordic:text-sm nordic:font-normal nordic:tracking-[0.2em] nordic:uppercase"
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="innhold" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      {nordic ? (
        <NordicFooter data={data} items={items} contacts={contacts} published={published} tracking={tracking} />
      ) : (
        <footer className="bg-[var(--site-primary)] text-[var(--site-primary-foreground)]">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
            <div className="grid content-start gap-2">
              <p className="site-heading text-lg font-semibold">{data.project.name}</p>
              {data.footer.text ? <RichText source={data.footer.text} /> : null}
            </div>
            {contacts.length > 0 ? (
              <div className="grid content-start gap-3">
                <p className="font-semibold">{t("contact")}</p>
                {contacts.map((contact, index) => (
                  <p key={index} className="grid">
                    <span>{contact.name}</span>
                    {contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="underline-offset-2 hover:underline">{contact.phone}</a> : null}
                    {contact.email ? <a href={`mailto:${contact.email}`} className="break-all underline-offset-2 hover:underline">{contact.email}</a> : null}
                  </p>
                ))}
              </div>
            ) : null}
            {data.footer.links.length > 0 ? (
              <nav aria-label={t("footerLinks")} className="grid content-start gap-2">
                {data.footer.links.map((link, index) => (
                  <a key={index} href={link.url} className="underline-offset-2 hover:underline" target={/^https?:/i.test(link.url) ? "_blank" : undefined} rel="noopener noreferrer">
                    {link.label}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
          {/* Full kontrast: gjennomsiktig tekst på hovedfargen kan komme under 4,5:1 med lysere farger. */}
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-8 text-sm sm:px-6">
            <span>{data.organization.name}</span>
            {published ? (
              <>
                <a href={SITE_PRIVACY_PATH} className="underline-offset-2 hover:underline">
                  {t("privacy")}
                </a>
                <a href={SITE_COOKIES_PATH} className="underline-offset-2 hover:underline">
                  {t("cookies")}
                </a>
              </>
            ) : null}
            {tracking ? <ConsentSettingsButton className="underline-offset-2 hover:underline" /> : null}
          </div>
        </footer>
      )}
    </div>
  );
}

type FooterContact = SiteRenderData["project"]["contacts"][number];

/**
 * Bunnteksten i Nordisk: prosjektnavn og adresse i midten, kontaktpersonene,
 * og menyen og personvernlenkene nederst. All tekst har full kontrast mot hovedfargen.
 */
function NordicFooter({
  data,
  items,
  contacts,
  published,
  tracking,
}: {
  data: SiteRenderData;
  items: (NavItem & { href: string; external: boolean })[];
  contacts: FooterContact[];
  published: boolean;
  tracking: boolean;
}) {
  const t = useTranslations("site.shell");
  const address = projectAddress(data.project);
  const small = "text-[0.6875rem] tracking-[0.2em] uppercase underline-offset-4 hover:underline";
  return (
    <footer className="bg-[var(--site-primary)] text-[var(--site-primary-foreground)]">
      <div className="mx-auto grid w-full max-w-6xl justify-items-center gap-6 px-4 pt-20 pb-14 text-center sm:px-6">
        <p className="site-heading text-2xl font-light tracking-[0.28em] uppercase">{data.project.name}</p>
        {address ? <p className="text-xs tracking-[0.22em] uppercase">{address}</p> : null}
        {data.footer.text ? <RichText source={data.footer.text} className="max-w-2xl" /> : null}
        {contacts.length > 0 ? (
          <div className="mt-6 grid gap-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-14">
            {contacts.map((contact, index) => (
              <div key={index} className="grid gap-1">
                {contact.title ? <p className="text-[0.6875rem] tracking-[0.2em] uppercase">{contact.title}</p> : null}
                <p className="text-lg font-light">{contact.name}</p>
                {contact.phone ? (
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
                    {contact.phone}
                  </a>
                ) : null}
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="break-all underline-offset-4 hover:underline">
                    {contact.email}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-current/30 py-8">
          {items.length > 0 || data.footer.links.length > 0 ? (
            <nav aria-label={t("footerLinks")}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.6875rem]">
                {items.map((item) => (
                  <li key={item.id}>
                    <a href={item.href} className={small} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}>
                      {item.label}
                    </a>
                  </li>
                ))}
                {data.footer.links.map((link, index) => (
                  <li key={`link-${index}`}>
                    <a href={link.url} className={small} target={/^https?:/i.test(link.url) ? "_blank" : undefined} rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.6875rem]">
            <span className="tracking-[0.2em] uppercase">{data.organization.name}</span>
            {published ? (
              <>
                <a href={SITE_PRIVACY_PATH} className={small}>
                  {t("privacy")}
                </a>
                <a href={SITE_COOKIES_PATH} className={small}>
                  {t("cookies")}
                </a>
              </>
            ) : null}
            {tracking ? <ConsentSettingsButton className={small} /> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
