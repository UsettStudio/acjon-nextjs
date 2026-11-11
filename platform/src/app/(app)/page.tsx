import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getMemberships, requireUser } from "@/lib/auth/dal";

/** Sender brukeren til sist brukte organisasjon, eller til oppretting av organisasjon. */
async function RedirectToOrganization(): Promise<null> {
  await requireUser();
  const memberships = await getMemberships();
  if (memberships.length === 0) {
    redirect("/onboarding");
  }
  const lastSlug = (await cookies()).get("last_org")?.value;
  const target = memberships.find((m) => m.organization.slug === lastSlug) ?? memberships[0];
  redirect(`/${target?.organization.slug ?? ""}`);
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <RedirectToOrganization />
    </Suspense>
  );
}
