"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resendInvitation, revokeInvitation } from "@/features/members/actions";
import { InvitationLink } from "@/features/members/components/invitation-link";
import type { InvitationRow } from "@/features/members/queries";
import type { CommonActionError } from "@/lib/actions/result";

export function PendingInvitations({
  organizationId,
  invitations,
  readOnly,
}: {
  organizationId: string;
  invitations: InvitationRow[];
  readOnly: boolean;
}) {
  const t = useTranslations("members");
  const tInvite = useTranslations("members.invite");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [resent, setResent] = useState<{ email: string; link: string; delivered: boolean } | null>(null);

  if (invitations.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noInvitations")}</p>;
  }

  function onResend(invitation: InvitationRow) {
    startTransition(async () => {
      const result = await resendInvitation(organizationId, invitation.id);
      if (result.ok) {
        setResent(result.data);
        if (result.data.delivered) {
          toast.success(t("resent", { email: result.data.email }));
        }
      } else {
        toast.error(tErrors(result.error as CommonActionError));
      }
    });
  }

  function onRevoke(invitation: InvitationRow) {
    startTransition(async () => {
      const result = await revokeInvitation(organizationId, invitation.id);
      if (result.ok) {
        toast.success(t("revoked"));
      } else {
        toast.error(tErrors(result.error as CommonActionError));
      }
    });
  }

  return (
    <>
      <ul className="divide-y rounded-lg border">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="grid gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{invitation.email}</span>
                <Badge variant="secondary">{tRoles(invitation.role)}</Badge>
                {invitation.expired ? <Badge variant="outline">{tInvite("expiredBadge")}</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {invitation.inviterName ? `${t("invitedBy", { name: invitation.inviterName })} · ` : ""}
                {t("expires", { date: format.dateTime(new Date(invitation.expiresAt), { dateStyle: "medium" }) })}
              </p>
            </div>
            {readOnly ? null : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={pending} onClick={() => onResend(invitation)}>
                  {t("resend")}
                </Button>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => onRevoke(invitation)}>
                  {t("revoke")}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={resent !== null} onOpenChange={(open) => !open && setResent(null)}>
        <DialogContent closeLabel={tCommon("close")}>
          <DialogHeader>
            <DialogTitle>{tInvite("sentTitle")}</DialogTitle>
            <DialogDescription>
              {resent?.delivered ? tInvite("sent", { email: resent.email }) : tInvite("emailFailed")}
            </DialogDescription>
          </DialogHeader>
          {resent ? <InvitationLink link={resent.link} /> : null}
          <DialogFooter>
            <Button onClick={() => setResent(null)}>{tInvite("done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
