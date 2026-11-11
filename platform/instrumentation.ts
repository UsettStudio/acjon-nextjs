import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  Sentry.init({
    dsn: dsn || undefined,
    enabled: Boolean(dsn),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Ingen personopplysninger, cookies, hoder, forespørselsinnhold eller spørreparametre sendes til Sentry.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
