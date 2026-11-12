import { NextIntlClientProvider } from "next-intl";
import type * as React from "react";

import { publicEnv } from "@/lib/env";

/** Felles ramme for innlogging, registrering og passord. */
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <p className="mb-6 text-lg font-semibold tracking-tight text-primary">{publicEnv().productName}</p>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </div>
    </main>
  );
}
