"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";

import { ConsentManager, ConsentSettingsButton } from "@/features/site-builder/components/render/consent-manager";
import { SiteImage } from "@/features/site-builder/components/render/primitives";
import { RichText } from "@/features/site-builder/rich-text";
import { SITE_COOKIES_PATH, SITE_PRIVACY_PATH, pageHref, resolveLink, type NavItem, type SiteRenderData } from "@/features/site-builder/site";
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

export function SiteShell({ data, children, fontClassName }: { data: SiteRenderData; children: ReactNode; fontClassName?: string }) {
  const t = useTranslations("site.shell");
  const menuId = useId();
  const [open, setOpen] = useState(false);
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

  return (
    <div className={cn("site-root flex min-h-svh flex-col", fontClassName)} style={themeStyle(data.theme)} lang={data.organization.locale}>
      <a
        href="#innhold"
        className="sr-only z-50 rounded-md bg-[var(--site-primary)] px-4 py-2 text-[var(--site-primary-foreground)] focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t("skip")}
      </a>
      {tracking ? <ConsentManager tracking={data.tracking} cookiesHref={SITE_COOKIES_PATH} /> : null}
      <header className="sticky top-0 z-30 border-b bg-[var(--site-background)]/95 backdrop-blur" style={{ borderColor: "color-mix(in srgb, var(--site-foreground) 12%, transparent)" }}>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href={homeHref} className="flex min-w-0 items-center gap-3 font-semibold">
            {data.logo ? (
              <SiteImage asset={data.logo} sizes="10rem" alt={t("logoAlt", { name: data.organization.name })} className="h-9 w-auto max-w-40 object-contain" priority />
            ) : null}
            <span className="site-heading truncate text-lg">{data.project.name}</span>
          </a>
          {items.length > 0 ? (
            <>
              <nav aria-label={t("nav")} className="hidden md:block">
                <ul className="flex items-center gap-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        aria-current={item.link.type === "page" && item.link.page_id === data.page?.id ? "page" : undefined}
                        className="rounded-[var(--site-radius)] px-3 py-2 font-medium hover:bg-black/5 aria-[current=page]:text-[var(--site-primary)]"
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
          <nav id={menuId} aria-label={t("nav")} className="border-t md:hidden" style={{ borderColor: "color-mix(in srgb, var(--site-foreground) 12%, transparent)" }}>
            <ul className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
              {items.map((item) => (
                <li key={item.id}>
                  <a href={item.href} onClick={() => setOpen(false)} className="block rounded-[var(--site-radius)] px-3 py-3 text-lg font-medium hover:bg-black/5">
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

      <footer className="bg-[var(--site-primary)] text-[var(--site-primary-foreground)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div className="grid content-start gap-2">
            <p className="site-heading text-lg font-semibold">{data.project.name}</p>
            {data.footer.text ? <RichText source={data.footer.text} className="opacity-90" /> : null}
          </div>
          {contacts.length > 0 ? (
            <div className="grid content-start gap-3">
              <p className="font-semibold">{t("contact")}</p>
              {contacts.map((contact, index) => (
                <p key={index} className="grid opacity-90">
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
                <a key={index} href={link.url} className="underline-offset-2 opacity-90 hover:underline" target={/^https?:/i.test(link.url) ? "_blank" : undefined} rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-8 text-sm opacity-80 sm:px-6">
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
    </div>
  );
}
