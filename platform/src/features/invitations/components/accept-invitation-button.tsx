"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/features/invitations/actions";
import type { CommonActionError } from "@/lib/actions/result";

export function AcceptInvitationButton({ token }: { token: string }) {
  const t = useTranslations("invite");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitation(token);
      if (result && !result.ok) {
        setError(
          result.error === "invalidInvitation"
            ? t("invalid")
            : result.error === "wrongAccount"
              ? t("emailNotConfirmed")
              : result.error === "organizationFull"
                ? t("organizationFull")
                : tErrors(result.error as CommonActionError),
        );
      }
    });
  }

  return (
    <div className="grid gap-3">
      <FormAlert message={error} />
      <Button onClick={onAccept} disabled={pending} aria-busy={pending}>
        {t("accept")}
      </Button>
    </div>
  );
}
