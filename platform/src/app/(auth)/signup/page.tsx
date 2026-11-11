import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getInvitationPreview } from "@/features/invitations/queries";
import { safeNextPath } from "@/lib/navigation/safe-redirect";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signup");
  return { title: t("title") };
}

/**
 * Kommer brukeren fra en invitasjon (?invite=token), fylles e-postadressen ut
 * og brukeren sendes tilbake til invitasjonen etter registrering.
 */
async function SignupFormFromSearchParams({ searchParams }: { searchParams: PageProps<"/signup">["searchParams"] }) {
  const params = await searchParams;
  const t = await getTranslations("invite");
  const inviteToken = typeof params.invite === "string" ? params.invite : undefined;
  const invitation = inviteToken ? await getInvitationPreview(inviteToken) : null;
  const pendingInvitation = invitation?.status === "pending" ? invitation : null;
  const next = pendingInvitation && inviteToken
    ? `/invite/${encodeURIComponent(inviteToken)}`
    : typeof params.next === "string"
      ? safeNextPath(params.next)
      : undefined;

  return (
    <div className="grid gap-5">
      {pendingInvitation ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          {t("signupHint", { organization: pendingInvitation.organizationName })}
        </p>
      ) : null}
      <SignupForm next={next} email={pendingInvitation?.email} />
    </div>
  );
}

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const t = await getTranslations("auth.signup");
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <SignupFormFromSearchParams searchParams={searchParams} />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
