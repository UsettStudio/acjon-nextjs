"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Viser invitasjonslenken med kopieringsknapp, slik at den kan deles direkte. */
export function InvitationLink({ link }: { link: string }) {
  const t = useTranslations("common");
  const tInvite = useTranslations("members.invite");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <Input readOnly value={link} aria-label={tInvite("linkLabel")} onFocus={(event) => event.target.select()} />
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
        <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
      </Button>
    </div>
  );
}
