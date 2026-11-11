import type * as React from "react";
import { Suspense } from "react";

import { AppHeader, AppHeaderSkeleton } from "@/components/admin/app-header";

/** Sider som ikke hører til én organisasjon: ny organisasjon, profil og plattformadmin. */
export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<AppHeaderSkeleton />}>
        <AppHeader />
      </Suspense>
      <main id="innhold" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
