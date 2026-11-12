"use client";

import { CalendarPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { extendTrial } from "@/features/platform/actions";
import { formatDate } from "@/lib/format";

/** Forlenger prøveperioden med 14 dager. Vises for organisasjoner uten abonnement i Stripe. */
export function ExtendTrialButton({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {
  const t = useTranslations("platform");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      aria-label={t("extendTrialFor", { organization: organizationName })}
      onClick={() =>
        startTransition(async () => {
          const result = await extendTrial({ organizationId, days: 14 });
          if (result.ok) {
            toast.success(t("trialExtended", { organization: organizationName, date: formatDate(result.data.trialEndsAt) }));
          } else {
            toast.error(tErrors(result.error));
          }
        })
      }
    >
      <CalendarPlusIcon aria-hidden="true" />
      {t("extendTrial")}
    </Button>
  );
}
