import { Suspense } from "react";

import { AppHeader, AppHeaderSkeleton } from "@/components/admin/app-header";
import { ReadOnlyBanner } from "@/components/admin/read-only-banner";
import { getOrgContext } from "@/lib/auth/dal";

async function OrganizationHeader({ params }: { params: LayoutProps<"/[org]">["params"] }) {
  const { org } = await params;
  const context = await getOrgContext(org);
  return (
    <>
      <AppHeader orgSlug={org} role={context.role} />
      {context.writable ? null : <ReadOnlyBanner />}
    </>
  );
}

export default function OrganizationLayout({ children, params }: LayoutProps<"/[org]">) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<AppHeaderSkeleton />}>
        <OrganizationHeader params={params} />
      </Suspense>
      <main id="innhold" className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
