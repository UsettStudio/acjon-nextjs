import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

/** 404 inne i en organisasjon (f.eks. en side brukeren ikke har tilgang til). Menyen beholdes. */
export default async function OrganizationNotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("body")}</p>
      <Button asChild variant="outline">
        <Link href="/">{t("home")}</Link>
      </Button>
    </div>
  );
}
