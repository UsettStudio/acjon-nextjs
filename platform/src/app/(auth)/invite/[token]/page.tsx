import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/features/auth/actions";
import { AcceptInvitationButton } from "@/features/invitations/components/accept-invitation-button";
import { getInvitationPreview } from "@/features/invitations/queries";
import { getCurrentUser } from "@/lib/auth/dal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invite");
  return { title: t("title") };
}

async function InvitationView({ params }: { params: PageProps<"/invite/[token]">["params"] }) {
  const { token } = await params;
  const t = await getTranslations("invite");
  const tRoles = await getTranslations("roles");
  const [invitation, user] = await Promise.all([getInvitationPreview(token), getCurrentUser()]);

  if (!invitation) {
    return (
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{t("invalidTitle")}</h1>
        <p className="text-muted-foreground">{t("invalid")}</p>
      </div>
    );
  }

  const heading = <h1 className="text-2xl font-semibold">{t("heading", { organization: invitation.organizationName })}</h1>;

  if (invitation.status !== "pending") {
    const message =
      invitation.status === "expired" ? t("expired") : invitation.status === "revoked" ? t("revoked") : t("accepted");
    return (
      <div className="grid gap-4">
        {heading}
        <p className="text-muted-foreground">{message}</p>
        {invitation.status === "accepted" && user ? (
          <Button asChild variant="outline">
            <Link href={`/${invitation.organizationSlug}`}>
              {t("goToOrganization", { organization: invitation.organizationName })}
            </Link>
          </Button>
        ) : null}
      </div>
    );
  }

  const body = (
    <p className="text-muted-foreground">
      {t("body", { role: tRoles(invitation.role).toLowerCase(), email: invitation.email })}
    </p>
  );
  const invitePath = `/invite/${encodeURIComponent(token)}`;

  if (!user) {
    return (
      <div className="grid gap-4">
        {heading}
        {body}
        <p className="text-sm text-muted-foreground">{t("chooseHint", { email: invitation.email })}</p>
        <div className="grid gap-2">
          <Button asChild>
            <Link href={`/signup?invite=${encodeURIComponent(token)}`}>{t("signupCta")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/login?next=${encodeURIComponent(invitePath)}`}>{t("loginCta")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== invitation.email) {
    return (
      <div className="grid gap-4">
        {heading}
        <p className="text-muted-foreground">
          {t("wrongAccount", { current: user.email ?? "", email: invitation.email })}
        </p>
        <form action={signOut}>
          <input type="hidden" name="next" value={invitePath} />
          <Button type="submit" variant="outline" className="w-full">
            {(await getTranslations("auth"))("signOut")}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {heading}
      {body}
      <AcceptInvitationButton token={token} />
    </div>
  );
}

export default function InvitationPage({ params }: PageProps<"/invite/[token]">) {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <InvitationView params={params} />
    </Suspense>
  );
}
