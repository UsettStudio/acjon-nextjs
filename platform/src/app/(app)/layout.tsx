import { NextIntlClientProvider } from "next-intl";

/** Admin: all tekst er tilgjengelig for klientkomponentene. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
