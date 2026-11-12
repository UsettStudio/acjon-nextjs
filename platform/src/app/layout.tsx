import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { Toaster } from "@/components/ui/sonner";
import { publicEnv } from "@/lib/env";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const product = publicEnv().productName;
  return {
    title: { default: product, template: `%s · ${product}` },
    description: t("description"),
    // Admin skal ikke indekseres. Publiserte prosjektsider (fase 3) setter egne regler.
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <html lang={locale} className={inter.variable}>
      <body>
        {/* Her sendes bare tekstene til feilsiden. Admin og innlogging har egne leverandører
            med all tekst, og publiserte sider får bare sine (SiteIntlProvider). Ellers ville
            all tekst i admin fulgt med hver publiserte side. */}
        <NextIntlClientProvider messages={{ errorPage: messages.errorPage, common: messages.common }}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
